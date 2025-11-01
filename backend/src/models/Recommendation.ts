import { PrismaClient } from '@prisma/client';
import { 
  PersonalizedRecommendations, 
  RecommendationEffectiveness,
  RecommendationInput 
} from '../types/recommendations';

const prisma = new PrismaClient();

export class RecommendationManager {
  /**
   * Create new personalized recommendations
   */
  static async createRecommendations(
    userId: string,
    recommendations: Omit<PersonalizedRecommendations, 'id' | 'userId' | 'generatedAt'>
  ): Promise<PersonalizedRecommendations> {
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
      nutrition: result.nutrition as any,
      exercise: result.exercise as any,
      screening: result.screening as any,
      lifestyle: result.lifestyle as any,
      generatedAt: result.generatedAt,
      validUntil: result.validUntil,
      confidence: result.confidence,
    };
  }

  /**
   * Get latest recommendations for user
   */
  static async getLatestRecommendations(userId: string): Promise<PersonalizedRecommendations | null> {
    const result = await prisma.recommendation.findFirst({
      where: { 
        userId,
        validUntil: {
          gte: new Date(),
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    if (!result) return null;

    return {
      id: result.id,
      userId: result.userId,
      nutrition: result.nutrition as any,
      exercise: result.exercise as any,
      screening: result.screening as any,
      lifestyle: result.lifestyle as any,
      generatedAt: result.generatedAt,
      validUntil: result.validUntil,
      confidence: result.confidence,
    };
  }

  /**
   * Get all recommendations for user
   */
  static async getUserRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<PersonalizedRecommendations[]> {
    const results = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
      take: limit,
    });

    return results.map(result => ({
      id: result.id,
      userId: result.userId,
      nutrition: result.nutrition as any,
      exercise: result.exercise as any,
      screening: result.screening as any,
      lifestyle: result.lifestyle as any,
      generatedAt: result.generatedAt,
      validUntil: result.validUntil,
      confidence: result.confidence,
    }));
  }

  /**
   * Update recommendation validity
   */
  static async updateRecommendationValidity(
    recommendationId: string,
    validUntil: Date
  ): Promise<void> {
    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { validUntil },
    });
  }

  /**
   * Delete old recommendations
   */
  static async deleteExpiredRecommendations(): Promise<number> {
    const result = await prisma.recommendation.deleteMany({
      where: {
        validUntil: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Track recommendation effectiveness
   */
  static async trackEffectiveness(
    effectiveness: Omit<RecommendationEffectiveness, 'lastUpdated'>
  ): Promise<RecommendationEffectiveness> {
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
      measuredOutcome: result.measuredOutcome as any,
      userFeedback: result.userFeedback as any,
      lastUpdated: result.lastUpdated,
    };
  }

  /**
   * Get effectiveness data for recommendations
   */
  static async getEffectivenessData(
    userId: string,
    category?: string
  ): Promise<RecommendationEffectiveness[]> {
    const where: any = { userId };
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
      measuredOutcome: result.measuredOutcome as any,
      userFeedback: result.userFeedback as any,
      lastUpdated: result.lastUpdated,
    }));
  }

  /**
   * Get recommendation statistics
   */
  static async getRecommendationStats(userId: string) {
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