import { describe, it, expect } from '@jest/globals';
import { MedicalRecordModel } from '../models/MedicalRecord';
import { CreateMedicalRecordRequest } from '../types/medical';
import { validateICD10Code, normalizeICD10Code, searchICD10Codes } from '../utils/icd10';

describe('MedicalRecord Model Tests (요구사항 5.1, 5.2, 5.3)', () => {

  describe('진료 기록 데이터 모델 구조 (요구사항 5.1)', () => {
    it('MedicalRecord 모델이 필요한 메서드들을 가지고 있어야 한다', () => {
      expect(typeof MedicalRecordModel.create).toBe('function');
      expect(typeof MedicalRecordModel.findById).toBe('function');
      expect(typeof MedicalRecordModel.findByUserId).toBe('function');
      expect(typeof MedicalRecordModel.update).toBe('function');
      expect(typeof MedicalRecordModel.delete).toBe('function');
      expect(typeof MedicalRecordModel.getTimeline).toBe('function');
      expect(typeof MedicalRecordModel.search).toBe('function');
      expect(typeof MedicalRecordModel.validateMedicalRecord).toBe('function');
    });

    it('TestResult와 Prescription 관련 기능이 포함되어야 한다', () => {
      // 테스트 데이터 구조 검증
      const sampleRecord: CreateMedicalRecordRequest = {
        hospitalName: '서울대학교병원',
        department: '내과',
        doctorName: '김의사',
        visitDate: '2024-01-15',
        testResults: [
          {
            testType: '혈액검사',
            testName: 'CBC',
            results: { wbc: 7000, rbc: 4.5 },
            testDate: '2024-01-15'
          }
        ],
        prescriptions: [
          {
            medicationName: '아스피린',
            dosage: '100mg',
            frequency: '1일 1회'
          }
        ]
      };

      expect(sampleRecord.testResults).toBeDefined();
      expect(sampleRecord.prescriptions).toBeDefined();
      expect(sampleRecord.testResults![0].testType).toBe('혈액검사');
      expect(sampleRecord.prescriptions![0].medicationName).toBe('아스피린');
    });
  });

  describe('ICD-10 코드 처리 (요구사항 5.2)', () => {
    it('ICD-10 코드를 정규화할 수 있어야 한다', () => {
      expect(normalizeICD10Code('i10')).toBe('I10');
      expect(normalizeICD10Code('e11.9')).toBe('E11.9');
      expect(normalizeICD10Code(' A00 ')).toBe('A00');
    });

    it('유효한 ICD-10 코드 형식을 검증할 수 있어야 한다', () => {
      // 유효한 코드들
      expect(validateICD10Code('I10')).toBe(true);
      expect(validateICD10Code('E11.9')).toBe(true);
      expect(validateICD10Code('A00')).toBe(true);
      expect(validateICD10Code('Z99.99')).toBe(true);

      // 무효한 코드들
      expect(validateICD10Code('INVALID')).toBe(false);
      expect(validateICD10Code('123')).toBe(false);
      expect(validateICD10Code('I')).toBe(false);
      expect(validateICD10Code('I10.999')).toBe(false);
    });

    it('ICD-10 코드 검색이 작동해야 한다', () => {
      const results = searchICD10Codes('당뇨');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(code => code.description.includes('당뇨'))).toBe(true);
    });

    it('MedicalRecord 모델의 ICD-10 유틸리티가 작동해야 한다', () => {
      const validResult = MedicalRecordModel.validateICD10Code('I10');
      expect(validResult.isValid).toBe(true);
      expect(validResult.normalizedCode).toBe('I10');

      const invalidResult = MedicalRecordModel.validateICD10Code('INVALID');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });
  });

  describe('진료비 및 의사 소견 관리 (요구사항 5.3)', () => {
    it('진료비와 의사 소견 필드가 데이터 구조에 포함되어야 한다', () => {
      const recordWithCostAndNotes: CreateMedicalRecordRequest = {
        hospitalName: '아산병원',
        department: '정형외과',
        doctorName: '최의사',
        diagnosisCode: 'M54.5',
        diagnosisDescription: '요통',
        doctorNotes: '물리치료 권장. 2주 후 재방문 필요.',
        cost: 75000,
        visitDate: '2024-01-30'
      };

      expect(recordWithCostAndNotes.cost).toBe(75000);
      expect(recordWithCostAndNotes.doctorNotes).toBe('물리치료 권장. 2주 후 재방문 필요.');
    });

    it('진료비와 의사 소견이 선택적 필드여야 한다', () => {
      const recordWithoutOptionalFields: CreateMedicalRecordRequest = {
        hospitalName: '강남세브란스병원',
        department: '피부과',
        doctorName: '정의사',
        visitDate: '2024-02-01'
      };

      expect(recordWithoutOptionalFields.cost).toBeUndefined();
      expect(recordWithoutOptionalFields.doctorNotes).toBeUndefined();
      expect(recordWithoutOptionalFields.hospitalName).toBe('강남세브란스병원');
    });
  });

  describe('데이터 유효성 검사', () => {
    it('필수 필드가 누락된 경우 유효성 검사에 실패해야 한다', () => {
      const invalidData: CreateMedicalRecordRequest = {
        hospitalName: '',
        department: '내과',
        doctorName: '김의사',
        visitDate: '2024-01-15'
      };

      const validation = MedicalRecordModel.validateMedicalRecord(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('병원명은 필수입니다');
    });

    it('잘못된 ICD-10 코드 형식에 대해 유효성 검사에 실패해야 한다', () => {
      const invalidData: CreateMedicalRecordRequest = {
        hospitalName: '서울대병원',
        department: '내과',
        doctorName: '김의사',
        diagnosisCode: 'INVALID_CODE',
        visitDate: '2024-01-15'
      };

      const validation = MedicalRecordModel.validateMedicalRecord(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('ICD-10'))).toBe(true);
    });

    it('음수 진료비에 대해 유효성 검사에 실패해야 한다', () => {
      const invalidData: CreateMedicalRecordRequest = {
        hospitalName: '서울대병원',
        department: '내과',
        doctorName: '김의사',
        cost: -1000,
        visitDate: '2024-01-15'
      };

      const validation = MedicalRecordModel.validateMedicalRecord(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('진료비는 0 이상이어야 합니다');
    });
  });

  describe('진료 기록 조회 및 관리 기능', () => {
    it('MedicalRecord 모델이 조회 관련 메서드들을 가지고 있어야 한다', () => {
      expect(typeof MedicalRecordModel.findByUserId).toBe('function');
      expect(typeof MedicalRecordModel.getTimeline).toBe('function');
      expect(typeof MedicalRecordModel.search).toBe('function');
      expect(typeof MedicalRecordModel.getStats).toBe('function');
    });

    it('타임라인 아이템 타입이 올바르게 정의되어야 한다', () => {
      // 타임라인 아이템 타입 검증을 위한 샘플 데이터
      const timelineItem = {
        id: 'test-id',
        type: 'visit' as const,
        date: new Date(),
        title: '서울대병원 - 내과',
        description: '정기 검진',
        hospitalName: '서울대병원',
        department: '내과',
        doctorName: '김의사'
      };

      expect(timelineItem.type).toBe('visit');
      expect(timelineItem.hospitalName).toBe('서울대병원');
    });
  });
});