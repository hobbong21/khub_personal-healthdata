import { Router } from 'express';
import { GoogleFitController } from '../controllers/googleFitController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, query, param } from 'express-validator';

/**
 * Google Fit API 라우트
 * 요구사항 17.3: 안드로이드 기기 데이터 동기화
 */
const router = Router();
const googleFitController = new GoogleFitController();

/**
 * Google Fit 인증 URL 생성
 * GET /api/google-fit/auth-url
 */
router.get('/auth-url', 
  authenticateToken,
  googleFitController.getAuthUrl.bind(googleFitController)
);

/**
 * Google Fit 인증 콜백 처리
 * GET /api/google-fit/auth/callback
 */
router.get('/auth/callback',
  authenticateToken,
  [
    query('code')
      .notEmpty()
      .withMessage('인증 코드가 필요합니다.'),
  ],
  validateRequest,
  googleFitController.handleAuthCallback.bind(googleFitController)
);

/**
 * Google Fit 데이터 동기화
 * POST /api/google-fit/sync
 */
router.post('/sync',
  authenticateToken,
  [
    body('dataTypes')
      .optional()
      .isArray()
      .withMessage('dataTypes는 배열이어야 합니다.'),
    body('dataTypes.*')
      .optional()
      .isIn([
        'heart_rate', 'steps', 'calories', 'sleep', 'weight',
        'blood_pressure', 'blood_oxygen', 'body_temperature',
        'exercise_sessions', 'distance', 'floors_climbed'
      ])
      .withMessage('유효하지 않은 데이터 타입입니다.'),
    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('startDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('endDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
    body('forceSync')
      .optional()
      .isBoolean()
      .withMessage('forceSync는 불린 값이어야 합니다.'),
  ],
  validateRequest,
  googleFitController.syncData.bind(googleFitController)
);

/**
 * 특정 데이터 타입 조회
 * GET /api/google-fit/data/:dataType
 */
router.get('/data/:dataType',
  authenticateToken,
  [
    param('dataType')
      .isIn([
        'heart_rate', 'steps', 'calories', 'sleep', 'weight',
        'blood_pressure', 'blood_oxygen', 'body_temperature',
        'exercise_sessions', 'distance', 'floors_climbed'
      ])
      .withMessage('유효하지 않은 데이터 타입입니다.'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('startDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('endDate는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
  ],
  validateRequest,
  googleFitController.getDataByType.bind(googleFitController)
);

/**
 * Google Fit 연결 상태 확인
 * GET /api/google-fit/status
 */
router.get('/status',
  authenticateToken,
  googleFitController.getConnectionStatus.bind(googleFitController)
);

/**
 * Google Fit 연동 해제
 * DELETE /api/google-fit/disconnect
 */
router.delete('/disconnect',
  authenticateToken,
  googleFitController.disconnectDevice.bind(googleFitController)
);

/**
 * 동기화 설정 업데이트
 * PUT /api/google-fit/sync-settings
 */
router.put('/sync-settings',
  authenticateToken,
  [
    body('autoSync')
      .optional()
      .isBoolean()
      .withMessage('autoSync는 불린 값이어야 합니다.'),
    body('syncInterval')
      .optional()
      .isInt({ min: 5, max: 1440 })
      .withMessage('syncInterval은 5분에서 1440분(24시간) 사이의 값이어야 합니다.'),
    body('dataTypes')
      .optional()
      .isArray()
      .withMessage('dataTypes는 배열이어야 합니다.'),
    body('dataTypes.*')
      .optional()
      .isIn([
        'heart_rate', 'steps', 'calories', 'sleep', 'weight',
        'blood_pressure', 'blood_oxygen', 'body_temperature',
        'exercise_sessions', 'distance', 'floors_climbed'
      ])
      .withMessage('유효하지 않은 데이터 타입입니다.'),
  ],
  validateRequest,
  googleFitController.updateSyncSettings.bind(googleFitController)
);

/**
 * Google Fit 사용자 프로필 조회
 * GET /api/google-fit/profile
 */
router.get('/profile',
  authenticateToken,
  googleFitController.getUserProfile.bind(googleFitController)
);

/**
 * 건강 상태 요약 조회 (Google Fit 데이터 기반)
 * GET /api/google-fit/health-summary
 */
router.get('/health-summary',
  authenticateToken,
  [
    query('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('period는 daily, weekly, monthly 중 하나여야 합니다.'),
    query('date')
      .optional()
      .isISO8601()
      .withMessage('date는 유효한 ISO 8601 날짜 형식이어야 합니다.'),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { period = 'daily', date } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: '사용자 인증이 필요합니다.',
        });
        return;
      }

      // TODO: Google Fit 데이터를 기반으로 건강 상태 요약 생성
      const summary = {
        period,
        date: date || new Date().toISOString().split('T')[0],
        metrics: {
          steps: {
            value: 8500,
            goal: 10000,
            percentage: 85,
          },
          calories: {
            value: 2100,
            goal: 2500,
            percentage: 84,
          },
          heartRate: {
            average: 72,
            resting: 65,
            max: 145,
          },
          sleep: {
            duration: 7.5,
            quality: 'good',
            efficiency: 88,
          },
        },
        insights: [
          '오늘 목표 걸음 수의 85%를 달성했습니다.',
          '평균 심박수가 정상 범위에 있습니다.',
          '수면 효율성이 양호합니다.',
        ],
      };

      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error('Error generating health summary:', error);
      res.status(500).json({
        success: false,
        message: '건강 상태 요약 생성에 실패했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;