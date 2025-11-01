import { ReferenceRangeModel } from '../models/ReferenceRange';
import { TestCategory } from '../types/medical';

export class ReferenceRangeService {
  /**
   * 기본 정상 범위 데이터 초기화 (요구사항 8.2)
   */
  static async initializeDefaultRanges(): Promise<void> {
    try {
      await ReferenceRangeModel.seedDefaultRanges();
      console.log('기본 정상 범위 데이터가 성공적으로 초기화되었습니다.');
    } catch (error) {
      console.error('기본 정상 범위 데이터 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 검사의 정상 범위 조회 (요구사항 8.2)
   */
  static async getReferenceRange(
    testName: string,
    testCategory: TestCategory,
    age?: number,
    gender?: 'male' | 'female'
  ) {
    return await ReferenceRangeModel.findByTest(testName, testCategory, age, gender);
  }

  /**
   * 모든 정상 범위 조회 (요구사항 8.2)
   */
  static async getAllReferenceRanges(testCategory?: TestCategory) {
    return await ReferenceRangeModel.findAll(testCategory);
  }

  /**
   * 검사 결과 값이 정상 범위 내인지 확인 (요구사항 8.2)
   */
  static async validateTestValue(
    testName: string,
    testCategory: TestCategory,
    value: number | string,
    age?: number,
    gender?: 'male' | 'female'
  ) {
    return await ReferenceRangeModel.checkNormalRange(testName, testCategory, value, age, gender);
  }

  /**
   * 새로운 정상 범위 추가
   */
  static async addReferenceRange(data: {
    testName: string;
    testCategory: TestCategory;
    unit?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: 'male' | 'female' | 'all';
    minValue?: number;
    maxValue?: number;
    textRange?: string;
    source?: string;
  }) {
    return await ReferenceRangeModel.create(data);
  }

  /**
   * 정상 범위 업데이트
   */
  static async updateReferenceRange(id: string, data: Partial<{
    unit: string;
    ageMin: number;
    ageMax: number;
    gender: string;
    minValue: number;
    maxValue: number;
    textRange: string;
    source: string;
    isActive: boolean;
  }>) {
    return await ReferenceRangeModel.update(id, data);
  }

  /**
   * 정상 범위 삭제 (비활성화)
   */
  static async deleteReferenceRange(id: string) {
    return await ReferenceRangeModel.delete(id);
  }
}