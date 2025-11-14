import { WearableDeviceConfig, WearableSyncRequest, WearableSyncResponse, DeviceAuthRequest, DeviceAuthResponse, SyncStatus } from '../types/wearable';
export declare class WearableService {
    static authenticateDevice(userId: string, authRequest: DeviceAuthRequest): Promise<DeviceAuthResponse>;
    private static authenticateAppleHealth;
    private static authenticateGoogleFit;
    private static authenticateFitbit;
    private static authenticateSamsungHealth;
    static syncWearableData(userId: string, syncRequest: WearableSyncRequest): Promise<WearableSyncResponse>;
    private static fetchWearableData;
    private static fetchAppleHealthData;
    private static fetchGoogleFitData;
    private static fetchFitbitData;
    private static fetchSamsungHealthData;
    private static normalizeWearableData;
    private static saveWearableData;
    private static convertToHealthRecords;
    static getUserDevices(userId: string): Promise<WearableDeviceConfig[]>;
    static updateDeviceConfig(userId: string, deviceConfigId: string, updates: Partial<Pick<WearableDeviceConfig, 'deviceName' | 'isActive' | 'syncSettings'>>): Promise<WearableDeviceConfig>;
    static disconnectDevice(userId: string, deviceConfigId: string): Promise<void>;
    static getSyncStatus(userId: string): Promise<SyncStatus[]>;
    private static exchangeGoogleFitTokens;
    private static exchangeFitbitTokens;
    private static exchangeSamsungHealthTokens;
    private static refreshGoogleFitToken;
    private static refreshFitbitToken;
    private static mapDataTypeToAppleHealth;
    private static getGoogleFitDataSourceId;
    private static getFitbitEndpoint;
    private static formatFitbitDateRange;
    private static parseFitbitResponse;
    private static getStandardUnit;
    private static mapToVitalSignType;
    private static generateMockGoogleFitData;
    private static generateMockFitbitData;
    private static generateMockSamsungHealthData;
}
//# sourceMappingURL=wearableService.d.ts.map