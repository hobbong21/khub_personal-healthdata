import { TestItem, TestResultStatus, TestCategory, BloodTestSubcategory } from '../types/medical';
import { ReferenceRangeModel } from '../models/ReferenceRange';

// 검사 결과 분석 유틸리티 (요구사항 8.2, 8.4)
export class TestResultAnalysis {
  // 검사 항목들의 전체 상태 결정 (요구사항 8.2)
  static determineOverallStatus(testItems: TestItem[]): TestResultStatus {
    if (testItems.some(item => item.status === 'critical')) {
      return 'critical';
    }
    if (testItems.some(item => item.status === 'abnormal')) {
      return 'abnormal';
    }
    if (testItems.some(item => item.status === 'borderline')) {
      return 'borderline';
    }
    if (testItems.some(item => item.status === 'pending')) {
      return 'pending';
    }
    return 'normal';
  }

  // 검사 항목별 상태 분석 (요구사항 8.2)
  static async analyzeTestItems(
    testItems: TestItem[],
    testName: string,
    testCategory: TestCategory,
    age?: number,
    gender?: 'male' | 'female'
  ): Promise<TestItem[]> {
    const analyzedItems: TestItem[] = [];

    for (const item of testItems) {
      const rangeCheck = await ReferenceRangeModel.checkNormalRange(
        item.name,
        testCategory,
        item.value,
        age,
        gender
      );

      const analyzedItem: TestItem = {
        ...item,
        status: rangeCheck.status,
        flags: this.generateFlags(item.value, item.referenceRange)
      };

      // 정상 범위 정보가 없는 경우 기본 범위 사용
      if (!item.referenceRange.min && !item.referenceRange.max && !item.referenceRange.text) {
        const ranges = await ReferenceRangeModel.findByTest(item.name, testCategory, age, gender);
        if (ranges.length > 0) {
          const range = ranges[0];
          analyzedItem.referenceRange = {
            min: range.minValue || undefined,
            max: range.maxValue || undefined,
            text: range.textRange || undefined
          };
        }
      }

      analyzedItems.push(analyzedItem);
    }

    return analyzedItems;
  }

  // 검사 결과 플래그 생성 (H: High, L: Low, C: Critical)
  private static generateFlags(value: number | string, referenceRange: TestItem['referenceRange']): string[] {
    const flags: string[] = [];

    if (typeof value === 'number' && referenceRange.min !== undefined && referenceRange.max !== undefined) {
      if (value > referenceRange.max) {
        const ratio = value / referenceRange.max;
        if (ratio > 2) {
          flags.push('C'); // Critical High
        } else {
          flags.push('H'); // High
        }
      } else if (value < referenceRange.min) {
        const ratio = referenceRange.min / value;
        if (ratio > 2) {
          flags.push('C'); // Critical Low
        } else {
          flags.push('L'); // Low
        }
      }
    }

    return flags;
  }

  // 검사 카테고리별 권장 검사 주기 (요구사항 8.4)
  static getRecommendedFrequency(testCategory: TestCategory, testName: string, age: number): string {
    const frequencies: Record<string, string> = {
      // 혈액검사 - 기본
      'blood_cbc': age > 40 ? '매년' : '2년마다',
      'blood_liver_function': age > 40 ? '매년' : '2년마다',
      'blood_kidney_function': age > 40 ? '매년' : '2년마다',
      'blood_lipid_panel': age > 40 ? '매년' : '2년마다',
      'blood_glucose': age > 40 ? '매년' : '2년마다',
      
      // 특별 검사
      'blood_thyroid': '2-3년마다',
      'blood_tumor_markers': age > 50 ? '매년' : '필요시',
      
      // 소변검사
      'urine': '매년',
      
      // 영상검사
      'imaging_chest_xray': '매년',
      'imaging_mammography': age > 40 ? '2년마다' : '필요시',
      'imaging_colonoscopy': age > 50 ? '5년마다' : '필요시',
      
      // 내시경
      'endoscopy_gastroscopy': age > 40 ? '2년마다' : '필요시'
    };

    const key = `${testCategory}_${testName.toLowerCase().replace(/\s+/g, '_')}`;
    return frequencies[key] || '필요시';
  }

  // 검사 결과 해석 메시지 생성 (요구사항 8.2)
  static generateInterpretation(testItems: TestItem[], testCategory: TestCategory): string[] {
    const interpretations: string[] = [];
    const abnormalItems = testItems.filter(item => 
      item.status === 'abnormal' || item.status === 'critical' || item.status === 'borderline'
    );

    if (abnormalItems.length === 0) {
      interpretations.push('모든 검사 항목이 정상 범위 내에 있습니다.');
      return interpretations;
    }

    // 카테고리별 특별 해석
    switch (testCategory) {
      case 'blood':
        interpretations.push(...this.interpretBloodTest(abnormalItems));
        break;
      case 'urine':
        interpretations.push(...this.interpretUrineTest(abnormalItems));
        break;
      case 'imaging':
        interpretations.push('영상 검사 결과에 대해서는 담당 의사와 상담하시기 바랍니다.');
        break;
      default:
        interpretations.push('비정상 결과가 있습니다. 담당 의사와 상담하시기 바랍니다.');
    }

    return interpretations;
  }

  private static interpretBloodTest(abnormalItems: TestItem[]): string[] {
    const interpretations: string[] = [];

    for (const item of abnormalItems) {
      switch (item.name.toLowerCase()) {
        case 'glucose':
        case 'hba1c':
          if (item.status === 'abnormal' || item.status === 'critical') {
            interpretations.push('혈당 수치가 높습니다. 당뇨병 관리가 필요할 수 있습니다.');
          }
          break;
        case 'total cholesterol':
        case 'ldl cholesterol':
        case 'triglyceride':
          if (item.status === 'abnormal' || item.status === 'critical') {
            interpretations.push('지질 수치가 높습니다. 식이요법과 운동이 필요할 수 있습니다.');
          }
          break;
        case 'ast':
        case 'alt':
          if (item.status === 'abnormal' || item.status === 'critical') {
            interpretations.push('간 기능 수치가 높습니다. 간 건강 관리가 필요합니다.');
          }
          break;
        case 'creatinine':
        case 'bun':
          if (item.status === 'abnormal' || item.status === 'critical') {
            interpretations.push('신장 기능 수치에 이상이 있습니다. 신장 건강 관리가 필요합니다.');
          }
          break;
        case 'hemoglobin':
        case 'hematocrit':
          if (item.status === 'abnormal' || item.status === 'critical') {
            interpretations.push('빈혈 수치에 이상이 있습니다. 철분 보충이 필요할 수 있습니다.');
          }
          break;
      }
    }

    if (interpretations.length === 0) {
      interpretations.push('일부 혈액 검사 수치가 정상 범위를 벗어났습니다. 담당 의사와 상담하시기 바랍니다.');
    }

    return interpretations;
  }

  private static interpretUrineTest(abnormalItems: TestItem[]): string[] {
    const interpretations: string[] = [];

    for (const item of abnormalItems) {
      switch (item.name.toLowerCase()) {
        case 'protein':
          if (item.value !== 'negative') {
            interpretations.push('소변에서 단백질이 검출되었습니다. 신장 기능 검사가 필요할 수 있습니다.');
          }
          break;
        case 'glucose':
          if (item.value !== 'negative') {
            interpretations.push('소변에서 당이 검출되었습니다. 혈당 검사가 필요할 수 있습니다.');
          }
          break;
        case 'blood':
          if (item.value !== 'negative') {
            interpretations.push('소변에서 혈액이 검출되었습니다. 추가 검사가 필요할 수 있습니다.');
          }
          break;
      }
    }

    if (interpretations.length === 0) {
      interpretations.push('소변 검사에서 이상 소견이 있습니다. 담당 의사와 상담하시기 바랍니다.');
    }

    return interpretations;
  }

  // 검사 결과 요약 생성 (요구사항 8.4)
  static generateSummary(testItems: TestItem[]): {
    totalItems: number;
    normalCount: number;
    abnormalCount: number;
    criticalCount: number;
    keyFindings: string[];
  } {
    const summary = {
      totalItems: testItems.length,
      normalCount: testItems.filter(item => item.status === 'normal').length,
      abnormalCount: testItems.filter(item => item.status === 'abnormal' || item.status === 'borderline').length,
      criticalCount: testItems.filter(item => item.status === 'critical').length,
      keyFindings: [] as string[]
    };

    // 주요 소견 추출
    const criticalItems = testItems.filter(item => item.status === 'critical');
    const abnormalItems = testItems.filter(item => item.status === 'abnormal');

    if (criticalItems.length > 0) {
      summary.keyFindings.push(`위험 수치: ${criticalItems.map(item => item.name).join(', ')}`);
    }

    if (abnormalItems.length > 0) {
      summary.keyFindings.push(`비정상 수치: ${abnormalItems.slice(0, 3).map(item => item.name).join(', ')}${abnormalItems.length > 3 ? ' 외' : ''}`);
    }

    if (summary.normalCount === summary.totalItems) {
      summary.keyFindings.push('모든 검사 항목 정상');
    }

    return summary;
  }
}