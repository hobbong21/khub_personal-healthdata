"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleHealthService = void 0;
const database_1 = __importDefault(require("../config/database"));
class AppleHealthService {
    static async receiveHealthKitData(userId, deviceConfigId, healthKitData) {
        try {
            const errors = [];
            let processedCount = 0;
            const deviceConfig = await database_1.default.wearableDeviceConfig.findFirst({
                where: {
                    id: deviceConfigId,
                    userId,
                    deviceType: 'apple_health',
                    isActive: true,
                },
            });
            if (!deviceConfig) {
                throw new Error('Apple Health 기기 설정을 찾을 수 없습니다.');
            }
            for (const data of healthKitData) {
                try {
                    const validationResult = this.validateHealthKitData(data);
                    if (!validationResult.isValid) {
                        errors.push(`데이터 검증 실패: ${validationResult.error}`);
                        continue;
                    }
                    const mappedDataType = this.mapHealthKitTypeToWearableType(data.type);
                    if (!mappedDataType) {
                        errors.push(`지원하지 않는 HealthKit 데이터 타입: ${data.type}`);
                        continue;
                    }
                    const existingData = await database_1.default.wearableDataPoint.findFirst({
                        where: {
                            deviceConfigId,
                            dataType: mappedDataType,
                            startTime: new Date(data.startDate),
                        },
                    });
                    if (existingData) {
                        await database_1.default.wearableDataPoint.update({
                            where: { id: existingData.id },
                            data: {
                                value: this.normalizeHealthKitValue(data.value, data.type),
                                unit: this.standardizeUnit(data.unit, mappedDataType),
                                endTime: data.endDate !== data.startDate ? new Date(data.endDate) : undefined,
                                sourceApp: data.sourceName,
                                metadata: {
                                    ...data.metadata,
                                    sourceVersion: data.sourceVersion,
                                    device: data.device,
                                    originalType: data.type,
                                },
                                syncedAt: new Date(),
                            },
                        });
                    }
                    else {
                        await database_1.default.wearableDataPoint.create({
                            data: {
                                deviceConfigId,
                                dataType: mappedDataType,
                                value: this.normalizeHealthKitValue(data.value, data.type),
                                unit: this.standardizeUnit(data.unit, mappedDataType),
                                startTime: new Date(data.startDate),
                                endTime: data.endDate !== data.startDate ? new Date(data.endDate) : undefined,
                                sourceApp: data.sourceName,
                                metadata: {
                                    ...data.metadata,
                                    sourceVersion: data.sourceVersion,
                                    device: data.device,
                                    originalType: data.type,
                                },
                                syncedAt: new Date(),
                            },
                        });
                    }
                    processedCount++;
                }
                catch (error) {
                    console.error('Error processing HealthKit data:', error);
                    errors.push(`데이터 처리 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
                }
            }
            await database_1.default.wearableDeviceConfig.update({
                where: { id: deviceConfigId },
                data: { lastSyncAt: new Date() },
            });
            return {
                success: true,
                processedCount,
                errors,
            };
        }
        catch (error) {
            console.error('Apple Health data processing error:', error);
            return {
                success: false,
                processedCount: 0,
                errors: [error instanceof Error ? error.message : 'HealthKit 데이터 처리 중 오류가 발생했습니다.'],
            };
        }
    }
    static validateHealthKitData(data) {
        if (!data.type) {
            return { isValid: false, error: 'HealthKit 데이터 타입이 없습니다.' };
        }
        if (data.value === undefined || data.value === null) {
            return { isValid: false, error: '데이터 값이 없습니다.' };
        }
        if (!data.startDate) {
            return { isValid: false, error: '시작 날짜가 없습니다.' };
        }
        if (!data.endDate) {
            return { isValid: false, error: '종료 날짜가 없습니다.' };
        }
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (isNaN(startDate.getTime())) {
            return { isValid: false, error: '유효하지 않은 시작 날짜입니다.' };
        }
        if (isNaN(endDate.getTime())) {
            return { isValid: false, error: '유효하지 않은 종료 날짜입니다.' };
        }
        if (endDate < startDate) {
            return { isValid: false, error: '종료 날짜가 시작 날짜보다 이릅니다.' };
        }
        const now = new Date();
        if (startDate > now) {
            return { isValid: false, error: '미래 날짜의 데이터는 허용되지 않습니다.' };
        }
        const valueValidation = this.validateHealthKitValue(data.type, data.value);
        if (!valueValidation.isValid) {
            return valueValidation;
        }
        return { isValid: true };
    }
    static validateHealthKitValue(type, value) {
        switch (type) {
            case 'HKQuantityTypeIdentifierHeartRate':
                if (value < 30 || value > 250) {
                    return { isValid: false, error: '심박수 값이 유효 범위(30-250 bpm)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierStepCount':
                if (value < 0 || value > 100000) {
                    return { isValid: false, error: '걸음 수 값이 유효 범위(0-100,000)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierBodyMass':
                if (value < 20 || value > 300) {
                    return { isValid: false, error: '체중 값이 유효 범위(20-300 kg)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierBloodPressureSystolic':
                if (value < 50 || value > 300) {
                    return { isValid: false, error: '수축기 혈압 값이 유효 범위(50-300 mmHg)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierBloodPressureDiastolic':
                if (value < 30 || value > 200) {
                    return { isValid: false, error: '이완기 혈압 값이 유효 범위(30-200 mmHg)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierBodyTemperature':
                if (value < 30 || value > 45) {
                    return { isValid: false, error: '체온 값이 유효 범위(30-45°C)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierOxygenSaturation':
                if (value < 70 || value > 100) {
                    return { isValid: false, error: '혈중 산소 포화도 값이 유효 범위(70-100%)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierActiveEnergyBurned':
                if (value < 0 || value > 10000) {
                    return { isValid: false, error: '소모 칼로리 값이 유효 범위(0-10,000 kcal)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierDistanceWalkingRunning':
                if (value < 0 || value > 200) {
                    return { isValid: false, error: '이동 거리 값이 유효 범위(0-200 km)를 벗어났습니다.' };
                }
                break;
            case 'HKQuantityTypeIdentifierFlightsClimbed':
                if (value < 0 || value > 1000) {
                    return { isValid: false, error: '오른 층수 값이 유효 범위(0-1,000)를 벗어났습니다.' };
                }
                break;
        }
        return { isValid: true };
    }
    static mapHealthKitTypeToWearableType(healthKitType) {
        const mapping = {
            'HKQuantityTypeIdentifierHeartRate': 'heart_rate',
            'HKQuantityTypeIdentifierStepCount': 'steps',
            'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories',
            'HKCategoryTypeIdentifierSleepAnalysis': 'sleep',
            'HKQuantityTypeIdentifierBodyMass': 'weight',
            'HKQuantityTypeIdentifierBloodPressureSystolic': 'blood_pressure',
            'HKQuantityTypeIdentifierBloodPressureDiastolic': 'blood_pressure',
            'HKQuantityTypeIdentifierOxygenSaturation': 'blood_oxygen',
            'HKQuantityTypeIdentifierBodyTemperature': 'body_temperature',
            'HKWorkoutTypeIdentifier': 'exercise_sessions',
            'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
            'HKQuantityTypeIdentifierFlightsClimbed': 'floors_climbed',
        };
        return mapping[healthKitType] || null;
    }
    static normalizeHealthKitValue(value, healthKitType) {
        switch (healthKitType) {
            case 'HKQuantityTypeIdentifierBloodPressureSystolic':
            case 'HKQuantityTypeIdentifierBloodPressureDiastolic':
                return value;
            case 'HKCategoryTypeIdentifierSleepAnalysis':
                return Math.round(value / 60);
            case 'HKQuantityTypeIdentifierDistanceWalkingRunning':
                return Math.round((value / 1000) * 100) / 100;
            default:
                return Math.round(value * 100) / 100;
        }
    }
    static standardizeUnit(originalUnit, dataType) {
        const standardUnits = {
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
        return standardUnits[dataType] || originalUnit;
    }
    static async checkHealthKitPermissions(userId, deviceConfigId) {
        try {
            const deviceConfig = await database_1.default.wearableDeviceConfig.findFirst({
                where: {
                    id: deviceConfigId,
                    userId,
                    deviceType: 'apple_health',
                },
            });
            if (!deviceConfig) {
                throw new Error('Apple Health 기기 설정을 찾을 수 없습니다.');
            }
            const requestedDataTypes = deviceConfig.syncSettings.dataTypes;
            const recentDataTypes = await database_1.default.wearableDataPoint.groupBy({
                by: ['dataType'],
                where: {
                    deviceConfigId,
                    syncedAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            });
            const grantedDataTypes = recentDataTypes.map(item => item.dataType);
            const deniedDataTypes = requestedDataTypes.filter(type => !grantedDataTypes.includes(type));
            return {
                hasPermissions: grantedDataTypes.length > 0,
                grantedDataTypes,
                deniedDataTypes,
            };
        }
        catch (error) {
            console.error('Error checking HealthKit permissions:', error);
            return {
                hasPermissions: false,
                grantedDataTypes: [],
                deniedDataTypes: [],
            };
        }
    }
    static async getRealTimeSyncStatus(userId, deviceConfigId) {
        try {
            const deviceConfig = await database_1.default.wearableDeviceConfig.findFirst({
                where: {
                    id: deviceConfigId,
                    userId,
                    deviceType: 'apple_health',
                    isActive: true,
                },
            });
            if (!deviceConfig) {
                throw new Error('Apple Health 기기 설정을 찾을 수 없습니다.');
            }
            const pendingDataCount = await database_1.default.wearableDataTemp.count({
                where: {
                    deviceConfigId,
                    processed: false,
                },
            });
            return {
                isRealTimeEnabled: deviceConfig.syncSettings.autoSync,
                lastSyncAt: deviceConfig.lastSyncAt || undefined,
                syncFrequency: deviceConfig.syncSettings.syncInterval,
                pendingDataCount,
            };
        }
        catch (error) {
            console.error('Error getting real-time sync status:', error);
            return {
                isRealTimeEnabled: false,
                syncFrequency: 60,
                pendingDataCount: 0,
            };
        }
    }
    static async processPendingHealthKitData(userId, deviceConfigId) {
        try {
            const pendingData = await database_1.default.wearableDataTemp.findMany({
                where: {
                    deviceConfigId,
                    processed: false,
                },
                orderBy: { timestamp: 'asc' },
                take: 1000,
            });
            const errors = [];
            let processedCount = 0;
            for (const tempData of pendingData) {
                try {
                    const existingData = await database_1.default.wearableDataPoint.findFirst({
                        where: {
                            deviceConfigId,
                            dataType: tempData.dataType,
                            startTime: tempData.timestamp,
                        },
                    });
                    if (!existingData) {
                        await database_1.default.wearableDataPoint.create({
                            data: {
                                deviceConfigId,
                                dataType: tempData.dataType,
                                value: tempData.value,
                                unit: tempData.unit,
                                startTime: tempData.timestamp,
                                endTime: tempData.endTime,
                                sourceApp: 'Health',
                                metadata: tempData.metadata,
                                syncedAt: new Date(),
                            },
                        });
                    }
                    await database_1.default.wearableDataTemp.update({
                        where: { id: tempData.id },
                        data: { processed: true },
                    });
                    processedCount++;
                }
                catch (error) {
                    console.error('Error processing temp data:', error);
                    errors.push(`임시 데이터 처리 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
                }
            }
            return { processedCount, errors };
        }
        catch (error) {
            console.error('Error processing pending HealthKit data:', error);
            return {
                processedCount: 0,
                errors: [error instanceof Error ? error.message : '배치 처리 중 오류가 발생했습니다.'],
            };
        }
    }
    static async getLatestHealthKitData(userId, deviceConfigId, dataTypes) {
        try {
            const result = {};
            for (const dataType of dataTypes) {
                const latestData = await database_1.default.wearableDataPoint.findFirst({
                    where: {
                        deviceConfigId,
                        dataType,
                    },
                    orderBy: { startTime: 'desc' },
                });
                if (latestData) {
                    result[dataType] = {
                        value: latestData.value,
                        unit: latestData.unit,
                        timestamp: latestData.startTime,
                        sourceApp: latestData.sourceApp,
                    };
                }
            }
            return result;
        }
        catch (error) {
            console.error('Error getting latest HealthKit data:', error);
            return {};
        }
    }
}
exports.AppleHealthService = AppleHealthService;
//# sourceMappingURL=appleHealthService.js.map