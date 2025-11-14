"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRequestId = generateRequestId;
exports.recordStartTime = recordStartTime;
exports.logAPIRequest = logAPIRequest;
exports.logErrors = logErrors;
exports.trackUserActivity = trackUserActivity;
exports.logDataAccess = logDataAccess;
exports.monitorPerformance = monitorPerformance;
exports.detectSecurityEvents = detectSecurityEvents;
exports.healthCheckMiddleware = healthCheckMiddleware;
exports.monitorRequestSize = monitorRequestSize;
const perf_hooks_1 = require("perf_hooks");
const monitoringService_1 = require("../services/monitoringService");
const loggingService_1 = require("../services/loggingService");
function generateRequestId(req, res, next) {
    req.requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    res.setHeader('X-Request-ID', req.requestId);
    next();
}
function recordStartTime(req, res, next) {
    req.startTime = perf_hooks_1.performance.now();
    next();
}
function logAPIRequest(req, res, next) {
    const startTime = perf_hooks_1.performance.now();
    const originalSend = res.send;
    res.send = function (data) {
        const endTime = perf_hooks_1.performance.now();
        const duration = Math.round(endTime - startTime);
        const isError = res.statusCode >= 400;
        loggingService_1.loggingService.apiLog(req.method, req.path, res.statusCode, duration, req);
        monitoringService_1.monitoringService.trackAPIRequest(duration, isError);
        if (duration > 500) {
            loggingService_1.loggingService.performance(`${req.method} ${req.path}`, duration, {
                resourceUsage: {
                    memory: process.memoryUsage().heapUsed,
                    cpu: process.cpuUsage().user + process.cpuUsage().system
                }
            }, req);
        }
        return originalSend.call(this, data);
    };
    next();
}
function logErrors(err, req, res, next) {
    loggingService_1.loggingService.error(err, {
        endpoint: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
    }, req);
    if (isSecurityError(err)) {
        loggingService_1.loggingService.security('SECURITY_ERROR', 'high', {
            error: err.message,
            endpoint: req.path,
            method: req.method
        }, req);
    }
    next(err);
}
function trackUserActivity(req, res, next) {
    if (req.user && req.method === 'GET') {
        const page = req.path;
        const event = 'page_view';
        const sensitivePatterns = [
            '/api/auth',
            '/api/monitoring',
            '/api/performance'
        ];
        const isSensitive = sensitivePatterns.some(pattern => page.startsWith(pattern));
        if (!isSensitive) {
            monitoringService_1.monitoringService.trackUserBehavior({
                userId: req.user.id,
                sessionId: req.requestId || 'unknown',
                event,
                page,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
        }
    }
    next();
}
function logDataAccess(dataType, operation) {
    return (req, res, next) => {
        if (req.user) {
            const resourceId = req.params.id || req.body.id || 'unknown';
            loggingService_1.loggingService.dataAccess(operation, dataType, resourceId, `API ${operation} operation`, req);
        }
        next();
    };
}
function monitorPerformance(operationName) {
    return (req, res, next) => {
        const startTime = perf_hooks_1.performance.now();
        const startMemory = process.memoryUsage().heapUsed;
        const originalEnd = res.end;
        res.end = function (chunk, encoding) {
            const endTime = perf_hooks_1.performance.now();
            const endMemory = process.memoryUsage().heapUsed;
            const duration = endTime - startTime;
            const memoryDelta = endMemory - startMemory;
            const operation = operationName || `${req.method} ${req.path}`;
            loggingService_1.loggingService.performance(operation, duration, {
                resourceUsage: {
                    memory: memoryDelta,
                    cpu: process.cpuUsage().user + process.cpuUsage().system
                }
            }, req);
            return originalEnd.call(this, chunk, encoding);
        };
        next();
    };
}
function detectSecurityEvents(req, res, next) {
    const suspiciousPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /\.\.\//g,
        /[;&|`$()]/g
    ];
    const requestData = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params
    });
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            loggingService_1.loggingService.security('SUSPICIOUS_INPUT_DETECTED', 'medium', {
                pattern: pattern.source,
                requestData: requestData.substring(0, 500),
                endpoint: req.path,
                method: req.method
            }, req);
            break;
        }
    }
    const clientIP = req.ip;
    const now = Date.now();
    if (!global.requestCounts) {
        global.requestCounts = new Map();
    }
    const requestCounts = global.requestCounts;
    const clientRequests = requestCounts.get(clientIP) || [];
    const recentRequests = clientRequests.filter(time => now - time < 60000);
    recentRequests.push(now);
    requestCounts.set(clientIP, recentRequests);
    if (recentRequests.length > 100) {
        loggingService_1.loggingService.security('RATE_LIMIT_EXCEEDED', 'high', {
            clientIP,
            requestCount: recentRequests.length,
            timeWindow: '1 minute'
        }, req);
    }
    next();
}
function isSecurityError(error) {
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
    return securityErrorPatterns.some(pattern => pattern.test(error.message) || pattern.test(error.name));
}
function healthCheckMiddleware(req, res, next) {
    if (req.path === '/health' || req.path === '/api/monitoring/health') {
        return next();
    }
    next();
}
function monitorRequestSize(maxSize = 10 * 1024 * 1024) {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('content-length') || '0');
        if (contentLength > maxSize) {
            loggingService_1.loggingService.security('LARGE_REQUEST_DETECTED', 'medium', {
                contentLength,
                maxSize,
                endpoint: req.path,
                method: req.method
            }, req);
        }
        next();
    };
}
//# sourceMappingURL=monitoring.js.map