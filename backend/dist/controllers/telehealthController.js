"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleTelehealthSession = scheduleTelehealthSession;
exports.getTelehealthSessions = getTelehealthSessions;
exports.getTelehealthSessionDetails = getTelehealthSessionDetails;
exports.cancelTelehealthSession = cancelTelehealthSession;
exports.connectToTelehealthSession = connectToTelehealthSession;
const telehealthService_1 = require("../services/telehealthService");
async function scheduleTelehealthSession(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { providerId, dateTime } = req.body;
        const appointment = await telehealthService_1.TelehealthService.scheduleTelehealthSession(req.user.id, dateTime, providerId);
        res.status(201).json({ success: true, data: appointment });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'BOOKING_FAILED', message: errorMessage } });
    }
}
async function getTelehealthSessions(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const sessions = await telehealthService_1.TelehealthService.getTelehealthSessions(req.user.id);
        res.json({ success: true, data: sessions });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'SESSIONS_FETCH_FAILED', message: errorMessage } });
    }
}
async function getTelehealthSessionDetails(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const session = await telehealthService_1.TelehealthService.getTelehealthSessionDetails(sessionId, req.user.id);
        res.json({ success: true, data: session });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'SESSION_FETCH_FAILED', message: errorMessage } });
    }
}
async function cancelTelehealthSession(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const result = await telehealthService_1.TelehealthService.cancelTelehealthSession(sessionId, req.user.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'CANCELLATION_FAILED', message: errorMessage } });
    }
}
async function connectToTelehealthSession(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const { sessionId } = req.params;
        const connectionDetails = await telehealthService_1.TelehealthService.connectToTelehealthSession(sessionId, req.user.id);
        res.json({ success: true, data: connectionDetails });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'CONNECTION_FAILED', message: errorMessage } });
    }
}
//# sourceMappingURL=telehealthController.js.map