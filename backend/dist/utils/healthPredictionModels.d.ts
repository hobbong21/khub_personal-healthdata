import { HealthRiskPrediction, HealthDeteriorationPattern } from '../types/ai';
export interface HealthDataInput {
    age: number;
    gender: 'male' | 'female';
    bmi: number;
    systolicBP: number;
    diastolicBP: number;
    heartRate: number;
    bloodSugar: number;
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
    exerciseFrequency: number;
    sleepHours: number;
    stressLevel: number;
    hasHypertension: boolean;
    hasDiabetes: boolean;
    hasHeartDisease: boolean;
    hasHighCholesterol: boolean;
    familyHistoryCardiovascular: boolean;
    familyHistoryDiabetes: boolean;
    familyHistoryCancer: boolean;
    cholesterolTotal?: number;
    cholesterolLDL?: number;
    cholesterolHDL?: number;
    triglycerides?: number;
    hba1c?: number;
}
export declare class DiseasePredictionModel {
    static predictCardiovascularRisk(data: HealthDataInput): HealthRiskPrediction;
    static predictDiabetesRisk(data: HealthDataInput): HealthRiskPrediction;
    static predictHealthDeterioration(data: HealthDataInput): HealthRiskPrediction;
    private static getRiskLevel;
    private static calculateLifestyleRisk;
    private static calculateMedicalHistoryRisk;
    private static getCardiovascularRecommendations;
    private static getDiabetesRecommendations;
    private static getGeneralHealthRecommendations;
}
export declare class HealthDeteriorationDetector {
    static analyzeHealthTrends(historicalData: Array<{
        date: Date;
        vitalSigns: Record<string, number>;
        symptoms: string[];
        overallCondition: number;
    }>): HealthDeteriorationPattern[];
    private static analyzeVitalSignsTrends;
    private static analyzeSymptomPatterns;
    private static analyzeOverallConditionTrend;
    private static calculateTrend;
    private static assessTrendSeverity;
}
declare const _default: {
    DiseasePredictionModel: typeof DiseasePredictionModel;
    HealthDeteriorationDetector: typeof HealthDeteriorationDetector;
};
export default _default;
//# sourceMappingURL=healthPredictionModels.d.ts.map