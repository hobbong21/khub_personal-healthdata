import { WearableDataType, WearableDataNormalized } from '../types/wearable';
export declare class GoogleFitDataNormalizer {
    static normalizeGoogleFitData(rawData: any[], dataType: WearableDataType, deviceName?: string): WearableDataNormalized[];
    private static normalizeDataPoint;
    private static convertIntValue;
    private static convertFloatValue;
    private static convertStringValue;
    private static convertMapValue;
    private static getStandardUnit;
    private static extractAppName;
    private static getAppNameFromPackage;
    static validateDataQuality(normalizedData: WearableDataNormalized[]): {
        valid: WearableDataNormalized[];
        invalid: {
            data: WearableDataNormalized;
            reason: string;
        }[];
    };
    private static validateSingleDataPoint;
    private static validateValueRange;
}
//# sourceMappingURL=googleFitDataNormalizer.d.ts.map