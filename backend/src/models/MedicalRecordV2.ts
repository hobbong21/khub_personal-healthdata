import { PrismaClient } from '@prisma/client';
import {
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  MedicalRecordResponse,
  MedicalRecordFilters,
  MedicalRecordListResponse,
  MedicalRecordStats,
  MedicalRecordValidationResult,
  ICD10Code
} from '../types/medical';
import {
  normalizeICD10Code,
  searchICD10Codes,
  getICD10CodeDetails,
  validateAndSuggestICD10
} from '../utils/icd10';

const prisma = new PrismaClient();

/**
 * 진료 기록 데이터 모델 (요구사항 5.1, 5.2, 5.3)
 * MedicalRecord, TestResult, Prescription 테이블 관리
 * ICD-10 코드 기반 진단명 저장
 * 진료비 및 의사 소견 관리
 */
export class MedicalRecordModel {
  /**
   * 진료 기록 생성 (요구사항 5.1, 5.2)
   */
  static async create(userId: string, recordData: CreateMedicalRecordRequest): Promise<MedicalRecordResponse> {
    // 유효성 검사
    const validation = this.validateMedicalRecord(recordData);
    if (!validation.isValid) {
      throw new Error(`유효성 검사 실패: ${validation.errors.join(', ')}`);
    }

    const createData: any = {
      userId,
      hospitalName: recordData.hospitalName,
      department: recordData.department,
      doctorName: recordData.doctorName,
      diagnosisCode: recordData.diagnosisCode ? normalizeICD10Code(recordData.diagnosisCode) : null,
      diagnosisDescription: recordData.diagnosisDescription || null,
      doctorNotes: recordData.doctorNotes || null, // 의사 소견 (요구사항 5.3)
      cost: recordData.cost || null, // 진료비 (요구사항 5.3)
      visitDate: new Date(recordData.visitDate)
    };

    // 검사 결과 추가 (요구사항 5.1)
    if (recordData.testResults && recordData.testResults.length > 0) {
      createData.testResults = {
        create: recordData.testResults.map(test => ({
          testCategory: test.testCategory,
          testSubcategory: test.testSubcategory || null,
          testName: test.testName,
          testItems: test.testItems,
          overallStatus: test.overallStatus || 'pending',
          testDate: new Date(test.testDate),
          laboratoryName: test.laboratoryName || null,
          doctorNotes: test.doctorNotes || null,
          imageFiles: test.imageFiles || []
        }))
      };
    }

    // 처방전 추가 (요구사항 5.1)
    if (recordData.prescriptions && recordData.prescriptions.length > 0) {
      createData.prescriptions = {
        create: recordData.prescriptions.map(prescription => ({
          medicationName: prescription.medicationName,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration || null,
          instructions: prescription.instructions || null
        }))
      };
    }

    const medicalRecord = await prisma.medicalRecord.create({
      data: createData,
      include: {
        testResults: true,
        prescriptions: true
      }
    });

    return this.formatMedicalRecord(medicalRecord);
  }

  /**
   * 진료 기록 조회 (요구사항 5.1, 5.2)
   */
  static async findById(id: string, userId: string): Promise<MedicalRecordResponse | null> {
    const medicalRecord = await prisma.medicalRecord.findFirst({
      where: { id, userId },
      include: {
        testResults: true,
        prescriptions: true
      }
    });

    if (!medicalRecord) return null;

    return this.formatMedicalRecord(medicalRecord);
  }

  /**
   * 사용자의 진료 기록 목록 조회 (요구사항 5.2, 5.4, 5.5)
   */
  static async findByUserId(
    userId: string,
    filters: MedicalRecordFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    const where: any = { userId };

    // 진료과별 필터링 (요구사항 5.4)
    if (filters.department) {
      where.department = { contains: filters.department, mode: 'insensitive' };
    }

    // 날짜별 필터링 (요구사항 5.4)
    if (filters.startDate || filters.endDate) {
      where.visitDate = {};
      if (filters.startDate) {
        where.visitDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.visitDate.lte = new Date(filters.endDate);
      }
    }

    // 병원명 필터링
    if (filters.hospitalName) {
      where.hospitalName = { contains: filters.hospitalName, mode: 'insensitive' };
    }

    // 의사명 필터링
    if (filters.doctorName) {
      where.doctorName = { contains: filters.doctorName, mode: 'insensitive' };
    }

    // 진단 코드 필터링 (ICD-10 코드 기반, 요구사항 5.2)
    if (filters.diagnosisCode) {
      where.diagnosisCode = { contains: filters.diagnosisCode, mode: 'insensitive' };
    }

    // 검색 기능 (요구사항 5.4)
    if (filters.searchTerm) {
      where.OR = [
        { hospitalName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { department: { contains: filters.searchTerm, mode: 'insensitive' } },
        { doctorName: { contains: filters.searchTerm, mode: 'insensitive' } },
        { diagnosisDescription: { contains: filters.searchTerm, mode: 'insensitive' } },
        { doctorNotes: { contains: filters.searchTerm, mode: 'insensitive' } }
      ];
    }

    const [records, total] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: {
          testResults: true,
          prescriptions: true
        },
        orderBy: { visitDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.medicalRecord.count({ where })
    ]);

    return {
      records: records.map(record => this.formatMedicalRecord(record)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters
    };
  }

  /**
   * 진료 기록 업데이트 (요구사항 5.2)
   */
  static async update(
    id: string,
    userId: string,
    updateData: UpdateMedicalRecordRequest
  ): Promise<MedicalRecordResponse | null> {
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: { id, userId }
    });

    if (!existingRecord) return null;

    const updatedRecord = await prisma.medicalRecord.update({
      where: { id },
      data: {
        ...(updateData.hospitalName && { hospitalName: updateData.hospitalName }),
        ...(updateData.department && { department: updateData.department }),
        ...(updateData.doctorName && { doctorName: updateData.doctorName }),
        ...(updateData.diagnosisCode !== undefined && { 
          diagnosisCode: updateData.diagnosisCode ? normalizeICD10Code(updateData.diagnosisCode) : null 
        }),
        ...(updateData.diagnosisDescription !== undefined && { diagnosisDescription: updateData.diagnosisDescription }),
        ...(updateData.doctorNotes !== undefined && { doctorNotes: updateData.doctorNotes }), // 의사 소견 (요구사항 5.3)
        ...(updateData.cost !== undefined && { cost: updateData.cost }), // 진료비 (요구사항 5.3)
        ...(updateData.visitDate && { visitDate: new Date(updateData.visitDate) })
      },
      include: {
        testResults: true,
        prescriptions: true
      }
    });

    return this.formatMedicalRecord(updatedRecord);
  }

  /**
   * 진료 기록 삭제 (요구사항 5.2)
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const existingRecord = await prisma.medicalRecord.findFirst({
      where: { id, userId }
    });

    if (!existingRecord) return false;

    await prisma.medicalRecord.delete({
      where: { id }
    });

    return true;
  }

  /**
   * 진료 기록 통계 조회 (요구사항 5.5)
   */
  static async getStats(userId: string): Promise<MedicalRecordStats> {
    const [totalRecords, totalCostResult, departmentStats, recentVisits] = await Promise.all([
      prisma.medicalRecord.count({ where: { userId } }),
      prisma.medicalRecord.aggregate({
        where: { userId, cost: { not: null } },
        _sum: { cost: true }
      }),
      prisma.medicalRecord.groupBy({
        by: ['department'],
        where: { userId },
        _count: { department: true },
        _sum: { cost: true },
        orderBy: { _count: { department: 'desc' } }
      }),
      prisma.medicalRecord.findMany({
        where: { userId },
        include: {
          testResults: true,
          prescriptions: true
        },
        orderBy: { visitDate: 'desc' },
        take: 5
      })
    ]);

    return {
      totalRecords,
      totalCost: totalCostResult._sum.cost || 0,
      departmentStats: departmentStats.map(stat => ({
        department: stat.department,
        count: stat._count?.department || 0,
        totalCost: stat._sum?.cost || 0
      })),
      recentVisits: recentVisits.map(record => this.formatMedicalRecord(record)),
      upcomingAppointments: [] // TODO: 예약 시스템 구현 후 연동
    };
  }

  /**
   * 진료 기록 유효성 검사 (요구사항 5.1)
   */
  static validateMedicalRecord(recordData: CreateMedicalRecordRequest): MedicalRecordValidationResult {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!recordData.hospitalName || recordData.hospitalName.trim().length === 0) {
      errors.push('병원명은 필수입니다');
    }

    if (!recordData.department || recordData.department.trim().length === 0) {
      errors.push('진료과는 필수입니다');
    }

    if (!recordData.doctorName || recordData.doctorName.trim().length === 0) {
      errors.push('의사명은 필수입니다');
    }

    if (!recordData.visitDate) {
      errors.push('진료 날짜는 필수입니다');
    } else {
      const visitDate = new Date(recordData.visitDate);
      if (isNaN(visitDate.getTime())) {
        errors.push('유효한 진료 날짜를 입력해주세요');
      } else if (visitDate > new Date()) {
        errors.push('진료 날짜는 미래일 수 없습니다');
      }
    }

    // ICD-10 코드 검증 (요구사항 5.2)
    if (recordData.diagnosisCode) {
      const validation = validateAndSuggestICD10(recordData.diagnosisCode);
      if (!validation.isValid) {
        errors.push(validation.error || '유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)');
      }
    }

    // 진료비 검증 (요구사항 5.3)
    if (recordData.cost !== undefined && recordData.cost !== null) {
      if (recordData.cost < 0) {
        errors.push('진료비는 0 이상이어야 합니다');
      }
    }

    // 검사 결과 검증
    if (recordData.testResults) {
      recordData.testResults.forEach((test, index) => {
        if (!test.testCategory || test.testCategory.trim().length === 0) {
          errors.push(`검사 결과 ${index + 1}: 검사 카테고리는 필수입니다`);
        }
        if (!test.testName || test.testName.trim().length === 0) {
          errors.push(`검사 결과 ${index + 1}: 검사명은 필수입니다`);
        }
        if (!test.testDate) {
          errors.push(`검사 결과 ${index + 1}: 검사 날짜는 필수입니다`);
        }
        if (!test.testItems || !Array.isArray(test.testItems) || test.testItems.length === 0) {
          errors.push(`검사 결과 ${index + 1}: 검사 항목은 필수입니다`);
        }
      });
    }

    // 처방전 검증
    if (recordData.prescriptions) {
      recordData.prescriptions.forEach((prescription, index) => {
        if (!prescription.medicationName || prescription.medicationName.trim().length === 0) {
          errors.push(`처방전 ${index + 1}: 약물명은 필수입니다`);
        }
        if (!prescription.dosage || prescription.dosage.trim().length === 0) {
          errors.push(`처방전 ${index + 1}: 용량은 필수입니다`);
        }
        if (!prescription.frequency || prescription.frequency.trim().length === 0) {
          errors.push(`처방전 ${index + 1}: 복용 빈도는 필수입니다`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * ICD-10 코드 검색 (요구사항 5.2)
   */
  static async searchICD10Codes(searchTerm: string): Promise<ICD10Code[]> {
    return searchICD10Codes(searchTerm, 20);
  }

  /**
   * ICD-10 코드 상세 정보 조회 (요구사항 5.2)
   */
  static async getICD10CodeDetails(code: string): Promise<ICD10Code | null> {
    return getICD10CodeDetails(code);
  }

  /**
   * ICD-10 코드 유효성 검사 및 제안 (요구사항 5.2)
   */
  static validateICD10Code(code: string): {
    isValid: boolean;
    normalizedCode?: string;
    suggestions?: ICD10Code[];
    error?: string;
  } {
    return validateAndSuggestICD10(code);
  }

  /**
   * 진료 기록 포맷팅 헬퍼
   */
  private static formatMedicalRecord(record: any): MedicalRecordResponse {
    return {
      id: record.id,
      userId: record.userId,
      hospitalName: record.hospitalName,
      department: record.department,
      doctorName: record.doctorName,
      diagnosisCode: record.diagnosisCode || undefined,
      diagnosisDescription: record.diagnosisDescription || undefined,
      doctorNotes: record.doctorNotes || undefined, // 의사 소견 (요구사항 5.3)
      cost: record.cost || undefined, // 진료비 (요구사항 5.3)
      visitDate: record.visitDate,
      createdAt: record.createdAt,
      testResults: record.testResults?.map((test: any) => ({
        id: test.id,
        medicalRecordId: test.medicalRecordId,
        testCategory: test.testCategory,
        testSubcategory: test.testSubcategory,
        testName: test.testName,
        testItems: test.testItems,
        overallStatus: test.overallStatus,
        testDate: test.testDate,
        laboratoryName: test.laboratoryName,
        doctorNotes: test.doctorNotes,
        imageFiles: test.imageFiles || [],
        createdAt: test.createdAt,
        updatedAt: test.updatedAt
      })) || [],
      prescriptions: record.prescriptions?.map((prescription: any) => ({
        id: prescription.id,
        medicalRecordId: prescription.medicalRecordId,
        medicationName: prescription.medicationName,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions
      })) || []
    };
  }
}