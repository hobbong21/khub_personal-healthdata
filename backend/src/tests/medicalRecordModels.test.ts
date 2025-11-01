import { MedicalRecordModel } from '../models/MedicalRecordV2';
import { PrescriptionModel } from '../models/Prescription';
import { CreateMedicalRecordRequest, CreatePrescriptionRequest } from '../types/medical';

describe('Medical Record Models (Task 5.1)', () => {
  describe('MedicalRecordModel', () => {
    describe('validateMedicalRecord', () => {
      it('should validate required fields', () => {
        const invalidRecord: CreateMedicalRecordRequest = {
          hospitalName: '',
          department: '',
          doctorName: '',
          visitDate: ''
        };

        const result = MedicalRecordModel.validateMedicalRecord(invalidRecord);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('병원명은 필수입니다');
        expect(result.errors).toContain('진료과는 필수입니다');
        expect(result.errors).toContain('의사명은 필수입니다');
      });

      it('should validate ICD-10 diagnosis codes', () => {
        const recordWithInvalidICD: CreateMedicalRecordRequest = {
          hospitalName: '서울대학교병원',
          department: '내과',
          doctorName: '김의사',
          visitDate: '2024-01-01',
          diagnosisCode: 'INVALID'
        };

        const result = MedicalRecordModel.validateMedicalRecord(recordWithInvalidICD);
        
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('ICD-10'))).toBe(true);
      });

      it('should validate cost field (요구사항 5.3)', () => {
        const recordWithNegativeCost: CreateMedicalRecordRequest = {
          hospitalName: '서울대학교병원',
          department: '내과',
          doctorName: '김의사',
          visitDate: '2024-01-01',
          cost: -1000
        };

        const result = MedicalRecordModel.validateMedicalRecord(recordWithNegativeCost);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('진료비는 0 이상이어야 합니다');
      });

      it('should pass validation for valid record with doctor notes and cost (요구사항 5.3)', () => {
        const validRecord: CreateMedicalRecordRequest = {
          hospitalName: '서울대학교병원',
          department: '내과',
          doctorName: '김의사',
          visitDate: '2024-01-01',
          diagnosisCode: 'I10',
          diagnosisDescription: '본태성 고혈압',
          doctorNotes: '혈압 관리 필요', // 의사 소견 (요구사항 5.3)
          cost: 50000 // 진료비 (요구사항 5.3)
        };

        const result = MedicalRecordModel.validateMedicalRecord(validRecord);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe('ICD-10 Code Validation (요구사항 5.2)', () => {
      it('should validate ICD-10 codes', () => {
        const validCodes = ['A00', 'B15.1', 'I10', 'E11.9'];
        const invalidCodes = ['ABC', '123', 'A', 'A00.123'];

        validCodes.forEach(code => {
          const result = MedicalRecordModel.validateICD10Code(code);
          expect(result.isValid).toBe(true);
        });

        invalidCodes.forEach(code => {
          const result = MedicalRecordModel.validateICD10Code(code);
          expect(result.isValid).toBe(false);
        });
      });

      it('should search ICD-10 codes', async () => {
        const results = await MedicalRecordModel.searchICD10Codes('고혈압');
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
      });

      it('should get ICD-10 code details', async () => {
        const result = await MedicalRecordModel.getICD10CodeDetails('I10');
        expect(result).toBeTruthy();
        expect(result?.code).toBe('I10');
        expect(result?.description).toContain('고혈압');
      });
    });
  });

  describe('PrescriptionModel (요구사항 5.1)', () => {
    describe('validatePrescription', () => {
      it('should validate required fields', () => {
        const invalidPrescription: CreatePrescriptionRequest = {
          medicationName: '',
          dosage: '',
          frequency: ''
        };

        const result = PrescriptionModel.validatePrescription(invalidPrescription);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('약물명은 필수입니다');
        expect(result.errors).toContain('용량은 필수입니다');
        expect(result.errors).toContain('복용 빈도는 필수입니다');
      });

      it('should validate field lengths', () => {
        const prescriptionWithLongFields: CreatePrescriptionRequest = {
          medicationName: 'A'.repeat(201),
          dosage: 'B'.repeat(101),
          frequency: 'C'.repeat(101),
          duration: 'D'.repeat(101),
          instructions: 'E'.repeat(501)
        };

        const result = PrescriptionModel.validatePrescription(prescriptionWithLongFields);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('약물명은 200자를 초과할 수 없습니다');
        expect(result.errors).toContain('용량 정보는 100자를 초과할 수 없습니다');
        expect(result.errors).toContain('복용 빈도 정보는 100자를 초과할 수 없습니다');
        expect(result.errors).toContain('복용 기간 정보는 100자를 초과할 수 없습니다');
        expect(result.errors).toContain('복용 지시사항은 500자를 초과할 수 없습니다');
      });

      it('should pass validation for valid prescription', () => {
        const validPrescription: CreatePrescriptionRequest = {
          medicationName: '아스피린',
          dosage: '100mg',
          frequency: '1일 1회',
          duration: '30일',
          instructions: '식후 복용'
        };

        const result = PrescriptionModel.validatePrescription(validPrescription);
        
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });
});