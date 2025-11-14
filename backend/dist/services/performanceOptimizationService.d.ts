export interface OptimizationRecommendation {
    id: string;
    category: 'database' | 'cache' | 'api' | 'memory' | 'network';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: string;
    implementation: string;
    estimatedGain: number;
    effort: 'low' | 'medium' | 'high';
    automated: boolean;
}
export interface PerformanceOptimizationReport {
    timestamp: Date;
    overallScore: number;
    recommendations: OptimizationRecommendation[];
    metrics: {
        database: {
            avgQueryTime: number;
            slowQueries: number;
            connectionUtilization: number;
        };
        cache: {
            hitRate: number;
            memoryUsage: number;
            keyCount: number;
        };
        api: {
            avgResponseTime: number;
            errorRate: number;
            throughput: number;
        };
        memory: {
            heapUsage: number;
            gcFrequency: number;
            leakSuspicion: boolean;
        };
    };
    autoOptimizations: string[];
}
export declare class PerformanceOptimizationService {
    private static instance;
    private optimizationHistory;
    private autoOptimizationEnabled;
    static getInstance(): PerformanceOptimizationService;
    generateOptimizationReport(): Promise<PerformanceOptimizationReport>;
    private analyzeDatabasePerformance;
    private analyzeCachePerformance;
    private analyzeAPIPerformance;
    private analyzeMemoryPerformance;
    private analyzeNetworkPerformance;
    private calculateOverallScore;
    private collectPerformanceMetrics;
    private executeAutoOptimizations;
    private optimizeCacheTTL;
    getOptimizationHistory(limit?: number): PerformanceOptimizationReport[];
    analyzePerformanceTrends(): {
        scoreImprovement: number;
        recommendationTrends: Array<{
            category: string;
            count: number;
            trend: 'improving' | 'stable' | 'degrading';
        }>;
        criticalIssues: number;
    };
    setAutoOptimization(enabled: boolean): void;
    cleanup(): void;
}
export declare const performanceOptimizationService: PerformanceOptimizationService;
//# sourceMappingURL=performanceOptimizationService.d.ts.map