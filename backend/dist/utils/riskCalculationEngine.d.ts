import { RiskCalculationInput, DiseaseRiskFactors } from '../types/genomics';
export declare class RiskCalculationEngine {
    static calculateCardiovascularRisk(input: RiskCalculationInput): Promise<DiseaseRiskFactors>;
    static calculateDiabetesRisk(input: RiskCalculationInput): Promise<DiseaseRiskFactors>;
    static calculateAlzheimerRisk(input: RiskCalculationInput): Promise<DiseaseRiskFactors>;
    static calculateCancerRisk(input: RiskCalculationInput, cancerType: 'breast' | 'prostate' | 'colorectal' | 'lung'): Promise<DiseaseRiskFactors>;
    static calculateIntegratedRisk(input: RiskCalculationInput): Promise<number>;
    private static getWeightsForDisease;
    static calculatePercentile(riskScore: number, diseaseType: string, userAge: number, userGender: string): number;
    private static getPopulationRiskData;
    static generateRiskRecommendations(diseaseType: string, riskFactors: DiseaseRiskFactors, riskScore: number): string[];
}
//# sourceMappingURL=riskCalculationEngine.d.ts.map