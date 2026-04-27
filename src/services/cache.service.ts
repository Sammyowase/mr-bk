import Redis from "ioredis";
import { inject, injectable } from "tsyringe";

@injectable()
class CacheService {
  constructor(@inject("RedisConnection") private client: Redis) {}

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, data, "EX", ttlSeconds);
    } else {
      await this.client.set(key, data);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    return result ? (JSON.parse(result) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async has(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async flush(): Promise<void> {
    await this.client.flushdb();
  }

  generateKey(...args: string[]): string {
    return args.join(":");
  }
}

export default CacheService;
