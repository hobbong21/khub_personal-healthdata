import { PredictionResult, AIModelConfig } from '../types/ai';
export declare class AIService {
    static getPersonalizedInsights(userId: string): Promise<PredictionResult>;
    static generateHealthRiskPrediction(userId: string, predictionType: 'cardiovascular' | 'diabetes' | 'general_health'): Promise<PredictionResult>;
    static analyzeHealthDeterioration(userId: string): Promise<PredictionResult>;
    static performRiskFactorAnalysis(userId: string): Promise<PredictionResult>;
    static getPersonalizedRecommendations(userId: string): Promise<PredictionResult>;
    static getUserPredictionsHistory(userId: string, predictionType?: string, limit?: number): Promise<PredictionResult[]>;
    static getUserPredictionStats(userId: string): Promise<{
        totalPredictions: number;
        predictionsByType: Record<string, number>;
        averageConfidence: number;
        latestPredictionDate: Date | null;
    }>;
    static updateModelPerformance(modelId: string, accuracy: number): Promise<void>;
    static getAvailableModels(): Promise<AIModelConfig[]>;
    private static getUserHealthData;
    private static getUserHistoricalData;
    private static getUserMedicalHistory;
    private static getUserFamilyHistory;
    private static getUserGenomicData;
    private static processVitalSigns;
    private static calculateAge;
    private static getHighestAlertLevel;
    private static calculatePatternsConfidence;
    private static generateRecommendations;
}
export default AIService;
//# sourceMappingURL=aiService.d.ts.map