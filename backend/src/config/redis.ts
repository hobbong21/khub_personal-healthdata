import { createClient, RedisClientType } from 'redis';

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,
        },
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Redis는 선택적 기능이므로 연결 실패 시에도 앱이 계속 동작하도록 함
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
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttlSeconds);
    } catch (error) {
      console.error('Redis setJSON error:', error);
      return false;
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.get(key);
      if (!jsonString) {
        return null;
      }
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Redis getJSON error:', error);
      return null;
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isReady()) {
      return;
    }

    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(keys);
      }
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
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

// 캐시 TTL 상수 (초 단위)
export const CACHE_TTL = {
  DASHBOARD: 300, // 5분
  TRENDS: 600, // 10분
  GOALS: 300, // 5분
  HEALTH_SUMMARY: 180, // 3분
} as const;

export default redisService;