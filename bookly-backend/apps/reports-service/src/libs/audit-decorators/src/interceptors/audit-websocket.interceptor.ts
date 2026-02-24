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
import { AUDIT_WEBSOCKET_METADATA_KEY } from "../decorators/audit-websocket.decorator";
import { AuditRecordRequestedEvent } from "../events";
import { AuditWebSocketConfig } from "../interfaces";

/**
 * Interceptor que captura automáticamente el contexto WebSocket y emite eventos de auditoría
 * para handlers decorados con @AuditWebSocket()
 */
@Injectable()
export class AuditWebSocketInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditWebSocketInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly eventBus: EventBus
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Obtener configuración de auditoría del método
    const auditConfig = this.reflector.get<AuditWebSocketConfig>(
      AUDIT_WEBSOCKET_METADATA_KEY,
      context.getHandler()
    );

    // Si no hay configuración de auditoría, continuar sin interceptar
    if (!auditConfig) {
      return next.handle();
    }

    // Obtener cliente y datos WebSocket
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    // Extraer usuario desde handshake
    const user = client.handshake?.user;

    // Nombre del servicio
    const serviceName = process.env.SERVICE_NAME || "unknown-service";

    // Ejecutar handler y capturar resultado
    return next.handle().pipe(
      tap(async (result) => {
        try {
          // Construir y emitir evento de auditoría
          const event = new AuditRecordRequestedEvent(
            auditConfig.extractEntityId?.(data) || "UNKNOWN",
            auditConfig.entityType,
            auditConfig.action,
            user?.id || user?.userId || "SYSTEM",
            serviceName,
            {
              source: AuditMetadataSource.WEBSOCKET,
              eventName: data?.event || context.getHandler().name,
              controller: context.getClass().name,
              handler: context.getHandler().name,
              socketId: client.id,
            },
            new Date(),
            undefined, // beforeData no aplica típicamente en WebSocket
            this.sanitizeData(result, auditConfig.excludeFields),
            client.handshake?.address || client.conn?.remoteAddress,
            client.handshake?.headers["user-agent"]
          );

          // Emitir evento de forma asíncrona
          this.eventBus.publish(event);
        } catch (error) {
          this.logger.error(
            "Error emitting audit event",
            error.stack,
            "AuditWebSocketInterceptor"
          );
        }
      })
    );
  }

  /**
   * Sanitizar datos sensibles
   */
  private sanitizeData(
    data: any,
    excludeFields?: string[]
  ): Record<string, any> | undefined {
    if (!data) return undefined;

    const sanitized = JSON.parse(JSON.stringify(data));
    const defaultExcludeFields = ["password", "token", "secret", "apiKey"];
    const fieldsToExclude = [...defaultExcludeFields, ...(excludeFields || [])];

    fieldsToExclude.forEach((field) => {
      if (sanitized[field]) {
        delete sanitized[field];
      }
    });

    return sanitized;
  }
}
