import { Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";

/**
 * Servicio de notificaciones para mantenimientos
 * Gestiona el envío de notificaciones a usuarios afectados
 */
@Injectable()
export class MaintenanceNotificationService {
  constructor(private readonly eventBus: EventBus) {}

  /**
   * Notificar usuarios afectados por mantenimiento
   */
  async notifyAffectedUsers(data: {
    maintenanceId: string;
    resourceId: string;
    resourceName: string;
    startDate: Date;
    endDate: Date;
    description: string;
    affectedReservations: Array<{
      reservationId: string;
      userId: string;
      userEmail: string;
      userName: string;
      startTime: Date;
      endTime: Date;
    }>;
  }): Promise<void> {
    const { affectedReservations, ...maintenanceData } = data;

    // Publicar evento para cada usuario afectado
    for (const reservation of affectedReservations) {
      await this.eventBus.publish({
        type: "maintenance.user.notified",
        payload: {
          ...maintenanceData,
          reservation: {
            id: reservation.reservationId,
            startTime: reservation.startTime,
            endTime: reservation.endTime,
          },
          user: {
            id: reservation.userId,
            email: reservation.userEmail,
            name: reservation.userName,
          },
          notificationType: "email",
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Notificar inicio de mantenimiento
   */
  async notifyMaintenanceStarted(data: {
    maintenanceId: string;
    resourceId: string;
    resourceName: string;
    startDate: Date;
    endDate: Date;
    description: string;
  }): Promise<void> {
    await this.eventBus.publish({
      type: "maintenance.started",
      payload: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Notificar completitud de mantenimiento
   */
  async notifyMaintenanceCompleted(data: {
    maintenanceId: string;
    resourceId: string;
    resourceName: string;
    completedBy: string;
    completionNotes?: string;
  }): Promise<void> {
    await this.eventBus.publish({
      type: "maintenance.completed",
      payload: {
        ...data,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Notificar cancelación de mantenimiento
   */
  async notifyMaintenanceCancelled(data: {
    maintenanceId: string;
    resourceId: string;
    resourceName: string;
    cancelledBy: string;
    cancelReason: string;
    affectedReservations?: Array<{
      reservationId: string;
      userId: string;
      userEmail: string;
    }>;
  }): Promise<void> {
    await this.eventBus.publish({
      type: "maintenance.cancelled",
      payload: {
        ...data,
        timestamp: new Date(),
      },
    });

    // Notificar a usuarios que sus reservas ya no están afectadas
    if (data.affectedReservations && data.affectedReservations.length > 0) {
      for (const reservation of data.affectedReservations) {
        await this.eventBus.publish({
          type: "maintenance.cancellation.user.notified",
          payload: {
            maintenanceId: data.maintenanceId,
            resourceId: data.resourceId,
            resourceName: data.resourceName,
            reservation: {
              id: reservation.reservationId,
            },
            user: {
              id: reservation.userId,
              email: reservation.userEmail,
            },
            message:
              "El mantenimiento ha sido cancelado. Su reserva no se verá afectada.",
            timestamp: new Date(),
          },
        });
      }
    }
  }

  /**
   * Webhook para sistema de mensajería externo
   */
  async sendWebhook(data: {
    event: string;
    payload: Record<string, any>;
  }): Promise<void> {
    // Publicar evento para que sea manejado por un webhook handler
    await this.eventBus.publish({
      type: "webhook.maintenance",
      payload: {
        ...data,
        timestamp: new Date(),
      },
    });
  }
}
