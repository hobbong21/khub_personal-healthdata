import prisma from '../config/database';
import { PerformanceService } from './performanceService';

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

export class QueryOptimizationService {
  /**
   * 자주 사용되는 쿼리 패턴 분석
   */
  static async analyzeQueryPatterns(): Promise<QueryOptimization[]> {
    const optimizations: QueryOptimization[] = [];

    try {
      // 테이블별 통계 분석
      const tableStats = await this.getTableStatistics();
      
      for (const stat of tableStats) {
        // 큰 테이블에서 자주 검색되는 컬럼 식별
        if (stat.rowCount > 1000) {
          const columnStats = await this.getColumnStatistics(stat.tableName);
          
          for (const colStat of columnStats) {
            if (colStat.distinctValues > 100 && !colStat.hasIndex) {
              optimizations.push({
                tableName: stat.tableName,
                columnName: colStat.columnName,
                indexType: this.recommendIndexType(colStat),
                estimatedImprovement: this.calculateImprovement(colStat),
                priority: this.calculatePriority(stat.rowCount, colStat.distinctValues)
              });
            }
          }
        }
      }

      return optimizations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Query pattern analysis failed:', error);
      return [];
    }
  }

  /**
   * 테이블 통계 조회
   */
  private static async getTableStatistics(): Promise<Array<{
    tableName: string;
    rowCount: number;
    tableSize: string;
  }>> {
    try {
      const result = await prisma.$queryRaw<Array<{
        table_name: string;
        row_count: bigint;
        table_size: string;
      }>>`
        SELECT 
          schemaname||'.'||tablename as table_name,
          n_tup_ins + n_tup_upd + n_tup_del as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
      `;

      return result.map(row => ({
        tableName: row.table_name.replace('public.', ''),
        rowCount: Number(row.row_count),
        tableSize: row.table_size
      }));
    } catch (error) {
      console.error('Failed to get table statistics:', error);
      return [];
    }
  }

  /**
   * 컬럼 통계 조회
   */
  private static async getColumnStatistics(tableName: string): Promise<Array<{
    columnName: string;
    distinctValues: number;
    nullFraction: number;
    hasIndex: boolean;
  }>> {
    try {
      const result = await prisma.$queryRaw<Array<{
        attname: string;
        n_distinct: number;
        null_frac: number;
        has_index: boolean;
      }>>`
        SELECT 
          s.attname,
          s.n_distinct,
          s.null_frac,
          CASE WHEN i.indexname IS NOT NULL THEN true ELSE false END as has_index
        FROM pg_stats s
        LEFT JOIN pg_indexes i ON i.tablename = s.tablename AND i.indexdef LIKE '%' || s.attname || '%'
        WHERE s.schemaname = 'public' 
        AND s.tablename = ${tableName}
        AND s.n_distinct > 1
      `;

      return result.map(row => ({
        columnName: row.attname,
        distinctValues: Math.abs(row.n_distinct),
        nullFraction: row.null_frac,
        hasIndex: row.has_index
      }));
    } catch (error) {
      console.error(`Failed to get column statistics for ${tableName}:`, error);
      return [];
    }
  }

  /**
   * 인덱스 타입 추천
   */
  private static recommendIndexType(columnStat: {
    columnName: string;
    distinctValues: number;
    nullFraction: number;
  }): 'btree' | 'hash' | 'gin' | 'gist' {
    // 텍스트 검색이 필요한 컬럼
    if (columnStat.columnName.includes('text') || columnStat.columnName.includes('description')) {
      return 'gin';
    }
    
    // 고유값이 많은 컬럼
    if (columnStat.distinctValues > 10000) {
      return 'btree';
    }
    
    // 등등 조건이 많은 컬럼
    if (columnStat.distinctValues < 100) {
      return 'hash';
    }
    
    return 'btree'; // 기본값
  }

  /**
   * 성능 향상 추정
   */
  private static calculateImprovement(columnStat: {
    distinctValues: number;
    nullFraction: number;
  }): number {
    // 고유값이 많을수록, null이 적을수록 인덱스 효과가 큼
    const distinctnessScore = Math.min(columnStat.distinctValues / 1000, 1);
    const nullScore = 1 - columnStat.nullFraction;
    
    return Math.round((distinctnessScore * nullScore) * 80); // 최대 80% 향상
  }

  /**
   * 우선순위 계산
   */
  private static calculatePriority(
    rowCount: number, 
    distinctValues: number
  ): 'high' | 'medium' | 'low' {
    const score = (rowCount / 1000) * (distinctValues / 100);
    
    if (score > 100) return 'high';
    if (score > 10) return 'medium';
    return 'low';
  }

  /**
   * 쿼리 실행 계획 분석
   */
  static async analyzeQueryPlan(query: string): Promise<QueryPlan | null> {
    try {
      const startTime = performance.now();
      
      // EXPLAIN ANALYZE 실행
      const plan = await prisma.$queryRaw<Array<{ 'QUERY PLAN': string }>>`
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}
      `;
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      const planData = JSON.parse(plan[0]['QUERY PLAN']);
      const rootNode = planData[0].Plan;
      
      return {
        query,
        executionTime,
        cost: rootNode['Total Cost'],
        rows: rootNode['Actual Rows'],
        plan: planData
      };
    } catch (error) {
      console.error('Query plan analysis failed:', error);
      return null;
    }
  }

  /**
   * 느린 쿼리 식별
   */
  static async identifySlowQueries(): Promise<Array<{
    query: string;
    avgTime: number;
    calls: number;
    totalTime: number;
  }>> {
    try {
      // pg_stat_statements 확장이 필요
      const result = await prisma.$queryRaw<Array<{
        query: string;
        mean_exec_time: number;
        calls: bigint;
        total_exec_time: number;
      }>>`
        SELECT 
          query,
          mean_exec_time,
          calls,
          total_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 100 -- 100ms 이상
        ORDER BY mean_exec_time DESC
        LIMIT 20
      `;

      return result.map(row => ({
        query: row.query,
        avgTime: row.mean_exec_time,
        calls: Number(row.calls),
        totalTime: row.total_exec_time
      }));
    } catch (error) {
      console.error('Slow query identification failed:', error);
      // pg_stat_statements가 없는 경우 빈 배열 반환
      return [];
    }
  }

  /**
   * 인덱스 사용률 분석
   */
  static async analyzeIndexUsage(): Promise<Array<{
    tableName: string;
    indexName: string;
    scans: number;
    tuplesRead: number;
    tuplesReturned: number;
    efficiency: number;
  }>> {
    try {
      const result = await prisma.$queryRaw<Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        idx_scan: bigint;
        idx_tup_read: bigint;
        idx_tup_fetch: bigint;
      }>>`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
      `;

      return result.map(row => {
        const scans = Number(row.idx_scan);
        const tuplesRead = Number(row.idx_tup_read);
        const tuplesReturned = Number(row.idx_tup_fetch);
        const efficiency = tuplesRead > 0 ? (tuplesReturned / tuplesRead) * 100 : 0;

        return {
          tableName: row.tablename,
          indexName: row.indexname,
          scans,
          tuplesRead,
          tuplesReturned,
          efficiency
        };
      });
    } catch (error) {
      console.error('Index usage analysis failed:', error);
      return [];
    }
  }

  /**
   * 자동 인덱스 생성 (권장사항 기반)
   */
  static async createRecommendedIndexes(
    optimizations: QueryOptimization[],
    maxIndexes: number = 5
  ): Promise<Array<{ indexName: string; created: boolean; error?: string }>> {
    const results: Array<{ indexName: string; created: boolean; error?: string }> = [];
    
    // 우선순위가 높은 것부터 처리
    const highPriorityOptimizations = optimizations
      .filter(opt => opt.priority === 'high')
      .slice(0, maxIndexes);

    for (const opt of highPriorityOptimizations) {
      const indexName = `idx_${opt.tableName}_${opt.columnName}`;
      
      try {
        await prisma.$executeRaw`
          CREATE INDEX IF NOT EXISTS ${indexName} 
          ON ${opt.tableName} USING ${opt.indexType} (${opt.columnName})
        `;
        
        results.push({ indexName, created: true });
        console.log(`Created index: ${indexName}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ indexName, created: false, error: errorMessage });
        console.error(`Failed to create index ${indexName}:`, error);
      }
    }

    return results;
  }

  /**
   * 사용되지 않는 인덱스 식별
   */
  static async identifyUnusedIndexes(): Promise<Array<{
    tableName: string;
    indexName: string;
    size: string;
    lastUsed: Date | null;
  }>> {
    try {
      const result = await prisma.$queryRaw<Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        idx_scan: bigint;
        pg_size_pretty: string;
      }>>`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          pg_size_pretty(pg_relation_size(indexrelid)) as pg_size_pretty
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexname NOT LIKE '%_pkey'  -- 기본키 제외
        ORDER BY pg_relation_size(indexrelid) DESC
      `;

      return result.map(row => ({
        tableName: row.tablename,
        indexName: row.indexname,
        size: row.pg_size_pretty,
        lastUsed: null // PostgreSQL에서는 마지막 사용 시간을 직접 제공하지 않음
      }));
    } catch (error) {
      console.error('Unused index identification failed:', error);
      return [];
    }
  }

  /**
   * 쿼리 성능 벤치마크
   */
  static async benchmarkQuery(
    query: string, 
    iterations: number = 10
  ): Promise<{
    avgTime: number;
    minTime: number;
    maxTime: number;
    stdDev: number;
  }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      try {
        await prisma.$queryRaw`${query}`;
      } catch (error) {
        console.error(`Benchmark iteration ${i + 1} failed:`, error);
        continue;
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    if (times.length === 0) {
      return { avgTime: 0, minTime: 0, maxTime: 0, stdDev: 0 };
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    // 표준편차 계산
    const variance = times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);

    return { avgTime, minTime, maxTime, stdDev };
  }

  /**
   * 데이터베이스 성능 보고서 생성
   */
  static async generatePerformanceReport(): Promise<{
    timestamp: Date;
    queryOptimizations: QueryOptimization[];
    slowQueries: Array<{ query: string; avgTime: number; calls: number; totalTime: number }>;
    indexUsage: Array<{ tableName: string; indexName: string; scans: number; efficiency: number }>;
    unusedIndexes: Array<{ tableName: string; indexName: string; size: string }>;
    recommendations: string[];
  }> {
    const [
      queryOptimizations,
      slowQueries,
      indexUsage,
      unusedIndexes
    ] = await Promise.all([
      this.analyzeQueryPatterns(),
      this.identifySlowQueries(),
      this.analyzeIndexUsage(),
      this.identifyUnusedIndexes()
    ]);

    const recommendations: string[] = [];

    if (queryOptimizations.length > 0) {
      recommendations.push(`${queryOptimizations.length}개의 인덱스 최적화 기회가 발견되었습니다.`);
    }

    if (slowQueries.length > 0) {
      recommendations.push(`${slowQueries.length}개의 느린 쿼리가 식별되었습니다.`);
    }

    if (unusedIndexes.length > 0) {
      recommendations.push(`${unusedIndexes.length}개의 사용되지 않는 인덱스를 제거하여 성능을 향상시킬 수 있습니다.`);
    }

    const lowEfficiencyIndexes = indexUsage.filter(idx => idx.efficiency < 50);
    if (lowEfficiencyIndexes.length > 0) {
      recommendations.push(`${lowEfficiencyIndexes.length}개의 인덱스가 낮은 효율성을 보이고 있습니다.`);
    }

    if (recommendations.length === 0) {
      recommendations.push('데이터베이스 성능이 양호합니다.');
    }

    return {
      timestamp: new Date(),
      queryOptimizations,
      slowQueries,
      indexUsage,
      unusedIndexes,
      recommendations
    };
  }
}