import { Request, Response } from 'express';
import { WearableService } from '../services/wearableService';
import { 
  DeviceAuthRequest, 
  WearableSyncRequest,
  WearableDataType 
} from '../types/wearable';

export class WearableController {
  /**
   * 웨어러블 기기 인증 및 등록
   */
  static async authenticateDevice(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const authRequest: DeviceAuthRequest = req.body;

      // 요청 데이터 검증
      if (!authRequest.deviceType || !authRequest.deviceName) {
        res.status(400).json({
          success: false,
          message: '기기 타입과 이름은 필수입니다.',
        });
        return;
      }

      if (!authRequest.syncSettings) {
        res.status(400).json({
          success: false,
          message: '동기화 설정이 필요합니다.',
        });
        return;
      }

      const result = await WearableService.authenticateDevice(userId, authRequest);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Device authentication error:', error);
      res.status(500).json({
        success: false,
        message: '기기 인증 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 웨어러블 데이터 동기화
   */
  static async syncWearableData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const syncRequest: WearableSyncRequest = req.body;

      if (!syncRequest.deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      const result = await WearableService.syncWearableData(userId, syncRequest);
      res.json(result);
    } catch (error) {
      console.error('Wearable sync error:', error);
      res.status(500).json({
        success: false,
        message: '데이터 동기화 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 사용자의 웨어러블 기기 목록 조회
   */
  static async getUserDevices(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const devices = await WearableService.getUserDevices(userId);
      res.json({
        success: true,
        data: devices,
      });
    } catch (error) {
      console.error('Get user devices error:', error);
      res.status(500).json({
        success: false,
        message: '기기 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 웨어러블 기기 설정 업데이트
   */
  static async updateDeviceConfig(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;
      const updates = req.body;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      const updatedDevice = await WearableService.updateDeviceConfig(userId, deviceConfigId, updates);
      res.json({
        success: true,
        data: updatedDevice,
      });
    } catch (error) {
      console.error('Update device config error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '기기 설정 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 웨어러블 기기 연동 해제
   */
  static async disconnectDevice(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      await WearableService.disconnectDevice(userId, deviceConfigId);
      res.json({
        success: true,
        message: '기기 연동이 해제되었습니다.',
      });
    } catch (error) {
      console.error('Disconnect device error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '기기 연동 해제 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 동기화 상태 조회
   */
  static async getSyncStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const syncStatus = await WearableService.getSyncStatus(userId);
      res.json({
        success: true,
        data: syncStatus,
      });
    } catch (error) {
      console.error('Get sync status error:', error);
      res.status(500).json({
        success: false,
        message: '동기화 상태 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 특정 기기의 데이터 조회
   */
  static async getDeviceData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;
      const { 
        dataType, 
        startDate, 
        endDate, 
        limit = 100 
      } = req.query;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      // 실제 구현에서는 WearableService에 getDeviceData 메서드 추가
      res.json({
        success: true,
        data: [],
        message: '기기 데이터 조회 기능은 추후 구현 예정입니다.',
      });
    } catch (error) {
      console.error('Get device data error:', error);
      res.status(500).json({
        success: false,
        message: '기기 데이터 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 자동 동기화 설정
   */
  static async configureAutoSync(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;
      const { autoSync, syncInterval, dataTypes } = req.body;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      const syncSettings = {
        autoSync: autoSync !== undefined ? autoSync : true,
        syncInterval: syncInterval || 60, // 기본 60분
        dataTypes: dataTypes || ['heart_rate', 'steps', 'weight'],
      };

      const updatedDevice = await WearableService.updateDeviceConfig(userId, deviceConfigId, {
        syncSettings,
      });

      res.json({
        success: true,
        data: updatedDevice,
        message: '자동 동기화 설정이 업데이트되었습니다.',
      });
    } catch (error) {
      console.error('Configure auto sync error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '자동 동기화 설정 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 수동 동기화 트리거
   */
  static async triggerManualSync(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;
      const { dataTypes, startDate, endDate } = req.body;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      const syncRequest: WearableSyncRequest = {
        deviceConfigId,
        dataTypes,
        startDate,
        endDate,
        forceSync: true,
      };

      const result = await WearableService.syncWearableData(userId, syncRequest);
      res.json(result);
    } catch (error) {
      console.error('Manual sync error:', error);
      res.status(500).json({
        success: false,
        message: '수동 동기화 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 지원되는 데이터 타입 목록 조회
   */
  static async getSupportedDataTypes(req: Request, res: Response): Promise<void> {
    try {
      const { deviceType } = req.query;

      const allDataTypes: WearableDataType[] = [
        'heart_rate',
        'steps',
        'calories',
        'sleep',
        'weight',
        'blood_pressure',
        'blood_oxygen',
        'body_temperature',
        'exercise_sessions',
        'distance',
        'floors_climbed',
      ];

      // 기기 타입별 지원 데이터 타입 필터링
      let supportedDataTypes = allDataTypes;

      if (deviceType) {
        switch (deviceType) {
          case 'apple_health':
            supportedDataTypes = allDataTypes; // Apple Health는 모든 타입 지원
            break;
          case 'google_fit':
            supportedDataTypes = [
              'heart_rate',
              'steps',
              'calories',
              'sleep',
              'weight',
              'exercise_sessions',
              'distance',
            ];
            break;
          case 'fitbit':
            supportedDataTypes = [
              'heart_rate',
              'steps',
              'calories',
              'sleep',
              'weight',
              'blood_oxygen',
              'exercise_sessions',
              'distance',
              'floors_climbed',
            ];
            break;
          case 'samsung_health':
            supportedDataTypes = [
              'heart_rate',
              'steps',
              'calories',
              'sleep',
              'weight',
              'blood_pressure',
              'blood_oxygen',
              'exercise_sessions',
            ];
            break;
        }
      }

      const dataTypeInfo = supportedDataTypes.map(type => ({
        type,
        name: this.getDataTypeName(type),
        unit: this.getDataTypeUnit(type),
        category: this.getDataTypeCategory(type),
      }));

      res.json({
        success: true,
        data: dataTypeInfo,
      });
    } catch (error) {
      console.error('Get supported data types error:', error);
      res.status(500).json({
        success: false,
        message: '지원 데이터 타입 조회 중 오류가 발생했습니다.',
      });
    }
  }

  // 유틸리티 메서드들
  private static getDataTypeName(type: WearableDataType): string {
    const names: Record<WearableDataType, string> = {
      heart_rate: '심박수',
      steps: '걸음 수',
      calories: '칼로리',
      sleep: '수면',
      weight: '체중',
      blood_pressure: '혈압',
      blood_oxygen: '혈중 산소',
      body_temperature: '체온',
      exercise_sessions: '운동 세션',
      distance: '이동 거리',
      floors_climbed: '오른 층수',
    };
    return names[type] || type;
  }

  private static getDataTypeUnit(type: WearableDataType): string {
    const units: Record<WearableDataType, string> = {
      heart_rate: 'bpm',
      steps: '걸음',
      calories: 'kcal',
      sleep: '분',
      weight: 'kg',
      blood_pressure: 'mmHg',
      blood_oxygen: '%',
      body_temperature: '°C',
      exercise_sessions: '분',
      distance: 'km',
      floors_climbed: '층',
    };
    return units[type] || '';
  }

  private static getDataTypeCategory(type: WearableDataType): string {
    const categories: Record<WearableDataType, string> = {
      heart_rate: 'vital',
      steps: 'activity',
      calories: 'activity',
      sleep: 'wellness',
      weight: 'body',
      blood_pressure: 'vital',
      blood_oxygen: 'vital',
      body_temperature: 'vital',
      exercise_sessions: 'activity',
      distance: 'activity',
      floors_climbed: 'activity',
    };
    return categories[type] || 'other';
  }
}