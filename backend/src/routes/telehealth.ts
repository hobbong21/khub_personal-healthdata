import express from 'express';
import {
    scheduleTelehealthSession,
    getTelehealthSessions,
    getTelehealthSessionDetails,
    cancelTelehealthSession,
    connectToTelehealthSession
} from '../controllers/telehealthController';
import { authenticateToken } from '../middleware/auth';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post(
    '/sessions',
    [
        body('dateTime').isISO8601().withMessage('Valid session date and time are required'),
        body('providerId').notEmpty().withMessage('Healthcare provider ID is required'),
    ],
    validateRequest,
    scheduleTelehealthSession
);

router.get('/sessions', getTelehealthSessions);

router.get(
    '/sessions/:sessionId',
    [param('sessionId').notEmpty().withMessage('Session ID is required')],
    validateRequest,
    getTelehealthSessionDetails
);

router.post(
    '/sessions/:sessionId/cancel',
    [param('sessionId').notEmpty().withMessage('Session ID is required')],
    validateRequest,
    cancelTelehealthSession
);

router.post(
    '/sessions/:sessionId/connect',
    [param('sessionId').notEmpty().withMessage('Session ID is required')],
    validateRequest,
    connectToTelehealthSession
);

export default router;
