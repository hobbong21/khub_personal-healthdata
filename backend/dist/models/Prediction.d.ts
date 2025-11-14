import { PredictionResult } from '../types/ai';
export declare class PredictionManager {
    static createPrediction(userId: string, aiModelId: string, predictionType: string, inputData: Record<string, any>, predictionResult: any, confidenceScore: number): Promise<PredictionResult>;
    static getUserPredictions(userId: string, predictionType?: string, limit?: number): Promise<PredictionResult[]>;
    static getPredictionById(id: string): Promise<PredictionResult | null>;
    static getLatestPrediction(userId: string, predictionType: string): Promise<PredictionResult | null>;
    static deleteOldPredictions(daysOld?: number): Promise<number>;
    static getPredictionStats(userId: string): Promise<{
        totalPredictions: number;
        predictionsByType: Record<string, number>;
        averageConfidence: number;
        latestPredictionDate: Date | null;
    }>;
}
export default PredictionManager;
//# sourceMappingURL=Prediction.d.ts.map