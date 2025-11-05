export interface HealthScoreCardProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface CircularProgressProps {
  score: number;
  maxScore: number;
  size: number;
  strokeWidth: number;
}
