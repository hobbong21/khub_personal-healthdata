export interface WearableDeviceConfig {
    id: string;
    userId: string;
    deviceType: 'apple_health' | 'google_fit' | 'fitbit' | 'samsung_health';
    deviceName: string;
    isActive: boolean;
    accessToken?: string | null;
    refreshToken?: string | null;
    lastSyncAt?: Date | null;
    syncSettings: {
        autoSync: boolean;
        syncInterval: number;
        dataTypes: WearableDataType[];
    } | null;
    createdAt: Date;
    updatedAt: Date;
}
export type WearableDataType = 'heart_rate' | 'steps' | 'calories' | 'sleep' | 'weight' | 'blood_pressure' | 'blood_oxygen' | 'body_temperature' | 'exercise_sessions' | 'distance' | 'floors_climbed';
export interface WearableDataPoint {
    id: string;
    deviceConfigId: string;
    dataType: WearableDataType;
    value: number | object;
    unit: string;
    startTime: Date;
    endTime?: Date;
    sourceApp?: string;
    metadata?: Record<string, any>;
    syncedAt: Date;
}
export interface AppleHealthData {
    type: string;
    value: number;
    unit: string;
    startDate: string;
    endDate: string;
    sourceName: string;
    sourceVersion?: string;
    device?: string;
    metadata?: Record<string, any>;
}
export interface GoogleFitData {
    dataTypeName: string;
    value: number | object;
    startTimeNanos: string;
    endTimeNanos: string;
    dataSourceId: string;
    originDataSourceId?: string;
    metadata?: Record<string, any>;
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
    lastSyncAt: Date;
    errors?: string[];
    dataTypesProcessed: WearableDataType[];
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
export interface WearableDataNormalized {
    type: WearableDataType;
    value: number | object;
    unit: string;
    timestamp: Date;
    duration?: number;
    source: {
        deviceType: string;
        deviceName: string;
        appName?: string;
    };
    metadata?: Record<string, any>;
}
export interface SyncStatus {
    deviceConfigId: string;
    deviceType: string;
    deviceName: string;
    isActive: boolean;
    lastSyncAt?: Date;
    nextSyncAt?: Date;
    syncInProgress: boolean;
    totalDataPoints: number;
    recentSyncCount: number;
    errors?: string[];
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
    generatedAt: Date;
}
//# sourceMappingURL=wearable.d.ts.map