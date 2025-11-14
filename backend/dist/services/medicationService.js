"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationService = void 0;
const Medication_1 = require("../models/Medication");
const DrugInteraction_1 = require("../models/DrugInteraction");
class MedicationService {
    static async createMedication(userId, medicationData) {
        const interactions = await DrugInteraction_1.DrugInteractionModel.checkNewMedicationInteractions(userId, medicationData.name, medicationData.genericName);
        const medication = await Medication_1.MedicationModel.create(userId, medicationData);
        if (interactions.length > 0) {
            console.warn(`Drug interactions found for ${medicationData.name}:`, interactions);
        }
        return medication;
    }
    static async getUserMedications(userId, includeInactive = false) {
        return await Medication_1.MedicationModel.findByUserId(userId, includeInactive);
    }
    static async updateMedication(medicationId, userId, updateData) {
        return await Medication_1.MedicationModel.update(medicationId, userId, updateData);
    }
    static async deleteMedication(medicationId, userId) {
        await Medication_1.MedicationModel.delete(medicationId, userId);
    }
    static async createMedicationSchedule(medicationId, scheduleData) {
        return await Medication_1.MedicationModel.createSchedule(medicationId, scheduleData);
    }
    static async logDosage(medicationId, dosageData) {
        return await Medication_1.MedicationModel.logDosage(medicationId, dosageData);
    }
    static async reportSideEffect(medicationId, sideEffectData) {
        return await Medication_1.MedicationModel.reportSideEffect(medicationId, sideEffectData);
    }
    static async getTodaySchedule(userId) {
        return await Medication_1.MedicationModel.getTodaySchedule(userId);
    }
    static async checkDrugInteractions(userId) {
        return await DrugInteraction_1.DrugInteractionModel.checkUserMedicationInteractions(userId);
    }
    static async calculateAdherence(medicationId, days = 30) {
        return await Medication_1.MedicationModel.calculateAdherence(medicationId, days);
    }
    static async getMedicationStats(userId) {
        const medications = await Medication_1.MedicationModel.findByUserId(userId);
        const todaySchedule = await Medication_1.MedicationModel.getTodaySchedule(userId);
        const interactions = await DrugInteraction_1.DrugInteractionModel.checkUserMedicationInteractions(userId);
        const activeMedications = medications.filter(med => med.isActive);
        const todayTaken = todaySchedule.filter(item => item.isTaken).length;
        const adherenceRate = todaySchedule.length > 0 ? (todayTaken / todaySchedule.length) * 100 : 0;
        return {
            totalMedications: medications.length,
            activeMedications: activeMedications.length,
            todayScheduled: todaySchedule.length,
            todayTaken,
            adherenceRate: Math.round(adherenceRate),
            interactionWarnings: interactions.length
        };
    }
    static async getMedicationReminders(userId) {
        const todaySchedule = await Medication_1.MedicationModel.getTodaySchedule(userId);
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        return todaySchedule
            .filter(item => !item.isTaken)
            .map(item => {
            const scheduledTime = item.schedule.scheduledTime;
            const isOverdue = currentTime > scheduledTime;
            let minutesOverdue = 0;
            if (isOverdue) {
                const [schedHour, schedMin] = scheduledTime.split(':').map(Number);
                const scheduledMinutes = schedHour * 60 + schedMin;
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                minutesOverdue = currentMinutes - scheduledMinutes;
            }
            return {
                id: `${item.medicationId}-${item.schedule.id}`,
                medicationId: item.medicationId,
                medicationName: item.medicationName,
                scheduledTime: scheduledTime,
                dosage: item.schedule.dosage,
                timeOfDay: item.schedule.timeOfDay,
                isOverdue,
                minutesOverdue: isOverdue ? minutesOverdue : undefined
            };
        })
            .sort((a, b) => {
            if (a.isOverdue && !b.isOverdue)
                return -1;
            if (!a.isOverdue && b.isOverdue)
                return 1;
            return a.scheduledTime.localeCompare(b.scheduledTime);
        });
    }
    static async searchMedications(userId, searchTerm) {
        const allMedications = await Medication_1.MedicationModel.findByUserId(userId, true);
        const searchLower = searchTerm.toLowerCase();
        return allMedications.filter(med => med.name.toLowerCase().includes(searchLower) ||
            (med.genericName && med.genericName.toLowerCase().includes(searchLower)) ||
            (med.purpose && med.purpose.toLowerCase().includes(searchLower)));
    }
    static async getExpiringMedications(userId, daysAhead = 7) {
        const medications = await Medication_1.MedicationModel.findByUserId(userId);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        return medications.filter(med => med.endDate &&
            med.endDate <= futureDate &&
            med.endDate >= new Date() &&
            med.isActive);
    }
}
exports.MedicationService = MedicationService;
//# sourceMappingURL=medicationService.js.map