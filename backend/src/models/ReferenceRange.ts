import { PrismaClient } from '@prisma/client';
import { ReferenceRange, TestCategory } from '../types/medical';

const prisma = new PrismaClient();

export class ReferenceRangeModel {
  // 정상 범위 생성 (요구사항 8.2)
  static async create(data: Omit<ReferenceRange, 'ranges'> & {
    ageMin?: number;
    ageMax?: number;
    gender?: 'male' | 'female' | 'all';
    minValue?: number;
    maxValue?: number;
    textRange?: string;
    source?: string;
  }) {
    return await prisma.referenceRange.create({
      data: {
        testName: data.testName,
        testCategory: data.testCategory,
        unit: data.unit,
        ageMin: data.ageMin,
        ageMax: data.ageMax,
        gender: data.gender || 'all',
        minValue: data.minValue,
        maxValue: data.maxValue,
        textRange: data.textRange,
        source: data.source
      }
    });
  }

  // 특정 검사의 정상 범위 조회 (요구사항 8.2)
  static async findByTest(
    testName: string, 
    testCategory: TestCategory,
    age?: number,
    gender?: 'male' | 'female'
  ) {
    const where: any = {
      testName,
      testCategory,
      isActive: true
    };

    // 나이 범위 필터링
    if (age !== undefined) {
      where.OR = [
        { ageMin: null, ageMax: null }, // 나이 제한 없음
        { ageMin: { lte: age }, ageMax: { gte: age } }, // 나이 범위 내
        { ageMin: { lte: age }, ageMax: null }, // 최소 나이만 설정
        { ageMin: null, ageMax: { gte: age } } // 최대 나이만 설정
      ];
    }

    // 성별 필터링
    if (gender) {
      where.gender = { in: [gender, 'all'] };
    }

    return await prisma.referenceRange.findMany({
      where,
      orderBy: [
        { gender: 'desc' }, // 성별 특화 범위 우선
        { ageMin: 'asc' }   // 나이 순서
      ]
    });
  }

  // 모든 검사의 정상 범위 조회 (요구사항 8.2)
  static async findAll(testCategory?: TestCategory) {
    const where: any = { isActive: true };
    if (testCategory) {
      where.testCategory = testCategory;
    }

    return await prisma.referenceRange.findMany({
      where,
      orderBy: [
        { testCategory: 'asc' },
        { testName: 'asc' }
      ]
    });
  }

  // 정상 범위 업데이트
  static async update(id: string, data: Partial<{
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
    return await prisma.referenceRange.update({
      where: { id },
      data
    });
  }

  // 정상 범위 삭제 (비활성화)
  static async delete(id: string) {
    return await prisma.referenceRange.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // 기본 정상 범위 데이터 초기화 (요구사항 8.2)
  static async seedDefaultRanges() {
    const defaultRanges = [
      // 혈액검사 - CBC (Complete Blood Count)
      { testName: 'Hemoglobin', testCategory: 'blood', unit: 'g/dL', gender: 'male', minValue: 13.5, maxValue: 17.5, source: '대한진단검사의학회' },
      { testName: 'Hemoglobin', testCategory: 'blood', unit: 'g/dL', gender: 'female', minValue: 12.0, maxValue: 15.5, source: '대한진단검사의학회' },
      { testName: 'Hematocrit', testCategory: 'blood', unit: '%', gender: 'male', minValue: 41.0, maxValue: 53.0, source: '대한진단검사의학회' },
      { testName: 'Hematocrit', testCategory: 'blood', unit: '%', gender: 'female', minValue: 36.0, maxValue: 46.0, source: '대한진단검사의학회' },
      { testName: 'WBC', testCategory: 'blood', unit: '/μL', minValue: 4000, maxValue: 10000, source: '대한진단검사의학회' },
      { testName: 'Platelet', testCategory: 'blood', unit: '/μL', minValue: 150000, maxValue: 450000, source: '대한진단검사의학회' },

      // 혈액검사 - 간기능
      { testName: 'AST', testCategory: 'blood', unit: 'U/L', minValue: 0, maxValue: 40, source: '대한진단검사의학회' },
      { testName: 'ALT', testCategory: 'blood', unit: 'U/L', minValue: 0, maxValue: 40, source: '대한진단검사의학회' },
      { testName: 'Total Bilirubin', testCategory: 'blood', unit: 'mg/dL', minValue: 0.2, maxValue: 1.2, source: '대한진단검사의학회' },
      { testName: 'Albumin', testCategory: 'blood', unit: 'g/dL', minValue: 3.5, maxValue: 5.0, source: '대한진단검사의학회' },

      // 혈액검사 - 신장기능
      { testName: 'Creatinine', testCategory: 'blood', unit: 'mg/dL', gender: 'male', minValue: 0.7, maxValue: 1.3, source: '대한진단검사의학회' },
      { testName: 'Creatinine', testCategory: 'blood', unit: 'mg/dL', gender: 'female', minValue: 0.6, maxValue: 1.1, source: '대한진단검사의학회' },
      { testName: 'BUN', testCategory: 'blood', unit: 'mg/dL', minValue: 8, maxValue: 20, source: '대한진단검사의학회' },

      // 혈액검사 - 지질
      { testName: 'Total Cholesterol', testCategory: 'blood', unit: 'mg/dL', minValue: 0, maxValue: 200, source: '대한진단검사의학회' },
      { testName: 'HDL Cholesterol', testCategory: 'blood', unit: 'mg/dL', gender: 'male', minValue: 40, maxValue: 999, source: '대한진단검사의학회' },
      { testName: 'HDL Cholesterol', testCategory: 'blood', unit: 'mg/dL', gender: 'female', minValue: 50, maxValue: 999, source: '대한진단검사의학회' },
      { testName: 'LDL Cholesterol', testCategory: 'blood', unit: 'mg/dL', minValue: 0, maxValue: 130, source: '대한진단검사의학회' },
      { testName: 'Triglyceride', testCategory: 'blood', unit: 'mg/dL', minValue: 0, maxValue: 150, source: '대한진단검사의학회' },

      // 혈액검사 - 당뇨
      { testName: 'Glucose', testCategory: 'blood', unit: 'mg/dL', minValue: 70, maxValue: 100, source: '대한당뇨병학회' },
      { testName: 'HbA1c', testCategory: 'blood', unit: '%', minValue: 0, maxValue: 5.7, source: '대한당뇨병학회' },

      // 혈액검사 - 갑상선
      { testName: 'TSH', testCategory: 'blood', unit: 'μIU/mL', minValue: 0.4, maxValue: 4.0, source: '대한내분비학회' },
      { testName: 'Free T4', testCategory: 'blood', unit: 'ng/dL', minValue: 0.8, maxValue: 1.8, source: '대한내분비학회' },

      // 소변검사
      { testName: 'Protein', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' },
      { testName: 'Glucose', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' },
      { testName: 'Blood', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' },
      { testName: 'Ketone', testCategory: 'urine', textRange: 'Negative', source: '대한진단검사의학회' }
    ];

    for (const range of defaultRanges) {
      await prisma.referenceRange.upsert({
        where: {
          id: `${range.testName}_${range.testCategory}_${range.gender || 'all'}`
        },
        update: {},
        create: range
      });
    }
  }

  // 검사 결과 값이 정상 범위 내인지 확인 (요구사항 8.2)
  static async checkNormalRange(
    testName: string,
    testCategory: TestCategory,
    value: number | string,
    age?: number,
    gender?: 'male' | 'female'
  ): Promise<{ isNormal: boolean; status: 'normal' | 'abnormal' | 'critical'; message?: string }> {
    const ranges = await this.findByTest(testName, testCategory, age, gender);
    
    if (ranges.length === 0) {
      return { isNormal: true, status: 'normal', message: '정상 범위 정보 없음' };
    }

    // 가장 적합한 범위 선택 (성별, 나이 고려)
    const bestRange = ranges[0];

    if (typeof value === 'string') {
      // 텍스트 값 비교 (예: "Negative", "Positive")
      if (bestRange.textRange) {
        const isNormal = value.toLowerCase() === bestRange.textRange.toLowerCase();
        return {
          isNormal,
          status: isNormal ? 'normal' : 'abnormal',
          message: `정상: ${bestRange.textRange}`
        };
      }
      return { isNormal: true, status: 'normal', message: '텍스트 값 비교 불가' };
    }

    // 숫자 값 비교
    if (bestRange.minValue !== null && bestRange.maxValue !== null) {
      const isNormal = value >= bestRange.minValue && value <= bestRange.maxValue;
      let status: 'normal' | 'abnormal' | 'critical' = 'normal';
      
      if (!isNormal) {
        // Critical 범위 판정 (정상 범위의 2배 이상 벗어난 경우)
        const range = bestRange.maxValue - bestRange.minValue;
        const deviation = Math.max(
          Math.abs(value - bestRange.minValue),
          Math.abs(value - bestRange.maxValue)
        );
        
        status = deviation > range ? 'critical' : 'abnormal';
      }

      return {
        isNormal,
        status,
        message: `정상 범위: ${bestRange.minValue}-${bestRange.maxValue} ${bestRange.unit || ''}`
      };
    }

    return { isNormal: true, status: 'normal', message: '정상 범위 정보 불완전' };
  }
}