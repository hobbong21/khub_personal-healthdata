import { Request, Response } from 'express';
import { GoogleFitService } from '../services/googleFitService';
import { WearableDataType } from '../types/wearable';

/**
 * Google Fit API 전용 컨트롤러
 * 요구사항 17.3: Google Fit 데이터 수집 구현, 안드로이드 기기 데이터 동기화, 데이터 정규화 및 저장
 */
export class GoogleFitController {
  /**
   * Google Fit OAuth 인증 코드를 토큰으로 교환
   * POST /api/google-fit/exchange-token
   */
  static async exchangeAuthCode(req: Request, res: Response): Promise<void> {
    try {
      const { authCode, redirectUri } = req.body;

      if (!authCode) {
        res.status(400).json({
          success: false,
          message: '인증 코드가 필요합니다.',
        });
        return;
      }

      if (!redirectUri) {
        res.status(400).json({
          success: false,
          message: '리다이렉트 URI가 필요합니다.',
        });
        return;
      }

      // 환경 변수에서 클라이언트 정보 가져오기
      const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        res.status(500).json({
          success: false,
          message: 'Google Fit 클라이언트 설정이 누락되었습니다.',
        });
        return;
      }

      const tokens = await GoogleFitService.exchangeAuthCodeForTokens(
        authCode, 
        redirectUri, 
        clientId, 
        clientSecret
      );

      res.json({
        success: true,
        data: tokens,
        message: 'Google Fit 인증이 성공적으로 완료되었습니다.',
      });
    } catch (error) {
      console.error('Google Fit auth code exchange error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Google Fit 인증 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit 액세스 토큰 갱신
   * POST /api/google-fit/refresh-token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: '리프레시 토큰이 필요합니다.',
        });
        return;
      }

      const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        res.status(500).json({
          success: false,
          message: 'Google Fit 클라이언트 설정이 누락되었습니다.',
        });
        return;
      }

      const tokens = await GoogleFitService.refreshAccessToken(refreshToken, clientId, clientSecret);

      res.json({
        success: true,
        data: tokens,
        message: '토큰이 성공적으로 갱신되었습니다.',
      });
    } catch (error) {
      console.error('Google Fit token refresh error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '토큰 갱신 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit 데이터 동기화
   * POST /api/google-fit/sync/:deviceConfigId
   */
  static async syncData(req: Request, res: Response): Promise<void> {
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

      const requestedDataTypes: WearableDataType[] = dataTypes || [
        'heart_rate', 'steps', 'calories', 'sleep', 'weight'
      ];

      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const result = await GoogleFitService.syncGoogleFitData(
        userId, 
        deviceConfigId, 
        requestedDataTypes, 
        start, 
        end
      );

      res.json({
        success: result.success,
        syncedDataCount: result.syncedDataCount,
        dataTypesProcessed: result.dataTypesProcessed,
        errors: result.errors.length > 0 ? result.errors : undefined,
        message: `${result.syncedDataCount}개의 데이터가 동기화되었습니다.`,
      });
    } catch (error) {
      console.error('Google Fit sync error:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 데이터 동기화 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit 특정 데이터 타입 조회
   * GET /api/google-fit/data/:deviceConfigId/:dataType
   */
  static async fetchDataType(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId, dataType } = req.params;
      const { startDate, endDate } = req.query;

      if (!deviceConfigId || !dataType) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID와 데이터 타입이 필요합니다.',
        });
        return;
      }

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const result = await GoogleFitService.fetchGoogleFitData(
        userId, 
        deviceConfigId, 
        dataType as WearableDataType, 
        start, 
        end
      );

      res.json({
        success: result.success,
        data: result.data,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    } catch (error) {
      console.error('Google Fit fetch data type error:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 데이터 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit 집계 데이터 조회
   * GET /api/google-fit/aggregate/:deviceConfigId/:dataType
   */
  static async getAggregatedData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId, dataType } = req.params;
      const { aggregateBy = 'day', startDate, endDate } = req.query;

      if (!deviceConfigId || !dataType) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID와 데이터 타입이 필요합니다.',
        });
        return;
      }

      if (!['day', 'week', 'month'].includes(aggregateBy as string)) {
        res.status(400).json({
          success: false,
          message: '집계 기준은 day, week, month 중 하나여야 합니다.',
        });
        return;
      }

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const result = await GoogleFitService.getAggregatedData(
        userId,
        deviceConfigId,
        dataType as WearableDataType,
        aggregateBy as 'day' | 'week' | 'month',
        start,
        end
      );

      res.json({
        success: result.success,
        data: result.data,
        errors: result.errors.length > 0 ? result.errors : undefined,
      });
    } catch (error) {
      console.error('Google Fit aggregated data error:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 집계 데이터 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit 연결 상태 확인
   * GET /api/google-fit/connection-status/:deviceConfigId
   */
  static async checkConnectionStatus(req: Request, res: Response): Promise<void> {
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

      const status = await GoogleFitService.checkConnectionStatus(userId, deviceConfigId);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Google Fit connection status error:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 연결 상태 확인 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit 지원 데이터 타입 목록
   * GET /api/google-fit/supported-types
   */
  static async getSupportedDataTypes(req: Request, res: Response): Promise<void> {
    try {
      const supportedTypes = [
        {
          dataType: 'heart_rate',
          name: '심박수',
          unit: 'bpm',
          category: 'vital',
          dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
          dataTypeName: 'com.google.heart_rate.bpm',
        },
        {
          dataType: 'steps',
          name: '걸음 수',
          unit: 'count',
          category: 'activity',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
          dataTypeName: 'com.google.step_count.delta',
        },
        {
          dataType: 'calories',
          name: '소모 칼로리',
          unit: 'kcal',
          category: 'activity',
          dataSourceId: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
          dataTypeName: 'com.google.calories.expended',
        },
        {
          dataType: 'sleep',
          name: '수면',
          unit: 'minutes',
          category: 'wellness',
          dataSourceId: 'derived:com.google.sleep.segment:com.google.android.gms:merged',
          dataTypeName: 'com.google.sleep.segment',
        },
        {
          dataType: 'weight',
          name: '체중',
          unit: 'kg',
          category: 'body',
          dataSourceId: 'derived:com.google.weight:com.google.android.gms:merge_weight',
          dataTypeName: 'com.google.weight',
        },
        {
          dataType: 'distance',
          name: '이동 거리',
          unit: 'km',
          category: 'activity',
          dataSourceId: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
          dataTypeName: 'com.google.distance.delta',
        },
        {
          dataType: 'exercise_sessions',
          name: '운동 세션',
          unit: 'minutes',
          category: 'activity',
          dataSourceId: 'derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments',
          dataTypeName: 'com.google.activity.segment',
        },
      ];

      res.json({
        success: true,
        data: supportedTypes,
      });
    } catch (error) {
      console.error('Get Google Fit supported types error:', error);
      res.status(500).json({
        success: false,
        message: '지원 데이터 타입 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit OAuth 인증 URL 생성
   * GET /api/google-fit/auth-url
   */
  static async getAuthUrl(req: Request, res: Response): Promise<void> {
    try {
      const { redirectUri } = req.query;

      if (!redirectUri) {
        res.status(400).json({
          success: false,
          message: '리다이렉트 URI가 필요합니다.',
        });
        return;
      }

      const clientId = process.env.GOOGLE_FIT_CLIENT_ID;

      if (!clientId) {
        res.status(500).json({
          success: false,
          message: 'Google Fit 클라이언트 ID가 설정되지 않았습니다.',
        });
        return;
      }

      const scopes = [
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.location.read',
        'https://www.googleapis.com/auth/fitness.nutrition.read',
        'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
        'https://www.googleapis.com/auth/fitness.reproductive_health.read',
        'https://www.googleapis.com/auth/fitness.sleep.read',
      ];

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri as string);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', scopes.join(' '));
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      res.json({
        success: true,
        data: {
          authUrl: authUrl.toString(),
          scopes,
        },
        message: 'Google Fit 인증 URL이 생성되었습니다.',
      });
    } catch (error) {
      console.error('Google Fit auth URL generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 인증 URL 생성 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * Google Fit 데이터 소스 목록 조회
   * GET /api/google-fit/data-sources/:deviceConfigId
   */
  static async getDataSources(req: Request, res: Response): Promise<void> {
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

      const status = await GoogleFitService.checkConnectionStatus(userId, deviceConfigId);

      if (!status.isConnected) {
        res.status(400).json({
          success: false,
          message: 'Google Fit에 연결되지 않았습니다.',
          errors: status.errors,
        });
        return;
      }

      res.json({
        success: true,
        data: {
          availableDataSources: status.availableDataSources,
          isConnected: status.isConnected,
          hasValidToken: status.hasValidToken,
          lastSyncAt: status.lastSyncAt,
        },
      });
    } catch (error) {
      console.error('Google Fit data sources error:', error);
      res.status(500).json({
        success: false,
        message: 'Google Fit 데이터 소스 조회 중 오류가 발생했습니다.',
      });
    }
  }
}