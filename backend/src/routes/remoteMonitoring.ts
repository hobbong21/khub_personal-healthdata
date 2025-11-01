import express from 'express';
import { RemoteMonitoringController } from '../controllers/remoteMonitoringController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * 원격 모니터링 세션 시작 (요구사항 17.4)
 */
router.post(
  '/sessions',
  [
    body('sessionType')
      .isIn(['continuous', 'scheduled', 'emergency'])
      .withMessage('유효한 세션 타입을 선택해주세요'),
    body('monitoringParameters')
      .optional()
      .isObject()
      .withMessage('모니터링 파라미터는 객체 형태여야 합니다'),
    body('alertThresholds')
      .optional()
      .isObject()
      .withMessage('알림 임계값은 객체 형태여야 합니다'),
    body('notes')
      .optional()
      .isString()
      .withMessage('메모는 문자열이어야 합니다'),
  ],
  validateRequest,
  RemoteMonitoringController.startMonitoringSession
);

/**
 * 실시간 건강 데이터 추가 (요구사항 17.4)
 */
router.post(
  '/data',
  [
    body('dataType')
      .notEmpty()
      .withMessage('데이터 타입은 필수입니다'),
    body('value')
      .notEmpty()
      .withMessage('데이터 값은 필수입니다'),
    body('unit')
      .optional()
      .isString()
      .withMessage('단위는 문자열이어야 합니다'),
    body('deviceSource')
      .optional()
      .isString()
      .withMessage('기기 소스는 문자열이어야 합니다'),
    body('recordedAt')
      .optional()
      .isISO8601()
      .withMessage('기록 시간은 유효한 날짜 형식이어야 합니다'),
  ],
  validateRequest,
  RemoteMonitoringController.addRealTimeData
);

/**
 * 모니터링 대시보드 데이터 조회 (요구사항 17.4)
 */
router.get('/dashboard', RemoteMonitoringController.getDashboardData);

/**
 * 실시간 건강 데이터 조회 (요구사항 17.4)
 */
router.get(
  '/data',
  [
    query('dataType')
      .optional()
      .isString()
      .withMessage('데이터 타입은 문자열이어야 합니다'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('제한 수는 1-1000 사이의 정수여야 합니다'),
  ],
  validateRequest,
  RemoteMonitoringController.getRealTimeData
);

/**
 * 건강 알림 조회 (요구사항 17.4)
 */
router.get('/alerts', RemoteMonitoringController.getHealthAlerts);

/**
 * 알림 확인 처리 (요구사항 17.4)
 */
router.patch(
  '/alerts/:alertId/acknowledge',
  [
    param('alertId')
      .isUUID()
      .withMessage('유효한 알림 ID를 제공해주세요'),
  ],
  validateRequest,
  RemoteMonitoringController.acknowledgeAlert
);

/**
 * 의료진과 데이터 공유 설정 (요구사항 17.4)
 */
router.post(
  '/data-shares',
  [
    body('healthcareProviderEmail')
      .isEmail()
      .withMessage('유효한 의료진 이메일을 입력해주세요'),
    body('healthcareProviderName')
      .optional()
      .isString()
      .withMessage('의료진 이름은 문자열이어야 합니다'),
    body('sharedDataTypes')
      .isArray()
      .withMessage('공유할 데이터 타입은 배열이어야 합니다'),
    body('accessLevel')
      .isIn(['read_only', 'read_write'])
      .withMessage('유효한 접근 권한을 선택해주세요'),
    body('startDate')
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다'),
  ],
  validateRequest,
  RemoteMonitoringController.createDataShare
);

/**
 * 모니터링 세션 종료 (요구사항 17.4)
 */
router.patch(
  '/sessions/:sessionId/end',
  [
    param('sessionId')
      .isUUID()
      .withMessage('유효한 세션 ID를 제공해주세요'),
  ],
  validateRequest,
  RemoteMonitoringController.endMonitoringSession
);

/**
 * 이상 징후 감지 (요구사항 17.4)
 */
router.post(
  '/anomaly-detection',
  [
    query('dataType')
      .optional()
      .isString()
      .withMessage('데이터 타입은 문자열이어야 합니다'),
    query('timeRange')
      .optional()
      .isString()
      .withMessage('시간 범위는 문자열이어야 합니다'),
  ],
  validateRequest,
  RemoteMonitoringController.detectAnomalies
);

export default router;