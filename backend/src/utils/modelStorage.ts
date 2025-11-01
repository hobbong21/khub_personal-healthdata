import fs from 'fs/promises';
import path from 'path';
import { AIModelConfig, ModelVersionInfo } from '../types/ai';

export class ModelStorage {
  private static readonly MODEL_STORAGE_PATH = process.env.MODEL_STORAGE_PATH || './models';
  
  /**
   * Initialize model storage directory
   */
  static async initializeStorage(): Promise<void> {
    try {
      await fs.access(this.MODEL_STORAGE_PATH);
    } catch {
      await fs.mkdir(this.MODEL_STORAGE_PATH, { recursive: true });
    }
  }

  /**
   * Save model file to storage
   */
  static async saveModel(
    modelId: string,
    modelData: Buffer | string,
    metadata: AIModelConfig
  ): Promise<string> {
    await this.initializeStorage();
    
    const modelDir = path.join(this.MODEL_STORAGE_PATH, modelId);
    await fs.mkdir(modelDir, { recursive: true });
    
    // Save model file
    const modelFilePath = path.join(modelDir, 'model.pkl');
    await fs.writeFile(modelFilePath, modelData);
    
    // Save metadata
    const metadataPath = path.join(modelDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    return modelFilePath;
  }

  /**
   * Load model from storage
   */
  static async loadModel(modelId: string): Promise<{
    modelData: Buffer;
    metadata: AIModelConfig;
  } | null> {
    try {
      const modelDir = path.join(this.MODEL_STORAGE_PATH, modelId);
      
      const modelFilePath = path.join(modelDir, 'model.pkl');
      const metadataPath = path.join(modelDir, 'metadata.json');
      
      const [modelData, metadataContent] = await Promise.all([
        fs.readFile(modelFilePath),
        fs.readFile(metadataPath, 'utf-8'),
      ]);
      
      const metadata = JSON.parse(metadataContent) as AIModelConfig;
      
      return { modelData, metadata };
    } catch (error) {
      console.error(`Failed to load model ${modelId}:`, error);
      return null;
    }
  }

  /**
   * Delete model from storage
   */
  static async deleteModel(modelId: string): Promise<boolean> {
    try {
      const modelDir = path.join(this.MODEL_STORAGE_PATH, modelId);
      await fs.rm(modelDir, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error(`Failed to delete model ${modelId}:`, error);
      return false;
    }
  }

  /**
   * List all stored models
   */
  static async listStoredModels(): Promise<string[]> {
    try {
      await this.initializeStorage();
      const entries = await fs.readdir(this.MODEL_STORAGE_PATH, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      console.error('Failed to list stored models:', error);
      return [];
    }
  }

  /**
   * Get model storage info
   */
  static async getModelStorageInfo(modelId: string): Promise<{
    size: number;
    lastModified: Date;
    exists: boolean;
  }> {
    try {
      const modelDir = path.join(this.MODEL_STORAGE_PATH, modelId);
      const modelFilePath = path.join(modelDir, 'model.pkl');
      
      const stats = await fs.stat(modelFilePath);
      
      return {
        size: stats.size,
        lastModified: stats.mtime,
        exists: true,
      };
    } catch {
      return {
        size: 0,
        lastModified: new Date(),
        exists: false,
      };
    }
  }

  /**
   * Create model backup
   */
  static async backupModel(modelId: string, backupName?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = backupName || `${modelId}_backup_${timestamp}`;
    
    const sourceDir = path.join(this.MODEL_STORAGE_PATH, modelId);
    const backupDir = path.join(this.MODEL_STORAGE_PATH, 'backups', backupId);
    
    await fs.mkdir(path.dirname(backupDir), { recursive: true });
    await fs.cp(sourceDir, backupDir, { recursive: true });
    
    return backupId;
  }

  /**
   * Restore model from backup
   */
  static async restoreModel(modelId: string, backupId: string): Promise<boolean> {
    try {
      const backupDir = path.join(this.MODEL_STORAGE_PATH, 'backups', backupId);
      const targetDir = path.join(this.MODEL_STORAGE_PATH, modelId);
      
      // Remove existing model
      await fs.rm(targetDir, { recursive: true, force: true });
      
      // Restore from backup
      await fs.cp(backupDir, targetDir, { recursive: true });
      
      return true;
    } catch (error) {
      console.error(`Failed to restore model ${modelId} from backup ${backupId}:`, error);
      return false;
    }
  }
}

export class ModelVersionManager {
  /**
   * Create new model version
   */
  static async createVersion(
    modelId: string,
    version: string,
    changes: string[],
    performanceImprovement: number
  ): Promise<ModelVersionInfo> {
    const versionInfo: ModelVersionInfo = {
      version,
      changes,
      performanceImprovement,
      deployedAt: new Date(),
      isActive: true,
    };

    // Save version info
    const versionDir = path.join(ModelStorage['MODEL_STORAGE_PATH'], modelId, 'versions');
    await fs.mkdir(versionDir, { recursive: true });
    
    const versionFile = path.join(versionDir, `${version}.json`);
    await fs.writeFile(versionFile, JSON.stringify(versionInfo, null, 2));
    
    return versionInfo;
  }

  /**
   * Get version history for a model
   */
  static async getVersionHistory(modelId: string): Promise<ModelVersionInfo[]> {
    try {
      const versionDir = path.join(ModelStorage['MODEL_STORAGE_PATH'], modelId, 'versions');
      const versionFiles = await fs.readdir(versionDir);
      
      const versions: ModelVersionInfo[] = [];
      
      for (const file of versionFiles) {
        if (file.endsWith('.json')) {
          const versionPath = path.join(versionDir, file);
          const versionContent = await fs.readFile(versionPath, 'utf-8');
          const versionInfo = JSON.parse(versionContent) as ModelVersionInfo;
          versions.push(versionInfo);
        }
      }
      
      return versions.sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime());
    } catch (error) {
      console.error(`Failed to get version history for model ${modelId}:`, error);
      return [];
    }
  }

  /**
   * Set active version
   */
  static async setActiveVersion(modelId: string, version: string): Promise<boolean> {
    try {
      const versionDir = path.join(ModelStorage['MODEL_STORAGE_PATH'], modelId, 'versions');
      const versionFiles = await fs.readdir(versionDir);
      
      // Deactivate all versions
      for (const file of versionFiles) {
        if (file.endsWith('.json')) {
          const versionPath = path.join(versionDir, file);
          const versionContent = await fs.readFile(versionPath, 'utf-8');
          const versionInfo = JSON.parse(versionContent) as ModelVersionInfo;
          versionInfo.isActive = false;
          await fs.writeFile(versionPath, JSON.stringify(versionInfo, null, 2));
        }
      }
      
      // Activate target version
      const targetVersionPath = path.join(versionDir, `${version}.json`);
      const targetVersionContent = await fs.readFile(targetVersionPath, 'utf-8');
      const targetVersionInfo = JSON.parse(targetVersionContent) as ModelVersionInfo;
      targetVersionInfo.isActive = true;
      await fs.writeFile(targetVersionPath, JSON.stringify(targetVersionInfo, null, 2));
      
      return true;
    } catch (error) {
      console.error(`Failed to set active version ${version} for model ${modelId}:`, error);
      return false;
    }
  }
}

export default { ModelStorage, ModelVersionManager };