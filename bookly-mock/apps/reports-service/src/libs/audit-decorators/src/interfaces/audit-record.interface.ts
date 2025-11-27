import { AuditMetadataSource } from "@libs/common/enums";

/**
 * Interfaz para registros de auditoría reutilizable en todos los microservicios
 * Usado por decoradores @Audit(), @AuditWebSocket() y @AuditEvent()
 */
export interface IAuditRecord {
  /**
   * ID del recurso auditado (ej: reservationId, resourceId, userId)
   */
  entityId: string;

  /**
   * Tipo de entidad auditada (ej: RESERVATION, RESOURCE, USER)
   */
  entityType: string;

  /**
   * Acción realizada
   */
  action: AuditAction;

  /**
   * Estado anterior del recurso (opcional)
   */
  beforeData?: Record<string, any>;

  /**
   * Estado nuevo del recurso
   */
  afterData?: Record<string, any>;

  /**
   * ID del usuario que realizó la acción
   */
  userId: string;

  /**
   * IP del cliente (opcional para eventos internos)
   */
  ip?: string;

  /**
   * User-Agent del navegador (opcional)
   */
  userAgent?: string;

  /**
   * Geolocalización (opcional)
   */
  location?: string;

  /**
   * Timestamp de la acción
   */
  timestamp: Date;

  /**
   * Nombre del microservicio que emite el evento
   */
  serviceName: string;

  /**
   * Metadatos adicionales específicos del tipo de fuente
   */
  metadata: {
    /**
     * Fuente del evento: http, websocket o event
     */
    source: AuditMetadataSource;

    /**
     * Método HTTP (solo para source: http)
     */
    method?: string;

    /**
     * URL del endpoint (solo para source: http)
     */
    url?: string;

    /**
     * Nombre del evento (para websocket y event)
     */
    eventName?: string;

    /**
     * Nombre del controlador/handler
     */
    controller?: string;

    /**
     * Nombre del método handler
     */
    handler?: string;

    /**
     * Datos adicionales
     */
    [key: string]: any;
  };
}

/**
 * Tipos de acciones auditables
 */
export enum AuditAction {
  // CRUD básico
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  VIEWED = "VIEWED",

  // Reservas
  CANCELLED = "CANCELLED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  NO_SHOW = "NO_SHOW",

  // Aprobaciones
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",

  // Autenticación
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOGIN_FAILED = "LOGIN_FAILED",
  PASSWORD_RESET = "PASSWORD_RESET",

  // Comunicación
  SENT = "SENT",
  RECEIVED = "RECEIVED",
  NOTIFIED = "NOTIFIED",

  // Acceso y exportación
  ACCESSED = "ACCESSED",
  EXPORTED = "EXPORTED",
  IMPORTED = "IMPORTED",

  // Modificaciones masivas
  BULK_UPDATE = "BULK_UPDATE",
  BULK_DELETE = "BULK_DELETE",
}

/**
 * Interfaz para opciones de consulta de historial
 */
export interface IAuditQueryOptions {
  entityId?: string;
  entityType?: string;
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  serviceName?: string;
  source?: "http" | "websocket" | "event";
}

/**
 * Interfaz para resultado paginado de auditoría
 */
export interface IAuditQueryResult {
  records: IAuditRecord[];
  total: number;
  page: number;
  totalPages: number;
}
