/**
 * AI Insights Service Unit Tests
 * 
 * Tests core functionality of the AI Insights Service including:
 * - Health Score Calculator
 * - Insight Generator
 * - Trend Analyzer
 * - Summary Generator
 * - Recommendation Engine
 * - Cache Management
 */

import { HealthData, AIInsightsResponse } from '../types/aiInsights';

// Create mock functions
const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockDeleteMany = jest.fn();
const mockFindMany = jest.fn();

// Mock Prisma client before importing the service
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    aIInsightCache: {
      findFirst: (...args: any[]) => mockFindFirst(...args),
      create: (...args: any[]) => mockCreate(...args),
      deleteMany: (...args: any[]) => mockDeleteMany(...args),
    },
    healthRecord: {
      findMany: (...args: any[]) => mockFindMany(...args),
    },
  },
}));

import { AIInsightsService } from '../services/aiInsightsService';

describe('AIInsightsService', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock health records
  const createMockHealthRecords = (count: number, type: string, data: any) => {
    const records = [];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      records.push({
        id: `record-${i}`,
        userId: mockUserId,
        recordType: type,
        data: data,
        recordedDate: date,
        createdAt: date,
        vitalSigns: [],
      });
    }
    return records;
  };

  describe('Health Score Calculator - Different Scenarios', () => {
    it('should calculate excellent health score for optimal metrics', async () => {
      // Mock excellent health data
      const vitalSignRecords = createMockHealthRecords(7, 'vital_sign', {
        type: 'blood_pressure',
        value: { systolic: 115, diastolic: 75 },
      });
      
      const heartRateRecords = createMockHealthRecords(7, 'vital_sign', {
        type: 'heart_rate',
        value: 65,
      });

      const sleepRecords = createMockHealthRecords(7, 'health_journal', {
        sleep: { duration: 8, quality: 9 },
        exercise: [{ type: 'Running', duration: 50, intensity: 'moderate' }],
        stress: { level: 2 },
      });

      mockFindFirst.mockResolvedValue(null); // No cache
      mockFindMany
        .mockResolvedValueOnce([...vitalSignRecords, ...heartRateRecords]) // current vital signs
        .mockResolvedValueOnce(sleepRecords) // current health journals
        .mockResolvedValueOnce([...vitalSignRecords, ...heartRateRecords]) // previous vital signs
        .mockResolvedValueOnce(sleepRecords); // previous health journals
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.healthScore.score).toBeGreaterThanOrEqual(75);
      expect(result.healthScore.category).toMatch(/excellent|good/);
      expect(result.healthScore.components).toBeDefined();
    });

    it('should calculate poor health score for concerning metrics', async () => {
      // Mock poor health data
      const vitalSignRecords = createMockHealthRecords(7, 'vital_sign', {
        type: 'blood_pressure',
        value: { systolic: 155, diastolic: 98 },
      });
      
      const heartRateRecords = createMockHealthRecords(7, 'vital_sign', {
        type: 'heart_rate',
        value: 110,
      });

      const sleepRecords = createMockHealthRecords(7, 'health_journal', {
        sleep: { duration: 4, quality: 3 },
        exercise: [],
        stress: { level: 9 },
      });

      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([...vitalSignRecords, ...heartRateRecords])
        .mockResolvedValueOnce(sleepRecords)
        .mockResolvedValueOnce([...vitalSignRecords, ...heartRateRecords])
        .mockResolvedValueOnce(sleepRecords);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.healthScore.score).toBeLessThan(60);
      expect(result.healthScore.category).toMatch(/poor|fair/);
    });

    it('should include all component scores with correct weights', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.healthScore.components.bloodPressure.weight).toBe(0.25);
      expect(result.healthScore.components.heartRate.weight).toBe(0.20);
      expect(result.healthScore.components.sleep.weight).toBe(0.25);
      expect(result.healthScore.components.exercise.weight).toBe(0.20);
      expect(result.healthScore.components.stress.weight).toBe(0.10);
    });
  });

  describe('Insight Generator - Type and Priority', () => {
    it('should generate alert insights for high blood pressure', async () => {
      const vitalSignRecords = createMockHealthRecords(5, 'vital_sign', {
        type: 'blood_pressure',
        value: { systolic: 150, diastolic: 95 },
      });

      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce(vitalSignRecords)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(vitalSignRecords)
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      const bpAlert = result.insights.find(i => 
        i.relatedMetrics.includes('blood_pressure') && i.type === 'alert'
      );
      
      expect(bpAlert).toBeDefined();
      expect(bpAlert?.priority).toBe('high');
    });

    it('should generate positive insights for good metrics', async () => {
      const vitalSignRecords = createMockHealthRecords(5, 'vital_sign', {
        type: 'blood_pressure',
        value: { systolic: 118, diastolic: 78 },
      });

      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce(vitalSignRecords)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(vitalSignRecords)
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      const positiveInsights = result.insights.filter(i => i.type === 'positive');
      expect(positiveInsights.length).toBeGreaterThan(0);
    });

    it('should sort insights by priority (high > medium > low)', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      const priorities = result.insights.map(i => i.priority);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      
      for (let i = 1; i < priorities.length; i++) {
        expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(priorityOrder[priorities[i - 1]]);
      }
    });
  });

  describe('Trend Analyzer - Period Analysis', () => {
    it('should analyze trends for 7-day period', async () => {
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const trends = await AIInsightsService.analyzeTrends(mockUserId, 7);

      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBeGreaterThan(0);
    });

    it('should analyze trends for 30-day period', async () => {
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const trends = await AIInsightsService.analyzeTrends(mockUserId, 30);

      expect(Array.isArray(trends)).toBe(true);
    });

    it('should include change direction in trends', async () => {
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const trends = await AIInsightsService.analyzeTrends(mockUserId, 30);

      trends.forEach(trend => {
        expect(['up', 'down', 'stable']).toContain(trend.changeDirection);
        expect(typeof trend.isImproving).toBe('boolean');
      });
    });
  });

  describe('Summary Generator', () => {
    it('should generate summary with key findings', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.summary.text).toBeDefined();
      expect(result.summary.text.length).toBeGreaterThan(0);
      expect(result.summary.keyFindings).toBeDefined();
      expect(Array.isArray(result.summary.keyFindings.positive)).toBe(true);
      expect(Array.isArray(result.summary.keyFindings.concerning)).toBe(true);
    });

    it('should include analysis period', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.summary.period).toBe('최근 7일');
    });

    it('should calculate confidence score', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.summary.confidence).toBeGreaterThanOrEqual(0);
      expect(result.summary.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Recommendation Engine', () => {
    it('should generate 3-5 recommendations', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
      expect(result.recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should prioritize recommendations correctly', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      const priorities = result.recommendations.map(r => r.priority);
      
      for (let i = 1; i < priorities.length; i++) {
        expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i - 1]);
      }
    });

    it('should include different recommendation categories', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      const categories = result.recommendations.map(r => r.category);
      const uniqueCategories = new Set(categories);
      
      expect(uniqueCategories.size).toBeGreaterThan(1);
    });
  });

  describe('Cache Management', () => {
    it('should return cached insights when valid cache exists', async () => {
      const cachedData = {
        summary: {
          text: 'Cached summary',
          period: '최근 7일',
          lastUpdated: new Date().toISOString(),
          confidence: 0.8,
          keyFindings: { positive: [], concerning: [] },
        },
        insights: [],
        healthScore: {
          score: 75,
          category: 'good',
          categoryLabel: '양호',
          previousScore: 70,
          change: 5,
          changeDirection: 'up',
          components: {
            bloodPressure: { score: 80, weight: 0.25 },
            heartRate: { score: 75, weight: 0.20 },
            sleep: { score: 70, weight: 0.25 },
            exercise: { score: 65, weight: 0.20 },
            stress: { score: 85, weight: 0.10 },
          },
        },
        quickStats: {
          bloodPressure: { value: '120/80', unit: 'mmHg' },
          heartRate: { value: 70, unit: 'bpm' },
          sleep: { value: 8, unit: '시간' },
          exercise: { value: 150, unit: '분/주' },
        },
        recommendations: [],
        trends: [],
        metadata: {
          userId: mockUserId,
          generatedAt: new Date().toISOString(),
          dataPointsAnalyzed: 10,
          analysisPeriod: 30,
          cacheExpiry: new Date(Date.now() + 3600000).toISOString(),
        },
      };

      mockFindFirst.mockResolvedValue({
        id: 'cache-id',
        userId: mockUserId,
        insightsData: cachedData,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      });

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.summary.text).toBe('Cached summary');
      expect(mockFindMany).not.toHaveBeenCalled();
    });

    it('should generate new insights when cache is expired', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockResolvedValue({});

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(mockFindMany).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should clear cache successfully', async () => {
      mockDeleteMany.mockResolvedValue({ count: 1 });

      await AIInsightsService.clearCache(mockUserId);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
    });
  });

  describe('Insufficient Data Handling', () => {
    it('should return insufficient data response when data is minimal', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([]) // No vital signs
        .mockResolvedValueOnce([]); // No health journals

      const result = await AIInsightsService.getAIInsights(mockUserId);

      expect(result.summary.text).toContain('데이터가 충분하지 않아');
      expect(result.healthScore.score).toBe(0);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    it('should include encouragement message for insufficient data', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await AIInsightsService.getAIInsights(mockUserId);

      const dataInsight = result.insights.find(i => i.id === 'insufficient-data');
      expect(dataInsight).toBeDefined();
      expect(dataInsight?.title).toContain('데이터가 필요');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockFindFirst.mockRejectedValue(new Error('Database error'));

      await expect(AIInsightsService.getAIInsights(mockUserId)).rejects.toThrow();
    });

    it('should continue even if cache save fails', async () => {
      mockFindFirst.mockResolvedValue(null);
      mockFindMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockCreate.mockRejectedValue(new Error('Cache save failed'));

      // Should not throw even if cache save fails
      const result = await AIInsightsService.getAIInsights(mockUserId);
      expect(result).toBeDefined();
    });
  });
});
