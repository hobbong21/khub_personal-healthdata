"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WearableService = void 0;
const database_1 = __importDefault(require("../config/database"));
const healthService_1 = require("./healthService");
class WearableService {
    static async authenticateDevice(userId, authRequest) {
        try {
            const existingDevice = await database_1.default.wearableDeviceConfig.findFirst({
                where: {
                    userId,
                    deviceType: authRequest.deviceType,
                    isActive: true,
                },
            });
            if (existingDevice) {
                return {
                    success: false,
                    message: '이미 연동된 기기가 있습니다. 기존 기기를 비활성화한 후 다시 시도해주세요.',
                };
            }
            let deviceConfig;
            switch (authRequest.deviceType) {
                case 'apple_health':
                    deviceConfig = await this.authenticateAppleHealth(userId, authRequest);
                    break;
                case 'google_fit':
                    deviceConfig = await this.authenticateGoogleFit(userId, authRequest);
                    break;
                case 'fitbit':
                    deviceConfig = await this.authenticateFitbit(userId, authRequest);
                    break;
                case 'samsung_health':
                    deviceConfig = await this.authenticateSamsungHealth(userId, authRequest);
                    break;
                default:
                    throw new Error('지원하지 않는 기기 타입입니다.');
            }
            return {
                success: true,
                deviceConfig,
                message: '기기가 성공적으로 연동되었습니다.',
            };
        }
        catch (error) {
            console.error('Device authentication error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : '기기 연동 중 오류가 발생했습니다.',
            };
        }
    }
    static async authenticateAppleHealth(userId, authRequest) {
        const deviceConfig = await database_1.default.wearableDeviceConfig.create({
            data: {
                userId,
                deviceType: 'apple_health',
                deviceName: authRequest.deviceName,
                isActive: true,
                syncSettings: authRequest.syncSettings,
            },
        });
        return {
            id: deviceConfig.id,
            userId: deviceConfig.userId,
            deviceType: deviceConfig.deviceType,
            deviceName: deviceConfig.deviceName,
            isActive: deviceConfig.isActive,
            syncSettings: deviceConfig.syncSettings,
            createdAt: deviceConfig.createdAt,
            updatedAt: deviceConfig.updatedAt,
        };
    }
    static async authenticateGoogleFit(userId, authRequest) {
        if (!authRequest.authCode) {
            throw new Error('Google Fit 인증 코드가 필요합니다.');
        }
        if (!authRequest.redirectUri) {
            throw new Error('Google Fit 리다이렉트 URI가 필요합니다.');
        }
        const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new Error('Google Fit 클라이언트 설정이 누락되었습니다.');
        }
        const tokens = await this.exchangeGoogleFitTokens(authRequest.authCode, authRequest.redirectUri, clientId, clientSecret);
        const deviceConfig = await database_1.default.wearableDeviceConfig.create({
            data: {
                userId,
                deviceType: 'google_fit',
                deviceName: authRequest.deviceName,
                isActive: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                syncSettings: authRequest.syncSettings,
            },
        });
        return {
            id: deviceConfig.id,
            userId: deviceConfig.userId,
            deviceType: deviceConfig.deviceType,
            deviceName: deviceConfig.deviceName,
            isActive: deviceConfig.isActive,
            accessToken: deviceConfig.accessToken,
            refreshToken: deviceConfig.refreshToken,
            syncSettings: deviceConfig.syncSettings,
            createdAt: deviceConfig.createdAt,
            updatedAt: deviceConfig.updatedAt,
        };
    }
    static async authenticateFitbit(userId, authRequest) {
        if (!authRequest.authCode) {
            throw new Error('Fitbit 인증 코드가 필요합니다.');
        }
        const tokens = await this.exchangeFitbitTokens(authRequest.authCode, authRequest.redirectUri);
        const deviceConfig = await database_1.default.wearableDeviceConfig.create({
            data: {
                userId,
                deviceType: 'fitbit',
                deviceName: authRequest.deviceName,
                isActive: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                syncSettings: authRequest.syncSettings,
            },
        });
        return {
            id: deviceConfig.id,
            userId: deviceConfig.userId,
            deviceType: deviceConfig.deviceType,
            deviceName: deviceConfig.deviceName,
            isActive: deviceConfig.isActive,
            accessToken: deviceConfig.accessToken,
            refreshToken: deviceConfig.refreshToken,
            syncSettings: deviceConfig.syncSettings,
            createdAt: deviceConfig.createdAt,
            updatedAt: deviceConfig.updatedAt,
        };
    }
    static async authenticateSamsungHealth(userId, authRequest) {
        if (!authRequest.authCode) {
            throw new Error('Samsung Health 인증 코드가 필요합니다.');
        }
        const tokens = await this.exchangeSamsungHealthTokens(authRequest.authCode, authRequest.redirectUri);
        const deviceConfig = await database_1.default.wearableDeviceConfig.create({
            data: {
                userId,
                deviceType: 'samsung_health',
                deviceName: authRequest.deviceName,
                isActive: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                syncSettings: authRequest.syncSettings,
            },
        });
        return {
            id: deviceConfig.id,
            userId: deviceConfig.userId,
            deviceType: deviceConfig.deviceType,
            deviceName: deviceConfig.deviceName,
            isActive: deviceConfig.isActive,
            accessToken: deviceConfig.accessToken,
            refreshToken: deviceConfig.refreshToken,
            syncSettings: deviceConfig.syncSettings,
            createdAt: deviceConfig.createdAt,
            updatedAt: deviceConfig.updatedAt,
        };
    }
    static async syncWearableData(userId, syncRequest) {
        try {
            const deviceConfig = await database_1.default.wearableDeviceConfig.findFirst({
                where: {
                    id: syncRequest.deviceConfigId,
                    userId,
                    isActive: true,
                },
            });
            if (!deviceConfig) {
                throw new Error('기기 설정을 찾을 수 없습니다.');
            }
            let syncedDataCount = 0;
            const errors = [];
            const dataTypesProcessed = [];
            const dataTypesToSync = syncRequest.dataTypes || deviceConfig.syncSettings.dataTypes;
            for (const dataType of dataTypesToSync) {
                try {
                    const data = await this.fetchWearableData(deviceConfig, dataType, syncRequest.startDate, syncRequest.endDate);
                    const normalizedData = await this.normalizeWearableData(data, deviceConfig.deviceType, dataType);
                    await this.saveWearableData(deviceConfig.id, normalizedData);
                    await this.convertToHealthRecords(userId, normalizedData);
                    syncedDataCount += normalizedData.length;
                    dataTypesProcessed.push(dataType);
                }
                catch (error) {
                    console.error(`Error syncing ${dataType}:`, error);
                    errors.push(`${dataType}: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
                }
            }
            const updatedConfig = await database_1.default.wearableDeviceConfig.update({
                where: { id: deviceConfig.id },
                data: { lastSyncAt: new Date() },
            });
            return {
                success: true,
                deviceConfigId: deviceConfig.id,
                syncedDataCount,
                lastSyncAt: updatedConfig.lastSyncAt,
                errors: errors.length > 0 ? errors : undefined,
                dataTypesProcessed,
            };
        }
        catch (error) {
            console.error('Wearable sync error:', error);
            return {
                success: false,
                deviceConfigId: syncRequest.deviceConfigId,
                syncedDataCount: 0,
                lastSyncAt: new Date(),
                errors: [error instanceof Error ? error.message : '동기화 중 오류가 발생했습니다.'],
                dataTypesProcessed: [],
            };
        }
    }
    static async fetchWearableData(deviceConfig, dataType, startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        switch (deviceConfig.deviceType) {
            case 'apple_health':
                return await this.fetchAppleHealthData(deviceConfig, dataType, start, end);
            case 'google_fit':
                return await this.fetchGoogleFitData(deviceConfig, dataType, start, end);
            case 'fitbit':
                return await this.fetchFitbitData(deviceConfig, dataType, start, end);
            case 'samsung_health':
                return await this.fetchSamsungHealthData(deviceConfig, dataType, start, end);
            default:
                throw new Error('지원하지 않는 기기 타입입니다.');
        }
    }
    static async fetchAppleHealthData(deviceConfig, dataType, startDate, endDate) {
        const tempData = await database_1.default.wearableDataTemp.findMany({
            where: {
                deviceConfigId: deviceConfig.id,
                dataType,
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { timestamp: 'asc' },
        });
        return tempData.map(data => ({
            type: this.mapDataTypeToAppleHealth(dataType),
            value: data.value,
            unit: data.unit,
            startDate: data.timestamp.toISOString(),
            endDate: data.endTime?.toISOString() || data.timestamp.toISOString(),
            sourceName: 'Health',
            metadata: data.metadata,
        }));
    }
    static async fetchGoogleFitData(deviceConfig, dataType, startDate, endDate) {
        if (!deviceConfig.accessToken) {
            throw new Error('Google Fit 액세스 토큰이 없습니다.');
        }
        try {
            const { GoogleFitService } = await Promise.resolve().then(() => __importStar(require('./googleFitService')));
            const googleFitService = new GoogleFitService();
            googleFitService.setCredentials(deviceConfig.accessToken, deviceConfig.refreshToken || '');
            const normalizedData = await googleFitService.getDataByType(dataType, startDate, endDate);
            const result = {
                success: true,
                data: normalizedData.map(item => ({
                    dataType: item.type,
                    value: item.value,
                    unit: item.unit,
                    timestamp: item.timestamp,
                    source: item.source
                }))
            };
            if (result.success) {
                return result.data;
            }
            else {
                console.error('Google Fit data fetch failed:', result.errors);
                return this.generateMockGoogleFitData(dataType, startDate, endDate);
            }
        }
        catch (error) {
            console.error('Google Fit API error:', error);
            return this.generateMockGoogleFitData(dataType, startDate, endDate);
        }
    }
    static async fetchFitbitData(deviceConfig, dataType, startDate, endDate) {
        if (!deviceConfig.accessToken) {
            throw new Error('Fitbit 액세스 토큰이 없습니다.');
        }
        const endpoint = this.getFitbitEndpoint(dataType);
        const dateRange = this.formatFitbitDateRange(startDate, endDate);
        try {
            const response = await fetch(`https://api.fitbit.com/1/user/-/${endpoint}/date/${dateRange}.json`, {
                headers: {
                    'Authorization': `Bearer ${deviceConfig.accessToken}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    await this.refreshFitbitToken(deviceConfig.id, deviceConfig.refreshToken);
                    throw new Error('토큰이 만료되어 갱신했습니다. 다시 시도해주세요.');
                }
                throw new Error(`Fitbit API 오류: ${response.status}`);
            }
            const data = await response.json();
            return this.parseFitbitResponse(data, dataType);
        }
        catch (error) {
            console.error('Fitbit API error:', error);
            return this.generateMockFitbitData(dataType, startDate, endDate);
        }
    }
    static async fetchSamsungHealthData(deviceConfig, dataType, startDate, endDate) {
        if (!deviceConfig.accessToken) {
            throw new Error('Samsung Health 액세스 토큰이 없습니다.');
        }
        return this.generateMockSamsungHealthData(dataType, startDate, endDate);
    }
    static async normalizeWearableData(rawData, deviceType, dataType) {
        return rawData.map(data => {
            let normalizedValue;
            let unit;
            let timestamp;
            let duration;
            switch (deviceType) {
                case 'apple_health':
                    normalizedValue = data.value;
                    unit = data.unit;
                    timestamp = new Date(data.startDate);
                    if (data.endDate !== data.startDate) {
                        duration = (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 1000;
                    }
                    break;
                case 'google_fit':
                    if (data.value && data.value.length > 0) {
                        normalizedValue = data.value[0].intVal || data.value[0].fpVal || data.value[0];
                    }
                    else {
                        normalizedValue = data.value;
                    }
                    unit = this.getStandardUnit(dataType);
                    timestamp = new Date(parseInt(data.startTimeNanos) / 1000000);
                    if (data.endTimeNanos !== data.startTimeNanos) {
                        duration = (parseInt(data.endTimeNanos) - parseInt(data.startTimeNanos)) / 1000000000;
                    }
                    break;
                case 'fitbit':
                    normalizedValue = data.value;
                    unit = this.getStandardUnit(dataType);
                    timestamp = new Date(data.dateTime || data.date);
                    break;
                case 'samsung_health':
                    normalizedValue = data.value;
                    unit = this.getStandardUnit(dataType);
                    timestamp = new Date(data.start_time || data.timestamp);
                    if (data.end_time) {
                        duration = (new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000;
                    }
                    break;
                default:
                    throw new Error('지원하지 않는 기기 타입입니다.');
            }
            return {
                type: dataType,
                value: normalizedValue,
                unit,
                timestamp,
                duration,
                source: {
                    deviceType,
                    deviceName: data.sourceName || data.dataSourceId || 'Unknown',
                    appName: data.sourceName,
                },
                metadata: data.metadata,
            };
        });
    }
    static async saveWearableData(deviceConfigId, normalizedData) {
        for (const data of normalizedData) {
            await database_1.default.wearableDataPoint.upsert({
                where: {
                    deviceConfigId_dataType_timestamp: {
                        deviceConfigId,
                        dataType: data.type,
                        startTime: data.timestamp,
                    },
                },
                update: {
                    value: data.value,
                    unit: data.unit,
                    endTime: data.duration ? new Date(data.timestamp.getTime() + data.duration * 1000) : undefined,
                    sourceApp: data.source.appName,
                    metadata: data.metadata,
                    syncedAt: new Date(),
                },
                create: {
                    deviceConfigId,
                    dataType: data.type,
                    value: data.value,
                    unit: data.unit,
                    startTime: data.timestamp,
                    endTime: data.duration ? new Date(data.timestamp.getTime() + data.duration * 1000) : undefined,
                    sourceApp: data.source.appName,
                    metadata: data.metadata,
                    syncedAt: new Date(),
                },
            });
        }
    }
    static async convertToHealthRecords(userId, normalizedData) {
        for (const data of normalizedData) {
            const vitalSignType = this.mapToVitalSignType(data.type);
            if (!vitalSignType)
                continue;
            try {
                const vitalSignRequest = {
                    type: vitalSignType,
                    value: data.value,
                    unit: data.unit,
                    measuredAt: data.timestamp.toISOString(),
                };
                const existingRecord = await database_1.default.healthRecord.findFirst({
                    where: {
                        userId,
                        recordType: 'vital_sign',
                        recordedDate: data.timestamp,
                        data: {
                            path: ['type'],
                            equals: vitalSignType,
                        },
                    },
                });
                if (!existingRecord) {
                    await healthService_1.HealthService.createVitalSign(userId, vitalSignRequest);
                }
            }
            catch (error) {
                console.error('Error converting wearable data to health record:', error);
            }
        }
    }
    static async getUserDevices(userId) {
        const devices = await database_1.default.wearableDeviceConfig.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return devices.map(device => ({
            id: device.id,
            userId: device.userId,
            deviceType: device.deviceType,
            deviceName: device.deviceName,
            isActive: device.isActive,
            lastSyncAt: device.lastSyncAt,
            syncSettings: device.syncSettings,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
        }));
    }
    static async updateDeviceConfig(userId, deviceConfigId, updates) {
        const device = await database_1.default.wearableDeviceConfig.findFirst({
            where: {
                id: deviceConfigId,
                userId,
            },
        });
        if (!device) {
            throw new Error('기기 설정을 찾을 수 없습니다.');
        }
        const updatedDevice = await database_1.default.wearableDeviceConfig.update({
            where: { id: deviceConfigId },
            data: updates,
        });
        return {
            id: updatedDevice.id,
            userId: updatedDevice.userId,
            deviceType: updatedDevice.deviceType,
            deviceName: updatedDevice.deviceName,
            isActive: updatedDevice.isActive,
            accessToken: updatedDevice.accessToken,
            refreshToken: updatedDevice.refreshToken,
            lastSyncAt: updatedDevice.lastSyncAt,
            syncSettings: updatedDevice.syncSettings,
            createdAt: updatedDevice.createdAt,
            updatedAt: updatedDevice.updatedAt,
        };
    }
    static async disconnectDevice(userId, deviceConfigId) {
        const device = await database_1.default.wearableDeviceConfig.findFirst({
            where: {
                id: deviceConfigId,
                userId,
            },
        });
        if (!device) {
            throw new Error('기기 설정을 찾을 수 없습니다.');
        }
        await database_1.default.wearableDeviceConfig.update({
            where: { id: deviceConfigId },
            data: {
                isActive: false,
                accessToken: null,
                refreshToken: null,
            },
        });
    }
    static async getSyncStatus(userId) {
        const devices = await database_1.default.wearableDeviceConfig.findMany({
            where: { userId },
            include: {
                _count: {
                    select: {
                        wearableDataPoints: true,
                    },
                },
            },
        });
        return devices.map(device => {
            const nextSyncAt = device.lastSyncAt && device.syncSettings.autoSync
                ? new Date(device.lastSyncAt.getTime() + device.syncSettings.syncInterval * 60 * 1000)
                : undefined;
            return {
                deviceConfigId: device.id,
                deviceType: device.deviceType,
                deviceName: device.deviceName,
                isActive: device.isActive,
                lastSyncAt: device.lastSyncAt,
                nextSyncAt,
                syncInProgress: false,
                totalDataPoints: device._count.wearableDataPoints,
                recentSyncCount: 0,
            };
        });
    }
    static async exchangeGoogleFitTokens(authCode, redirectUri, clientId, clientSecret) {
        try {
            const { GoogleFitService } = await Promise.resolve().then(() => __importStar(require('./googleFitService')));
            const googleFitService = new GoogleFitService();
            const tokens = await googleFitService.exchangeCodeForTokens(authCode);
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }
        catch (error) {
            console.error('Google Fit token exchange error:', error);
            throw new Error(`Google Fit 인증 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
    }
    static async exchangeFitbitTokens(authCode, redirectUri) {
        return {
            accessToken: 'mock_fitbit_access_token',
            refreshToken: 'mock_fitbit_refresh_token',
        };
    }
    static async exchangeSamsungHealthTokens(authCode, redirectUri) {
        return {
            accessToken: 'mock_samsung_access_token',
            refreshToken: 'mock_samsung_refresh_token',
        };
    }
    static async refreshGoogleFitToken(deviceConfigId, refreshToken) {
        if (!refreshToken) {
            throw new Error('Google Fit 리프레시 토큰이 없습니다.');
        }
        try {
            const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                throw new Error('Google Fit 클라이언트 설정이 누락되었습니다.');
            }
            const { GoogleFitService } = await Promise.resolve().then(() => __importStar(require('./googleFitService')));
            const googleFitService = new GoogleFitService();
            googleFitService.setCredentials('', refreshToken);
            const tokens = await googleFitService.refreshAccessToken();
            await database_1.default.wearableDeviceConfig.update({
                where: { id: deviceConfigId },
                data: { accessToken: tokens.accessToken },
            });
        }
        catch (error) {
            console.error('Google Fit token refresh failed:', error);
            throw new Error('Google Fit 토큰 갱신에 실패했습니다. 다시 인증해주세요.');
        }
    }
    static async refreshFitbitToken(deviceConfigId, refreshToken) {
        const newAccessToken = 'new_fitbit_access_token';
        await database_1.default.wearableDeviceConfig.update({
            where: { id: deviceConfigId },
            data: { accessToken: newAccessToken },
        });
    }
    static mapDataTypeToAppleHealth(dataType) {
        const mapping = {
            heart_rate: 'HKQuantityTypeIdentifierHeartRate',
            steps: 'HKQuantityTypeIdentifierStepCount',
            calories: 'HKQuantityTypeIdentifierActiveEnergyBurned',
            sleep: 'HKCategoryTypeIdentifierSleepAnalysis',
            weight: 'HKQuantityTypeIdentifierBodyMass',
            blood_pressure: 'HKQuantityTypeIdentifierBloodPressureSystolic',
            blood_oxygen: 'HKQuantityTypeIdentifierOxygenSaturation',
            body_temperature: 'HKQuantityTypeIdentifierBodyTemperature',
            exercise_sessions: 'HKWorkoutTypeIdentifier',
            distance: 'HKQuantityTypeIdentifierDistanceWalkingRunning',
            floors_climbed: 'HKQuantityTypeIdentifierFlightsClimbed',
        };
        return mapping[dataType] || dataType;
    }
    static getGoogleFitDataSourceId(dataType) {
        const mapping = {
            heart_rate: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
            steps: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
            calories: 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
            sleep: 'derived:com.google.sleep.segment:com.google.android.gms:merged',
            weight: 'derived:com.google.weight:com.google.android.gms:merge_weight',
            blood_pressure: 'derived:com.google.blood_pressure:com.google.android.gms:merged',
            blood_oxygen: 'derived:com.google.oxygen_saturation:com.google.android.gms:merged',
            body_temperature: 'derived:com.google.body.temperature:com.google.android.gms:merged',
            exercise_sessions: 'derived:com.google.activity.segment:com.google.android.gms:merge_activity_segments',
            distance: 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta',
            floors_climbed: 'derived:com.google.floors_climbed:com.google.android.gms:merged',
        };
        return mapping[dataType] || dataType;
    }
    static getFitbitEndpoint(dataType) {
        const mapping = {
            heart_rate: 'activities/heart',
            steps: 'activities/steps',
            calories: 'activities/calories',
            sleep: 'sleep',
            weight: 'body/log/weight',
            blood_pressure: 'bp',
            blood_oxygen: 'spo2',
            body_temperature: 'temp/skin',
            exercise_sessions: 'activities',
            distance: 'activities/distance',
            floors_climbed: 'activities/floors',
        };
        return mapping[dataType] || dataType;
    }
    static formatFitbitDateRange(startDate, endDate) {
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        return `${start}/${end}`;
    }
    static parseFitbitResponse(data, dataType) {
        switch (dataType) {
            case 'heart_rate':
                return data['activities-heart'] || [];
            case 'steps':
                return data['activities-steps'] || [];
            case 'sleep':
                return data.sleep || [];
            default:
                return [];
        }
    }
    static getStandardUnit(dataType) {
        const units = {
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
    static mapToVitalSignType(wearableDataType) {
        const mapping = {
            heart_rate: 'heart_rate',
            steps: null,
            calories: null,
            sleep: null,
            weight: 'weight',
            blood_pressure: 'blood_pressure',
            blood_oxygen: null,
            body_temperature: 'temperature',
            exercise_sessions: null,
            distance: null,
            floors_climbed: null,
        };
        return mapping[wearableDataType] || null;
    }
    static generateMockGoogleFitData(dataType, startDate, endDate) {
        const mockData = [];
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < daysDiff; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const startTimeNanos = (date.getTime() * 1000000).toString();
            const endTimeNanos = ((date.getTime() + 60 * 60 * 1000) * 1000000).toString();
            let value;
            switch (dataType) {
                case 'heart_rate':
                    value = 70 + Math.random() * 30;
                    break;
                case 'steps':
                    value = 5000 + Math.random() * 5000;
                    break;
                case 'weight':
                    value = 70 + Math.random() * 10;
                    break;
                default:
                    value = Math.random() * 100;
            }
            mockData.push({
                dataTypeName: this.getGoogleFitDataSourceId(dataType),
                value,
                startTimeNanos,
                endTimeNanos,
                dataSourceId: 'mock_data_source',
            });
        }
        return mockData;
    }
    static generateMockFitbitData(dataType, startDate, endDate) {
        const mockData = [];
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < daysDiff; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            let value;
            switch (dataType) {
                case 'heart_rate':
                    value = 70 + Math.random() * 30;
                    break;
                case 'steps':
                    value = 5000 + Math.random() * 5000;
                    break;
                case 'weight':
                    value = 70 + Math.random() * 10;
                    break;
                default:
                    value = Math.random() * 100;
            }
            mockData.push({
                dateTime: date.toISOString().split('T')[0],
                value,
            });
        }
        return mockData;
    }
    static generateMockSamsungHealthData(dataType, startDate, endDate) {
        const mockData = [];
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < daysDiff; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            let value;
            switch (dataType) {
                case 'heart_rate':
                    value = 70 + Math.random() * 30;
                    break;
                case 'steps':
                    value = 5000 + Math.random() * 5000;
                    break;
                case 'weight':
                    value = 70 + Math.random() * 10;
                    break;
                default:
                    value = Math.random() * 100;
            }
            mockData.push({
                start_time: date.toISOString(),
                end_time: new Date(date.getTime() + 60 * 60 * 1000).toISOString(),
                value,
            });
        }
        return mockData;
    }
}
exports.WearableService = WearableService;
//# sourceMappingURL=wearableService.js.map