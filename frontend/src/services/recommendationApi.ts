import api from './api';
import {
  PersonalizedRecommendations,
  RecommendationEffectiveness,
  RecommendationStats,
  LifestyleSuggestions,
  ScreeningScheduleItem,
  RecommendationGenerationConfig,
} from '../types/recommendations';

export const recommendationApi = {
  // Generate new personalized recommendations
  generateRecommendations: async (config?: Partial<RecommendationGenerationConfig>): Promise<PersonalizedRecommendations> => {
    const response = await api.post('/recommendations/generate', { config });
    return response.data.data;
  },

  // Get latest valid recommendations
  getLatestRecommendations: async (): Promise<PersonalizedRecommendations | null> => {
    try {
      const response = await api.get('/recommendations/latest');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get recommendations history
  getRecommendationsHistory: async (limit?: number): Promise<PersonalizedRecommendations[]> => {
    const response = await api.get('/recommendations/history', {
      params: { limit },
    });
    return response.data.data;
  },

  // Track recommendation implementation
  trackImplementation: async (
    recommendationId: string,
    category: string,
    implemented: boolean,
    implementationDate?: Date
  ): Promise<RecommendationEffectiveness> => {
    const response = await api.post('/recommendations/track-implementation', {
      recommendationId,
      category,
      implemented,
      implementationDate: implementationDate?.toISOString(),
    });
    return response.data.data;
  },

  // Submit user feedback
  submitFeedback: async (
    recommendationId: string,
    category: string,
    rating: number,
    comments?: string
  ): Promise<RecommendationEffectiveness> => {
    const response = await api.post('/recommendations/feedback', {
      recommendationId,
      category,
      rating,
      comments,
    });
    return response.data.data;
  },

  // Update adherence score
  updateAdherence: async (
    recommendationId: string,
    category: string,
    adherenceScore: number
  ): Promise<RecommendationEffectiveness> => {
    const response = await api.post('/recommendations/adherence', {
      recommendationId,
      category,
      adherenceScore,
    });
    return response.data.data;
  },

  // Record measured outcome
  recordOutcome: async (
    recommendationId: string,
    category: string,
    metric: string,
    beforeValue: number,
    afterValue: number
  ): Promise<RecommendationEffectiveness> => {
    const response = await api.post('/recommendations/outcome', {
      recommendationId,
      category,
      metric,
      beforeValue,
      afterValue,
    });
    return response.data.data;
  },

  // Get effectiveness data
  getEffectivenessData: async (category?: string): Promise<RecommendationEffectiveness[]> => {
    const response = await api.get('/recommendations/effectiveness', {
      params: { category },
    });
    return response.data.data;
  },

  // Get recommendation statistics
  getRecommendationStats: async (): Promise<RecommendationStats> => {
    const response = await api.get('/recommendations/stats');
    return response.data.data;
  },

  // Get lifestyle improvement suggestions
  getLifestyleSuggestions: async (): Promise<LifestyleSuggestions> => {
    const response = await api.get('/recommendations/lifestyle-suggestions');
    return response.data.data;
  },

  // Get personalized screening schedule
  getScreeningSchedule: async (): Promise<ScreeningScheduleItem[]> => {
    const response = await api.get('/recommendations/screening-schedule');
    return response.data.data;
  },
};