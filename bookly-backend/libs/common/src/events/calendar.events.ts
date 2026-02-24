/**
 * Calendar Events - Contratos de eventos para integración de calendarios
 *
 * Define eventos para OAuth, sincronización y exportación de calendarios
 */

/**
 * Namespace de eventos relacionados con calendarios externos
 */
export namespace CalendarEvents {
  /**
   * Proveedores de calendario soportados
   */
  export enum CalendarProvider {
    GOOGLE = "GOOGLE",
    OUTLOOK = "OUTLOOK",
    APPLE = "APPLE",
  }

  /**
   * Base para requests con correlationId
   */
  export interface BaseRequest {
    correlationId: string;
  }

  /**
   * Base para responses con correlationId
   */
  export interface BaseResponse {
    correlationId: string;
  }

  // ============================================================
  // OAuth: Delegar autenticación a auth-service
  // ============================================================

  /**
   * Request para obtener URL de autorización OAuth
   * (auth-service gestiona esto)
   */
  export interface RequestOAuthUrlRequest extends BaseRequest {
    provider: CalendarProvider;
    userId: string;
    scopes: string[];
    redirectUri: string;
  }

  /**
   * Response con URL de autorización
   */
  export interface RequestOAuthUrlResponse extends BaseResponse {
    authorizationUrl: string;
    state: string;
    provider: CalendarProvider;
  }

  export const REQUEST_OAUTH_URL = "calendar.oauth.requestUrl";
  export const REQUEST_OAUTH_URL_RESPONSE =
    "calendar.oauth.requestUrl.response";

  // ============================================================
  // OAuth: Intercambiar código por tokens
  // ============================================================

  /**
   * Request para intercambiar código OAuth por tokens
   */
  export interface ExchangeOAuthCodeRequest extends BaseRequest {
    provider: CalendarProvider;
    code: string;
    redirectUri: string;
    userId: string;
  }

  /**
   * Response con tokens OAuth
   */
  export interface ExchangeOAuthCodeResponse extends BaseResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date | string;
    userEmail: string;
    success: boolean;
    error?: string;
  }

  export const EXCHANGE_OAUTH_CODE = "calendar.oauth.exchangeCode";
  export const EXCHANGE_OAUTH_CODE_RESPONSE =
    "calendar.oauth.exchangeCode.response";

  // ============================================================
  // Export: Exportar reserva a calendario externo
  // ============================================================

  /**
   * Datos de reserva para exportar
   */
  export interface ReservationData {
    id: string;
    title: string;
    description?: string;
    startDate: Date | string;
    endDate: Date | string;
    resourceName?: string;
    location?: string;
  }

  /**
   * Event: Exportar reserva a calendario externo
   */
  export interface ExportReservationToCalendar {
    userId: string;
    reservationId: string;
    reservation: ReservationData;
    providers?: CalendarProvider[];
  }

  export const EXPORT_RESERVATION = "calendar.export.reservation";

  // ============================================================
  // Export: Confirmación de exportación
  // ============================================================

  /**
   * Event: Reserva exportada exitosamente
   */
  export interface ReservationExported {
    userId: string;
    reservationId: string;
    provider: CalendarProvider;
    externalEventId: string;
    exportedAt: Date | string;
  }

  export const RESERVATION_EXPORTED = "calendar.export.reservation.success";

  /**
   * Event: Error al exportar reserva
   */
  export interface ReservationExportFailed {
    userId: string;
    reservationId: string;
    provider: CalendarProvider;
    error: string;
    failedAt: Date | string;
  }

  export const RESERVATION_EXPORT_FAILED = "calendar.export.reservation.failed";

  // ============================================================
  // Import: Importar evento desde calendario externo
  // ============================================================

  /**
   * Event: Evento importado desde calendario externo
   */
  export interface CalendarEventImported {
    userId: string;
    provider: CalendarProvider;
    externalEventId: string;
    event: {
      title: string;
      description?: string;
      startDate: Date | string;
      endDate: Date | string;
      location?: string;
      attendees?: string[];
    };
    importedAt: Date | string;
  }

  export const CALENDAR_EVENT_IMPORTED = "calendar.import.event";

  // ============================================================
  // Sync: Sincronización de calendario
  // ============================================================

  /**
   * Command: Solicitar sincronización de calendario
   */
  export interface RequestCalendarSync {
    userId: string;
    provider: CalendarProvider;
    startDate: Date | string;
    endDate: Date | string;
    syncDirection: "import" | "export" | "bidirectional";
  }

  export const REQUEST_CALENDAR_SYNC = "calendar.sync.request";

  /**
   * Event: Sincronización completada
   */
  export interface CalendarSyncCompleted {
    userId: string;
    provider: CalendarProvider;
    eventsImported: number;
    eventsExported: number;
    errors: number;
    completedAt: Date | string;
  }

  export const CALENDAR_SYNC_COMPLETED = "calendar.sync.completed";

  // ============================================================
  // Connection: Gestión de conexiones
  // ============================================================

  /**
   * Event: Calendario conectado
   */
  export interface CalendarConnected {
    userId: string;
    provider: CalendarProvider;
    externalEmail: string;
    connectedAt: Date | string;
  }

  export const CALENDAR_CONNECTED = "calendar.connection.connected";

  /**
   * Event: Calendario desconectado
   */
  export interface CalendarDisconnected {
    userId: string;
    provider: CalendarProvider;
    disconnectedAt: Date | string;
    reason?: string;
  }

  export const CALENDAR_DISCONNECTED = "calendar.connection.disconnected";

  // ============================================================
  // Errors: Errores de sincronización
  // ============================================================

  /**
   * Event: Error de token OAuth
   */
  export interface CalendarTokenError {
    userId: string;
    provider: CalendarProvider;
    error: "expired" | "invalid" | "revoked";
    errorAt: Date | string;
  }

  export const CALENDAR_TOKEN_ERROR = "calendar.error.token";

  /**
   * Event: Error de sincronización
   */
  export interface CalendarSyncError {
    userId: string;
    provider: CalendarProvider;
    operation: "import" | "export" | "sync";
    error: string;
    errorAt: Date | string;
  }

  export const CALENDAR_SYNC_ERROR = "calendar.error.sync";
}
