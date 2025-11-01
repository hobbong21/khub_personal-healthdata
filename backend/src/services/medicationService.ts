import { MedicationModel } from '../models/Medication';
import { DrugInteractionModel } from '../models/DrugInteraction';
import { 
  CreateMedicationRequest, 
  UpdateMedicationRequest,
  MedicationWithSchedules,
  MedicationScheduleRequest,
  DosageLogRequest,
  SideEffectRequest,
  TodayScheduleItem,
  DrugInteractionCheck,
  MedicationStats
} from '../types/medication';

export class MedicationService {
  /**
   * 약물 등록 (요구사항 6.1)
   */
  static async createMedication(userId: string, medicationData: CreateMedicationRequest): Promise<MedicationWithSchedules> {
    // 새 약물과 기존 약물 간 상호작용 확인 (요구사항 6.3)
    const interactions = await DrugInteractionModel.checkNewMedicationInteractions(
      userId, 
      medicationData.name, 
      medicationData.genericName
    );

    const medication = await MedicationModel.create(userId, medicationData);

    // 상호작용이 발견되면 경고 로그 (실제 구현에서는 알림 서비스 호출)
    if (interactions.length > 0) {
      console.warn(`Drug interactions found for ${medicationData.name}:`, interactions);
    }

    return medication;
  }

  /**
   * 사용자의 모든 약물 조회 (요구사항 6.1)
   */
  static async getUserMedications(userId: string, includeInactive: boolean = false): Promise<MedicationWithSchedules[]> {
    return await MedicationModel.findByUserId(userId, includeInactive);
  }

  /**
   * 약물 정보 수정 (요구사항 6.1)
   */
  static async updateMedication(
    medicationId: string, 
    userId: string, 
    updateData: UpdateMedicationRequest
  ): Promise<MedicationWithSchedules> {
    return await MedicationModel.update(medicationId, userId, updateData);
  }

  /**
   * 약물 삭제 (비활성화) (요구사항 6.1)
   */
  static async deleteMedication(medicationId: string, userId: string): Promise<void> {
    await MedicationModel.delete(medicationId, userId);
  }

  /**
   * 복약 스케줄 생성 (요구사항 6.1, 6.2)
   */
  static async createMedicationSchedule(
    medicationId: string, 
    scheduleData: MedicationScheduleRequest
  ): Promise<any> {
    return await MedicationModel.createSchedule(medicationId, scheduleData);
  }

  /**
   * 복약 기록 (요구사항 6.2, 6.5)
   */
  static async logDosage(medicationId: string, dosageData: DosageLogRequest): Promise<any> {
    return await MedicationModel.logDosage(medicationId, dosageData);
  }

  /**
   * 부작용 기록 (요구사항 6.4)
   */
  static async reportSideEffect(medicationId: string, sideEffectData: SideEffectRequest): Promise<any> {
    return await MedicationModel.reportSideEffect(medicationId, sideEffectData);
  }

  /**
   * 오늘의 복약 스케줄 조회 (요구사항 6.1, 6.2)
   */
  static async getTodaySchedule(userId: string): Promise<TodayScheduleItem[]> {
    return await MedicationModel.getTodaySchedule(userId);
  }

  /**
   * 약물 상호작용 확인 (요구사항 6.3)
   */
  static async checkDrugInteractions(userId: string): Promise<DrugInteractionCheck[]> {
    return await DrugInteractionModel.checkUserMedicationInteractions(userId);
  }

  /**
   * 복약 순응도 계산 (요구사항 6.5)
   */
  static async calculateAdherence(medicationId: string, days: number = 30): Promise<number> {
    return await MedicationModel.calculateAdherence(medicationId, days);
  }

  /**
   * 약물 관리 통계 (요구사항 6.1, 6.2, 6.3)
   */
  static async getMedicationStats(userId: string): Promise<MedicationStats> {
    const medications = await MedicationModel.findByUserId(userId);
    const todaySchedule = await MedicationModel.getTodaySchedule(userId);
    const interactions = await DrugInteractionModel.checkUserMedicationInteractions(userId);

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

  /**
   * 복약 알림이 필요한 약물 조회 (요구사항 6.2)
   */
  static async getMedicationReminders(userId: string): Promise<any[]> {
    const todaySchedule = await MedicationModel.getTodaySchedule(userId);
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
        // 연체된 것을 먼저, 그 다음 시간순
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.scheduledTime.localeCompare(b.scheduledTime);
      });
  }

  /**
   * 약물 검색 (이름 또는 일반명으로) (요구사항 6.1)
   */
  static async searchMedications(userId: string, searchTerm: string): Promise<MedicationWithSchedules[]> {
    const allMedications = await MedicationModel.findByUserId(userId, true);
    const searchLower = searchTerm.toLowerCase();

    return allMedications.filter(med => 
      med.name.toLowerCase().includes(searchLower) ||
      (med.genericName && med.genericName.toLowerCase().includes(searchLower)) ||
      (med.purpose && med.purpose.toLowerCase().includes(searchLower))
    );
  }

  /**
   * 만료 예정 약물 조회 (요구사항 6.1)
   */
  static async getExpiringMedications(userId: string, daysAhead: number = 7): Promise<MedicationWithSchedules[]> {
    const medications = await MedicationModel.findByUserId(userId);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return medications.filter(med => 
      med.endDate && 
      med.endDate <= futureDate && 
      med.endDate >= new Date() &&
      med.isActive
    );
  }
}