"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const researchParticipationController_1 = require("../controllers/researchParticipationController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/studies', researchParticipationController_1.getMatchedResearch);
router.post('/apply', [
    (0, express_validator_1.body)('researchId').notEmpty().withMessage('Research ID is required'),
    (0, express_validator_1.body)('consentGiven').isBoolean().withMessage('Consent must be a boolean')
], validation_1.validateRequest, researchParticipationController_1.applyForResearch);
router.get('/history', [
    (0, express_validator_1.query)('status').optional().isString().withMessage('Status must be a string')
], validation_1.validateRequest, researchParticipationController_1.getResearchParticipationHistory);
router.get('/feedback/:participationId', [
    (0, express_validator_1.param)('participationId').notEmpty().withMessage('Participation ID is required')
], validation_1.validateRequest, researchParticipationController_1.getResearchFeedback);
exports.default = router;
//# sourceMappingURL=researchParticipation.js.map