export type ChartPeriod = 'week' | 'month' | 'year';

export interface ChartDataPoint {
  labels: string[];
  bloodPressure: number[];
  heartRate: number[];
  temperature: number[];
  weight: number[];
}

export interface HealthTrendChartProps {
  data: Record<ChartPeriod, ChartDataPoint>;
  initialPeriod?: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
  fill: boolean;
}
