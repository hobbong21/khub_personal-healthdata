export interface WearableDeviceConfig {
  id: string;
  userId: string;
  deviceType: 'apple_health' | 'google_fit' | 'fitbit' | 'samsung_health';
  deviceName: string;
  isActive: boolean;
  lastSyncAt?: string;
  syncSettings: {
    autoSync: boolean;
    syncInterval: number; // minutes
    dataTypes: WearableDataType[];
  };
  createdAt: string;
  updatedAt: string;
}

export type WearableDataType = 
  | 'heart_rate'
  | 'steps'
  | 'calories'
  | 'sleep'
  | 'weight'
  | 'blood_pressure'
  | 'blood_oxygen'
  | 'body_temperature'
  | 'exercise_sessions'
  | 'distance'
  | 'floors_climbed';

export interface WearableDataPoint {
  id: string;
  deviceConfigId: string;
  dataType: WearableDataType;
  value: number | object;
  unit: string;
  startTime: string;
  endTime?: string;
  sourceApp?: string;
  metadata?: Record<string, any>;
  syncedAt: string;
}

export interface DeviceAuthRequest {
  deviceType: 'apple_health' | 'google_fit' | 'fitbit' | 'samsung_health';
  authCode?: string;
  redirectUri?: string;
  deviceName: string;
  syncSettings: {
    autoSync: boolean;
    syncInterval: number;
    dataTypes: WearableDataType[];
  };
}

export interface DeviceAuthResponse {
  success: boolean;
  deviceConfig?: WearableDeviceConfig;
  authUrl?: string;
  message?: string;
}

export interface WearableSyncRequest {
  deviceConfigId: string;
  dataTypes?: WearableDataType[];
  startDate?: string;
  endDate?: string;
  forceSync?: boolean;
}

export interface WearableSyncResponse {
  success: boolean;
  deviceConfigId: string;
  syncedDataCount: number;
  lastSyncAt: string;
  errors?: string[];
  dataTypesProcessed: WearableDataType[];
}

export interface SyncStatus {
  deviceConfigId: string;
  deviceType: string;
  deviceName: string;
  isActive: boolean;
  lastSyncAt?: string;
  nextSyncAt?: string;
  syncInProgress: boolean;
  totalDataPoints: number;
  recentSyncCount: number;
  errors?: string[];
}

export interface DataTypeInfo {
  type: WearableDataType;
  name: string;
  unit: string;
  category: 'vital' | 'activity' | 'wellness' | 'body' | 'other';
}

export interface WearableInsights {
  deviceConfigId: string;
  period: 'daily' | 'weekly' | 'monthly';
  insights: {
    averageSteps?: number;
    averageHeartRate?: number;
    sleepQuality?: {
      averageDuration: number;
      averageEfficiency: number;
    };
    activityLevel?: 'low' | 'moderate' | 'high';
    trends: {
      dataType: WearableDataType;
      trend: 'increasing' | 'decreasing' | 'stable';
      changePercent: number;
    }[];
  };
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}