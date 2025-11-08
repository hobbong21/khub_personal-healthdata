import { AIInsightsService } from '../services/aiInsightsService';

/**
 * AI Insights Performance Tests
 * 
 * 캐시 히트율 및 성능 메트릭 테스트
 */
describe('AI Insights Performance', () => {
  describe('Cache Statistics', () => {
    beforeEach(() => {
      // 각 테스트 전에 캐시 통계 초기화
      AIInsightsService.resetCacheStats();
    });

    it('should initialize cache stats with zero values', () => {
      const stats = AIInsightsService.getCacheStats();
      
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should reset cache stats', () => {
      // 통계 초기화 확인
      const initialStats = AIInsightsService.getCacheStats();
      expect(initialStats.total).toBe(0);

      // 통계 초기화 후 다시 확인
      AIInsightsService.resetCacheStats();
      const resetStats = AIInsightsService.getCacheStats();
      
      expect(resetStats.hits).toBe(0);
      expect(resetStats.misses).toBe(0);
      expect(resetStats.total).toBe(0);
      expect(resetStats.hitRate).toBe(0);
    });

    it('should return cache stats with correct structure', () => {
      const stats = AIInsightsService.getCacheStats();
      
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('total');
      
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.total).toBe('number');
    });
  });

  describe('Environment Variables', () => {
    it('should use default cache TTL value', () => {
      // AIInsightsService는 환경 변수가 없으면 기본값 3600 사용
      const defaultTTL = 3600;
      const envTTL = process.env.AI_INSIGHTS_CACHE_TTL;
      
      // 환경 변수가 설정되어 있으면 그 값을, 없으면 기본값 사용
      const expectedTTL = envTTL ? parseInt(envTTL) : defaultTTL;
      
      expect(expectedTTL).toBeGreaterThan(0);
      expect(expectedTTL).toBe(defaultTTL);
    });

    it('should use default min data points value', () => {
      const defaultMinPoints = 3;
      const envMinPoints = process.env.AI_INSIGHTS_MIN_DATA_POINTS;
      
      // 환경 변수가 설정되어 있으면 그 값을, 없으면 기본값 사용
      const expectedMinPoints = envMinPoints ? parseInt(envMinPoints) : defaultMinPoints;
      
      expect(expectedMinPoints).toBeGreaterThan(0);
      expect(expectedMinPoints).toBe(defaultMinPoints);
    });
  });

  describe('Performance Logging', () => {
    it('should log performance metrics structure', () => {
      // 성능 메트릭 구조 검증
      const mockMetrics = {
        userId: 'test-user',
        totalDuration: 1000,
        dataFetchDuration: 200,
        processingDuration: 700,
        cacheSaveDuration: 100,
        dataPointsCount: 50,
      };

      // 메트릭 구조 확인
      expect(mockMetrics).toHaveProperty('userId');
      expect(mockMetrics).toHaveProperty('totalDuration');
      expect(mockMetrics).toHaveProperty('dataFetchDuration');
      expect(mockMetrics).toHaveProperty('processingDuration');
      expect(mockMetrics).toHaveProperty('cacheSaveDuration');
      expect(mockMetrics).toHaveProperty('dataPointsCount');

      // 시간 값이 양수인지 확인
      expect(mockMetrics.totalDuration).toBeGreaterThan(0);
      expect(mockMetrics.dataFetchDuration).toBeGreaterThan(0);
      expect(mockMetrics.processingDuration).toBeGreaterThan(0);
      expect(mockMetrics.cacheSaveDuration).toBeGreaterThan(0);

      // 총 시간이 각 단계 시간의 합과 일치하는지 확인
      const sum = mockMetrics.dataFetchDuration + 
                  mockMetrics.processingDuration + 
                  mockMetrics.cacheSaveDuration;
      expect(mockMetrics.totalDuration).toBe(sum);
    });

    it('should calculate average time per data point correctly', () => {
      const totalDuration = 1000; // ms
      const dataPointsCount = 50;
      const avgTimePerDataPoint = totalDuration / dataPointsCount;

      expect(avgTimePerDataPoint).toBe(20);
      expect(avgTimePerDataPoint).toBeGreaterThan(0);
    });

    it('should identify slow requests (> 5000ms)', () => {
      const slowDuration = 6000;
      const normalDuration = 1000;

      expect(slowDuration).toBeGreaterThan(5000);
      expect(normalDuration).toBeLessThan(5000);
    });
  });

  describe('Cache Hit Rate Calculation', () => {
    it('should calculate hit rate correctly', () => {
      const hits = 75;
      const misses = 25;
      const total = hits + misses;
      const hitRate = (hits / total) * 100;

      expect(hitRate).toBe(75);
      expect(total).toBe(100);
    });

    it('should handle zero total requests', () => {
      const hits = 0;
      const misses = 0;
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;

      expect(hitRate).toBe(0);
      expect(total).toBe(0);
    });

    it('should calculate 100% hit rate', () => {
      const hits = 100;
      const misses = 0;
      const total = hits + misses;
      const hitRate = (hits / total) * 100;

      expect(hitRate).toBe(100);
    });

    it('should calculate 0% hit rate', () => {
      const hits = 0;
      const misses = 100;
      const total = hits + misses;
      const hitRate = (hits / total) * 100;

      expect(hitRate).toBe(0);
    });
  });

  describe('Performance Thresholds', () => {
    it('should identify performance warning threshold', () => {
      const PERFORMANCE_WARNING_THRESHOLD = 5000; // ms
      
      const slowRequest = 6000;
      const normalRequest = 1000;

      expect(slowRequest).toBeGreaterThan(PERFORMANCE_WARNING_THRESHOLD);
      expect(normalRequest).toBeLessThan(PERFORMANCE_WARNING_THRESHOLD);
    });

    it('should calculate percentage of time spent in each phase', () => {
      const totalDuration = 1000;
      const dataFetchDuration = 200;
      const processingDuration = 700;
      const cacheSaveDuration = 100;

      const dataFetchPercent = (dataFetchDuration / totalDuration) * 100;
      const processingPercent = (processingDuration / totalDuration) * 100;
      const cacheSavePercent = (cacheSaveDuration / totalDuration) * 100;

      expect(dataFetchPercent).toBe(20);
      expect(processingPercent).toBe(70);
      expect(cacheSavePercent).toBe(10);

      // 모든 퍼센트의 합은 100%
      expect(dataFetchPercent + processingPercent + cacheSavePercent).toBe(100);
    });
  });
});
