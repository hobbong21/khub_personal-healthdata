"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMonitoringSession = createMonitoringSession;
exports.getHealthDataForSession = getHealthDataForSession;
exports.getActiveAlerts = getActiveAlerts;
exports.addRealTimeHealthData = addRealTimeHealthData;
exports.acknowledgeAlert = acknowledgeAlert;
exports.shareDataWithHealthcareProvider = shareDataWithHealthcareProvider;
const remoteMonitoringService_1 = require("../services/remoteMonitoringService");
async function createMonitoringSession(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionType, notes } = req.body;
        const session = await remoteMonitoringService_1.RemoteMonitoringService.createMonitoringSession(req.user.id, { sessionType, notes });
        res.status(201).json({ success: true, data: session });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'SESSION_START_FAILED', message: errorMessage } });
    }
}
async function getHealthDataForSession(req, res) {
    try {
        const { sessionId } = req.params;
        const { type, limit, since } = req.query;
        const options = {
            type: type,
            limit: limit ? parseInt(limit, 10) : undefined,
            since: since ? new Date(since) : undefined
        };
        const data = await remoteMonitoringService_1.RemoteMonitoringService.getHealthDataForSession(sessionId, options);
        res.json({ success: true, data });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DATA_FETCH_FAILED', message: errorMessage } });
    }
}
async function getActiveAlerts(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const alerts = await remoteMonitoringService_1.RemoteMonitoringService.getActiveAlerts(sessionId);
        res.json({ success: true, data: alerts });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ALERTS_FETCH_FAILED', message: errorMessage } });
    }
}
async function addRealTimeHealthData(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const healthData = { ...req.body, userId: req.user.id };
        const data = await remoteMonitoringService_1.RemoteMonitoringService.addRealTimeHealthData(sessionId, healthData);
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DATA_SUBMISSION_FAILED', message: errorMessage } });
    }
}
async function acknowledgeAlert(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { alertId } = req.params;
        const acknowledgedBy = req.user.id;
        const alert = await remoteMonitoringService_1.RemoteMonitoringService.acknowledgeAlert(alertId, acknowledgedBy);
        res.json({ success: true, data: alert });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ALERT_ACKNOWLEDGE_FAILED', message: errorMessage } });
    }
}
async function shareDataWithHealthcareProvider(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { providerId, dataTypes, duration } = req.body;
        const share = await remoteMonitoringService_1.RemoteMonitoringService.shareDataWithHealthcareProvider(req.user.id, providerId, dataTypes, duration);
        res.status(201).json({ success: true, data: share });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DATA_SHARE_FAILED', message: errorMessage } });
    }
}
//# sourceMappingURL=remoteMonitoringController.js.map