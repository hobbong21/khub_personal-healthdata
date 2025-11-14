"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recommendationController_1 = require("../controllers/recommendationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/generate', [
    (0, express_validator_1.body)('config.includeGenomics').optional().isBoolean(),
    (0, express_validator_1.body)('config.includeLifestyle').optional().isBoolean(),
    (0, express_validator_1.body)('config.includeFamilyHistory').optional().isBoolean(),
    (0, express_validator_1.body)('config.includeMedicalHistory').optional().isBoolean(),
    (0, express_validator_1.body)('config.priorityThreshold').optional().isIn(['low', 'medium', 'high']),
    (0, express_validator_1.body)('config.maxRecommendationsPerCategory').optional().isInt({ min: 1, max: 10 }),
], validation_1.validateRequest, recommendationController_1.RecommendationController.generateRecommendations);
router.get('/latest', recommendationController_1.RecommendationController.getLatestRecommendations);
router.get('/history', [
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }),
], validation_1.validateRequest, recommendationController_1.RecommendationController.getRecommendationsHistory);
router.post('/track-implementation', [
    (0, express_validator_1.body)('recommendationId').notEmpty().isString(),
    (0, express_validator_1.body)('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    (0, express_validator_1.body)('implemented').isBoolean(),
    (0, express_validator_1.body)('implementationDate').optional().isISO8601(),
], validation_1.validateRequest, recommendationController_1.RecommendationController.trackImplementation);
router.post('/feedback', [
    (0, express_validator_1.body)('recommendationId').notEmpty().isString(),
    (0, express_validator_1.body)('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('comments').optional().isString().isLength({ max: 500 }),
], validation_1.validateRequest, recommendationController_1.RecommendationController.submitFeedback);
router.post('/adherence', [
    (0, express_validator_1.body)('recommendationId').notEmpty().isString(),
    (0, express_validator_1.body)('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    (0, express_validator_1.body)('adherenceScore').isInt({ min: 0, max: 100 }),
], validation_1.validateRequest, recommendationController_1.RecommendationController.updateAdherence);
router.post('/outcome', [
    (0, express_validator_1.body)('recommendationId').notEmpty().isString(),
    (0, express_validator_1.body)('category').notEmpty().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
    (0, express_validator_1.body)('metric').notEmpty().isString(),
    (0, express_validator_1.body)('beforeValue').isNumeric(),
    (0, express_validator_1.body)('afterValue').isNumeric(),
], validation_1.validateRequest, recommendationController_1.RecommendationController.recordOutcome);
router.get('/effectiveness', [
    (0, express_validator_1.query)('category').optional().isIn(['nutrition', 'exercise', 'screening', 'lifestyle']),
], validation_1.validateRequest, recommendationController_1.RecommendationController.getEffectivenessData);
router.get('/stats', recommendationController_1.RecommendationController.getRecommendationStats);
router.get('/lifestyle-suggestions', recommendationController_1.RecommendationController.getLifestyleSuggestions);
router.get('/screening-schedule', recommendationController_1.RecommendationController.getScreeningSchedule);
exports.default = router;
//# sourceMappingURL=recommendations.js.map