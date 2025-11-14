"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteMonitoringModel = void 0;
const database_1 = __importDefault(require("../config/database"));
class RemoteMonitoringModel {
    static async createSession(sessionData) {
        const session = await database_1.default.remoteMonitoringSession.create({
            data: {
                userId: sessionData.userId,
                sessionType: sessionData.sessionType,
                monitoringParameters: sessionData.monitoringParameters,
                alertThresholds: sessionData.alertThresholds,
                notes: sessionData.notes,
            },
        });
        return session;
    }
    static async addRealTimeData(healthData) {
        const isCritical = await this.checkCriticalThresholds(healthData.userId, healthData.dataType, healthData.value);
        const data = await database_1.default.realTimeHealthData.create({
            data: {
                userId: healthData.userId,
                monitoringSessionId: healthData.monitoringSessionId,
                dataType: healthData.dataType,
                value: healthData.value,
                unit: healthData.unit,
                deviceSource: healthData.deviceSource,
                isCritical,
                recordedAt: healthData.recordedAt,
            },
        });
        if (isCritical) {
            await this.createHealthAlert({
                userId: healthData.userId,
                monitoringSessionId: healthData.monitoringSessionId,
                alertType: 'threshold_exceeded',
                severity: 'high',
                title: `${healthData.dataType} 임계값 초과`,
                message: `${healthData.dataType} 값이 정상 범위를 벗어났습니다: ${JSON.stringify(healthData.value)}`,
                dataReference: { realTimeDataId: data.id },
            });
        }
        return data;
    }
    static async createHealthAlert(alertData) {
        const alert = await database_1.default.healthAlert.create({
            data: {
                userId: alertData.userId,
                monitoringSessionId: alertData.monitoringSessionId,
                alertType: alertData.alertType,
                severity: alertData.severity,
                title: alertData.title,
                message: alertData.message,
                dataReference: alertData.dataReference,
            },
        });
        return alert;
    }
    static async createDataShare(shareData) {
        const accessToken = this.generateAccessToken();
        const share = await database_1.default.healthcareDataShare.create({
            data: {
                userId: shareData.userId,
                healthcareProviderEmail: shareData.healthcareProviderEmail,
                healthcareProviderName: shareData.healthcareProviderName,
                sharedDataTypes: shareData.sharedDataTypes,
                accessLevel: shareData.accessLevel,
                startDate: shareData.startDate,
                endDate: shareData.endDate,
                accessToken,
            },
        });
        return share;
    }
    static async getActiveSession(userId) {
        const session = await database_1.default.remoteMonitoringSession.findFirst({
            where: {
                userId,
                status: 'active',
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return session;
    }
    static async getRealTimeData(userId, dataType, limit = 100) {
        const data = await database_1.default.realTimeHealthData.findMany({
            where: {
                userId,
                ...(dataType && { dataType }),
            },
            orderBy: {
                recordedAt: 'desc',
            },
            take: limit,
        });
        return data;
    }
    static async getUnacknowledgedAlerts(userId) {
        const alerts = await database_1.default.healthAlert.findMany({
            where: {
                userId,
                isAcknowledged: false,
            },
            orderBy: [
                { severity: 'desc' },
                { createdAt: 'desc' },
            ],
        });
        return alerts;
    }
    static async acknowledgeAlert(alertId, acknowledgedBy) {
        const alert = await database_1.default.healthAlert.update({
            where: { id: alertId },
            data: {
                isAcknowledged: true,
                acknowledgedAt: new Date(),
                acknowledgedBy,
            },
        });
        return alert;
    }
    static async endSession(sessionId) {
        const session = await database_1.default.remoteMonitoringSession.update({
            where: { id: sessionId },
            data: {
                status: 'completed',
                endTime: new Date(),
            },
        });
        return session;
    }
    static async checkCriticalThresholds(userId, dataType, value) {
        const session = await this.getActiveSession(userId);
        if (!session?.alertThresholds) {
            return false;
        }
        const thresholds = session.alertThresholds[dataType];
        if (!thresholds) {
            return false;
        }
        switch (dataType) {
            case 'heart_rate':
                return value < thresholds.min || value > thresholds.max;
            case 'blood_pressure':
                return (value.systolic > thresholds.systolic_max ||
                    value.diastolic > thresholds.diastolic_max ||
                    value.systolic < thresholds.systolic_min ||
                    value.diastolic < thresholds.diastolic_min);
            case 'temperature':
                return value < thresholds.min || value > thresholds.max;
            case 'oxygen_saturation':
                return value < thresholds.min;
            default:
                return false;
        }
    }
    static generateAccessToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    static async getDashboardData(userId) {
        const [activeSession, recentData, unacknowledgedAlerts, dataShares] = await Promise.all([
            this.getActiveSession(userId),
            this.getRealTimeData(userId, undefined, 50),
            this.getUnacknowledgedAlerts(userId),
            database_1.default.healthcareDataShare.findMany({
                where: { userId, isActive: true },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            activeSession,
            recentData,
            unacknowledgedAlerts,
            dataShares: dataShares,
        };
    }
}
exports.RemoteMonitoringModel = RemoteMonitoringModel;
//# sourceMappingURL=RemoteMonitoring.js.map