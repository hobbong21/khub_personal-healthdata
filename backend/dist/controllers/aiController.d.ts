import { Request, Response } from 'express';
export declare class AIController {
    static generateRiskPrediction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static analyzeDeterioration(req: Request, res: Response): Promise<void>;
    static analyzeRiskFactors(req: Request, res: Response): Promise<void>;
    static getRecommendations(req: Request, res: Response): Promise<void>;
    static getPredictionsHistory(req: Request, res: Response): Promise<void>;
    static getPredictionStats(req: Request, res: Response): Promise<void>;
    static getPredictionById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAvailableModels(req: Request, res: Response): Promise<void>;
    static createModel(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateModelPerformance(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getHealthInsights(req: Request, res: Response): Promise<void>;
    static batchPrediction(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default AIController;
//# sourceMappingURL=aiController.d.ts.map