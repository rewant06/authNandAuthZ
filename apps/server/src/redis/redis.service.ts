import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  client: Redis;

  async onModuleInit() {
    const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';

    this.client = new Redis(url, {
      lazyConnect: true,
      enableReadyCheck: true,
      connectTimeout: 5000,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 200, 5000),
    });
    this.client.on('error', (err) => {
      console.error('[Redis] error:', err.message);
    });

    try {
      await this.client.connect();
      await this.client.ping();
      console.log('[Redis] connected');
    } catch (err) {
      console.error('[Redis] connection failed:', (err as Error).message);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        try {
          this.client.disconnect();
        } catch {}
      }
    }
  }

  async set(key: string, val: string, ttl?: number) {
    if (ttl) return this.client.set(key, val, 'EX', ttl);
    return this.client.set(key, val);
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  async acquireLock(key: string, ttl = 5000) {
    const lockKey = `lock:${key}`;
    const acquired = await this.client.set(lockKey, '1', 'PX', ttl, 'NX');
    return acquired === 'OK';
  }

  async releaseLock(key: string) {
    return this.del(`lock:${key}`);
  }
}
