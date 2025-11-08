import { Request, Response } from 'express';
import { AIInsightsService } from '../services/aiInsightsService';

/**
 * Extended Request interface with user authentication
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * AI Insights Controller
 * Handles HTTP requests for AI-powered health insights
 */
export class AIInsightsController {
  /**
   * GET /api/ai-insights
   * Get all AI insights including summary, cards, score, stats, recommendations, and trends
   */
  static async getAllInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: '인증이 필요합니다.'
        });
        return;
      }

      const insights = await AIInsightsService.getAIInsights(userId);

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Error getting AI insights:', error);
      res.status(500).json({
        error: 'AI 인사이트를 불러오는데 실패했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/ai-insights/summary
   * Get only the AI-generated health summary
   */
  static async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: '인증이 필요합니다.'
        });
        return;
      }

      const insights = await AIInsightsService.getAIInsights(userId);

      res.json({
        success: true,
        data: insights.summary
      });
    } catch (error) {
      console.error('Error getting AI summary:', error);
      res.status(500).json({
        error: 'AI 요약을 불러오는데 실패했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/ai-insights/trends?period=30
   * Get trend analysis for specified time period
   * Query parameters:
   *   - period: number of days (7, 30, 90, 365)
   */
  static async getTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: '인증이 필요합니다.'
        });
        return;
      }

      // Parse and validate period parameter
      const periodParam = req.query.period as string;
      const period = periodParam ? parseInt(periodParam, 10) : 30;

      // Validate period is a valid number
      if (isNaN(period) || period <= 0) {
        res.status(400).json({
          error: '유효하지 않은 기간입니다.',
          message: 'period는 양수여야 합니다.'
        });
        return;
      }

      // Validate period is one of the supported values
      const validPeriods = [7, 30, 90, 365];
      if (!validPeriods.includes(period)) {
        res.status(400).json({
          error: '지원하지 않는 기간입니다.',
          message: '지원되는 기간: 7, 30, 90, 365일'
        });
        return;
      }

      const trends = await AIInsightsService.analyzeTrends(userId, period);

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('Error getting trends:', error);
      res.status(500).json({
        error: '트렌드 분석을 불러오는데 실패했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/ai-insights/health-score
   * Get current health score with component breakdown
   */
  static async getHealthScore(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: '인증이 필요합니다.'
        });
        return;
      }

      const insights = await AIInsightsService.getAIInsights(userId);

      res.json({
        success: true,
        data: insights.healthScore
      });
    } catch (error) {
      console.error('Error getting health score:', error);
      res.status(500).json({
        error: '건강 점수를 불러오는데 실패했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/ai-insights/refresh
   * Force refresh insights by clearing cache and regenerating
   */
  static async refreshInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          error: '인증이 필요합니다.'
        });
        return;
      }

      // Clear cache by deleting existing cache entry
      await AIInsightsService.clearCache(userId);

      // Generate fresh insights
      const insights = await AIInsightsService.getAIInsights(userId);

      res.json({
        success: true,
        data: insights,
        message: '인사이트가 성공적으로 새로고침되었습니다.'
      });
    } catch (error) {
      console.error('Error refreshing insights:', error);
      res.status(500).json({
        error: '인사이트 새로고침에 실패했습니다.',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default AIInsightsController;
