export interface DataAnonymizationLog {
    id: string;
    userId: string;
    anonymizedUserId: string;
    dataTypes: string[];
    anonymizationMethod: string;
    purpose: string;
    createdAt: Date;
}
export interface AnonymizedData {
    anonymizedUserId: string;
    dataType: string;
    anonymizedData: any;
    originalDataHash: string;
    anonymizationMethod: string;
    qualityScore: number;
}
export declare class DataAnonymizationModel {
    static anonymizeUserData(userId: string, dataTypes: string[], purpose: string, anonymizationMethod?: string): Promise<{
        anonymizedUserId: string;
        anonymizedData: AnonymizedData[];
        log: DataAnonymizationLog;
    }>;
    private static generateAnonymizedUserId;
    private static fetchOriginalData;
    private static anonymizeDataByType;
    private static applyKAnonymity;
    private static applyLDiversity;
    private static applyTCloseness;
    private static applyDifferentialPrivacy;
    private static applyBasicAnonymization;
    private static generalizeNumericValue;
    private static generalizeHospitalName;
    private static generalizeDiagnosisCode;
    private static maskGenomicData;
    private static ensureDiversity;
    private static ensureCloseness;
    private static generateLaplaceNoise;
    private static hashData;
    private static calculateDataQuality;
    private static calculateInformationLoss;
    static getAnonymizationLogs(userId?: string, purpose?: string, limit?: number): Promise<DataAnonymizationLog[]>;
    static getAnonymizationStats(): Promise<{
        totalAnonymizations: number;
        dataTypeStats: Record<string, number>;
        purposeStats: Record<string, number>;
        qualityStats: {
            averageQuality: number;
            highQualityCount: number;
            mediumQualityCount: number;
            lowQualityCount: number;
        };
    }>;
}
//# sourceMappingURL=DataAnonymization.d.ts.map