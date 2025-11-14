"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleFitController = void 0;
const googleFitService_1 = require("../services/googleFitService");
class GoogleFitController {
    constructor() {
        this.googleFitService = new googleFitService_1.GoogleFitService();
    }
    async getAuthUrl(req, res) {
        try {
            const authUrl = this.googleFitService.generateAuthUrl();
            res.json({
                success: true,
                authUrl,
                message: 'Google Fit 인증을 위해 제공된 URL로 이동하세요.',
            });
        }
        catch (error) {
            console.error('Error generating Google Fit auth URL:', error);
            res.status(500).json({
                success: false,
                message: 'Google Fit 인증 URL 생성에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async handleAuthCallback(req, res) {
        try {
            const { code, state } = req.query;
            const userId = req.user?.id;
            if (!code || typeof code !== 'string') {
                res.status(400).json({
                    success: false,
                    message: '인증 코드가 제공되지 않았습니다.',
                });
                return;
            }
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '사용자 인증이 필요합니다.',
                });
                return;
            }
            const tokens = await this.googleFitService.exchangeCodeForTokens(code);
            const deviceConfig = {
                userId,
                deviceType: 'google_fit',
                deviceName: 'Google Fit',
                isActive: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                syncSettings: {
                    autoSync: true,
                    syncInterval: 60,
                    dataTypes: ['heart_rate', 'steps', 'calories', 'sleep', 'weight'],
                },
                lastSyncAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            console.log('Google Fit device config to save:', deviceConfig);
            res.json({
                success: true,
                message: 'Google Fit 연동이 성공적으로 완료되었습니다.',
                deviceConfig: {
                    deviceType: 'google_fit',
                    deviceName: 'Google Fit',
                    isActive: true,
                },
            });
        }
        catch (error) {
            console.error('Error handling Google Fit auth callback:', error);
            res.status(500).json({
                success: false,
                message: 'Google Fit 인증 처리에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async syncData(req, res) {
        try {
            const userId = req.user?.id;
            const { dataTypes, startDate, endDate, forceSync } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '사용자 인증이 필요합니다.',
                });
                return;
            }
            const deviceConfig = await this.getUserGoogleFitConfig(userId);
            if (!deviceConfig || !deviceConfig.accessToken) {
                res.status(404).json({
                    success: false,
                    message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
                });
                return;
            }
            this.googleFitService.setCredentials(deviceConfig.accessToken, deviceConfig.refreshToken || '');
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();
            const typesToSync = dataTypes || deviceConfig.syncSettings?.dataTypes || ['steps', 'heart_rate'];
            const syncResult = await this.googleFitService.syncMultipleDataTypes(typesToSync, start, end);
            syncResult.deviceConfigId = deviceConfig.id;
            console.log('Sync result:', syncResult);
            res.json({
                success: syncResult.success,
                message: syncResult.success
                    ? `${syncResult.syncedDataCount}개의 데이터 포인트가 동기화되었습니다.`
                    : '일부 데이터 동기화에 실패했습니다.',
                syncResult,
            });
        }
        catch (error) {
            console.error('Error syncing Google Fit data:', error);
            res.status(500).json({
                success: false,
                message: 'Google Fit 데이터 동기화에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getDataByType(req, res) {
        try {
            const userId = req.user?.id;
            const { dataType } = req.params;
            const { startDate, endDate } = req.query;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '사용자 인증이 필요합니다.',
                });
                return;
            }
            if (!dataType || !this.isValidDataType(dataType)) {
                res.status(400).json({
                    success: false,
                    message: '유효하지 않은 데이터 타입입니다.',
                });
                return;
            }
            const deviceConfig = await this.getUserGoogleFitConfig(userId);
            if (!deviceConfig || !deviceConfig.accessToken) {
                res.status(404).json({
                    success: false,
                    message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
                });
                return;
            }
            this.googleFitService.setCredentials(deviceConfig.accessToken, deviceConfig.refreshToken || '');
            const start = startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
            const end = endDate ? new Date(endDate) : new Date();
            const data = await this.googleFitService.getDataByType(dataType, start, end);
            res.json({
                success: true,
                dataType,
                dataCount: data.length,
                data,
                period: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Error fetching Google Fit data by type:', error);
            res.status(500).json({
                success: false,
                message: 'Google Fit 데이터 조회에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getConnectionStatus(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '사용자 인증이 필요합니다.',
                });
                return;
            }
            const deviceConfig = await this.getUserGoogleFitConfig(userId);
            if (!deviceConfig || !deviceConfig.accessToken) {
                res.json({
                    success: true,
                    isConnected: false,
                    message: 'Google Fit이 연동되지 않았습니다.',
                });
                return;
            }
            this.googleFitService.setCredentials(deviceConfig.accessToken, deviceConfig.refreshToken || '');
            const syncStatus = await this.googleFitService.getSyncStatus();
            res.json({
                success: true,
                isConnected: syncStatus.isConnected,
                deviceConfig: {
                    deviceName: deviceConfig.deviceName,
                    lastSyncAt: deviceConfig.lastSyncAt,
                    syncSettings: deviceConfig.syncSettings,
                },
                syncStatus,
            });
        }
        catch (error) {
            console.error('Error checking Google Fit connection status:', error);
            res.status(500).json({
                success: false,
                message: 'Google Fit 연결 상태 확인에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async disconnectDevice(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '사용자 인증이 필요합니다.',
                });
                return;
            }
            const result = await this.deactivateGoogleFitConfig(userId);
            if (!result) {
                res.status(404).json({
                    success: false,
                    message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
                });
                return;
            }
            res.json({
                success: true,
                message: 'Google Fit 연동이 성공적으로 해제되었습니다.',
            });
        }
        catch (error) {
            console.error('Error disconnecting Google Fit:', error);
            res.status(500).json({
                success: false,
                message: 'Google Fit 연동 해제에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getUserGoogleFitConfig(userId) {
        console.log(`Getting Google Fit config for user: ${userId}`);
        return null;
    }
    async deactivateGoogleFitConfig(userId) {
        console.log(`Deactivating Google Fit config for user: ${userId}`);
        return true;
    }
    isValidDataType(dataType) {
        const validTypes = [
            'heart_rate', 'steps', 'calories', 'sleep', 'weight',
            'blood_pressure', 'blood_oxygen', 'body_temperature',
            'exercise_sessions', 'distance', 'floors_climbed'
        ];
        return validTypes.includes(dataType);
    }
    async updateSyncSettings(req, res) {
        try {
            const userId = req.user?.id;
            const { autoSync, syncInterval, dataTypes } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '사용자 인증이 필요합니다.',
                });
                return;
            }
            const updatedConfig = {
                autoSync: autoSync ?? true,
                syncInterval: syncInterval ?? 60,
                dataTypes: dataTypes ?? ['steps', 'heart_rate', 'calories'],
            };
            console.log(`Updating sync settings for user ${userId}:`, updatedConfig);
            res.json({
                success: true,
                message: '동기화 설정이 업데이트되었습니다.',
                syncSettings: updatedConfig,
            });
        }
        catch (error) {
            console.error('Error updating Google Fit sync settings:', error);
            res.status(500).json({
                success: false,
                message: '동기화 설정 업데이트에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getUserProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: '사용자 인증이 필요합니다.',
                });
                return;
            }
            const deviceConfig = await this.getUserGoogleFitConfig(userId);
            if (!deviceConfig || !deviceConfig.accessToken) {
                res.status(404).json({
                    success: false,
                    message: 'Google Fit 연동 설정을 찾을 수 없습니다.',
                });
                return;
            }
            this.googleFitService.setCredentials(deviceConfig.accessToken, deviceConfig.refreshToken || '');
            const profile = await this.googleFitService.getUserProfile();
            res.json({
                success: true,
                profile,
            });
        }
        catch (error) {
            console.error('Error fetching Google Fit user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Google Fit 사용자 프로필 조회에 실패했습니다.',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.GoogleFitController = GoogleFitController;
//# sourceMappingURL=googleFitController.js.map