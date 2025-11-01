export interface AIModelConfig {
  id: string;
  name: string;
  version: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'neural_network';
  parameters: Record<string, any>;
  accuracy?: number;
  trainedAt: Date;
  description?: string;
}

export interface PredictionResult {
  id: string;
  userId: string;
  aiModelId: string;
  predictionType: string;
  inputData: Record<string, any>;
  predictionResult: {
    prediction?: any;
    probability?: number;
    confidence: number;
    riskFactors?: string[];
    recommendations?: string[];
    patterns?: HealthDeteriorationPattern[];
    alertLevel?: string;
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

export interface RiskFactor {
  id: string;
  name: string;
  category: 'lifestyle' | 'medical' | 'genetic' | 'environmental';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  impact: number; // 0-1 scale
  modifiable: boolean;
  description: string;
  recommendations: string[];
  timeToImpact: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
}

export interface RiskFactorAnalysis {
  totalRiskScore: number;
  riskFactors: RiskFactor[];
  protectiveFactors: RiskFactor[];
  priorityActions: string[];
  riskTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface HealthInsights {
  cardiovascularRisk: PredictionResult | null;
  diabetesRisk: PredictionResult | null;
  deteriorationAnalysis: PredictionResult | null;
  riskFactorAnalysis: PredictionResult | null;
  recommendations: PredictionResult | null;
  generatedAt: Date;
}

export interface PredictionStats {
  totalPredictions: number;
  predictionsByType: Record<string, number>;
  averageConfidence: number;
  latestPredictionDate: Date | null;
}