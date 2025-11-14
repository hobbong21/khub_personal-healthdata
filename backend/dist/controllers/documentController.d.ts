import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    userId?: string;
}
export declare class DocumentController {
    static uploadMiddleware: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static uploadDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
    static searchDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDocumentStats(req: AuthenticatedRequest, res: Response): Promise<void>;
    static processOCR(req: AuthenticatedRequest, res: Response): Promise<void>;
    static downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDocumentsByCategory(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getDocumentPreviewUrl(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=documentController.d.ts.map