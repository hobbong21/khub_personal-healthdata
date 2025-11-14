"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dataAnonymizationController_1 = require("../controllers/dataAnonymizationController");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/anonymize', [
    (0, express_validator_1.body)('dataTypes')
        .isArray({ min: 1 })
        .withMessage('최소 하나의 데이터 타입을 선택해주세요'),
    (0, express_validator_1.body)('dataTypes.*')
        .isIn([
        'vital_signs',
        'health_records',
        'medical_records',
        'medications',
        'test_results',
        'genomic_data',
        'family_history'
    ])
        .withMessage('유효한 데이터 타입을 선택해주세요'),
    (0, express_validator_1.body)('purpose')
        .notEmpty()
        .withMessage('익명화 목적은 필수입니다'),
    (0, express_validator_1.body)('anonymizationMethod')
        .optional()
        .isIn(['k_anonymity', 'l_diversity', 't_closeness', 'differential_privacy', 'basic'])
        .withMessage('유효한 익명화 방법을 선택해주세요'),
], validation_1.validateRequest, dataAnonymizationController_1.requestDataAnonymization);
router.get('/logs', [
    (0, express_validator_1.query)('purpose')
        .optional()
        .isString()
        .withMessage('목적은 문자열이어야 합니다'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('제한 수는 1-100 사이의 정수여야 합니다'),
], validation_1.validateRequest, dataAnonymizationController_1.getAnonymizationHistory);
router.get('/stats', dataAnonymizationController_1.getAnonymizationStats);
exports.default = router;
//# sourceMappingURL=dataAnonymization.js.map