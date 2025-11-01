import prisma from '../config/database';
import { 
  GoogleFitData, 
  WearableDataType, 
  WearableDataNormalized 
} from '../types/wearable';

/**
 * Google Fit API 연동 서비스
 * 요구사항 17.3: Google Fit 데이터 수집 구현, 안드로이드 기기 데이터 동기화, 데이터 정규화 및 저장
 */
export class GoogleFitService {
  private static readonly GOOGLE_FIT_API_BASE = 'https://www.googleapis.com/fitness/v1';
  private static readonly OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

  /**
   * Google Fit OAuth 2.0 토큰 교환
   */
  static async exchangeAuthCodeForTokens(
    authCode: string, 
    redirectUri: string, 
    clientId: string, 
    clientSecret: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const response = await fetch(this.OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: authCode,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google OAuth 토큰 교환 실패: ${errorData.error_description || errorData.error}`);
      }

      const tokenData = await response.json();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
      };
    } catch (error) {
      console.error('Google Fit token exchange error:', error);
      throw new Error(`Google Fit 인증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * Google Fit 액세스 토큰 갱신
   */
  static async refreshAccessToken(
    refreshToken: string, 
    clientId: string, 
    clientSecret: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const response = await fetch(this.OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`토큰 갱신 실패: ${errorData.error_description || errorData.error}`);
      }

      const tokenData = await response.json();

      return {
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
      };
    } catch (error) {
      console.error('Google Fit token refresh error:', error);
      throw new Error(`토큰 갱신 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  /**
   * Google Fit에서 데이터 수집
   */
  static async fetchGoogleFitData(
    userId: string,
    deviceConfigId: string,
    dataType: WearableDataType,
    startDate: Date,
    endDate: Date
  ): Promise<{ success: boolean; data: GoogleFitData[]; errors: string[] }> {
    try {
      const deviceConfig = await prisma.wearableDeviceConfig.findFirst({
        where: {
          id: deviceConfigId,
          userId,
          deviceType: 'google_fit',
          isActive: true,
        },
      });

      if (!deviceConfig) {
        throw new Error('Google Fit 기기 설정을 찾을 수 없습니다.');
      }

      if (!deviceConfig.accessToken) {
        throw new Error('Google Fit 액세스 토큰이 없습니다.');
      }

      const dataSourceId = this.getGoogleFitDataSourceId(dataType);
      const startTimeNanos = (startDate.getTime() * 1000000).toString();
      const endTimeNanos = (endDate.getTime() * 1000000).toString();

      const url = `${this.GOOGLE_FIT_API_BASE}/users/me/dataSources/${dataSourceId}/datasets/${startTimeNanos}-${endTimeNanos}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${deviceConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // 토큰 갱신 시도
          await this.handleTokenRefresh(deviceConfigId, deviceConfig.refreshToken);
          throw new Error('토큰이 만료되어 갱신했습니다. 다시 시도해주세요.');
        }
        
        const errorData = await response.json();
        throw new Error(`Google Fit API 오류 (${response.status}): ${errorData.error?.message || '알 수 없는 오류'}`);
      }

      const responseData = await response.json();
      const dataPoints = responseData.point || [];

      // 데이터 정규화 및 저장
      const normalizedData = await this.normalizeGoogleFitData(dataPoints, dataType);
      await this.saveGoogleFitData(deviceConfigId, normalizedData);

      return {
        success: true,
        data: dataPoints,
        errors: [],
      };
    } catch (error) {
      console.error('Google Fit data fetch error:', error);
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Google Fit 데이터 수집 중 오류가 발생했습니다.'],
      };
    }
  }

  /**
   * Google Fit 데이터 배치 동기화
   */
  static async syncGoogleFitData(
    userId: string,
    deviceConfigId: string,
    dataTypes: WearableDataType[],
    startDate?: Date,
    endDate?: Date
  ): Promise<{ 
    success: boolean; 
    syncedDataCount: number; 
    errors: string[]; 
    dataTypesProcessed: WearableDataType[] 
  }> {
    try {
      const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 기본 7일
      const end = endDate || new Date();

      let syncedDataCount = 0;
      const errors: string[] = [];
      const dataTypesProcessed: WearableDataType[] = [];

      for (const dataType of dataTypes) {
        try {
          const result = await this.fetchGoogleFitData(userId, deviceConfigId, dataType, start, end);
          
          if (result.success) {
            syncedDataCount += result.data.length;
            dataTypesProcessed.push(dataType);
          } else {
            errors.push(...result.errors);
          }
        } catch (error) {
          console.error(`Error syncing ${dataType}:`, error);
          errors.push(`${dataType}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
      }

      // 마지막 동기화 시간 업데이트
      await prisma.wearableDeviceConfig.update({
        where: { id: deviceConfigId },
        data: { lastSyncAt: new Date() },
      });

      return {
        success: true,
        syncedDataCount,
        errors,
        dataTypesProcessed,
      };
    } catch (error) {
      console.error('Google Fit sync error:', error);
      return {
        success: false,
        syncedDataCount: 0,
        errors: [error instanceof Error ? error.message : 'Google Fit 동기화 중 오류가 발생했습니다.'],
        dataTypesProcessed: [],
      };
    }
  }

  /**
   * Google Fit 집계 데이터 조회 (일별, 주별, 월별)
   */
  static async getAggregatedData(
    userId: string,
    deviceConfigId: string,
    dataType: WearableDataType,
    aggregateBy: 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date
  ): Promise<{ success: boolean; data: any[]; errors: string[] }> {
    try {
      const deviceConfig = await prisma.wearableDeviceConfig.findFirst({
        where: {
          id: deviceConfigId,
          userId,
          deviceType: 'google_fit',
          isActive: true,
        },
      });

      if (!deviceConfig || !deviceConfig.accessToken) {
        throw new Error('Google Fit 기기 설정 또는 액세스 토큰을 찾을 수 없습니다.');
      }

      const dataSourceId = this.getGoogleFitDataSourceId(dataType);
      const startTimeMillis = startDate.getTime();
      const endTimeMillis = endDate.getTime();

      // 집계 기간 설정
      let bucketByTime: number;
      switch (aggregateBy) {
        case 'day':
          bucketByTime = 24 * 60 * 60 * 1000; // 1일
          break;
        case 'week':
          bucketByTime = 7 * 24 * 60 * 60 * 1000; // 1주
          break;
        case 'month':
          bucketByTime = 30 * 24 * 60 * 60 * 1000; // 30일
          break;
        default:
          bucketByTime = 24 * 60 * 60 * 1000;
      }

      const aggregateRequest = {
        aggregateBy: [{
          dataTypeName: this.getGoogleFitDataTypeName(dataType),
          dataSourceId: dataSourceId,
        }],
        bucketByTime: {
          durationMillis: bucketByTime,
        },
        startTimeMillis: startTimeMillis,
        endTimeMillis: endTimeMillis,
      };

      const response = await fetch(`${this.GOOGLE_FIT_API_BASE}/users/me/dataset:aggregate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${deviceConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aggregateRequest),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.handleTokenRefresh(deviceConfigId, deviceConfig.refreshToken);
          throw new Error('토큰이 만료되어 갱신했습니다. 다시 시도해주세요.');
        }
        
        const errorData = await response.json();
        throw new Error(`Google Fit 집계 API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
      }

      const responseData = await response.json();
      const buckets = responseData.bucket || [];

      const aggregatedData = buckets.map((bucket: any) => {
        const startTime = new Date(parseInt(bucket.startTimeMillis));
        const endTime = new Date(parseInt(bucket.endTimeMillis));
        
        let value = 0;
        if (bucket.dataset && bucket.dataset.length > 0) {
          const dataset = bucket.dataset[0];
          if (dataset.point && dataset.point.length > 0) {
            const point = dataset.point[0];
            if (point.value && point.value.length > 0) {
              value = point.value[0].intVal || point.value[0].fpVal || 0;
            }
          }
        }

        return {
          startTime,
          endTime,
          value,
          dataType,
          aggregateBy,
        };
      });

      return {
        success: true,
        data: aggregatedData,
        errors: [],
      };
    } catch (error) {
      console.error('Google Fit aggregated data error:', error);
      return {
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Google Fit 집계 데이터 조회 중 오류가 발생했습니다.'],
      };
    }
  }

  /**
   * Google Fit 데이터 정규화
   */
  private static async normalizeGoogleFitData(
    googleFitData: any[], 
    dataType: WearableDataType
  ): Promise<WearableDataNormalized[]> {
    const { GoogleFitDataNormalizer } = await import('../utils/googleFitDataNormalizer');
    
    // 데이터 정규화
    const normalizedData = GoogleFitDataNormalizer.normalizeGoogleFitData(
      googleFitData, 
      dataType, 
      'Google Fit'
    );

    // 데이터 품질 검증
    const { valid, invalid } = GoogleFitDataNormalizer.validateDataQuality(normalizedData);
    
    if (invalid.length > 0) {
      console.warn(`Google Fit data validation: ${invalid.length} invalid data points filtered out`, 
        invalid.map(item => ({ type: dataType, reason: item.reason }))
      );
    }

    return valid;
  }

  /**
   * Google Fit 값 변환
   */
  private static convertGoogleFitValue(value: number | object, dataType: WearableDataType): number | object {
    switch (dataType) {
      case 'distance':
        // 미터를 킬로미터로 변환
        return Math.round((value as number / 1000) * 100) / 100;
      
      case 'calories':
        // 칼로리는 그대로 유지
        return Math.round(value as number);
      
      case 'sleep':
        // 밀리초를 분으로 변환
        return Math.round((value as number) / (1000 * 60));
      
      default:
        return typeof value === 'number' ? Math.round(value * 100) / 100 : value;
    }
  }

  /**
   * 정규화된 Google Fit 데이터를 데이터베이스에 저장
   */
  private static async saveGoogleFitData(deviceConfigId: string, normalizedData: WearableDataNormalized[]): Promise<void> {
    for (const data of normalizedData) {
      await prisma.wearableDataPoint.upsert({
        where: {
          deviceConfigId_dataType_timestamp: {
            deviceConfigId,
            dataType: data.type,
            startTime: data.timestamp,
          },
        },
        update: {
          value: data.value,
          unit: data.unit,
          endTime: data.duration ? new Date(data.timestamp.getTime() + data.duration * 1000) : undefined,
          sourceApp: data.source.appName,
          metadata: data.metadata,
          syncedAt: new Date(),
        },
        create: {
          deviceConfigId,
          dataType: data.type,
          value: data.value,
          unit: data.unit,
          startTime: data.timestamp,
          endTime: data.duration ? new Date(data.timestamp.getTime() + data.duration * 1000) : undefined,
          sourceApp: data.source.appName,
          metadata: data.metadata,
          syncedAt: new Date(),
        },
      });
    }
  }

  /**
   * 토큰 갱신 처리
   */
  private static async handleTokenRefresh(deviceConfigId: string, refreshToken: string | null): Promise<void> {
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다. 다시 인증해주세요.');
    }

    try {
      // 실제 환경에서는 환경 변수에서 가져와야 함
      const clientId = process.env.GOOGLE_FIT_CLIENT_ID || 'mock_client_id';
      const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET || 'mock_client_secret';

      const tokens = await this.refreshAccessToken(refreshToken, clientId, clientSecret);

      await prisma.wearableDeviceConfig.update({
        where: { id: deviceConfigId },
        data: { 
          accessToken: tokens.accessToken,
          // 토큰 만료 시간도 저장할 수 있음
        },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('토큰 갱신에 실패했습니다. 다시 인증해주세요.');
    }
  }

  /**
   * Google Fit 데이터 소스 ID 매핑
   */
  private static getGoogleFitDataSourceId(dataType: WearableDataType): string {
    const mapping: Record<WearableDataType, string> = {
      heart_rate: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
      steps: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      calories: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
      sleep: 'derived:com.google.sleep.segment:com.google.android.gms:merged',
      weight: 'derived:com.google.weight:com.google.android.gms:merge_weight',
      blood_pressure: 'derived:com.google.blood_pressure:com.google.android.gms:merged',
      blood_oxygen: 'derived:com.google.oxygen_saturation:com.google.android.gms:merged',
      body_temperature: 'derived:com.google.body.temperature:com.google.android.gms:merged',
      exercise_sessions: 'derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments',
      distance: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
      floors_climbed: 'derived:com.google.floors_climbed:com.google.android.gms:merged',
    };
    return mapping[dataType] || dataType;
  }

  /**
   * Google Fit 데이터 타입 이름 매핑
   */
  private static getGoogleFitDataTypeName(dataType: WearableDataType): string {
    const mapping: Record<WearableDataType, string> = {
      heart_rate: 'com.google.heart_rate.bpm',
      steps: 'com.google.step_count.delta',
      calories: 'com.google.calories.expended',
      sleep: 'com.google.sleep.segment',
      weight: 'com.google.weight',
      blood_pressure: 'com.google.blood_pressure',
      blood_oxygen: 'com.google.oxygen_saturation',
      body_temperature: 'com.google.body.temperature',
      exercise_sessions: 'com.google.activity.segment',
      distance: 'com.google.distance.delta',
      floors_climbed: 'com.google.floors_climbed',
    };
    return mapping[dataType] || dataType;
  }

  /**
   * 표준 단위 반환
   */
  private static getStandardUnit(dataType: WearableDataType): string {
    const units: Record<WearableDataType, string> = {
      heart_rate: 'bpm',
      steps: 'count',
      calories: 'kcal',
      sleep: 'minutes',
      weight: 'kg',
      blood_pressure: 'mmHg',
      blood_oxygen: '%',
      body_temperature: '°C',
      exercise_sessions: 'minutes',
      distance: 'km',
      floors_climbed: 'count',
    };
    return units[dataType] || 'unit';
  }

  /**
   * Google Fit 연결 상태 확인
   */
  static async checkConnectionStatus(userId: string, deviceConfigId: string): Promise<{
    isConnected: boolean;
    hasValidToken: boolean;
    lastSyncAt?: Date;
    availableDataSources: string[];
    errors: string[];
  }> {
    try {
      const deviceConfig = await prisma.wearableDeviceConfig.findFirst({
        where: {
          id: deviceConfigId,
          userId,
          deviceType: 'google_fit',
        },
      });

      if (!deviceConfig) {
        return {
          isConnected: false,
          hasValidToken: false,
          availableDataSources: [],
          errors: ['Google Fit 기기 설정을 찾을 수 없습니다.'],
        };
      }

      if (!deviceConfig.accessToken) {
        return {
          isConnected: false,
          hasValidToken: false,
          lastSyncAt: deviceConfig.lastSyncAt || undefined,
          availableDataSources: [],
          errors: ['액세스 토큰이 없습니다.'],
        };
      }

      // Google Fit API로 데이터 소스 목록 조회
      try {
        const response = await fetch(`${this.GOOGLE_FIT_API_BASE}/users/me/dataSources`, {
          headers: {
            'Authorization': `Bearer ${deviceConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const dataSources = data.dataSource || [];
          const availableDataSources = dataSources.map((ds: any) => ds.dataStreamId);

          return {
            isConnected: true,
            hasValidToken: true,
            lastSyncAt: deviceConfig.lastSyncAt || undefined,
            availableDataSources,
            errors: [],
          };
        } else if (response.status === 401) {
          return {
            isConnected: false,
            hasValidToken: false,
            lastSyncAt: deviceConfig.lastSyncAt || undefined,
            availableDataSources: [],
            errors: ['액세스 토큰이 만료되었습니다.'],
          };
        } else {
          return {
            isConnected: false,
            hasValidToken: false,
            lastSyncAt: deviceConfig.lastSyncAt || undefined,
            availableDataSources: [],
            errors: [`Google Fit API 오류: ${response.status}`],
          };
        }
      } catch (apiError) {
        return {
          isConnected: false,
          hasValidToken: false,
          lastSyncAt: deviceConfig.lastSyncAt || undefined,
          availableDataSources: [],
          errors: [`API 호출 오류: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`],
        };
      }
    } catch (error) {
      console.error('Google Fit connection check error:', error);
      return {
        isConnected: false,
        hasValidToken: false,
        availableDataSources: [],
        errors: [error instanceof Error ? error.message : '연결 상태 확인 중 오류가 발생했습니다.'],
      };
    }
  }
}