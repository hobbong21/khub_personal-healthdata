"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthSummary = getHealthSummary;
exports.getHealthData = getHealthData;
const healthService_1 = require("../services/healthService");
async function getHealthSummary(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const summary = await healthService_1.HealthService.getHealthSummary(req.user.id);
        res.json({ success: true, data: summary });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HEALTH_SUMMARY_ERROR', message: errorMessage } });
    }
}
async function getHealthData(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { type, startDate, endDate } = req.query;
        const data = await healthService_1.HealthService.getHealthData(req.user.id, { type, startDate, endDate });
        res.json({ success: true, data });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HEALTH_DATA_ERROR', message: errorMessage } });
    }
}
//# sourceMappingURL=healthController.js.map