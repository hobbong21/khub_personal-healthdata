import { Request, Response } from 'express';
export declare function getPerformanceMetrics(req: Request, res: Response): Promise<void>;
export declare function getSlowQueries(req: Request, res: Response): Promise<void>;
export declare function getIndexOptimizations(req: Request, res: Response): Promise<void>;
export declare function getCacheAnalysis(req: Request, res: Response): Promise<void>;
export declare function getMemoryAnalysis(req: Request, res: Response): Promise<void>;
export declare function getConnectionPoolAnalysis(req: Request, res: Response): Promise<void>;
export declare function getAPIPerformanceAnalysis(req: Request, res: Response): Promise<void>;
export declare function generatePerformanceReport(req: Request, res: Response): Promise<void>;
export declare function analyzeQueryPatterns(req: Request, res: Response): Promise<void>;
export declare function analyzeIndexUsage(req: Request, res: Response): Promise<void>;
export declare function getUnusedIndexes(req: Request, res: Response): Promise<void>;
export declare function benchmarkQuery(req: Request, res: Response): Promise<void>;
export declare function optimizeCache(req: Request, res: Response): Promise<void>;
export declare function resetPerformanceMetrics(req: Request, res: Response): Promise<void>;
export declare function createRecommendedIndexes(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=performanceController.d.ts.map