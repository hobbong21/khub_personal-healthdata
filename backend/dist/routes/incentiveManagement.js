"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const incentiveManagementController_1 = require("../controllers/incentiveManagementController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/user', incentiveManagementController_1.getIncentiveDashboard);
router.get('/history', [
    (0, express_validator_1.query)('startDate').optional().isISO8601().toDate(),
    (0, express_validator_1.query)('endDate').optional().isISO8601().toDate()
], validation_1.validateRequest, incentiveManagementController_1.getContributionHistory);
router.post('/redeem', [(0, express_validator_1.body)('rewardId').notEmpty().withMessage('Reward ID is required'), (0, express_validator_1.body)('points').isInt({ min: 1 }).withMessage('Points must be a positive integer')], validation_1.validateRequest, incentiveManagementController_1.redeemReward);
exports.default = router;
//# sourceMappingURL=incentiveManagement.js.map