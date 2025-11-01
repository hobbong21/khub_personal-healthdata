import { api } from './api';

// 약물 관리 관련 타입 정의
export interface Medication {
  id: string;
  userId: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  purpose?: string;
  prescribedBy?: string;
  pharmacy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  medicationSchedules: MedicationSchedule[];
  dosageLogs: DosageLog[];
  sideEffects: SideEffect[];
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  scheduledTime: string;
  dosage: string;
  instructions?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DosageLog {
  id: string;
  medicationId: string;
  takenAt: string;
  dosageTaken: string;
  notes?: string;
}

export interface SideEffect {
  id: string;
  medicationId: string;
  effectName: string;
  severity: 'mild' | 'moderate' | 'severe';
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TodayScheduleItem {
  medicationId: string;
  medicationName: string;
  schedule: MedicationSchedule;
  isTaken: boolean;
}

export interface DrugInteraction {
  medication1: {
    id: string;
    name: string;
    genericName?: string;
  };
  medication2: {
    id: string;
    name: string;
    genericName?: string;
  };
  interaction: {
    id: string;
    interactionType: string;
    severity: string;
    description: string;
    clinicalEffect?: string;
    mechanism?: string;
    management?: string;
  };
}

export interface MedicationStats {
  totalMedications: number;
  activeMedications: number;
  todayScheduled: number;
  todayTaken: number;
  adherenceRate: number;
  interactionWarnings: number;
}

export interface CreateMedicationRequest {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route?: string;
  startDate: string;
  endDate?: string;
  purpose?: string;
  prescribedBy?: string;
  pharmacy?: string;
  notes?: string;
}

export interface CreateScheduleRequest {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  scheduledTime: string;
  dosage: string;
  instructions?: string;
}

export interface LogDosageRequest {
  takenAt?: string;
  dosageTaken: string;
  notes?: string;
}

export interface ReportSideEffectRequest {
  effectName: string;
  severity: 'mild' | 'moderate' | 'severe';
  description?: string;
  startDate: string;
  endDate?: string;
}

export const medicationApi = {
  // 약물 관리 기본 CRUD (요구사항 6.1)
  async getMedications(includeInactive = false): Promise<Medication[]> {
    const response = await api.get(`/medications?includeInactive=${includeInactive}`);
    return response.data;
  },

  async createMedication(medicationData: CreateMedicationRequest): Promise<Medication> {
    const response = await api.post('/medications', medicationData);
    return response.data;
  },

  async updateMedication(id: string, updateData: Partial<CreateMedicationRequest>): Promise<Medication> {
    const response = await api.put(`/medications/${id}`, updateData);
    return response.data;
  },

  async deleteMedication(id: string): Promise<void> {
    await api.delete(`/medications/${id}`);
  },

  // 복약 스케줄 관리 (요구사항 6.1, 6.2)
  async createSchedule(medicationId: string, scheduleData: CreateScheduleRequest): Promise<MedicationSchedule> {
    const response = await api.post(`/medications/${medicationId}/schedules`, scheduleData);
    return response.data;
  },

  async getTodaySchedule(): Promise<TodayScheduleItem[]> {
    const response = await api.get('/medications/today-schedule');
    return response.data;
  },

  // 복약 기록 (요구사항 6.2, 6.5)
  async logDosage(medicationId: string, dosageData: LogDosageRequest): Promise<DosageLog> {
    const response = await api.post(`/medications/${medicationId}/dosage-logs`, dosageData);
    return response.data;
  },

  // 부작용 기록 (요구사항 6.4)
  async reportSideEffect(medicationId: string, sideEffectData: ReportSideEffectRequest): Promise<SideEffect> {
    const response = await api.post(`/medications/${medicationId}/side-effects`, sideEffectData);
    return response.data;
  },

  // 약물 상호작용 확인 (요구사항 6.3)
  async checkInteractions(): Promise<DrugInteraction[]> {
    const response = await api.get('/medications/interactions');
    return response.data;
  },

  async checkNewMedicationInteractions(medicationName: string, genericName?: string): Promise<DrugInteraction[]> {
    const response = await api.post('/medications/check-interactions', {
      medicationName,
      genericName
    });
    return response.data;
  },

  // 복약 순응도 및 통계 (요구사항 6.5)
  async getAdherence(medicationId: string, days = 30): Promise<{ medicationId: string; adherencePercentage: number; period: number }> {
    const response = await api.get(`/medications/${medicationId}/adherence?days=${days}`);
    return response.data;
  },

  async getStats(): Promise<MedicationStats> {
    const response = await api.get('/medications/stats');
    return response.data;
  },

  // 복약 알림 (요구사항 6.2)
  async getReminders(): Promise<any[]> {
    const response = await api.get('/medications/reminders');
    return response.data;
  },

  // 약물 검색 및 필터링 (요구사항 6.1)
  async searchMedications(searchTerm: string): Promise<Medication[]> {
    const response = await api.get(`/medications/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  async getExpiringMedications(days = 7): Promise<Medication[]> {
    const response = await api.get(`/medications/expiring?days=${days}`);
    return response.data;
  }
};