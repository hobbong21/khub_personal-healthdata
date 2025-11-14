import { CreateMedicationRequest, UpdateMedicationRequest, MedicationWithSchedules, MedicationScheduleRequest, DosageLogRequest, SideEffectRequest } from '../types/medication';
export declare class MedicationModel {
    static create(userId: string, medicationData: CreateMedicationRequest): Promise<MedicationWithSchedules>;
    static findByUserId(userId: string, includeInactive?: boolean): Promise<MedicationWithSchedules[]>;
    static update(id: string, userId: string, updateData: UpdateMedicationRequest): Promise<MedicationWithSchedules>;
    static delete(id: string, userId: string): Promise<void>;
    static createSchedule(medicationId: string, scheduleData: MedicationScheduleRequest): Promise<any>;
    static logDosage(medicationId: string, dosageData: DosageLogRequest): Promise<any>;
    static reportSideEffect(medicationId: string, sideEffectData: SideEffectRequest): Promise<any>;
    static getTodaySchedule(userId: string): Promise<any[]>;
    static calculateAdherence(medicationId: string, days?: number): Promise<number>;
}
//# sourceMappingURL=Medication.d.ts.map