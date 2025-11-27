import { CACHE_TTL, REDIS_PREFIXES } from "@libs/common/constants";
import { CacheOptions } from "@libs/common";
import { createLogger } from "@libs/common";
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";
import { RedisModuleOptions } from "./redis.module";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = createLogger("RedisService");

  constructor(
    @Inject("REDIS_OPTIONS") private options: RedisModuleOptions,
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    try {
      const host =
        this.options.host ||
        this.configService.get<string>("REDIS_HOST", "localhost");
      const port =
        this.options.port || this.configService.get<number>("REDIS_PORT", 6379);
      const password =
        this.options.password ||
        this.configService.get<string>("REDIS_PASSWORD");
      const db =
        this.options.db || this.configService.get<number>("REDIS_DB", 0);

      this.client = createClient({
        url: `redis://${password ? `:${password}@` : ""}${host}:${port}/${db}`,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 20) {
              this.logger.error("❌ Max Redis reconnection attempts reached");
              return false; // Stop reconnecting
            }
            const delay = Math.min(retries * 100, 3000);
            return delay;
          },
        },
      });

      this.client.on("error", (error) => {
        // Suppress connection errors during reconnection attempts
        if (error.message && error.message.includes("ECONNREFUSED")) {
          return; // Ignore connection refused errors during reconnect
        }
        this.logger.error("❌ Redis Client Error:", error.message || error);
      });

      this.client.on("ready", () => {
        this.logger.info("✅ Redis ready and operational", { host, port, db });
      });

      this.client.on("reconnecting", () => {
        this.logger.info("🔄 Redis reconnecting...");
      });

      this.client.on("end", () => {
        this.logger.warn("⚠️ Redis connection ended");
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error("Failed to connect to Redis", error as Error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.client && this.client.isOpen) {
        await this.client.quit();
        this.logger.info("✅ Redis disconnected successfully");
      }
    } catch (error) {
      this.logger.error("❌ Error disconnecting Redis", error as Error);
    }
  }

  /**
   * Check if Redis client is ready
   */
  private isReady(): boolean {
    return this.client && this.client.isReady;
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (!this.isReady()) {
        this.logger.warn("Redis client not ready, skipping get operation");
        return null;
      }
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get key: ${key}`, error as Error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      if (!this.isReady()) {
        this.logger.warn("Redis client not ready, skipping set operation");
        return;
      }
      const ttl = options?.ttl || CACHE_TTL;
      const serialized = JSON.stringify(value);

      await this.client.setEx(key, ttl, serialized);

      this.logger.debug(`Cached key: ${key}`, { ttl });
    } catch (error) {
      this.logger.error(`Failed to set key: ${key}`, error as Error);
      // Don't throw, just log - caching failures shouldn't break the app
    }
  }

  /**
   * Set string value with TTL (sin serialización JSON)
   */
  async setString(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const expiration = ttl || CACHE_TTL;
      await this.client.setEx(key, expiration, value);

      this.logger.debug(`Set string key: ${key}`, { ttl: expiration });
    } catch (error) {
      this.logger.error(`Failed to set string key: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Get string value (sin deserialización JSON)
   */
  async getString(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get string key: ${key}`, error as Error);
      return null;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug(`Deleted key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete key: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;
      await this.client.del(keys);
      this.logger.debug(`Deleted ${keys.length} keys`);
    } catch (error) {
      this.logger.error("Failed to delete multiple keys", error as Error);
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Failed to check existence of key: ${key}`,
        error as Error
      );
      return false;
    }
  }

  /**
   * Set expiration time for key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
      this.logger.debug(`Set expiration for key: ${key}`, { seconds });
    } catch (error) {
      this.logger.error(
        `Failed to set expiration for key: ${key}`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(
        `Failed to get keys with pattern: ${pattern}`,
        error as Error
      );
      return [];
    }
  }

  /**
   * Flush all keys in current database
   */
  async flushDb(): Promise<void> {
    try {
      await this.client.flushDb();
      this.logger.warn("Flushed all keys in current database");
    } catch (error) {
      this.logger.error("Failed to flush database", error as Error);
      throw error;
    }
  }

  /**
   * Get time to live for key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key: ${key}`, error as Error);
      return -1;
    }
  }

  /**
   * Increment value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Failed to increment key: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Decrement value
   */
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      this.logger.error(`Failed to decrement key: ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Cache with prefix (session, cache, lock, rate_limit)
   */
  async cacheWithPrefix(
    prefix: keyof typeof REDIS_PREFIXES,
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    const fullKey = `${REDIS_PREFIXES[prefix]}${key}`;
    await this.set(fullKey, value, { key: fullKey, ttl });
  }

  /**
   * Get cached value with prefix
   */
  async getCachedWithPrefix<T = any>(
    prefix: keyof typeof REDIS_PREFIXES,
    key: string
  ): Promise<T | null> {
    const fullKey = `${REDIS_PREFIXES[prefix]}${key}`;
    return await this.get<T>(fullKey);
  }

  /**
   * Delete cached value with prefix
   */
  async deleteCachedWithPrefix(
    prefix: keyof typeof REDIS_PREFIXES,
    key: string
  ): Promise<void> {
    const fullKey = `${REDIS_PREFIXES[prefix]}${key}`;
    await this.del(fullKey);
  }

  /**
   * Check if Redis is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      this.logger.error("Redis health check failed", error as Error);
      return false;
    }
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient(): RedisClientType {
    return this.client;
  }
}
