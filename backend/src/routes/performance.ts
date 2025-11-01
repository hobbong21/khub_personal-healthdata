import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requirePermission, Permission } from '../middleware/security';
import * as performanceController from '../controllers/performanceController';

const router = Router();

// 모든 성능 관련 엔드포인트는 인증 필요
router.use(authenticateToken);

/**
 * 성능 메트릭 조회
 * GET /api/performance/metrics
 */
router.get('/metrics', performanceController.getPerformanceMetrics);

/**
 * 느린 쿼리 분석
 * GET /api/performance/slow-queries?threshold=100
 */
router.get('/slow-queries', performanceController.getSlowQueries);

/**
 * 인덱스 최적화 제안
 * GET /api/performance/index-optimizations
 */
router.get('/index-optimizations', performanceController.getIndexOptimizations);

/**
 * 캐시 분석
 * GET /api/performance/cache-analysis
 */
router.get('/cache-analysis', performanceController.getCacheAnalysis);

/**
 * 메모리 사용량 분석
 * GET /api/performance/memory-analysis
 */
router.get('/memory-analysis', performanceController.getMemoryAnalysis);

/**
 * 데이터베이스 연결 풀 분석
 * GET /api/performance/connection-pool
 */
router.get('/connection-pool', performanceController.getConnectionPoolAnalysis);

/**
 * API 성능 분석
 * GET /api/performance/api-analysis
 */
router.get('/api-analysis', performanceController.getAPIPerformanceAnalysis);

/**
 * 종합 성능 보고서 생성
 * GET /api/performance/report
 */
router.get('/report', performanceController.generatePerformanceReport);

/**
 * 쿼리 패턴 분석
 * GET /api/performance/query-patterns
 */
router.get('/query-patterns', performanceController.analyzeQueryPatterns);

/**
 * 인덱스 사용률 분석
 * GET /api/performance/index-usage
 */
router.get('/index-usage', performanceController.analyzeIndexUsage);

/**
 * 사용되지 않는 인덱스 조회
 * GET /api/performance/unused-indexes
 */
router.get('/unused-indexes', performanceController.getUnusedIndexes);

/**
 * 쿼리 벤치마크 실행
 * POST /api/performance/benchmark
 * Body: { query: string, iterations?: number }
 */
router.post('/benchmark', performanceController.benchmarkQuery);

/**
 * 캐시 최적화 실행 (관리자 권한 필요)
 * POST /api/performance/optimize-cache
 */
router.post('/optimize-cache', 
  requirePermission(Permission.SYSTEM_ADMIN),
  performanceController.optimizeCache
);

/**
 * 성능 메트릭 초기화 (관리자 권한 필요)
 * POST /api/performance/reset-metrics
 */
router.post('/reset-metrics',
  requirePermission(Permission.SYSTEM_ADMIN),
  performanceController.resetPerformanceMetrics
);

/**
 * 자동 인덱스 생성 (관리자 권한 필요)
 * POST /api/performance/create-indexes
 * Body: { maxIndexes?: number }
 */
router.post('/create-indexes',
  requirePermission(Permission.SYSTEM_ADMIN),
  performanceController.createRecommendedIndexes
);

export default router;