const fs = require('fs');
const path = require('path');

class BackendOptimizer {
  constructor() {
    this.backendPath = './backend';
    this.optimizations = [];
  }

  // 캐싱 미들웨어 최적화
  optimizeCaching() {
    console.log('🔧 백엔드 캐싱 최적화 중...');
    
    const cacheMiddlewarePath = path.join(this.backendPath, 'src', 'middleware', 'cache.ts');
    
    const cacheMiddleware = `import { Request, Response, NextFunction } from 'express';
import Redis from 'redis';

// Redis 클라이언트 설정
const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

redis.on('error', (err) => {
  console.error('Redis 연결 오류:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis 연결 성공');
});

// 캐시 키 생성 함수
const generateCacheKey = (req: Request): string => {
  const { method, originalUrl, query, user } = req;
  const userId = (user as any)?.id || 'anonymous';
  return \`\${method}:\${originalUrl}:\${JSON.stringify(query)}:user:\${userId}\`;
};

// 캐시 미들웨어
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // GET 요청만 캐싱
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req);

    try {
      // 캐시에서 데이터 조회
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        console.log(\`📦 캐시 히트: \${cacheKey}\`);
        return res.json(JSON.parse(cachedData));
      }

      // 캐시 미스 - 원본 응답 캐싱
      const originalSend = res.json;
      res.json = function(data: any) {
        // 성공적인 응답만 캐싱
        if (res.statusCode === 200) {
          redis.setex(cacheKey, ttl, JSON.stringify(data))
            .catch(err => console.error('캐시 저장 오류:', err));
          console.log(\`💾 캐시 저장: \${cacheKey}\`);
        }
        
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('캐시 미들웨어 오류:', error);
      next();
    }
  };
};

// 캐시 무효화 함수
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(\`🗑️  캐시 무효화: \${keys.length}개 키 삭제\`);
    }
  } catch (error) {
    console.error('캐시 무효화 오류:', error);
  }
};

// 사용자별 캐시 무효화
export const invalidateUserCache = async (userId: string): Promise<void> => {
  await invalidateCache(\`*:user:\${userId}\`);
};

// 특정 엔드포인트 캐시 무효화
export const invalidateEndpointCache = async (endpoint: string): Promise<void> => {
  await invalidateCache(\`*:\${endpoint}:*\`);
};

export default redis;`;

    try {
      const middlewareDir = path.join(this.backendPath, 'src', 'middleware');
      if (!fs.existsSync(middlewareDir)) {
        fs.mkdirSync(middlewareDir, { recursive: true });
      }
      
      fs.writeFileSync(cacheMiddlewarePath, cacheMiddleware);
      this.optimizations.push('✅ 캐싱 미들웨어 최적화 완료');
      console.log('✅ 캐싱 미들웨어 최적화 완료');
    } catch (error) {
      console.log('❌ 캐싱 미들웨어 최적화 실패:', error.message);
    }
  }

  // 데이터베이스 쿼리 최적화
  optimizeDatabase() {
    console.log('🔧 데이터베이스 쿼리 최적화 중...');
    
    const dbOptimizationPath = path.join(this.backendPath, 'src', 'utils', 'dbOptimization.ts');
    
    const dbOptimization = `import { PrismaClient } from '@prisma/client';

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
      
      console.warn(\`🐌 느린 쿼리 감지: \${duration}ms - \${query.substring(0, 100)}...\`);
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
}`;

    try {
      const utilsDir = path.join(this.backendPath, 'src', 'utils');
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }
      
      fs.writeFileSync(dbOptimizationPath, dbOptimization);
      this.optimizations.push('✅ 데이터베이스 쿼리 최적화 완료');
      console.log('✅ 데이터베이스 쿼리 최적화 완료');
    } catch (error) {
      console.log('❌ 데이터베이스 쿼리 최적화 실패:', error.message);
    }
  }

  // API 응답 압축 최적화
  optimizeCompression() {
    console.log('🔧 API 응답 압축 최적화 중...');
    
    const compressionMiddlewarePath = path.join(this.backendPath, 'src', 'middleware', 'compression.ts');
    
    const compressionMiddleware = `import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// 압축 설정 최적화
export const compressionMiddleware = compression({
  // 압축 레벨 설정 (1-9, 6이 기본값)
  level: 6,
  
  // 압축 임계값 (바이트 단위)
  threshold: 1024,
  
  // 압축할 MIME 타입 필터
  filter: (req: Request, res: Response) => {
    // 이미 압축된 응답은 제외
    if (res.getHeader('Content-Encoding')) {
      return false;
    }
    
    // 특정 경로는 압축 제외 (예: 파일 다운로드)
    if (req.path.includes('/download') || req.path.includes('/stream')) {
      return false;
    }
    
    // 기본 압축 필터 사용
    return compression.filter(req, res);
  },
  
  // 압축 품질 설정
  windowBits: 15,
  memLevel: 8,
  
  // 청크 크기 설정
  chunkSize: 16 * 1024 // 16KB
});

// Brotli 압축 미들웨어 (더 높은 압축률)
export const brotliMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  // 클라이언트가 Brotli를 지원하는 경우
  if (acceptEncoding.includes('br')) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Vary', 'Accept-Encoding');
  }
  
  next();
};

// 응답 크기 모니터링
export const responseSizeMonitor = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    const size = Buffer.byteLength(data, 'utf8');
    
    // 큰 응답에 대한 경고
    if (size > 1024 * 1024) { // 1MB 이상
      console.warn(\`⚠️ 큰 응답 크기: \${req.method} \${req.path} - \${(size / 1024 / 1024).toFixed(2)}MB\`);
    }
    
    // 개발 환경에서 응답 크기 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(\`📊 응답 크기: \${req.method} \${req.path} - \${(size / 1024).toFixed(2)}KB\`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};`;

    try {
      fs.writeFileSync(compressionMiddlewarePath, compressionMiddleware);
      this.optimizations.push('✅ API 응답 압축 최적화 완료');
      console.log('✅ API 응답 압축 최적화 완료');
    } catch (error) {
      console.log('❌ API 응답 압축 최적화 실패:', error.message);
    }
  }

  // Rate Limiting 최적화
  optimizeRateLimiting() {
    console.log('🔧 Rate Limiting 최적화 중...');
    
    const rateLimitPath = path.join(this.backendPath, 'src', 'middleware', 'rateLimit.ts');
    
    const rateLimit = `import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'redis';

// Redis 클라이언트 (캐시와 공유)
const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
});

// 기본 Rate Limit 설정
export const basicRateLimit = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:basic:'
  }),
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  message: {
    error: 'Too many requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 인증 API용 엄격한 Rate Limit
export const authRateLimit = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5 요청
  skipSuccessfulRequests: true, // 성공한 요청은 카운트에서 제외
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// API별 맞춤형 Rate Limit
export const apiSpecificRateLimit = {
  // 건강 데이터 조회 (자주 사용)
  healthData: rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:health:'
    }),
    windowMs: 1 * 60 * 1000, // 1분
    max: 30, // 최대 30 요청
    message: 'Too many health data requests'
  }),
  
  // 파일 업로드 (리소스 집약적)
  fileUpload: rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:upload:'
    }),
    windowMs: 1 * 60 * 1000, // 1분
    max: 5, // 최대 5 요청
    message: 'Too many file upload requests'
  }),
  
  // AI 분석 (CPU 집약적)
  aiAnalysis: rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:ai:'
    }),
    windowMs: 5 * 60 * 1000, // 5분
    max: 10, // 최대 10 요청
    message: 'Too many AI analysis requests'
  })
};

// 동적 Rate Limit (사용자 등급별)
export const dynamicRateLimit = (req: any, res: any, next: any) => {
  const user = req.user;
  let maxRequests = 100; // 기본값
  
  if (user) {
    // 사용자 등급에 따른 제한 조정
    switch (user.tier) {
      case 'premium':
        maxRequests = 500;
        break;
      case 'pro':
        maxRequests = 200;
        break;
      default:
        maxRequests = 100;
    }
  }
  
  const dynamicLimit = rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: \`rl:dynamic:\${user?.id || 'anonymous'}:\`
    }),
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    message: \`Rate limit exceeded for your tier. Max: \${maxRequests} requests per 15 minutes\`
  });
  
  return dynamicLimit(req, res, next);
};

// Rate Limit 모니터링
export const rateLimitMonitor = (req: any, res: any, next: any) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Rate limit 헤더 확인
    const remaining = res.getHeader('X-RateLimit-Remaining');
    const limit = res.getHeader('X-RateLimit-Limit');
    
    if (remaining && limit) {
      const usage = ((limit - remaining) / limit) * 100;
      
      // 사용률이 80% 이상일 때 경고
      if (usage >= 80) {
        console.warn(\`⚠️ Rate limit 사용률 높음: \${req.ip} - \${usage.toFixed(1)}%\`);
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};`;

    try {
      fs.writeFileSync(rateLimitPath, rateLimit);
      this.optimizations.push('✅ Rate Limiting 최적화 완료');
      console.log('✅ Rate Limiting 최적화 완료');
    } catch (error) {
      console.log('❌ Rate Limiting 최적화 실패:', error.message);
    }
  }

  // 로깅 및 모니터링 최적화
  optimizeLogging() {
    console.log('🔧 로깅 및 모니터링 최적화 중...');
    
    const loggingPath = path.join(this.backendPath, 'src', 'utils', 'logger.ts');
    
    const logger = `import winston from 'winston';
import path from 'path';

// 로그 레벨 정의
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// 로그 색상 정의
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => \`\${info.timestamp} \${info.level}: \${info.message}\`
  )
);

// 프로덕션 로그 포맷 (JSON)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 로거 생성
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: process.env.NODE_ENV === 'production' ? productionFormat : logFormat,
  transports: [
    // 콘솔 출력
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? productionFormat : logFormat
    }),
    
    // 에러 로그 파일
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // 모든 로그 파일
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // 예외 처리
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log')
    })
  ],
  
  // 거부된 Promise 처리
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log')
    })
  ]
});

// HTTP 요청 로깅 미들웨어
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'http';
    
    logger.log(logLevel, \`\${req.method} \${req.originalUrl} \${res.statusCode} - \${duration}ms\`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  });
  
  next();
};

// 성능 메트릭 로거
export class PerformanceLogger {
  private static metrics: Map<string, number[]> = new Map();
  
  static logApiResponse(endpoint: string, duration: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const endpointMetrics = this.metrics.get(endpoint)!;
    endpointMetrics.push(duration);
    
    // 최근 100개 요청만 유지
    if (endpointMetrics.length > 100) {
      endpointMetrics.shift();
    }
    
    // 느린 응답 경고
    if (duration > 1000) {
      logger.warn(\`Slow API response: \${endpoint} - \${duration}ms\`);
    }
  }
  
  static getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((durations, endpoint) => {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      result[endpoint] = {
        count: durations.length,
        avgDuration: Math.round(avg),
        minDuration: min,
        maxDuration: max
      };
    });
    
    return result;
  }
  
  static clearMetrics(): void {
    this.metrics.clear();
  }
}

// 에러 로깅 헬퍼
export const logError = (error: Error, context?: any): void => {
  logger.error(error.message, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};

// 보안 이벤트 로깅
export const logSecurityEvent = (event: string, details: any): void => {
  logger.warn(\`Security Event: \${event}\`, {
    event,
    details,
    timestamp: new Date().toISOString(),
    severity: 'security'
  });
};

export default logger;`;

    try {
      fs.writeFileSync(loggingPath, logger);
      this.optimizations.push('✅ 로깅 및 모니터링 최적화 완료');
      console.log('✅ 로깅 및 모니터링 최적화 완료');
    } catch (error) {
      console.log('❌ 로깅 및 모니터링 최적화 실패:', error.message);
    }
  }

  // 모든 최적화 실행
  async runAllOptimizations() {
    console.log('🚀 백엔드 성능 최적화 시작...\n');
    
    this.optimizeCaching();
    this.optimizeDatabase();
    this.optimizeCompression();
    this.optimizeRateLimiting();
    this.optimizeLogging();
    
    console.log('\n📈 최적화 완료 요약:');
    this.optimizations.forEach(opt => console.log(opt));
    
    console.log('\n💡 추가 권장사항:');
    console.log('1. Redis 서버 설정 및 연결');
    console.log('2. 데이터베이스 인덱스 추가');
    console.log('3. 로그 디렉토리 생성 (logs/)');
    console.log('4. 환경 변수 설정 (REDIS_HOST, LOG_LEVEL 등)');
    console.log('5. 프로덕션 환경에서 압축 및 캐싱 활성화');
    
    return this.optimizations;
  }
}

// 스크립트 실행
if (require.main === module) {
  const optimizer = new BackendOptimizer();
  optimizer.runAllOptimizations();
}

module.exports = BackendOptimizer;