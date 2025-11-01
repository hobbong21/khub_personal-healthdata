import { Router } from 'express';
import { AppleHealthController } from '../controllers/appleHealthController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * iOS 앱에서 HealthKit 데이터 수신
 * POST /api/apple-health/data
 */
router.post('/data', [
  body('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  body('healthKitData')
    .isArray({ min: 1 })
    .withMessage('HealthKit 데이터 배열이 필요합니다.'),
  body('healthKitData.*.type')
    .notEmpty()
    .withMessage('HealthKit 데이터 타입이 필요합니다.'),
  body('healthKitData.*.value')
    .isNumeric()
    .withMessage('데이터 값은 숫자여야 합니다.'),
  body('healthKitData.*.unit')
    .notEmpty()
    .withMessage('데이터 단위가 필요합니다.'),
  body('healthKitData.*.startDate')
    .isISO8601()
    .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
  body('healthKitData.*.endDate')
    .isISO8601()
    .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
  body('healthKitData.*.sourceName')
    .notEmpty()
    .withMessage('데이터 소스 이름이 필요합니다.'),
  validateRequest,
], AppleHealthController.receiveHealthKitData);

/**
 * HealthKit 권한 상태 확인
 * GET /api/apple-health/permissions/:deviceConfigId
 */
router.get('/permissions/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  validateRequest,
], AppleHealthController.checkPermissions);

/**
 * 실시간 동기화 상태 조회
 * GET /api/apple-health/sync-status/:deviceConfigId
 */
router.get('/sync-status/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  validateRequest,
], AppleHealthController.getRealTimeSyncStatus);

/**
 * 대기 중인 HealthKit 데이터 배치 처리
 * POST /api/apple-health/process-pending/:deviceConfigId
 */
router.post('/process-pending/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  validateRequest,
], AppleHealthController.processPendingData);

/**
 * 최신 HealthKit 데이터 조회
 * GET /api/apple-health/latest/:deviceConfigId
 */
router.get('/latest/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  query('dataTypes')
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
  validateRequest,
], AppleHealthController.getLatestData);

/**
 * HealthKit 데이터 유효성 검증 (테스트용)
 * POST /api/apple-health/validate
 */
router.post('/validate', [
  body('healthKitData')
    .isArray({ min: 1 })
    .withMessage('HealthKit 데이터 배열이 필요합니다.'),
  validateRequest,
], AppleHealthController.validateHealthKitData);

/**
 * HealthKit 지원 데이터 타입 목록
 * GET /api/apple-health/supported-types
 */
router.get('/supported-types', AppleHealthController.getSupportedTypes);

export default router;