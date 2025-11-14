"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateEndpointCache = exports.invalidateUserCache = exports.invalidateCache = exports.cacheMiddleware = void 0;
const redis_1 = require("redis");
const redis = (0, redis_1.createClient)({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
    },
    password: process.env.REDIS_PASSWORD
});
redis.on('error', (err) => {
    console.error('Redis 연결 오류:', err);
});
redis.on('connect', () => {
    console.log('✅ Redis 연결 성공');
});
redis.connect().catch(console.error);
const generateCacheKey = (req) => {
    const { method, originalUrl, query, user } = req;
    const userId = user?.id || 'anonymous';
    const sanitizedUrl = originalUrl.replace(/[\r\n]/g, '');
    const sanitizedQuery = JSON.stringify(query).replace(/[\r\n]/g, '');
    return `${method}:${sanitizedUrl}:${sanitizedQuery}:user:${userId}`;
};
const cacheMiddleware = (ttl = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        const cacheKey = generateCacheKey(req);
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                const sanitizedKey = cacheKey.replace(/[\r\n]/g, '');
                console.log(`📦 캐시 히트: ${sanitizedKey}`);
                return res.json(JSON.parse(cachedData));
            }
            const originalSend = res.json;
            res.json = function (data) {
                if (res.statusCode === 200) {
                    redis.setEx(cacheKey, ttl, JSON.stringify(data))
                        .catch(err => console.error('캐시 저장 오류:', err));
                    const sanitizedKey = cacheKey.replace(/[\r\n]/g, '');
                    console.log(`💾 캐시 저장: ${sanitizedKey}`);
                }
                return originalSend.call(this, data);
            };
            next();
        }
        catch (error) {
            console.error('캐시 미들웨어 오류:', error);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
const invalidateCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`🗑️  캐시 무효화: ${keys.length}개 키 삭제`);
        }
    }
    catch (error) {
        console.error('캐시 무효화 오류:', error);
    }
};
exports.invalidateCache = invalidateCache;
const invalidateUserCache = async (userId) => {
    await (0, exports.invalidateCache)(`*:user:${userId}`);
};
exports.invalidateUserCache = invalidateUserCache;
const invalidateEndpointCache = async (endpoint) => {
    await (0, exports.invalidateCache)(`*:${endpoint}:*`);
};
exports.invalidateEndpointCache = invalidateEndpointCache;
exports.default = redis;
//# sourceMappingURL=cache.js.map