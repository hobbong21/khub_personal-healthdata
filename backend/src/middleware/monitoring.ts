import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { monitoringService } from '../services/monitoringService';
import { loggingService } from '../services/loggingService';

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * 요청 ID 생성 미들웨어
 */
export function generateRequestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

/**
 * 요청 시작 시간 기록 미들웨어
 */
export function recordStartTime(req: Request, res: Response, next: NextFunction): void {
  req.startTime = performance.now();
  next();
}

/**
 * API 요청 로깅 미들웨어
 */
export function logAPIRequest(req: Request, res: Response, next: NextFunction): void {
  const startTime = performance.now();
  
  // 응답 완료 시 로그 기록
  const originalSend = res.send;
  res.send = function(data: any) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    const isError = res.statusCode >= 400;
    
    // API 로그 기록
    loggingService.apiLog(
      req.method,
      req.path,
      res.statusCode,
      duration,
      req
    );
    
    // 모니터링 서비스에 API 요청 추적
    monitoringService.trackAPIRequest(duration, isError);
    
    // 성능 로그 (느린 요청만)
    if (duration > 500) {
      loggingService.performance(
        `${req.method} ${req.path}`,
        duration,
        {
          resourceUsage: {
            memory: process.memoryUsage().heapUsed,
            cpu: process.cpuUsage().user + process.cpuUsage().system
          }
        },
        req
      );
    }
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * 에러 로깅 미들웨어
 */
export function logErrors(err: Error, req: Request, res: Response, next: NextFunction): void {
  // 에러 로그 기록
  loggingService.error(err, {
    endpoint: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  }, req);
  
  // 보안 관련 에러인지 확인
  if (isSecurityError(err)) {
    loggingService.security(
      'SECURITY_ERROR',
      'high',
      {
        error: err.message,
        endpoint: req.path,
        method: req.method
      },
      req
    );
  }
  
  next(err);
}

/**
 * 사용자 활동 자동 추적 미들웨어
 */
export function trackUserActivity(req: Request, res: Response, next: NextFunction): void {
  // 인증된 사용자의 활동만 추적
  if (req.user && req.method === 'GET') {
    const page = req.path;
    const event = 'page_view';
    
    // 민감한 경로는 제외
    const sensitivePatterns = [
      '/api/auth',
      '/api/monitoring',
      '/api/performance'
    ];
    
    const isSensitive = sensitivePatterns.some(pattern => page.startsWith(pattern));
    
    if (!isSensitive) {
      monitoringService.trackUserBehavior({
        userId: req.user.id,
        sessionId: req.sessionID || 'unknown',
        event,
        page,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }
  }
  
  next();
}

/**
 * 데이터 접근 로깅 미들웨어
 */
export function logDataAccess(dataType: string, operation: 'read' | 'write' | 'delete') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.user) {
      const resourceId = req.params.id || req.body.id || 'unknown';
      
      loggingService.dataAccess(
        operation,
        dataType,
        resourceId,
        `API ${operation} operation`,
        req
      );
    }
    
    next();
  };
}

/**
 * 성능 모니터링 미들웨어
 */
export function monitorPerformance(operationName?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    // 응답 완료 시 성능 메트릭 기록
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      const duration = endTime - startTime;
      const memoryDelta = endMemory - startMemory;
      
      const operation = operationName || `${req.method} ${req.path}`;
      
      loggingService.performance(
        operation,
        duration,
        {
          resourceUsage: {
            memory: memoryDelta,
            cpu: process.cpuUsage().user + process.cpuUsage().system
          }
        },
        req
      );
      
      return originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
}

/**
 * 보안 이벤트 감지 미들웨어
 */
export function detectSecurityEvents(req: Request, res: Response, next: NextFunction): void {
  // 의심스러운 활동 패턴 감지
  const suspiciousPatterns = [
    // SQL 인젝션 시도
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    // XSS 시도
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // 경로 탐색 시도
    /\.\.\//g,
    // 명령 인젝션 시도
    /[;&|`$()]/g
  ];
  
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      loggingService.security(
        'SUSPICIOUS_INPUT_DETECTED',
        'medium',
        {
          pattern: pattern.source,
          requestData: requestData.substring(0, 500), // 처음 500자만 로깅
          endpoint: req.path,
          method: req.method
        },
        req
      );
      break;
    }
  }
  
  // 비정상적인 요청 빈도 감지 (간단한 구현)
  const clientIP = req.ip;
  const now = Date.now();
  
  // 실제 구현에서는 Redis나 메모리 캐시를 사용
  if (!global.requestCounts) {
    global.requestCounts = new Map();
  }
  
  const requestCounts = global.requestCounts as Map<string, number[]>;
  const clientRequests = requestCounts.get(clientIP) || [];
  
  // 최근 1분간의 요청만 유지
  const recentRequests = clientRequests.filter(time => now - time < 60000);
  recentRequests.push(now);
  requestCounts.set(clientIP, recentRequests);
  
  // 1분에 100회 이상 요청 시 의심스러운 활동으로 간주
  if (recentRequests.length > 100) {
    loggingService.security(
      'RATE_LIMIT_EXCEEDED',
      'high',
      {
        clientIP,
        requestCount: recentRequests.length,
        timeWindow: '1 minute'
      },
      req
    );
  }
  
  next();
}

/**
 * 보안 에러 판별 함수
 */
function isSecurityError(error: Error): boolean {
  const securityErrorPatterns = [
    /unauthorized/i,
    /forbidden/i,
    /access denied/i,
    /authentication/i,
    /permission/i,
    /token/i,
    /csrf/i,
    /xss/i,
    /injection/i
  ];
  
  return securityErrorPatterns.some(pattern => 
    pattern.test(error.message) || pattern.test(error.name)
  );
}

/**
 * 헬스 체크 미들웨어
 */
export function healthCheckMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 헬스 체크 요청은 로깅하지 않음
  if (req.path === '/health' || req.path === '/api/monitoring/health') {
    return next();
  }
  
  next();
}

/**
 * 요청 크기 모니터링 미들웨어
 */
export function monitorRequestSize(maxSize: number = 10 * 1024 * 1024) { // 10MB 기본값
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      loggingService.security(
        'LARGE_REQUEST_DETECTED',
        'medium',
        {
          contentLength,
          maxSize,
          endpoint: req.path,
          method: req.method
        },
        req
      );
    }
    
    next();
  };
}

// 전역 타입 선언
declare global {
  var requestCounts: Map<string, number[]> | undefined;
}