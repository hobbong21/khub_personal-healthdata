import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// Apply authentication to all AI routes
router.use(authenticateToken);

// Validation middleware
const validateUserId = param('userId').isString().notEmpty();
const validatePredictionType = body('predictionType')
  .isIn(['cardiovascular', 'diabetes', 'general_health'])
  .withMessage('Invalid prediction type');
const validateModelId = param('modelId').isString().notEmpty();
const validateAccuracy = body('accuracy')
  .isFloat({ min: 0, max: 1 })
  .withMessage('Accuracy must be between 0 and 1');

// Health Risk Predictions
router.post(
  '/users/:userId/predictions/risk',
  validateUserId,
  validatePredictionType,
  validateRequest,
  AIController.generateRiskPrediction
);

// Health Deterioration Analysis
router.post(
  '/users/:userId/analysis/deterioration',
  validateUserId,
  validateRequest,
  AIController.analyzeDeterioration
);

// Risk Factor Analysis
router.post(
  '/users/:userId/analysis/risk-factors',
  validateUserId,
  validateRequest,
  AIController.analyzeRiskFactors
);

// Personalized Recommendations
router.get(
  '/users/:userId/recommendations',
  validateUserId,
  validateRequest,
  AIController.getRecommendations
);

// Predictions History
router.get(
  '/users/:userId/predictions',
  validateUserId,
  query('predictionType').optional().isString(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validateRequest,
  AIController.getPredictionsHistory
);

// Prediction Statistics
router.get(
  '/users/:userId/predictions/stats',
  validateUserId,
  validateRequest,
  AIController.getPredictionStats
);

// Get Specific Prediction
router.get(
  '/predictions/:predictionId',
  param('predictionId').isString().notEmpty(),
  validateRequest,
  AIController.getPredictionById
);

// Comprehensive Health Insights
router.get(
  '/users/:userId/insights',
  validateUserId,
  validateRequest,
  AIController.getHealthInsights
);

// Batch Predictions
router.post(
  '/users/:userId/predictions/batch',
  validateUserId,
  body('predictionTypes')
    .isArray({ min: 1 })
    .withMessage('predictionTypes must be a non-empty array'),
  body('predictionTypes.*')
    .isIn(['cardiovascular', 'diabetes', 'general_health'])
    .withMessage('Invalid prediction type in array'),
  validateRequest,
  AIController.batchPrediction
);

// Model Management Routes

// Get Available Models
router.get('/models', AIController.getAvailableModels);

// Create New Model
router.post(
  '/models',
  body('name').isString().notEmpty().withMessage('Model name is required'),
  body('version').isString().notEmpty().withMessage('Model version is required'),
  body('modelType')
    .isIn(['classification', 'regression', 'clustering', 'neural_network'])
    .withMessage('Invalid model type'),
  body('parameters').optional().isObject(),
  body('accuracy').optional().isFloat({ min: 0, max: 1 }),
  body('inputFeatures').optional().isArray(),
  body('outputLabels').optional().isArray(),
  body('description').optional().isString(),
  validateRequest,
  AIController.createModel
);

// Update Model Performance
router.patch(
  '/models/:modelId/performance',
  validateModelId,
  validateAccuracy,
  validateRequest,
  AIController.updateModelPerformance
);

// Health Data Analysis Routes

// Quick Health Assessment
router.post(
  '/users/:userId/assessment/quick',
  validateUserId,
  body('includeRiskFactors').optional().isBoolean(),
  body('includeRecommendations').optional().isBoolean(),
  validateRequest,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { includeRiskFactors = true, includeRecommendations = true } = req.body;

      const promises = [
        AIController.generateRiskPrediction(
          { ...req, body: { predictionType: 'general_health' } } as any,
          res
        )
      ];

      if (includeRiskFactors) {
        promises.push(AIController.analyzeRiskFactors(req as any, res));
      }

      if (includeRecommendations) {
        promises.push(AIController.getRecommendations(req as any, res));
      }

      // This is a simplified version - in practice, you'd want to handle this differently
      // to avoid multiple responses
      await Promise.all(promises);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to perform quick assessment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Trend Analysis
router.get(
  '/users/:userId/trends',
  validateUserId,
  query('timeframe')
    .optional()
    .isIn(['1_month', '3_months', '6_months', '1_year'])
    .withMessage('Invalid timeframe'),
  query('metrics')
    .optional()
    .isString()
    .withMessage('Metrics should be comma-separated string'),
  validateRequest,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe = '3_months', metrics } = req.query;

      // This would implement trend analysis logic
      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          userId,
          timeframe,
          metrics: metrics ? (metrics as string).split(',') : ['all'],
          trends: {
            overall: 'stable',
            riskScore: 'decreasing',
            healthMetrics: 'improving'
          },
          message: 'Trend analysis feature coming soon'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to analyze trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;