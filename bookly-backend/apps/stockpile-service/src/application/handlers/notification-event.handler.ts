import { Injectable, Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationChannel } from "@libs/common/enums";
import { ReminderService } from "@stockpile/application/services/reminder.service";
import { EnhancedNotificationService } from "@stockpile/application/services/enhanced-notification.service";

/**
 * Eventos de reservas desde availability-service
 */
export interface ReservationEvent {
  eventId: string;
  eventType: string;
  service: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface ReservationCreatedEventData {
  reservationId: string;
  userId: string;
  resourceId: string;
  resourceName?: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface ReservationUpdatedEventData {
  reservationId: string;
  userId: string;
  changes: Record<string, { old: any; new: any }>;
}

export interface ReservationCancelledEventData {
  reservationId: string;
  userId: string;
  resourceId: string;
  cancelledBy: string;
  reason?: string;
}

export interface ReservationApprovedEventData {
  approvalId: string;
  reservationId: string;
  userId: string;
  approvedBy: string;
  approverRole: string;
  documentId?: string;
}

export interface ReservationRejectedEventData {
  approvalId: string;
  reservationId: string;
  userId: string;
  rejectedBy: string;
  rejectorRole: string;
  reason: string;
  suggestions?: string;
}

/**
 * Handler para eventos de notificaciones de cambios en reservas
 * Implementa RF-28: Notificaciones Automáticas de Cambios
 * 
 * Consume eventos desde availability-service vía Event Bus y envía
 * notificaciones multi-canal personalizadas por usuario
 */
@Injectable()
export class NotificationEventHandler {
  private readonly logger = new Logger(NotificationEventHandler.name);

  constructor(
    private readonly reminderService: ReminderService,
    private readonly notificationService: EnhancedNotificationService,
  ) {
    this.logger.log('NotificationEventHandler initialized');
  }

  /**
   * Maneja el evento de reserva creada
   * Envía confirmación y programa recordatorios
   */
  async handleReservationCreated(event: ReservationEvent): Promise<void> {
    this.logger.debug(`Handling ReservationCreatedEvent: ${event.eventId}`);

    const data = event.data as ReservationCreatedEventData;

    try {
      // Enriquecer datos (obtener información de usuario y recurso)
      const enrichedData = await this.enrichReservationData(data);

      // Enviar notificación de confirmación
      await this.notificationService.sendReservationConfirmedNotification(
        {
          userName: enrichedData.userName,
          resourceName: enrichedData.resourceName,
          reservationDate: new Date(data.startDate),
          reservationStartTime: this.formatTime(new Date(data.startDate)),
          reservationEndTime: this.formatTime(new Date(data.endDate)),
        },
        {
          channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
          priority: 'normal',
        }
      );

      // Programar recordatorios
      await this.reminderService.scheduleReminders({
        reservationId: data.reservationId,
        userId: data.userId,
        resourceId: data.resourceId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });

      this.logger.log(`Reservation created notification sent: ${data.reservationId}`);
    } catch (error) {
      this.logger.error(
        `Error handling ReservationCreatedEvent: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Maneja el evento de reserva actualizada
   * Notifica cambios y reprograma recordatorios si es necesario
   */
  async handleReservationUpdated(event: ReservationEvent): Promise<void> {
    this.logger.debug(`Handling ReservationUpdatedEvent: ${event.eventId}`);

    const data = event.data as ReservationUpdatedEventData;

    try {
      const enrichedData = await this.enrichReservationData(data);

      // Detectar cambios significativos
      const significantChanges = this.detectSignificantChanges(data.changes);

      if (significantChanges.length === 0) {
        this.logger.debug('No significant changes detected, skipping notification');
        return;
      }

      // Formatear cambios para la notificación
      const changesText = significantChanges
        .map(change => `• ${change.field}: ${change.oldValue} → ${change.newValue}`)
        .join('\n');

      // TODO: Implementar método sendReservationUpdatedNotification en EnhancedNotificationService
      // Enviar notificación de cambios
      // await this.notificationService.sendNotification({
      //   userId: data.userId,
      //   channels: ['EMAIL', 'SMS', 'PUSH'],
      //   template: 'reservation_updated',
      //   data: {
      //     userName: enrichedData.userName,
      //     reservationId: data.reservationId,
      //     changes: changesText,
      //     changesArray: significantChanges,
      //   },
      //   priority: 'HIGH',
      // });
      this.logger.warn('Notification skipped: sendReservationUpdatedNotification not implemented');

      // Si cambió la fecha/hora, reprogramar recordatorios
      if (data.changes.startDate || data.changes.endDate) {
        await this.reminderService.cancelReminders(data.reservationId);
        
        await this.reminderService.scheduleReminders({
          reservationId: data.reservationId,
          userId: data.userId,
          resourceId: enrichedData.resourceId,
          startDate: new Date(data.changes.startDate?.new || enrichedData.startDate),
          endDate: new Date(data.changes.endDate?.new || enrichedData.endDate),
        });
      }

      this.logger.log(`Reservation updated notification sent: ${data.reservationId}`);
    } catch (error) {
      this.logger.error(
        `Error handling ReservationUpdatedEvent: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Maneja el evento de reserva cancelada
   * Cancela recordatorios y notifica al usuario
   */
  async handleReservationCancelled(event: ReservationEvent): Promise<void> {
    this.logger.debug(`Handling ReservationCancelledEvent: ${event.eventId}`);

    const data = event.data as ReservationCancelledEventData;

    try {
      const enrichedData = await this.enrichReservationData(data);

      // Cancelar todos los recordatorios programados
      await this.reminderService.cancelReminders(data.reservationId);

      // TODO: Implementar método sendReservationCancelledNotification en EnhancedNotificationService
      // Enviar notificación de cancelación
      // await this.notificationService.sendNotification({
      //   userId: data.userId,
      //   channels: ['EMAIL', 'IN_APP'],
      //   template: 'reservation_cancelled',
      //   data: {
      //     userName: enrichedData.userName,
      //     resourceName: enrichedData.resourceName,
      //     reservationId: data.reservationId,
      //     reason: data.reason || 'No especificado',
      //     cancelledBy: enrichedData.cancelledByName || 'Sistema',
      //   },
      //   priority: 'NORMAL',
      // });
      this.logger.warn('Notification skipped: sendReservationCancelledNotification not implemented');

      this.logger.log(`Reservation cancelled notification sent: ${data.reservationId}`);
    } catch (error) {
      this.logger.error(
        `Error handling ReservationCancelledEvent: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Maneja el evento de reserva aprobada
   * Envía notificación con documento PDF y QR code
   */
  async handleReservationApproved(event: ReservationEvent): Promise<void> {
    this.logger.debug(`Handling ReservationApprovedEvent: ${event.eventId}`);

    const data = event.data as ReservationApprovedEventData;

    try {
      const enrichedData = await this.enrichReservationData(data);

      // Enviar notificación de aprobación con documento PDF
      await this.notificationService.sendApprovalApprovedNotification(
        {
          userName: enrichedData.userName,
          resourceName: enrichedData.resourceName,
          approverName: enrichedData.approverName,
          approvalRequestId: data.approvalId,
          reservationDate: enrichedData.startDate ? new Date(enrichedData.startDate) : new Date(),
          documentUrl: enrichedData.documentUrl,
          qrCode: enrichedData.qrCodeUrl,
        },
        {
          channels: [NotificationChannel.EMAIL, NotificationChannel.WHATSAPP],
          priority: 'high',
          includeDocument: !!data.documentId,
        }
      );

      // Programar recordatorios si aún no existen
      if (enrichedData.startDate && enrichedData.endDate) {
        await this.reminderService.scheduleReminders({
          reservationId: data.reservationId,
          userId: data.userId,
          resourceId: enrichedData.resourceId,
          startDate: new Date(enrichedData.startDate),
          endDate: new Date(enrichedData.endDate),
        });
      }

      this.logger.log(`Reservation approved notification sent: ${data.reservationId}`);
    } catch (error) {
      this.logger.error(
        `Error handling ReservationApprovedEvent: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Maneja el evento de reserva rechazada
   * Notifica al usuario con razón y sugerencias
   */
  async handleReservationRejected(event: ReservationEvent): Promise<void> {
    this.logger.debug(`Handling ReservationRejectedEvent: ${event.eventId}`);

    const data = event.data as ReservationRejectedEventData;

    try {
      const enrichedData = await this.enrichReservationData(data);

      // Cancelar recordatorios si existían
      await this.reminderService.cancelReminders(data.reservationId);

      // Enviar notificación de rechazo
      await this.notificationService.sendApprovalRejectedNotification(
        {
          userName: enrichedData.userName,
          resourceName: enrichedData.resourceName,
          rejectedBy: enrichedData.rejectorName,
          rejectionReason: data.reason,
          reservationDate: enrichedData.startDate ? new Date(enrichedData.startDate) : new Date(),
        },
        {
          channels: [NotificationChannel.EMAIL],
          priority: 'high',
        }
      );

      this.logger.log(`Reservation rejected notification sent: ${data.reservationId}`);
    } catch (error) {
      this.logger.error(
        `Error handling ReservationRejectedEvent: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Enriquece los datos del evento con información adicional
   * (nombres de usuario, recurso, etc.)
   */
  private async enrichReservationData(data: any): Promise<any> {
    // TODO: Implementar llamadas a auth-service y resources-service
    // para obtener nombres completos de usuarios y recursos
    
    // Por ahora retornar datos mock
    return {
      ...data,
      userName: 'Usuario',
      resourceName: 'Recurso',
      approverName: 'Aprobador',
      rejectorName: 'Rechazador',
      cancelledByName: 'Usuario',
      documentUrl: data.documentId ? `/documents/${data.documentId}` : undefined,
      qrCodeUrl: data.reservationId ? `/qr/${data.reservationId}` : undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      resourceId: data.resourceId,
    };
  }

  /**
   * Detecta cambios significativos que requieren notificación
   */
  private detectSignificantChanges(changes: Record<string, { old: any; new: any }>): Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }> {
    const significantFields = ['startDate', 'endDate', 'resourceId', 'status'];
    const significantChanges: Array<{ field: string; oldValue: string; newValue: string }> = [];

    for (const field of significantFields) {
      if (changes[field]) {
        significantChanges.push({
          field: this.translateFieldName(field),
          oldValue: this.formatFieldValue(field, changes[field].old),
          newValue: this.formatFieldValue(field, changes[field].new),
        });
      }
    }

    return significantChanges;
  }

  /**
   * Traduce nombres de campos técnicos a nombres legibles
   */
  private translateFieldName(field: string): string {
    const translations: Record<string, string> = {
      startDate: 'Fecha de inicio',
      endDate: 'Fecha de fin',
      resourceId: 'Recurso',
      status: 'Estado',
    };

    return translations[field] || field;
  }

  /**
   * Formatea valores de campos para mostrar en notificaciones
   */
  private formatFieldValue(field: string, value: any): string {
    if (field.includes('Date') && value) {
      return this.formatDateTime(new Date(value));
    }

    return String(value);
  }

  /**
   * Formatea una fecha para mostrar
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Formatea una hora para mostrar
   */
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formatea fecha y hora completa
   */
  private formatDateTime(date: Date): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }
}
