"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const recommendationService_1 = require("../services/recommendationService");
class RecommendationController {
    static async generateRecommendations(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const config = req.body.config || {};
            const recommendations = await recommendationService_1.RecommendationService.generatePersonalizedRecommendations(userId, config);
            res.json({
                success: true,
                data: recommendations,
            });
        }
        catch (error) {
            console.error('Error generating recommendations:', error);
            res.status(500).json({
                error: 'Failed to generate recommendations',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getLatestRecommendations(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const recommendations = await recommendationService_1.RecommendationService.getLatestRecommendations(userId);
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
        }
        catch (error) {
            console.error('Error getting latest recommendations:', error);
            res.status(500).json({
                error: 'Failed to get recommendations',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getRecommendationsHistory(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const limit = parseInt(req.query.limit) || 10;
            const history = await recommendationService_1.RecommendationService.getRecommendationsHistory(userId, limit);
            res.json({
                success: true,
                data: history,
            });
        }
        catch (error) {
            console.error('Error getting recommendations history:', error);
            res.status(500).json({
                error: 'Failed to get recommendations history',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async trackImplementation(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { recommendationId, category, implemented, implementationDate, } = req.body;
            if (!recommendationId || !category || typeof implemented !== 'boolean') {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['recommendationId', 'category', 'implemented'],
                });
            }
            const effectiveness = await recommendationService_1.RecommendationService.updateImplementationStatus(recommendationId, userId, category, implemented, implementationDate ? new Date(implementationDate) : undefined);
            res.json({
                success: true,
                data: effectiveness,
            });
        }
        catch (error) {
            console.error('Error tracking implementation:', error);
            res.status(500).json({
                error: 'Failed to track implementation',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async submitFeedback(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { recommendationId, category, rating, comments, } = req.body;
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
            const effectiveness = await recommendationService_1.RecommendationService.submitUserFeedback(recommendationId, userId, category, { rating, comments });
            res.json({
                success: true,
                data: effectiveness,
            });
        }
        catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(500).json({
                error: 'Failed to submit feedback',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async updateAdherence(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { recommendationId, category, adherenceScore, } = req.body;
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
            const effectiveness = await recommendationService_1.RecommendationService.updateAdherenceScore(recommendationId, userId, category, adherenceScore);
            res.json({
                success: true,
                data: effectiveness,
            });
        }
        catch (error) {
            console.error('Error updating adherence:', error);
            res.status(500).json({
                error: 'Failed to update adherence',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async recordOutcome(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const { recommendationId, category, metric, beforeValue, afterValue, } = req.body;
            if (!recommendationId || !category || !metric ||
                typeof beforeValue !== 'number' || typeof afterValue !== 'number') {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['recommendationId', 'category', 'metric', 'beforeValue', 'afterValue'],
                });
            }
            const improvementPercentage = ((afterValue - beforeValue) / beforeValue) * 100;
            const effectiveness = await recommendationService_1.RecommendationService.recordMeasuredOutcome(recommendationId, userId, category, {
                metric,
                beforeValue,
                afterValue,
                improvementPercentage,
            });
            res.json({
                success: true,
                data: effectiveness,
            });
        }
        catch (error) {
            console.error('Error recording outcome:', error);
            res.status(500).json({
                error: 'Failed to record outcome',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getEffectivenessData(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const category = req.query.category;
            const effectivenessData = await recommendationService_1.RecommendationService.getEffectivenessData(userId, category);
            res.json({
                success: true,
                data: effectivenessData,
            });
        }
        catch (error) {
            console.error('Error getting effectiveness data:', error);
            res.status(500).json({
                error: 'Failed to get effectiveness data',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getRecommendationStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const stats = await recommendationService_1.RecommendationService.getRecommendationStats(userId);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error('Error getting recommendation stats:', error);
            res.status(500).json({
                error: 'Failed to get recommendation stats',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getLifestyleSuggestions(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const suggestions = await recommendationService_1.RecommendationService.getLifestyleImprovementSuggestions(userId);
            res.json({
                success: true,
                data: suggestions,
            });
        }
        catch (error) {
            console.error('Error getting lifestyle suggestions:', error);
            res.status(500).json({
                error: 'Failed to get lifestyle suggestions',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    static async getScreeningSchedule(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const schedule = await recommendationService_1.RecommendationService.getPersonalizedScreeningSchedule(userId);
            res.json({
                success: true,
                data: schedule,
            });
        }
        catch (error) {
            console.error('Error getting screening schedule:', error);
            res.status(500).json({
                error: 'Failed to get screening schedule',
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.RecommendationController = RecommendationController;
//# sourceMappingURL=recommendationController.js.map