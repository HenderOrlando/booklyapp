import { createLogger, EventPayload } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { CircuitBreakerRedisService } from "./circuit-breaker-redis.service";
import { RateLimiterRedisService } from "./rate-limiter-redis.service";

/**
 * Proxy Service
 * Servicio que maneja el routing de peticiones a los microservicios
 */
@Injectable()
export class ProxyService {
  private readonly logger = createLogger("ProxyService");
  private readonly serviceUrls: Record<string, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly eventBusService: EventBusService,
    private readonly circuitBreaker: CircuitBreakerRedisService,
    private readonly rateLimiter: RateLimiterRedisService,
  ) {
    this.serviceUrls = {
      auth:
        this.configService.get<string>("AUTH_SERVICE_URL") ||
        "http://localhost:3001",
      resources:
        this.configService.get<string>("RESOURCES_SERVICE_URL") ||
        "http://localhost:3002",
      availability:
        this.configService.get<string>("AVAILABILITY_SERVICE_URL") ||
        "http://localhost:3003",
      stockpile:
        this.configService.get<string>("STOCKPILE_SERVICE_URL") ||
        "http://localhost:3004",
      reports:
        this.configService.get<string>("REPORTS_SERVICE_URL") ||
        "http://localhost:3005",
    };

    // Registrar circuit breakers para cada servicio
    this.registerCircuitBreakers();
  }

  /**
   * Registrar circuit breakers para todos los servicios
   */
  private registerCircuitBreakers(): void {
    const services = Object.keys(this.serviceUrls);

    services.forEach((service) => {
      this.circuitBreaker.register(service, {
        failureThreshold: 5, // Abrir después de 5 fallos
        successThreshold: 2, // Cerrar después de 2 éxitos
        timeout: 60000, // 1 minuto para recuperación
        resetTimeout: 300000, // 5 minutos para reset
      });
    });

    this.logger.info(
      `Circuit breakers registered for ${services.length} services`,
    );
  }

  /**
   * Proxy de petición a un microservicio
   * Patrón híbrido con protecciones:
   * - GET → HTTP directo (síncrono) + Circuit Breaker
   * - POST/PUT/DELETE/PATCH → Event Bus eventos (asíncrono)
   * - Rate Limiting aplicado a todas las peticiones
   */
  async proxyRequest(
    service: string,
    path: string,
    method: string,
    body?: any,
    headers?: any,
    query?: any,
    userId?: string,
    userIp?: string,
  ): Promise<any> {
    const serviceUrl = this.serviceUrls[service];

    if (!serviceUrl) {
      this.logger.error(`Service not found: ${service}`);
      throw new HttpException(`Service ${service} not found`, 404);
    }

    // 1. Aplicar Rate Limiting ANTES de procesar
    await this.applyRateLimiting(userId, userIp, service);

    // 2. Decidir estrategia según el método HTTP
    // Endpoints que DEBEN ser síncronos (requieren respuesta inmediata)
    const synchronousPaths = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/verify",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/me",
    ];
    const isSynchronousEndpoint = synchronousPaths.some((sp) =>
      path.toLowerCase().startsWith(sp),
    );

    if (method.toUpperCase() === "GET" || isSynchronousEndpoint) {
      // Queries (GET) y endpoints síncronos → HTTP directo con Circuit Breaker
      return await this.circuitBreaker.execute(
        service,
        async () => {
          return await this.proxyViaHttp(
            service,
            serviceUrl,
            path,
            method,
            body,
            headers,
            query,
          );
        },
        async () => {
          // Fallback: retornar respuesta en cache o error amigable
          this.logger.warn(
            `[CIRCUIT-BREAKER] Service ${service} unavailable, using fallback`,
          );
          return {
            success: false,
            message: `Service ${service} is temporarily unavailable`,
            statusCode: 503,
          };
        },
      );
    } else {
      // Commands (POST/PUT/DELETE/PATCH) → Kafka para procesamiento asíncrono
      return await this.proxyViaEventBus(
        service,
        path,
        method,
        body,
        headers,
        query,
      );
    }
  }

  /**
   * Aplicar Rate Limiting según el contexto
   */
  private async applyRateLimiting(
    userId?: string,
    userIp?: string,
    service?: string,
  ): Promise<void> {
    try {
      if (userId) {
        // Usuario autenticado: límite por usuario
        await this.rateLimiter.checkUserLimit(userId);

        // Si se especifica servicio, también verificar límite por servicio
        if (service) {
          await this.rateLimiter.checkServiceLimit(userId, service);
        }
      } else if (userIp) {
        // Usuario no autenticado: límite por IP
        await this.rateLimiter.checkIpLimit(userIp);
      }
    } catch (error) {
      // Rate limiter lanza HttpException(429) si excede
      throw error;
    }
  }

  /**
   * Limpiar headers antes de enviar al microservicio
   */
  private cleanHeaders(headers: any): any {
    if (!headers) return {};

    const cleanedHeaders: any = {};

    // Mantener solo headers necesarios
    const allowedHeaders = ["authorization", "content-type", "accept"];

    for (const key of Object.keys(headers)) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        cleanedHeaders[key] = headers[key];
      }
    }

    return cleanedHeaders;
  }

  /**
   * Proxy vía HTTP (para queries/GET)
   */
  private async proxyViaHttp(
    service: string,
    serviceUrl: string,
    path: string,
    method: string,
    body?: any,
    headers?: any,
    query?: any,
  ): Promise<any> {
    const url = `${serviceUrl}/api/v1${path}`;

    this.logger.info(`[HTTP] Proxying ${method} ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data: body,
          headers: this.cleanHeaders(headers),
          params: query,
        }),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        `[HTTP] Error proxying to ${service}: ${error.message}`,
      );

      if (error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status || 500,
        );
      }

      throw new HttpException("Service unavailable", 503);
    }
  }

  /**
   * Proxy vía Kafka (para comandos/POST/PUT/DELETE)
   */
  private async proxyViaEventBus(
    service: string,
    path: string,
    method: string,
    body?: any,
    headers?: any,
    query?: any,
  ): Promise<any> {
    const eventId = uuidv4();
    const topic = `${service}.commands`;

    this.logger.info(`[EVENT-BUS] Publishing command to topic: ${topic}`, {
      eventId,
      method,
      path,
    });

    try {
      // Crear evento para Event Bus
      const event: EventPayload = {
        eventId,
        eventType: `${service}.${method}.${path.replace(/\//g, ".")}`,
        timestamp: new Date(),
        service: "api-gateway",
        data: {
          service,
          path,
          method,
          body,
          query,
          headers: this.cleanHeaders(headers),
        },
        metadata: {
          aggregateId: eventId,
          aggregateType: "ProxyCommand",
          version: 1,
        },
      };

      // Publicar evento a través del Event Bus
      await this.eventBusService.publish(topic, event);

      this.logger.info(`[EVENT-BUS] Command published successfully`, {
        eventId,
        topic,
      });

      // Respuesta inmediata (Fire-and-forget pattern)
      // En producción, podrías implementar Request-Reply pattern con correlationId
      return {
        success: true,
        message: "Command accepted and queued for processing",
        eventId,
        status: "processing",
      };
    } catch (error: any) {
      this.logger.error(`[EVENT-BUS] Error publishing to ${topic}`, error);

      // Fallback a HTTP si Event Bus falla
      this.logger.warn(
        `[EVENT-BUS] Falling back to HTTP for ${service}${path}`,
      );

      const serviceUrl = this.serviceUrls[service];
      if (!serviceUrl) {
        throw new HttpException(`Service ${service} not found`, 404);
      }

      return await this.proxyViaHttp(
        service,
        serviceUrl,
        path,
        method,
        body,
        headers,
        query,
      );
    }
  }
}
