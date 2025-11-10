import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Redis 클라이언트 (캐시와 공유)
const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();


// 기본 Rate Limit 설정
export const basicRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
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
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
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
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: 'rl:health:'
    }),
    windowMs: 1 * 60 * 1000, // 1분
    max: 30, // 최대 30 요청
    message: 'Too many health data requests'
  }),
  
  // 파일 업로드 (리소스 집약적)
  fileUpload: rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
      prefix: 'rl:upload:'
    }),
    windowMs: 1 * 60 * 1000, // 1분
    max: 5, // 최대 5 요청
    message: 'Too many file upload requests'
  }),
  
  // AI 분석 (CPU 집약적)
  aiAnalysis: rateLimit({
    store: new RedisStore({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
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
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: `rl:dynamic:${user?.id || 'anonymous'}:`
    }),
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    message: `Rate limit exceeded for your tier. Max: ${maxRequests} requests per 15 minutes`
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
      const usage = ((Number(limit) - Number(remaining)) / Number(limit)) * 100;
      
      // 사용률이 80% 이상일 때 경고
      if (usage >= 80) {
        console.warn(`⚠️ Rate limit 사용률 높음: ${req.ip} - ${usage.toFixed(1)}%`);
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};
