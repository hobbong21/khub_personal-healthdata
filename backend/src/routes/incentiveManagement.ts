import express from 'express';
import { IncentiveManagementController } from '../controllers/incentiveManagementController';
import { authenticateToken } from '../middleware/auth';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * 사용자 인센티브 대시보드 (요구사항 16.4)
 */
router.get('/dashboard', IncentiveManagementController.getUserIncentiveDashboard);

/**
 * 데이터 기여도 계산 (요구사항 16.4)
 */
router.get(
  '/contribution',
  [
    query('dataType')
      .notEmpty()
      .withMessage('데이터 타입은 필수입니다'),
    query('startDate')
      .isISO8601()
      .withMessage('시작 날짜는 유효한 날짜 형식이어야 합니다'),
    query('endDate')
      .isISO8601()
      .withMessage('종료 날짜는 유효한 날짜 형식이어야 합니다'),
  ],
  validateRequest,
  IncentiveManagementController.calculateDataContribution
);

/**
 * 인센티브 규칙 처리 (요구사항 16.4)
 */
router.post('/process', IncentiveManagementController.processUserIncentives);

/**
 * 데이터 품질 분석
 */
router.get(
  '/quality-analysis',
  [
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('유효한 기간을 선택해주세요 (daily, weekly, monthly)'),
  ],
  validateRequest,
  IncentiveManagementController.analyzeDataQuality
);

/**
 * 인센티브 예측
 */
router.get(
  '/prediction',
  [
    query('targetPeriod')
      .optional()
      .isIn(['week', 'month'])
      .withMessage('유효한 예측 기간을 선택해주세요 (week, month)'),
  ],
  validateRequest,
  IncentiveManagementController.predictIncentives
);

/**
 * 리더보드 조회
 */
router.get(
  '/leaderboard',
  [
    query('period')
      .optional()
      .isIn(['weekly', 'monthly', 'all-time'])
      .withMessage('유효한 기간을 선택해주세요 (weekly, monthly, all-time)'),
    query('category')
      .optional()
      .isIn(['overall', 'data_quality', 'activity', 'research'])
      .withMessage('유효한 카테고리를 선택해주세요'),
  ],
  validateRequest,
  IncentiveManagementController.getLeaderboard
);

/**
 * 인센티브 규칙 조회
 */
router.get('/rules', IncentiveManagementController.getIncentiveRules);

// 관리자 전용 라우트

/**
 * 전체 인센티브 지급 처리 (관리자용)
 */
router.post('/admin/process-all', IncentiveManagementController.processAllIncentivePayments);

/**
 * 인센티브 통계 조회 (관리자용)
 */
router.get('/admin/stats', IncentiveManagementController.getIncentiveStats);

export default router;