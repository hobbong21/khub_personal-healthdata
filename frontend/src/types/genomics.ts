export interface GenomicData {
  id: string;
  userId: string;
  sourcePlatform: '23andme' | 'ancestry' | 'other';
  filePath?: string;
  snpData?: Record<string, string>;
  analysisResults?: GenomicAnalysisResults;
  uploadedAt: string;
  riskAssessments?: RiskAssessment[];
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

export interface RiskAssessment {
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
  calculatedAt: string;
}

export interface GenomicUploadResult {
  genomicDataId: string;
  snpCount: number;
  analysisResults: GenomicAnalysisResults;
  metadata: {
    platform: string;
    version?: string;
    buildVersion?: string;
    sampleId?: string;
  };
}

export interface SupportedFeatures {
  supportedPlatforms: string[];
  supportedDiseases: string[];
  pharmacogenomicDrugs: string[];
  analysisFeatures: string[];
  fileFormats: string[];
}

// UI-specific interfaces
export interface GenomicDataUploadProps {
  onUploadSuccess: (result: GenomicUploadResult) => void;
  onUploadError: (error: string) => void;
}

export interface RiskVisualizationProps {
  riskAssessments: RiskAssessment[];
  selectedDisease?: string;
  onDiseaseSelect: (disease: string) => void;
}

export interface PharmacogenomicsDisplayProps {
  pharmacogenomicsData: PharmacogenomicsData;
  medications?: string[];
}

// Constants
export const DISEASE_NAMES: Record<string, string> = {
  'cardiovascular_disease': '심혈관 질환',
  'type2_diabetes': '제2형 당뇨병',
  'alzheimer_disease': '알츠하이머병',
  'breast_cancer': '유방암',
  'prostate_cancer': '전립선암',
  'colorectal_cancer': '대장암',
  'lung_cancer': '폐암',
  'rheumatoid_arthritis': '류마티스 관절염',
  'crohn_disease': '크론병',
  'celiac_disease': '셀리악병',
  'macular_degeneration': '황반변성',
  'osteoporosis': '골다공증'
};

export const RISK_LEVELS = {
  LOW: { min: 0, max: 0.3, label: '낮음', color: '#10B981' },
  MODERATE: { min: 0.3, max: 0.6, label: '보통', color: '#F59E0B' },
  HIGH: { min: 0.6, max: 0.8, label: '높음', color: '#EF4444' },
  VERY_HIGH: { min: 0.8, max: 1, label: '매우 높음', color: '#DC2626' }
};

export const WARNING_LEVELS = {
  low: { color: '#10B981', label: '낮음' },
  moderate: { color: '#F59E0B', label: '보통' },
  high: { color: '#EF4444', label: '높음' }
};

export function getRiskLevel(riskScore: number) {
  if (riskScore <= RISK_LEVELS.LOW.max) return RISK_LEVELS.LOW;
  if (riskScore <= RISK_LEVELS.MODERATE.max) return RISK_LEVELS.MODERATE;
  if (riskScore <= RISK_LEVELS.HIGH.max) return RISK_LEVELS.HIGH;
  return RISK_LEVELS.VERY_HIGH;
}

export function formatRiskScore(riskScore: number): string {
  return `${(riskScore * 100).toFixed(1)}%`;
}

export function formatPercentile(percentile: number): string {
  return `상위 ${(100 - percentile).toFixed(0)}%`;
}