import { GeneticCondition } from '../types/familyHistory';
export declare class GeneticConditionModel {
    static createGeneticCondition(data: Omit<GeneticCondition, 'id' | 'createdAt' | 'updatedAt'>): Promise<GeneticCondition>;
    static getAllGeneticConditions(): Promise<GeneticCondition[]>;
    static getGeneticConditionsByCategory(category: string): Promise<GeneticCondition[]>;
    static getHereditaryConditions(): Promise<GeneticCondition[]>;
    static searchGeneticConditions(searchTerm: string): Promise<GeneticCondition[]>;
    static getGeneticConditionByName(name: string): Promise<GeneticCondition | null>;
    static updateGeneticCondition(id: string, data: Partial<Omit<GeneticCondition, 'id' | 'createdAt' | 'updatedAt'>>): Promise<GeneticCondition | null>;
    static deleteGeneticCondition(id: string): Promise<boolean>;
    static getConditionsByInheritancePattern(pattern: string): Promise<GeneticCondition[]>;
    static getHighRiskConditions(minPrevalence?: number, minPenetrance?: number): Promise<GeneticCondition[]>;
    static seedCommonGeneticConditions(): Promise<void>;
    private static mapPrismaToGeneticCondition;
}
export default GeneticConditionModel;
//# sourceMappingURL=GeneticCondition.d.ts.map