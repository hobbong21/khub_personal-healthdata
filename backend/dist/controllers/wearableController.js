"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WearableController = void 0;
const wearableService_1 = require("../services/wearableService");
class WearableController {
    static async authenticateDevice(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
                return;
            }
            const authRequest = req.body;
            if (!authRequest.deviceType || !authRequest.deviceName) {
                res.status(400).json({
                    success: false,
                    message: '기기 타입과 이름은 필수입니다.',
                });
                return;
            }
            if (!authRequest.syncSettings) {
                res.status(400).json({
                    success: false,
                    message: '동기화 설정이 필요합니다.',
                });
                return;
            }
            const result = await wearableService_1.WearableService.authenticateDevice(userId, authRequest);
            if (result.success) {
                res.status(201).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error('Device authentication error:', error);
            res.status(500).json({
                success: false,
                message: '기기 인증 중 오류가 발생했습니다.',
            });
        }
    }
    static async syncWearableData(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
                return;
            }
            const syncRequest = req.body;
            if (!syncRequest.deviceConfigId) {
                res.status(400).json({
                    success: false,
                    message: '기기 설정 ID가 필요합니다.',
                });
                return;
            }
            const result = await wearableService_1.WearableService.syncWearableData(userId, syncRequest);
            res.json(result);
        }
        catch (error) {
            console.error('Wearable sync error:', error);
            res.status(500).json({
                success: false,
                message: '데이터 동기화 중 오류가 발생했습니다.',
            });
        }
    }
    static async getUserDevices(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
                return;
            }
            const devices = await wearableService_1.WearableService.getUserDevices(userId);
            res.json({
                success: true,
                data: devices,
            });
        }
        catch (error) {
            console.error('Get user devices error:', error);
            res.status(500).json({
                success: false,
                message: '기기 목록 조회 중 오류가 발생했습니다.',
            });
        }
    }
    static async updateDeviceConfig(req, res) {
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
            const updates = req.body;
            if (!deviceConfigId) {
                res.status(400).json({
                    success: false,
                    message: '기기 설정 ID가 필요합니다.',
                });
                return;
            }
            const updatedDevice = await wearableService_1.WearableService.updateDeviceConfig(userId, deviceConfigId, updates);
            res.json({
                success: true,
                data: updatedDevice,
            });
        }
        catch (error) {
            console.error('Update device config error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '기기 설정 업데이트 중 오류가 발생했습니다.',
            });
        }
    }
    static async disconnectDevice(req, res) {
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
            await wearableService_1.WearableService.disconnectDevice(userId, deviceConfigId);
            res.json({
                success: true,
                message: '기기 연동이 해제되었습니다.',
            });
        }
        catch (error) {
            console.error('Disconnect device error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '기기 연동 해제 중 오류가 발생했습니다.',
            });
        }
    }
    static async getSyncStatus(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.',
                });
                return;
            }
            const syncStatus = await wearableService_1.WearableService.getSyncStatus(userId);
            res.json({
                success: true,
                data: syncStatus,
            });
        }
        catch (error) {
            console.error('Get sync status error:', error);
            res.status(500).json({
                success: false,
                message: '동기화 상태 조회 중 오류가 발생했습니다.',
            });
        }
    }
    static async getDeviceData(req, res) {
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
            const { dataType, startDate, endDate, limit = 100 } = req.query;
            if (!deviceConfigId) {
                res.status(400).json({
                    success: false,
                    message: '기기 설정 ID가 필요합니다.',
                });
                return;
            }
            res.json({
                success: true,
                data: [],
                message: '기기 데이터 조회 기능은 추후 구현 예정입니다.',
            });
        }
        catch (error) {
            console.error('Get device data error:', error);
            res.status(500).json({
                success: false,
                message: '기기 데이터 조회 중 오류가 발생했습니다.',
            });
        }
    }
    static async configureAutoSync(req, res) {
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
            const { autoSync, syncInterval, dataTypes } = req.body;
            if (!deviceConfigId) {
                res.status(400).json({
                    success: false,
                    message: '기기 설정 ID가 필요합니다.',
                });
                return;
            }
            const syncSettings = {
                autoSync: autoSync !== undefined ? autoSync : true,
                syncInterval: syncInterval || 60,
                dataTypes: dataTypes || ['heart_rate', 'steps', 'weight'],
            };
            const updatedDevice = await wearableService_1.WearableService.updateDeviceConfig(userId, deviceConfigId, {
                syncSettings,
            });
            res.json({
                success: true,
                data: updatedDevice,
                message: '자동 동기화 설정이 업데이트되었습니다.',
            });
        }
        catch (error) {
            console.error('Configure auto sync error:', error);
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : '자동 동기화 설정 중 오류가 발생했습니다.',
            });
        }
    }
    static async triggerManualSync(req, res) {
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
            const { dataTypes, startDate, endDate } = req.body;
            if (!deviceConfigId) {
                res.status(400).json({
                    success: false,
                    message: '기기 설정 ID가 필요합니다.',
                });
                return;
            }
            const syncRequest = {
                deviceConfigId,
                dataTypes,
                startDate,
                endDate,
                forceSync: true,
            };
            const result = await wearableService_1.WearableService.syncWearableData(userId, syncRequest);
            res.json(result);
        }
        catch (error) {
            console.error('Manual sync error:', error);
            res.status(500).json({
                success: false,
                message: '수동 동기화 중 오류가 발생했습니다.',
            });
        }
    }
    static async getSupportedDataTypes(req, res) {
        try {
            const { deviceType } = req.query;
            const allDataTypes = [
                'heart_rate',
                'steps',
                'calories',
                'sleep',
                'weight',
                'blood_pressure',
                'blood_oxygen',
                'body_temperature',
                'exercise_sessions',
                'distance',
                'floors_climbed',
            ];
            let supportedDataTypes = allDataTypes;
            if (deviceType) {
                switch (deviceType) {
                    case 'apple_health':
                        supportedDataTypes = allDataTypes;
                        break;
                    case 'google_fit':
                        supportedDataTypes = [
                            'heart_rate',
                            'steps',
                            'calories',
                            'sleep',
                            'weight',
                            'exercise_sessions',
                            'distance',
                        ];
                        break;
                    case 'fitbit':
                        supportedDataTypes = [
                            'heart_rate',
                            'steps',
                            'calories',
                            'sleep',
                            'weight',
                            'blood_oxygen',
                            'exercise_sessions',
                            'distance',
                            'floors_climbed',
                        ];
                        break;
                    case 'samsung_health':
                        supportedDataTypes = [
                            'heart_rate',
                            'steps',
                            'calories',
                            'sleep',
                            'weight',
                            'blood_pressure',
                            'blood_oxygen',
                            'exercise_sessions',
                        ];
                        break;
                }
            }
            const dataTypeInfo = supportedDataTypes.map(type => ({
                type,
                name: this.getDataTypeName(type),
                unit: this.getDataTypeUnit(type),
                category: this.getDataTypeCategory(type),
            }));
            res.json({
                success: true,
                data: dataTypeInfo,
            });
        }
        catch (error) {
            console.error('Get supported data types error:', error);
            res.status(500).json({
                success: false,
                message: '지원 데이터 타입 조회 중 오류가 발생했습니다.',
            });
        }
    }
    static getDataTypeName(type) {
        const names = {
            heart_rate: '심박수',
            steps: '걸음 수',
            calories: '칼로리',
            sleep: '수면',
            weight: '체중',
            blood_pressure: '혈압',
            blood_oxygen: '혈중 산소',
            body_temperature: '체온',
            exercise_sessions: '운동 세션',
            distance: '이동 거리',
            floors_climbed: '오른 층수',
        };
        return names[type] || type;
    }
    static getDataTypeUnit(type) {
        const units = {
            heart_rate: 'bpm',
            steps: '걸음',
            calories: 'kcal',
            sleep: '분',
            weight: 'kg',
            blood_pressure: 'mmHg',
            blood_oxygen: '%',
            body_temperature: '°C',
            exercise_sessions: '분',
            distance: 'km',
            floors_climbed: '층',
        };
        return units[type] || '';
    }
    static getDataTypeCategory(type) {
        const categories = {
            heart_rate: 'vital',
            steps: 'activity',
            calories: 'activity',
            sleep: 'wellness',
            weight: 'body',
            blood_pressure: 'vital',
            blood_oxygen: 'vital',
            body_temperature: 'vital',
            exercise_sessions: 'activity',
            distance: 'activity',
            floors_climbed: 'activity',
        };
        return categories[type] || 'other';
    }
}
exports.WearableController = WearableController;
//# sourceMappingURL=wearableController.js.map