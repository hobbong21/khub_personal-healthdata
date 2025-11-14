import { WearableDataType, WearableDataNormalized, WearableSyncResponse } from '../types/wearable';
export declare class GoogleFitService {
    private oauth2Client;
    private fitness;
    constructor();
    generateAuthUrl(): string;
    exchangeCodeForTokens(code: string): Promise<{
        accessToken: string;
        refreshToken: string;
        expiryDate: number;
    }>;
    setCredentials(accessToken: string, refreshToken: string): void;
    refreshAccessToken(): Promise<{
        accessToken: string;
        expiryDate: number;
    }>;
    getDataSources(): Promise<any[]>;
    getDataByType(dataType: WearableDataType, startTime: Date, endTime: Date): Promise<WearableDataNormalized[]>;
    syncMultipleDataTypes(dataTypes: WearableDataType[], startTime: Date, endTime: Date): Promise<WearableSyncResponse>;
    subscribeToDataUpdates(dataTypes: WearableDataType[]): Promise<void>;
    private mapDataTypeToGoogleFit;
    private getBucketDuration;
    private extractDataPoints;
    getUserProfile(): Promise<{
        displayName?: string;
        givenName?: string;
        familyName?: string;
    }>;
    getLatestDataFromSource(dataSourceId: string, limit?: number): Promise<any[]>;
    checkConnection(): Promise<boolean>;
    getSyncStatus(): Promise<{
        isConnected: boolean;
        lastSyncTime?: Date;
        availableDataTypes: string[];
        totalDataSources: number;
    }>;
}
//# sourceMappingURL=googleFitService.d.ts.map