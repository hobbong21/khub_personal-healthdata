import { Request, Response } from 'express';
export declare class RecommendationController {
    static generateRecommendations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getLatestRecommendations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getRecommendationsHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static trackImplementation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static submitFeedback(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateAdherence(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static recordOutcome(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getEffectivenessData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getRecommendationStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getLifestyleSuggestions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getScreeningSchedule(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=recommendationController.d.ts.map