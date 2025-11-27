import { AuditMetadataSource } from "@libs/common/enums";
import { Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { EventBus, IEvent, IEventHandler } from "@nestjs/cqrs";
import { AUDIT_EVENT_METADATA_KEY } from "../decorators/audit-event.decorator";
import { AuditRecordRequestedEvent } from "../events";
import { AuditEventConfig } from "../interfaces";

/**
 * Wrapper genérico para event handlers que deben ser auditados
 *
 * Este interceptor se aplica automáticamente a clases decoradas con @AuditEvent()
 * y emite eventos de auditoría cuando el handler procesa un evento de dominio
 */
@Injectable()
export class AuditEventInterceptor {
  private readonly logger = new Logger(AuditEventInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Wrappear un event handler para agregar auditoría
   */
  wrap<T extends IEvent>(handler: IEventHandler<T>): IEventHandler<T> {
    const auditConfig = this.reflector.get<AuditEventConfig>(
      AUDIT_EVENT_METADATA_KEY,
      handler.constructor
    );

    // Si no hay configuración, retornar handler original
    if (!auditConfig) {
      return handler;
    }

    // Retornar handler wrapped
    const originalHandle = handler.handle.bind(handler);
    const serviceName = process.env.SERVICE_NAME || "unknown-service";

    handler.handle = async (event: T) => {
      try {
        // Ejecutar handler original
        const result = await originalHandle(event);

        // Emitir evento de auditoría
        const auditEvent = new AuditRecordRequestedEvent(
          auditConfig.extractEntityId?.(event) || "UNKNOWN",
          auditConfig.entityType,
          auditConfig.action,
          (event as any).userId || "SYSTEM",
          serviceName,
          {
            source: AuditMetadataSource.EVENT,
            eventName: (event as any).constructor?.name || "UnknownEvent",
            handler: handler.constructor.name,
          },
          new Date(),
          undefined, // beforeData
          auditConfig.includeFullEvent
            ? this.sanitizeData(event, auditConfig.excludeFields)
            : undefined
        );

        this.eventBus.publish(auditEvent);

        return result;
      } catch (error) {
        this.logger.error(
          "Error in wrapped handler",
          error.stack,
          "AuditEventInterceptor"
        );
        throw error;
      }
    };

    return handler;
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
