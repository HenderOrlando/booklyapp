import { RedisService } from "@libs/redis";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Cache Active Approvals Interceptor
 * Intercepta las llamadas al endpoint de aprobaciones activas y cachea la respuesta en Redis
 * RF-23: Cache de 5 minutos para optimizar consultas frecuentes
 */
@Injectable()
export class CacheActiveApprovalsInterceptor implements NestInterceptor {
  private readonly CACHE_TTL = 300; // 5 minutos en segundos

  constructor(private readonly redisService: RedisService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    // Intentar obtener del cache
    const cachedResponse = await this.redisService.getCachedWithPrefix(
      "CACHE",
      cacheKey
    );

    if (cachedResponse) {
      return of(cachedResponse);
    }

    // Si no hay cache, ejecutar la llamada y cachear el resultado
    return next.handle().pipe(
      tap(async (response) => {
        await this.redisService.cacheWithPrefix(
          "CACHE",
          cacheKey,
          response,
          this.CACHE_TTL
        );
      })
    );
  }

  /**
   * Genera una clave de cache única basada en los query parameters
   */
  private generateCacheKey(request: any): string {
    const { date, page, limit, resourceId, programId, resourceType } =
      request.query;

    const params = [
      "active-approvals",
      date || "today",
      page || "1",
      limit || "20",
      resourceId || "all",
      programId || "all",
      resourceType || "all",
    ];

    return params.join(":");
  }
}
