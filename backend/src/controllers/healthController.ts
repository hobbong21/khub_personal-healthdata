import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';

export async function getHealthSummary(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const summary = await HealthService.getHealthSummary(req.user.id);
        res.json({ success: true, data: summary });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HEALTH_SUMMARY_ERROR', message: errorMessage } });
    }
}

export async function getHealthData(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { type, startDate, endDate } = req.query;
        const data = await HealthService.getHealthData(req.user.id, { type, startDate, endDate });
        res.json({ success: true, data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HEALTH_DATA_ERROR', message: errorMessage } });
    }
}
