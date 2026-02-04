import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client?: Redis;
  private fallback = new Map<string, string>();
  private logger = new Logger('RedisService');
  private connectionAttempted = false;

  constructor() {
    const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    try {
      this.client = new Redis(url);
      this.client.on('error', (err) => {
        if (!this.connectionAttempted) {
          this.logger.warn('Redis unavailable, using in-memory fallback');
          this.connectionAttempted = true;
        }
      });
      this.client.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.connectionAttempted = true;
      });
    } catch (err) {
      this.logger.warn('Redis connection failed, using in-memory fallback');
      this.client = undefined;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (this.client) {
      if (ttlSeconds) return this.client.set(key, value, 'EX', ttlSeconds);
      return this.client.set(key, value);
    }
    this.fallback.set(key, value);
    if (ttlSeconds) setTimeout(() => this.fallback.delete(key), ttlSeconds * 1000);
  }

  async get(key: string) {
    if (this.client) return this.client.get(key);
    return this.fallback.get(key) || null;
  }

  async del(key: string) {
    if (this.client) return this.client.del(key as any);
    this.fallback.delete(key);
  }
}
