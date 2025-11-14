"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.redisService = void 0;
const redis_1 = require("redis");
const performanceService_1 = require("../services/performanceService");
const COMPRESSION_THRESHOLD = 1024;
class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionRetries = 0;
        this.maxRetries = 5;
        this.compressionEnabled = process.env.REDIS_COMPRESSION === 'true';
    }
    async connect() {
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
                throw new Error('Invalid Redis URL format');
            }
            this.client = (0, redis_1.createClient)({
                url: redisUrl,
                socket: {
                    connectTimeout: 10000,
                    keepAlive: 30000,
                    noDelay: true,
                },
                commandsQueueMaxLength: 1000,
                disableOfflineQueue: false,
            });
            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
                this.handleConnectionError();
            });
            this.client.on('connect', () => {
                console.log('Redis Client Connected');
                this.isConnected = true;
                this.connectionRetries = 0;
            });
            this.client.on('disconnect', () => {
                console.log('Redis Client Disconnected');
                this.isConnected = false;
            });
            this.client.on('reconnecting', () => {
                console.log('Redis Client Reconnecting...');
            });
            await this.client.connect();
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            this.handleConnectionError();
        }
    }
    async handleConnectionError() {
        this.connectionRetries++;
        if (this.connectionRetries < this.maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);
            console.log(`Retrying Redis connection in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`);
            setTimeout(() => this.connect(), delay);
        }
        else {
            console.error('Max Redis connection retries reached. Operating without cache.');
            this.client = null;
            this.isConnected = false;
        }
    }
    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.disconnect();
            this.client = null;
            this.isConnected = false;
        }
    }
    isReady() {
        return this.isConnected && this.client !== null;
    }
    async get(key) {
        if (!this.isReady()) {
            return null;
        }
        try {
            return await this.client.get(key);
        }
        catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.isReady()) {
            return false;
        }
        try {
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
            return true;
        }
        catch (error) {
            console.error('Redis SET error:', error);
            return false;
        }
    }
    async del(key) {
        if (!this.isReady()) {
            return false;
        }
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            console.error('Redis DEL error:', error);
            return false;
        }
    }
    async exists(key) {
        if (!this.isReady()) {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    }
    async setJSON(key, value, ttlSeconds) {
        try {
            let jsonString = JSON.stringify(value);
            if (this.compressionEnabled && jsonString.length > COMPRESSION_THRESHOLD) {
                const zlib = await Promise.resolve().then(() => __importStar(require('zlib')));
                const compressed = zlib.gzipSync(jsonString);
                jsonString = compressed.toString('base64');
                key = `compressed:${key}`;
            }
            return await this.set(key, jsonString, ttlSeconds);
        }
        catch (error) {
            console.error('Redis setJSON error:', error);
            return false;
        }
    }
    async getJSON(key) {
        try {
            let jsonString = await this.get(key);
            if (!jsonString) {
                jsonString = await this.get(`compressed:${key}`);
                if (jsonString && this.compressionEnabled) {
                    const zlib = await Promise.resolve().then(() => __importStar(require('zlib')));
                    const decompressed = zlib.gunzipSync(Buffer.from(jsonString, 'base64'));
                    jsonString = decompressed.toString();
                }
            }
            if (jsonString) {
                performanceService_1.PerformanceService.recordCacheHit();
                return JSON.parse(jsonString);
            }
            else {
                performanceService_1.PerformanceService.recordCacheMiss();
                return null;
            }
        }
        catch (error) {
            console.error('Redis getJSON error:', error);
            performanceService_1.PerformanceService.recordCacheMiss();
            return null;
        }
    }
    async setBatchJSON(items) {
        if (!this.isReady()) {
            return false;
        }
        try {
            const pipeline = this.client.multi();
            for (const item of items) {
                const serialized = JSON.stringify(item.data);
                if (item.ttl) {
                    pipeline.setEx(item.key, item.ttl, serialized);
                }
                else {
                    pipeline.set(item.key, serialized);
                }
            }
            await pipeline.exec();
            return true;
        }
        catch (error) {
            console.error('Redis setBatchJSON error:', error);
            return false;
        }
    }
    async getBatchJSON(keys) {
        if (!this.isReady()) {
            return {};
        }
        try {
            const results = await this.client.mGet(keys);
            const data = {};
            results.forEach((result, index) => {
                const key = keys[index];
                if (result) {
                    try {
                        data[key] = JSON.parse(result);
                        performanceService_1.PerformanceService.recordCacheHit();
                    }
                    catch (error) {
                        data[key] = null;
                        performanceService_1.PerformanceService.recordCacheMiss();
                    }
                }
                else {
                    data[key] = null;
                    performanceService_1.PerformanceService.recordCacheMiss();
                }
            });
            return data;
        }
        catch (error) {
            console.error('Redis getBatchJSON error:', error);
            return {};
        }
    }
    async setSmartCache(key, data, baseTTL) {
        if (!this.isReady()) {
            return false;
        }
        try {
            const accessKey = `access:${key}`;
            const accessCount = await this.client.incr(accessKey);
            await this.client.expire(accessKey, 3600);
            let adjustedTTL = baseTTL;
            if (accessCount > 10) {
                adjustedTTL = baseTTL * 2;
            }
            else if (accessCount > 50) {
                adjustedTTL = baseTTL * 3;
            }
            return await this.setJSON(key, data, adjustedTTL);
        }
        catch (error) {
            console.error('Smart cache error:', error);
            return await this.setJSON(key, data, baseTTL);
        }
    }
    async invalidatePattern(pattern) {
        if (!this.isReady()) {
            return;
        }
        try {
            let cursor = 0;
            let deletedCount = 0;
            do {
                const result = await this.client.scan(cursor, {
                    MATCH: pattern,
                    COUNT: 100
                });
                cursor = result.cursor;
                const keys = result.keys;
                if (keys.length > 0) {
                    await this.client.del(keys);
                    deletedCount += keys.length;
                }
            } while (cursor !== 0);
            if (deletedCount > 0) {
                console.log(`Invalidated ${deletedCount} keys matching pattern: ${pattern}`);
            }
        }
        catch (error) {
            console.error('Redis invalidatePattern error:', error);
        }
    }
    async getCacheStats() {
        if (!this.isReady()) {
            return { keyCount: 0, memoryUsage: '0B', hitRate: 0, evictedKeys: 0 };
        }
        try {
            const info = await this.client.info('stats');
            const keyspaceInfo = await this.client.info('keyspace');
            const stats = this.parseRedisInfo(info);
            const keyspace = this.parseRedisInfo(keyspaceInfo);
            const keyCount = keyspace.db0 ? parseInt(keyspace.db0.split('=')[1].split(',')[0]) : 0;
            const hits = parseInt(stats.keyspace_hits || '0');
            const misses = parseInt(stats.keyspace_misses || '0');
            const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
            return {
                keyCount,
                memoryUsage: stats.used_memory_human || '0B',
                hitRate,
                evictedKeys: parseInt(stats.evicted_keys || '0')
            };
        }
        catch (error) {
            console.error('Redis getCacheStats error:', error);
            return { keyCount: 0, memoryUsage: '0B', hitRate: 0, evictedKeys: 0 };
        }
    }
    parseRedisInfo(info) {
        const result = {};
        const lines = info.split('\r\n');
        for (const line of lines) {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[key] = value;
            }
        }
        return result;
    }
    async optimizeMemory() {
        if (!this.isReady()) {
            return;
        }
        try {
            let cursor = 0;
            let expiredCount = 0;
            do {
                const result = await this.client.scan(cursor, {
                    COUNT: 100
                });
                cursor = result.cursor;
                const keys = result.keys;
                for (const key of keys) {
                    try {
                        const ttl = await this.client.ttl(key);
                        if (ttl === -1) {
                            await this.client.expire(key, 3600);
                            expiredCount++;
                        }
                    }
                    catch (keyError) {
                        console.warn(`Error processing key ${key}:`, keyError);
                    }
                }
            } while (cursor !== 0);
            console.log(`Cache memory optimization completed. Processed ${expiredCount} keys.`);
        }
        catch (error) {
            console.error('Cache memory optimization error:', error);
        }
    }
    getDashboardCacheKey(userId) {
        return `dashboard:${userId}`;
    }
    getTrendsCacheKey(userId, period, days) {
        return `trends:${userId}:${period}:${days}`;
    }
    getGoalsCacheKey(userId) {
        return `goals:${userId}`;
    }
    async invalidateUserCache(userId) {
        await Promise.all([
            this.invalidatePattern(`dashboard:${userId}*`),
            this.invalidatePattern(`trends:${userId}*`),
            this.invalidatePattern(`goals:${userId}*`),
            this.invalidatePattern(`health:${userId}*`),
        ]);
    }
}
exports.redisService = new RedisService();
exports.CACHE_TTL = {
    DASHBOARD: 5 * 60,
    TRENDS: 30 * 60,
    GOALS: 10 * 60,
    HEALTH_SUMMARY: 15 * 60,
    USER_PROFILE: 60 * 60,
    MEDICAL_RECORDS: 2 * 60 * 60,
    GENOMIC_DATA: 24 * 60 * 60,
    REFERENCE_DATA: 7 * 24 * 60 * 60,
    STATIC_DATA: 30 * 24 * 60 * 60,
};
exports.default = exports.redisService;
//# sourceMappingURL=redis.js.map