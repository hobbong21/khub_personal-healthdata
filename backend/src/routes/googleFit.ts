import { Router } from 'express';
import { GoogleFitController } from '../controllers/googleFitController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param, query } from 'express-validator';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * Google Fit OAuth 인증 URL 생성
 * GET /api/google-fit/auth-url
 */
router.get('/auth-url', [
  query('redirectUri')
    .isURL()
    .withMessage('유효한 리다이렉트 URI가 필요합니다.'),
  validateRequest,
], GoogleFitController.getAuthUrl);

/**
 * Google Fit OAuth 인증 코드를 토큰으로 교환
 * POST /api/google-fit/exchange-token
 */
router.post('/exchange-token', [
  body('authCode')
    .notEmpty()
    .withMessage('인증 코드가 필요합니다.'),
  body('redirectUri')
    .isURL()
    .withMessage('유효한 리다이렉트 URI가 필요합니다.'),
  validateRequest,
], GoogleFitController.exchangeAuthCode);

/**
 * Google Fit 액세스 토큰 갱신
 * POST /api/google-fit/refresh-token
 */
router.post('/refresh-token', [
  body('refreshToken')
    .notEmpty()
    .withMessage('리프레시 토큰이 필요합니다.'),
  validateRequest,
], GoogleFitController.refreshToken);

/**
 * Google Fit 데이터 동기화
 * POST /api/google-fit/sync/:deviceConfigId
 */
router.post('/sync/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  body('dataTypes')
    .optional()
    .isArray()
    .withMessage('데이터 타입은 배열이어야 합니다.'),
  body('dataTypes.*')
    .optional()
    .isIn([
      'heart_rate', 'steps', 'calories', 'sleep', 'weight',
      'blood_pressure', 'blood_oxygen', 'body_temperature',
      'exercise_sessions', 'distance', 'floors_climbed'
    ])
    .withMessage('지원하지 않는 데이터 타입입니다.'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
  validateRequest,
], GoogleFitController.syncData);

/**
 * Google Fit 특정 데이터 타입 조회
 * GET /api/google-fit/data/:deviceConfigId/:dataType
 */
router.get('/data/:deviceConfigId/:dataType', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  param('dataType')
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
  validateRequest,
], GoogleFitController.fetchDataType);

/**
 * Google Fit 집계 데이터 조회
 * GET /api/google-fit/aggregate/:deviceConfigId/:dataType
 */
router.get('/aggregate/:deviceConfigId/:dataType', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  param('dataType')
    .isIn([
      'heart_rate', 'steps', 'calories', 'sleep', 'weight',
      'blood_pressure', 'blood_oxygen', 'body_temperature',
      'exercise_sessions', 'distance', 'floors_climbed'
    ])
    .withMessage('지원하지 않는 데이터 타입입니다.'),
  query('aggregateBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('집계 기준은 day, week, month 중 하나여야 합니다.'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('시작 날짜는 ISO8601 형식이어야 합니다.'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('종료 날짜는 ISO8601 형식이어야 합니다.'),
  validateRequest,
], GoogleFitController.getAggregatedData);

/**
 * Google Fit 연결 상태 확인
 * GET /api/google-fit/connection-status/:deviceConfigId
 */
router.get('/connection-status/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  validateRequest,
], GoogleFitController.checkConnectionStatus);

/**
 * Google Fit 지원 데이터 타입 목록
 * GET /api/google-fit/supported-types
 */
router.get('/supported-types', GoogleFitController.getSupportedDataTypes);

/**
 * Google Fit 데이터 소스 목록 조회
 * GET /api/google-fit/data-sources/:deviceConfigId
 */
router.get('/data-sources/:deviceConfigId', [
  param('deviceConfigId')
    .isUUID()
    .withMessage('유효한 기기 설정 ID가 필요합니다.'),
  validateRequest,
], GoogleFitController.getDataSources);

export default router;