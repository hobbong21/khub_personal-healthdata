"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalizedRecommendations = getPersonalizedRecommendations;
exports.analyzeHealthData = analyzeHealthData;
exports.getHealthRiskPrediction = getHealthRiskPrediction;
const aiService_1 = require("../services/aiService");
async function getPersonalizedRecommendations(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const recommendations = await aiService_1.AIService.getPersonalizedRecommendations(req.user.id);
        res.json({ success: true, data: recommendations });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'RECOMMENDATION_ERROR', message: errorMessage } });
    }
}
async function analyzeHealthData(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const analysis = await aiService_1.AIService.performRiskFactorAnalysis(req.user.id);
        res.json({ success: true, data: analysis });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ANALYSIS_ERROR', message: errorMessage } });
    }
}
async function getHealthRiskPrediction(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const prediction = await aiService_1.AIService.generateHealthRiskPrediction(req.user.id, 'general_health');
        res.json({ success: true, data: prediction });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'PREDICTION_ERROR', message: errorMessage } });
    }
}
//# sourceMappingURL=aiInsightsController.js.map