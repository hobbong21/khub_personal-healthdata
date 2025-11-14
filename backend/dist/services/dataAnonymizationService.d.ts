import { DataAnonymizationLog, AnonymizedData } from '../models/DataAnonymization';
export declare const DataAnonymizationService: {
    anonymizeUserData(userId: string, dataTypes: string[], purpose: string, anonymizationMethod: string): Promise<{
        anonymizedUserId: string;
        anonymizedData: AnonymizedData[];
        log: DataAnonymizationLog;
    }>;
    getAnonymizationLogs(userId?: string, purpose?: string, limit?: number): Promise<DataAnonymizationLog[]>;
    getAnonymizationStats(): Promise<any>;
};
//# sourceMappingURL=dataAnonymizationService.d.ts.map