import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  NotificationCategory,
  NotificationDto,
  NotificationType,
} from "../dto/websocket.dto";

const logger = createLogger("NotificationService");

/**
 * Notification Service
 * Gestiona notificaciones inApp para usuarios
 *
 * Características:
 * - Notificaciones por categoría (eventos, usuarios, recursos, reservas, etc.)
 * - Tipos de notificación (info, success, warning, error, action_required)
 * - Almacenamiento en memoria (temporal)
 * - Filtrado por usuario
 * - Marcado de leídas
 */
@Injectable()
export class NotificationService {
  private notifications: Map<string, NotificationDto[]> = new Map();
  private maxNotificationsPerUser = 100;

  /**
   * Crear notificación para usuario
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    category: NotificationCategory,
    title: string,
    message: string,
    data?: Record<string, any>,
    actionUrl?: string
  ): Promise<NotificationDto> {
    const notification: NotificationDto = {
      id: uuidv4(),
      userId,
      type,
      category,
      title,
      message,
      data,
      read: false,
      createdAt: new Date(),
      actionUrl,
    };

    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.unshift(notification);

    // Limitar número de notificaciones
    if (userNotifications.length > this.maxNotificationsPerUser) {
      userNotifications.pop();
    }

    this.notifications.set(userId, userNotifications);

    logger.info(`Notification created for user ${userId}`, {
      notificationId: notification.id,
      type,
      category,
    });

    return notification;
  }

  /**
   * Obtener notificaciones de usuario
   */
  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<NotificationDto[]> {
    const userNotifications = this.notifications.get(userId) || [];

    if (unreadOnly) {
      return userNotifications.filter((n) => !n.read);
    }

    return userNotifications;
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);

    if (!userNotifications) {
      return false;
    }

    const notification = userNotifications.find((n) => n.id === notificationId);

    if (!notification) {
      return false;
    }

    notification.read = true;

    logger.info(`Notification marked as read`, {
      userId,
      notificationId,
    });

    return true;
  }

  /**
   * Marcar todas como leídas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const userNotifications = this.notifications.get(userId);

    if (!userNotifications) {
      return 0;
    }

    let count = 0;
    userNotifications.forEach((notification) => {
      if (!notification.read) {
        notification.read = true;
        count++;
      }
    });

    logger.info(`All notifications marked as read for user ${userId}`, {
      count,
    });

    return count;
  }

  /**
   * Eliminar notificación
   */
  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);

    if (!userNotifications) {
      return false;
    }

    const index = userNotifications.findIndex((n) => n.id === notificationId);

    if (index === -1) {
      return false;
    }

    userNotifications.splice(index, 1);

    logger.info(`Notification deleted`, {
      userId,
      notificationId,
    });

    return true;
  }

  /**
   * Limpiar notificaciones antiguas
   */
  async clearOldNotifications(
    userId: string,
    daysOld: number = 30
  ): Promise<number> {
    const userNotifications = this.notifications.get(userId);

    if (!userNotifications) {
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialLength = userNotifications.length;

    const filtered = userNotifications.filter((n) => n.createdAt > cutoffDate);

    this.notifications.set(userId, filtered);

    const deleted = initialLength - filtered.length;

    if (deleted > 0) {
      logger.info(`Old notifications cleared for user ${userId}`, {
        deleted,
        daysOld,
      });
    }

    return deleted;
  }

  /**
   * Contar notificaciones no leídas
   */
  async getUnreadCount(userId: string): Promise<number> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter((n) => !n.read).length;
  }

  /**
   * Crear notificación de evento
   */
  async notifyEvent(
    userId: string,
    eventType: string,
    message: string,
    data?: Record<string, any>
  ): Promise<NotificationDto> {
    return this.createNotification(
      userId,
      NotificationType.INFO,
      NotificationCategory.EVENT,
      `Evento: ${eventType}`,
      message,
      data
    );
  }

  /**
   * Crear notificación de error
   */
  async notifyError(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<NotificationDto> {
    return this.createNotification(
      userId,
      NotificationType.ERROR,
      NotificationCategory.ERROR,
      title,
      message,
      data
    );
  }

  /**
   * Crear notificación de límite alcanzado
   */
  async notifyLimit(
    userId: string,
    resourceType: string,
    message: string,
    data?: Record<string, any>
  ): Promise<NotificationDto> {
    return this.createNotification(
      userId,
      NotificationType.WARNING,
      NotificationCategory.LIMIT,
      `Límite alcanzado: ${resourceType}`,
      message,
      data
    );
  }

  /**
   * Crear notificación de acción requerida
   */
  async notifyActionRequired(
    userId: string,
    title: string,
    message: string,
    actionUrl: string,
    data?: Record<string, any>
  ): Promise<NotificationDto> {
    return this.createNotification(
      userId,
      NotificationType.ACTION_REQUIRED,
      NotificationCategory.SYSTEM,
      title,
      message,
      data,
      actionUrl
    );
  }
}
