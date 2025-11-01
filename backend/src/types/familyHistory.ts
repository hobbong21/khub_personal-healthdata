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
  x?: number; // for visualization positioning
  y?: number; // for visualization positioning
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

// Predefined relationship types for family tree
export const FAMILY_RELATIONSHIPS = {
  // Generation -2 (Grandparents)
  PATERNAL_GRANDFATHER: 'paternal_grandfather',
  PATERNAL_GRANDMOTHER: 'paternal_grandmother',
  MATERNAL_GRANDFATHER: 'maternal_grandfather',
  MATERNAL_GRANDMOTHER: 'maternal_grandmother',
  
  // Generation -1 (Parents)
  FATHER: 'father',
  MOTHER: 'mother',
  STEPFATHER: 'stepfather',
  STEPMOTHER: 'stepmother',
  
  // Generation 0 (Siblings)
  BROTHER: 'brother',
  SISTER: 'sister',
  HALF_BROTHER: 'half_brother',
  HALF_SISTER: 'half_sister',
  STEPBROTHER: 'stepbrother',
  STEPSISTER: 'stepsister',
  
  // Generation +1 (Children)
  SON: 'son',
  DAUGHTER: 'daughter',
  STEPSON: 'stepson',
  STEPDAUGHTER: 'stepdaughter',
  
  // Generation +2 (Grandchildren)
  GRANDSON: 'grandson',
  GRANDDAUGHTER: 'granddaughter',
  
  // Extended family
  UNCLE: 'uncle',
  AUNT: 'aunt',
  COUSIN: 'cousin',
  NEPHEW: 'nephew',
  NIECE: 'niece'
} as const;

export type FamilyRelationship = typeof FAMILY_RELATIONSHIPS[keyof typeof FAMILY_RELATIONSHIPS];

// Medical condition categories for genetic diseases
export const GENETIC_CONDITION_CATEGORIES = {
  CARDIOVASCULAR: 'cardiovascular',
  CANCER: 'cancer',
  NEUROLOGICAL: 'neurological',
  METABOLIC: 'metabolic',
  AUTOIMMUNE: 'autoimmune',
  MENTAL_HEALTH: 'mental_health',
  RESPIRATORY: 'respiratory',
  ENDOCRINE: 'endocrine',
  MUSCULOSKELETAL: 'musculoskeletal',
  DERMATOLOGICAL: 'dermatological',
  OPHTHALMOLOGICAL: 'ophthalmological',
  OTHER: 'other'
} as const;

export type GeneticConditionCategory = typeof GENETIC_CONDITION_CATEGORIES[keyof typeof GENETIC_CONDITION_CATEGORIES];