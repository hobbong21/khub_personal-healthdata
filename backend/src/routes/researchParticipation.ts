import express from 'express';
import { ResearchParticipationController } from '../controllers/researchParticipationController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * 연구 프로젝트 매칭 (요구사항 16.2)
 */
router.get('/projects/matched', ResearchParticipationController.getMatchedResearchProjects);

/**
 * 연구 참여 신청 (요구사항 16.3)
 */
router.post(
  '/apply',
  [
    body('researchProjectId')
      .notEmpty()
      .withMessage('연구 프로젝트 ID는 필수입니다'),
    body('consentGiven')
      .isBoolean()
      .withMessage('동의 여부는 불린 값이어야 합니다'),
  ],
  validateRequest,
  ResearchParticipationController.applyForResearch
);

/**
 * 사용자의 연구 참여 현황 조회 (요구사항 16.5)
 */
router.get(
  '/participations',
  [
    query('status')
      .optional()
      .isIn(['pending', 'active', 'completed', 'withdrawn'])
      .withMessage('유효한 참여 상태를 선택해주세요'),
  ],
  validateRequest,
  ResearchParticipationController.getUserParticipations
);

/**
 * 연구 결과 피드백 조회 (요구사항 16.5)
 */
router.get(
  '/participations/:participationId/feedback',
  [
    param('participationId')
      .isUUID()
      .withMessage('유효한 참여 ID를 제공해주세요'),
  ],
  validateRequest,
  ResearchParticipationController.getResearchFeedback
);

/**
 * 연구 참여 철회
 */
router.patch(
  '/participations/:participationId/withdraw',
  [
    param('participationId')
      .isUUID()
      .withMessage('유효한 참여 ID를 제공해주세요'),
    body('reason')
      .optional()
      .isString()
      .withMessage('철회 사유는 문자열이어야 합니다'),
  ],
  validateRequest,
  ResearchParticipationController.withdrawFromResearch
);

/**
 * 사용자 인센티브 현황 조회 (요구사항 16.4)
 */
router.get('/incentives', ResearchParticipationController.getUserIncentives);

/**
 * 인센티브 포인트 사용 (요구사항 16.4)
 */
router.post(
  '/incentives/redeem',
  [
    body('points')
      .isInt({ min: 1 })
      .withMessage('사용할 포인트는 1 이상의 정수여야 합니다'),
    body('redeemType')
      .notEmpty()
      .withMessage('사용 유형은 필수입니다'),
    body('description')
      .notEmpty()
      .withMessage('사용 내역 설명은 필수입니다'),
  ],
  validateRequest,
  ResearchParticipationController.redeemIncentivePoints
);

/**
 * 인센티브 사용 가능 항목 조회
 */
router.get('/incentives/items', ResearchParticipationController.getRedeemableItems);

/**
 * 연구 참여 동의서 생성
 */
router.get(
  '/projects/:researchProjectId/consent',
  [
    param('researchProjectId')
      .notEmpty()
      .withMessage('연구 프로젝트 ID는 필수입니다'),
  ],
  validateRequest,
  ResearchParticipationController.generateConsentForm
);

// 관리자/연구진 전용 라우트

/**
 * 인센티브 포인트 지급 (관리자/연구진용)
 */
router.post(
  '/admin/incentives/award',
  [
    body('userId')
      .isUUID()
      .withMessage('유효한 사용자 ID를 제공해주세요'),
    body('incentiveType')
      .notEmpty()
      .withMessage('인센티브 유형은 필수입니다'),
    body('points')
      .isInt({ min: 1 })
      .withMessage('포인트는 1 이상의 정수여야 합니다'),
    body('description')
      .notEmpty()
      .withMessage('설명은 필수입니다'),
    body('referenceId')
      .optional()
      .isString()
      .withMessage('참조 ID는 문자열이어야 합니다'),
  ],
  validateRequest,
  ResearchParticipationController.awardIncentivePoints
);

/**
 * 연구 참여 승인/거부 (연구진용)
 */
router.patch(
  '/admin/participations/:participationId/status',
  [
    param('participationId')
      .isUUID()
      .withMessage('유효한 참여 ID를 제공해주세요'),
    body('status')
      .isIn(['active', 'completed', 'withdrawn'])
      .withMessage('유효한 상태를 선택해주세요'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다'),
  ],
  validateRequest,
  ResearchParticipationController.updateParticipationStatus
);

/**
 * 연구 참여 통계 조회 (관리자용)
 */
router.get('/admin/stats', ResearchParticipationController.getResearchStats);

export default router;