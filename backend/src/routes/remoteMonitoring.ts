import express from 'express';
import {
    createMonitoringSession,
    addRealTimeHealthData,
    getHealthDataForSession,
    getActiveAlerts,
    acknowledgeAlert,
    shareDataWithHealthcareProvider
} from '../controllers/remoteMonitoringController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post(
    '/sessions',
    [
        body('sessionType').isIn(['continuous', 'scheduled', 'emergency']).withMessage('Invalid session type'),
        body('notes').optional().isString(),
    ],
    validateRequest,
    createMonitoringSession
);

router.post(
    '/sessions/:sessionId/data',
    [
        param('sessionId').notEmpty().withMessage('Session ID is required'),
        body('dataType').notEmpty().withMessage('dataType is required'),
        body('value').notEmpty().withMessage('value is required'),
        body('recordedAt').isISO8601().withMessage('recordedAt is required and must be an ISO8601 date'),
    ],
    validateRequest,
    addRealTimeHealthData
);

router.get(
    '/sessions/:sessionId/data',
    [
        param('sessionId').notEmpty().withMessage('Session ID is required'),
        query('type').optional().isString(),
        query('limit').optional().isInt(),
        query('since').optional().isISO8601(),
    ],
    validateRequest,
    getHealthDataForSession
);

router.get(
    '/sessions/:sessionId/alerts',
    [param('sessionId').notEmpty().withMessage('Session ID is required')],
    validateRequest,
    getActiveAlerts
);

router.post(
    '/alerts/:alertId/acknowledge',
    [param('alertId').notEmpty().withMessage('Alert ID is required')],
    validateRequest,
    acknowledgeAlert
);

router.post(
    '/share',
    [
        body('providerId').notEmpty().withMessage('Healthcare provider ID is required'),
        body('dataTypes').isArray({ min: 1 }).withMessage('At least one data type must be selected'),
        body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
    ],
    validateRequest,
    shareDataWithHealthcareProvider
);

export default router;
