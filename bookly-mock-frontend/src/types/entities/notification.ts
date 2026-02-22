/**
 * Tipos para Notifications
 */

export type NotificationType =
  | "RESERVATION_CREATED"
  | "RESERVATION_CONFIRMED"
  | "RESERVATION_CANCELLED"
  | "RESERVATION_REMINDER"
  | "RESOURCE_UPDATED"
  | "RESOURCE_UNAVAILABLE"
  | "SYSTEM_MESSAGE"
  | "MAINTENANCE_SCHEDULED";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";

/**
 * Notificación
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  userId: string;
  relatedEntityId?: string; // ID de reserva, recurso, etc.
  relatedEntityType?: "RESERVATION" | "RESOURCE" | "USER";
  actionUrl?: string; // URL para navegar al hacer click
  actionLabel?: string; // Texto del botón de acción
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

/**
 * Preferencias de notificaciones
 */
export interface NotificationPreferences {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  types: {
    reservationCreated: boolean;
    reservationConfirmed: boolean;
    reservationCancelled: boolean;
    reservationReminder: boolean;
    resourceUpdated: boolean;
    resourceUnavailable: boolean;
    systemMessage: boolean;
    maintenanceScheduled: boolean;
  };
  reminderTiming: number; // Minutos antes
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
  updatedAt: string;
}

/**
 * Suscripción a canal
 */
export interface Subscription {
  id: string;
  userId: string;
  channelId: string;
  channelName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para actualizar preferencias
 */
export interface UpdatePreferencesDto {
  channels?: {
    inApp?: boolean;
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  types?: {
    reservationCreated?: boolean;
    reservationConfirmed?: boolean;
    reservationCancelled?: boolean;
    reservationReminder?: boolean;
    resourceUpdated?: boolean;
    resourceUnavailable?: boolean;
    systemMessage?: boolean;
    maintenanceScheduled?: boolean;
  };
  reminderTiming?: number;
  quietHours?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
  };
}

/**
 * Estadísticas de notificaciones
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}
