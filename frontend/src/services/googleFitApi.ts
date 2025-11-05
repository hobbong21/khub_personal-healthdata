import api from './api';

export interface GoogleFitConnectionStatus {
  isConnected: boolean;
  deviceName?: string;
  lastSyncAt?: string;
  syncSettings?: {
    autoSync: boolean;
    syncInterval: number;
    dataTypes: string[];
  };
  syncStatus?: {
    availableDataTypes: string[];
    totalDataSources: number;
  };
}

export interface GoogleFitSyncResult {
  success: boolean;
  syncedDataCount: number;
  dataTypesProcessed: string[];
  errors?: string[];
}

export interface GoogleFitData {
  type: string;
  value: number | object;
  unit: string;
  timestamp: string;
  duration?: number;
  source: {
    deviceType: string;
    deviceName: string;
    appName?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Google Fit API 서비스
 * 요구사항 17.3: 안드로이드 기기 데이터 동기화
 */
export class GoogleFitApi {
  /**
   * Google Fit 인증 URL 생성
   */
  static async getAuthUrl(): Promise<{ authUrl: string; message: string }> {
    const response = await apiClient.get('/google-fit/auth-url');
    return response.data;
  }

  /**
   * Google Fit 연결 상태 확인
   */
  static async getConnectionStatus(): Promise<GoogleFitConnectionStatus> {
    const response = await apiClient.get('/google-fit/status');
    return response.data;
  }

  /**
   * Google Fit 데이터 동기화
   */
  static async syncData(options: {
    dataTypes?: string[];
    startDate?: string;
    endDate?: string;
    forceSync?: boolean;
  } = {}): Promise<GoogleFitSyncResult> {
    const response = await apiClient.post('/google-fit/sync', options);
    return response.data.syncResult;
  }

  /**
   * 특정 데이터 타입 조회
   */
  static async getDataByType(
    dataType: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    dataType: string;
    dataCount: number;
    data: GoogleFitData[];
    period: {
      startDate: string;
      endDate: string;
    };
  }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(
      `/google-fit/data/${dataType}?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Google Fit 연동 해제
   */
  static async disconnect(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete('/google-fit/disconnect');
    return response.data;
  }

  /**
   * 동기화 설정 업데이트
   */
  static async updateSyncSettings(settings: {
    autoSync?: boolean;
    syncInterval?: number;
    dataTypes?: string[];
  }): Promise<{
    success: boolean;
    message: string;
    syncSettings: {
      autoSync: boolean;
      syncInterval: number;
      dataTypes: string[];
    };
  }> {
    const response = await apiClient.put('/google-fit/sync-settings', settings);
    return response.data;
  }

  /**
   * Google Fit 사용자 프로필 조회
   */
  static async getUserProfile(): Promise<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }> {
    const response = await apiClient.get('/google-fit/profile');
    return response.data.profile;
  }

  /**
   * 건강 상태 요약 조회 (Google Fit 데이터 기반)
   */
  static async getHealthSummary(
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    date?: string
  ): Promise<{
    period: string;
    date: string;
    metrics: {
      steps: { value: number; goal: number; percentage: number };
      calories: { value: number; goal: number; percentage: number };
      heartRate: { average: number; resting: number; max: number };
      sleep: { duration: number; quality: string; efficiency: number };
    };
    insights: string[];
  }> {
    const params = new URLSearchParams();
    params.append('period', period);
    if (date) params.append('date', date);

    const response = await apiClient.get(
      `/google-fit/health-summary?${params.toString()}`
    );
    return response.data.summary;
  }

  /**
   * 실시간 데이터 가져오기 (최근 24시간)
   */
  static async getRecentData(dataTypes: string[] = ['steps', 'heart_rate']): Promise<{
    [dataType: string]: GoogleFitData[];
  }> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const results: { [dataType: string]: GoogleFitData[] } = {};

    for (const dataType of dataTypes) {
      try {
        const data = await this.getDataByType(dataType, startDate, endDate);
        results[dataType] = data.data;
      } catch (error) {
        console.error(`Failed to fetch ${dataType} data:`, error);
        results[dataType] = [];
      }
    }

    return results;
  }

  /**
   * 데이터 타입별 통계 조회
   */
  static async getDataStatistics(
    dataType: string,
    period: 'week' | 'month' | 'year' = 'week'
  ): Promise<{
    dataType: string;
    period: string;
    statistics: {
      total: number;
      average: number;
      min: number;
      max: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      changePercent: number;
    };
    chartData: Array<{
      date: string;
      value: number;
    }>;
  }> {
    const endDate = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const data = await this.getDataByType(
      dataType,
      startDate.toISOString(),
      endDate.toISOString()
    );

    // 통계 계산
    const values = data.data.map(item => 
      typeof item.value === 'number' ? item.value : 0
    );

    const total = values.reduce((sum, val) => sum + val, 0);
    const average = values.length > 0 ? total / values.length : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 0;

    // 트렌드 계산 (간단한 선형 회귀)
    const trend = this.calculateTrend(values);

    // 차트 데이터 생성
    const chartData = data.data.map(item => ({
      date: new Date(item.timestamp).toISOString().split('T')[0],
      value: typeof item.value === 'number' ? item.value : 0,
    }));

    return {
      dataType,
      period,
      statistics: {
        total,
        average: Math.round(average * 100) / 100,
        min,
        max,
        trend: trend.direction,
        changePercent: Math.round(trend.changePercent * 100) / 100,
      },
      chartData,
    };
  }

  /**
   * 트렌드 계산 헬퍼 함수
   */
  private static calculateTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    changePercent: number;
  } {
    if (values.length < 2) {
      return { direction: 'stable', changePercent: 0 };
    }

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const changePercent = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(changePercent) < 5) {
      direction = 'stable';
    } else if (changePercent > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return { direction, changePercent };
  }
}

export const googleFitApi = GoogleFitApi;