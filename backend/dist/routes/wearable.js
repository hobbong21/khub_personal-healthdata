"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wearableController_1 = require("../controllers/wearableController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/authenticate', [
    (0, express_validator_1.body)('deviceType')
        .isIn(['apple_health', 'google_fit', 'fitbit', 'samsung_health'])
        .withMessage('지원하지 않는 기기 타입입니다.'),
    (0, express_validator_1.body)('deviceName')
        .isLength({ min: 1, max: 100 })
        .withMessage('기기 이름은 1-100자 사이여야 합니다.'),
    (0, express_validator_1.body)('syncSettings.autoSync')
        .isBoolean()
        .withMessage('자동 동기화 설정은 boolean 값이어야 합니다.'),
    (0, express_validator_1.body)('syncSettings.syncInterval')
        .isInt({ min: 5, max: 1440 })
        .withMessage('동기화 간격은 5분-24시간 사이여야 합니다.'),
    (0, express_validator_1.body)('syncSettings.dataTypes')
        .isArray({ min: 1 })
        .withMessage('최소 하나의 데이터 타입을 선택해야 합니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.authenticateDevice);
router.post('/sync', [
    (0, express_validator_1.body)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    (0, express_validator_1.body)('dataTypes')
        .optional()
        .isArray()
        .withMessage('데이터 타입은 배열이어야 합니다.'),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601()
        .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
    (0, express_validator_1.body)('forceSync')
        .optional()
        .isBoolean()
        .withMessage('강제 동기화는 boolean 값이어야 합니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.syncWearableData);
router.get('/devices', wearableController_1.WearableController.getUserDevices);
router.put('/devices/:deviceConfigId', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    (0, express_validator_1.body)('deviceName')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('기기 이름은 1-100자 사이여야 합니다.'),
    (0, express_validator_1.body)('isActive')
        .optional()
        .isBoolean()
        .withMessage('활성 상태는 boolean 값이어야 합니다.'),
    (0, express_validator_1.body)('syncSettings')
        .optional()
        .isObject()
        .withMessage('동기화 설정은 객체여야 합니다.'),
    (0, express_validator_1.body)('syncSettings.autoSync')
        .optional()
        .isBoolean()
        .withMessage('자동 동기화 설정은 boolean 값이어야 합니다.'),
    (0, express_validator_1.body)('syncSettings.syncInterval')
        .optional()
        .isInt({ min: 5, max: 1440 })
        .withMessage('동기화 간격은 5분-24시간 사이여야 합니다.'),
    (0, express_validator_1.body)('syncSettings.dataTypes')
        .optional()
        .isArray({ min: 1 })
        .withMessage('최소 하나의 데이터 타입을 선택해야 합니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.updateDeviceConfig);
router.delete('/devices/:deviceConfigId', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.disconnectDevice);
router.get('/sync-status', wearableController_1.WearableController.getSyncStatus);
router.get('/devices/:deviceConfigId/data', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    (0, express_validator_1.query)('dataType')
        .optional()
        .isIn([
        'heart_rate', 'steps', 'calories', 'sleep', 'weight',
        'blood_pressure', 'blood_oxygen', 'body_temperature',
        'exercise_sessions', 'distance', 'floors_climbed'
    ])
        .withMessage('지원하지 않는 데이터 타입입니다.'),
    (0, express_validator_1.query)('startDate')
        .optional()
        .isISO8601()
        .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
    (0, express_validator_1.query)('endDate')
        .optional()
        .isISO8601()
        .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('제한 수는 1-1000 사이여야 합니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.getDeviceData);
router.put('/devices/:deviceConfigId/auto-sync', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    (0, express_validator_1.body)('autoSync')
        .isBoolean()
        .withMessage('자동 동기화 설정은 boolean 값이어야 합니다.'),
    (0, express_validator_1.body)('syncInterval')
        .optional()
        .isInt({ min: 5, max: 1440 })
        .withMessage('동기화 간격은 5분-24시간 사이여야 합니다.'),
    (0, express_validator_1.body)('dataTypes')
        .optional()
        .isArray({ min: 1 })
        .withMessage('최소 하나의 데이터 타입을 선택해야 합니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.configureAutoSync);
router.post('/devices/:deviceConfigId/sync', [
    (0, express_validator_1.param)('deviceConfigId')
        .isUUID()
        .withMessage('유효한 기기 설정 ID가 필요합니다.'),
    (0, express_validator_1.body)('dataTypes')
        .optional()
        .isArray()
        .withMessage('데이터 타입은 배열이어야 합니다.'),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601()
        .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.triggerManualSync);
router.get('/supported-data-types', [
    (0, express_validator_1.query)('deviceType')
        .optional()
        .isIn(['apple_health', 'google_fit', 'fitbit', 'samsung_health'])
        .withMessage('지원하지 않는 기기 타입입니다.'),
    validation_1.validateRequest,
], wearableController_1.WearableController.getSupportedDataTypes);
exports.default = router;
//# sourceMappingURL=wearable.js.map