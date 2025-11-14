"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionModel = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PrescriptionModel {
    static async create(medicalRecordId, data) {
        const prescription = await prisma.prescription.create({
            data: {
                medicalRecordId,
                medicationName: data.medicationName,
                dosage: data.dosage,
                frequency: data.frequency,
                duration: data.duration || null,
                instructions: data.instructions || null
            }
        });
        return this.formatPrescription(prescription);
    }
    static async findById(id) {
        const prescription = await prisma.prescription.findUnique({
            where: { id }
        });
        return prescription ? this.formatPrescription(prescription) : null;
    }
    static async findByMedicalRecordId(medicalRecordId) {
        const prescriptions = await prisma.prescription.findMany({
            where: { medicalRecordId },
            orderBy: { medicationName: 'asc' }
        });
        return prescriptions.map(this.formatPrescription);
    }
    static async findByUserId(userId) {
        const prescriptions = await prisma.prescription.findMany({
            where: {
                medicalRecord: {
                    userId
                }
            },
            include: {
                medicalRecord: true
            },
            orderBy: {
                medicalRecord: {
                    visitDate: 'desc'
                }
            }
        });
        return prescriptions.map(this.formatPrescription);
    }
    static async update(id, data) {
        const existingPrescription = await prisma.prescription.findUnique({
            where: { id }
        });
        if (!existingPrescription)
            return null;
        const updatedPrescription = await prisma.prescription.update({
            where: { id },
            data: {
                ...(data.medicationName && { medicationName: data.medicationName }),
                ...(data.dosage && { dosage: data.dosage }),
                ...(data.frequency && { frequency: data.frequency }),
                ...(data.duration !== undefined && { duration: data.duration }),
                ...(data.instructions !== undefined && { instructions: data.instructions })
            }
        });
        return this.formatPrescription(updatedPrescription);
    }
    static async delete(id) {
        const existingPrescription = await prisma.prescription.findUnique({
            where: { id }
        });
        if (!existingPrescription)
            return false;
        await prisma.prescription.delete({
            where: { id }
        });
        return true;
    }
    static async findByMedicationName(userId, medicationName) {
        const prescriptions = await prisma.prescription.findMany({
            where: {
                medicationName: {
                    contains: medicationName,
                    mode: 'insensitive'
                },
                medicalRecord: {
                    userId
                }
            },
            include: {
                medicalRecord: true
            },
            orderBy: {
                medicalRecord: {
                    visitDate: 'desc'
                }
            }
        });
        return prescriptions.map(this.formatPrescription);
    }
    static validatePrescription(data) {
        const errors = [];
        if (!data.medicationName || data.medicationName.trim().length === 0) {
            errors.push('약물명은 필수입니다');
        }
        if (!data.dosage || data.dosage.trim().length === 0) {
            errors.push('용량은 필수입니다');
        }
        if (!data.frequency || data.frequency.trim().length === 0) {
            errors.push('복용 빈도는 필수입니다');
        }
        if (data.medicationName && data.medicationName.length > 200) {
            errors.push('약물명은 200자를 초과할 수 없습니다');
        }
        if (data.dosage && data.dosage.length > 100) {
            errors.push('용량 정보는 100자를 초과할 수 없습니다');
        }
        if (data.frequency && data.frequency.length > 100) {
            errors.push('복용 빈도 정보는 100자를 초과할 수 없습니다');
        }
        if (data.duration && data.duration.length > 100) {
            errors.push('복용 기간 정보는 100자를 초과할 수 없습니다');
        }
        if (data.instructions && data.instructions.length > 500) {
            errors.push('복용 지시사항은 500자를 초과할 수 없습니다');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static formatPrescription(prescription) {
        return {
            id: prescription.id,
            medicalRecordId: prescription.medicalRecordId,
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            duration: prescription.duration,
            instructions: prescription.instructions
        };
    }
}
exports.PrescriptionModel = PrescriptionModel;
//# sourceMappingURL=Prescription.js.map