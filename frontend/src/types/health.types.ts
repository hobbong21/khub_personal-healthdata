/**
 * Health Data Type Definitions
 * Requirements: 3.1, 3.2, 3.3
 */

/**
 * Main health data interface containing user's health metrics
 * @interface HealthData
 */
export interface HealthData {
  userName: string;
  healthScore: number;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  lastUpdated: Date;
}

/**
 * Statistical card data for displaying health metrics
 * @interface StatCardData
 */
export interface StatCardData {
  icon: string;
  value: string | number;
  label: string;
  change?: {
    value: string;
    positive: boolean;
  };
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

/**
 * Activity log entry for user health activities
 * @interface Activity
 */
export interface Activity {
  id: string;
  icon: string;
  title: string;
  time: string;
  type: 'measurement' | 'medication' | 'appointment' | 'exercise';
  description?: string;
  status?: 'completed' | 'pending' | 'missed';
}

/**
 * Chart data point for health trend visualization
 * @interface ChartDataPoint
 */
export interface ChartDataPoint {
  labels: string[];
  bloodPressure: number[];
  heartRate: number[];
  temperature: number[];
  weight: number[];
}

/**
 * Chart period type for filtering data
 * @type ChartPeriod
 */
export type ChartPeriod = 'week' | 'month' | 'year';

/**
 * Health trend chart data organized by period
 * @interface HealthTrendData
 */
export interface HealthTrendData {
  week: ChartDataPoint;
  month: ChartDataPoint;
  year: ChartDataPoint;
}

/**
 * Vital signs measurement data
 * @interface VitalSigns
 */
export interface VitalSigns {
  bloodPressure: {
    systolic: number;
    diastolic: number;
    unit: 'mmHg';
  };
  heartRate: {
    value: number;
    unit: 'bpm';
  };
  temperature: {
    value: number;
    unit: '°C' | '°F';
  };
  weight: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  bloodSugar?: {
    value: number;
    unit: 'mg/dL';
  };
  oxygenSaturation?: {
    value: number;
    unit: '%';
  };
}

/**
 * Health score breakdown by category
 * @interface HealthScoreBreakdown
 */
export interface HealthScoreBreakdown {
  overall: number;
  cardiovascular: number;
  metabolic: number;
  respiratory: number;
  mental: number;
}

/**
 * User health profile
 * @interface HealthProfile
 */
export interface HealthProfile {
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
}

/**
 * Health goal tracking
 * @interface HealthGoal
 */
export interface HealthGoal {
  id: string;
  type: 'weight' | 'exercise' | 'sleep' | 'nutrition' | 'custom';
  title: string;
  target: number;
  current: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
}
