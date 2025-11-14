"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelVersionManager = exports.ModelStorage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class ModelStorage {
    static async initializeStorage() {
        try {
            await promises_1.default.access(this.MODEL_STORAGE_PATH);
        }
        catch {
            await promises_1.default.mkdir(this.MODEL_STORAGE_PATH, { recursive: true });
        }
    }
    static async saveModel(modelId, modelData, metadata) {
        await this.initializeStorage();
        const modelDir = path_1.default.join(this.MODEL_STORAGE_PATH, modelId);
        await promises_1.default.mkdir(modelDir, { recursive: true });
        const modelFilePath = path_1.default.join(modelDir, 'model.pkl');
        await promises_1.default.writeFile(modelFilePath, modelData);
        const metadataPath = path_1.default.join(modelDir, 'metadata.json');
        await promises_1.default.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        return modelFilePath;
    }
    static async loadModel(modelId) {
        try {
            const modelDir = path_1.default.join(this.MODEL_STORAGE_PATH, modelId);
            const modelFilePath = path_1.default.join(modelDir, 'model.pkl');
            const metadataPath = path_1.default.join(modelDir, 'metadata.json');
            const [modelData, metadataContent] = await Promise.all([
                promises_1.default.readFile(modelFilePath),
                promises_1.default.readFile(metadataPath, 'utf-8'),
            ]);
            const metadata = JSON.parse(metadataContent);
            return { modelData, metadata };
        }
        catch (error) {
            console.error(`Failed to load model ${modelId}:`, error);
            return null;
        }
    }
    static async deleteModel(modelId) {
        try {
            const modelDir = path_1.default.join(this.MODEL_STORAGE_PATH, modelId);
            await promises_1.default.rm(modelDir, { recursive: true, force: true });
            return true;
        }
        catch (error) {
            console.error(`Failed to delete model ${modelId}:`, error);
            return false;
        }
    }
    static async listStoredModels() {
        try {
            await this.initializeStorage();
            const entries = await promises_1.default.readdir(this.MODEL_STORAGE_PATH, { withFileTypes: true });
            return entries
                .filter(entry => entry.isDirectory())
                .map(entry => entry.name);
        }
        catch (error) {
            console.error('Failed to list stored models:', error);
            return [];
        }
    }
    static async getModelStorageInfo(modelId) {
        try {
            const modelDir = path_1.default.join(this.MODEL_STORAGE_PATH, modelId);
            const modelFilePath = path_1.default.join(modelDir, 'model.pkl');
            const stats = await promises_1.default.stat(modelFilePath);
            return {
                size: stats.size,
                lastModified: stats.mtime,
                exists: true,
            };
        }
        catch {
            return {
                size: 0,
                lastModified: new Date(),
                exists: false,
            };
        }
    }
    static async backupModel(modelId, backupName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupId = backupName || `${modelId}_backup_${timestamp}`;
        const sourceDir = path_1.default.join(this.MODEL_STORAGE_PATH, modelId);
        const backupDir = path_1.default.join(this.MODEL_STORAGE_PATH, 'backups', backupId);
        await promises_1.default.mkdir(path_1.default.dirname(backupDir), { recursive: true });
        await promises_1.default.cp(sourceDir, backupDir, { recursive: true });
        return backupId;
    }
    static async restoreModel(modelId, backupId) {
        try {
            const backupDir = path_1.default.join(this.MODEL_STORAGE_PATH, 'backups', backupId);
            const targetDir = path_1.default.join(this.MODEL_STORAGE_PATH, modelId);
            await promises_1.default.rm(targetDir, { recursive: true, force: true });
            await promises_1.default.cp(backupDir, targetDir, { recursive: true });
            return true;
        }
        catch (error) {
            console.error(`Failed to restore model ${modelId} from backup ${backupId}:`, error);
            return false;
        }
    }
}
exports.ModelStorage = ModelStorage;
ModelStorage.MODEL_STORAGE_PATH = process.env.MODEL_STORAGE_PATH || './models';
class ModelVersionManager {
    static async createVersion(modelId, version, changes, performanceImprovement) {
        const versionInfo = {
            version,
            changes,
            performanceImprovement,
            deployedAt: new Date(),
            isActive: true,
        };
        const versionDir = path_1.default.join(ModelStorage['MODEL_STORAGE_PATH'], modelId, 'versions');
        await promises_1.default.mkdir(versionDir, { recursive: true });
        const versionFile = path_1.default.join(versionDir, `${version}.json`);
        await promises_1.default.writeFile(versionFile, JSON.stringify(versionInfo, null, 2));
        return versionInfo;
    }
    static async getVersionHistory(modelId) {
        try {
            const versionDir = path_1.default.join(ModelStorage['MODEL_STORAGE_PATH'], modelId, 'versions');
            const versionFiles = await promises_1.default.readdir(versionDir);
            const versions = [];
            for (const file of versionFiles) {
                if (file.endsWith('.json')) {
                    const versionPath = path_1.default.join(versionDir, file);
                    const versionContent = await promises_1.default.readFile(versionPath, 'utf-8');
                    const versionInfo = JSON.parse(versionContent);
                    versions.push(versionInfo);
                }
            }
            return versions.sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime());
        }
        catch (error) {
            console.error(`Failed to get version history for model ${modelId}:`, error);
            return [];
        }
    }
    static async setActiveVersion(modelId, version) {
        try {
            const versionDir = path_1.default.join(ModelStorage['MODEL_STORAGE_PATH'], modelId, 'versions');
            const versionFiles = await promises_1.default.readdir(versionDir);
            for (const file of versionFiles) {
                if (file.endsWith('.json')) {
                    const versionPath = path_1.default.join(versionDir, file);
                    const versionContent = await promises_1.default.readFile(versionPath, 'utf-8');
                    const versionInfo = JSON.parse(versionContent);
                    versionInfo.isActive = false;
                    await promises_1.default.writeFile(versionPath, JSON.stringify(versionInfo, null, 2));
                }
            }
            const targetVersionPath = path_1.default.join(versionDir, `${version}.json`);
            const targetVersionContent = await promises_1.default.readFile(targetVersionPath, 'utf-8');
            const targetVersionInfo = JSON.parse(targetVersionContent);
            targetVersionInfo.isActive = true;
            await promises_1.default.writeFile(targetVersionPath, JSON.stringify(targetVersionInfo, null, 2));
            return true;
        }
        catch (error) {
            console.error(`Failed to set active version ${version} for model ${modelId}:`, error);
            return false;
        }
    }
}
exports.ModelVersionManager = ModelVersionManager;
exports.default = { ModelStorage, ModelVersionManager };
//# sourceMappingURL=modelStorage.js.map