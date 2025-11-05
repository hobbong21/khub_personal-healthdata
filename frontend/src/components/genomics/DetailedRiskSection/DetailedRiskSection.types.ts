export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskFactors {
  genetic: number;
  lifestyle: number;
  family: number;
}

export interface RiskDetail {
  id: string;
  disease: string;
  riskLevel: RiskLevel;
  score: number;
  percentile: number;
  description: string;
  factors: RiskFactors;
  recommendations: string[];
}

export interface DetailedRiskSectionProps {
  risks: RiskDetail[];
}
