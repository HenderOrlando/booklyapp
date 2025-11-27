import { AuditMetadataSource } from "@libs/common/enums";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EventBus } from "@nestjs/cqrs";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AUDIT_METADATA_KEY } from "../decorators/audit.decorator";
import { AuditRecordRequestedEvent } from "../events";
import { AuditConfig } from "../interfaces";

/**
 * Interceptor que captura automáticamente el contexto HTTP y emite eventos de auditoría
 * para métodos decorados con @Audit()
 *
 * En lugar de guardar directamente en BD, emite un evento que será escuchado
 * por el reports-service
 */
@Injectable()
export class AuditHttpInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditHttpInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly eventBus: EventBus
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Obtener configuración de auditoría del método
    const auditConfig = this.reflector.get<AuditConfig>(
      AUDIT_METADATA_KEY,
      context.getHandler()
    );

    // Si no hay configuración de auditoría, continuar sin interceptar
    if (!auditConfig) {
      return next.handle();
    }

    // Obtener request HTTP
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Usuario extraído por JWT Guard

    // Capturar contexto HTTP
    const httpContext = this.extractHttpContext(request);

    // Obtener argumentos del método
    const args = context.getArgs();

    // Nombre del servicio desde variables de entorno
    const serviceName = process.env.SERVICE_NAME || "unknown-service";

    // Ejecutar método y capturar resultado
    return next.handle().pipe(
      tap(async (result) => {
        try {
          // Construir y emitir evento de auditoría
          const event = new AuditRecordRequestedEvent(
            this.extractEntityId(auditConfig, args, result),
            auditConfig.entityType,
            auditConfig.action,
            user?.id || user?.userId || "SYSTEM",
            serviceName,
            {
              source: AuditMetadataSource.HTTP,
              method: request.method,
              url: request.url,
              body: request.body,
              controller: context.getClass().name,
              handler: context.getHandler().name,
            },
            new Date(),
            auditConfig.captureBeforeData
              ? await this.captureBeforeData(auditConfig, args)
              : undefined,
            this.sanitizeData(result, auditConfig.excludeFields),
            httpContext.ip,
            httpContext.userAgent,
            httpContext.location
          );

          // Emitir evento de forma asíncrona (no bloquear respuesta)
          this.eventBus.publish(event);
        } catch (error) {
          // Log error pero no interrumpir flujo principal
          this.logger.error(
            "Error emitting audit event",
            error.stack,
            "AuditHttpInterceptor"
          );
        }
      })
    );
  }

  /**
   * Extraer contexto HTTP del request
   */
  private extractHttpContext(request: any) {
    return {
      ip:
        request.ip ||
        request.headers["x-forwarded-for"] ||
        request.connection?.remoteAddress ||
        "UNKNOWN",
      userAgent: request.headers["user-agent"] || "UNKNOWN",
      location: request.headers["x-geo-location"], // Opcional, puede venir del frontend
    };
  }

  /**
   * Extraer ID de la entidad desde args o resultado
   */
  private extractEntityId(
    config: AuditConfig,
    args: any[],
    result: any
  ): string {
    // Si hay función custom, usarla
    if (config.extractEntityId) {
      return config.extractEntityId(args);
    }

    // Por defecto, intentar obtener de resultado
    if (result?.id) {
      return result.id;
    }

    // Intentar obtener del primer argumento (DTO)
    if (args[0]?.id) {
      return args[0].id;
    }

    // Intentar obtener de params
    if (args[1]?.id) {
      return args[1].id;
    }

    return "UNKNOWN";
  }

  /**
   * Capturar estado anterior (debe implementarse por cada microservicio si es necesario)
   */
  private async captureBeforeData(
    config: AuditConfig,
    args: any[]
  ): Promise<Record<string, any> | undefined> {
    // Este método puede ser sobrescrito en implementaciones específicas
    // Por ahora retorna undefined
    return undefined;
  }

  /**
   * Sanitizar datos sensibles
   */
  private sanitizeData(
    data: any,
    excludeFields?: string[]
  ): Record<string, any> | undefined {
    if (!data) return undefined;

    // Clonar objeto para no modificar original
    const sanitized = JSON.parse(JSON.stringify(data));

    // Excluir campos sensibles por defecto
    const defaultExcludeFields = [
      "password",
      "token",
      "secret",
      "apiKey",
      "creditCard",
    ];
    const fieldsToExclude = [...defaultExcludeFields, ...(excludeFields || [])];

    // Remover campos sensibles
    fieldsToExclude.forEach((field) => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }
}
