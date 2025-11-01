import { Request, Response, NextFunction } from 'express';
import { redisService, CACHE_TTL } from '../config/redis';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: AuthenticatedRequest) => string;
  skipCache?: (req: AuthenticatedRequest) => boolean;
}

/**
 * 캐시 미들웨어 생성기
 */
export function createCacheMiddleware(options: CacheOptions = {}) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // 캐시를 건너뛸 조건 확인
    if (options.skipCache && options.skipCache(req)) {
      return next();
    }

    // 사용자 인증 확인
    if (!req.user?.id) {
      return next();
    }

    // 캐시 키 생성
    const cacheKey = options.keyGenerator 
      ? options.keyGenerator(req)
      : generateDefaultCacheKey(req);

    try {
      // 캐시에서 데이터 조회
      const cachedData = await redisService.getJSON(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      // 캐시 미스 - 원본 응답을 캐시에 저장
      const originalJson = res.json.bind(res);
      res.json = function(data: any) {
        // 성공적인 응답만 캐시
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const ttl = options.ttl || CACHE_TTL.DASHBOARD;
          redisService.setJSON(cacheKey, data, ttl).catch(err => {
            console.error('Failed to cache response:', err);
          });
          console.log(`Cached response for key: ${cacheKey}`);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // 캐시 오류 시에도 요청 처리 계속
      next();
    }
  };
}

/**
 * 기본 캐시 키 생성
 */
function generateDefaultCacheKey(req: AuthenticatedRequest): string {
  const userId = req.user!.id;
  const path = req.path;
  const query = new URLSearchParams(req.query as Record<string, string>).toString();
  
  return `${path}:${userId}${query ? `:${query}` : ''}`;
}

/**
 * 대시보드 캐시 미들웨어
 */
export const dashboardCache = createCacheMiddleware({
  ttl: CACHE_TTL.DASHBOARD,
  keyGenerator: (req) => redisService.getDashboardCacheKey(req.user!.id),
});

/**
 * 트렌드 캐시 미들웨어
 */
export const trendsCache = createCacheMiddleware({
  ttl: CACHE_TTL.TRENDS,
  keyGenerator: (req) => {
    const userId = req.user!.id;
    const period = (req.query.period as string) || 'monthly';
    const days = parseInt((req.query.days as string) || '30');
    return redisService.getTrendsCacheKey(userId, period, days);
  },
});

/**
 * 목표 캐시 미들웨어
 */
export const goalsCache = createCacheMiddleware({
  ttl: CACHE_TTL.GOALS,
  keyGenerator: (req) => redisService.getGoalsCacheKey(req.user!.id),
});

/**
 * 건강 요약 캐시 미들웨어
 */
export const healthSummaryCache = createCacheMiddleware({
  ttl: CACHE_TTL.HEALTH_SUMMARY,
  keyGenerator: (req) => `health:summary:${req.user!.id}`,
});

/**
 * 캐시 무효화 미들웨어
 */
export function createCacheInvalidationMiddleware(patterns: string[] | ((req: AuthenticatedRequest) => string[])) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      // 성공적인 응답 후 캐시 무효화
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user?.id) {
        const invalidationPatterns = typeof patterns === 'function' 
          ? patterns(req) 
          : patterns;

        Promise.all(
          invalidationPatterns.map(pattern => 
            redisService.invalidatePattern(pattern.replace('{userId}', req.user!.id))
          )
        ).catch(err => {
          console.error('Failed to invalidate cache:', err);
        });
      }
      
      return originalJson(data);
    };

    next();
  };
}

/**
 * 건강 데이터 변경 시 캐시 무효화
 */
export const invalidateHealthCache = createCacheInvalidationMiddleware([
  'dashboard:{userId}*',
  'trends:{userId}*',
  'goals:{userId}*',
  'health:{userId}*',
]);

/**
 * 조건부 캐시 미들웨어 (개발 환경에서는 캐시 비활성화)
 */
export function conditionalCache(middleware: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CACHE === 'true') {
      return next();
    }
    return middleware(req, res, next);
  };
}