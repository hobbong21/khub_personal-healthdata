import { api } from './api';
import {
  WearableDeviceConfig,
  DeviceAuthRequest,
  DeviceAuthResponse,
  WearableSyncRequest,
  WearableSyncResponse,
  SyncStatus,
  DataTypeInfo,
  WearableDataType,
  ApiResponse
} from '../types/wearable';

export const wearableApi = {
  /**
   * 웨어러블 기기 인증 및 등록
   */
  async authenticateDevice(authRequest: DeviceAuthRequest): Promise<DeviceAuthResponse> {
    const response = await api.post<DeviceAuthResponse>('/wearable/authenticate', authRequest);
    return response.data;
  },

  /**
   * 웨어러블 데이터 동기화
   */
  async syncWearableData(syncRequest: WearableSyncRequest): Promise<WearableSyncResponse> {
    const response = await api.post<WearableSyncResponse>('/wearable/sync', syncRequest);
    return response.data;
  },

  /**
   * 사용자의 웨어러블 기기 목록 조회
   */
  async getUserDevices(): Promise<WearableDeviceConfig[]> {
    const response = await api.get<ApiResponse<WearableDeviceConfig[]>>('/wearable/devices');
    return response.data.data || [];
  },

  /**
   * 웨어러블 기기 설정 업데이트
   */
  async updateDeviceConfig(
    deviceConfigId: string, 
    updates: Partial<Pick<WearableDeviceConfig, 'deviceName' | 'isActive' | 'syncSettings'>>
  ): Promise<WearableDeviceConfig> {
    const response = await api.put<ApiResponse<WearableDeviceConfig>>(
      `/wearable/devices/${deviceConfigId}`, 
      updates
    );
    return response.data.data!;
  },

  /**
   * 웨어러블 기기 연동 해제
   */
  async disconnectDevice(deviceConfigId: string): Promise<void> {
    await api.delete(`/wearable/devices/${deviceConfigId}`);
  },

  /**
   * 동기화 상태 조회
   */
  async getSyncStatus(): Promise<SyncStatus[]> {
    const response = await api.get<ApiResponse<SyncStatus[]>>('/wearable/sync-status');
    return response.data.data || [];
  },

  /**
   * 특정 기기의 데이터 조회
   */
  async getDeviceData(
    deviceConfigId: string,
    params?: {
      dataType?: WearableDataType;
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.dataType) queryParams.append('dataType', params.dataType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<any[]>>(
      `/wearable/devices/${deviceConfigId}/data?${queryParams.toString()}`
    );
    return response.data.data || [];
  },

  /**
   * 자동 동기화 설정
   */
  async configureAutoSync(
    deviceConfigId: string,
    settings: {
      autoSync: boolean;
      syncInterval?: number;
      dataTypes?: WearableDataType[];
    }
  ): Promise<WearableDeviceConfig> {
    const response = await api.put<ApiResponse<WearableDeviceConfig>>(
      `/wearable/devices/${deviceConfigId}/auto-sync`,
      settings
    );
    return response.data.data!;
  },

  /**
   * 수동 동기화 트리거
   */
  async triggerManualSync(
    deviceConfigId: string,
    options?: {
      dataTypes?: WearableDataType[];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<WearableSyncResponse> {
    const response = await api.post<WearableSyncResponse>(
      `/wearable/devices/${deviceConfigId}/sync`,
      options || {}
    );
    return response.data;
  },

  /**
   * 지원되는 데이터 타입 목록 조회
   */
  async getSupportedDataTypes(deviceType?: string): Promise<DataTypeInfo[]> {
    const queryParams = deviceType ? `?deviceType=${deviceType}` : '';
    const response = await api.get<ApiResponse<DataTypeInfo[]>>(
      `/wearable/supported-data-types${queryParams}`
    );
    return response.data.data || [];
  },

  /**
   * Google Fit OAuth URL 생성
   */
  getGoogleFitAuthUrl(redirectUri: string): string {
    const clientId = process.env.REACT_APP_GOOGLE_FIT_CLIENT_ID;
    const scope = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read';
    
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },

  /**
   * Fitbit OAuth URL 생성
   */
  getFitbitAuthUrl(redirectUri: string): string {
    const clientId = process.env.REACT_APP_FITBIT_CLIENT_ID;
    const scope = 'activity heartrate sleep weight profile';
    
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope,
      response_type: 'code',
    });

    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
  },

  /**
   * Samsung Health OAuth URL 생성
   */
  getSamsungHealthAuthUrl(redirectUri: string): string {
    const clientId = process.env.REACT_APP_SAMSUNG_HEALTH_CLIENT_ID;
    
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
    });

    return `https://account.samsung.com/mobile/account/check.do?${params.toString()}`;
  },

  /**
   * 기기 타입별 아이콘 반환
   */
  getDeviceIcon(deviceType: string): string {
    const icons: Record<string, string> = {
      apple_health: '🍎',
      google_fit: '🏃‍♂️',
      fitbit: '⌚',
      samsung_health: '📱',
    };
    return icons[deviceType] || '📱';
  },

  /**
   * 기기 타입별 이름 반환
   */
  getDeviceTypeName(deviceType: string): string {
    const names: Record<string, string> = {
      apple_health: 'Apple Health',
      google_fit: 'Google Fit',
      fitbit: 'Fitbit',
      samsung_health: 'Samsung Health',
    };
    return names[deviceType] || deviceType;
  },

  /**
   * 데이터 타입별 아이콘 반환
   */
  getDataTypeIcon(dataType: WearableDataType): string {
    const icons: Record<WearableDataType, string> = {
      heart_rate: '❤️',
      steps: '👣',
      calories: '🔥',
      sleep: '😴',
      weight: '⚖️',
      blood_pressure: '🩸',
      blood_oxygen: '🫁',
      body_temperature: '🌡️',
      exercise_sessions: '💪',
      distance: '📏',
      floors_climbed: '🏢',
    };
    return icons[dataType] || '📊';
  },

  /**
   * 동기화 상태 색상 반환
   */
  getSyncStatusColor(status: SyncStatus): string {
    if (!status.isActive) return '#6b7280'; // gray
    if (status.syncInProgress) return '#3b82f6'; // blue
    if (status.errors && status.errors.length > 0) return '#ef4444'; // red
    if (status.lastSyncAt) {
      const lastSync = new Date(status.lastSyncAt);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSync < 2) return '#10b981'; // green
      if (hoursSinceSync < 24) return '#f59e0b'; // yellow
      return '#ef4444'; // red
    }
    return '#6b7280'; // gray
  },

  /**
   * 동기화 상태 텍스트 반환
   */
  getSyncStatusText(status: SyncStatus): string {
    if (!status.isActive) return '비활성화됨';
    if (status.syncInProgress) return '동기화 중...';
    if (status.errors && status.errors.length > 0) return '동기화 오류';
    if (status.lastSyncAt) {
      const lastSync = new Date(status.lastSyncAt);
      const now = new Date();
      const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSync < 1) return '방금 동기화됨';
      if (hoursSinceSync < 24) return `${Math.floor(hoursSinceSync)}시간 전 동기화`;
      const daysSinceSync = Math.floor(hoursSinceSync / 24);
      return `${daysSinceSync}일 전 동기화`;
    }
    return '동기화 안됨';
  }
};