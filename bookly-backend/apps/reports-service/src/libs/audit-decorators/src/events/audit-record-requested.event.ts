import { AuditMetadataSource } from "@libs/common/enums";
import { AuditAction } from "../interfaces";

/**
 * Evento emitido cuando se solicita registrar una auditoría
 * Los interceptores (@Audit, @AuditWebSocket, @AuditEvent) emiten este evento
 * El reports-service lo escucha y persiste en la base de datos
 */
export class AuditRecordRequestedEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly action: AuditAction,
    public readonly userId: string,
    public readonly serviceName: string,
    public readonly metadata: {
      source: AuditMetadataSource;
      method?: string;
      url?: string;
      body?: Record<string, any>;
      eventName?: string;
      controller?: string;
      handler?: string;
      [key: string]: any;
    },
    public readonly timestamp: Date,
    public readonly beforeData?: Record<string, any>,
    public readonly afterData?: Record<string, any>,
    public readonly ip?: string,
    public readonly userAgent?: string,
    public readonly location?: string
  ) {}
}
