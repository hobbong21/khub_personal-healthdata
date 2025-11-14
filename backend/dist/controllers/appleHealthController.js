"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleHealthController = void 0;
const appleHealthService_1 = require("../services/appleHealthService");
class AppleHealthController {
    static async receiveHealthKitData(req, res) {
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
            const result = await appleHealthService_1.AppleHealthService.receiveHealthKitData(userId, deviceConfigId, healthKitData);
            if (result.success) {
                res.status(200).json({
                    success: true,
                    processedCount: result.processedCount,
                    errors: result.errors.length > 0 ? result.errors : undefined,
                    message: `${result.processedCount}개의 데이터가 성공적으로 처리되었습니다.`,
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: 'HealthKit 데이터 처리에 실패했습니다.',
                    errors: result.errors,
                });
            }
        }
        catch (error) {
            console.error('HealthKit data reception error:', error);
            res.status(500).json({
                success: false,
                message: 'HealthKit 데이터 수신 중 오류가 발생했습니다.',
            });
        }
    }
    static async checkPermissions(req, res) {
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
            const permissions = await appleHealthService_1.AppleHealthService.checkHealthKitPermissions(userId, deviceConfigId);
            res.json({
                success: true,
                data: permissions,
            });
        }
        catch (error) {
            console.error('HealthKit permissions check error:', error);
            res.status(500).json({
                success: false,
                message: 'HealthKit 권한 확인 중 오류가 발생했습니다.',
            });
        }
    }
    static async getRealTimeSyncStatus(req, res) {
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
            const syncStatus = await appleHealthService_1.AppleHealthService.getRealTimeSyncStatus(userId, deviceConfigId);
            res.json({
                success: true,
                data: syncStatus,
            });
        }
        catch (error) {
            console.error('Real-time sync status error:', error);
            res.status(500).json({
                success: false,
                message: '실시간 동기화 상태 조회 중 오류가 발생했습니다.',
            });
        }
    }
    static async processPendingData(req, res) {
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
            const result = await appleHealthService_1.AppleHealthService.processPendingHealthKitData(userId, deviceConfigId);
            res.json({
                success: true,
                processedCount: result.processedCount,
                errors: result.errors.length > 0 ? result.errors : undefined,
                message: `${result.processedCount}개의 대기 중인 데이터가 처리되었습니다.`,
            });
        }
        catch (error) {
            console.error('Process pending data error:', error);
            res.status(500).json({
                success: false,
                message: '대기 중인 데이터 처리 중 오류가 발생했습니다.',
            });
        }
    }
    static async getLatestData(req, res) {
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
            let requestedDataTypes;
            if (dataTypes) {
                if (typeof dataTypes === 'string') {
                    requestedDataTypes = dataTypes.split(',');
                }
                else if (Array.isArray(dataTypes)) {
                    requestedDataTypes = dataTypes;
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: '데이터 타입 형식이 올바르지 않습니다.',
                    });
                    return;
                }
            }
            else {
                requestedDataTypes = ['heart_rate', 'steps', 'weight', 'blood_pressure'];
            }
            const latestData = await appleHealthService_1.AppleHealthService.getLatestHealthKitData(userId, deviceConfigId, requestedDataTypes);
            res.json({
                success: true,
                data: latestData,
            });
        }
        catch (error) {
            console.error('Get latest HealthKit data error:', error);
            res.status(500).json({
                success: false,
                message: '최신 HealthKit 데이터 조회 중 오류가 발생했습니다.',
            });
        }
    }
    static async validateHealthKitData(req, res) {
        try {
            const { healthKitData } = req.body;
            if (!healthKitData || !Array.isArray(healthKitData)) {
                res.status(400).json({
                    success: false,
                    message: 'HealthKit 데이터 배열이 필요합니다.',
                });
                return;
            }
            const validationResults = healthKitData.map((data, index) => {
                const result = {
                    index,
                    isValid: true,
                    errors: [],
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
        }
        catch (error) {
            console.error('HealthKit data validation error:', error);
            res.status(500).json({
                success: false,
                message: 'HealthKit 데이터 검증 중 오류가 발생했습니다.',
            });
        }
    }
    static async getSupportedTypes(req, res) {
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
        }
        catch (error) {
            console.error('Get supported types error:', error);
            res.status(500).json({
                success: false,
                message: '지원 데이터 타입 조회 중 오류가 발생했습니다.',
            });
        }
    }
}
exports.AppleHealthController = AppleHealthController;
//# sourceMappingURL=appleHealthController.js.map