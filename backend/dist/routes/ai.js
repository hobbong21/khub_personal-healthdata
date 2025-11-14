"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
const validateUserId = (0, express_validator_1.param)('userId').isString().notEmpty();
const validatePredictionType = (0, express_validator_1.body)('predictionType')
    .isIn(['cardiovascular', 'diabetes', 'general_health'])
    .withMessage('Invalid prediction type');
const validateModelId = (0, express_validator_1.param)('modelId').isString().notEmpty();
const validateAccuracy = (0, express_validator_1.body)('accuracy')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Accuracy must be between 0 and 1');
router.post('/users/:userId/predictions/risk', validateUserId, validatePredictionType, validation_1.validateRequest, aiController_1.AIController.generateRiskPrediction);
router.post('/users/:userId/analysis/deterioration', validateUserId, validation_1.validateRequest, aiController_1.AIController.analyzeDeterioration);
router.post('/users/:userId/analysis/risk-factors', validateUserId, validation_1.validateRequest, aiController_1.AIController.analyzeRiskFactors);
router.get('/users/:userId/recommendations', validateUserId, validation_1.validateRequest, aiController_1.AIController.getRecommendations);
router.get('/users/:userId/predictions', validateUserId, (0, express_validator_1.query)('predictionType').optional().isString(), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }), validation_1.validateRequest, aiController_1.AIController.getPredictionsHistory);
router.get('/users/:userId/predictions/stats', validateUserId, validation_1.validateRequest, aiController_1.AIController.getPredictionStats);
router.get('/predictions/:predictionId', (0, express_validator_1.param)('predictionId').isString().notEmpty(), validation_1.validateRequest, aiController_1.AIController.getPredictionById);
router.get('/users/:userId/insights', validateUserId, validation_1.validateRequest, aiController_1.AIController.getHealthInsights);
router.post('/users/:userId/predictions/batch', validateUserId, (0, express_validator_1.body)('predictionTypes')
    .isArray({ min: 1 })
    .withMessage('predictionTypes must be a non-empty array'), (0, express_validator_1.body)('predictionTypes.*')
    .isIn(['cardiovascular', 'diabetes', 'general_health'])
    .withMessage('Invalid prediction type in array'), validation_1.validateRequest, aiController_1.AIController.batchPrediction);
router.get('/models', aiController_1.AIController.getAvailableModels);
router.post('/models', (0, express_validator_1.body)('name').isString().notEmpty().withMessage('Model name is required'), (0, express_validator_1.body)('version').isString().notEmpty().withMessage('Model version is required'), (0, express_validator_1.body)('modelType')
    .isIn(['classification', 'regression', 'clustering', 'neural_network'])
    .withMessage('Invalid model type'), (0, express_validator_1.body)('parameters').optional().isObject(), (0, express_validator_1.body)('accuracy').optional().isFloat({ min: 0, max: 1 }), (0, express_validator_1.body)('inputFeatures').optional().isArray(), (0, express_validator_1.body)('outputLabels').optional().isArray(), (0, express_validator_1.body)('description').optional().isString(), validation_1.validateRequest, aiController_1.AIController.createModel);
router.patch('/models/:modelId/performance', validateModelId, validateAccuracy, validation_1.validateRequest, aiController_1.AIController.updateModelPerformance);
router.post('/users/:userId/assessment/quick', validateUserId, (0, express_validator_1.body)('includeRiskFactors').optional().isBoolean(), (0, express_validator_1.body)('includeRecommendations').optional().isBoolean(), validation_1.validateRequest, async (req, res) => {
    try {
        const { userId } = req.params;
        const { includeRiskFactors = true, includeRecommendations = true } = req.body;
        const promises = [
            aiController_1.AIController.generateRiskPrediction({ ...req, body: { predictionType: 'general_health' } }, res)
        ];
        if (includeRiskFactors) {
            promises.push(aiController_1.AIController.analyzeRiskFactors(req, res));
        }
        if (includeRecommendations) {
            promises.push(aiController_1.AIController.getRecommendations(req, res));
        }
        await Promise.all(promises);
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to perform quick assessment',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/users/:userId/trends', validateUserId, (0, express_validator_1.query)('timeframe')
    .optional()
    .isIn(['1_month', '3_months', '6_months', '1_year'])
    .withMessage('Invalid timeframe'), (0, express_validator_1.query)('metrics')
    .optional()
    .isString()
    .withMessage('Metrics should be comma-separated string'), validation_1.validateRequest, async (req, res) => {
    try {
        const { userId } = req.params;
        const { timeframe = '3_months', metrics } = req.query;
        res.json({
            success: true,
            data: {
                userId,
                timeframe,
                metrics: metrics ? metrics.split(',') : ['all'],
                trends: {
                    overall: 'stable',
                    riskScore: 'decreasing',
                    healthMetrics: 'improving'
                },
                message: 'Trend analysis feature coming soon'
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to analyze trends',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=ai.js.map