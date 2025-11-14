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
export interface UpdateMedicationRequest {
    name?: string;
    genericName?: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    purpose?: string;
    prescribedBy?: string;
    pharmacy?: string;
    notes?: string;
}
export interface MedicationScheduleRequest {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    scheduledTime: string;
    dosage: string;
    instructions?: string;
}
export interface DosageLogRequest {
    takenAt?: string;
    dosageTaken: string;
    notes?: string;
}
export interface SideEffectRequest {
    effectName: string;
    severity: 'mild' | 'moderate' | 'severe';
    description?: string;
    startDate: string;
    endDate?: string;
}
export interface MedicationWithSchedules {
    id: string;
    userId: string;
    name: string;
    genericName?: string;
    dosage: string;
    frequency: string;
    route?: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    purpose?: string;
    prescribedBy?: string;
    pharmacy?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    medicationSchedules: MedicationSchedule[];
    dosageLogs: DosageLog[];
    sideEffects: SideEffect[];
}
export interface MedicationSchedule {
    id: string;
    medicationId: string;
    timeOfDay: string;
    scheduledTime: string;
    dosage: string;
    instructions?: string;
    isActive: boolean;
    createdAt: Date;
}
export interface DosageLog {
    id: string;
    medicationId: string;
    takenAt: Date;
    dosageTaken: string;
    notes?: string;
}
export interface SideEffect {
    id: string;
    medicationId: string;
    effectName: string;
    severity: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    createdAt: Date;
}
export interface DrugInteractionData {
    drug1Name: string;
    drug2Name: string;
    interactionType: 'major' | 'moderate' | 'minor';
    severity: 'contraindicated' | 'serious' | 'significant' | 'minor';
    description: string;
    clinicalEffect?: string;
    mechanism?: string;
    management?: string;
}
export interface DrugInteractionCheck {
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
export interface TodayScheduleItem {
    medicationId: string;
    medicationName: string;
    schedule: MedicationSchedule;
    isTaken: boolean;
}
export interface MedicationAdherence {
    medicationId: string;
    medicationName: string;
    adherencePercentage: number;
    expectedDoses: number;
    actualDoses: number;
    period: number;
}
export interface MedicationReminder {
    id: string;
    medicationId: string;
    medicationName: string;
    scheduledTime: string;
    dosage: string;
    timeOfDay: string;
    isOverdue: boolean;
    minutesOverdue?: number;
}
export interface MedicationStats {
    totalMedications: number;
    activeMedications: number;
    todayScheduled: number;
    todayTaken: number;
    adherenceRate: number;
    interactionWarnings: number;
}
export interface NotificationPreferences {
    enableReminders: boolean;
    reminderMinutesBefore: number;
    enableInteractionAlerts: boolean;
    enableSideEffectReminders: boolean;
    notificationMethods: ('push' | 'email' | 'sms')[];
}
export interface MedicationNotification {
    id: string;
    userId: string;
    type: 'reminder' | 'interaction' | 'side_effect' | 'refill';
    title: string;
    message: string;
    medicationId?: string;
    scheduledFor: Date;
    sentAt?: Date;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}
//# sourceMappingURL=medication.d.ts.map