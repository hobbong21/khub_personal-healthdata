export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskFactors {
  genetic?: number;
  lifestyle?: number;
  family?: number;
}

export interface RiskCardProps {
  disease: string;
  riskLevel: RiskLevel;
  riskScore?: string;
  percentile: string;
  factors?: RiskFactors;
  onClick?: () => void;
}
