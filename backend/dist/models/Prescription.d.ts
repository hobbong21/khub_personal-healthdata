import { CreatePrescriptionRequest, PrescriptionResponse, UpdatePrescriptionRequest } from '../types/medical';
export declare class PrescriptionModel {
    static create(medicalRecordId: string, data: CreatePrescriptionRequest): Promise<PrescriptionResponse>;
    static findById(id: string): Promise<PrescriptionResponse | null>;
    static findByMedicalRecordId(medicalRecordId: string): Promise<PrescriptionResponse[]>;
    static findByUserId(userId: string): Promise<PrescriptionResponse[]>;
    static update(id: string, data: UpdatePrescriptionRequest): Promise<PrescriptionResponse | null>;
    static delete(id: string): Promise<boolean>;
    static findByMedicationName(userId: string, medicationName: string): Promise<PrescriptionResponse[]>;
    static validatePrescription(data: CreatePrescriptionRequest): {
        isValid: boolean;
        errors: string[];
    };
    private static formatPrescription;
}
//# sourceMappingURL=Prescription.d.ts.map