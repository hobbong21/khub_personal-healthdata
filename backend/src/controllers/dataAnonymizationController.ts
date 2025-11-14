import { Request, Response } from 'express';
import { DataAnonymizationService } from '../services/dataAnonymizationService';

export async function requestDataAnonymization(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { dataTypes, purpose, anonymizationMethod } = req.body;
        const result = await DataAnonymizationService.anonymizeUserData(
            req.user.id,
            dataTypes,
            purpose,
            anonymizationMethod
        );
        res.status(202).json({ success: true, message: 'Data anonymization process started.', data: result });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ANONYMIZATION_REQUEST_FAILED', message: errorMessage } });
    }
}

export async function getAnonymizationHistory(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { purpose, limit } = req.query;
        const logs = await DataAnonymizationService.getAnonymizationLogs(
            req.user.id,
            purpose as string | undefined,
            limit ? parseInt(limit as string) : undefined
        );
        res.json({ success: true, data: logs });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'HISTORY_FETCH_FAILED', message: errorMessage } });
    }
}

export async function getAnonymizationStats(req: Request, res: Response): Promise<void> {
    try {
        const stats = await DataAnonymizationService.getAnonymizationStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'STATS_FETCH_FAILED', message: errorMessage } });
    }
}
