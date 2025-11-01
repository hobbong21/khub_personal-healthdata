import { Request, Response } from 'express';
import { GoogleFitService } from '../services/googleFitService';
import { WearableDeviceConfig, WearableDataType, DeviceAuthRequest } from '../types/wearable';

/**
 * Google Fit API 컨트롤러
 * 요구사항 17.3: 안드로이드 기기 데이터 동기화
 */
export class GoogleFitController {
  private googleFitService: GoogleFitService;

  constructor() {
    this.googleFitService = new GoogleFitService();
  }

  /**
   * Google Fit 인증 URL 생성
   */
  async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const authUrl = this.googleFitService.generateAuthUrl();
      
      res.json({
        success: true,
        authUrl,
        message: 'Google Fit 인증을 위해 제공된 URL로 이동하세요.',
      });
    } catch (error) {
      console.error('Error generating Google Fit auth URL:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 인증 URL 생성에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Google Fit 인증 콜백 처리
   */
  async handleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const { code, state } = req.query;
      const userId = req.user?.id; // 인증된 사용자 ID

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          message: '인증 코드가 제공되지 않았습니다.',
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      // 인증 코드로 토큰 교환
      const tokens = await this.googleFitService.exchangeCodeForTokens(code);

      // 데이터베이스에 기기 설정 저장 (실제 구현에서는 DB 서비스 사용)
      const deviceConfig: Partial<WearableDeviceConfig> = {
        userId,
        deviceType: 'google_fit',
        deviceName: 'Google Fit',
        isActive: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        syncSettings: {
          autoSync: true,
          syncInterval: 60, // 1시간
          dataTypes: ['heart_rate', 'steps', 'calories', 'sleep', 'weight'] as WearableDataType[],
        },
        lastSyncAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TODO: 실제 데이터베이스에 저장
      console.log('Google Fit device config to save:', deviceConfig);

      res.json({
        success: true,
        message: 'Google Fit 연동이 성공적으로 완료되었습니다.',
        deviceConfig: {
          deviceType: 'google_fit',
          deviceName: 'Google Fit',
          isActive: true,
        },
      });
    } catch (error) {
      console.error('Error handling Google Fit auth callback:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 인증 처리에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Google Fit 데이터 동기화
   */
  async syncData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { dataTypes, startDate, endDate, forceSync } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      // TODO: 데이터베이스에서 사용자의 Google Fit 설정 조회
      const deviceConfig = await this.getUserGoogleFitConfig(userId);
      
      if (!deviceConfig || !deviceConfig.accessToken) {
        res.status(404).json({
          success: false,
          message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
        });
        return;
      }

      // 토큰 설정
      this.googleFitService.setCredentials(
        deviceConfig.accessToken,
        deviceConfig.refreshToken || ''
      );

      // 동기화 날짜 범위 설정
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 기본 7일
      const end = endDate ? new Date(endDate) : new Date();

      // 동기화할 데이터 타입 설정
      const typesToSync = dataTypes || deviceConfig.syncSettings?.dataTypes || ['steps', 'heart_rate'];

      // 데이터 동기화 실행
      const syncResult = await this.googleFitService.syncMultipleDataTypes(
        typesToSync,
        start,
        end
      );

      // 동기화 결과 업데이트
      syncResult.deviceConfigId = deviceConfig.id;

      // TODO: 동기화된 데이터를 데이터베이스에 저장
      console.log('Sync result:', syncResult);

      res.json({
        success: syncResult.success,
        message: syncResult.success 
          ? `${syncResult.syncedDataCount}개의 데이터 포인트가 동기화되었습니다.`
          : '일부 데이터 동기화에 실패했습니다.',
        syncResult,
      });
    } catch (error) {
      console.error('Error syncing Google Fit data:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 데이터 동기화에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 특정 데이터 타입 조회
   */
  async getDataByType(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { dataType } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      if (!dataType || !this.isValidDataType(dataType)) {
        res.status(400).json({
          success: false,
          message: '유효하지 않은 데이터 타입입니다.',
        });
        return;
      }

      const deviceConfig = await this.getUserGoogleFitConfig(userId);
      
      if (!deviceConfig || !deviceConfig.accessToken) {
        res.status(404).json({
          success: false,
          message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
        });
        return;
      }

      this.googleFitService.setCredentials(
        deviceConfig.accessToken,
        deviceConfig.refreshToken || ''
      );

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const data = await this.googleFitService.getDataByType(
        dataType as WearableDataType,
        start,
        end
      );

      res.json({
        success: true,
        dataType,
        dataCount: data.length,
        data,
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching Google Fit data by type:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 데이터 조회에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Google Fit 연결 상태 확인
   */
  async getConnectionStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      const deviceConfig = await this.getUserGoogleFitConfig(userId);
      
      if (!deviceConfig || !deviceConfig.accessToken) {
        res.json({
          success: true,
          isConnected: false,
          message: 'Google Fit이 연동되지 않았습니다.',
        });
        return;
      }

      this.googleFitService.setCredentials(
        deviceConfig.accessToken,
        deviceConfig.refreshToken || ''
      );

      const syncStatus = await this.googleFitService.getSyncStatus();

      res.json({
        success: true,
        isConnected: syncStatus.isConnected,
        deviceConfig: {
          deviceName: deviceConfig.deviceName,
          lastSyncAt: deviceConfig.lastSyncAt,
          syncSettings: deviceConfig.syncSettings,
        },
        syncStatus,
      });
    } catch (error) {
      console.error('Error checking Google Fit connection status:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 연결 상태 확인에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Google Fit 연동 해제
   */
  async disconnectDevice(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      // TODO: 데이터베이스에서 Google Fit 설정 비활성화
      const result = await this.deactivateGoogleFitConfig(userId);

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Google Fit 연동이 성공적으로 해제되었습니다.',
      });
    } catch (error) {
      console.error('Error disconnecting Google Fit:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 연동 해제에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 사용자의 Google Fit 설정 조회 (임시 구현)
   */
  private async getUserGoogleFitConfig(userId: string): Promise<WearableDeviceConfig | null> {
    // TODO: 실제 데이터베이스 조회 구현
    // 임시로 null 반환
    console.log(`Getting Google Fit config for user: ${userId}`);
    return null;
  }

  /**
   * Google Fit 설정 비활성화 (임시 구현)
   */
  private async deactivateGoogleFitConfig(userId: string): Promise<boolean> {
    // TODO: 실제 데이터베이스 업데이트 구현
    console.log(`Deactivating Google Fit config for user: ${userId}`);
    return true;
  }

  /**
   * 유효한 데이터 타입인지 확인
   */
  private isValidDataType(dataType: string): dataType is WearableDataType {
    const validTypes: WearableDataType[] = [
      'heart_rate', 'steps', 'calories', 'sleep', 'weight',
      'blood_pressure', 'blood_oxygen', 'body_temperature',
      'exercise_sessions', 'distance', 'floors_climbed'
    ];
    return validTypes.includes(dataType as WearableDataType);
  }

  /**
   * 자동 동기화 설정 업데이트
   */
  async updateSyncSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { autoSync, syncInterval, dataTypes } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      // TODO: 데이터베이스에서 동기화 설정 업데이트
      const updatedConfig = {
        autoSync: autoSync ?? true,
        syncInterval: syncInterval ?? 60,
        dataTypes: dataTypes ?? ['steps', 'heart_rate', 'calories'],
      };

      console.log(`Updating sync settings for user ${userId}:`, updatedConfig);

      res.json({
        success: true,
        message: '동기화 설정이 업데이트되었습니다.',
        syncSettings: updatedConfig,
      });
    } catch (error) {
      console.error('Error updating Google Fit sync settings:', error);
      res.status(500).json({
        success: false,
        message: '동기화 설정 업데이트에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 사용자 프로필 정보 조회
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      const deviceConfig = await this.getUserGoogleFitConfig(userId);
      
      if (!deviceConfig || !deviceConfig.accessToken) {
        res.status(404).json({
          success: false,
          message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
        });
        return;
      }

      this.googleFitService.setCredentials(
        deviceConfig.accessToken,
        deviceConfig.refreshToken || ''
      );

      const profile = await this.googleFitService.getUserProfile();

      res.json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error('Error fetching Google Fit user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 사용자 프로필 조회에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}