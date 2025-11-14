import { Request } from 'express';
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    HTTP = "http",
    DEBUG = "debug"
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
export declare class LoggingService {
    private logger;
    private securityLogger;
    private performanceLogger;
    private auditLogger;
    private errorLogger;
    constructor();
    private initializeLoggers;
    log(level: LogLevel, message: string, metadata?: any, req?: Request): void;
    info(message: string, metadata?: any, req?: Request): void;
    warn(message: string, metadata?: any, req?: Request): void;
    debug(message: string, metadata?: any, req?: Request): void;
    http(message: string, metadata?: any, req?: Request): void;
    error(error: Error | string, context?: any, req?: Request): void;
    security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any, req?: Request): void;
    performance(operation: string, duration: number, metadata?: {
        resourceUsage?: {
            memory: number;
            cpu: number;
        };
        queryCount?: number;
        cacheHits?: number;
        cacheMisses?: number;
    }, req?: Request): void;
    audit(action: string, resourceType: string, resourceId: string, details?: any, req?: Request): void;
    dataAccess(operation: 'read' | 'write' | 'delete', dataType: string, recordId: string, purpose?: string, req?: Request): void;
    userActivity(activity: string, details?: any, req?: Request): void;
    apiLog(method: string, path: string, statusCode: number, duration: number, req?: Request): void;
    private extractRequestInfo;
    private sanitizeMetadata;
    searchLogs(query: {
        level?: LogLevel;
        service?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        message?: string;
        limit?: number;
    }): Promise<LogEntry[]>;
    getLogStatistics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        totalLogs: number;
        errorCount: number;
        warningCount: number;
        securityEvents: number;
        topErrors: Array<{
            message: string;
            count: number;
        }>;
        logsByHour: Array<{
            hour: number;
            count: number;
        }>;
    }>;
    archiveLogs(olderThan: Date): Promise<number>;
    cleanupLogs(retentionDays?: number): Promise<number>;
    createLogStream(filters?: {
        level?: LogLevel;
        service?: string;
        userId?: string;
    }): NodeJS.ReadableStream;
    exportLogs(query: {
        startDate: Date;
        endDate: Date;
        level?: LogLevel;
        service?: string;
        format?: 'json' | 'csv';
    }): Promise<string>;
    close(): void;
}
export declare const loggingService: LoggingService;
//# sourceMappingURL=loggingService.d.ts.map