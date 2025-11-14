export interface QueryOptimization {
    tableName: string;
    columnName: string;
    indexType: 'btree' | 'hash' | 'gin' | 'gist';
    estimatedImprovement: number;
    priority: 'high' | 'medium' | 'low';
}
export interface QueryPlan {
    query: string;
    executionTime: number;
    cost: number;
    rows: number;
    plan: any;
}
export declare class QueryOptimizationService {
    static analyzeQueryPatterns(): Promise<QueryOptimization[]>;
    private static getTableStatistics;
    private static getColumnStatistics;
    private static recommendIndexType;
    private static calculateImprovement;
    private static calculatePriority;
    static analyzeQueryPlan(query: string): Promise<QueryPlan | null>;
    static identifySlowQueries(): Promise<Array<{
        query: string;
        avgTime: number;
        calls: number;
        totalTime: number;
    }>>;
    static analyzeIndexUsage(): Promise<Array<{
        tableName: string;
        indexName: string;
        scans: number;
        tuplesRead: number;
        tuplesReturned: number;
        efficiency: number;
    }>>;
    static createRecommendedIndexes(optimizations: QueryOptimization[], maxIndexes?: number): Promise<Array<{
        indexName: string;
        created: boolean;
        error?: string;
    }>>;
    static identifyUnusedIndexes(): Promise<Array<{
        tableName: string;
        indexName: string;
        size: string;
        lastUsed: Date | null;
    }>>;
    static benchmarkQuery(query: string, iterations?: number): Promise<{
        avgTime: number;
        minTime: number;
        maxTime: number;
        stdDev: number;
    }>;
    static generatePerformanceReport(): Promise<{
        timestamp: Date;
        queryOptimizations: QueryOptimization[];
        slowQueries: Array<{
            query: string;
            avgTime: number;
            calls: number;
            totalTime: number;
        }>;
        indexUsage: Array<{
            tableName: string;
            indexName: string;
            scans: number;
            efficiency: number;
        }>;
        unusedIndexes: Array<{
            tableName: string;
            indexName: string;
            size: string;
        }>;
        recommendations: string[];
    }>;
}
//# sourceMappingURL=queryOptimizationService.d.ts.map