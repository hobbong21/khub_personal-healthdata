import express from 'express';
import { getPersonalizedRecommendations } from '../controllers/aiInsightsController';
import { authenticateToken } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = express.Router();

// Apply authentication middleware to all AI Insights routes
router.use(authenticateToken);

// GET /api/ai-insights - Get all insights
router.get('/', cacheMiddleware(300), getPersonalizedRecommendations);

// The following routes are commented out because their corresponding controller functions are not yet implemented.
// Uncomment them as you implement the controller logic.

// GET /api/ai-insights/summary - Get AI summary only
// router.get('/summary', cacheMiddleware(300), AIInsightsController.getSummary);

// GET /api/ai-insights/trends - Get trend data
// router.get('/trends', cacheMiddleware(600), AIInsightsController.getTrends);

// GET /api/ai-insights/health-score - Get health score
// router.get('/health-score', cacheMiddleware(300), AIInsightsController.getHealthScore);

// POST /api/ai-insights/refresh - Force refresh insights
// router.post('/refresh', AIInsightsController.refreshInsights);

export default router;
