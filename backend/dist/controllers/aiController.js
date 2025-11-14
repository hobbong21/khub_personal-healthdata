"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const aiService_1 = require("../services/aiService");
const AIModel_1 = require("../models/AIModel");
class AIController {
    static async generateRiskPrediction(req, res) {
        try {
            const { userId } = req.params;
            const { predictionType } = req.body;
            if (!predictionType || !['cardiovascular', 'diabetes', 'general_health'].includes(predictionType)) {
                return res.status(400).json({
                    error: 'Invalid prediction type. Must be one of: cardiovascular, diabetes, general_health'
                });
            }
            const prediction = await aiService_1.AIService.generateHealthRiskPrediction(userId, predictionType);
            res.json({
                success: true,
                data: prediction
            });
        }
        catch (error) {
            console.error('Error generating risk prediction:', error);
            res.status(500).json({
                error: 'Failed to generate risk prediction',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async analyzeDeterioration(req, res) {
        try {
            const { userId } = req.params;
            const analysis = await aiService_1.AIService.analyzeHealthDeterioration(userId);
            res.json({
                success: true,
                data: analysis
            });
        }
        catch (error) {
            console.error('Error analyzing health deterioration:', error);
            res.status(500).json({
                error: 'Failed to analyze health deterioration',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async analyzeRiskFactors(req, res) {
        try {
            const { userId } = req.params;
            const analysis = await aiService_1.AIService.performRiskFactorAnalysis(userId);
            res.json({
                success: true,
                data: analysis
            });
        }
        catch (error) {
            console.error('Error analyzing risk factors:', error);
            res.status(500).json({
                error: 'Failed to analyze risk factors',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getRecommendations(req, res) {
        try {
            const { userId } = req.params;
            const recommendations = await aiService_1.AIService.getPersonalizedRecommendations(userId);
            res.json({
                success: true,
                data: recommendations
            });
        }
        catch (error) {
            console.error('Error getting recommendations:', error);
            res.status(500).json({
                error: 'Failed to get recommendations',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getPredictionsHistory(req, res) {
        try {
            const { userId } = req.params;
            const { predictionType, limit } = req.query;
            const predictions = await aiService_1.AIService.getUserPredictionsHistory(userId, predictionType, limit ? parseInt(limit) : 10);
            res.json({
                success: true,
                data: predictions
            });
        }
        catch (error) {
            console.error('Error getting predictions history:', error);
            res.status(500).json({
                error: 'Failed to get predictions history',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getPredictionStats(req, res) {
        try {
            const { userId } = req.params;
            const stats = await aiService_1.AIService.getUserPredictionStats(userId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Error getting prediction stats:', error);
            res.status(500).json({
                error: 'Failed to get prediction statistics',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getPredictionById(req, res) {
        try {
            const { predictionId } = req.params;
            const prediction = await aiService_1.AIService.getUserPredictionsHistory('', undefined, 1);
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
        }
        catch (error) {
            console.error('Error getting prediction:', error);
            res.status(500).json({
                error: 'Failed to get prediction',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getAvailableModels(req, res) {
        try {
            const models = await aiService_1.AIService.getAvailableModels();
            res.json({
                success: true,
                data: models
            });
        }
        catch (error) {
            console.error('Error getting available models:', error);
            res.status(500).json({
                error: 'Failed to get available models',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async createModel(req, res) {
        try {
            const { name, version, modelType, parameters, accuracy, inputFeatures, outputLabels, description } = req.body;
            if (!name || !version || !modelType) {
                return res.status(400).json({
                    error: 'Missing required fields: name, version, modelType'
                });
            }
            const model = await AIModel_1.AIModelManager.createModel({
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
        }
        catch (error) {
            console.error('Error creating model:', error);
            res.status(500).json({
                error: 'Failed to create model',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async updateModelPerformance(req, res) {
        try {
            const { modelId } = req.params;
            const { accuracy } = req.body;
            if (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 1) {
                return res.status(400).json({
                    error: 'Accuracy must be a number between 0 and 1'
                });
            }
            await aiService_1.AIService.updateModelPerformance(modelId, accuracy);
            res.json({
                success: true,
                message: 'Model performance updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating model performance:', error);
            res.status(500).json({
                error: 'Failed to update model performance',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async getHealthInsights(req, res) {
        try {
            const { userId } = req.params;
            const [cardiovascularRisk, diabetesRisk, deteriorationAnalysis, riskFactorAnalysis, recommendations] = await Promise.allSettled([
                aiService_1.AIService.generateHealthRiskPrediction(userId, 'cardiovascular'),
                aiService_1.AIService.generateHealthRiskPrediction(userId, 'diabetes'),
                aiService_1.AIService.analyzeHealthDeterioration(userId),
                aiService_1.AIService.performRiskFactorAnalysis(userId),
                aiService_1.AIService.getPersonalizedRecommendations(userId)
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
        }
        catch (error) {
            console.error('Error getting health insights:', error);
            res.status(500).json({
                error: 'Failed to get health insights',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async batchPrediction(req, res) {
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
            const predictions = await Promise.allSettled(predictionTypes.map(type => aiService_1.AIService.generateHealthRiskPrediction(userId, type)));
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
        }
        catch (error) {
            console.error('Error processing batch prediction:', error);
            res.status(500).json({
                error: 'Failed to process batch prediction',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.AIController = AIController;
exports.default = AIController;
//# sourceMappingURL=aiController.js.map