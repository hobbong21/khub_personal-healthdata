export interface VitalSignRequest {
  type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'blood_sugar' | 'weight';
  value: number | { systolic: number; diastolic: number };
  unit: string;
  measuredAt: string;
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
  recordedDate: Date;
  createdAt: Date;
}