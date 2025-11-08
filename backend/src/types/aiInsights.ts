/**
 * AI Insights Module Type Definitions
 * 
 * This file contains all TypeScript interfaces for the AI Insights feature,
 * including response types, data models, and metadata structures.
 */

/**
 * Main response interface for AI Insights API
 * Contains all insights data including summary, cards, scores, and trends
 */
export interface AIInsightsResponse {
  summary: AISummary;
  insights: InsightCard[];
  healthScore: HealthScore;
  quickStats: QuickStats;
  recommendations: Recommendation[];
  trends: TrendData[];
  metadata: InsightsMetadata;
}

/**
 * AI-generated health summary with natural language analysis
 */
export interface AISummary {
  text: string;
  period: string;
  lastUpdated: Date;
  confidence: number;
  keyFindings: {
    positive: string[];
    concerning: string[];
  };
}

/**
 * Individual insight card with categorization and priority
 */
export interface InsightCard {
  id: string;
  type: 'positive' | 'warning' | 'alert' | 'info';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
  relatedMetrics: string[];
  generatedAt: Date;
}

/**
 * Overall health score with component breakdown
 * Score range: 0-100
 * 
 * Category Label Mappings (Korean):
 * - excellent (81-100) → '우수'
 * - good (61-80) → '양호'
 * - fair (41-60) → '보통'
 * - poor (0-40) → '주의 필요'
 */
export interface HealthScore {
  score: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  categoryLabel: string;
  previousScore: number;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  components: {
    bloodPressure: { score: number; weight: number };
    heartRate: { score: number; weight: number };
    sleep: { score: number; weight: number };
    exercise: { score: number; weight: number };
    stress: { score: number; weight: number };
  };
}

/**
 * Quick statistics for key health metrics
 */
export interface QuickStats {
  bloodPressure: { value: string; unit: string };
  heartRate: { value: number; unit: string };
  sleep: { value: number; unit: string };
  exercise: { value: number; unit: string };
}

/**
 * Personalized health recommendation
 */
export interface Recommendation {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'exercise' | 'sleep' | 'stress' | 'nutrition' | 'hydration';
  priority: number;
}

/**
 * Trend analysis data for a specific health metric
 */
export interface TrendData {
  metric: string;
  label: string;
  currentValue: string;
  previousValue: string;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  isImproving: boolean;
  dataPoints: { date: string; value: number }[];
}

/**
 * Metadata about the insights generation
 */
export interface InsightsMetadata {
  userId: string;
  generatedAt: Date;
  dataPointsAnalyzed: number;
  analysisPeriod: number;
  cacheExpiry: Date;
}

/**
 * Health data aggregation used for insights generation
 * Internal type for service layer
 */
export interface HealthData {
  vitalSigns: VitalSignData[];
  healthRecords: HealthRecordData[];
  sleepData: SleepData[];
  exerciseData: ExerciseData[];
  stressData: StressData[];
}

/**
 * Vital sign data point
 */
export interface VitalSignData {
  id: string;
  userId: string;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  temperature: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  recordedAt: Date;
  createdAt: Date;
}

/**
 * Health record data point
 */
export interface HealthRecordData {
  id: string;
  userId: string;
  date: Date;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  bloodGlucose: number | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * Sleep data point
 */
export interface SleepData {
  id: string;
  userId: string;
  date: Date;
  duration: number;
  quality: number | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * Exercise data point
 */
export interface ExerciseData {
  id: string;
  userId: string;
  date: Date;
  type: string;
  duration: number;
  intensity: string | null;
  caloriesBurned: number | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * Stress data point
 */
export interface StressData {
  id: string;
  userId: string;
  date: Date;
  level: number;
  triggers: string | null;
  notes: string | null;
  createdAt: Date;
}

/**
 * Cache entry for storing generated insights
 */
export interface AIInsightCacheData {
  id: string;
  userId: string;
  insightsData: AIInsightsResponse;
  generatedAt: Date;
  expiresAt: Date;
}

/**
 * Request parameters for trend analysis
 */
export interface TrendAnalysisParams {
  userId: string;
  period: number;
}

/**
 * Request parameters for health score calculation
 */
export interface HealthScoreParams {
  userId: string;
  includeComponents?: boolean;
}
