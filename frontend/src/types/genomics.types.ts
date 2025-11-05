/**
 * Genomics Data Type Definitions
 * Requirements: 3.1, 3.2, 3.3
 */

/**
 * Genomic data file information
 * @interface GenomicData
 */
export interface GenomicData {
  id: string;
  userId: string;
  sourcePlatform: '23andme' | 'ancestry' | 'myheritage' | 'other';
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  rawData?: string;
  snpCount?: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisResults?: GenomicAnalysisResults;
}

/**
 * Complete genomic analysis results
 * @interface GenomicAnalysisResults
 */
export interface GenomicAnalysisResults {
  id: string;
  genomicDataId: string;
  riskAssessments: RiskAssessment[];
  pharmacogenomics: PharmacogenomicsData[];
  traits: TraitData[];
  ancestry?: AncestryData;
  analyzedAt: Date;
}

/**
 * Disease risk assessment data
 * @interface RiskAssessment
 */
export interface RiskAssessment {
  id: string;
  disease: string;
  diseaseCategory: 'cardiovascular' | 'metabolic' | 'cancer' | 'neurological' | 'autoimmune' | 'other';
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  score: number;
  percentile: number;
  factors: RiskFactors;
  geneticVariants: GeneticVariant[];
  recommendations: string[];
  description: string;
}

/**
 * Risk contributing factors breakdown
 * @interface RiskFactors
 */
export interface RiskFactors {
  genetic: number;
  lifestyle: number;
  family: number;
  environmental?: number;
}

/**
 * Genetic variant information
 * @interface GeneticVariant
 */
export interface GeneticVariant {
  rsid: string;
  gene: string;
  genotype: string;
  chromosome: string;
  position: number;
  riskAllele: string;
  impact: 'high' | 'moderate' | 'low';
  description?: string;
}

/**
 * Pharmacogenomics drug response data
 * @interface PharmacogenomicsData
 */
export interface PharmacogenomicsData {
  drugName: string;
  drugCategory: string;
  response: 'normal' | 'increased' | 'decreased' | 'poor' | 'rapid';
  metabolism: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
  efficacy: 'reduced' | 'normal' | 'increased';
  dosageRecommendation: string;
  warningLevel: 'low' | 'moderate' | 'high';
  description: string;
  recommendation?: string;
  affectedGenes: string[];
  evidence: string;
}

/**
 * Genetic trait prediction data
 * @interface TraitData
 */
export interface TraitData {
  traitName: string;
  category: 'physical' | 'behavioral' | 'nutritional' | 'athletic';
  prediction: string;
  confidence: number;
  geneticBasis: string[];
  description: string;
}

/**
 * Ancestry composition data
 * @interface AncestryData
 */
export interface AncestryData {
  populations: PopulationBreakdown[];
  haplogroups: {
    maternal?: string;
    paternal?: string;
  };
  neanderthalPercentage?: number;
  migrationPatterns?: string[];
}

/**
 * Population ancestry breakdown
 * @interface PopulationBreakdown
 */
export interface PopulationBreakdown {
  population: string;
  region: string;
  percentage: number;
  confidence: number;
}

/**
 * SNP (Single Nucleotide Polymorphism) data
 * @interface SNPData
 */
export interface SNPData {
  rsid: string;
  chromosome: string;
  position: number;
  genotype: string;
  gene?: string;
  clinicalSignificance?: 'pathogenic' | 'likely-pathogenic' | 'benign' | 'likely-benign' | 'uncertain';
}

/**
 * File upload progress tracking
 * @interface UploadProgress
 */
export interface UploadProgress {
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

/**
 * Genomic analysis request
 * @interface AnalysisRequest
 */
export interface AnalysisRequest {
  genomicDataId: string;
  analysisTypes: ('risk' | 'pharmacogenomics' | 'traits' | 'ancestry')[];
  options?: {
    includeRawData?: boolean;
    detailedReport?: boolean;
  };
}

/**
 * Risk level configuration
 * @interface RiskLevelConfig
 */
export interface RiskLevelConfig {
  level: 'low' | 'medium' | 'high' | 'very-high';
  color: string;
  label: string;
  minScore: number;
  maxScore: number;
}

/**
 * Genomic report export options
 * @interface ReportExportOptions
 */
export interface ReportExportOptions {
  format: 'pdf' | 'json' | 'csv';
  sections: ('summary' | 'risks' | 'pharmacogenomics' | 'traits' | 'ancestry')[];
  includeCharts: boolean;
  includeRecommendations: boolean;
}
