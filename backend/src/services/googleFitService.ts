import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { WearableDataType, WearableDataNormalized, GoogleFitData, WearableSyncResponse } from '../types/wearable';
import { GoogleFitDataNormalizer } from '../utils/googleFitDataNormalizer';

/**
 * Google Fit API 연동 서비스
 * 요구사항 17.3: Google Fit 데이터 수집 구현
 */
export class GoogleFitService {
  private oauth2Client: OAuth2Client;
  private fitness: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_FIT_CLIENT_ID,
      process.env.GOOGLE_FIT_CLIENT_SECRET,
      process.env.GOOGLE_FIT_REDIRECT_URI
    );

    this.fitness = google.fitness({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * OAuth 인증 URL 생성
   */
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
      'https://www.googleapis.com/auth/fitness.location.read',
      'https://www.googleapis.com/auth/fitness.nutrition.read',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * 인증 코드로 토큰 교환
   */
  async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to obtain access or refresh token');
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date || Date.now() + 3600000, // 1시간 후
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to authenticate with Google Fit');
    }
  }

  /**
   * 토큰 설정
   */
  setCredentials(accessToken: string, refreshToken: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * 토큰 갱신
   */
  async refreshAccessToken(): Promise<{
    accessToken: string;
    expiryDate: number;
  }> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      return {
        accessToken: credentials.access_token,
        expiryDate: credentials.expiry_date || Date.now() + 3600000,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh Google Fit access token');
    }
  }

  /**
   * 사용 가능한 데이터 소스 조회
   */
  async getDataSources(): Promise<any[]> {
    try {
      const response = await this.fitness.users.dataSources.list({
        userId: 'me',
      });

      return response.data.dataSource || [];
    } catch (error) {
      console.error('Error fetching data sources:', error);
      throw new Error('Failed to fetch Google Fit data sources');
    }
  }

  /**
   * 특정 데이터 타입의 데이터 조회
   */
  async getDataByType(
    dataType: WearableDataType,
    startTime: Date,
    endTime: Date
  ): Promise<WearableDataNormalized[]> {
    try {
      const dataTypeName = this.mapDataTypeToGoogleFit(dataType);
      const startTimeNanos = (startTime.getTime() * 1000000).toString();
      const endTimeNanos = (endTime.getTime() * 1000000).toString();

      const response = await this.fitness.users.dataset.aggregate({
        userId: 'me',
        requestBody: {
          aggregateBy: [{
            dataTypeName: dataTypeName,
          }],
          bucketByTime: {
            durationMillis: this.getBucketDuration(dataType),
          },
          startTimeMillis: startTime.getTime(),
          endTimeMillis: endTime.getTime(),
        },
      });

      const rawData = this.extractDataPoints(response.data.bucket || []);
      return GoogleFitDataNormalizer.normalizeGoogleFitData(rawData, dataType);
    } catch (error) {
      console.error(`Error fetching ${dataType} data:`, error);
      throw new Error(`Failed to fetch ${dataType} data from Google Fit`);
    }
  }

  /**
   * 여러 데이터 타입의 데이터 일괄 조회
   */
  async syncMultipleDataTypes(
    dataTypes: WearableDataType[],
    startTime: Date,
    endTime: Date
  ): Promise<WearableSyncResponse> {
    const syncedData: WearableDataNormalized[] = [];
    const errors: string[] = [];
    const processedTypes: WearableDataType[] = [];

    for (const dataType of dataTypes) {
      try {
        const data = await this.getDataByType(dataType, startTime, endTime);
        syncedData.push(...data);
        processedTypes.push(dataType);
      } catch (error) {
        const errorMessage = `Failed to sync ${dataType}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    return {
      success: errors.length === 0,
      deviceConfigId: '', // 호출하는 곳에서 설정
      syncedDataCount: syncedData.length,
      lastSyncAt: new Date(),
      errors: errors.length > 0 ? errors : undefined,
      dataTypesProcessed: processedTypes,
    };
  }

  /**
   * 실시간 데이터 스트림 구독 (웹훅)
   */
  async subscribeToDataUpdates(dataTypes: WearableDataType[]): Promise<void> {
    try {
      for (const dataType of dataTypes) {
        const dataTypeName = this.mapDataTypeToGoogleFit(dataType);
        
        await this.fitness.users.dataSources.dataPointChanges.list({
          userId: 'me',
          dataSourceId: `derived:${dataTypeName}:com.google.android.gms:merge_${dataType}`,
        });
      }
    } catch (error) {
      console.error('Error subscribing to data updates:', error);
      throw new Error('Failed to subscribe to Google Fit data updates');
    }
  }

  /**
   * 데이터 타입을 Google Fit 형식으로 매핑
   */
  private mapDataTypeToGoogleFit(dataType: WearableDataType): string {
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
      floors_climbed: 'com.google.floor_change',
    };

    return mapping[dataType] || dataType;
  }

  /**
   * 데이터 타입별 버킷 지속시간 설정
   */
  private getBucketDuration(dataType: WearableDataType): number {
    // 밀리초 단위
    const durations: Record<WearableDataType, number> = {
      heart_rate: 60000, // 1분
      steps: 3600000, // 1시간
      calories: 3600000, // 1시간
      sleep: 86400000, // 1일
      weight: 86400000, // 1일
      blood_pressure: 3600000, // 1시간
      blood_oxygen: 3600000, // 1시간
      body_temperature: 3600000, // 1시간
      exercise_sessions: 86400000, // 1일
      distance: 3600000, // 1시간
      floors_climbed: 3600000, // 1시간
    };

    return durations[dataType] || 3600000; // 기본 1시간
  }

  /**
   * 응답에서 데이터 포인트 추출
   */
  private extractDataPoints(buckets: any[]): any[] {
    const dataPoints: any[] = [];

    for (const bucket of buckets) {
      if (bucket.dataset && Array.isArray(bucket.dataset)) {
        for (const dataset of bucket.dataset) {
          if (dataset.point && Array.isArray(dataset.point)) {
            dataPoints.push(...dataset.point);
          }
        }
      }
    }

    return dataPoints;
  }

  /**
   * 사용자 프로필 정보 조회
   */
  async getUserProfile(): Promise<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }> {
    try {
      const response = await this.fitness.users.profile.get({
        userId: 'me',
      });

      return {
        displayName: response.data.displayName,
        givenName: response.data.givenName,
        familyName: response.data.familyName,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {};
    }
  }

  /**
   * 데이터 소스별 최신 데이터 조회
   */
  async getLatestDataFromSource(dataSourceId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.fitness.users.dataSources.dataPointChanges.list({
        userId: 'me',
        dataSourceId: dataSourceId,
        limit: limit,
      });

      return response.data.insertedDataPoint || [];
    } catch (error) {
      console.error('Error fetching latest data from source:', error);
      return [];
    }
  }

  /**
   * 연결 상태 확인
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.fitness.users.profile.get({ userId: 'me' });
      return true;
    } catch (error) {
      console.error('Google Fit connection check failed:', error);
      return false;
    }
  }

  /**
   * 데이터 동기화 상태 조회
   */
  async getSyncStatus(): Promise<{
    isConnected: boolean;
    lastSyncTime?: Date;
    availableDataTypes: string[];
    totalDataSources: number;
  }> {
    try {
      const isConnected = await this.checkConnection();
      
      if (!isConnected) {
        return {
          isConnected: false,
          availableDataTypes: [],
          totalDataSources: 0,
        };
      }

      const dataSources = await this.getDataSources();
      const availableDataTypes = dataSources.map(source => source.dataType?.name).filter(Boolean);

      return {
        isConnected: true,
        availableDataTypes,
        totalDataSources: dataSources.length,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isConnected: false,
        availableDataTypes: [],
        totalDataSources: 0,
      };
    }
  }
}