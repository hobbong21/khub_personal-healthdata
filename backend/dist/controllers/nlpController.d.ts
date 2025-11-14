import { Request, Response } from 'express';
export declare class NLPController {
    static analyzeMedicalDocument(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static extractMedicalInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static processChatbotQuery(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static analyzeSymptoms(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static processBatchDocuments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getChatbotHistory(req: Request, res: Response): Promise<void>;
    static startChatbotConversation(req: Request, res: Response): Promise<void>;
    static analyzeTextEntities(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getNLPStats(req: Request, res: Response): Promise<void>;
    static testNLPConfiguration(req: Request, res: Response): Promise<void>;
}
export default NLPController;
//# sourceMappingURL=nlpController.d.ts.map