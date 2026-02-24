import { AuditAction } from "./audit-record.interface";

/**
 * Configuración base para decoradores de auditoría
 */
export interface BaseAuditConfig {
  /**
   * Tipo de entidad auditada
   */
  entityType: string;

  /**
   * Acción realizada
   */
  action: AuditAction;

  /**
   * Función para extraer el ID de la entidad desde los argumentos del método
   * Por defecto, asume que el primer argumento es el DTO con un campo 'id'
   */
  extractEntityId?: (args: any[]) => string;

  /**
   * Capturar estado anterior (before data)
   */
  captureBeforeData?: boolean;

  /**
   * Campos sensibles a excluir del registro
   */
  excludeFields?: string[];
}

/**
 * Configuración para decorador @Audit() (HTTP)
 */
export interface AuditConfig extends BaseAuditConfig {
  /**
   * Indicador adicional para configuración HTTP (puede extenderse)
   */
  httpSpecific?: boolean;
}

/**
 * Configuración para decorador @AuditWebSocket()
 */
export interface AuditWebSocketConfig extends BaseAuditConfig {
  /**
   * Función custom para extraer entityId desde el payload WebSocket
   */
  extractEntityId?: (payload: any) => string;

  /**
   * Capturar información del socket client
   */
  captureSocketInfo?: boolean;
}

/**
 * Configuración para decorador @AuditEvent()
 */
export interface AuditEventConfig extends BaseAuditConfig {
  /**
   * Función custom para extraer entityId desde el evento de dominio
   */
  extractEntityId?: (event: any) => string;

  /**
   * Incluir payload completo del evento en afterData
   */
  includeFullEvent?: boolean;
}
