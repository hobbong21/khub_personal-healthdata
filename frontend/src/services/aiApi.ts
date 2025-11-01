import api from './api';
import { 
  PredictionResult, 
  HealthInsights, 
  PredictionStats, 
  AIModelConfig,
  RiskFactorAnalysis 
} from '../types/ai';

export interface GenerateRiskPredictionRequest {
  predictionType: 'cardiovascular' | 'diabetes' | 'general_health';
}

export interface BatchPredictionRequest {
  predictionTypes: ('cardiovascular' | 'diabetes' | 'general_health')[];
}

export interface CreateModelRequest {
  name: string;
  version: string;
  modelType: 'classification' | 'regression' | 'clustering' | 'neural_network';
  parameters?: Record<string, any>;
  accuracy?: number;
  inputFeatures?: string[];
  outputLabels?: string[];
  description?: string;
}

class AIApiService {
  /**
   * Generate health risk prediction
   */
  async generateRiskPrediction(
    userId: string, 
    request: GenerateRiskPredictionRequest
  ): Promise<PredictionResult> {
    const response = await api.post(`/ai/users/${userId}/predictions/risk`, request);
    return response.data.data;
  }

  /**
   * Analyze health deterioration patterns
   */
  async analyzeHealthDeterioration(userId: string): Promise<PredictionResult> {
    const response = await api.post(`/ai/users/${userId}/analysis/deterioration`);
    return response.data.data;
  }

  /**
   * Perform risk factor analysis
   */
  async analyzeRiskFactors(userId: string): Promise<PredictionResult> {
    const response = await api.post(`/ai/users/${userId}/analysis/risk-factors`);
    return response.data.data;
  }

  /**
   * Get personalized health recommendations
   */
  async getPersonalizedRecommendations(userId: string): Promise<PredictionResult> {
    const response = await api.get(`/ai/users/${userId}/recommendations`);
    return response.data.data;
  }

  /**
   * Get comprehensive health insights
   */
  async getHealthInsights(userId: string): Promise<HealthInsights> {
    const response = await api.get(`/ai/users/${userId}/insights`);
    return response.data.data;
  }

  /**
   * Get user predictions history
   */
  async getPredictionsHistory(
    userId: string,
    predictionType?: string,
    limit?: number
  ): Promise<PredictionResult[]> {
    const params = new URLSearchParams();
    if (predictionType) params.append('predictionType', predictionType);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/ai/users/${userId}/predictions?${params}`);
    return response.data.data;
  }

  /**
   * Get prediction statistics
   */
  async getPredictionStats(userId: string): Promise<PredictionStats> {
    const response = await api.get(`/ai/users/${userId}/predictions/stats`);
    return response.data.data;
  }

  /**
   * Get specific prediction by ID
   */
  async getPredictionById(predictionId: string): Promise<PredictionResult> {
    const response = await api.get(`/ai/predictions/${predictionId}`);
    return response.data.data;
  }

  /**
   * Batch prediction request
   */
  async batchPrediction(
    userId: string, 
    request: BatchPredictionRequest
  ): Promise<Array<{
    predictionType: string;
    success: boolean;
    data: PredictionResult | null;
    error: string | null;
  }>> {
    const response = await api.post(`/ai/users/${userId}/predictions/batch`, request);
    return response.data.data;
  }

  /**
   * Get available AI models
   */
  async getAvailableModels(): Promise<AIModelConfig[]> {
    const response = await api.get('/ai/models');
    return response.data.data;
  }

  /**
   * Create new AI model
   */
  async createModel(request: CreateModelRequest): Promise<AIModelConfig> {
    const response = await api.post('/ai/models', request);
    return response.data.data;
  }

  /**
   * Update model performance
   */
  async updateModelPerformance(modelId: string, accuracy: number): Promise<void> {
    await api.patch(`/ai/models/${modelId}/performance`, { accuracy });
  }

  /**
   * Quick health assessment
   */
  async quickHealthAssessment(
    userId: string,
    options: {
      includeRiskFactors?: boolean;
      includeRecommendations?: boolean;
    } = {}
  ): Promise<any> {
    const response = await api.post(`/ai/users/${userId}/assessment/quick`, options);
    return response.data.data;
  }

  /**
   * Get health trends analysis
   */
  async getHealthTrends(
    userId: string,
    timeframe: '1_month' | '3_months' | '6_months' | '1_year' = '3_months',
    metrics?: string[]
  ): Promise<any> {
    const params = new URLSearchParams();
    params.append('timeframe', timeframe);
    if (metrics && metrics.length > 0) {
      params.append('metrics', metrics.join(','));
    }

    const response = await api.get(`/ai/users/${userId}/trends?${params}`);
    return response.data.data;
  }
}

export const aiApi = new AIApiService();
export default aiApi;