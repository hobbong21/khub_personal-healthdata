import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { AIModelManager } from '../models/AIModel';

export class AIController {
  /**
   * Generate health risk prediction
   */
  static async generateRiskPrediction(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { predictionType } = req.body;

      if (!predictionType || !['cardiovascular', 'diabetes', 'general_health'].includes(predictionType)) {
        return res.status(400).json({
          error: 'Invalid prediction type. Must be one of: cardiovascular, diabetes, general_health'
        });
      }

      const prediction = await AIService.generateHealthRiskPrediction(userId, predictionType);

      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      console.error('Error generating risk prediction:', error);
      res.status(500).json({
        error: 'Failed to generate risk prediction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Analyze health deterioration patterns
   */
  static async analyzeDeterioration(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const analysis = await AIService.analyzeHealthDeterioration(userId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing health deterioration:', error);
      res.status(500).json({
        error: 'Failed to analyze health deterioration',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Perform risk factor analysis
   */
  static async analyzeRiskFactors(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const analysis = await AIService.performRiskFactorAnalysis(userId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing risk factors:', error);
      res.status(500).json({
        error: 'Failed to analyze risk factors',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get personalized health recommendations
   */
  static async getRecommendations(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const recommendations = await AIService.getPersonalizedRecommendations(userId);

      res.json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      res.status(500).json({
        error: 'Failed to get recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get user predictions history
   */
  static async getPredictionsHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { predictionType, limit } = req.query;

      const predictions = await AIService.getUserPredictionsHistory(
        userId,
        predictionType as string,
        limit ? parseInt(limit as string) : 10
      );

      res.json({
        success: true,
        data: predictions
      });
    } catch (error) {
      console.error('Error getting predictions history:', error);
      res.status(500).json({
        error: 'Failed to get predictions history',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get prediction statistics
   */
  static async getPredictionStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const stats = await AIService.getUserPredictionStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting prediction stats:', error);
      res.status(500).json({
        error: 'Failed to get prediction statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get specific prediction by ID
   */
  static async getPredictionById(req: Request, res: Response) {
    try {
      const { predictionId } = req.params;

      const prediction = await AIService.getUserPredictionsHistory('', undefined, 1);
      const targetPrediction = prediction.find(p => p.id === predictionId);

      if (!targetPrediction) {
        return res.status(404).json({
          error: 'Prediction not found'
        });
      }

      res.json({
        success: true,
        data: targetPrediction
      });
    } catch (error) {
      console.error('Error getting prediction:', error);
      res.status(500).json({
        error: 'Failed to get prediction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get available AI models
   */
  static async getAvailableModels(req: Request, res: Response) {
    try {
      const models = await AIService.getAvailableModels();

      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      console.error('Error getting available models:', error);
      res.status(500).json({
        error: 'Failed to get available models',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new AI model
   */
  static async createModel(req: Request, res: Response) {
    try {
      const {
        name,
        version,
        modelType,
        parameters,
        accuracy,
        inputFeatures,
        outputLabels,
        description
      } = req.body;

      if (!name || !version || !modelType) {
        return res.status(400).json({
          error: 'Missing required fields: name, version, modelType'
        });
      }

      const model = await AIModelManager.createModel({
        name,
        version,
        modelType,
        parameters: parameters || {},
        accuracy,
        trainedAt: new Date(),
        inputFeatures: inputFeatures || [],
        outputLabels: outputLabels || [],
        description
      });

      res.status(201).json({
        success: true,
        data: model
      });
    } catch (error) {
      console.error('Error creating model:', error);
      res.status(500).json({
        error: 'Failed to create model',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update model performance
   */
  static async updateModelPerformance(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const { accuracy } = req.body;

      if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 1) {
        return res.status(400).json({
          error: 'Accuracy must be a number between 0 and 1'
        });
      }

      await AIService.updateModelPerformance(modelId, accuracy);

      res.json({
        success: true,
        message: 'Model performance updated successfully'
      });
    } catch (error) {
      console.error('Error updating model performance:', error);
      res.status(500).json({
        error: 'Failed to update model performance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get comprehensive health insights
   */
  static async getHealthInsights(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Get multiple types of predictions and analysis
      const [
        cardiovascularRisk,
        diabetesRisk,
        deteriorationAnalysis,
        riskFactorAnalysis,
        recommendations
      ] = await Promise.allSettled([
        AIService.generateHealthRiskPrediction(userId, 'cardiovascular'),
        AIService.generateHealthRiskPrediction(userId, 'diabetes'),
        AIService.analyzeHealthDeterioration(userId),
        AIService.performRiskFactorAnalysis(userId),
        AIService.getPersonalizedRecommendations(userId)
      ]);

      const insights = {
        cardiovascularRisk: cardiovascularRisk.status === 'fulfilled' ? cardiovascularRisk.value : null,
        diabetesRisk: diabetesRisk.status === 'fulfilled' ? diabetesRisk.value : null,
        deteriorationAnalysis: deteriorationAnalysis.status === 'fulfilled' ? deteriorationAnalysis.value : null,
        riskFactorAnalysis: riskFactorAnalysis.status === 'fulfilled' ? riskFactorAnalysis.value : null,
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
        generatedAt: new Date()
      };

      res.json({
        success: true,
        data: insights
      });
    } catch (error) {
      console.error('Error getting health insights:', error);
      res.status(500).json({
        error: 'Failed to get health insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Batch prediction request
   */
  static async batchPrediction(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { predictionTypes } = req.body;

      if (!Array.isArray(predictionTypes) || predictionTypes.length === 0) {
        return res.status(400).json({
          error: 'predictionTypes must be a non-empty array'
        });
      }

      const validTypes = ['cardiovascular', 'diabetes', 'general_health'];
      const invalidTypes = predictionTypes.filter(type => !validTypes.includes(type));
      
      if (invalidTypes.length > 0) {
        return res.status(400).json({
          error: `Invalid prediction types: ${invalidTypes.join(', ')}`
        });
      }

      const predictions = await Promise.allSettled(
        predictionTypes.map(type => 
          AIService.generateHealthRiskPrediction(userId, type)
        )
      );

      const results = predictions.map((result, index) => ({
        predictionType: predictionTypes[index],
        success: result.status === 'fulfilled',
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason?.message : null
      }));

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error('Error processing batch prediction:', error);
      res.status(500).json({
        error: 'Failed to process batch prediction',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default AIController;