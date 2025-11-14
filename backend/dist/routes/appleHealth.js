"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appleHealthController_1 = require("../controllers/appleHealthController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/data', [
    (0, express_validator_1.body)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    (0, express_validator_1.body)('healthKitData')
        .isArray({ min: 1 })
        .withMessage('HealthKit 데이터 배열이 필요합니다.'),
    (0, express_validator_1.body)('healthKitData.*.type')
        .notEmpty()
        .withMessage('HealthKit 데이터 타입이 필요합니다.'),
    (0, express_validator_1.body)('healthKitData.*.value')
        .isNumeric()
        .withMessage('데이터 값은 숫자여야 합니다.'),
    (0, express_validator_1.body)('healthKitData.*.unit')
        .notEmpty()
        .withMessage('데이터 단위가 필요합니다.'),
    (0, express_validator_1.body)('healthKitData.*.startDate')
        .isISO8601()
        .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
    (0, express_validator_1.body)('healthKitData.*.endDate')
        .isISO8601()
        .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
    (0, express_validator_1.body)('healthKitData.*.sourceName')
        .notEmpty()
        .withMessage('데이터 소스 이름이 필요합니다.'),
    validation_1.validateRequest,
], appleHealthController_1.AppleHealthController.receiveHealthKitData);
router.get('/permissions/:deviceConfigId', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    validation_1.validateRequest,
], appleHealthController_1.AppleHealthController.checkPermissions);
router.get('/sync-status/:deviceConfigId', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    validation_1.validateRequest,
], appleHealthController_1.AppleHealthController.getRealTimeSyncStatus);
router.post('/process-pending/:deviceConfigId', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    validation_1.validateRequest,
], appleHealthController_1.AppleHealthController.processPendingData);
router.get('/latest/:deviceConfigId', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    (0, express_validator_1.query)('dataTypes')
        .optional()
        .custom((value) => {
        if (typeof value === 'string') {
            const types = value.split(',');
            const validTypes = [
                'heart_rate', 'steps', 'calories', 'sleep', 'weight',
                'blood_pressure', 'blood_oxygen', 'body_temperature',
                'exercise_sessions', 'distance', 'floors_climbed'
            ];
            return types.every(type => validTypes.includes(type.trim()));
        }
        return true;
    })
        .withMessage('유효하지 않은 데이터 타입이 포함되어 있습니다.'),
    validation_1.validateRequest,
], appleHealthController_1.AppleHealthController.getLatestData);
router.post('/validate', [
    (0, express_validator_1.body)('healthKitData')
        .isArray({ min: 1 })
        .withMessage('HealthKit 데이터 배열이 필요합니다.'),
    validation_1.validateRequest,
], appleHealthController_1.AppleHealthController.validateHealthKitData);
router.get('/supported-types', appleHealthController_1.AppleHealthController.getSupportedTypes);
exports.default = router;
//# sourceMappingURL=appleHealth.js.map