/**
 * AI Insights API Client
 * 
 * This service handles all API communication for the AI Insights Module,
 * including fetching insights, summaries, trends, health scores, and refresh operations.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import api from './api';

/**
 * TypeScript interfaces matching backend types
 */

export interface AIInsightsResponse {
  summary: AISummary;
  insights: InsightCard[];
  healthScore: HealthScore;
  quickStats: QuickStats;
  recommendations: Recommendation[];
  trends: TrendData[];
  metadata: InsightsMetadata;
}

export interface AISummary {
  text: string;
  period: string;
  lastUpdated: Date;
  confidence: number;
  keyFindings: {
    positive: string[];
    concerning: string[];
  };
}

export interface InsightCard {
  id: string;
  type: 'positive' | 'warning' | 'alert' | 'info';
  priority: 'high' | 'medium' | 'low';
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
  relatedMetrics: string[];
  generatedAt: Date;
}

export interface HealthScore {
  score: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  categoryLabel: string;
  previousScore: number;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  components: {
    bloodPressure: { score: number; weight: number };
    heartRate: { score: number; weight: number };
    sleep: { score: number; weight: number };
    exercise: { score: number; weight: number };
    stress: { score: number; weight: number };
  };
}

export interface QuickStats {
  bloodPressure: { value: string; unit: string };
  heartRate: { value: number; unit: string };
  sleep: { value: number; unit: string };
  exercise: { value: number; unit: string };
}

export interface Recommendation {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'exercise' | 'sleep' | 'stress' | 'nutrition' | 'hydration';
  priority: number;
}

export interface TrendData {
  metric: string;
  label: string;
  currentValue: string;
  previousValue: string;
  change: number;
  changeDirection: 'up' | 'down' | 'stable';
  isImproving: boolean;
  dataPoints: { date: string; value: number }[];
}

export interface InsightsMetadata {
  userId: string;
  generatedAt: Date;
  dataPointsAnalyzed: number;
  analysisPeriod: number;
  cacheExpiry: Date;
}

/**
 * AI Insights API Service Class
 */
class AIInsightsApiService {
  /**
   * Get all AI insights for the current user
   * 
   * Endpoint: GET /api/ai-insights
   * Requirements: 9.1, 9.4
   * 
   * @returns Complete AI insights response with all data
   * @throws Error if request fails or user is not authenticated
   */
  async getAllInsights(): Promise<AIInsightsResponse> {
    try {
      const response = await api.get<AIInsightsResponse>('/ai-insights');
      
      if (response.data) {
        return response.data;
      }

      throw new Error('AI 인사이트 데이터를 불러오는데 실패했습니다');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI 인사이트 조회 실패: ${error.message}`);
      }
      throw new Error('AI 인사이트를 불러오는 중 알 수 없는 오류가 발생했습니다');
    }
  }

  /**
   * Get only the AI summary
   * 
   * Endpoint: GET /api/ai-insights/summary
   * Requirements: 9.2, 9.4
   * 
   * @returns AI-generated health summary
   * @throws Error if request fails
   */
  async getSummary(): Promise<AISummary> {
    try {
      const response = await api.get<AISummary>('/ai-insights/summary');
      
      if (response.data) {
        return response.data;
      }

      throw new Error('AI 요약 데이터를 불러오는데 실패했습니다');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI 요약 조회 실패: ${error.message}`);
      }
      throw new Error('AI 요약을 불러오는 중 알 수 없는 오류가 발생했습니다');
    }
  }

  /**
   * Get trend analysis data for a specific period
   * 
   * Endpoint: GET /api/ai-insights/trends?period={period}
   * Requirements: 9.3, 9.4
   * 
   * @param period - Analysis period in days (7, 30, 90, 365)
   * @returns Array of trend data for all health metrics
   * @throws Error if request fails or period is invalid
   */
  async getTrends(period: number = 30): Promise<TrendData[]> {
    try {
      // Validate period parameter
      const validPeriods = [7, 30, 90, 365];
      if (!validPeriods.includes(period)) {
        console.warn(`Invalid period ${period}, using default 30 days`);
        period = 30;
      }

      const response = await api.get<TrendData[]>(`/ai-insights/trends?period=${period}`);
      
      if (response.data) {
        return response.data;
      }

      throw new Error('트렌드 데이터를 불러오는데 실패했습니다');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`트렌드 분석 조회 실패: ${error.message}`);
      }
      throw new Error('트렌드 분석을 불러오는 중 알 수 없는 오류가 발생했습니다');
    }
  }

  /**
   * Get health score data
   * 
   * Endpoint: GET /api/ai-insights/health-score
   * Requirements: 9.4
   * 
   * @returns Health score with component breakdown
   * @throws Error if request fails
   */
  async getHealthScore(): Promise<HealthScore> {
    try {
      const response = await api.get<HealthScore>('/ai-insights/health-score');
      
      if (response.data) {
        return response.data;
      }

      throw new Error('건강 점수 데이터를 불러오는데 실패했습니다');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`건강 점수 조회 실패: ${error.message}`);
      }
      throw new Error('건강 점수를 불러오는 중 알 수 없는 오류가 발생했습니다');
    }
  }

  /**
   * Force refresh insights (bypass cache)
   * 
   * Endpoint: POST /api/ai-insights/refresh
   * Requirements: 9.4
   * 
   * @returns Newly generated AI insights
   * @throws Error if request fails
   */
  async refreshInsights(): Promise<AIInsightsResponse> {
    try {
      const response = await api.post<AIInsightsResponse>('/ai-insights/refresh');
      
      if (response.data) {
        return response.data;
      }

      throw new Error('AI 인사이트 새로고침에 실패했습니다');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`인사이트 새로고침 실패: ${error.message}`);
      }
      throw new Error('인사이트를 새로고침하는 중 알 수 없는 오류가 발생했습니다');
    }
  }
}

// Export singleton instance
export const aiInsightsApi = new AIInsightsApiService();
export default aiInsightsApi;
