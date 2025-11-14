import { CreateTestResultRequest, TestResultResponse, TestResultFilters, TestResultListResponse, TestResultTrend, TestResultComparison, TestResultStats } from '../types/medical';
export declare class TestResultModel {
    static create(medicalRecordId: string, data: CreateTestResultRequest): Promise<TestResultResponse>;
    static findById(id: string): Promise<TestResultResponse | null>;
    static findByUserId(userId: string, filters?: TestResultFilters, page?: number, limit?: number): Promise<TestResultListResponse>;
    static getTrends(userId: string, testNames: string[]): Promise<TestResultTrend[]>;
    static compareResults(userId: string, testName: string): Promise<TestResultComparison | null>;
    static getStats(userId: string): Promise<TestResultStats>;
    private static formatTestResult;
    private static calculateSummary;
    private static calculateTrend;
    private static calculateYearOverYearChange;
    private static getTestsByCategory;
    private static getTestsByStatus;
    private static getRecentAbnormalResults;
    private static getCommonTests;
}
//# sourceMappingURL=TestResult.d.ts.map