import { Request, Response } from 'express';
import { MedicationService } from '../services/medicationService';
import { DrugInteractionModel } from '../models/DrugInteraction';
import { 
  CreateMedicationRequest, 
  UpdateMedicationRequest,
  MedicationScheduleRequest,
  DosageLogRequest,
  SideEffectRequest
} from '../types/medication';

export class MedicationController {
  /**
   * 약물 등록 (요구사항 6.1)
   * POST /api/medications
   */
  static async createMedication(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const medicationData: CreateMedicationRequest = req.body;
      
      // 입력 데이터 검증
      if (!medicationData.name || !medicationData.dosage || !medicationData.frequency || !medicationData.startDate) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다' });
        return;
      }

      const medication = await MedicationService.createMedication(userId, medicationData);
      res.status(201).json(medication);
    } catch (error) {
      console.error('약물 등록 오류:', error);
      res.status(500).json({ error: '약물 등록 중 오류가 발생했습니다' });
    }
  }

  /**
   * 사용자의 모든 약물 조회 (요구사항 6.1)
   * GET /api/medications
   */
  static async getMedications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const includeInactive = req.query.includeInactive === 'true';
      const medications = await MedicationService.getUserMedications(userId, includeInactive);
      res.json(medications);
    } catch (error) {
      console.error('약물 조회 오류:', error);
      res.status(500).json({ error: '약물 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 약물 정보 수정 (요구사항 6.1)
   * PUT /api/medications/:id
   */
  static async updateMedication(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const medicationId = req.params.id;
      const updateData: UpdateMedicationRequest = req.body;

      const medication = await MedicationService.updateMedication(medicationId, userId, updateData);
      res.json(medication);
    } catch (error) {
      console.error('약물 수정 오류:', error);
      res.status(500).json({ error: '약물 수정 중 오류가 발생했습니다' });
    }
  }

  /**
   * 약물 삭제 (요구사항 6.1)
   * DELETE /api/medications/:id
   */
  static async deleteMedication(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const medicationId = req.params.id;
      await MedicationService.deleteMedication(medicationId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('약물 삭제 오류:', error);
      res.status(500).json({ error: '약물 삭제 중 오류가 발생했습니다' });
    }
  }

  /**
   * 복약 스케줄 생성 (요구사항 6.1, 6.2)
   * POST /api/medications/:id/schedules
   */
  static async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const medicationId = req.params.id;
      const scheduleData: MedicationScheduleRequest = req.body;

      if (!scheduleData.timeOfDay || !scheduleData.scheduledTime || !scheduleData.dosage) {
        res.status(400).json({ error: '필수 스케줄 정보가 누락되었습니다' });
        return;
      }

      const schedule = await MedicationService.createMedicationSchedule(medicationId, scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error('스케줄 생성 오류:', error);
      res.status(500).json({ error: '스케줄 생성 중 오류가 발생했습니다' });
    }
  }

  /**
   * 복약 기록 (요구사항 6.2, 6.5)
   * POST /api/medications/:id/dosage-logs
   */
  static async logDosage(req: Request, res: Response): Promise<void> {
    try {
      const medicationId = req.params.id;
      const dosageData: DosageLogRequest = req.body;

      if (!dosageData.dosageTaken) {
        res.status(400).json({ error: '복용량 정보가 필요합니다' });
        return;
      }

      const dosageLog = await MedicationService.logDosage(medicationId, dosageData);
      res.status(201).json(dosageLog);
    } catch (error) {
      console.error('복약 기록 오류:', error);
      res.status(500).json({ error: '복약 기록 중 오류가 발생했습니다' });
    }
  }

  /**
   * 부작용 기록 (요구사항 6.4)
   * POST /api/medications/:id/side-effects
   */
  static async reportSideEffect(req: Request, res: Response): Promise<void> {
    try {
      const medicationId = req.params.id;
      const sideEffectData: SideEffectRequest = req.body;

      if (!sideEffectData.effectName || !sideEffectData.severity || !sideEffectData.startDate) {
        res.status(400).json({ error: '필수 부작용 정보가 누락되었습니다' });
        return;
      }

      const sideEffect = await MedicationService.reportSideEffect(medicationId, sideEffectData);
      res.status(201).json(sideEffect);
    } catch (error) {
      console.error('부작용 기록 오류:', error);
      res.status(500).json({ error: '부작용 기록 중 오류가 발생했습니다' });
    }
  }

  /**
   * 오늘의 복약 스케줄 조회 (요구사항 6.1, 6.2)
   * GET /api/medications/today-schedule
   */
  static async getTodaySchedule(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const schedule = await MedicationService.getTodaySchedule(userId);
      res.json(schedule);
    } catch (error) {
      console.error('오늘 스케줄 조회 오류:', error);
      res.status(500).json({ error: '스케줄 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 약물 상호작용 확인 (요구사항 6.3)
   * GET /api/medications/interactions
   */
  static async checkInteractions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const interactions = await MedicationService.checkDrugInteractions(userId);
      res.json(interactions);
    } catch (error) {
      console.error('상호작용 확인 오류:', error);
      res.status(500).json({ error: '상호작용 확인 중 오류가 발생했습니다' });
    }
  }

  /**
   * 복약 순응도 조회 (요구사항 6.5)
   * GET /api/medications/:id/adherence
   */
  static async getAdherence(req: Request, res: Response): Promise<void> {
    try {
      const medicationId = req.params.id;
      const days = parseInt(req.query.days as string) || 30;

      const adherence = await MedicationService.calculateAdherence(medicationId, days);
      res.json({ 
        medicationId, 
        adherencePercentage: adherence, 
        period: days 
      });
    } catch (error) {
      console.error('순응도 조회 오류:', error);
      res.status(500).json({ error: '순응도 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 약물 관리 통계 (요구사항 6.1, 6.2, 6.3)
   * GET /api/medications/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const stats = await MedicationService.getMedicationStats(userId);
      res.json(stats);
    } catch (error) {
      console.error('통계 조회 오류:', error);
      res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 복약 알림 조회 (요구사항 6.2)
   * GET /api/medications/reminders
   */
  static async getReminders(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const reminders = await MedicationService.getMedicationReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error('알림 조회 오류:', error);
      res.status(500).json({ error: '알림 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 약물 검색 (요구사항 6.1)
   * GET /api/medications/search
   */
  static async searchMedications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        res.status(400).json({ error: '검색어가 필요합니다' });
        return;
      }

      const medications = await MedicationService.searchMedications(userId, searchTerm);
      res.json(medications);
    } catch (error) {
      console.error('약물 검색 오류:', error);
      res.status(500).json({ error: '약물 검색 중 오류가 발생했습니다' });
    }
  }

  /**
   * 만료 예정 약물 조회 (요구사항 6.1)
   * GET /api/medications/expiring
   */
  static async getExpiringMedications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: '인증이 필요합니다' });
        return;
      }

      const daysAhead = parseInt(req.query.days as string) || 7;
      const medications = await MedicationService.getExpiringMedications(userId, daysAhead);
      res.json(medications);
    } catch (error) {
      console.error('만료 예정 약물 조회 오류:', error);
      res.status(500).json({ error: '만료 예정 약물 조회 중 오류가 발생했습니다' });
    }
  }

  /**
   * 새 약물 상호작용 미리 확인 (요구사항 6.3)
   * POST /api/medications/check-interactions
   */
  static async checkNewMedicationInteractions(req: Request, res: Response): Promise<void> {
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

      const interactions = await DrugInteractionModel.checkNewMedicationInteractions(
        userId, 
        medicationName, 
        genericName
      );
      res.json(interactions);
    } catch (error) {
      console.error('상호작용 미리 확인 오류:', error);
      res.status(500).json({ error: '상호작용 확인 중 오류가 발생했습니다' });
    }
  }
}