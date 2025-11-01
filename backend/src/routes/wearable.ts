import { Router } from 'express';
import { WearableController } from '../controllers/wearableController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * 웨어러블 기기 인증 및 등록
 * POST /api/wearable/authenticate
 */
router.post('/authenticate', [
  body('deviceType')
    .isIn(['apple_health', 'google_fit', 'fitbit', 'samsung_health'])
    .withMessage('지원하지 않는 기기 타입입니다.'),
  body('deviceName')
    .isLength({ min: 1, max: 100 })
    .withMessage('기기 이름은 1-100자 사이여야 합니다.'),
  body('syncSettings.autoSync')
    .isBoolean()
    .withMessage('자동 동기화 설정은 boolean 값이어야 합니다.'),
  body('syncSettings.syncInterval')
    .isInt({ min: 5, max: 1440 })
    .withMessage('동기화 간격은 5분-24시간 사이여야 합니다.'),
  body('syncSettings.dataTypes')
    .isArray({ min: 1 })
    .withMessage('최소 하나의 데이터 타입을 선택해야 합니다.'),
  validateRequest,
], WearableController.authenticateDevice);

/**
 * 웨어러블 데이터 동기화
 * POST /api/wearable/sync
 */
router.post('/sync', [
  body('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  body('dataTypes')
    .optional()
    .isArray()
    .withMessage('데이터 타입은 배열이어야 합니다.'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
  body('forceSync')
    .optional()
    .isBoolean()
    .withMessage('강제 동기화는 boolean 값이어야 합니다.'),
  validateRequest,
], WearableController.syncWearableData);

/**
 * 사용자의 웨어러블 기기 목록 조회
 * GET /api/wearable/devices
 */
router.get('/devices', WearableController.getUserDevices);

/**
 * 웨어러블 기기 설정 업데이트
 * PUT /api/wearable/devices/:deviceConfigId
 */
router.put('/devices/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  body('deviceName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('기기 이름은 1-100자 사이여야 합니다.'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('활성 상태는 boolean 값이어야 합니다.'),
  body('syncSettings')
    .optional()
    .isObject()
    .withMessage('동기화 설정은 객체여야 합니다.'),
  body('syncSettings.autoSync')
    .optional()
    .isBoolean()
    .withMessage('자동 동기화 설정은 boolean 값이어야 합니다.'),
  body('syncSettings.syncInterval')
    .optional()
    .isInt({ min: 5, max: 1440 })
    .withMessage('동기화 간격은 5분-24시간 사이여야 합니다.'),
  body('syncSettings.dataTypes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('최소 하나의 데이터 타입을 선택해야 합니다.'),
  validateRequest,
], WearableController.updateDeviceConfig);

/**
 * 웨어러블 기기 연동 해제
 * DELETE /api/wearable/devices/:deviceConfigId
 */
router.delete('/devices/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  validateRequest,
], WearableController.disconnectDevice);

/**
 * 동기화 상태 조회
 * GET /api/wearable/sync-status
 */
router.get('/sync-status', WearableController.getSyncStatus);

/**
 * 특정 기기의 데이터 조회
 * GET /api/wearable/devices/:deviceConfigId/data
 */
router.get('/devices/:deviceConfigId/data', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  query('dataType')
    .optional()
    .isIn([
      'heart_rate', 'steps', 'calories', 'sleep', 'weight',
      'blood_pressure', 'blood_oxygen', 'body_temperature',
      'exercise_sessions', 'distance', 'floors_climbed'
    ])
    .withMessage('지원하지 않는 데이터 타입입니다.'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('제한 수는 1-1000 사이여야 합니다.'),
  validateRequest,
], WearableController.getDeviceData);

/**
 * 자동 동기화 설정
 * PUT /api/wearable/devices/:deviceConfigId/auto-sync
 */
router.put('/devices/:deviceConfigId/auto-sync', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  body('autoSync')
    .isBoolean()
    .withMessage('자동 동기화 설정은 boolean 값이어야 합니다.'),
  body('syncInterval')
    .optional()
    .isInt({ min: 5, max: 1440 })
    .withMessage('동기화 간격은 5분-24시간 사이여야 합니다.'),
  body('dataTypes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('최소 하나의 데이터 타입을 선택해야 합니다.'),
  validateRequest,
], WearableController.configureAutoSync);

/**
 * 수동 동기화 트리거
 * POST /api/wearable/devices/:deviceConfigId/sync
 */
router.post('/devices/:deviceConfigId/sync', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  body('dataTypes')
    .optional()
    .isArray()
    .withMessage('데이터 타입은 배열이어야 합니다.'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
  validateRequest,
], WearableController.triggerManualSync);

/**
 * 지원되는 데이터 타입 목록 조회
 * GET /api/wearable/supported-data-types
 */
router.get('/supported-data-types', [
  query('deviceType')
    .optional()
    .isIn(['apple_health', 'google_fit', 'fitbit', 'samsung_health'])
    .withMessage('지원하지 않는 기기 타입입니다.'),
  validateRequest,
], WearableController.getSupportedDataTypes);

export default router;