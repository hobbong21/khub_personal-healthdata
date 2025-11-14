import { AIModelConfig } from '../types/ai';
export declare class AIModelManager {
    static createModel(config: Omit<AIModelConfig, 'id'>): Promise<AIModelConfig>;
    static getModelById(id: string): Promise<AIModelConfig | null>;
    static getModelsByType(modelType: string): Promise<AIModelConfig[]>;
    static updateModelAccuracy(id: string, accuracy: number): Promise<void>;
    static getLatestModelVersion(name: string): Promise<AIModelConfig | null>;
    static deleteModel(id: string): Promise<void>;
    static listModels(page?: number, limit?: number): Promise<{
        models: AIModelConfig[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
export default AIModelManager;
//# sourceMappingURL=AIModel.d.ts.map