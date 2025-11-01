import { Request, Response } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { RecommendationGenerationConfig } from '../types/recommendations';

export class RecommendationController {
  /**
   * Generate new personalized recommendations
   */
  static async generateRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const config: Partial<RecommendationGenerationConfig> = req.body.config || {};

      const recommendations = await RecommendationService.generatePersonalizedRecommendations(
        userId,
        config
      );

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get latest recommendations for user
   */
  static async getLatestRecommendations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const recommendations = await RecommendationService.getLatestRecommendations(userId);

      if (!recommendations) {
        return res.status(404).json({
          error: 'No valid recommendations found',
          message: 'Generate new recommendations to get personalized health advice',
        });
      }

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error getting latest recommendations:', error);
      res.status(500).json({
        error: 'Failed to get recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get recommendations history
   */
  static async getRecommendationsHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 10;

      const history = await RecommendationService.getRecommendationsHistory(userId, limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Error getting recommendations history:', error);
      res.status(500).json({
        error: 'Failed to get recommendations history',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Track recommendation implementation
   */
  static async trackImplementation(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        recommendationId,
        category,
        implemented,
        implementationDate,
      } = req.body;

      if (!recommendationId || !category || typeof implemented !== 'boolean') {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['recommendationId', 'category', 'implemented'],
        });
      }

      const effectiveness = await RecommendationService.updateImplementationStatus(
        recommendationId,
        userId,
        category,
        implemented,
        implementationDate ? new Date(implementationDate) : undefined
      );

      res.json({
        success: true,
        data: effectiveness,
      });
    } catch (error) {
      console.error('Error tracking implementation:', error);
      res.status(500).json({
        error: 'Failed to track implementation',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Submit user feedback for recommendations
   */
  static async submitFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        recommendationId,
        category,
        rating,
        comments,
      } = req.body;

      if (!recommendationId || !category || typeof rating !== 'number') {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['recommendationId', 'category', 'rating'],
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Rating must be between 1 and 5',
        });
      }

      const effectiveness = await RecommendationService.submitUserFeedback(
        recommendationId,
        userId,
        category,
        { rating, comments }
      );

      res.json({
        success: true,
        data: effectiveness,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({
        error: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update adherence score
   */
  static async updateAdherence(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        recommendationId,
        category,
        adherenceScore,
      } = req.body;

      if (!recommendationId || !category || typeof adherenceScore !== 'number') {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['recommendationId', 'category', 'adherenceScore'],
        });
      }

      if (adherenceScore < 0 || adherenceScore > 100) {
        return res.status(400).json({
          error: 'Adherence score must be between 0 and 100',
        });
      }

      const effectiveness = await RecommendationService.updateAdherenceScore(
        recommendationId,
        userId,
        category,
        adherenceScore
      );

      res.json({
        success: true,
        data: effectiveness,
      });
    } catch (error) {
      console.error('Error updating adherence:', error);
      res.status(500).json({
        error: 'Failed to update adherence',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Record measured outcome
   */
  static async recordOutcome(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const {
        recommendationId,
        category,
        metric,
        beforeValue,
        afterValue,
      } = req.body;

      if (!recommendationId || !category || !metric || 
          typeof beforeValue !== 'number' || typeof afterValue !== 'number') {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['recommendationId', 'category', 'metric', 'beforeValue', 'afterValue'],
        });
      }

      const improvementPercentage = ((afterValue - beforeValue) / beforeValue) * 100;

      const effectiveness = await RecommendationService.recordMeasuredOutcome(
        recommendationId,
        userId,
        category,
        {
          metric,
          beforeValue,
          afterValue,
          improvementPercentage,
        }
      );

      res.json({
        success: true,
        data: effectiveness,
      });
    } catch (error) {
      console.error('Error recording outcome:', error);
      res.status(500).json({
        error: 'Failed to record outcome',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get effectiveness data
   */
  static async getEffectivenessData(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const category = req.query.category as string;

      const effectivenessData = await RecommendationService.getEffectivenessData(
        userId,
        category
      );

      res.json({
        success: true,
        data: effectivenessData,
      });
    } catch (error) {
      console.error('Error getting effectiveness data:', error);
      res.status(500).json({
        error: 'Failed to get effectiveness data',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get recommendation statistics
   */
  static async getRecommendationStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const stats = await RecommendationService.getRecommendationStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting recommendation stats:', error);
      res.status(500).json({
        error: 'Failed to get recommendation stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get lifestyle improvement suggestions
   */
  static async getLifestyleSuggestions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const suggestions = await RecommendationService.getLifestyleImprovementSuggestions(userId);

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error('Error getting lifestyle suggestions:', error);
      res.status(500).json({
        error: 'Failed to get lifestyle suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get personalized screening schedule
   */
  static async getScreeningSchedule(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const schedule = await RecommendationService.getPersonalizedScreeningSchedule(userId);

      res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      console.error('Error getting screening schedule:', error);
      res.status(500).json({
        error: 'Failed to get screening schedule',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}