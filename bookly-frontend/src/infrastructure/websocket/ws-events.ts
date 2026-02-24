/**
 * WebSocket Events - Definición de eventos tipados
 *
 * Todos los eventos WebSocket del sistema están definidos aquí
 * para type safety y autocomplete.
 */

/**
 * Estructura de un evento WebSocket
 */
export interface WSEvent<T = any> {
  event: string;
  data: T;
  timestamp: number;
}

/**
 * Handler de eventos
 */
export type WSEventHandler<T = any> = (data: T) => void;

/**
 * Eventos de conexión
 */
export const connectionEvents = {
  connected: "connection:connected",
  disconnected: "connection:disconnected",
  reconnecting: "connection:reconnecting",
  error: "connection:error",
  stateChange: "connection:stateChange",
  maxReconnectFailed: "connection:maxReconnectFailed",
} as const;

/**
 * Eventos de heartbeat
 */
export const heartbeatEvents = {
  ping: "heartbeat:ping",
  pong: "heartbeat:pong",
} as const;

/**
 * Eventos de reservas
 */
export const reservationEvents = {
  created: "reservation:created",
  updated: "reservation:updated",
  cancelled: "reservation:cancelled",
  confirmed: "reservation:confirmed",
  completed: "reservation:completed",
  reminderSent: "reservation:reminderSent",
} as const;

/**
 * Eventos de recursos
 */
export const resourceEvents = {
  created: "resource:created",
  updated: "resource:updated",
  deleted: "resource:deleted",
  availabilityChanged: "resource:availabilityChanged",
  maintenanceScheduled: "resource:maintenanceScheduled",
  maintenanceCompleted: "resource:maintenanceCompleted",
} as const;

/**
 * Eventos de notificaciones
 */
export const notificationEvents = {
  new: "notification:new",
  read: "notification:read",
  deleted: "notification:deleted",
} as const;

/**
 * Eventos del sistema
 */
export const systemEvents = {
  message: "system:message",
  maintenance: "system:maintenance",
  broadcast: "system:broadcast",
} as const;

/**
 * Todos los eventos disponibles
 */
export const wsEvents = {
  connection: connectionEvents,
  heartbeat: heartbeatEvents,
  reservation: reservationEvents,
  resource: resourceEvents,
  notification: notificationEvents,
  system: systemEvents,
} as const;

/**
 * Tipos de datos para eventos específicos
 */

export interface ReservationCreatedData {
  reservation: {
    id: string;
    resourceId: string;
    resourceName: string;
    userId: string;
    userName: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export interface ReservationUpdatedData {
  reservation: {
    id: string;
    changes: Record<string, any>;
  };
}

export interface ResourceUpdatedData {
  resource: {
    id: string;
    name: string;
    changes: Record<string, any>;
  };
}

export interface NotificationNewData {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    priority: string;
  };
}

export interface SystemMessageData {
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: number;
}
