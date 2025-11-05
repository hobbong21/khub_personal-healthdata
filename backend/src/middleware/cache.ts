import { Request, Response, NextFunction } from 'express';
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
  // 안전한 문자열 생성 (로그 인젝션 방지)
  const sanitizedUrl = originalUrl.replace(/[\r\n]/g, '');
  const sanitizedQuery = JSON.stringify(query).replace(/[\r\n]/g, '');
  return `${method}:${sanitizedUrl}:${sanitizedQuery}:user:${userId}`;
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
        const sanitizedKey = cacheKey.replace(/[\r\n]/g, '');
        console.log(`📦 캐시 히트: ${sanitizedKey}`);
        return res.json(JSON.parse(cachedData));
      }

      // 캐시 미스 - 원본 응답 캐싱
      const originalSend = res.json;
      res.json = function(data: any) {
        // 성공적인 응답만 캐싱
        if (res.statusCode === 200) {
          redis.setex(cacheKey, ttl, JSON.stringify(data))
            .catch(err => console.error('캐시 저장 오류:', err));
          const sanitizedKey = cacheKey.replace(/[\r\n]/g, '');
          console.log(`💾 캐시 저장: ${sanitizedKey}`);
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
      console.log(`🗑️  캐시 무효화: ${keys.length}개 키 삭제`);
    }
  } catch (error) {
    console.error('캐시 무효화 오류:', error);
  }
};

// 사용자별 캐시 무효화
export const invalidateUserCache = async (userId: string): Promise<void> => {
  await invalidateCache(`*:user:${userId}`);
};

// 특정 엔드포인트 캐시 무효화
export const invalidateEndpointCache = async (endpoint: string): Promise<void> => {
  await invalidateCache(`*:${endpoint}:*`);
};

export default redis;