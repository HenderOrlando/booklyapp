import { Logger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Injectable } from "@nestjs/common";
import { IdempotencyRecord } from "../interfaces/idempotency.interface";

/**
 * Service for managing idempotency of operations
 * Prevents duplicate processing of operations using Redis as storage
 */
@Injectable()
export class IdempotencyService {
  private readonly keyPrefix = "idempotency:";
  private readonly defaultTtl = 86400; // 24 hours
  private readonly logger = new Logger("IdempotencyService");

  constructor(private readonly redis: RedisService) {}

  /**
   * Check if an operation with the given idempotency key has been processed
   * @returns 'new' | 'duplicate' | 'completed'
   */
  async checkIdempotency(
    idempotencyKey: string
  ): Promise<"new" | "duplicate" | "completed"> {
    try {
      const key = this.buildKey(idempotencyKey);
      const record = await this.redis.get(key);

      if (!record) {
        return "new";
      }

      const parsed: IdempotencyRecord = JSON.parse(record);

      if (parsed.status === "completed") {
        this.logger.info("Idempotent operation - already completed", {
          idempotencyKey,
          messageId: parsed.messageId,
          correlationId: parsed.correlationId,
        });
        return "completed";
      }

      if (parsed.status === "processing") {
        this.logger.warn("Idempotent operation - already processing", {
          idempotencyKey,
          messageId: parsed.messageId,
        });
        return "duplicate";
      }

      return "new";
    } catch (error) {
      this.logger.error("Error checking idempotency", error, {
        idempotencyKey,
      });
      // Fail open - allow operation to proceed
      return "new";
    }
  }

  /**
   * Start tracking an operation
   * Uses Redis SET NX to ensure only one instance can start the operation
   */
  async startOperation(
    idempotencyKey: string,
    correlationId: string,
    messageId: string,
    ttl: number = this.defaultTtl
  ): Promise<"new" | "duplicate"> {
    try {
      const key = this.buildKey(idempotencyKey);
      const record: IdempotencyRecord = {
        key: idempotencyKey,
        messageId,
        correlationId,
        status: "processing",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttl * 1000),
        retryCount: 0,
      };

      // NX = only set if not exists
      // Use native Redis client for SET with NX option
      const client = this.redis.getClient();
      const result = await client.set(key, JSON.stringify(record), {
        EX: ttl,
        NX: true,
      });

      if (result === "OK") {
        this.logger.debug("Operation started", {
          idempotencyKey,
          messageId,
          correlationId,
        });
        return "new";
      }

      // If result is null, key already exists
      this.logger.warn("Operation already in progress", {
        idempotencyKey,
        messageId,
      });
      return "duplicate";
    } catch (error) {
      this.logger.error("Error starting operation", error, { idempotencyKey });
      throw error;
    }
  }

  /**
   * Mark an operation as completed and cache its result
   */
  async completeOperation(
    idempotencyKey: string,
    result: any,
    ttl: number = this.defaultTtl
  ): Promise<void> {
    try {
      const key = this.buildKey(idempotencyKey);
      const recordStr = await this.redis.get(key);

      if (!recordStr) {
        this.logger.warn("No record found to complete", { idempotencyKey });
        return;
      }

      const record: IdempotencyRecord = JSON.parse(recordStr);
      record.status = "completed";
      record.result = result;

      await this.redis.setString(key, JSON.stringify(record), ttl);

      this.logger.debug("Operation completed", {
        idempotencyKey,
        messageId: record.messageId,
        correlationId: record.correlationId,
      });
    } catch (error) {
      this.logger.error("Error completing operation", error, {
        idempotencyKey,
      });
      throw error;
    }
  }

  /**
   * Mark an operation as failed
   */
  async failOperation(
    idempotencyKey: string,
    error: Error,
    ttl: number = 3600 // 1 hour for failed operations
  ): Promise<void> {
    try {
      const key = this.buildKey(idempotencyKey);
      const recordStr = await this.redis.get(key);

      if (!recordStr) {
        this.logger.warn("No record found to fail", { idempotencyKey });
        return;
      }

      const record: IdempotencyRecord = JSON.parse(recordStr);
      record.status = "failed";
      record.error = error.message;
      record.retryCount = (record.retryCount || 0) + 1;

      await this.redis.setString(key, JSON.stringify(record), ttl);

      this.logger.error("Operation failed", error, {
        idempotencyKey,
        messageId: record.messageId,
        retryCount: record.retryCount,
      });
    } catch (err) {
      this.logger.error("Error failing operation", err, { idempotencyKey });
      throw err;
    }
  }

  /**
   * Get the result of a completed operation
   */
  async getOperationResult(idempotencyKey: string): Promise<any | null> {
    try {
      const key = this.buildKey(idempotencyKey);
      const recordStr = await this.redis.get(key);

      if (!recordStr) {
        return null;
      }

      const record: IdempotencyRecord = JSON.parse(recordStr);

      if (record.status === "completed") {
        this.logger.debug("Returning cached result", {
          idempotencyKey,
          messageId: record.messageId,
        });
        return record.result;
      }

      return null;
    } catch (error) {
      this.logger.error("Error getting operation result", error, {
        idempotencyKey,
      });
      return null;
    }
  }

  /**
   * Generate an idempotency key from components
   */
  generateIdempotencyKey(...components: any[]): string {
    return components
      .filter((c) => c !== undefined && c !== null)
      .map((c) => String(c))
      .join("-");
  }

  /**
   * Delete an idempotency record (use with caution)
   */
  async deleteRecord(idempotencyKey: string): Promise<void> {
    try {
      const key = this.buildKey(idempotencyKey);
      await this.redis.del(key);

      this.logger.debug("Idempotency record deleted", { idempotencyKey });
    } catch (error) {
      this.logger.error("Error deleting idempotency record", error, {
        idempotencyKey,
      });
      throw error;
    }
  }

  /**
   * Build full Redis key with prefix
   */
  private buildKey(idempotencyKey: string): string {
    return `${this.keyPrefix}${idempotencyKey}`;
  }
}
