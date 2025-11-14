import { CreateMedicationRequest, UpdateMedicationRequest, MedicationWithSchedules, MedicationScheduleRequest, DosageLogRequest, SideEffectRequest, TodayScheduleItem, DrugInteractionCheck, MedicationStats } from '../types/medication';
export declare class MedicationService {
    static createMedication(userId: string, medicationData: CreateMedicationRequest): Promise<MedicationWithSchedules>;
    static getUserMedications(userId: string, includeInactive?: boolean): Promise<MedicationWithSchedules[]>;
    static updateMedication(medicationId: string, userId: string, updateData: UpdateMedicationRequest): Promise<MedicationWithSchedules>;
    static deleteMedication(medicationId: string, userId: string): Promise<void>;
    static createMedicationSchedule(medicationId: string, scheduleData: MedicationScheduleRequest): Promise<any>;
    static logDosage(medicationId: string, dosageData: DosageLogRequest): Promise<any>;
    static reportSideEffect(medicationId: string, sideEffectData: SideEffectRequest): Promise<any>;
    static getTodaySchedule(userId: string): Promise<TodayScheduleItem[]>;
    static checkDrugInteractions(userId: string): Promise<DrugInteractionCheck[]>;
    static calculateAdherence(medicationId: string, days?: number): Promise<number>;
    static getMedicationStats(userId: string): Promise<MedicationStats>;
    static getMedicationReminders(userId: string): Promise<any[]>;
    static searchMedications(userId: string, searchTerm: string): Promise<MedicationWithSchedules[]>;
    static getExpiringMedications(userId: string, daysAhead?: number): Promise<MedicationWithSchedules[]>;
}
//# sourceMappingURL=medicationService.d.ts.map