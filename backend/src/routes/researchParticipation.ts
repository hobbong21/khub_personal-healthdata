import express from 'express';
import {
    getMatchedResearch,
    applyForResearch,
    getResearchParticipationHistory,
    getResearchFeedback
} from '../controllers/researchParticipationController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/research/studies - Get matched research studies for the user
router.get('/studies', getMatchedResearch);

// POST /api/research/apply - Apply for a research study
router.post(
    '/apply',
    [
        body('researchId').notEmpty().withMessage('Research ID is required'),
        body('consentGiven').isBoolean().withMessage('Consent must be a boolean')
    ],
    validateRequest,
    applyForResearch
);

// GET /api/research/history - Get the user's research participation history
router.get(
    '/history',
    [
        query('status').optional().isString().withMessage('Status must be a string')
    ],
    validateRequest,
    getResearchParticipationHistory
);


// GET /api/research/feedback/:participationId - Get feedback for a specific participation
router.get(
    '/feedback/:participationId',
    [
        param('participationId').notEmpty().withMessage('Participation ID is required')
    ],
    validateRequest,
    getResearchFeedback
);

// Commented out routes for functions that don't exist in the controller

// router.post(
//     '/studies/:studyId/withdraw',
//     [
//         param('studyId').notEmpty().withMessage('Study ID is required'),
//         body('reason').optional().isString().withMessage('Withdrawal reason must be a string'),
//     ],
//     validateRequest,
//     // withdrawFromStudy // This function does not exist
// );


// router.post(
//     '/studies/:studyId/data',
//     [
//         param('studyId').notEmpty().withMessage('Study ID is required'),
//         body('dataType').notEmpty().withMessage('Data type is required'),
//         body('data').notEmpty().withMessage('Data is required'),
//     ],
//     validateRequest,
//     // uploadStudyData // This function does not exist
// );

export default router;
