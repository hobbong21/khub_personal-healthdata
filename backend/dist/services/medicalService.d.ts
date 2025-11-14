import { CreateMedicalRecordRequest, UpdateMedicalRecordRequest, MedicalRecordResponse, MedicalRecordFilters, MedicalRecordListResponse, MedicalRecordStats, MedicalRecordTimelineItem, MedicalRecordSearchResult, ICD10Code } from '../types/medical';
export declare class MedicalService {
    static createMedicalRecord(userId: string, recordData: CreateMedicalRecordRequest): Promise<MedicalRecordResponse>;
    static getMedicalRecord(id: string, userId: string): Promise<MedicalRecordResponse>;
    static getMedicalRecords(userId: string, filters?: MedicalRecordFilters, page?: number, limit?: number): Promise<MedicalRecordListResponse>;
    static updateMedicalRecord(id: string, userId: string, updateData: UpdateMedicalRecordRequest): Promise<MedicalRecordResponse>;
    static deleteMedicalRecord(id: string, userId: string): Promise<void>;
    static getMedicalRecordStats(userId: string): Promise<MedicalRecordStats>;
    static getMedicalRecordTimeline(userId: string): Promise<MedicalRecordTimelineItem[]>;
    static searchMedicalRecords(userId: string, searchTerm: string): Promise<MedicalRecordSearchResult>;
    static searchICD10Codes(searchTerm: string): Promise<ICD10Code[]>;
    static getDepartmentStats(userId: string): Promise<Array<{
        department: string;
        count: number;
        totalCost: number;
        lastVisit: Date;
    }>>;
    static getMonthlyStats(userId: string, year: number): Promise<Array<{
        month: number;
        visitCount: number;
        totalCost: number;
        departments: string[];
    }>>;
    static getRecentMedicalRecords(userId: string, limit?: number): Promise<MedicalRecordResponse[]>;
    static getMedicalRecordsByHospital(userId: string, hospitalName: string, page?: number, limit?: number): Promise<MedicalRecordListResponse>;
    static getMedicalRecordsByDepartment(userId: string, department: string, page?: number, limit?: number): Promise<MedicalRecordListResponse>;
    static getMedicalRecordsByDateRange(userId: string, startDate: string, endDate: string, page?: number, limit?: number): Promise<MedicalRecordListResponse>;
}
//# sourceMappingURL=medicalService.d.ts.map