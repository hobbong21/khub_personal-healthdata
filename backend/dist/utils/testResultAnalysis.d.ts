import { TestItem, TestResultStatus, TestCategory } from '../types/medical';
export declare class TestResultAnalysis {
    static determineOverallStatus(testItems: TestItem[]): TestResultStatus;
    static analyzeTestItems(testItems: TestItem[], testName: string, testCategory: TestCategory, age?: number, gender?: 'male' | 'female'): Promise<TestItem[]>;
    private static generateFlags;
    static getRecommendedFrequency(testCategory: TestCategory, testName: string, age: number): string;
    static generateInterpretation(testItems: TestItem[], testCategory: TestCategory): string[];
    private static interpretBloodTest;
    private static interpretUrineTest;
    static generateSummary(testItems: TestItem[]): {
        totalItems: number;
        normalCount: number;
        abnormalCount: number;
        criticalCount: number;
        keyFindings: string[];
    };
}
//# sourceMappingURL=testResultAnalysis.d.ts.map