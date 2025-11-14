"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModelManager = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AIModelManager {
    static async createModel(config) {
        const model = await prisma.aIModel.create({
            data: {
                name: config.name,
                version: config.version,
                modelType: config.modelType,
                parameters: config.parameters,
                accuracy: config.accuracy,
                trainedAt: config.trainedAt,
            },
        });
        return {
            id: model.id,
            name: model.name,
            version: model.version,
            modelType: model.modelType,
            parameters: model.parameters,
            accuracy: model.accuracy || undefined,
            trainedAt: model.trainedAt,
            inputFeatures: config.inputFeatures,
            outputLabels: config.outputLabels,
        };
    }
    static async getModelById(id) {
        const model = await prisma.aIModel.findUnique({
            where: { id },
        });
        if (!model)
            return null;
        return {
            id: model.id,
            name: model.name,
            version: model.version,
            modelType: model.modelType,
            parameters: model.parameters,
            accuracy: model.accuracy || undefined,
            trainedAt: model.trainedAt,
            inputFeatures: [],
            outputLabels: [],
        };
    }
    static async getModelsByType(modelType) {
        const models = await prisma.aIModel.findMany({
            where: { modelType },
            orderBy: { trainedAt: 'desc' },
        });
        return models.map(model => ({
            id: model.id,
            name: model.name,
            version: model.version,
            modelType: model.modelType,
            parameters: model.parameters,
            accuracy: model.accuracy || undefined,
            trainedAt: model.trainedAt,
            inputFeatures: [],
            outputLabels: [],
        }));
    }
    static async updateModelAccuracy(id, accuracy) {
        await prisma.aIModel.update({
            where: { id },
            data: { accuracy },
        });
    }
    static async getLatestModelVersion(name) {
        const model = await prisma.aIModel.findFirst({
            where: { name },
            orderBy: { trainedAt: 'desc' },
        });
        if (!model)
            return null;
        return {
            id: model.id,
            name: model.name,
            version: model.version,
            modelType: model.modelType,
            parameters: model.parameters,
            accuracy: model.accuracy || undefined,
            trainedAt: model.trainedAt,
            inputFeatures: [],
            outputLabels: [],
        };
    }
    static async deleteModel(id) {
        await prisma.aIModel.delete({
            where: { id },
        });
    }
    static async listModels(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [models, total] = await Promise.all([
            prisma.aIModel.findMany({
                skip: offset,
                take: limit,
                orderBy: { trainedAt: 'desc' },
            }),
            prisma.aIModel.count(),
        ]);
        return {
            models: models.map(model => ({
                id: model.id,
                name: model.name,
                version: model.version,
                modelType: model.modelType,
                parameters: model.parameters,
                accuracy: model.accuracy || undefined,
                trainedAt: model.trainedAt,
                inputFeatures: [],
                outputLabels: [],
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.AIModelManager = AIModelManager;
exports.default = AIModelManager;
//# sourceMappingURL=AIModel.js.map