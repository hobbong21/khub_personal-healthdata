import express from 'express';
import { TelehealthController } from '../controllers/telehealthController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * 지원되는 텔레헬스 플랫폼 목록 조회
 */
router.get('/platforms', TelehealthController.getSupportedPlatforms);

/**
 * 텔레헬스 플랫폼 연동 생성 (요구사항 17.5)
 */
router.post(
  '/integrations',
  [
    body('platformName')
      .notEmpty()
      .withMessage('플랫폼 이름은 필수입니다'),
    body('platformUserId')
      .optional()
      .isString()
      .withMessage('플랫폼 사용자 ID는 문자열이어야 합니다'),
    body('integrationSettings')
      .optional()
      .isObject()
      .withMessage('연동 설정은 객체 형태여야 합니다'),
  ],
  validateRequest,
  TelehealthController.createIntegration
);

/**
 * 사용자의 텔레헬스 연동 목록 조회 (요구사항 17.5)
 */
router.get('/integrations', TelehealthController.getUserIntegrations);

/**
 * 텔레헬스 연동 비활성화 (요구사항 17.5)
 */
router.patch(
  '/integrations/:integrationId/deactivate',
  [
    param('integrationId')
      .isUUID()
      .withMessage('유효한 연동 ID를 제공해주세요'),
  ],
  validateRequest,
  TelehealthController.deactivateIntegration
);

/**
 * 텔레헬스 세션 생성 (요구사항 17.5)
 */
router.post(
  '/sessions',
  [
    body('healthcareProviderName')
      .notEmpty()
      .withMessage('의료진 이름은 필수입니다'),
    body('sessionType')
      .isIn(['consultation', 'follow_up', 'emergency'])
      .withMessage('유효한 세션 타입을 선택해주세요'),
    body('scheduledTime')
      .isISO8601()
      .withMessage('예약 시간은 유효한 날짜 형식이어야 합니다'),
    body('telehealthIntegrationId')
      .optional()
      .isUUID()
      .withMessage('유효한 연동 ID를 제공해주세요'),
  ],
  validateRequest,
  TelehealthController.createSession
);

/**
 * 사용자의 텔레헬스 세션 목록 조회 (요구사항 17.5)
 */
router.get(
  '/sessions',
  [
    query('status')
      .optional()
      .isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'])
      .withMessage('유효한 세션 상태를 선택해주세요'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('제한 수는 1-100 사이의 정수여야 합니다'),
  ],
  validateRequest,
  TelehealthController.getUserSessions
);

/**
 * 예정된 세션 조회 (요구사항 17.5)
 */
router.get('/sessions/upcoming', TelehealthController.getUpcomingSessions);

/**
 * 텔레헬스 세션 시작 (요구사항 17.5)
 */
router.patch(
  '/sessions/:sessionId/start',
  [
    param('sessionId')
      .isUUID()
      .withMessage('유효한 세션 ID를 제공해주세요'),
  ],
  validateRequest,
  TelehealthController.startSession
);

/**
 * 텔레헬스 세션 종료 (요구사항 17.5)
 */
router.patch(
  '/sessions/:sessionId/end',
  [
    param('sessionId')
      .isUUID()
      .withMessage('유효한 세션 ID를 제공해주세요'),
    body('sessionNotes')
      .optional()
      .isString()
      .withMessage('세션 메모는 문자열이어야 합니다'),
  ],
  validateRequest,
  TelehealthController.endSession
);

/**
 * 텔레헬스 세션 취소 (요구사항 17.5)
 */
router.patch(
  '/sessions/:sessionId/cancel',
  [
    param('sessionId')
      .isUUID()
      .withMessage('유효한 세션 ID를 제공해주세요'),
  ],
  validateRequest,
  TelehealthController.cancelSession
);

/**
 * 텔레헬스 통계 조회 (요구사항 17.5)
 */
router.get('/stats', TelehealthController.getTelehealthStats);

export default router;