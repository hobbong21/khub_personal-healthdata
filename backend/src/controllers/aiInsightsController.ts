import { Request, Response } from 'express';
import { AIService } from '../services/aiService';

export async function getPersonalizedRecommendations(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const recommendations = await AIService.getPersonalizedRecommendations(req.user.id);
        res.json({ success: true, data: recommendations });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'RECOMMENDATION_ERROR', message: errorMessage } });
    }
}

export async function analyzeHealthData(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const analysis = await AIService.performRiskFactorAnalysis(req.user.id);
        res.json({ success: true, data: analysis });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'ANALYSIS_ERROR', message: errorMessage } });
    }
}

export async function getHealthRiskPrediction(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        const prediction = await AIService.generateHealthRiskPrediction(req.user.id, 'general_health');
        res.json({ success: true, data: prediction });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'PREDICTION_ERROR', message: errorMessage } });
    }
}
