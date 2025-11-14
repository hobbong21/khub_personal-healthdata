import { CreateMedicalRecordRequest, UpdateMedicalRecordRequest, MedicalRecordResponse, MedicalRecordFilters, MedicalRecordListResponse, MedicalRecordStats, MedicalRecordValidationResult, MedicalRecordTimelineItem, MedicalRecordSearchResult, ICD10Code } from '../types/medical';
export declare class MedicalRecordModel {
    static create(userId: string, recordData: CreateMedicalRecordRequest): Promise<MedicalRecordResponse>;
    static findById(id: string, userId: string): Promise<MedicalRecordResponse | null>;
    static findByUserId(userId: string, filters?: MedicalRecordFilters, page?: number, limit?: number): Promise<MedicalRecordListResponse>;
    static update(id: string, userId: string, updateData: UpdateMedicalRecordRequest): Promise<MedicalRecordResponse | null>;
    static delete(id: string, userId: string): Promise<boolean>;
    static getStats(userId: string): Promise<MedicalRecordStats>;
    static getTimeline(userId: string): Promise<MedicalRecordTimelineItem[]>;
    static search(userId: string, searchTerm: string): Promise<MedicalRecordSearchResult>;
    static validateMedicalRecord(recordData: CreateMedicalRecordRequest): MedicalRecordValidationResult;
    static searchICD10Codes(searchTerm: string): Promise<ICD10Code[]>;
    static getICD10CodeDetails(code: string): Promise<ICD10Code | null>;
    static validateICD10Code(code: string): {
        isValid: boolean;
        normalizedCode?: string;
        suggestions?: ICD10Code[];
        error?: string;
    };
    private static generateSearchSuggestions;
    private static formatMedicalRecord;
}
//# sourceMappingURL=MedicalRecord.d.ts.map