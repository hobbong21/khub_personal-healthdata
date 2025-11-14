"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const telehealthController_1 = require("../controllers/telehealthController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/sessions', [
    (0, express_validator_1.body)('dateTime').isISO8601().withMessage('Valid session date and time are required'),
    (0, express_validator_1.body)('providerId').notEmpty().withMessage('Healthcare provider ID is required'),
], validation_1.validateRequest, telehealthController_1.scheduleTelehealthSession);
router.get('/sessions', telehealthController_1.getTelehealthSessions);
router.get('/sessions/:sessionId', [(0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required')], validation_1.validateRequest, telehealthController_1.getTelehealthSessionDetails);
router.post('/sessions/:sessionId/cancel', [(0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required')], validation_1.validateRequest, telehealthController_1.cancelTelehealthSession);
router.post('/sessions/:sessionId/connect', [(0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required')], validation_1.validateRequest, telehealthController_1.connectToTelehealthSession);
exports.default = router;
//# sourceMappingURL=telehealth.js.map