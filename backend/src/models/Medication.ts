import prisma from '../config/database';
import { 
  CreateMedicationRequest, 
  UpdateMedicationRequest, 
  MedicationWithSchedules,
  MedicationScheduleRequest,
  DosageLogRequest,
  SideEffectRequest
} from '../types/medication';

export class MedicationModel {
  /**
   * 약물 등록 (요구사항 6.1)
   */
  static async create(userId: string, medicationData: CreateMedicationRequest): Promise<MedicationWithSchedules> {
    const medication = await prisma.medication.create({
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

    return medication as MedicationWithSchedules;
  }

  /**
   * 사용자의 모든 약물 조회 (요구사항 6.1)
   */
  static async findByUserId(userId: string, includeInactive: boolean = false): Promise<MedicationWithSchedules[]> {
    const medications = await prisma.medication.findMany({
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

    return medications as MedicationWithSchedules[];
  }

  /**
   * 약물 정보 업데이트 (요구사항 6.1)
   */
  static async update(id: string, userId: string, updateData: UpdateMedicationRequest): Promise<MedicationWithSchedules> {
    const medication = await prisma.medication.update({
      where: { 
        id,
        userId // 사용자 소유 확인
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

    return medication as MedicationWithSchedules;
  }

  /**
   * 약물 삭제 (비활성화) (요구사항 6.1)
   */
  static async delete(id: string, userId: string): Promise<void> {
    await prisma.medication.update({
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

  /**
   * 복약 스케줄 생성 (요구사항 6.1, 6.2)
   */
  static async createSchedule(medicationId: string, scheduleData: MedicationScheduleRequest): Promise<any> {
    return await prisma.medicationSchedule.create({
      data: {
        medicationId,
        timeOfDay: scheduleData.timeOfDay,
        scheduledTime: scheduleData.scheduledTime,
        dosage: scheduleData.dosage,
        instructions: scheduleData.instructions,
      }
    });
  }

  /**
   * 복약 기록 추가 (요구사항 6.2, 6.5)
   */
  static async logDosage(medicationId: string, dosageData: DosageLogRequest): Promise<any> {
    return await prisma.dosageLog.create({
      data: {
        medicationId,
        takenAt: dosageData.takenAt ? new Date(dosageData.takenAt) : new Date(),
        dosageTaken: dosageData.dosageTaken,
        notes: dosageData.notes,
      }
    });
  }

  /**
   * 부작용 기록 (요구사항 6.4)
   */
  static async reportSideEffect(medicationId: string, sideEffectData: SideEffectRequest): Promise<any> {
    return await prisma.sideEffect.create({
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

  /**
   * 오늘의 복약 스케줄 조회 (요구사항 6.1, 6.2)
   */
  static async getTodaySchedule(userId: string): Promise<any[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const medications = await prisma.medication.findMany({
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

    // 스케줄과 복약 기록을 매칭하여 완료 상태 확인
    const scheduleWithStatus = medications.flatMap(medication => 
      medication.medicationSchedules.map(schedule => ({
        medicationId: medication.id,
        medicationName: medication.name,
        schedule,
        isTaken: medication.dosageLogs.some(log => 
          log.dosageTaken === schedule.dosage &&
          new Date(log.takenAt).getHours() === parseInt(schedule.scheduledTime.split(':')[0])
        )
      }))
    );

    return scheduleWithStatus;
  }

  /**
   * 복약 순응도 계산 (요구사항 6.5)
   */
  static async calculateAdherence(medicationId: string, days: number = 30): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const medication = await prisma.medication.findUnique({
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

    if (!medication) return 0;

    const expectedDoses = medication.medicationSchedules.length * days;
    const actualDoses = medication.dosageLogs.length;

    return expectedDoses > 0 ? Math.min((actualDoses / expectedDoses) * 100, 100) : 0;
  }
}