import { WearableDataType, WearableDataNormalized, GoogleFitData } from '../types/wearable';

/**
 * Google Fit 데이터 정규화 유틸리티
 * 요구사항 17.3: 데이터 정규화 및 저장
 */
export class GoogleFitDataNormalizer {
  /**
   * Google Fit 원시 데이터를 표준 형식으로 정규화
   */
  static normalizeGoogleFitData(
    rawData: any[], 
    dataType: WearableDataType,
    deviceName: string = 'Google Fit'
  ): WearableDataNormalized[] {
    return rawData.map(point => {
      const normalizedData = this.normalizeDataPoint(point, dataType);
      
      return {
        type: dataType,
        value: normalizedData.value,
        unit: this.getStandardUnit(dataType),
        timestamp: normalizedData.timestamp,
        duration: normalizedData.duration,
        source: {
          deviceType: 'google_fit',
          deviceName,
          appName: this.extractAppName(point),
        },
        metadata: {
          dataSourceId: point.dataSourceId,
          originDataSourceId: point.originDataSourceId,
          modifiedTimeMillis: point.modifiedTimeMillis,
          accuracy: point.accuracy,
          rawValue: point.value,
        },
      };
    });
  }

  /**
   * 개별 데이터 포인트 정규화
   */
  private static normalizeDataPoint(point: any, dataType: WearableDataType): {
    value: number | object;
    timestamp: Date;
    duration?: number;
  } {
    const startTime = new Date(parseInt(point.startTimeNanos) / 1000000);
    const endTime = point.endTimeNanos ? new Date(parseInt(point.endTimeNanos) / 1000000) : undefined;
    const duration = endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : undefined;

    let normalizedValue: number | object;

    // Google Fit 데이터 값 추출 및 변환
    if (point.value && Array.isArray(point.value) && point.value.length > 0) {
      const value = point.value[0];
      
      if (value.intVal !== undefined) {
        normalizedValue = this.convertIntValue(value.intVal, dataType);
      } else if (value.fpVal !== undefined) {
        normalizedValue = this.convertFloatValue(value.fpVal, dataType);
      } else if (value.stringVal !== undefined) {
        normalizedValue = this.convertStringValue(value.stringVal, dataType);
      } else if (value.mapVal !== undefined) {
        normalizedValue = this.convertMapValue(value.mapVal, dataType);
      } else {
        normalizedValue = 0;
      }
    } else {
      normalizedValue = 0;
    }

    return {
      value: normalizedValue,
      timestamp: startTime,
      duration,
    };
  }

  /**
   * 정수 값 변환
   */
  private static convertIntValue(intVal: number, dataType: WearableDataType): number {
    switch (dataType) {
      case 'steps':
        return intVal; // 걸음 수는 그대로
      
      case 'floors_climbed':
        return intVal; // 오른 층수는 그대로
      
      case 'heart_rate':
        return Math.round(intVal); // 심박수는 정수로
      
      case 'calories':
        return Math.round(intVal); // 칼로리는 정수로
      
      case 'sleep':
        // 밀리초를 분으로 변환
        return Math.round(intVal / (1000 * 60));
      
      default:
        return intVal;
    }
  }

  /**
   * 부동소수점 값 변환
   */
  private static convertFloatValue(fpVal: number, dataType: WearableDataType): number {
    switch (dataType) {
      case 'weight':
        return Math.round(fpVal * 100) / 100; // 소수점 둘째 자리까지
      
      case 'distance':
        // 미터를 킬로미터로 변환
        return Math.round((fpVal / 1000) * 100) / 100;
      
      case 'body_temperature':
        return Math.round(fpVal * 10) / 10; // 소수점 첫째 자리까지
      
      case 'blood_oxygen':
        return Math.round(fpVal * 100) / 100; // 퍼센트, 소수점 둘째 자리까지
      
      case 'calories':
        return Math.round(fpVal); // 칼로리는 정수로
      
      default:
        return Math.round(fpVal * 100) / 100;
    }
  }

  /**
   * 문자열 값 변환
   */
  private static convertStringValue(stringVal: string, dataType: WearableDataType): string | number {
    switch (dataType) {
      case 'sleep':
        // 수면 단계 문자열 처리
        const sleepStages: Record<string, number> = {
          'awake': 0,
          'light': 1,
          'deep': 2,
          'rem': 3,
        };
        return sleepStages[stringVal.toLowerCase()] ?? 0;
      
      case 'exercise_sessions':
        // 운동 타입 문자열 처리
        return stringVal;
      
      default:
        // 숫자로 변환 가능한 경우 변환, 아니면 문자열 그대로
        const numValue = parseFloat(stringVal);
        return isNaN(numValue) ? stringVal : numValue;
    }
  }

  /**
   * 맵 값 변환 (복합 데이터)
   */
  private static convertMapValue(mapVal: Record<string, any>, dataType: WearableDataType): object {
    switch (dataType) {
      case 'blood_pressure':
        // 혈압 데이터 (수축기/이완기)
        return {
          systolic: mapVal.systolic?.fpVal || 0,
          diastolic: mapVal.diastolic?.fpVal || 0,
        };
      
      case 'exercise_sessions':
        // 운동 세션 상세 정보
        return {
          activityType: mapVal.activity_type?.stringVal || 'unknown',
          duration: mapVal.duration?.intVal || 0,
          calories: mapVal.calories?.fpVal || 0,
          distance: mapVal.distance?.fpVal || 0,
        };
      
      default:
        return mapVal;
    }
  }

  /**
   * 표준 단위 반환
   */
  private static getStandardUnit(dataType: WearableDataType): string {
    const units: Record<WearableDataType, string> = {
      heart_rate: 'bpm',
      steps: 'count',
      calories: 'kcal',
      sleep: 'minutes',
      weight: 'kg',
      blood_pressure: 'mmHg',
      blood_oxygen: '%',
      body_temperature: '°C',
      exercise_sessions: 'minutes',
      distance: 'km',
      floors_climbed: 'count',
    };
    return units[dataType] || 'unit';
  }

  /**
   * 앱 이름 추출
   */
  private static extractAppName(point: any): string {
    if (point.originDataSourceId) {
      // 데이터 소스 ID에서 앱 이름 추출
      const parts = point.originDataSourceId.split(':');
      if (parts.length >= 3) {
        const packageName = parts[2];
        return this.getAppNameFromPackage(packageName);
      }
    }
    
    if (point.dataSourceId) {
      const parts = point.dataSourceId.split(':');
      if (parts.length >= 3) {
        const packageName = parts[2];
        return this.getAppNameFromPackage(packageName);
      }
    }
    
    return 'Google Fit';
  }

  /**
   * 패키지 이름에서 앱 이름 매핑
   */
  private static getAppNameFromPackage(packageName: string): string {
    const appNames: Record<string, string> = {
      'com.google.android.gms': 'Google Fit',
      'com.samsung.health': 'Samsung Health',
      'com.fitbit.FitbitMobile': 'Fitbit',
      'com.nike.plusgps': 'Nike Run Club',
      'com.strava': 'Strava',
      'com.myfitnesspal.android': 'MyFitnessPal',
      'com.google.android.apps.fitness': 'Google Fit',
      'com.xiaomi.hm.health': 'Mi Fitness',
      'com.huawei.health': 'Huawei Health',
    };
    
    return appNames[packageName] || packageName.split('.').pop() || 'Unknown App';
  }

  /**
   * 데이터 품질 검증
   */
  static validateDataQuality(normalizedData: WearableDataNormalized[]): {
    valid: WearableDataNormalized[];
    invalid: { data: WearableDataNormalized; reason: string }[];
  } {
    const valid: WearableDataNormalized[] = [];
    const invalid: { data: WearableDataNormalized; reason: string }[] = [];

    for (const data of normalizedData) {
      const validation = this.validateSingleDataPoint(data);
      
      if (validation.isValid) {
        valid.push(data);
      } else {
        invalid.push({
          data,
          reason: validation.reason || 'Unknown validation error',
        });
      }
    }

    return { valid, invalid };
  }

  /**
   * 개별 데이터 포인트 검증
   */
  private static validateSingleDataPoint(data: WearableDataNormalized): {
    isValid: boolean;
    reason?: string;
  } {
    // 타임스탬프 검증
    if (!data.timestamp || isNaN(data.timestamp.getTime())) {
      return { isValid: false, reason: 'Invalid timestamp' };
    }

    // 미래 날짜 검증
    if (data.timestamp > new Date()) {
      return { isValid: false, reason: 'Future timestamp' };
    }

    // 너무 오래된 데이터 검증 (1년 이상)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (data.timestamp < oneYearAgo) {
      return { isValid: false, reason: 'Data too old' };
    }

    // 값 범위 검증
    const valueValidation = this.validateValueRange(data.value, data.type);
    if (!valueValidation.isValid) {
      return valueValidation;
    }

    return { isValid: true };
  }

  /**
   * 값 범위 검증
   */
  private static validateValueRange(value: number | object, dataType: WearableDataType): {
    isValid: boolean;
    reason?: string;
  } {
    if (typeof value === 'object') {
      // 복합 데이터 타입 검증
      return { isValid: true }; // 복합 데이터는 별도 검증 로직 필요
    }

    const numValue = value as number;

    switch (dataType) {
      case 'heart_rate':
        if (numValue < 30 || numValue > 220) {
          return { isValid: false, reason: 'Heart rate out of range (30-220 bpm)' };
        }
        break;
      
      case 'steps':
        if (numValue < 0 || numValue > 100000) {
          return { isValid: false, reason: 'Steps out of range (0-100000)' };
        }
        break;
      
      case 'weight':
        if (numValue < 20 || numValue > 300) {
          return { isValid: false, reason: 'Weight out of range (20-300 kg)' };
        }
        break;
      
      case 'calories':
        if (numValue < 0 || numValue > 10000) {
          return { isValid: false, reason: 'Calories out of range (0-10000 kcal)' };
        }
        break;
      
      case 'blood_oxygen':
        if (numValue < 70 || numValue > 100) {
          return { isValid: false, reason: 'Blood oxygen out of range (70-100%)' };
        }
        break;
      
      case 'body_temperature':
        if (numValue < 30 || numValue > 45) {
          return { isValid: false, reason: 'Body temperature out of range (30-45°C)' };
        }
        break;
    }

    return { isValid: true };
  }
}