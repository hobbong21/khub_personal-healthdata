import express from 'express';
import { 
    getIncentiveDashboard,
    getContributionHistory,
    redeemReward
 } from '../controllers/incentiveManagementController';
import { authenticateToken } from '../middleware/auth';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Get all incentive programs (publicly accessible)
// router.get('/programs', getIncentivePrograms);

// Routes requiring authentication
router.use(authenticateToken);

// router.post(
//     '/programs/join',
//     [body('programId').notEmpty().withMessage('Program ID is required')],
//     validateRequest,
//     joinIncentiveProgram
// );

router.get('/user', getIncentiveDashboard);

router.get(
    '/history',
    [
        query('startDate').optional().isISO8601().toDate(),
        query('endDate').optional().isISO8601().toDate()
    ],
    validateRequest,
    getContributionHistory
);

// router.get(
//     '/leaderboard',
//     [query('programId').notEmpty().withMessage('Program ID is required')],
//     validateRequest,
//     getLeaderboard
// );

router.post(
    '/redeem',
    [body('rewardId').notEmpty().withMessage('Reward ID is required'), body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer')],
    validateRequest,
    redeemReward
);

export default router;
