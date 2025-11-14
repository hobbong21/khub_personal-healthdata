"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationController = void 0;
const medicationService_1 = require("../services/medicationService");
const DrugInteraction_1 = require("../models/DrugInteraction");
class MedicationController {
    static async createMedication(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const medicationData = req.body;
            if (!medicationData.name || !medicationData.dosage || !medicationData.frequency || !medicationData.startDate) {
                res.status(400).json({ error: '필수 필드가 누락되었습니다' });
                return;
            }
            const medication = await medicationService_1.MedicationService.createMedication(userId, medicationData);
            res.status(201).json(medication);
        }
        catch (error) {
            console.error('약물 등록 오류:', error);
            res.status(500).json({ error: '약물 등록 중 오류가 발생했습니다' });
        }
    }
    static async getMedications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const includeInactive = req.query.includeInactive === 'true';
            const medications = await medicationService_1.MedicationService.getUserMedications(userId, includeInactive);
            res.json(medications);
        }
        catch (error) {
            console.error('약물 조회 오류:', error);
            res.status(500).json({ error: '약물 조회 중 오류가 발생했습니다' });
        }
    }
    static async updateMedication(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const medicationId = req.params.id;
            const updateData = req.body;
            const medication = await medicationService_1.MedicationService.updateMedication(medicationId, userId, updateData);
            res.json(medication);
        }
        catch (error) {
            console.error('약물 수정 오류:', error);
            res.status(500).json({ error: '약물 수정 중 오류가 발생했습니다' });
        }
    }
    static async deleteMedication(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const medicationId = req.params.id;
            await medicationService_1.MedicationService.deleteMedication(medicationId, userId);
            res.status(204).send();
        }
        catch (error) {
            console.error('약물 삭제 오류:', error);
            res.status(500).json({ error: '약물 삭제 중 오류가 발생했습니다' });
        }
    }
    static async createSchedule(req, res) {
        try {
            const medicationId = req.params.id;
            const scheduleData = req.body;
            if (!scheduleData.timeOfDay || !scheduleData.scheduledTime || !scheduleData.dosage) {
                res.status(400).json({ error: '필수 스케줄 정보가 누락되었습니다' });
                return;
            }
            const schedule = await medicationService_1.MedicationService.createMedicationSchedule(medicationId, scheduleData);
            res.status(201).json(schedule);
        }
        catch (error) {
            console.error('스케줄 생성 오류:', error);
            res.status(500).json({ error: '스케줄 생성 중 오류가 발생했습니다' });
        }
    }
    static async logDosage(req, res) {
        try {
            const medicationId = req.params.id;
            const dosageData = req.body;
            if (!dosageData.dosageTaken) {
                res.status(400).json({ error: '복용량 정보가 필요합니다' });
                return;
            }
            const dosageLog = await medicationService_1.MedicationService.logDosage(medicationId, dosageData);
            res.status(201).json(dosageLog);
        }
        catch (error) {
            console.error('복약 기록 오류:', error);
            res.status(500).json({ error: '복약 기록 중 오류가 발생했습니다' });
        }
    }
    static async reportSideEffect(req, res) {
        try {
            const medicationId = req.params.id;
            const sideEffectData = req.body;
            if (!sideEffectData.effectName || !sideEffectData.severity || !sideEffectData.startDate) {
                res.status(400).json({ error: '필수 부작용 정보가 누락되었습니다' });
                return;
            }
            const sideEffect = await medicationService_1.MedicationService.reportSideEffect(medicationId, sideEffectData);
            res.status(201).json(sideEffect);
        }
        catch (error) {
            console.error('부작용 기록 오류:', error);
            res.status(500).json({ error: '부작용 기록 중 오류가 발생했습니다' });
        }
    }
    static async getTodaySchedule(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const schedule = await medicationService_1.MedicationService.getTodaySchedule(userId);
            res.json(schedule);
        }
        catch (error) {
            console.error('오늘 스케줄 조회 오류:', error);
            res.status(500).json({ error: '스케줄 조회 중 오류가 발생했습니다' });
        }
    }
    static async checkInteractions(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const interactions = await medicationService_1.MedicationService.checkDrugInteractions(userId);
            res.json(interactions);
        }
        catch (error) {
            console.error('상호작용 확인 오류:', error);
            res.status(500).json({ error: '상호작용 확인 중 오류가 발생했습니다' });
        }
    }
    static async getAdherence(req, res) {
        try {
            const medicationId = req.params.id;
            const days = parseInt(req.query.days) || 30;
            const adherence = await medicationService_1.MedicationService.calculateAdherence(medicationId, days);
            res.json({
                medicationId,
                adherencePercentage: adherence,
                period: days
            });
        }
        catch (error) {
            console.error('순응도 조회 오류:', error);
            res.status(500).json({ error: '순응도 조회 중 오류가 발생했습니다' });
        }
    }
    static async getStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const stats = await medicationService_1.MedicationService.getMedicationStats(userId);
            res.json(stats);
        }
        catch (error) {
            console.error('통계 조회 오류:', error);
            res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다' });
        }
    }
    static async getReminders(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const reminders = await medicationService_1.MedicationService.getMedicationReminders(userId);
            res.json(reminders);
        }
        catch (error) {
            console.error('알림 조회 오류:', error);
            res.status(500).json({ error: '알림 조회 중 오류가 발생했습니다' });
        }
    }
    static async searchMedications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const searchTerm = req.query.q;
            if (!searchTerm) {
                res.status(400).json({ error: '검색어가 필요합니다' });
                return;
            }
            const medications = await medicationService_1.MedicationService.searchMedications(userId, searchTerm);
            res.json(medications);
        }
        catch (error) {
            console.error('약물 검색 오류:', error);
            res.status(500).json({ error: '약물 검색 중 오류가 발생했습니다' });
        }
    }
    static async getExpiringMedications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const daysAhead = parseInt(req.query.days) || 7;
            const medications = await medicationService_1.MedicationService.getExpiringMedications(userId, daysAhead);
            res.json(medications);
        }
        catch (error) {
            console.error('만료 예정 약물 조회 오류:', error);
            res.status(500).json({ error: '만료 예정 약물 조회 중 오류가 발생했습니다' });
        }
    }
    static async checkNewMedicationInteractions(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: '인증이 필요합니다' });
                return;
            }
            const { medicationName, genericName } = req.body;
            if (!medicationName) {
                res.status(400).json({ error: '약물명이 필요합니다' });
                return;
            }
            const interactions = await DrugInteraction_1.DrugInteractionModel.checkNewMedicationInteractions(userId, medicationName, genericName);
            res.json(interactions);
        }
        catch (error) {
            console.error('상호작용 미리 확인 오류:', error);
            res.status(500).json({ error: '상호작용 확인 중 오류가 발생했습니다' });
        }
    }
}
exports.MedicationController = MedicationController;
//# sourceMappingURL=medicationController.js.map