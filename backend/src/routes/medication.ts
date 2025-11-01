import { Router } from 'express';
import { MedicationController } from '../controllers/medicationController';
import { authenticateToken } from '../middleware/auth';
import { validateMedication, validateSchedule, validateDosageLog, validateSideEffect } from '../middleware/validation';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 약물 관리 기본 CRUD (요구사항 6.1)
router.post('/', validateMedication, MedicationController.createMedication);
router.get('/', MedicationController.getMedications);
router.put('/:id', MedicationController.updateMedication);
router.delete('/:id', MedicationController.deleteMedication);

// 복약 스케줄 관리 (요구사항 6.1, 6.2)
router.post('/:id/schedules', validateSchedule, MedicationController.createSchedule);
router.get('/today-schedule', MedicationController.getTodaySchedule);

// 복약 기록 (요구사항 6.2, 6.5)
router.post('/:id/dosage-logs', validateDosageLog, MedicationController.logDosage);

// 부작용 기록 (요구사항 6.4)
router.post('/:id/side-effects', validateSideEffect, MedicationController.reportSideEffect);

// 약물 상호작용 확인 (요구사항 6.3)
router.get('/interactions', MedicationController.checkInteractions);
router.post('/check-interactions', MedicationController.checkNewMedicationInteractions);

// 복약 순응도 및 통계 (요구사항 6.5)
router.get('/:id/adherence', MedicationController.getAdherence);
router.get('/stats', MedicationController.getStats);

// 복약 알림 (요구사항 6.2)
router.get('/reminders', MedicationController.getReminders);

// 약물 검색 및 필터링 (요구사항 6.1)
router.get('/search', MedicationController.searchMedications);
router.get('/expiring', MedicationController.getExpiringMedications);

export default router;