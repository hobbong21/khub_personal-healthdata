import { AIModelConfig, ModelVersionInfo } from '../types/ai';
export declare class ModelStorage {
    private static readonly MODEL_STORAGE_PATH;
    static initializeStorage(): Promise<void>;
    static saveModel(modelId: string, modelData: Buffer | string, metadata: AIModelConfig): Promise<string>;
    static loadModel(modelId: string): Promise<{
        modelData: Buffer;
        metadata: AIModelConfig;
    } | null>;
    static deleteModel(modelId: string): Promise<boolean>;
    static listStoredModels(): Promise<string[]>;
    static getModelStorageInfo(modelId: string): Promise<{
        size: number;
        lastModified: Date;
        exists: boolean;
    }>;
    static backupModel(modelId: string, backupName?: string): Promise<string>;
    static restoreModel(modelId: string, backupId: string): Promise<boolean>;
}
export declare class ModelVersionManager {
    static createVersion(modelId: string, version: string, changes: string[], performanceImprovement: number): Promise<ModelVersionInfo>;
    static getVersionHistory(modelId: string): Promise<ModelVersionInfo[]>;
    static setActiveVersion(modelId: string, version: string): Promise<boolean>;
}
declare const _default: {
    ModelStorage: typeof ModelStorage;
    ModelVersionManager: typeof ModelVersionManager;
};
export default _default;
//# sourceMappingURL=modelStorage.d.ts.map