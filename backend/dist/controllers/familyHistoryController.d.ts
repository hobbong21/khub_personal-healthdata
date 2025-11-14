import { Request, Response } from 'express';
export declare class FamilyHistoryController {
    static createFamilyMember(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFamilyMembers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFamilyMemberById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateFamilyMember(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static deleteFamilyMember(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFamilyTree(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFamilyMembersByGeneration(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFamilyMembersWithCondition(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFamilyHistoryStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getGeneticConditions(req: Request, res: Response): Promise<void>;
    static getFamilyRiskAssessments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getRiskAssessmentForCondition(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static calculateComprehensiveRiskAssessment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getHighRiskAssessments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static calculateGeneticRiskScore(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFamilyHealthSummary(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static initializeGeneticConditions(req: Request, res: Response): Promise<void>;
}
export default FamilyHistoryController;
//# sourceMappingURL=familyHistoryController.d.ts.map