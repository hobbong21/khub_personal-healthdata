"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionManager = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PredictionManager {
    static async createPrediction(userId, aiModelId, predictionType, inputData, predictionResult, confidenceScore) {
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
            inputData: prediction.inputData,
            predictionResult: prediction.predictionResult,
            confidenceScore: prediction.confidenceScore || 0,
            createdAt: prediction.createdAt,
        };
    }
    static async getUserPredictions(userId, predictionType, limit = 10) {
        const where = { userId };
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
            inputData: prediction.inputData,
            predictionResult: prediction.predictionResult,
            confidenceScore: prediction.confidenceScore || 0,
            createdAt: prediction.createdAt,
        }));
    }
    static async getPredictionById(id) {
        const prediction = await prisma.prediction.findUnique({
            where: { id },
            include: {
                aiModel: true,
            },
        });
        if (!prediction)
            return null;
        return {
            id: prediction.id,
            userId: prediction.userId,
            aiModelId: prediction.aiModelId,
            predictionType: prediction.predictionType,
            inputData: prediction.inputData,
            predictionResult: prediction.predictionResult,
            confidenceScore: prediction.confidenceScore || 0,
            createdAt: prediction.createdAt,
        };
    }
    static async getLatestPrediction(userId, predictionType) {
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
        if (!prediction)
            return null;
        return {
            id: prediction.id,
            userId: prediction.userId,
            aiModelId: prediction.aiModelId,
            predictionType: prediction.predictionType,
            inputData: prediction.inputData,
            predictionResult: prediction.predictionResult,
            confidenceScore: prediction.confidenceScore || 0,
            createdAt: prediction.createdAt,
        };
    }
    static async deleteOldPredictions(daysOld = 90) {
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
    static async getPredictionStats(userId) {
        const predictions = await prisma.prediction.findMany({
            where: { userId },
            select: {
                predictionType: true,
                confidenceScore: true,
                createdAt: true,
            },
        });
        const totalPredictions = predictions.length;
        const predictionsByType = {};
        let totalConfidence = 0;
        let latestPredictionDate = null;
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
exports.PredictionManager = PredictionManager;
exports.default = PredictionManager;
//# sourceMappingURL=Prediction.js.map