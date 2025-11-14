"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationManager = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class RecommendationManager {
    static async createRecommendations(userId, recommendations) {
        const result = await prisma.recommendation.create({
            data: {
                userId,
                nutrition: recommendations.nutrition,
                exercise: recommendations.exercise,
                screening: recommendations.screening,
                lifestyle: recommendations.lifestyle,
                validUntil: recommendations.validUntil,
                confidence: recommendations.confidence,
            },
        });
        return {
            id: result.id,
            userId: result.userId,
            nutrition: result.nutrition,
            exercise: result.exercise,
            screening: result.screening,
            lifestyle: result.lifestyle,
            generatedAt: result.generatedAt,
            validUntil: result.validUntil,
            confidence: result.confidence,
        };
    }
    static async getLatestRecommendations(userId) {
        const result = await prisma.recommendation.findFirst({
            where: {
                userId,
                validUntil: {
                    gte: new Date(),
                },
            },
            orderBy: { generatedAt: 'desc' },
        });
        if (!result)
            return null;
        return {
            id: result.id,
            userId: result.userId,
            nutrition: result.nutrition,
            exercise: result.exercise,
            screening: result.screening,
            lifestyle: result.lifestyle,
            generatedAt: result.generatedAt,
            validUntil: result.validUntil,
            confidence: result.confidence,
        };
    }
    static async getUserRecommendations(userId, limit = 10) {
        const results = await prisma.recommendation.findMany({
            where: { userId },
            orderBy: { generatedAt: 'desc' },
            take: limit,
        });
        return results.map(result => ({
            id: result.id,
            userId: result.userId,
            nutrition: result.nutrition,
            exercise: result.exercise,
            screening: result.screening,
            lifestyle: result.lifestyle,
            generatedAt: result.generatedAt,
            validUntil: result.validUntil,
            confidence: result.confidence,
        }));
    }
    static async updateRecommendationValidity(recommendationId, validUntil) {
        await prisma.recommendation.update({
            where: { id: recommendationId },
            data: { validUntil },
        });
    }
    static async deleteExpiredRecommendations() {
        const result = await prisma.recommendation.deleteMany({
            where: {
                validUntil: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    }
    static async trackEffectiveness(effectiveness) {
        const result = await prisma.recommendationEffectiveness.upsert({
            where: {
                recommendationId_userId: {
                    recommendationId: effectiveness.recommendationId,
                    userId: effectiveness.userId,
                },
            },
            update: {
                implemented: effectiveness.implemented,
                implementationDate: effectiveness.implementationDate,
                adherenceScore: effectiveness.adherenceScore,
                measuredOutcome: effectiveness.measuredOutcome,
                userFeedback: effectiveness.userFeedback,
                lastUpdated: new Date(),
            },
            create: {
                ...effectiveness,
                lastUpdated: new Date(),
            },
        });
        return {
            recommendationId: result.recommendationId,
            userId: result.userId,
            category: result.category,
            implemented: result.implemented,
            implementationDate: result.implementationDate,
            adherenceScore: result.adherenceScore,
            measuredOutcome: result.measuredOutcome,
            userFeedback: result.userFeedback,
            lastUpdated: result.lastUpdated,
        };
    }
    static async getEffectivenessData(userId, category) {
        const where = { userId };
        if (category) {
            where.category = category;
        }
        const results = await prisma.recommendationEffectiveness.findMany({
            where,
            orderBy: { lastUpdated: 'desc' },
        });
        return results.map(result => ({
            recommendationId: result.recommendationId,
            userId: result.userId,
            category: result.category,
            implemented: result.implemented,
            implementationDate: result.implementationDate,
            adherenceScore: result.adherenceScore,
            measuredOutcome: result.measuredOutcome,
            userFeedback: result.userFeedback,
            lastUpdated: result.lastUpdated,
        }));
    }
    static async getRecommendationStats(userId) {
        const [total, implemented, avgAdherence] = await Promise.all([
            prisma.recommendationEffectiveness.count({
                where: { userId },
            }),
            prisma.recommendationEffectiveness.count({
                where: { userId, implemented: true },
            }),
            prisma.recommendationEffectiveness.aggregate({
                where: { userId, adherenceScore: { not: null } },
                _avg: { adherenceScore: true },
            }),
        ]);
        return {
            totalRecommendations: total,
            implementedRecommendations: implemented,
            implementationRate: total > 0 ? (implemented / total) * 100 : 0,
            averageAdherence: avgAdherence._avg.adherenceScore || 0,
        };
    }
}
exports.RecommendationManager = RecommendationManager;
//# sourceMappingURL=Recommendation.js.map