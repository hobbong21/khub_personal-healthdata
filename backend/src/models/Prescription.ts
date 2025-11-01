import { PrismaClient } from '@prisma/client';
import { 
  CreatePrescriptionRequest, 
  PrescriptionResponse,
  UpdatePrescriptionRequest
} from '../types/medical';

const prisma = new PrismaClient();

export class PrescriptionModel {
  /**
   * 처방전 생성 (요구사항 5.1)
   */
  static async create(medicalRecordId: string, data: CreatePrescriptionRequest): Promise<PrescriptionResponse> {
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

  /**
   * 처방전 조회 (요구사항 5.1)
   */
  static async findById(id: string): Promise<PrescriptionResponse | null> {
    const prescription = await prisma.prescription.findUnique({
      where: { id }
    });

    return prescription ? this.formatPrescription(prescription) : null;
  }

  /**
   * 진료 기록별 처방전 목록 조회 (요구사항 5.1)
   */
  static async findByMedicalRecordId(medicalRecordId: string): Promise<PrescriptionResponse[]> {
    const prescriptions = await prisma.prescription.findMany({
      where: { medicalRecordId },
      orderBy: { medicationName: 'asc' }
    });

    return prescriptions.map(this.formatPrescription);
  }

  /**
   * 사용자별 처방전 목록 조회 (요구사항 5.1)
   */
  static async findByUserId(userId: string): Promise<PrescriptionResponse[]> {
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

  /**
   * 처방전 업데이트 (요구사항 5.1)
   */
  static async update(id: string, data: UpdatePrescriptionRequest): Promise<PrescriptionResponse | null> {
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id }
    });

    if (!existingPrescription) return null;

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

  /**
   * 처방전 삭제 (요구사항 5.1)
   */
  static async delete(id: string): Promise<boolean> {
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id }
    });

    if (!existingPrescription) return false;

    await prisma.prescription.delete({
      where: { id }
    });

    return true;
  }

  /**
   * 약물별 처방 이력 조회 (요구사항 5.1)
   */
  static async findByMedicationName(userId: string, medicationName: string): Promise<PrescriptionResponse[]> {
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

  /**
   * 처방전 유효성 검사 (요구사항 5.1)
   */
  static validatePrescription(data: CreatePrescriptionRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!data.medicationName || data.medicationName.trim().length === 0) {
      errors.push('약물명은 필수입니다');
    }

    if (!data.dosage || data.dosage.trim().length === 0) {
      errors.push('용량은 필수입니다');
    }

    if (!data.frequency || data.frequency.trim().length === 0) {
      errors.push('복용 빈도는 필수입니다');
    }

    // 약물명 길이 검증
    if (data.medicationName && data.medicationName.length > 200) {
      errors.push('약물명은 200자를 초과할 수 없습니다');
    }

    // 용량 형식 검증 (기본적인 형식 체크)
    if (data.dosage && data.dosage.length > 100) {
      errors.push('용량 정보는 100자를 초과할 수 없습니다');
    }

    // 복용 빈도 형식 검증
    if (data.frequency && data.frequency.length > 100) {
      errors.push('복용 빈도 정보는 100자를 초과할 수 없습니다');
    }

    // 복용 기간 검증
    if (data.duration && data.duration.length > 100) {
      errors.push('복용 기간 정보는 100자를 초과할 수 없습니다');
    }

    // 복용 지시사항 검증
    if (data.instructions && data.instructions.length > 500) {
      errors.push('복용 지시사항은 500자를 초과할 수 없습니다');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 처방전 포맷팅 헬퍼
   */
  private static formatPrescription(prescription: any): PrescriptionResponse {
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