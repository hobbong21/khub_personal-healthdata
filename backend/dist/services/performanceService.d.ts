export interface PerformanceMetrics {
    queryTime: number;
    cacheHitRate: number;
    memoryUsage: NodeJS.MemoryUsage;
    activeConnections: number;
    responseTime: number;
}
export interface QueryOptimizationResult {
    originalQuery: string;
    optimizedQuery: string;
    performanceGain: number;
    recommendations: string[];
}
export declare class PerformanceService {
    private static queryMetrics;
    private static cacheStats;
    static measureQuery<T>(queryName: string, queryFn: () => Promise<T>): Promise<T>;
    private static recordQueryMetric;
    static recordCacheHit(): void;
    static recordCacheMiss(): void;
    static getPerformanceMetrics(): Promise<PerformanceMetrics>;
    private static getActiveConnections;
    private static getAverageResponseTime;
    static getSlowQueries(threshold?: number): Array<{
        queryName: string;
        avgTime: number;
        maxTime: number;
        count: number;
    }>;
    static analyzeIndexOptimization(): Promise<QueryOptimizationResult[]>;
    private static estimateIndexPerformanceGain;
    static analyzeCacheOptimization(): Promise<{
        currentHitRate: number;
        recommendations: string[];
        suggestedTTL: Record<string, number>;
    }>;
    static analyzeMemoryOptimization(): {
        currentUsage: NodeJS.MemoryUsage;
        recommendations: string[];
        criticalLevel: boolean;
    };
    static optimizeConnectionPool(): Promise<{
        currentConnections: number;
        maxConnections: number;
        recommendations: string[];
    }>;
    static analyzeAPIPerformance(): {
        slowEndpoints: Array<{
            endpoint: string;
            avgResponseTime: number;
            recommendations: string[];
        }>;
        overallRecommendations: string[];
    };
    static resetMetrics(): void;
    static generatePerformanceReport(): Promise<{
        timestamp: Date;
        metrics: PerformanceMetrics;
        slowQueries: Array<{
            queryName: string;
            avgTime: number;
            maxTime: number;
            count: number;
        }>;
        indexRecommendations: QueryOptimizationResult[];
        cacheAnalysis: {
            currentHitRate: number;
            recommendations: string[];
            suggestedTTL: Record<string, number>;
        };
        memoryAnalysis: {
            currentUsage: NodeJS.MemoryUsage;
            recommendations: string[];
            criticalLevel: boolean;
        };
        connectionAnalysis: {
            currentConnections: number;
            maxConnections: number;
            recommendations: string[];
        };
        apiAnalysis: {
            slowEndpoints: Array<{
                endpoint: string;
                avgResponseTime: number;
                recommendations: string[];
            }>;
            overallRecommendations: string[];
        };
    }>;
}
//# sourceMappingURL=performanceService.d.ts.map