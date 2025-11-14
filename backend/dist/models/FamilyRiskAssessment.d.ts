import { FamilyRiskAssessment } from '../types/familyHistory';
export declare class FamilyRiskAssessmentModel {
    static calculateFamilyRiskAssessment(userId: string, conditionName: string): Promise<FamilyRiskAssessment>;
    static getFamilyRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]>;
    static getRiskAssessmentForCondition(userId: string, conditionName: string): Promise<FamilyRiskAssessment | null>;
    static getHighRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]>;
    static calculateComprehensiveRiskAssessment(userId: string): Promise<FamilyRiskAssessment[]>;
    static deleteRiskAssessment(id: string, userId: string): Promise<boolean>;
    private static calculateRiskScore;
    private static determineRiskLevel;
    private static generateRecommendations;
    private static mapPrismaToFamilyRiskAssessment;
}
export default FamilyRiskAssessmentModel;
//# sourceMappingURL=FamilyRiskAssessment.d.ts.map