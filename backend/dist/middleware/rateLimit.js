"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMonitor = exports.dynamicRateLimit = exports.apiSpecificRateLimit = exports.authRateLimit = exports.basicRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
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
exports.basicRateLimit = (0, express_rate_limit_1.default)({
    store: new rate_limit_redis_1.default({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rl:basic:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});
exports.authRateLimit = (0, express_rate_limit_1.default)({
    store: new rate_limit_redis_1.default({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rl:auth:'
    }),
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    }
});
exports.apiSpecificRateLimit = {
    healthData: (0, express_rate_limit_1.default)({
        store: new rate_limit_redis_1.default({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: 'rl:health:'
        }),
        windowMs: 1 * 60 * 1000,
        max: 30,
        message: 'Too many health data requests'
    }),
    fileUpload: (0, express_rate_limit_1.default)({
        store: new rate_limit_redis_1.default({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: 'rl:upload:'
        }),
        windowMs: 1 * 60 * 1000,
        max: 5,
        message: 'Too many file upload requests'
    }),
    aiAnalysis: (0, express_rate_limit_1.default)({
        store: new rate_limit_redis_1.default({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: 'rl:ai:'
        }),
        windowMs: 5 * 60 * 1000,
        max: 10,
        message: 'Too many AI analysis requests'
    })
};
const dynamicRateLimit = (req, res, next) => {
    const user = req.user;
    let maxRequests = 100;
    if (user) {
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
    const dynamicLimit = (0, express_rate_limit_1.default)({
        store: new rate_limit_redis_1.default({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: `rl:dynamic:${user?.id || 'anonymous'}:`
        }),
        windowMs: 15 * 60 * 1000,
        max: maxRequests,
        message: `Rate limit exceeded for your tier. Max: ${maxRequests} requests per 15 minutes`
    });
    return dynamicLimit(req, res, next);
};
exports.dynamicRateLimit = dynamicRateLimit;
const rateLimitMonitor = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        const remaining = res.getHeader('X-RateLimit-Remaining');
        const limit = res.getHeader('X-RateLimit-Limit');
        if (remaining && limit) {
            const usage = ((Number(limit) - Number(remaining)) / Number(limit)) * 100;
            if (usage >= 80) {
                console.warn(`⚠️ Rate limit 사용률 높음: ${req.ip} - ${usage.toFixed(1)}%`);
            }
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.rateLimitMonitor = rateLimitMonitor;
//# sourceMappingURL=rateLimit.js.map