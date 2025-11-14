import { Request, Response } from 'express';
export declare class GenomicsController {
    static uploadGenomicData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getGenomicData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getGenomicDataById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteGenomicData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPharmacogenomics(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getDiseaseRisks(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getTraits(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static calculateRiskAssessment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getRiskAssessments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static bulkCalculateRisks(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static reanalyzeGenomicData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getSupportedFeatures(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=genomicsController.d.ts.map