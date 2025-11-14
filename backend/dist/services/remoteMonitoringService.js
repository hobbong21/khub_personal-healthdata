"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteMonitoringService = void 0;
const RemoteMonitoring_1 = require("../models/RemoteMonitoring");
exports.RemoteMonitoringService = {
    async createMonitoringSession(userId, sessionData) {
        return RemoteMonitoring_1.RemoteMonitoringModel.createSession({ ...sessionData, userId });
    },
    async addRealTimeHealthData(monitoringSessionId, healthData) {
        return RemoteMonitoring_1.RemoteMonitoringModel.addRealTimeData({ ...healthData, monitoringSessionId });
    },
    async getHealthDataForSession(sessionId, options) {
        const session = await RemoteMonitoring_1.RemoteMonitoringModel.getActiveSession(sessionId);
        if (!session) {
            throw new Error('Monitoring session not found or not active');
        }
        return RemoteMonitoring_1.RemoteMonitoringModel.getRealTimeData(session.userId, options.type, options.limit);
    },
    async getActiveAlerts(sessionId) {
        const session = await RemoteMonitoring_1.RemoteMonitoringModel.getActiveSession(sessionId);
        if (!session) {
            throw new Error('Monitoring session not found or not active');
        }
        return RemoteMonitoring_1.RemoteMonitoringModel.getUnacknowledgedAlerts(session.userId);
    },
    async acknowledgeAlert(alertId, acknowledgedBy) {
        return RemoteMonitoring_1.RemoteMonitoringModel.acknowledgeAlert(alertId, acknowledgedBy);
    },
    async shareDataWithHealthcareProvider(userId, providerId, dataTypes, duration) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + duration);
        return RemoteMonitoring_1.RemoteMonitoringModel.createDataShare({
            userId,
            healthcareProviderEmail: providerId,
            sharedDataTypes: dataTypes,
            accessLevel: 'read_only',
            startDate,
            endDate,
        });
    }
};
//# sourceMappingURL=remoteMonitoringService.js.map