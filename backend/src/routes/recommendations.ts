import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query } from 'express-validator';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route POST /api/recommendations/generate
 * @desc Generate new personalized recommendations
 * @access Private
 */
router.post(
  '/generate',
  [
    body('config.includeGenomics').optional().isBoolean(),
    body('config.includeLifestyle').optional().isBoolean(),
    body('config.includeFamilyHistory').optional().isBoolean(),
    body('config.includeMedicalHistory').optional().isBoolean(),
    body('config.priorityThreshold').optional().isIn(['low', 'medium', 'high']),
    body('config.maxRecommendationsPerCategory').optional().isInt({ min: 1, max: 10 }),
  ],
  validateRequest,
  RecommendationController.generateRecommendations
);

/**
 * @route GET /api/recommendations/latest
 * @desc Get latest valid recommendations for user
 * @access Private
 */
router.get('/latest', RecommendationController.getLatestRecommendations);

/**
 * @route GET /api/recommendations/history
 * @desc Get recommendations history
 * @access Private
 */
router.get(
  '/history',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  RecommendationController.getRecommendationsHistory
);

/**
 * @route POST /api/recommendations/track-implementation
 * @desc Track recommendation implementation status
 * @access Private
 */
router.post(
  '/track-implementation',
  [
    body('recommendationId').notEmpty().isString(),
    body('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    body('implemented').isBoolean(),
    body('implementationDate').optional().isISO8601(),
  ],
  validateRequest,
  RecommendationController.trackImplementation
);

/**
 * @route POST /api/recommendations/feedback
 * @desc Submit user feedback for recommendations
 * @access Private
 */
router.post(
  '/feedback',
  [
    body('recommendationId').notEmpty().isString(),
    body('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comments').optional().isString().isLength({ max: 500 }),
  ],
  validateRequest,
  RecommendationController.submitFeedback
);

/**
 * @route POST /api/recommendations/adherence
 * @desc Update adherence score for a recommendation
 * @access Private
 */
router.post(
  '/adherence',
  [
    body('recommendationId').notEmpty().isString(),
    body('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    body('adherenceScore').isInt({ min: 0, max: 100 }),
  ],
  validateRequest,
  RecommendationController.updateAdherence
);

/**
 * @route POST /api/recommendations/outcome
 * @desc Record measured outcome for a recommendation
 * @access Private
 */
router.post(
  '/outcome',
  [
    body('recommendationId').notEmpty().isString(),
    body('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    body('metric').notEmpty().isString(),
    body('beforeValue').isNumeric(),
    body('afterValue').isNumeric(),
  ],
  validateRequest,
  RecommendationController.recordOutcome
);

/**
 * @route GET /api/recommendations/effectiveness
 * @desc Get effectiveness data for user's recommendations
 * @access Private
 */
router.get(
  '/effectiveness',
  [
    query('category').optional().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
  ],
  validateRequest,
  RecommendationController.getEffectivenessData
);

/**
 * @route GET /api/recommendations/stats
 * @desc Get recommendation statistics for user
 * @access Private
 */
router.get('/stats', RecommendationController.getRecommendationStats);

/**
 * @route GET /api/recommendations/lifestyle-suggestions
 * @desc Get lifestyle improvement suggestions
 * @access Private
 */
router.get('/lifestyle-suggestions', RecommendationController.getLifestyleSuggestions);

/**
 * @route GET /api/recommendations/screening-schedule
 * @desc Get personalized screening schedule
 * @access Private
 */
router.get('/screening-schedule', RecommendationController.getScreeningSchedule);

export default router;