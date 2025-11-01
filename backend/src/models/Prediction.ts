import { PrismaClient } from '@prisma/client';
import { PredictionResult, PredictionRequest } from '../types/ai';

const prisma = new PrismaClient();

export class PredictionManager {
  /**
   * Create a new prediction record
   */
  static async createPrediction(
    userId: string,
    aiModelId: string,
    predictionType: string,
    inputData: Record<string, any>,
    predictionResult: any,
    confidenceScore: number
  ): Promise<PredictionResult> {
    const prediction = await prisma.prediction.create({
      data: {
        userId,
        aiModelId,
        predictionType,
        inputData,
        predictionResult,
        confidenceScore,
      },
      include: {
        aiModel: true,
      },
    });

    return {
      id: prediction.id,
      userId: prediction.userId,
      aiModelId: prediction.aiModelId,
      predictionType: prediction.predictionType,
      inputData: prediction.inputData as Record<string, any>,
      predictionResult: prediction.predictionResult as any,
      confidenceScore: prediction.confidenceScore || 0,
      createdAt: prediction.createdAt,
    };
  }

  /**
   * Get predictions for a user
   */
  static async getUserPredictions(
    userId: string,
    predictionType?: string,
    limit: number = 10
  ): Promise<PredictionResult[]> {
    const where: any = { userId };
    if (predictionType) {
      where.predictionType = predictionType;
    }

    const predictions = await prisma.prediction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        aiModel: true,
      },
    });

    return predictions.map(prediction => ({
      id: prediction.id,
      userId: prediction.userId,
      aiModelId: prediction.aiModelId,
      predictionType: prediction.predictionType,
      inputData: prediction.inputData as Record<string, any>,
      predictionResult: prediction.predictionResult as any,
      confidenceScore: prediction.confidenceScore || 0,
      createdAt: prediction.createdAt,
    }));
  }

  /**
   * Get prediction by ID
   */
  static async getPredictionById(id: string): Promise<PredictionResult | null> {
    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: {
        aiModel: true,
      },
    });

    if (!prediction) return null;

    return {
      id: prediction.id,
      userId: prediction.userId,
      aiModelId: prediction.aiModelId,
      predictionType: prediction.predictionType,
      inputData: prediction.inputData as Record<string, any>,
      predictionResult: prediction.predictionResult as any,
      confidenceScore: prediction.confidenceScore || 0,
      createdAt: prediction.createdAt,
    };
  }

  /**
   * Get latest prediction for user by type
   */
  static async getLatestPrediction(
    userId: string,
    predictionType: string
  ): Promise<PredictionResult | null> {
    const prediction = await prisma.prediction.findFirst({
      where: {
        userId,
        predictionType,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        aiModel: true,
      },
    });

    if (!prediction) return null;

    return {
      id: prediction.id,
      userId: prediction.userId,
      aiModelId: prediction.aiModelId,
      predictionType: prediction.predictionType,
      inputData: prediction.inputData as Record<string, any>,
      predictionResult: prediction.predictionResult as any,
      confidenceScore: prediction.confidenceScore || 0,
      createdAt: prediction.createdAt,
    };
  }

  /**
   * Delete old predictions (cleanup)
   */
  static async deleteOldPredictions(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.prediction.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Get prediction statistics for a user
   */
  static async getPredictionStats(userId: string): Promise<{
    totalPredictions: number;
    predictionsByType: Record<string, number>;
    averageConfidence: number;
    latestPredictionDate: Date | null;
  }> {
    const predictions = await prisma.prediction.findMany({
      where: { userId },
      select: {
        predictionType: true,
        confidenceScore: true,
        createdAt: true,
      },
    });

    const totalPredictions = predictions.length;
    const predictionsByType: Record<string, number> = {};
    let totalConfidence = 0;
    let latestPredictionDate: Date | null = null;

    predictions.forEach(prediction => {
      predictionsByType[prediction.predictionType] = 
        (predictionsByType[prediction.predictionType] || 0) + 1;
      
      if (prediction.confidenceScore) {
        totalConfidence += prediction.confidenceScore;
      }

      if (!latestPredictionDate || prediction.createdAt > latestPredictionDate) {
        latestPredictionDate = prediction.createdAt;
      }
    });

    return {
      totalPredictions,
      predictionsByType,
      averageConfidence: totalPredictions > 0 ? totalConfidence / totalPredictions : 0,
      latestPredictionDate,
    };
  }
}

export default PredictionManager;