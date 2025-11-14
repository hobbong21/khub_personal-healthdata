import { Request, Response } from 'express';
import { RemoteMonitoringService } from '../services/remoteMonitoringService';

export async function createMonitoringSession(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionType, notes } = req.body;
        const session = await RemoteMonitoringService.createMonitoringSession(req.user.id, { sessionType, notes });
        res.status(201).json({ success: true, data: session });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'SESSION_START_FAILED', message: errorMessage } });
    }
}

export async function getHealthDataForSession(req: Request, res: Response): Promise<void> {
    try {
        const { sessionId } = req.params;
        const { type, limit, since } = req.query;
        const options = {
            type: type as string | undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined,
            since: since ? new Date(since as string) : undefined
        };
        const data = await RemoteMonitoringService.getHealthDataForSession(sessionId, options);
        res.json({ success: true, data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DATA_FETCH_FAILED', message: errorMessage } });
    }
}

export async function getActiveAlerts(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const alerts = await RemoteMonitoringService.getActiveAlerts(sessionId);
        res.json({ success: true, data: alerts });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ALERTS_FETCH_FAILED', message: errorMessage } });
    }
}

export async function addRealTimeHealthData(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const healthData = { ...req.body, userId: req.user.id };
        const data = await RemoteMonitoringService.addRealTimeHealthData(sessionId, healthData);
        res.status(201).json({ success: true, data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DATA_SUBMISSION_FAILED', message: errorMessage } });
    }
}

export async function acknowledgeAlert(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { alertId } = req.params;
        const acknowledgedBy = req.user.id;
        const alert = await RemoteMonitoringService.acknowledgeAlert(alertId, acknowledgedBy);
        res.json({ success: true, data: alert });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ALERT_ACKNOWLEDGE_FAILED', message: errorMessage } });
    }
}

export async function shareDataWithHealthcareProvider(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { providerId, dataTypes, duration } = req.body;
        const share = await RemoteMonitoringService.shareDataWithHealthcareProvider(req.user.id, providerId, dataTypes, duration);
        res.status(201).json({ success: true, data: share });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'DATA_SHARE_FAILED', message: errorMessage } });
    }
}
