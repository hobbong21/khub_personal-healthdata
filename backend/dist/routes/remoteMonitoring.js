"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const remoteMonitoringController_1 = require("../controllers/remoteMonitoringController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/sessions', [
    (0, express_validator_1.body)('sessionType').isIn(['continuous', 'scheduled', 'emergency']).withMessage('Invalid session type'),
    (0, express_validator_1.body)('notes').optional().isString(),
], validation_1.validateRequest, remoteMonitoringController_1.createMonitoringSession);
router.post('/sessions/:sessionId/data', [
    (0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required'),
    (0, express_validator_1.body)('dataType').notEmpty().withMessage('dataType is required'),
    (0, express_validator_1.body)('value').notEmpty().withMessage('value is required'),
    (0, express_validator_1.body)('recordedAt').isISO8601().withMessage('recordedAt is required and must be an ISO8601 date'),
], validation_1.validateRequest, remoteMonitoringController_1.addRealTimeHealthData);
router.get('/sessions/:sessionId/data', [
    (0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required'),
    (0, express_validator_1.query)('type').optional().isString(),
    (0, express_validator_1.query)('limit').optional().isInt(),
    (0, express_validator_1.query)('since').optional().isISO8601(),
], validation_1.validateRequest, remoteMonitoringController_1.getHealthDataForSession);
router.get('/sessions/:sessionId/alerts', [(0, express_validator_1.param)('sessionId').notEmpty().withMessage('Session ID is required')], validation_1.validateRequest, remoteMonitoringController_1.getActiveAlerts);
router.post('/alerts/:alertId/acknowledge', [(0, express_validator_1.param)('alertId').notEmpty().withMessage('Alert ID is required')], validation_1.validateRequest, remoteMonitoringController_1.acknowledgeAlert);
router.post('/share', [
    (0, express_validator_1.body)('providerId').notEmpty().withMessage('Healthcare provider ID is required'),
    (0, express_validator_1.body)('dataTypes').isArray({ min: 1 }).withMessage('At least one data type must be selected'),
    (0, express_validator_1.body)('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
], validation_1.validateRequest, remoteMonitoringController_1.shareDataWithHealthcareProvider);
exports.default = router;
//# sourceMappingURL=remoteMonitoring.js.map