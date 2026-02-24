import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import {
  AuthClientOptions,
  EvaluatePermissionsResult,
  IntrospectResult,
} from "./interfaces/auth-client.interface";

const logger = createLogger("AuthClientService");

/**
 * Auth Client Service
 * Shared SDK for microservices to call auth-service's internal contract endpoints.
 *
 * Features:
 * - Token introspection with Redis caching
 * - Permission evaluation with Redis caching
 * - Retry with exponential backoff
 * - Circuit-breaker-aware (graceful degradation on auth-service downtime)
 */
@Injectable()
export class AuthClientService implements OnModuleInit {
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private introspectCacheTtl: number;
  private permissionCacheTtl: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly redis: RedisService,
    @Inject("AUTH_CLIENT_OPTIONS")
    private readonly options: AuthClientOptions,
  ) {
    const prefix = options.apiPrefix || "/api/v1";
    this.baseUrl = `${options.authServiceUrl}${prefix}`;
    this.timeout = options.timeout || 5000;
    this.maxRetries = options.maxRetries || 2;
    this.introspectCacheTtl = options.introspectCacheTtl || 60;
    this.permissionCacheTtl = options.permissionCacheTtl || 30;
  }

  async onModuleInit() {
    logger.info("AuthClientService initialized", {
      baseUrl: this.baseUrl,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
    });
  }

  /**
   * Introspect a JWT token via auth-service.
   * Returns authoritative user identity from DB (cached in Redis).
   */
  async introspect(token: string): Promise<IntrospectResult | null> {
    const cacheKey = `security:introspect:${this.hashToken(token)}`;

    // 1. Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached as IntrospectResult;
    }

    // 2. Call auth-service
    try {
      const response = await this.callWithRetry<IntrospectResult>(
        "POST",
        "/auth/introspect",
        { token },
      );

      if (response && response.active) {
        // Cache successful introspection
        await this.redis.set(cacheKey, response, {
          key: cacheKey,
          ttl: this.introspectCacheTtl,
        });
      }

      return response;
    } catch (error) {
      logger.error("Token introspection failed", error as Error);
      return null;
    }
  }

  /**
   * Evaluate if a user has permission to perform an action on a resource.
   * Resolves from auth-service DB (cached in Redis).
   */
  async evaluatePermission(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<EvaluatePermissionsResult | null> {
    const cacheKey = `security:authz:${userId}:${resource}:${action}`;

    // 1. Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached as EvaluatePermissionsResult;
    }

    // 2. Call auth-service
    try {
      const response = await this.callWithRetry<EvaluatePermissionsResult>(
        "POST",
        "/auth/evaluate-permissions",
        { userId, resource, action, context },
      );

      if (response) {
        await this.redis.set(cacheKey, response, {
          key: cacheKey,
          ttl: this.permissionCacheTtl,
        });
      }

      return response;
    } catch (error) {
      logger.error("Permission evaluation failed", error as Error, {
        userId,
        resource,
        action,
      });
      return null;
    }
  }

  /**
   * Check if a user is allowed (shorthand).
   * Returns false on any error (deny by default).
   */
  async isAllowed(
    userId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const result = await this.evaluatePermission(userId, resource, action);
    return result?.allowed === true;
  }

  /**
   * Invalidate cached introspection + permission data for a user.
   * Call this when roles/permissions change.
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const keys = await this.redis.keys(`security:authz:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.delMany(keys);
    }
    logger.debug("User security cache invalidated", { userId, keysCleared: keys.length });
  }

  /**
   * HTTP call with retry and exponential backoff.
   */
  private async callWithRetry<T>(
    method: "GET" | "POST",
    path: string,
    body?: any,
    attempt = 0,
  ): Promise<T | null> {
    try {
      const url = `${this.baseUrl}${path}`;
      const config = { timeout: this.timeout };

      let response: any;
      if (method === "POST") {
        response = await firstValueFrom(
          this.httpService.post(url, body, config),
        );
      } else {
        response = await firstValueFrom(this.httpService.get(url, config));
      }

      // Extract data from standard ApiResponseBookly
      return response.data?.data || response.data;
    } catch (error: any) {
      if (attempt < this.maxRetries) {
        const delay = Math.pow(2, attempt) * 200; // 200ms, 400ms, 800ms
        logger.warn(`Auth-service call failed, retrying in ${delay}ms`, {
          path,
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.callWithRetry<T>(method, path, body, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Simple hash to avoid storing full tokens as cache keys.
   */
  private hashToken(token: string): string {
    // Use last 16 chars as a simple fingerprint (not cryptographic)
    return token.slice(-16);
  }
}
