import { AppleHealthData, WearableDataType } from '../types/wearable';
export declare class AppleHealthService {
    static receiveHealthKitData(userId: string, deviceConfigId: string, healthKitData: AppleHealthData[]): Promise<{
        success: boolean;
        processedCount: number;
        errors: string[];
    }>;
    private static validateHealthKitData;
    private static validateHealthKitValue;
    private static mapHealthKitTypeToWearableType;
    private static normalizeHealthKitValue;
    private static standardizeUnit;
    static checkHealthKitPermissions(userId: string, deviceConfigId: string): Promise<{
        hasPermissions: boolean;
        grantedDataTypes: WearableDataType[];
        deniedDataTypes: WearableDataType[];
    }>;
    static getRealTimeSyncStatus(userId: string, deviceConfigId: string): Promise<{
        isRealTimeEnabled: boolean;
        lastSyncAt?: Date;
        syncFrequency: number;
        pendingDataCount: number;
    }>;
    static processPendingHealthKitData(userId: string, deviceConfigId: string): Promise<{
        processedCount: number;
        errors: string[];
    }>;
    static getLatestHealthKitData(userId: string, deviceConfigId: string, dataTypes: WearableDataType[]): Promise<Record<WearableDataType, any>>;
}
//# sourceMappingURL=appleHealthService.d.ts.map