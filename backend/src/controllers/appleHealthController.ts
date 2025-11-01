import { Request, Response } from 'express';
import { AppleHealthService } from '../services/appleHealthService';
import { AppleHealthData, WearableDataType } from '../types/wearable';

/**
 * Apple Health (HealthKit) 전용 컨트롤러
 * 요구사항 17.3: HealthKit 데이터 수집 구현, 실시간 건강 데이터 동기화, 권한 관리 및 데이터 검증
 */
export class AppleHealthController {
  /**
   * iOS 앱에서 HealthKit 데이터 수신
   * POST /api/apple-health/data
   */
  static async receiveHealthKitData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId, healthKitData } = req.body;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      if (!healthKitData || !Array.isArray(healthKitData)) {
        res.status(400).json({
          success: false,
          message: 'HealthKit 데이터 배열이 필요합니다.',
        });
        return;
      }

      const result = await AppleHealthService.receiveHealthKitData(userId, deviceConfigId, healthKitData);

      if (result.success) {
        res.status(200).json({
          success: true,
          processedCount: result.processedCount,
          errors: result.errors.length > 0 ? result.errors : undefined,
          message: `${result.processedCount}개의 데이터가 성공적으로 처리되었습니다.`,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'HealthKit 데이터 처리에 실패했습니다.',
          errors: result.errors,
        });
      }
    } catch (error) {
      console.error('HealthKit data reception error:', error);
      res.status(500).json({
        success: false,
        message: 'HealthKit 데이터 수신 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * HealthKit 권한 상태 확인
   * GET /api/apple-health/permissions/:deviceConfigId
   */
  static async checkPermissions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      const permissions = await AppleHealthService.checkHealthKitPermissions(userId, deviceConfigId);

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      console.error('HealthKit permissions check error:', error);
      res.status(500).json({
        success: false,
        message: 'HealthKit 권한 확인 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 실시간 동기화 상태 조회
   * GET /api/apple-health/sync-status/:deviceConfigId
   */
  static async getRealTimeSyncStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      const syncStatus = await AppleHealthService.getRealTimeSyncStatus(userId, deviceConfigId);

      res.json({
        success: true,
        data: syncStatus,
      });
    } catch (error) {
      console.error('Real-time sync status error:', error);
      res.status(500).json({
        success: false,
        message: '실시간 동기화 상태 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 대기 중인 HealthKit 데이터 배치 처리
   * POST /api/apple-health/process-pending/:deviceConfigId
   */
  static async processPendingData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      const result = await AppleHealthService.processPendingHealthKitData(userId, deviceConfigId);

      res.json({
        success: true,
        processedCount: result.processedCount,
        errors: result.errors.length > 0 ? result.errors : undefined,
        message: `${result.processedCount}개의 대기 중인 데이터가 처리되었습니다.`,
      });
    } catch (error) {
      console.error('Process pending data error:', error);
      res.status(500).json({
        success: false,
        message: '대기 중인 데이터 처리 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 최신 HealthKit 데이터 조회
   * GET /api/apple-health/latest/:deviceConfigId
   */
  static async getLatestData(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: '인증이 필요합니다.',
        });
        return;
      }

      const { deviceConfigId } = req.params;
      const { dataTypes } = req.query;

      if (!deviceConfigId) {
        res.status(400).json({
          success: false,
          message: '기기 설정 ID가 필요합니다.',
        });
        return;
      }

      let requestedDataTypes: WearableDataType[];
      if (dataTypes) {
        if (typeof dataTypes === 'string') {
          requestedDataTypes = dataTypes.split(',') as WearableDataType[];
        } else if (Array.isArray(dataTypes)) {
          requestedDataTypes = dataTypes as WearableDataType[];
        } else {
          res.status(400).json({
            success: false,
            message: '데이터 타입 형식이 올바르지 않습니다.',
          });
          return;
        }
      } else {
        // 기본 데이터 타입들
        requestedDataTypes = ['heart_rate', 'steps', 'weight', 'blood_pressure'];
      }

      const latestData = await AppleHealthService.getLatestHealthKitData(userId, deviceConfigId, requestedDataTypes);

      res.json({
        success: true,
        data: latestData,
      });
    } catch (error) {
      console.error('Get latest HealthKit data error:', error);
      res.status(500).json({
        success: false,
        message: '최신 HealthKit 데이터 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * HealthKit 데이터 유효성 검증 (테스트용)
   * POST /api/apple-health/validate
   */
  static async validateHealthKitData(req: Request, res: Response): Promise<void> {
    try {
      const { healthKitData } = req.body;

      if (!healthKitData || !Array.isArray(healthKitData)) {
        res.status(400).json({
          success: false,
          message: 'HealthKit 데이터 배열이 필요합니다.',
        });
        return;
      }

      const validationResults = healthKitData.map((data: AppleHealthData, index: number) => {
        // AppleHealthService의 private 메서드를 사용할 수 없으므로 기본 검증만 수행
        const result = {
          index,
          isValid: true,
          errors: [] as string[],
        };

        if (!data.type) {
          result.isValid = false;
          result.errors.push('HealthKit 데이터 타입이 없습니다.');
        }

        if (data.value === undefined || data.value === null) {
          result.isValid = false;
          result.errors.push('데이터 값이 없습니다.');
        }

        if (!data.startDate) {
          result.isValid = false;
          result.errors.push('시작 날짜가 없습니다.');
        }

        if (!data.endDate) {
          result.isValid = false;
          result.errors.push('종료 날짜가 없습니다.');
        }

        return result;
      });

      const validCount = validationResults.filter(r => r.isValid).length;
      const invalidCount = validationResults.filter(r => !r.isValid).length;

      res.json({
        success: true,
        data: {
          totalCount: healthKitData.length,
          validCount,
          invalidCount,
          validationResults,
        },
      });
    } catch (error) {
      console.error('HealthKit data validation error:', error);
      res.status(500).json({
        success: false,
        message: 'HealthKit 데이터 검증 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * HealthKit 지원 데이터 타입 목록
   * GET /api/apple-health/supported-types
   */
  static async getSupportedTypes(req: Request, res: Response): Promise<void> {
    try {
      const supportedTypes = [
        {
          healthKitType: 'HKQuantityTypeIdentifierHeartRate',
          wearableType: 'heart_rate',
          name: '심박수',
          unit: 'bpm',
          category: 'vital',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierStepCount',
          wearableType: 'steps',
          name: '걸음 수',
          unit: 'count',
          category: 'activity',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierActiveEnergyBurned',
          wearableType: 'calories',
          name: '소모 칼로리',
          unit: 'kcal',
          category: 'activity',
        },
        {
          healthKitType: 'HKCategoryTypeIdentifierSleepAnalysis',
          wearableType: 'sleep',
          name: '수면',
          unit: 'minutes',
          category: 'wellness',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierBodyMass',
          wearableType: 'weight',
          name: '체중',
          unit: 'kg',
          category: 'body',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierBloodPressureSystolic',
          wearableType: 'blood_pressure',
          name: '수축기 혈압',
          unit: 'mmHg',
          category: 'vital',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierBloodPressureDiastolic',
          wearableType: 'blood_pressure',
          name: '이완기 혈압',
          unit: 'mmHg',
          category: 'vital',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierOxygenSaturation',
          wearableType: 'blood_oxygen',
          name: '혈중 산소 포화도',
          unit: '%',
          category: 'vital',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierBodyTemperature',
          wearableType: 'body_temperature',
          name: '체온',
          unit: '°C',
          category: 'vital',
        },
        {
          healthKitType: 'HKWorkoutTypeIdentifier',
          wearableType: 'exercise_sessions',
          name: '운동 세션',
          unit: 'minutes',
          category: 'activity',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
          wearableType: 'distance',
          name: '이동 거리',
          unit: 'km',
          category: 'activity',
        },
        {
          healthKitType: 'HKQuantityTypeIdentifierFlightsClimbed',
          wearableType: 'floors_climbed',
          name: '오른 층수',
          unit: 'count',
          category: 'activity',
        },
      ];

      res.json({
        success: true,
        data: supportedTypes,
      });
    } catch (error) {
      console.error('Get supported types error:', error);
      res.status(500).json({
        success: false,
        message: '지원 데이터 타입 조회 중 오류가 발생했습니다.',
      });
    }
  }
}