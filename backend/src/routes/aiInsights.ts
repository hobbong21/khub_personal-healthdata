import express from 'express';
import { AIInsightsController } from '../controllers/aiInsightsController';
import { authenticateToken } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

// 모든 AI Insights 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// GET /api/ai-insights - 모든 인사이트 조회 (요구사항 9.1)
router.get('/', cacheMiddleware(300), AIInsightsController.getAllInsights);

// GET /api/ai-insights/summary - AI 요약만 조회 (요구사항 9.2)
router.get('/summary', cacheMiddleware(300), AIInsightsController.getSummary);

// GET /api/ai-insights/trends - 트렌드 데이터 조회 (요구사항 9.3)
router.get('/trends', cacheMiddleware(600), AIInsightsController.getTrends);

// GET /api/ai-insights/health-score - 건강 점수 조회 (요구사항 9.4)
router.get('/health-score', cacheMiddleware(300), AIInsightsController.getHealthScore);

// POST /api/ai-insights/refresh - 인사이트 강제 새로고침 (요구사항 9.5)
router.post('/refresh', AIInsightsController.refreshInsights);

export default router;
