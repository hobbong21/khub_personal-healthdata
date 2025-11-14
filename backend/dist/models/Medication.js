"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class MedicationModel {
    static async create(userId, medicationData) {
        const medication = await database_1.default.medication.create({
            data: {
                userId,
                name: medicationData.name,
                genericName: medicationData.genericName,
                dosage: medicationData.dosage,
                frequency: medicationData.frequency,
                route: medicationData.route,
                startDate: new Date(medicationData.startDate),
                endDate: medicationData.endDate ? new Date(medicationData.endDate) : null,
                purpose: medicationData.purpose,
                prescribedBy: medicationData.prescribedBy,
                pharmacy: medicationData.pharmacy,
                notes: medicationData.notes,
            },
            include: {
                medicationSchedules: true,
                dosageLogs: {
                    orderBy: { takenAt: 'desc' },
                    take: 10
                },
                sideEffects: {
                    where: { isActive: true }
                }
            }
        });
        return medication;
    }
    static async findByUserId(userId, includeInactive = false) {
        const medications = await database_1.default.medication.findMany({
            where: {
                userId,
                ...(includeInactive ? {} : { isActive: true })
            },
            include: {
                medicationSchedules: {
                    where: { isActive: true },
                    orderBy: { scheduledTime: 'asc' }
                },
                dosageLogs: {
                    orderBy: { takenAt: 'desc' },
                    take: 5
                },
                sideEffects: {
                    where: { isActive: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return medications;
    }
    static async update(id, userId, updateData) {
        const medication = await database_1.default.medication.update({
            where: {
                id,
                userId
            },
            data: {
                ...(updateData.name && { name: updateData.name }),
                ...(updateData.genericName !== undefined && { genericName: updateData.genericName }),
                ...(updateData.dosage && { dosage: updateData.dosage }),
                ...(updateData.frequency && { frequency: updateData.frequency }),
                ...(updateData.route !== undefined && { route: updateData.route }),
                ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
                ...(updateData.endDate !== undefined && {
                    endDate: updateData.endDate ? new Date(updateData.endDate) : null
                }),
                ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
                ...(updateData.purpose !== undefined && { purpose: updateData.purpose }),
                ...(updateData.prescribedBy !== undefined && { prescribedBy: updateData.prescribedBy }),
                ...(updateData.pharmacy !== undefined && { pharmacy: updateData.pharmacy }),
                ...(updateData.notes !== undefined && { notes: updateData.notes }),
            },
            include: {
                medicationSchedules: {
                    where: { isActive: true }
                },
                dosageLogs: {
                    orderBy: { takenAt: 'desc' },
                    take: 10
                },
                sideEffects: {
                    where: { isActive: true }
                }
            }
        });
        return medication;
    }
    static async delete(id, userId) {
        await database_1.default.medication.update({
            where: {
                id,
                userId
            },
            data: {
                isActive: false,
                endDate: new Date()
            }
        });
    }
    static async createSchedule(medicationId, scheduleData) {
        return await database_1.default.medicationSchedule.create({
            data: {
                medicationId,
                timeOfDay: scheduleData.timeOfDay,
                scheduledTime: scheduleData.scheduledTime,
                dosage: scheduleData.dosage,
                instructions: scheduleData.instructions,
            }
        });
    }
    static async logDosage(medicationId, dosageData) {
        return await database_1.default.dosageLog.create({
            data: {
                medicationId,
                takenAt: dosageData.takenAt ? new Date(dosageData.takenAt) : new Date(),
                dosageTaken: dosageData.dosageTaken,
                notes: dosageData.notes,
            }
        });
    }
    static async reportSideEffect(medicationId, sideEffectData) {
        return await database_1.default.sideEffect.create({
            data: {
                medicationId,
                effectName: sideEffectData.effectName,
                severity: sideEffectData.severity,
                description: sideEffectData.description,
                startDate: new Date(sideEffectData.startDate),
                endDate: sideEffectData.endDate ? new Date(sideEffectData.endDate) : null,
            }
        });
    }
    static async getTodaySchedule(userId) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const medications = await database_1.default.medication.findMany({
            where: {
                userId,
                isActive: true,
                OR: [
                    { endDate: null },
                    { endDate: { gte: startOfDay } }
                ]
            },
            include: {
                medicationSchedules: {
                    where: { isActive: true }
                },
                dosageLogs: {
                    where: {
                        takenAt: {
                            gte: startOfDay,
                            lt: endOfDay
                        }
                    }
                }
            }
        });
        const scheduleWithStatus = medications.flatMap(medication => medication.medicationSchedules.map(schedule => ({
            medicationId: medication.id,
            medicationName: medication.name,
            schedule,
            isTaken: medication.dosageLogs.some(log => log.dosageTaken === schedule.dosage &&
                new Date(log.takenAt).getHours() === parseInt(schedule.scheduledTime.split(':')[0]))
        })));
        return scheduleWithStatus;
    }
    static async calculateAdherence(medicationId, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const medication = await database_1.default.medication.findUnique({
            where: { id: medicationId },
            include: {
                medicationSchedules: {
                    where: { isActive: true }
                },
                dosageLogs: {
                    where: {
                        takenAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                }
            }
        });
        if (!medication)
            return 0;
        const expectedDoses = medication.medicationSchedules.length * days;
        const actualDoses = medication.dosageLogs.length;
        return expectedDoses > 0 ? Math.min((actualDoses / expectedDoses) * 100, 100) : 0;
    }
}
exports.MedicationModel = MedicationModel;
//# sourceMappingURL=Medication.js.map