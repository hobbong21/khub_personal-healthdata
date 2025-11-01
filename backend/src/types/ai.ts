export interface AIModelConfig {
  id: string;
  name: string;
  version: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'neural_network';
  parameters: Record<string, any>;
  accuracy?: number;
  trainedAt: Date;
  filePath?: string;
  description?: string;
  inputFeatures: string[];
  outputLabels: string[];
}

export interface PredictionRequest {
  userId: string;
  modelId: string;
  inputData: Record<string, any>;
  predictionType: string;
}

export interface PredictionResult {
  id: string;
  userId: string;
  aiModelId: string;
  predictionType: string;
  inputData: Record<string, any>;
  predictionResult: {
    prediction: any;
    probability?: number;
    confidence: number;
    riskFactors?: string[];
    recommendations?: string[];
  };
  confidenceScore: number;
  createdAt: Date;
}

export interface HealthRiskPrediction {
  diseaseType: string;
  riskScore: number; // 0-1 scale
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  timeframe: '1_year' | '5_years' | '10_years' | 'lifetime';
  contributingFactors: {
    genetic: number;
    lifestyle: number;
    medical_history: number;
    family_history: number;
  };
  recommendations: string[];
  confidence: number;
}

export interface HealthDeteriorationPattern {
  patternType: string;
  severity: 'mild' | 'moderate' | 'severe';
  trendDirection: 'improving' | 'stable' | 'declining';
  affectedMetrics: string[];
  timeframe: string;
  confidence: number;
  alertLevel: 'info' | 'warning' | 'critical';
}

export interface ModelTrainingData {
  features: Record<string, any>[];
  labels: any[];
  metadata: {
    dataSource: string;
    collectionDate: Date;
    sampleSize: number;
    featureNames: string[];
  };
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  confusionMatrix?: number[][];
  crossValidationScore?: number;
}

export interface ModelVersionInfo {
  version: string;
  changes: string[];
  performanceImprovement: number;
  deployedAt: Date;
  isActive: boolean;
}