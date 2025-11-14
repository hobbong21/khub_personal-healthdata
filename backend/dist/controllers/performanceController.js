"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformanceMetrics = getPerformanceMetrics;
exports.getSlowQueries = getSlowQueries;
exports.getIndexOptimizations = getIndexOptimizations;
exports.getCacheAnalysis = getCacheAnalysis;
exports.getMemoryAnalysis = getMemoryAnalysis;
exports.getConnectionPoolAnalysis = getConnectionPoolAnalysis;
exports.getAPIPerformanceAnalysis = getAPIPerformanceAnalysis;
exports.generatePerformanceReport = generatePerformanceReport;
exports.analyzeQueryPatterns = analyzeQueryPatterns;
exports.analyzeIndexUsage = analyzeIndexUsage;
exports.getUnusedIndexes = getUnusedIndexes;
exports.benchmarkQuery = benchmarkQuery;
exports.optimizeCache = optimizeCache;
exports.resetPerformanceMetrics = resetPerformanceMetrics;
exports.createRecommendedIndexes = createRecommendedIndexes;
const performanceService_1 = require("../services/performanceService");
const queryOptimizationService_1 = require("../services/queryOptimizationService");
const redis_1 = require("../config/redis");
async function getPerformanceMetrics(req, res) {
    try {
        const metrics = await performanceService_1.PerformanceService.getPerformanceMetrics();
        res.json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '성능 메트릭 조회에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'PERFORMANCE_METRICS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getSlowQueries(req, res) {
    try {
        const threshold = parseInt(req.query.threshold) || 100;
        const slowQueries = performanceService_1.PerformanceService.getSlowQueries(threshold);
        res.json({
            success: true,
            data: {
                threshold,
                slowQueries
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '느린 쿼리 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'SLOW_QUERY_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getIndexOptimizations(req, res) {
    try {
        const optimizations = await performanceService_1.PerformanceService.analyzeIndexOptimization();
        res.json({
            success: true,
            data: optimizations
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '인덱스 최적화 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'INDEX_OPTIMIZATION_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getCacheAnalysis(req, res) {
    try {
        const [cacheOptimization, cacheStats] = await Promise.all([
            performanceService_1.PerformanceService.analyzeCacheOptimization(),
            redis_1.redisService.getCacheStats()
        ]);
        res.json({
            success: true,
            data: {
                optimization: cacheOptimization,
                stats: cacheStats
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '캐시 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'CACHE_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getMemoryAnalysis(req, res) {
    try {
        const memoryAnalysis = performanceService_1.PerformanceService.analyzeMemoryOptimization();
        res.json({
            success: true,
            data: memoryAnalysis
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '메모리 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'MEMORY_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getConnectionPoolAnalysis(req, res) {
    try {
        const connectionAnalysis = await performanceService_1.PerformanceService.optimizeConnectionPool();
        res.json({
            success: true,
            data: connectionAnalysis
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '연결 풀 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'CONNECTION_POOL_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getAPIPerformanceAnalysis(req, res) {
    try {
        const apiAnalysis = performanceService_1.PerformanceService.analyzeAPIPerformance();
        res.json({
            success: true,
            data: apiAnalysis
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'API 성능 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'API_PERFORMANCE_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function generatePerformanceReport(req, res) {
    try {
        const [performanceReport, queryReport] = await Promise.all([
            performanceService_1.PerformanceService.generatePerformanceReport(),
            queryOptimizationService_1.QueryOptimizationService.generatePerformanceReport()
        ]);
        const combinedReport = {
            ...performanceReport,
            database: queryReport
        };
        res.json({
            success: true,
            data: combinedReport
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '성능 보고서 생성에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'PERFORMANCE_REPORT_FAILED',
                message: errorMessage
            }
        });
    }
}
async function analyzeQueryPatterns(req, res) {
    try {
        const patterns = await queryOptimizationService_1.QueryOptimizationService.analyzeQueryPatterns();
        res.json({
            success: true,
            data: patterns
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '쿼리 패턴 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'QUERY_PATTERN_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function analyzeIndexUsage(req, res) {
    try {
        const indexUsage = await queryOptimizationService_1.QueryOptimizationService.analyzeIndexUsage();
        res.json({
            success: true,
            data: indexUsage
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '인덱스 사용률 분석에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'INDEX_USAGE_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getUnusedIndexes(req, res) {
    try {
        const unusedIndexes = await queryOptimizationService_1.QueryOptimizationService.identifyUnusedIndexes();
        res.json({
            success: true,
            data: unusedIndexes
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '사용되지 않는 인덱스 조회에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'UNUSED_INDEXES_FAILED',
                message: errorMessage
            }
        });
    }
}
async function benchmarkQuery(req, res) {
    try {
        const { query, iterations = 10 } = req.body;
        if (!query) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_QUERY',
                    message: '벤치마크할 쿼리를 제공해주세요'
                }
            });
            return;
        }
        const benchmark = await queryOptimizationService_1.QueryOptimizationService.benchmarkQuery(query, iterations);
        res.json({
            success: true,
            data: {
                query,
                iterations,
                results: benchmark
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '쿼리 벤치마크에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'QUERY_BENCHMARK_FAILED',
                message: errorMessage
            }
        });
    }
}
async function optimizeCache(req, res) {
    try {
        await redis_1.redisService.optimizeMemory();
        res.json({
            success: true,
            message: '캐시 최적화가 완료되었습니다'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '캐시 최적화에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'CACHE_OPTIMIZATION_FAILED',
                message: errorMessage
            }
        });
    }
}
async function resetPerformanceMetrics(req, res) {
    try {
        performanceService_1.PerformanceService.resetMetrics();
        res.json({
            success: true,
            message: '성능 메트릭이 초기화되었습니다'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '성능 메트릭 초기화에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'METRICS_RESET_FAILED',
                message: errorMessage
            }
        });
    }
}
async function createRecommendedIndexes(req, res) {
    try {
        const { maxIndexes = 5 } = req.body;
        const optimizations = await queryOptimizationService_1.QueryOptimizationService.analyzeQueryPatterns();
        const results = await queryOptimizationService_1.QueryOptimizationService.createRecommendedIndexes(optimizations, maxIndexes);
        res.json({
            success: true,
            data: {
                created: results.filter(r => r.created).length,
                failed: results.filter(r => !r.created).length,
                results
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '자동 인덱스 생성에 실패했습니다';
        res.status(500).json({
            success: false,
            error: {
                code: 'AUTO_INDEX_CREATION_FAILED',
                message: errorMessage
            }
        });
    }
}
//# sourceMappingURL=performanceController.js.map