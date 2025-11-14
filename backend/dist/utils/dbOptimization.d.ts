import { PrismaClient } from '@prisma/client';
export declare const createOptimizedPrismaClient: () => PrismaClient;
export declare class QueryOptimizer {
    private prisma;
    constructor(prisma: PrismaClient);
    paginateQuery<T>(model: any, where?: any, page?: number, limit?: number, orderBy?: any, include?: any): Promise<{
        data: T[];
        pagination: any;
    }>;
    batchProcess<T>(items: T[], processor: (batch: T[]) => Promise<any>, batchSize?: number): Promise<any[]>;
    loadWithRelations(model: any, id: string, relations: string[]): Promise<any>;
    getAggregatedData(model: any, groupBy: string[], aggregations: any, where?: any): Promise<any[]>;
}
export declare const indexOptimizationGuide: {
    recommendations: {
        table: string;
        columns: string[];
        reason: string;
    }[];
    compositeIndexes: {
        table: string;
        columns: string[];
        reason: string;
    }[];
};
export declare class QueryPerformanceMonitor {
    private slowQueries;
    private readonly SLOW_QUERY_THRESHOLD;
    logSlowQuery(query: string, duration: number): void;
    getSlowQueries(): Array<{
        query: string;
        duration: number;
        timestamp: Date;
    }>;
    clearSlowQueries(): void;
    generatePerformanceReport(): any;
}
//# sourceMappingURL=dbOptimization.d.ts.map