export interface FamilyMember {
    id: string;
    userId: string;
    relationship: string;
    name?: string;
    gender?: 'male' | 'female' | 'unknown';
    birthYear?: number;
    deathYear?: number;
    isAlive: boolean;
    generation: number;
    position: number;
    parentId?: string;
    conditions?: MedicalCondition[];
    causeOfDeath?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface MedicalCondition {
    name: string;
    diagnosedYear?: number;
    severity?: 'mild' | 'moderate' | 'severe';
    status?: 'active' | 'resolved' | 'managed';
    notes?: string;
}
export interface GeneticCondition {
    id: string;
    name: string;
    icd10Code?: string;
    category: string;
    inheritancePattern?: 'autosomal_dominant' | 'autosomal_recessive' | 'x_linked' | 'mitochondrial' | 'multifactorial';
    prevalence?: number;
    penetrance?: number;
    description?: string;
    riskFactors?: string[];
    symptoms?: string[];
    isHereditary: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface FamilyRiskAssessment {
    id: string;
    userId: string;
    conditionName: string;
    familyRiskScore: number;
    affectedRelatives: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    recommendations?: string[];
    calculatedAt: Date;
}
export interface FamilyTreeNode {
    id: string;
    name?: string;
    gender?: 'male' | 'female' | 'unknown';
    relationship: string;
    generation: number;
    position: number;
    isAlive: boolean;
    birthYear?: number;
    deathYear?: number;
    conditions: MedicalCondition[];
    children: FamilyTreeNode[];
    x?: number;
    y?: number;
}
export interface CreateFamilyMemberRequest {
    relationship: string;
    name?: string;
    gender?: 'male' | 'female' | 'unknown';
    birthYear?: number;
    deathYear?: number;
    isAlive?: boolean;
    generation?: number;
    position?: number;
    parentId?: string;
    conditions?: MedicalCondition[];
    causeOfDeath?: string;
    notes?: string;
}
export interface UpdateFamilyMemberRequest {
    relationship?: string;
    name?: string;
    gender?: 'male' | 'female' | 'unknown';
    birthYear?: number;
    deathYear?: number;
    isAlive?: boolean;
    generation?: number;
    position?: number;
    parentId?: string;
    conditions?: MedicalCondition[];
    causeOfDeath?: string;
    notes?: string;
}
export interface FamilyHistoryStats {
    totalMembers: number;
    livingMembers: number;
    deceasedMembers: number;
    generationsTracked: number;
    commonConditions: Array<{
        condition: string;
        count: number;
        percentage: number;
    }>;
    riskAssessments: FamilyRiskAssessment[];
}
export declare const FAMILY_RELATIONSHIPS: {
    readonly PATERNAL_GRANDFATHER: "paternal_grandfather";
    readonly PATERNAL_GRANDMOTHER: "paternal_grandmother";
    readonly MATERNAL_GRANDFATHER: "maternal_grandfather";
    readonly MATERNAL_GRANDMOTHER: "maternal_grandmother";
    readonly FATHER: "father";
    readonly MOTHER: "mother";
    readonly STEPFATHER: "stepfather";
    readonly STEPMOTHER: "stepmother";
    readonly BROTHER: "brother";
    readonly SISTER: "sister";
    readonly HALF_BROTHER: "half_brother";
    readonly HALF_SISTER: "half_sister";
    readonly STEPBROTHER: "stepbrother";
    readonly STEPSISTER: "stepsister";
    readonly SON: "son";
    readonly DAUGHTER: "daughter";
    readonly STEPSON: "stepson";
    readonly STEPDAUGHTER: "stepdaughter";
    readonly GRANDSON: "grandson";
    readonly GRANDDAUGHTER: "granddaughter";
    readonly UNCLE: "uncle";
    readonly AUNT: "aunt";
    readonly COUSIN: "cousin";
    readonly NEPHEW: "nephew";
    readonly NIECE: "niece";
};
export type FamilyRelationship = typeof FAMILY_RELATIONSHIPS[keyof typeof FAMILY_RELATIONSHIPS];
export declare const GENETIC_CONDITION_CATEGORIES: {
    readonly CARDIOVASCULAR: "cardiovascular";
    readonly CANCER: "cancer";
    readonly NEUROLOGICAL: "neurological";
    readonly METABOLIC: "metabolic";
    readonly AUTOIMMUNE: "autoimmune";
    readonly MENTAL_HEALTH: "mental_health";
    readonly RESPIRATORY: "respiratory";
    readonly ENDOCRINE: "endocrine";
    readonly MUSCULOSKELETAL: "musculoskeletal";
    readonly DERMATOLOGICAL: "dermatological";
    readonly OPHTHALMOLOGICAL: "ophthalmological";
    readonly OTHER: "other";
};
export type GeneticConditionCategory = typeof GENETIC_CONDITION_CATEGORIES[keyof typeof GENETIC_CONDITION_CATEGORIES];
//# sourceMappingURL=familyHistory.d.ts.map