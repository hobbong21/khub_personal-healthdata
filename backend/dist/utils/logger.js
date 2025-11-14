"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvent = exports.logError = exports.PerformanceLogger = exports.httpLogger = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};
winston_1.default.addColors(logColors);
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const productionFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: logLevels,
    format: process.env.NODE_ENV === 'production' ? productionFormat : logFormat,
    transports: [
        new winston_1.default.transports.Console({
            format: process.env.NODE_ENV === 'production' ? productionFormat : logFormat
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        })
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'exceptions.log')
        })
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'rejections.log')
        })
    ]
});
const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'error' : 'http';
        exports.logger.log(logLevel, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
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
exports.httpLogger = httpLogger;
class PerformanceLogger {
    static logApiResponse(endpoint, duration) {
        if (!this.metrics.has(endpoint)) {
            this.metrics.set(endpoint, []);
        }
        const endpointMetrics = this.metrics.get(endpoint);
        endpointMetrics.push(duration);
        if (endpointMetrics.length > 100) {
            endpointMetrics.shift();
        }
        if (duration > 1000) {
            exports.logger.warn(`Slow API response: ${endpoint} - ${duration}ms`);
        }
    }
    static getMetrics() {
        const result = {};
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
    static clearMetrics() {
        this.metrics.clear();
    }
}
exports.PerformanceLogger = PerformanceLogger;
PerformanceLogger.metrics = new Map();
const logError = (error, context) => {
    exports.logger.error(error.message, {
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};
exports.logError = logError;
const logSecurityEvent = (event, details) => {
    exports.logger.warn(`Security Event: ${event}`, {
        event,
        details,
        timestamp: new Date().toISOString(),
        severity: 'security'
    });
};
exports.logSecurityEvent = logSecurityEvent;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map