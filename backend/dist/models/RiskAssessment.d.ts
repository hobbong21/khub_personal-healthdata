import { RiskAssessmentInput, RiskAssessmentResult, RiskCalculationInput, SupportedDisease } from '../types/genomics';
export declare class RiskAssessment {
    static create(data: RiskAssessmentInput & {
        userId: string;
    }): Promise<{
        id: string;
        userId: string;
        calculatedAt: Date;
        genomicDataId: string | null;
        diseaseType: string;
        riskScore: number;
        percentile: number | null;
        contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static findByUserId(userId: string): Promise<({
        genomicData: {
            id: string;
            uploadedAt: Date;
            sourcePlatform: string;
        };
    } & {
        id: string;
        userId: string;
        calculatedAt: Date;
        genomicDataId: string | null;
        diseaseType: string;
        riskScore: number;
        percentile: number | null;
        contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    static findByUserIdAndDisease(userId: string, diseaseType: string): Promise<({
        genomicData: {
            id: string;
            uploadedAt: Date;
            sourcePlatform: string;
        };
    } & {
        id: string;
        userId: string;
        calculatedAt: Date;
        genomicDataId: string | null;
        diseaseType: string;
        riskScore: number;
        percentile: number | null;
        contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    static update(id: string, data: Partial<RiskAssessmentInput>): Promise<{
        id: string;
        userId: string;
        calculatedAt: Date;
        genomicDataId: string | null;
        diseaseType: string;
        riskScore: number;
        percentile: number | null;
        contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static delete(id: string): Promise<{
        id: string;
        userId: string;
        calculatedAt: Date;
        genomicDataId: string | null;
        diseaseType: string;
        riskScore: number;
        percentile: number | null;
        contributingFactors: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    static calculateGeneticRisk(input: RiskCalculationInput): Promise<number>;
    static calculateLifestyleRisk(input: RiskCalculationInput): Promise<number>;
    static calculateFamilyHistoryRisk(input: RiskCalculationInput): Promise<number>;
    static calculateAgeGenderRisk(input: RiskCalculationInput): Promise<number>;
    static calculateComprehensiveRisk(input: RiskCalculationInput): Promise<RiskAssessmentResult>;
    private static calculatePercentile;
    private static generateRecommendations;
    static getPopulationRiskDistribution(diseaseType: string): Promise<{
        mean: number;
        median: number;
        percentiles: {
            10: number;
            25: number;
            50: number;
            75: number;
            90: number;
            95: number;
        };
    }>;
    static bulkCalculateRisks(userId: string, diseaseTypes: SupportedDisease[]): Promise<RiskAssessmentResult[]>;
}
//# sourceMappingURL=RiskAssessment.d.ts.map