import {
  NotificationChannel,
  NotificationPriority,
  ReminderFrequency,
  ReminderType,
} from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { NotificationPayload, NotificationService } from "@libs/notifications";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import { ReminderConfigurationEntity } from "@stockpile/domain/entities/reminder-configuration.entity";
import { AuthServiceClient } from "@stockpile/infrastructure/clients/auth-service.client";
import { ReminderConfiguration } from "@stockpile/infrastructure/schemas/reminder-configuration.schema";
import { ApprovalRequestService } from "./approval-request.service";
import { CheckInOutService } from "./check-in-out.service";

const logger = createLogger("ReminderService");

/**
 * Reminder Service
 * Servicio para gestión de recordatorios automáticos
 */
@Injectable()
export class ReminderService {
  constructor(
    @InjectModel(ReminderConfiguration.name)
    private readonly model: Model<ReminderConfiguration>,
    private readonly notificationService: NotificationService,
    private readonly approvalRequestService: ApprovalRequestService,
    private readonly checkInOutService: CheckInOutService,
    private readonly authClient: AuthServiceClient
  ) {}

  /**
   * Crear configuración de recordatorio
   */
  async createConfiguration(
    config: Omit<ReminderConfigurationEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<ReminderConfigurationEntity> {
    const created = await this.model.create(config);
    logger.info("Reminder configuration created", { type: config.type });
    return ReminderConfigurationEntity.fromObject(created.toObject());
  }

  /**
   * Obtener configuración por tipo
   */
  async getConfigurationByType(
    type: ReminderType
  ): Promise<ReminderConfigurationEntity | null> {
    const doc = await this.model.findOne({ type }).lean();
    return doc ? ReminderConfigurationEntity.fromObject(doc) : null;
  }

  /**
   * Obtener todas las configuraciones activas
   */
  async getActiveConfigurations(): Promise<ReminderConfigurationEntity[]> {
    const docs = await this.model.find({ enabled: true }).lean();
    return docs.map((doc) => ReminderConfigurationEntity.fromObject(doc));
  }

  /**
   * Actualizar configuración
   */
  async updateConfiguration(
    type: ReminderType,
    updates: Partial<ReminderConfigurationEntity>
  ): Promise<ReminderConfigurationEntity> {
    const doc = await this.model
      .findOneAndUpdate({ type }, updates, { new: true })
      .lean();

    if (!doc) {
      throw new Error("Reminder configuration not found");
    }

    logger.info("Reminder configuration updated", { type });
    return ReminderConfigurationEntity.fromObject(doc);
  }

  /**
   * Activar/desactivar recordatorio
   */
  async toggleReminder(type: ReminderType, enabled: boolean): Promise<void> {
    await this.model.updateOne({ type }, { enabled });
    logger.info(`Reminder ${enabled ? "enabled" : "disabled"}`, { type });
  }

  /**
   * Enviar recordatorio
   */
  async sendReminder(
    type: ReminderType,
    recipients: { channel: NotificationChannel; address: string }[],
    customMessage?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const config = await this.getConfigurationByType(type);

    if (!config || !config.isActive()) {
      logger.warn("Reminder configuration not found or disabled", { type });
      return;
    }

    const message = customMessage || config.messageTemplate || "Recordatorio";

    for (const recipient of recipients) {
      if (!config.channels.includes(recipient.channel)) {
        continue;
      }

      const payload: NotificationPayload = {
        to: recipient.address,
        subject: `Recordatorio - ${type}`,
        message,
        data: {
          ...metadata,
          reminderType: type,
        },
      };

      try {
        // Usar NotificationService desde @libs/notifications
        const result = await this.notificationService.sendNotification(
          recipient.channel,
          payload,
          undefined, // tenantId - extraer del contexto si es necesario
          NotificationPriority.NORMAL
        );

        logger.info("Reminder sent", {
          type,
          channel: recipient.channel,
          eventId: result.eventId,
          status: result.status,
        });
      } catch (error) {
        logger.error("Error sending reminder", error as Error, {
          type,
          channel: recipient.channel,
        });
      }
    }
  }

  /**
   * Cron: Recordatorios de aprobaciones pendientes (cada hora)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processPendingApprovals(): Promise<void> {
    const config = await this.getConfigurationByType(
      ReminderType.APPROVAL_PENDING
    );

    if (!config || !config.isActive()) {
      return;
    }

    logger.info("Processing pending approval reminders");

    try {
      // Obtener aprobaciones pendientes con más de X tiempo
      const thresholdHours = config.triggerBeforeMinutes
        ? config.triggerBeforeMinutes / 60
        : 24;
      const pendingApprovals =
        await this.approvalRequestService.findPendingOlderThan(thresholdHours);

      for (const approval of pendingApprovals) {
        // TODO: Obtener aprobador actual desde el flujo de aprobación
        // Para simplificar, enviamos notificación al solicitante
        const requester = await this.authClient.getUserById(
          approval.requesterId
        );

        if (requester && requester.email) {
          await this.sendReminder(
            ReminderType.APPROVAL_PENDING,
            [
              {
                channel: NotificationChannel.EMAIL,
                address: requester.email,
              },
            ],
            `Tu solicitud de aprobación está pendiente desde hace ${thresholdHours} horas.`,
            {
              approvalId: approval.id,
              requesterId: approval.requesterId,
              currentStepIndex: approval.currentStepIndex,
            }
          );

          logger.debug("Approval reminder sent", {
            approvalId: approval.id,
            requesterId: approval.requesterId,
          });
        }
      }

      logger.info("Pending approval reminders processed", {
        count: pendingApprovals.length,
      });
    } catch (error) {
      logger.error("Error processing pending approval reminders", error);
    }
  }

  /**
   * Cron: Recordatorios de check-out próximos (cada 15 minutos)
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async processCheckOutReminders(): Promise<void> {
    const config = await this.getConfigurationByType(
      ReminderType.CHECK_OUT_REMINDER
    );

    if (!config || !config.isActive()) {
      return;
    }

    logger.info("Processing check-out reminders");

    try {
      const activeCheckIns = await this.checkInOutService.findActive();
      const now = new Date();
      const reminderThresholdMinutes = config.triggerBeforeMinutes || 30;

      for (const checkIn of activeCheckIns) {
        if (!checkIn.expectedReturnTime) {
          continue;
        }

        const minutesUntilReturn =
          (checkIn.expectedReturnTime.getTime() - now.getTime()) / (1000 * 60);

        // Enviar recordatorio si falta menos del threshold
        if (
          minutesUntilReturn > 0 &&
          minutesUntilReturn <= reminderThresholdMinutes
        ) {
          // Obtener email/teléfono del usuario desde auth-service
          const user = await this.authClient.getUserById(checkIn.userId);

          if (user && user.email) {
            const recipients = [
              {
                channel: NotificationChannel.EMAIL,
                address: user.email,
              },
            ];

            // Agregar SMS si el usuario tiene teléfono
            if (user.phone) {
              recipients.push({
                channel: NotificationChannel.SMS,
                address: user.phone,
              });
            }

            await this.sendReminder(
              ReminderType.CHECK_OUT_REMINDER,
              recipients,
              `Recuerda devolver el recurso en ${Math.floor(minutesUntilReturn)} minutos.`,
              {
                checkInId: checkIn.id,
                resourceId: checkIn.resourceId,
                userName: user.name,
              }
            );
          }
        }
      }

      logger.info("Check-out reminders processed");
    } catch (error) {
      logger.error("Error processing check-out reminders", error);
    }
  }

  /**
   * Cron: Recordatorios de recursos vencidos (cada hora)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processOverdueReminders(): Promise<void> {
    const config = await this.getConfigurationByType(ReminderType.OVERDUE);

    if (!config || !config.isActive()) {
      return;
    }

    logger.info("Processing overdue reminders");

    try {
      const overdueCheckIns = await this.checkInOutService.findOverdue();

      for (const checkIn of overdueCheckIns) {
        const delayMinutes = checkIn.getDelayMinutes();

        // Obtener email/teléfono del usuario desde auth-service
        const user = await this.authClient.getUserById(checkIn.userId);

        if (user && user.email) {
          const recipients = [
            {
              channel: NotificationChannel.EMAIL,
              address: user.email,
            },
          ];

          // Agregar SMS y WhatsApp si está disponible (alta prioridad por retraso)
          if (user.phone) {
            recipients.push(
              {
                channel: NotificationChannel.SMS,
                address: user.phone,
              },
              {
                channel: NotificationChannel.WHATSAPP,
                address: user.phone,
              }
            );
          }

          await this.sendReminder(
            ReminderType.OVERDUE,
            recipients,
            `El recurso debía ser devuelto hace ${delayMinutes} minutos. Por favor devuélvelo lo antes posible.`,
            {
              checkInId: checkIn.id,
              resourceId: checkIn.resourceId,
              delayMinutes,
              userName: user.name,
            }
          );
        }
      }

      logger.info("Overdue reminders processed", {
        count: overdueCheckIns.length,
      });
    } catch (error) {
      logger.error("Error processing overdue reminders", error);
    }
  }

  /**
   * Inicializar configuraciones por defecto
   */
  async initializeDefaultConfigurations(): Promise<void> {
    const defaultConfigs = [
      ReminderConfigurationEntity.createApprovalPendingReminder(),
      ReminderConfigurationEntity.createCheckOutReminder(),
      {
        type: ReminderType.OVERDUE,
        enabled: true,
        channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
        frequency: ReminderFrequency.HOURLY,
        maxRetries: 5,
        messageTemplate: "Tienes recursos sin devolver. Por favor devuélvelos.",
        metadata: {
          businessHoursOnly: false,
          includeWeekends: true,
        },
      },
    ];

    for (const config of defaultConfigs) {
      const existing = await this.model.findOne({ type: config.type });
      if (!existing) {
        await this.model.create(config);
        logger.info("Default reminder configuration created", {
          type: config.type,
        });
      }
    }
  }

  /**
   * Programa recordatorios para una reserva
   * Método requerido por NotificationEventHandler (RF-28)
   */
  async scheduleReminders(params: {
    reservationId: string;
    userId: string;
    resourceId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<void> {
    logger.info('Scheduling reminders for reservation', {
      reservationId: params.reservationId,
    });

    // TODO: Implementar lógica de programación de recordatorios
    // Esto podría usar un job scheduler como Bull o Agenda
    // Por ahora solo registramos el evento

    // Recordatorio 24h antes
    const reminder24h = new Date(params.startDate);
    reminder24h.setHours(reminder24h.getHours() - 24);

    // Recordatorio 1h antes
    const reminder1h = new Date(params.startDate);
    reminder1h.setHours(reminder1h.getHours() - 1);

    logger.debug('Reminders scheduled', {
      reservationId: params.reservationId,
      reminder24h: reminder24h.toISOString(),
      reminder1h: reminder1h.toISOString(),
    });

    // Aquí se programarían los jobs reales con un scheduler
    // await this.jobScheduler.schedule('reminder-24h', reminder24h, { reservationId, userId });
    // await this.jobScheduler.schedule('reminder-1h', reminder1h, { reservationId, userId });
  }

  /**
   * Cancela todos los recordatorios de una reserva
   * Método requerido por NotificationEventHandler (RF-28)
   */
  async cancelReminders(reservationId: string): Promise<void> {
    logger.info('Cancelling reminders for reservation', { reservationId });

    // TODO: Implementar lógica de cancelación de recordatorios programados
    // Esto requiere integración con el job scheduler
    // Por ahora solo registramos el evento

    logger.debug('Reminders cancelled', { reservationId });

    // Aquí se cancelarían los jobs programados
    // await this.jobScheduler.cancel({ reservationId });
  }
}
