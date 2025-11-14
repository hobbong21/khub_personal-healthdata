"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIncentiveDashboard = getIncentiveDashboard;
exports.getContributionHistory = getContributionHistory;
exports.redeemReward = redeemReward;
const incentiveManagementService_1 = require("../services/incentiveManagementService");
async function getIncentiveDashboard(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const dashboardData = await incentiveManagementService_1.IncentiveManagementService.getUserIncentiveDashboard(req.user.id);
        res.json({ success: true, data: dashboardData });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DASHBOARD_FETCH_FAILED', message: errorMessage } });
    }
}
async function getContributionHistory(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { startDate, endDate } = req.query;
        const history = await incentiveManagementService_1.IncentiveManagementService.getContributionHistory(req.user.id, {
            start: new Date(startDate),
            end: new Date(endDate),
        });
        res.json({ success: true, data: history });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HISTORY_FETCH_FAILED', message: errorMessage } });
    }
}
async function redeemReward(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { rewardId, points } = req.body;
        const transaction = await incentiveManagementService_1.IncentiveManagementService.redeemReward(req.user.id, rewardId, points);
        res.status(201).json({ success: true, data: transaction });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'REWARD_REDEMPTION_FAILED', message: errorMessage } });
    }
}
//# sourceMappingURL=incentiveManagementController.js.map