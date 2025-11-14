import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    userId?: string;
}
export declare class MedicalController {
    static createMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMedicalRecords(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMedicalRecordStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMedicalRecordTimeline(req: AuthenticatedRequest, res: Response): Promise<void>;
    static searchMedicalRecords(req: AuthenticatedRequest, res: Response): Promise<void>;
    static searchICD10Codes(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDepartmentStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMonthlyStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getRecentMedicalRecords(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMedicalRecordsByHospital(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMedicalRecordsByDepartment(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getMedicalRecordsByDateRange(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createTestResult(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTestResult(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTestResults(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTestResultTrends(req: AuthenticatedRequest, res: Response): Promise<void>;
    static compareTestResults(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTestResultStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAbnormalTestResults(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTestResultInterpretation(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTestResultsByCategory(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=medicalController.d.ts.map