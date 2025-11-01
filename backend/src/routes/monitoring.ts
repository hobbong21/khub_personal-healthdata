import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, Permission } from '../middleware/security';
import * as monitoringController from '../controllers/monitoringController';

const router = Router();

/**
 * 헬스 체크 (인증 불필요)
 * GET /api/monitoring/health
 */
router.get('/health', monitoringController.healthCheck);

// 나머지 엔드포인트는 인증 필요
router.use(authenticateToken);

/**
 * 시스템 상태 조회
 * GET /api/monitoring/status
 */
router.get('/status', monitoringController.getSystemStatus);

/**
 * 실시간 메트릭 조회
 * GET /api/monitoring/metrics?count=10
 */
router.get('/metrics', monitoringController.getRealtimeMetrics);

/**
 * 활성 알림 조회
 * GET /api/monitoring/alerts
 */
router.get('/alerts', monitoringController.getActiveAlerts);

/**
 * 알림 규칙 조회
 * GET /api/monitoring/alert-rules
 */
router.get('/alert-rules', monitoringController.getAlertRules);

/**
 * 사용자 행동 분석
 * GET /api/monitoring/user-behavior?startDate=2024-01-01&endDate=2024-01-31
 */
router.get('/user-behavior', monitoringController.getUserBehaviorAnalysis);

/**
 * 사용자 행동 이벤트 추적
 * POST /api/monitoring/track
 * Body: { event: string, page: string, metadata?: any }
 */
router.post('/track', monitoringController.trackUserBehavior);

/**
 * 로그 검색
 * GET /api/monitoring/logs?level=error&service=health-platform&limit=100
 */
router.get('/logs', monitoringController.searchLogs);

/**
 * 로그 통계 조회
 * GET /api/monitoring/logs/statistics?startDate=2024-01-01&endDate=2024-01-31
 */
router.get('/logs/statistics', monitoringController.getLogStatistics);

/**
 * 로그 내보내기
 * POST /api/monitoring/logs/export
 * Body: { startDate: string, endDate: string, level?: string, service?: string, format?: 'json' | 'csv' }
 */
router.post('/logs/export', monitoringController.exportLogs);

// 관리자 권한이 필요한 엔드포인트들

/**
 * 모니터링 시작 (관리자 권한 필요)
 * POST /api/monitoring/start
 * Body: { interval?: number }
 */
router.post('/start',
  requirePermission(Permission.SYSTEM_ADMIN),
  monitoringController.startMonitoring
);

/**
 * 모니터링 중지 (관리자 권한 필요)
 * POST /api/monitoring/stop
 */
router.post('/stop',
  requirePermission(Permission.SYSTEM_ADMIN),
  monitoringController.stopMonitoring
);

/**
 * 시스템 정리 (관리자 권한 필요)
 * POST /api/monitoring/cleanup
 * Body: { retentionDays?: number }
 */
router.post('/cleanup',
  requirePermission(Permission.SYSTEM_ADMIN),
  monitoringController.cleanupSystem
);

export default router;