export interface GenomicDataInput {
    sourcePlatform: '23andme' | 'ancestry' | 'other';
    filePath?: string;
    snpData?: Record<string, string>;
    analysisResults?: GenomicAnalysisResults;
}
export interface GenomicAnalysisResults {
    pharmacogenomics?: PharmacogenomicsData;
    diseaseRisks?: DiseaseRiskData[];
    traits?: TraitData[];
    ancestry?: AncestryData;
}
export interface PharmacogenomicsData {
    [drugName: string]: {
        metabolism: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
        efficacy: 'reduced' | 'normal' | 'increased';
        dosageRecommendation: string;
        warningLevel: 'low' | 'moderate' | 'high';
        evidence: string;
    };
}
export interface DiseaseRiskData {
    diseaseType: string;
    riskScore: number;
    percentile: number;
    geneticVariants: string[];
    confidence: number;
}
export interface TraitData {
    traitName: string;
    prediction: string;
    confidence: number;
    geneticBasis: string[];
}
export interface AncestryData {
    populations: {
        [population: string]: number;
    };
    haplogroups: {
        maternal?: string;
        paternal?: string;
    };
}
export interface SNPData {
    rsid: string;
    chromosome: string;
    position: number;
    genotype: string;
    gene?: string;
    consequence?: string;
}
export interface RiskAssessmentInput {
    diseaseType: string;
    genomicDataId?: string;
    contributingFactors?: {
        genetic: number;
        lifestyle: number;
        familyHistory: number;
        environmental: number;
    };
}
export interface RiskAssessmentResult {
    id: string;
    userId: string;
    genomicDataId?: string;
    diseaseType: string;
    riskScore: number;
    percentile?: number;
    contributingFactors?: {
        genetic: number;
        lifestyle: number;
        familyHistory: number;
        environmental: number;
    };
    recommendations?: string[];
    calculatedAt: Date;
}
export interface GenomicDataParsingResult {
    snpCount: number;
    validSnps: SNPData[];
    invalidSnps: string[];
    metadata: {
        platform: string;
        version?: string;
        buildVersion?: string;
        sampleId?: string;
    };
}
export interface DiseaseRiskFactors {
    geneticRisk: number;
    lifestyleRisk: number;
    familyHistoryRisk: number;
    environmentalRisk: number;
    ageRisk: number;
    genderRisk: number;
}
export interface RiskCalculationInput {
    userId: string;
    diseaseType: string;
    genomicData?: GenomicAnalysisResults;
    userProfile?: {
        age: number;
        gender: string;
        lifestyle: any;
    };
    familyHistory?: any[];
}
export declare const SUPPORTED_DISEASES: readonly ["cardiovascular_disease", "type2_diabetes", "alzheimer_disease", "breast_cancer", "prostate_cancer", "colorectal_cancer", "lung_cancer", "rheumatoid_arthritis", "crohn_disease", "celiac_disease", "macular_degeneration", "osteoporosis"];
export type SupportedDisease = typeof SUPPORTED_DISEASES[number];
export declare const PHARMACOGENOMIC_DRUGS: readonly ["warfarin", "clopidogrel", "simvastatin", "metformin", "codeine", "tramadol", "omeprazole", "sertraline", "fluoxetine", "carbamazepine", "phenytoin", "abacavir", "allopurinol", "azathioprine"];
export type PharmacogenomicDrug = typeof PHARMACOGENOMIC_DRUGS[number];
//# sourceMappingURL=genomics.d.ts.map