import { createLogger, format, transports, Logger } from 'winston';
import { Request } from 'express';
import { maskEmail, maskPII, createAuditHash } from '../utils/encryption';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  service: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  stack?: string;
  duration?: number;
}

export interface ErrorLogEntry extends LogEntry {
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context?: any;
}

export interface SecurityLogEntry extends LogEntry {
  securityEvent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  hash: string;
}

export interface PerformanceLogEntry extends LogEntry {
  operation: string;
  duration: number;
  resourceUsage?: {
    memory: number;
    cpu: number;
  };
  queryCount?: number;
  cacheHits?: number;
  cacheMisses?: number;
}

export class LoggingService {
  private logger: Logger;
  private securityLogger: Logger;
  private performanceLogger: Logger;
  private auditLogger: Logger;
  private errorLogger: Logger;

  constructor() {
    this.initializeLoggers();
  }

  /**
   * 로거 초기화
   */
  private initializeLoggers(): void {
    const logFormat = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
      format.printf(({ timestamp, level, message, service, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          service,
          ...meta
        });
      })
    );

    // 메인 애플리케이션 로거
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'health-platform' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),
        new transports.File({
          filename: 'logs/app.log',
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5
        })
      ]
    });

    // 보안 이벤트 로거
    this.securityLogger = createLogger({
      level: 'info',
      format: logFormat,
      defaultMeta: { service: 'security' },
      transports: [
        new transports.File({
          filename: 'logs/security.log',
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 10
        })
      ]
    });

    // 성능 로거
    this.performanceLogger = createLogger({
      level: 'info',
      format: logFormat,
      defaultMeta: { service: 'performance' },
      transports: [
        new transports.File({
          filename: 'logs/performance.log',
          maxsize: 20 * 1024 * 1024, // 20MB
          maxFiles: 7
        })
      ]
    });

    // 감사 로거 (HIPAA 준수)
    this.auditLogger = createLogger({
      level: 'info',
      format: logFormat,
      defaultMeta: { service: 'audit' },
      transports: [
        new transports.File({
          filename: 'logs/audit.log',
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 50 // 장기 보관
        })
      ]
    });

    // 에러 로거
    this.errorLogger = createLogger({
      level: 'error',
      format: logFormat,
      defaultMeta: { service: 'error' },
      transports: [
        new transports.File({
          filename: 'logs/error.log',
          maxsize: 20 * 1024 * 1024, // 20MB
          maxFiles: 10
        })
      ]
    });

    // 프로덕션 환경에서는 콘솔 로그 비활성화
    if (process.env.NODE_ENV === 'production') {
      this.logger.remove(this.logger.transports[0]);
    }
  }

  /**
   * 일반 로그 기록
   */
  log(level: LogLevel, message: string, metadata?: any, req?: Request): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      service: 'health-platform',
      ...this.extractRequestInfo(req),
      metadata: this.sanitizeMetadata(metadata)
    };

    this.logger.log(level, message, logEntry);
  }

  /**
   * 정보 로그
   */
  info(message: string, metadata?: any, req?: Request): void {
    this.log(LogLevel.INFO, message, metadata, req);
  }

  /**
   * 경고 로그
   */
  warn(message: string, metadata?: any, req?: Request): void {
    this.log(LogLevel.WARN, message, metadata, req);
  }

  /**
   * 디버그 로그
   */
  debug(message: string, metadata?: any, req?: Request): void {
    this.log(LogLevel.DEBUG, message, metadata, req);
  }

  /**
   * HTTP 요청 로그
   */
  http(message: string, metadata?: any, req?: Request): void {
    this.log(LogLevel.HTTP, message, metadata, req);
  }

  /**
   * 에러 로그 기록
   */
  error(error: Error | string, context?: any, req?: Request): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const errorLogEntry: ErrorLogEntry = {
      timestamp: new Date(),
      level: LogLevel.ERROR,
      message: errorObj.message,
      service: 'health-platform',
      ...this.extractRequestInfo(req),
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
        code: (errorObj as any).code
      },
      context: this.sanitizeMetadata(context),
      stack: errorObj.stack
    };

    this.errorLogger.error(errorObj.message, errorLogEntry);
    this.logger.error(errorObj.message, errorLogEntry);
  }

  /**
   * 보안 이벤트 로그 기록
   */
  security(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any,
    req?: Request
  ): void {
    const timestamp = new Date();
    const userId = req?.user?.id || 'anonymous';
    
    const hash = createAuditHash(event, userId, timestamp, details);
    
    const securityLogEntry: SecurityLogEntry = {
      timestamp,
      level: LogLevel.WARN,
      message: `Security event: ${event}`,
      service: 'security',
      ...this.extractRequestInfo(req),
      securityEvent: event,
      severity,
      details: this.sanitizeMetadata(details),
      hash
    };

    this.securityLogger.warn(securityLogEntry.message, securityLogEntry);
    
    // 높은 심각도의 보안 이벤트는 메인 로그에도 기록
    if (severity === 'high' || severity === 'critical') {
      this.logger.warn(securityLogEntry.message, securityLogEntry);
    }
  }

  /**
   * 성능 로그 기록
   */
  performance(
    operation: string,
    duration: number,
    metadata?: {
      resourceUsage?: { memory: number; cpu: number };
      queryCount?: number;
      cacheHits?: number;
      cacheMisses?: number;
    },
    req?: Request
  ): void {
    const performanceLogEntry: PerformanceLogEntry = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: `Performance: ${operation} completed in ${duration}ms`,
      service: 'performance',
      ...this.extractRequestInfo(req),
      operation,
      duration,
      ...metadata
    };

    this.performanceLogger.info(performanceLogEntry.message, performanceLogEntry);
    
    // 느린 작업은 메인 로그에도 기록
    if (duration > 1000) { // 1초 이상
      this.logger.warn(performanceLogEntry.message, performanceLogEntry);
    }
  }

  /**
   * 감사 로그 기록 (HIPAA 준수)
   */
  audit(
    action: string,
    resourceType: string,
    resourceId: string,
    details?: any,
    req?: Request
  ): void {
    const timestamp = new Date();
    const userId = req?.user?.id || 'anonymous';
    
    const auditEntry = {
      timestamp,
      level: LogLevel.INFO,
      message: `Audit: ${action} on ${resourceType}:${resourceId}`,
      service: 'audit',
      ...this.extractRequestInfo(req),
      action,
      resourceType,
      resourceId,
      details: this.sanitizeMetadata(details),
      hash: createAuditHash(action, userId, timestamp, { resourceType, resourceId, details })
    };

    this.auditLogger.info(auditEntry.message, auditEntry);
  }

  /**
   * 데이터 접근 로그 (HIPAA 준수)
   */
  dataAccess(
    operation: 'read' | 'write' | 'delete',
    dataType: string,
    recordId: string,
    purpose?: string,
    req?: Request
  ): void {
    this.audit(
      `DATA_${operation.toUpperCase()}`,
      dataType,
      recordId,
      { purpose },
      req
    );
  }

  /**
   * 사용자 활동 로그
   */
  userActivity(
    activity: string,
    details?: any,
    req?: Request
  ): void {
    const logEntry = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: `User activity: ${activity}`,
      service: 'user-activity',
      ...this.extractRequestInfo(req),
      activity,
      details: this.sanitizeMetadata(details)
    };

    this.logger.info(logEntry.message, logEntry);
  }

  /**
   * API 요청/응답 로그
   */
  apiLog(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    req?: Request
  ): void {
    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.HTTP;
    
    const apiLogEntry = {
      timestamp: new Date(),
      level,
      message: `${method} ${path} ${statusCode} - ${duration}ms`,
      service: 'api',
      ...this.extractRequestInfo(req),
      method,
      path,
      statusCode,
      duration
    };

    this.logger.log(level, apiLogEntry.message, apiLogEntry);
  }

  /**
   * 요청 정보 추출
   */
  private extractRequestInfo(req?: Request): Partial<LogEntry> {
    if (!req) return {};

    return {
      userId: req.user?.id,
      sessionId: req.sessionID,
      requestId: (req as any).requestId,
      ip: maskPII(req.ip || req.connection.remoteAddress || 'unknown'),
      userAgent: maskPII(req.get('User-Agent') || 'unknown')
    };
  }

  /**
   * 메타데이터 정제 (민감한 정보 마스킹)
   */
  private sanitizeMetadata(metadata: any): any {
    if (!metadata) return metadata;

    const sanitized = JSON.parse(JSON.stringify(metadata));
    
    // 민감한 필드 마스킹
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'ssn', 'creditCard',
      'email', 'phone', 'address', 'birthDate'
    ];

    const maskSensitiveData = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          if (key.toLowerCase().includes('email')) {
            obj[key] = maskEmail(obj[key]);
          } else {
            obj[key] = maskPII(obj[key]);
          }
        } else if (typeof obj[key] === 'object') {
          obj[key] = maskSensitiveData(obj[key]);
        }
      }

      return obj;
    };

    return maskSensitiveData(sanitized);
  }

  /**
   * 로그 검색
   */
  async searchLogs(
    query: {
      level?: LogLevel;
      service?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      message?: string;
      limit?: number;
    }
  ): Promise<LogEntry[]> {
    // 실제 구현에서는 로그 저장소(Elasticsearch, MongoDB 등)에서 검색
    // 여기서는 간단한 예시만 제공
    console.log('Log search query:', query);
    return [];
  }

  /**
   * 로그 통계
   */
  async getLogStatistics(
    timeRange: { start: Date; end: Date }
  ): Promise<{
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    securityEvents: number;
    topErrors: Array<{ message: string; count: number }>;
    logsByHour: Array<{ hour: number; count: number }>;
  }> {
    // 실제 구현에서는 로그 저장소에서 집계
    console.log('Log statistics for time range:', timeRange);
    return {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      securityEvents: 0,
      topErrors: [],
      logsByHour: []
    };
  }

  /**
   * 로그 아카이브
   */
  async archiveLogs(olderThan: Date): Promise<number> {
    // 실제 구현에서는 오래된 로그를 압축하여 아카이브
    console.log('Archiving logs older than:', olderThan);
    return 0;
  }

  /**
   * 로그 정리
   */
  async cleanupLogs(retentionDays: number = 90): Promise<number> {
    // 실제 구현에서는 보존 기간이 지난 로그 삭제
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    console.log('Cleaning up logs older than:', cutoffDate);
    return 0;
  }

  /**
   * 실시간 로그 스트림
   */
  createLogStream(filters?: {
    level?: LogLevel;
    service?: string;
    userId?: string;
  }): NodeJS.ReadableStream {
    // 실제 구현에서는 실시간 로그 스트림 생성
    const { Readable } = require('stream');
    return new Readable({
      read() {
        // 로그 스트림 구현
      }
    });
  }

  /**
   * 로그 내보내기
   */
  async exportLogs(
    query: {
      startDate: Date;
      endDate: Date;
      level?: LogLevel;
      service?: string;
      format?: 'json' | 'csv';
    }
  ): Promise<string> {
    // 실제 구현에서는 조건에 맞는 로그를 내보내기
    console.log('Exporting logs with query:', query);
    return '';
  }

  /**
   * 로거 종료
   */
  close(): void {
    this.logger.close();
    this.securityLogger.close();
    this.performanceLogger.close();
    this.auditLogger.close();
    this.errorLogger.close();
  }
}

// 싱글톤 인스턴스
export const loggingService = new LoggingService();