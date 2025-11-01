import prisma from '../config/database';
import { redisService } from '../config/redis';
import { performance } from 'perf_hooks';

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

export class PerformanceService {
  private static queryMetrics = new Map<string, number[]>();
  private static cacheStats = { hits: 0, misses: 0 };

  /**
   * 데이터베이스 쿼리 성능 모니터링
   */
  static async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 쿼리 성능 메트릭 저장
      this.recordQueryMetric(queryName, duration);
      
      // 느린 쿼리 로깅 (100ms 이상)
      if (duration > 100) {
        console.warn(`Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`Query failed: ${queryName} after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  /**
   * 쿼리 메트릭 기록
   */
  private static recordQueryMetric(queryName: string, duration: number): void {
    if (!this.queryMetrics.has(queryName)) {
      this.queryMetrics.set(queryName, []);
    }
    
    const metrics = this.queryMetrics.get(queryName)!;
    metrics.push(duration);
    
    // 최근 100개 메트릭만 유지
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * 캐시 통계 업데이트
   */
  static recordCacheHit(): void {
    this.cacheStats.hits++;
  }

  static recordCacheMiss(): void {
    this.cacheStats.misses++;
  }

  /**
   * 성능 메트릭 조회
   */
  static async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const memoryUsage = process.memoryUsage();
    const totalCacheRequests = this.cacheStats.hits + this.cacheStats.misses;
    const cacheHitRate = totalCacheRequests > 0 
      ? (this.cacheStats.hits / totalCacheRequests) * 100 
      : 0;

    // 평균 쿼리 시간 계산
    const allQueryTimes: number[] = [];
    this.queryMetrics.forEach(times => allQueryTimes.push(...times));
    const avgQueryTime = allQueryTimes.length > 0 
      ? allQueryTimes.reduce((sum, time) => sum + time, 0) / allQueryTimes.length 
      : 0;

    return {
      queryTime: avgQueryTime,
      cacheHitRate,
      memoryUsage,
      activeConnections: await this.getActiveConnections(),
      responseTime: await this.getAverageResponseTime()
    };
  }

  /**
   * 활성 데이터베이스 연결 수 조회
   */
  private static async getActiveConnections(): Promise<number> {
    try {
      const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `;
      return Number(result[0]?.count || 0);
    } catch (error) {
      console.error('Failed to get active connections:', error);
      return 0;
    }
  }

  /**
   * 평균 응답 시간 계산
   */
  private static async getAverageResponseTime(): Promise<number> {
    const allTimes: number[] = [];
    this.queryMetrics.forEach(times => allTimes.push(...times));
    
    if (allTimes.length === 0) return 0;
    
    return allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
  }

  /**
   * 느린 쿼리 분석
   */
  static getSlowQueries(threshold: number = 100): Array<{
    queryName: string;
    avgTime: number;
    maxTime: number;
    count: number;
  }> {
    const slowQueries: Array<{
      queryName: string;
      avgTime: number;
      maxTime: number;
      count: number;
    }> = [];

    this.queryMetrics.forEach((times, queryName) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      if (avgTime > threshold) {
        slowQueries.push({
          queryName,
          avgTime,
          maxTime,
          count: times.length
        });
      }
    });

    return slowQueries.sort((a, b) => b.avgTime - a.avgTime);
  }

  /**
   * 데이터베이스 인덱스 최적화 제안
   */
  static async analyzeIndexOptimization(): Promise<QueryOptimizationResult[]> {
    try {
      // 자주 사용되는 쿼리 패턴 분석
      const indexAnalysis = await prisma.$queryRaw<Array<{
        schemaname: string;
        tablename: string;
        attname: string;
        n_distinct: number;
        correlation: number;
      }>>`
        SELECT 
          schemaname,
          tablename,
          attname,
          n_distinct,
          correlation
        FROM pg_stats 
        WHERE schemaname = 'public'
        AND n_distinct > 100
        ORDER BY n_distinct DESC
        LIMIT 20
      `;

      const recommendations: QueryOptimizationResult[] = [];

      for (const stat of indexAnalysis) {
        if (stat.n_distinct > 1000 && Math.abs(stat.correlation) < 0.1) {
          recommendations.push({
            originalQuery: `SELECT * FROM ${stat.tablename} WHERE ${stat.attname} = ?`,
            optimizedQuery: `CREATE INDEX IF NOT EXISTS idx_${stat.tablename}_${stat.attname} ON ${stat.tablename}(${stat.attname})`,
            performanceGain: this.estimateIndexPerformanceGain(stat.n_distinct),
            recommendations: [
              `테이블 ${stat.tablename}의 ${stat.attname} 컬럼에 인덱스 생성 권장`,
              `예상 성능 향상: ${this.estimateIndexPerformanceGain(stat.n_distinct)}%`,
              `고유값 수: ${stat.n_distinct}`
            ]
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Index analysis failed:', error);
      return [];
    }
  }

  /**
   * 인덱스 성능 향상 추정
   */
  private static estimateIndexPerformanceGain(distinctValues: number): number {
    // 고유값이 많을수록 인덱스 효과가 큼
    if (distinctValues > 10000) return 80;
    if (distinctValues > 1000) return 60;
    if (distinctValues > 100) return 40;
    return 20;
  }

  /**
   * 캐시 최적화 제안
   */
  static async analyzeCacheOptimization(): Promise<{
    currentHitRate: number;
    recommendations: string[];
    suggestedTTL: Record<string, number>;
  }> {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    const currentHitRate = totalRequests > 0 
      ? (this.cacheStats.hits / totalRequests) * 100 
      : 0;

    const recommendations: string[] = [];
    const suggestedTTL: Record<string, number> = {};

    if (currentHitRate < 50) {
      recommendations.push('캐시 적중률이 낮습니다. TTL 시간을 늘리거나 캐시 전략을 재검토하세요.');
    }

    if (currentHitRate < 30) {
      recommendations.push('캐시 키 전략을 재설계하고 더 세분화된 캐시 정책을 적용하세요.');
    }

    // 데이터 타입별 권장 TTL
    suggestedTTL['dashboard'] = currentHitRate > 70 ? 900 : 300; // 15분 또는 5분
    suggestedTTL['trends'] = 1800; // 30분
    suggestedTTL['health_summary'] = 600; // 10분
    suggestedTTL['medical_records'] = 3600; // 1시간
    suggestedTTL['genomic_data'] = 86400; // 24시간

    return {
      currentHitRate,
      recommendations,
      suggestedTTL
    };
  }

  /**
   * 메모리 사용량 최적화 제안
   */
  static analyzeMemoryOptimization(): {
    currentUsage: NodeJS.MemoryUsage;
    recommendations: string[];
    criticalLevel: boolean;
  } {
    const memoryUsage = process.memoryUsage();
    const recommendations: string[] = [];
    
    // MB 단위로 변환
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const externalMB = memoryUsage.external / 1024 / 1024;
    
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;
    const criticalLevel = heapUsagePercent > 85;

    if (heapUsagePercent > 80) {
      recommendations.push('힙 메모리 사용률이 높습니다. 메모리 누수를 확인하세요.');
    }

    if (externalMB > 100) {
      recommendations.push('외부 메모리 사용량이 높습니다. 버퍼 사용을 최적화하세요.');
    }

    if (memoryUsage.arrayBuffers > 50 * 1024 * 1024) { // 50MB
      recommendations.push('ArrayBuffer 사용량이 높습니다. 대용량 데이터 처리를 최적화하세요.');
    }

    if (recommendations.length === 0) {
      recommendations.push('메모리 사용량이 정상 범위입니다.');
    }

    return {
      currentUsage: memoryUsage,
      recommendations,
      criticalLevel
    };
  }

  /**
   * 데이터베이스 연결 풀 최적화
   */
  static async optimizeConnectionPool(): Promise<{
    currentConnections: number;
    maxConnections: number;
    recommendations: string[];
  }> {
    try {
      const connectionStats = await prisma.$queryRaw<Array<{
        total_connections: bigint;
        active_connections: bigint;
        idle_connections: bigint;
        max_connections: bigint;
      }>>`
        SELECT 
          (SELECT count(*) FROM pg_stat_activity) as total_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
          (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      `;

      const stats = connectionStats[0];
      const totalConnections = Number(stats.total_connections);
      const activeConnections = Number(stats.active_connections);
      const maxConnections = Number(stats.max_connections);
      
      const connectionUsagePercent = (totalConnections / maxConnections) * 100;
      const recommendations: string[] = [];

      if (connectionUsagePercent > 80) {
        recommendations.push('데이터베이스 연결 사용률이 높습니다. 연결 풀 크기를 늘리거나 연결 관리를 최적화하세요.');
      }

      if (activeConnections / totalConnections < 0.3) {
        recommendations.push('유휴 연결이 많습니다. 연결 타임아웃을 줄이거나 풀 크기를 조정하세요.');
      }

      if (recommendations.length === 0) {
        recommendations.push('데이터베이스 연결 상태가 양호합니다.');
      }

      return {
        currentConnections: totalConnections,
        maxConnections,
        recommendations
      };
    } catch (error) {
      console.error('Connection pool analysis failed:', error);
      return {
        currentConnections: 0,
        maxConnections: 0,
        recommendations: ['연결 풀 분석에 실패했습니다.']
      };
    }
  }

  /**
   * API 응답 시간 최적화 제안
   */
  static analyzeAPIPerformance(): {
    slowEndpoints: Array<{
      endpoint: string;
      avgResponseTime: number;
      recommendations: string[];
    }>;
    overallRecommendations: string[];
  } {
    const slowEndpoints: Array<{
      endpoint: string;
      avgResponseTime: number;
      recommendations: string[];
    }> = [];

    this.queryMetrics.forEach((times, queryName) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      
      if (avgTime > 200) { // 200ms 이상
        const recommendations: string[] = [];
        
        if (avgTime > 1000) {
          recommendations.push('매우 느린 응답 시간입니다. 쿼리 최적화가 필요합니다.');
        } else if (avgTime > 500) {
          recommendations.push('응답 시간이 느립니다. 캐싱 또는 인덱스 최적화를 고려하세요.');
        } else {
          recommendations.push('응답 시간 개선이 필요합니다.');
        }

        slowEndpoints.push({
          endpoint: queryName,
          avgResponseTime: avgTime,
          recommendations
        });
      }
    });

    const overallRecommendations: string[] = [
      '정기적인 성능 모니터링을 수행하세요.',
      '데이터베이스 쿼리 최적화를 지속적으로 개선하세요.',
      '적절한 캐싱 전략을 적용하세요.',
      '불필요한 데이터 로딩을 피하고 페이지네이션을 사용하세요.'
    ];

    return {
      slowEndpoints: slowEndpoints.sort((a, b) => b.avgResponseTime - a.avgResponseTime),
      overallRecommendations
    };
  }

  /**
   * 성능 통계 초기화
   */
  static resetMetrics(): void {
    this.queryMetrics.clear();
    this.cacheStats = { hits: 0, misses: 0 };
  }

  /**
   * 성능 보고서 생성
   */
  static async generatePerformanceReport(): Promise<{
    timestamp: Date;
    metrics: PerformanceMetrics;
    slowQueries: Array<{ queryName: string; avgTime: number; maxTime: number; count: number }>;
    indexRecommendations: QueryOptimizationResult[];
    cacheAnalysis: { currentHitRate: number; recommendations: string[]; suggestedTTL: Record<string, number> };
    memoryAnalysis: { currentUsage: NodeJS.MemoryUsage; recommendations: string[]; criticalLevel: boolean };
    connectionAnalysis: { currentConnections: number; maxConnections: number; recommendations: string[] };
    apiAnalysis: { slowEndpoints: Array<{ endpoint: string; avgResponseTime: number; recommendations: string[] }>; overallRecommendations: string[] };
  }> {
    return {
      timestamp: new Date(),
      metrics: await this.getPerformanceMetrics(),
      slowQueries: this.getSlowQueries(),
      indexRecommendations: await this.analyzeIndexOptimization(),
      cacheAnalysis: await this.analyzeCacheOptimization(),
      memoryAnalysis: this.analyzeMemoryOptimization(),
      connectionAnalysis: await this.optimizeConnectionPool(),
      apiAnalysis: this.analyzeAPIPerformance()
    };
  }
}