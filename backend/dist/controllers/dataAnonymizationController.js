"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDataAnonymization = requestDataAnonymization;
exports.getAnonymizationHistory = getAnonymizationHistory;
exports.getAnonymizationStats = getAnonymizationStats;
const dataAnonymizationService_1 = require("../services/dataAnonymizationService");
async function requestDataAnonymization(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { dataTypes, purpose, anonymizationMethod } = req.body;
        const result = await dataAnonymizationService_1.DataAnonymizationService.anonymizeUserData(req.user.id, dataTypes, purpose, anonymizationMethod);
        res.status(202).json({ success: true, message: 'Data anonymization process started.', data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ANONYMIZATION_REQUEST_FAILED', message: errorMessage } });
    }
}
async function getAnonymizationHistory(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { purpose, limit } = req.query;
        const logs = await dataAnonymizationService_1.DataAnonymizationService.getAnonymizationLogs(req.user.id, purpose, limit ? parseInt(limit) : undefined);
        res.json({ success: true, data: logs });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HISTORY_FETCH_FAILED', message: errorMessage } });
    }
}
async function getAnonymizationStats(req, res) {
    try {
        const stats = await dataAnonymizationService_1.DataAnonymizationService.getAnonymizationStats();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'STATS_FETCH_FAILED', message: errorMessage } });
    }
}
//# sourceMappingURL=dataAnonymizationController.js.map