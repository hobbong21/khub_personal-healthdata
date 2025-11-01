import { PrismaClient } from '@prisma/client';
import { AIModelConfig, ModelPerformanceMetrics, ModelVersionInfo } from '../types/ai';

const prisma = new PrismaClient();

export class AIModelManager {
  /**
   * Create a new AI model entry
   */
  static async createModel(config: Omit<AIModelConfig, 'id'>): Promise<AIModelConfig> {
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
      modelType: model.modelType as AIModelConfig['modelType'],
      parameters: model.parameters as Record<string, any>,
      accuracy: model.accuracy || undefined,
      trainedAt: model.trainedAt,
      inputFeatures: config.inputFeatures,
      outputLabels: config.outputLabels,
    };
  }

  /**
   * Get model by ID
   */
  static async getModelById(id: string): Promise<AIModelConfig | null> {
    const model = await prisma.aIModel.findUnique({
      where: { id },
    });

    if (!model) return null;

    return {
      id: model.id,
      name: model.name,
      version: model.version,
      modelType: model.modelType as AIModelConfig['modelType'],
      parameters: model.parameters as Record<string, any>,
      accuracy: model.accuracy || undefined,
      trainedAt: model.trainedAt,
      inputFeatures: [],
      outputLabels: [],
    };
  }

  /**
   * Get all models by type
   */
  static async getModelsByType(modelType: string): Promise<AIModelConfig[]> {
    const models = await prisma.aIModel.findMany({
      where: { modelType },
      orderBy: { trainedAt: 'desc' },
    });

    return models.map(model => ({
      id: model.id,
      name: model.name,
      version: model.version,
      modelType: model.modelType as AIModelConfig['modelType'],
      parameters: model.parameters as Record<string, any>,
      accuracy: model.accuracy || undefined,
      trainedAt: model.trainedAt,
      inputFeatures: [],
      outputLabels: [],
    }));
  }

  /**
   * Update model performance metrics
   */
  static async updateModelAccuracy(id: string, accuracy: number): Promise<void> {
    await prisma.aIModel.update({
      where: { id },
      data: { accuracy },
    });
  }

  /**
   * Get latest model version by name
   */
  static async getLatestModelVersion(name: string): Promise<AIModelConfig | null> {
    const model = await prisma.aIModel.findFirst({
      where: { name },
      orderBy: { trainedAt: 'desc' },
    });

    if (!model) return null;

    return {
      id: model.id,
      name: model.name,
      version: model.version,
      modelType: model.modelType as AIModelConfig['modelType'],
      parameters: model.parameters as Record<string, any>,
      accuracy: model.accuracy || undefined,
      trainedAt: model.trainedAt,
      inputFeatures: [],
      outputLabels: [],
    };
  }

  /**
   * Delete model
   */
  static async deleteModel(id: string): Promise<void> {
    await prisma.aIModel.delete({
      where: { id },
    });
  }

  /**
   * List all models with pagination
   */
  static async listModels(page: number = 1, limit: number = 10): Promise<{
    models: AIModelConfig[];
    total: number;
    page: number;
    totalPages: number;
  }> {
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
        modelType: model.modelType as AIModelConfig['modelType'],
        parameters: model.parameters as Record<string, any>,
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

export default AIModelManager;