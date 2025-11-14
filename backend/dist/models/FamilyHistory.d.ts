import { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest, FamilyTreeNode } from '../types/familyHistory';
export declare class FamilyHistoryModel {
    static createFamilyMember(userId: string, data: CreateFamilyMemberRequest): Promise<FamilyMember>;
    static getFamilyMembers(userId: string): Promise<FamilyMember[]>;
    static getFamilyMemberById(id: string, userId: string): Promise<FamilyMember | null>;
    static updateFamilyMember(id: string, userId: string, data: UpdateFamilyMemberRequest): Promise<FamilyMember | null>;
    static deleteFamilyMember(id: string, userId: string): Promise<boolean>;
    static getFamilyTree(userId: string): Promise<FamilyTreeNode[]>;
    static getFamilyMembersByGeneration(userId: string, generation: number): Promise<FamilyMember[]>;
    static getFamilyMembersWithCondition(userId: string, conditionName: string): Promise<FamilyMember[]>;
    static getCommonFamilyConditions(userId: string): Promise<Array<{
        condition: string;
        count: number;
        members: string[];
    }>>;
    static getFamilyHistoryStats(userId: string): Promise<{
        totalMembers: number;
        livingMembers: number;
        deceasedMembers: number;
        generationsTracked: number;
        commonConditions: {
            condition: string;
            count: number;
            percentage: number;
        }[];
    }>;
    private static getGenerationFromRelationship;
    private static getNextPositionInGeneration;
    private static mapPrismaToFamilyMember;
}
export default FamilyHistoryModel;
//# sourceMappingURL=FamilyHistory.d.ts.map