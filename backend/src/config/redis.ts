import { createClient, RedisClientType } from 'redis';
import { PerformanceService } from '../services/performanceService';

// 캐시 압축 설정
const COMPRESSION_THRESHOLD = 1024; // 1KB 이상 데이터 압축

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;
  private compressionEnabled: boolean;
  private connectionRetries = 0;
  private maxRetries = 5;

  constructor() {
    this.compressionEnabled = process.env.REDIS_COMPRESSION === 'true';
  }

  async connect(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      // URL 검증
      if (!redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
        throw new Error('Invalid Redis URL format');
      }
      
      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
          keepAlive: 30000,
          noDelay: true,
        },
        commandsQueueMaxLength: 1000,
        disableOfflineQueue: false,
      });

      this.client.on('error', (err: Error) => {
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
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.handleConnectionError();
    }
  }

  private async handleConnectionError(): Promise<void> {
    this.connectionRetries++;
    if (this.connectionRetries < this.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, this.connectionRetries), 30000);
      console.log(`Retrying Redis connection in ${delay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max Redis connection retries reached. Operating without cache.');
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady()) {
      return null;
    }

    try {
      return await this.client!.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.client!.setEx(key, ttlSeconds, value);
      } else {
        await this.client!.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async setJSON(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      let jsonString = JSON.stringify(value);
      
      // 데이터 압축 (큰 데이터의 경우)
      if (this.compressionEnabled && jsonString.length > COMPRESSION_THRESHOLD) {
        const zlib = await import('zlib');
        const compressed = zlib.gzipSync(jsonString);
        jsonString = compressed.toString('base64');
        key = `compressed:${key}`;
      }
      
      return await this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      console.error('Redis setJSON error:', error);
      return false;
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      let jsonString = await this.get(key);
      
      if (!jsonString) {
        // 압축된 키도 확인
        jsonString = await this.get(`compressed:${key}`);
        if (jsonString && this.compressionEnabled) {
          const zlib = await import('zlib');
          const decompressed = zlib.gunzipSync(Buffer.from(jsonString, 'base64'));
          jsonString = decompressed.toString();
        }
      }

      if (jsonString) {
        PerformanceService.recordCacheHit();
        return JSON.parse(jsonString) as T;
      } else {
        PerformanceService.recordCacheMiss();
        return null;
      }
    } catch (error) {
      console.error('Redis getJSON error:', error);
      PerformanceService.recordCacheMiss();
      return null;
    }
  }

  /**
   * 배치 JSON 데이터 저장
   */
  async setBatchJSON(items: Array<{ key: string; data: any; ttl?: number }>): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      const pipeline = this.client!.multi();
      
      for (const item of items) {
        const serialized = JSON.stringify(item.data);
        if (item.ttl) {
          pipeline.setEx(item.key, item.ttl, serialized);
        } else {
          pipeline.set(item.key, serialized);
        }
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Redis setBatchJSON error:', error);
      return false;
    }
  }

  /**
   * 배치 JSON 데이터 조회
   */
  async getBatchJSON<T>(keys: string[]): Promise<Record<string, T | null>> {
    if (!this.isReady()) {
      return {};
    }

    try {
      const results = await this.client!.mGet(keys);
      const data: Record<string, T | null> = {};
      
      results.forEach((result, index) => {
        const key = keys[index];
        if (result) {
          try {
            data[key] = JSON.parse(result) as T;
            PerformanceService.recordCacheHit();
          } catch (error) {
            data[key] = null;
            PerformanceService.recordCacheMiss();
          }
        } else {
          data[key] = null;
          PerformanceService.recordCacheMiss();
        }
      });
      
      return data;
    } catch (error) {
      console.error('Redis getBatchJSON error:', error);
      return {};
    }
  }

  /**
   * 스마트 캐시 - 데이터 접근 패턴 기반 TTL 조정
   */
  async setSmartCache(key: string, data: any, baseTTL: number): Promise<boolean> {
    if (!this.isReady()) {
      return false;
    }

    try {
      // 접근 빈도 추적
      const accessKey = `access:${key}`;
      const accessCount = await this.client!.incr(accessKey);
      await this.client!.expire(accessKey, 3600); // 1시간 추적
      
      // 접근 빈도에 따른 TTL 조정
      let adjustedTTL = baseTTL;
      if (accessCount > 10) {
        adjustedTTL = baseTTL * 2; // 자주 접근하는 데이터는 TTL 연장
      } else if (accessCount > 50) {
        adjustedTTL = baseTTL * 3;
      }
      
      return await this.setJSON(key, data, adjustedTTL);
    } catch (error) {
      console.error('Smart cache error:', error);
      // 실패 시 기본 캐시로 폴백
      return await this.setJSON(key, data, baseTTL);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      // SCAN을 사용하여 메모리 효율적으로 키 삭제
      let cursor = 0;
      let deletedCount = 0;
      
      do {
        const result = await this.client!.scan(cursor, {
          MATCH: pattern,
          COUNT: 100
        });
        
        cursor = result.cursor;
        const keys = result.keys;
        
        if (keys.length > 0) {
          await this.client!.del(keys);
          deletedCount += keys.length;
        }
      } while (cursor !== 0);
      
      if (deletedCount > 0) {
        console.log(`Invalidated ${deletedCount} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
    }
  }

  /**
   * 캐시 통계 조회
   */
  async getCacheStats(): Promise<{
    keyCount: number;
    memoryUsage: string;
    hitRate: number;
    evictedKeys: number;
  }> {
    if (!this.isReady()) {
      return { keyCount: 0, memoryUsage: '0B', hitRate: 0, evictedKeys: 0 };
    }

    try {
      const info = await this.client!.info('stats');
      const keyspaceInfo = await this.client!.info('keyspace');
      
      // 통계 파싱
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
    } catch (error) {
      console.error('Redis getCacheStats error:', error);
      return { keyCount: 0, memoryUsage: '0B', hitRate: 0, evictedKeys: 0 };
    }
  }

  /**
   * Redis INFO 출력 파싱
   */
  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * 캐시 메모리 최적화
   */
  async optimizeMemory(): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      // SCAN을 사용하여 안전하게 만료된 키 정리
      let cursor = 0;
      let expiredCount = 0;
      
      do {
        const result = await this.client!.scan(cursor, {
          COUNT: 100
        });
        
        cursor = result.cursor;
        const keys = result.keys;
        
        // 각 키의 TTL 확인하고 만료된 키 삭제
        for (const key of keys) {
          try {
            const ttl = await this.client!.ttl(key);
            if (ttl === -1) { // TTL이 설정되지 않은 키
              // 필요에 따라 기본 TTL 설정 또는 삭제
              await this.client!.expire(key, 3600); // 1시간 기본 TTL 설정
              expiredCount++;
            }
          } catch (keyError) {
            console.warn(`Error processing key ${key}:`, keyError);
          }
        }
      } while (cursor !== 0);
      
      console.log(`Cache memory optimization completed. Processed ${expiredCount} keys.`);
    } catch (error) {
      console.error('Cache memory optimization error:', error);
    }
  }

  // 대시보드 캐시 키 생성 헬퍼
  getDashboardCacheKey(userId: string): string {
    return `dashboard:${userId}`;
  }

  getTrendsCacheKey(userId: string, period: string, days: number): string {
    return `trends:${userId}:${period}:${days}`;
  }

  getGoalsCacheKey(userId: string): string {
    return `goals:${userId}`;
  }

  // 사용자별 캐시 무효화
  async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.invalidatePattern(`dashboard:${userId}*`),
      this.invalidatePattern(`trends:${userId}*`),
      this.invalidatePattern(`goals:${userId}*`),
      this.invalidatePattern(`health:${userId}*`),
    ]);
  }
}

// 싱글톤 인스턴스
export const redisService = new RedisService();

// 캐시 TTL 상수 (초 단위) - 성능 최적화된 값
export const CACHE_TTL = {
  DASHBOARD: 5 * 60,      // 5분
  TRENDS: 30 * 60,        // 30분
  GOALS: 10 * 60,         // 10분
  HEALTH_SUMMARY: 15 * 60, // 15분
  USER_PROFILE: 60 * 60,   // 1시간
  MEDICAL_RECORDS: 2 * 60 * 60, // 2시간
  GENOMIC_DATA: 24 * 60 * 60,   // 24시간
  REFERENCE_DATA: 7 * 24 * 60 * 60, // 7일
  STATIC_DATA: 30 * 24 * 60 * 60,   // 30일
} as const;

export default redisService;