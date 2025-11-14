import { Request, Response } from 'express';
import { IncentiveManagementService } from '../services/incentiveManagementService';

export async function getIncentiveDashboard(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const dashboardData = await IncentiveManagementService.getUserIncentiveDashboard(req.user.id);
        res.json({ success: true, data: dashboardData });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DASHBOARD_FETCH_FAILED', message: errorMessage } });
    }
}

export async function getContributionHistory(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { startDate, endDate } = req.query;
        const history = await IncentiveManagementService.getContributionHistory(req.user.id, {
            start: new Date(startDate as string),
            end: new Date(endDate as string),
        });
        res.json({ success: true, data: history });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HISTORY_FETCH_FAILED', message: errorMessage } });
    }
}

export async function redeemReward(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { rewardId, points } = req.body;
        const transaction = await IncentiveManagementService.redeemReward(req.user.id, rewardId, points);
        res.status(201).json({ success: true, data: transaction });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'REWARD_REDEMPTION_FAILED', message: errorMessage } });
    }
}
