/**
 * NotificationsClient - Cliente HTTP para gestión de notificaciones
 *
 * Proporciona métodos type-safe para:
 * - Obtener y gestionar notificaciones
 * - Marcar como leídas
 * - Configurar preferencias de notificaciones
 * - Gestionar suscripciones
 *
 * Todos los métodos usan BaseHttpClient para aprovechar interceptors.
 */

import type { ApiResponse, PaginatedResponse } from "@/types/api/response";
import type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  Subscription,
  UpdatePreferencesDto,
} from "@/types/entities/notification";
import { BaseHttpClient } from "./base-client";

export class NotificationsClient {
  /**
   * Obtener todas las notificaciones del usuario
   */
  static async getAll(): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    return BaseHttpClient.request<PaginatedResponse<Notification>>(
      "/notifications",
      "GET"
    );
  }

  /**
   * Obtener notificación por ID
   */
  static async getById(id: string): Promise<ApiResponse<Notification>> {
    return BaseHttpClient.request<Notification>(`/notifications/${id}`, "GET");
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return BaseHttpClient.request<Notification>(
      `/notifications/${id}/read`,
      "PATCH"
    );
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(): Promise<ApiResponse<void>> {
    return BaseHttpClient.request<void>("/notifications/read-all", "PATCH");
  }

  /**
   * Eliminar notificación
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    return BaseHttpClient.request<void>(`/notifications/${id}`, "DELETE");
  }

  /**
   * Obtener notificaciones no leídas
   */
  static async getUnread(): Promise<
    ApiResponse<PaginatedResponse<Notification>>
  > {
    return BaseHttpClient.request<PaginatedResponse<Notification>>(
      "/notifications/unread",
      "GET"
    );
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  static async getStats(): Promise<ApiResponse<NotificationStats>> {
    return BaseHttpClient.request<NotificationStats>(
      "/notifications/stats",
      "GET"
    );
  }

  /**
   * Obtener preferencias de notificaciones del usuario
   */
  static async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return BaseHttpClient.request<NotificationPreferences>(
      "/notifications/preferences",
      "GET"
    );
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  static async updatePreferences(
    data: UpdatePreferencesDto
  ): Promise<ApiResponse<NotificationPreferences>> {
    return BaseHttpClient.request<NotificationPreferences>(
      "/notifications/preferences",
      "PATCH",
      data
    );
  }

  /**
   * Suscribirse a un canal de notificaciones
   */
  static async subscribe(
    channelId: string
  ): Promise<ApiResponse<Subscription>> {
    return BaseHttpClient.request<Subscription>(
      `/notifications/subscribe/${channelId}`,
      "POST"
    );
  }

  /**
   * Desuscribirse de un canal
   */
  static async unsubscribe(channelId: string): Promise<ApiResponse<void>> {
    return BaseHttpClient.request<void>(
      `/notifications/unsubscribe/${channelId}`,
      "DELETE"
    );
  }

  /**
   * Obtener suscripciones activas
   */
  static async getSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return BaseHttpClient.request<Subscription[]>(
      "/notifications/subscriptions",
      "GET"
    );
  }
}
