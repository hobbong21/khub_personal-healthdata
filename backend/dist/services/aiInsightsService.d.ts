import { AIInsightsResponse, TrendData } from '../types/aiInsights';
export declare class AIInsightsService {
    private static readonly CACHE_TTL_SECONDS;
    private static readonly MIN_DATA_POINTS;
    private static cacheHits;
    private static cacheMisses;
    static getAIInsights(userId: string): Promise<AIInsightsResponse>;
    private static getCachedInsights;
    private static cacheInsights;
    static clearCache(userId: string): Promise<void>;
    private static fetchHealthData;
    private static countDataPoints;
    private static generateInsufficientDataResponse;
    private static calculateHealthScore;
    private static calculateBloodPressureScore;
    private static calculateHeartRateScore;
    private static calculateSleepScore;
    private static calculateExerciseScore;
    private static calculateStressScore;
    private static filterDataByDateRange;
    private static generateInsights;
    private static analyzeBloodPressure;
    private static analyzeHeartRate;
    private static analyzeSleep;
    private static analyzeExercise;
    private static analyzeStress;
    private static generateSummary;
    private static generateRecommendations;
    static analyzeTrends(userId: string, period: number): Promise<TrendData[]>;
    private static analyzeBPTrend;
    private static analyzeHRTrend;
    private static analyzeSleepTrend;
    private static analyzeExerciseTrend;
    private static analyzeStressTrend;
    private static getQuickStats;
    private static logCacheHitRate;
    private static logPerformanceMetrics;
    static getCacheStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        total: number;
    };
    static resetCacheStats(): void;
}
//# sourceMappingURL=aiInsightsService.d.ts.map