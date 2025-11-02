import { PrismaClient } from '@prisma/client';

// 최적화된 Prisma 클라이언트 설정
export const createOptimizedPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
};

// 쿼리 최적화 유틸리티
export class QueryOptimizer {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // 페이지네이션 최적화
  async paginateQuery<T>(
    model: any,
    where: any = {},
    page: number = 1,
    limit: number = 10,
    orderBy: any = { createdAt: 'desc' },
    include?: any
  ): Promise<{ data: T[]; pagination: any }> {
    const skip = (page - 1) * limit;
    
    // 병렬로 데이터와 총 개수 조회
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include
      }),
      model.count({ where })
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // 배치 처리 최적화
  async batchProcess<T>(
    items: T[],
    processor: (batch: T[]) => Promise<any>,
    batchSize: number = 100
  ): Promise<any[]> {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResult = await processor(batch);
      results.push(batchResult);
    }
    
    return results;
  }

  // 관계형 데이터 최적화 로딩
  async loadWithRelations(
    model: any,
    id: string,
    relations: string[]
  ): Promise<any> {
    const include: any = {};
    
    relations.forEach(relation => {
      include[relation] = true;
    });

    return await model.findUnique({
      where: { id },
      include
    });
  }

  // 집계 쿼리 최적화
  async getAggregatedData(
    model: any,
    groupBy: string[],
    aggregations: any,
    where: any = {}
  ): Promise<any[]> {
    return await model.groupBy({
      by: groupBy,
      where,
      _count: aggregations.count || {},
      _sum: aggregations.sum || {},
      _avg: aggregations.avg || {},
      _min: aggregations.min || {},
      _max: aggregations.max || {}
    });
  }
}

// 인덱스 최적화 가이드
export const indexOptimizationGuide = {
  // 자주 사용되는 쿼리 패턴에 대한 인덱스 권장사항
  recommendations: [
    {
      table: 'health_records',
      columns: ['user_id', 'created_at'],
      reason: '사용자별 건강 기록 시계열 조회'
    },
    {
      table: 'medical_records',
      columns: ['user_id', 'visit_date'],
      reason: '사용자별 진료 기록 날짜순 조회'
    },
    {
      table: 'test_results',
      columns: ['medical_record_id', 'test_category'],
      reason: '진료 기록별 검사 결과 카테고리 필터링'
    },
    {
      table: 'medications',
      columns: ['user_id', 'is_active'],
      reason: '사용자별 활성 약물 조회'
    },
    {
      table: 'genomic_data',
      columns: ['user_id', 'source_platform'],
      reason: '사용자별 유전체 데이터 플랫폼별 조회'
    }
  ],
  
  // 복합 인덱스 권장사항
  compositeIndexes: [
    {
      table: 'vital_signs',
      columns: ['user_id', 'type', 'measured_at'],
      reason: '사용자별 바이탈 사인 타입별 시계열 조회'
    },
    {
      table: 'appointments',
      columns: ['user_id', 'status', 'appointment_date'],
      reason: '사용자별 예약 상태별 날짜 조회'
    }
  ]
};

// 쿼리 성능 모니터링
export class QueryPerformanceMonitor {
  private slowQueries: Array<{ query: string; duration: number; timestamp: Date }> = [];
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1초

  logSlowQuery(query: string, duration: number): void {
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      this.slowQueries.push({
        query,
        duration,
        timestamp: new Date()
      });
      
      console.warn(`🐌 느린 쿼리 감지: ${duration}ms - ${query.substring(0, 100)}...`);
    }
  }

  getSlowQueries(): Array<{ query: string; duration: number; timestamp: Date }> {
    return this.slowQueries;
  }

  clearSlowQueries(): void {
    this.slowQueries = [];
  }

  generatePerformanceReport(): any {
    const totalSlowQueries = this.slowQueries.length;
    const avgDuration = totalSlowQueries > 0 
      ? this.slowQueries.reduce((sum, q) => sum + q.duration, 0) / totalSlowQueries 
      : 0;

    return {
      totalSlowQueries,
      avgDuration,
      slowQueries: this.slowQueries.slice(-10) // 최근 10개만
    };
  }
}