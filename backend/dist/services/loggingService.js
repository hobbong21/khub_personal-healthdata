"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingService = exports.LoggingService = exports.LogLevel = void 0;
const winston_1 = require("winston");
const encryption_1 = require("../utils/encryption");
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["HTTP"] = "http";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class LoggingService {
    constructor() {
        this.initializeLoggers();
    }
    initializeLoggers() {
        const logFormat = winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json(), winston_1.format.printf(({ timestamp, level, message, service, ...meta }) => {
            return JSON.stringify({
                timestamp,
                level,
                message,
                service,
                ...meta
            });
        }));
        this.logger = (0, winston_1.createLogger)({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            defaultMeta: { service: 'health-platform' },
            transports: [
                new winston_1.transports.Console({
                    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
                }),
                new winston_1.transports.File({
                    filename: 'logs/app.log',
                    maxsize: 10 * 1024 * 1024,
                    maxFiles: 5
                })
            ]
        });
        this.securityLogger = (0, winston_1.createLogger)({
            level: 'info',
            format: logFormat,
            defaultMeta: { service: 'security' },
            transports: [
                new winston_1.transports.File({
                    filename: 'logs/security.log',
                    maxsize: 50 * 1024 * 1024,
                    maxFiles: 10
                })
            ]
        });
        this.performanceLogger = (0, winston_1.createLogger)({
            level: 'info',
            format: logFormat,
            defaultMeta: { service: 'performance' },
            transports: [
                new winston_1.transports.File({
                    filename: 'logs/performance.log',
                    maxsize: 20 * 1024 * 1024,
                    maxFiles: 7
                })
            ]
        });
        this.auditLogger = (0, winston_1.createLogger)({
            level: 'info',
            format: logFormat,
            defaultMeta: { service: 'audit' },
            transports: [
                new winston_1.transports.File({
                    filename: 'logs/audit.log',
                    maxsize: 100 * 1024 * 1024,
                    maxFiles: 50
                })
            ]
        });
        this.errorLogger = (0, winston_1.createLogger)({
            level: 'error',
            format: logFormat,
            defaultMeta: { service: 'error' },
            transports: [
                new winston_1.transports.File({
                    filename: 'logs/error.log',
                    maxsize: 20 * 1024 * 1024,
                    maxFiles: 10
                })
            ]
        });
        if (process.env.NODE_ENV === 'production') {
            this.logger.remove(this.logger.transports[0]);
        }
    }
    log(level, message, metadata, req) {
        const logEntry = {
            timestamp: new Date(),
            level,
            message,
            service: 'health-platform',
            ...this.extractRequestInfo(req),
            metadata: this.sanitizeMetadata(metadata)
        };
        this.logger.log(level, message, logEntry);
    }
    info(message, metadata, req) {
        this.log(LogLevel.INFO, message, metadata, req);
    }
    warn(message, metadata, req) {
        this.log(LogLevel.WARN, message, metadata, req);
    }
    debug(message, metadata, req) {
        this.log(LogLevel.DEBUG, message, metadata, req);
    }
    http(message, metadata, req) {
        this.log(LogLevel.HTTP, message, metadata, req);
    }
    error(error, context, req) {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        const errorLogEntry = {
            timestamp: new Date(),
            level: LogLevel.ERROR,
            message: errorObj.message,
            service: 'health-platform',
            ...this.extractRequestInfo(req),
            error: {
                name: errorObj.name,
                message: errorObj.message,
                stack: errorObj.stack,
                code: errorObj.code
            },
            context: this.sanitizeMetadata(context),
            stack: errorObj.stack
        };
        this.errorLogger.error(errorObj.message, errorLogEntry);
        this.logger.error(errorObj.message, errorLogEntry);
    }
    security(event, severity, details, req) {
        const timestamp = new Date();
        const userId = req?.user?.id || 'anonymous';
        const hash = (0, encryption_1.createAuditHash)(event, userId, timestamp, details);
        const securityLogEntry = {
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
        if (severity === 'high' || severity === 'critical') {
            this.logger.warn(securityLogEntry.message, securityLogEntry);
        }
    }
    performance(operation, duration, metadata, req) {
        const performanceLogEntry = {
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
        if (duration > 1000) {
            this.logger.warn(performanceLogEntry.message, performanceLogEntry);
        }
    }
    audit(action, resourceType, resourceId, details, req) {
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
            hash: (0, encryption_1.createAuditHash)(action, userId, timestamp, { resourceType, resourceId, details })
        };
        this.auditLogger.info(auditEntry.message, auditEntry);
    }
    dataAccess(operation, dataType, recordId, purpose, req) {
        this.audit(`DATA_${operation.toUpperCase()}`, dataType, recordId, { purpose }, req);
    }
    userActivity(activity, details, req) {
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
    apiLog(method, path, statusCode, duration, req) {
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
    extractRequestInfo(req) {
        if (!req)
            return {};
        return {
            userId: req.user?.id,
            sessionId: req.sessionID || 'unknown',
            requestId: req.requestId,
            ip: (0, encryption_1.maskPII)(req.ip || req.socket.remoteAddress || 'unknown'),
            userAgent: (0, encryption_1.maskPII)(req.get('User-Agent') || 'unknown')
        };
    }
    sanitizeMetadata(metadata) {
        if (!metadata)
            return metadata;
        const sanitized = JSON.parse(JSON.stringify(metadata));
        const sensitiveFields = [
            'password', 'token', 'secret', 'key', 'ssn', 'creditCard',
            'email', 'phone', 'address', 'birthDate'
        ];
        const maskSensitiveData = (obj) => {
            if (typeof obj !== 'object' || obj === null)
                return obj;
            for (const key in obj) {
                if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                    if (key.toLowerCase().includes('email')) {
                        obj[key] = (0, encryption_1.maskEmail)(obj[key]);
                    }
                    else {
                        obj[key] = (0, encryption_1.maskPII)(obj[key]);
                    }
                }
                else if (typeof obj[key] === 'object') {
                    obj[key] = maskSensitiveData(obj[key]);
                }
            }
            return obj;
        };
        return maskSensitiveData(sanitized);
    }
    async searchLogs(query) {
        console.log('Log search query:', query);
        return [];
    }
    async getLogStatistics(timeRange) {
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
    async archiveLogs(olderThan) {
        console.log('Archiving logs older than:', olderThan);
        return 0;
    }
    async cleanupLogs(retentionDays = 90) {
        const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
        console.log('Cleaning up logs older than:', cutoffDate);
        return 0;
    }
    createLogStream(filters) {
        const { Readable } = require('stream');
        return new Readable({
            read() {
            }
        });
    }
    async exportLogs(query) {
        console.log('Exporting logs with query:', query);
        return '';
    }
    close() {
        this.logger.close();
        this.securityLogger.close();
        this.performanceLogger.close();
        this.auditLogger.close();
        this.errorLogger.close();
    }
}
exports.LoggingService = LoggingService;
exports.loggingService = new LoggingService();
//# sourceMappingURL=loggingService.js.map