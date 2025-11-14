declare class RedisService {
    private client;
    private isConnected;
    private compressionEnabled;
    private connectionRetries;
    private maxRetries;
    constructor();
    connect(): Promise<void>;
    private handleConnectionError;
    disconnect(): Promise<void>;
    isReady(): boolean;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttlSeconds?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    setJSON(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    getJSON<T>(key: string): Promise<T | null>;
    setBatchJSON(items: Array<{
        key: string;
        data: any;
        ttl?: number;
    }>): Promise<boolean>;
    getBatchJSON<T>(keys: string[]): Promise<Record<string, T | null>>;
    setSmartCache(key: string, data: any, baseTTL: number): Promise<boolean>;
    invalidatePattern(pattern: string): Promise<void>;
    getCacheStats(): Promise<{
        keyCount: number;
        memoryUsage: string;
        hitRate: number;
        evictedKeys: number;
    }>;
    private parseRedisInfo;
    optimizeMemory(): Promise<void>;
    getDashboardCacheKey(userId: string): string;
    getTrendsCacheKey(userId: string, period: string, days: number): string;
    getGoalsCacheKey(userId: string): string;
    invalidateUserCache(userId: string): Promise<void>;
}
export declare const redisService: RedisService;
export declare const CACHE_TTL: {
    readonly DASHBOARD: number;
    readonly TRENDS: number;
    readonly GOALS: number;
    readonly HEALTH_SUMMARY: number;
    readonly USER_PROFILE: number;
    readonly MEDICAL_RECORDS: number;
    readonly GENOMIC_DATA: number;
    readonly REFERENCE_DATA: number;
    readonly STATIC_DATA: number;
};
export default redisService;
//# sourceMappingURL=redis.d.ts.map