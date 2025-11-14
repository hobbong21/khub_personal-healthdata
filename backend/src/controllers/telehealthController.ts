import { Request, Response } from 'express';
import { TelehealthService } from '../services/telehealthService';

// export async function getAvailableSlots(req: Request, res: Response): Promise<void> {
//     try {
//         const { doctorId, date } = req.query;
//         // const slots = await TelehealthService.getAvailableSlots(doctorId as string, new Date(date as string));
//         // res.json({ success: true, data: slots });
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//         res.status(500).json({ success: false, error: { code: 'SLOTS_FETCH_FAILED', message: errorMessage } });
//     }
// }

export async function scheduleTelehealthSession(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { providerId, dateTime } = req.body;
        const appointment = await TelehealthService.scheduleTelehealthSession(req.user.id, dateTime, providerId);
        res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'BOOKING_FAILED', message: errorMessage } });
    }
}

export async function getTelehealthSessions(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const sessions = await TelehealthService.getTelehealthSessions(req.user.id);
        res.json({ success: true, data: sessions });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'SESSIONS_FETCH_FAILED', message: errorMessage } });
    }
}

export async function getTelehealthSessionDetails(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const session = await TelehealthService.getTelehealthSessionDetails(sessionId, req.user.id);
        res.json({ success: true, data: session });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'SESSION_FETCH_FAILED', message: errorMessage } });
    }
}

export async function cancelTelehealthSession(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const result = await TelehealthService.cancelTelehealthSession(sessionId, req.user.id);
        res.json({ success: true, data: result });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'CANCELLATION_FAILED', message: errorMessage } });
    }
}

export async function connectToTelehealthSession(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const connectionDetails = await TelehealthService.connectToTelehealthSession(sessionId, req.user.id);
        res.json({ success: true, data: connectionDetails });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'CONNECTION_FAILED', message: errorMessage } });
    }
}
