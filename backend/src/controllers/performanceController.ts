import { Request, Response } from 'express';
import { PerformanceService } from '../services/performanceService';
import { QueryOptimizationService } from '../services/queryOptimizationService';
import { redisService } from '../config/redis';

/**
 * 성능 메트릭 조회 (요구사항: 성능 관련 모든 요구사항)
 */
export async function getPerformanceMetrics(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await PerformanceService.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
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

/**
 * 느린 쿼리 분석 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function getSlowQueries(req: Request, res: Response): Promise<void> {
  try {
    const threshold = parseInt(req.query.threshold as string) || 100;
    const slowQueries = PerformanceService.getSlowQueries(threshold);
    
    res.json({
      success: true,
      data: {
        threshold,
        slowQueries
      }
    });
  } catch (error) {
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

/**
 * 인덱스 최적화 제안 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function getIndexOptimizations(req: Request, res: Response): Promise<void> {
  try {
    const optimizations = await PerformanceService.analyzeIndexOptimization();
    
    res.json({
      success: true,
      data: optimizations
    });
  } catch (error) {
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

/**
 * 캐시 분석 (요구사항: Redis 캐싱 전략 구현)
 */
export async function getCacheAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const [cacheOptimization, cacheStats] = await Promise.all([
      PerformanceService.analyzeCacheOptimization(),
      redisService.getCacheStats()
    ]);
    
    res.json({
      success: true,
      data: {
        optimization: cacheOptimization,
        stats: cacheStats
      }
    });
  } catch (error) {
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

/**
 * 메모리 사용량 분석 (요구사항: API 응답 시간 개선)
 */
export async function getMemoryAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const memoryAnalysis = PerformanceService.analyzeMemoryOptimization();
    
    res.json({
      success: true,
      data: memoryAnalysis
    });
  } catch (error) {
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

/**
 * 데이터베이스 연결 풀 분석 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function getConnectionPoolAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const connectionAnalysis = await PerformanceService.optimizeConnectionPool();
    
    res.json({
      success: true,
      data: connectionAnalysis
    });
  } catch (error) {
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

/**
 * API 성능 분석 (요구사항: API 응답 시간 개선)
 */
export async function getAPIPerformanceAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const apiAnalysis = PerformanceService.analyzeAPIPerformance();
    
    res.json({
      success: true,
      data: apiAnalysis
    });
  } catch (error) {
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

/**
 * 종합 성능 보고서 생성 (요구사항: 성능 관련 모든 요구사항)
 */
export async function generatePerformanceReport(req: Request, res: Response): Promise<void> {
  try {
    const [performanceReport, queryReport] = await Promise.all([
      PerformanceService.generatePerformanceReport(),
      QueryOptimizationService.generatePerformanceReport()
    ]);
    
    const combinedReport = {
      ...performanceReport,
      database: queryReport
    };
    
    res.json({
      success: true,
      data: combinedReport
    });
  } catch (error) {
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

/**
 * 쿼리 패턴 분석 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function analyzeQueryPatterns(req: Request, res: Response): Promise<void> {
  try {
    const patterns = await QueryOptimizationService.analyzeQueryPatterns();
    
    res.json({
      success: true,
      data: patterns
    });
  } catch (error) {
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

/**
 * 인덱스 사용률 분석 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function analyzeIndexUsage(req: Request, res: Response): Promise<void> {
  try {
    const indexUsage = await QueryOptimizationService.analyzeIndexUsage();
    
    res.json({
      success: true,
      data: indexUsage
    });
  } catch (error) {
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

/**
 * 사용되지 않는 인덱스 조회 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function getUnusedIndexes(req: Request, res: Response): Promise<void> {
  try {
    const unusedIndexes = await QueryOptimizationService.identifyUnusedIndexes();
    
    res.json({
      success: true,
      data: unusedIndexes
    });
  } catch (error) {
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

/**
 * 쿼리 벤치마크 실행 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function benchmarkQuery(req: Request, res: Response): Promise<void> {
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
    
    const benchmark = await QueryOptimizationService.benchmarkQuery(query, iterations);
    
    res.json({
      success: true,
      data: {
        query,
        iterations,
        results: benchmark
      }
    });
  } catch (error) {
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

/**
 * 캐시 최적화 실행 (요구사항: Redis 캐싱 전략 구현)
 */
export async function optimizeCache(req: Request, res: Response): Promise<void> {
  try {
    await redisService.optimizeMemory();
    
    res.json({
      success: true,
      message: '캐시 최적화가 완료되었습니다'
    });
  } catch (error) {
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

/**
 * 성능 메트릭 초기화 (요구사항: 성능 관련 모든 요구사항)
 */
export async function resetPerformanceMetrics(req: Request, res: Response): Promise<void> {
  try {
    PerformanceService.resetMetrics();
    
    res.json({
      success: true,
      message: '성능 메트릭이 초기화되었습니다'
    });
  } catch (error) {
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

/**
 * 자동 인덱스 생성 (요구사항: 데이터베이스 쿼리 최적화)
 */
export async function createRecommendedIndexes(req: Request, res: Response): Promise<void> {
  try {
    const { maxIndexes = 5 } = req.body;
    
    const optimizations = await QueryOptimizationService.analyzeQueryPatterns();
    const results = await QueryOptimizationService.createRecommendedIndexes(optimizations, maxIndexes);
    
    res.json({
      success: true,
      data: {
        created: results.filter(r => r.created).length,
        failed: results.filter(r => !r.created).length,
        results
      }
    });
  } catch (error) {
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