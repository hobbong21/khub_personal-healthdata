import { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest, FamilyTreeNode, FamilyHistoryStats, FamilyRiskAssessment, GeneticCondition } from '../types/familyHistory';
export declare class FamilyHistoryService {
    static createFamilyMember(userId: string, data: CreateFamilyMemberRequest): Promise<FamilyMember>;
    static getFamilyMembers(userId: string): Promise<FamilyMember[]>;
    static getFamilyMemberById(id: string, userId: string): Promise<FamilyMember | null>;
    static updateFamilyMember(id: string, userId: string, data: UpdateFamilyMemberRequest): Promise<FamilyMember | null>;
    static deleteFamilyMember(id: string, userId: string): Promise<boolean>;
    static getFamilyTree(userId: string): Promise<FamilyTreeNode[]>;
    static getFamilyMembersByGeneration(userId: string, generation: number): Promise<FamilyMember[]>;
    static getFamilyMembersWithCondition(userId: string, conditionName: string): Promise<FamilyMember[]>;
    static getFamilyHistoryStats(userId: string): Promise<FamilyHistoryStats>;
    static getGeneticConditions(): Promise<GeneticCondition[]>;
    static getGeneticConditionsByCategory(category: string): Promise<GeneticCondition[]>;
    static searchGeneticConditions(searchTerm: string): Promise<GeneticCondition[]>;
    static getFamilyRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]>;
    static getRiskAssessmentForCondition(userId: string, conditionName: string): Promise<FamilyRiskAssessment | null>;
    static calculateComprehensiveRiskAssessment(userId: string): Promise<FamilyRiskAssessment[]>;
    static getHighRiskAssessments(userId: string): Promise<FamilyRiskAssessment[]>;
    static calculateGeneticRiskScore(userId: string, conditionName: string): Promise<number>;
    static getFamilyHealthSummary(userId: string): Promise<{
        overview: {
            totalMembers: number;
            livingMembers: number;
            deceasedMembers: number;
            generationsTracked: number;
        };
        riskProfile: {
            highRiskConditions: number;
            totalAssessments: number;
            topRisks: FamilyRiskAssessment[];
        };
        familyPatterns: {
            commonConditions: {
                condition: string;
                count: number;
                members: string[];
            }[];
            hereditaryRisk: number;
        };
    }>;
    static initializeGeneticConditions(): Promise<void>;
    private static recalculateAllRiskAssessments;
}
export default FamilyHistoryService;
//# sourceMappingURL=familyHistoryService.d.ts.map