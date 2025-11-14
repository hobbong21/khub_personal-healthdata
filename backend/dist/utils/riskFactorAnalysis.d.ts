import { HealthDataInput } from './healthPredictionModels';
export interface RiskFactor {
    id: string;
    name: string;
    category: 'lifestyle' | 'medical' | 'genetic' | 'environmental';
    severity: 'low' | 'moderate' | 'high' | 'critical';
    impact: number;
    modifiable: boolean;
    description: string;
    recommendations: string[];
    timeToImpact: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
}
export interface RiskFactorAnalysis {
    totalRiskScore: number;
    riskFactors: RiskFactor[];
    protectiveFactors: RiskFactor[];
    priorityActions: string[];
    riskTrend: 'increasing' | 'stable' | 'decreasing';
}
export declare class RiskFactorIdentifier {
    static analyzeRiskFactors(healthData: HealthDataInput, medicalHistory?: any[], familyHistory?: any[], genomicData?: any): RiskFactorAnalysis;
    private static analyzeLifestyleFactors;
    private static analyzeMedicalFactors;
    private static analyzeGeneticFactors;
    private static calculateTotalRiskScore;
    private static generatePriorityActions;
    private static assessRiskTrend;
}
export default RiskFactorIdentifier;
//# sourceMappingURL=riskFactorAnalysis.d.ts.map