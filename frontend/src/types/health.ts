export interface VitalSignRequest {
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar' | 'weight';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  measuredAt: string;
}

export interface VitalSignResponse {
  id: string;
  userId: string;
  recordType: string;
  data: {
    type: string;
    value: number | { systolic: number; diastolic: number };
    unit: string;
    measuredAt: string;
  };
  recordedDate: string;
  createdAt: string;
}

export interface VitalSignTrend {
  type: string;
  period: string;
  data: Array<{
    date: string;
    value: number | { systolic: number; diastolic: number };
    average?: number;
  }>;
  statistics: {
    min: number;
    max: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface HealthJournalRequest {
  conditionRating: number; // 1-5 scale
  symptoms: {
    pain: number;
    fatigue: number;
    sleepQuality: number;
  };
  supplements: string[];
  exercise: {
    type: string;
    duration: number;
    intensity: 'low' | 'moderate' | 'high';
  }[];
  notes?: string;
  recordedDate: string;
}

export interface HealthRecordResponse {
  id: string;
  userId: string;
  recordType: string;
  data: any;
  recordedDate: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}