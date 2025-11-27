import { MaintenanceStatus } from "@libs/common/enums";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Types } from "mongoose";
import { MaintenanceNotificationService } from "../../application/services/maintenance-notification.service";
import { MaintenanceBlockRepository } from "../repositories/maintenance-block.repository";
import { MaintenanceBlock } from "../schemas/maintenance-block.schema";

// Tipo extendido para documentos MongoDB con _id
type MaintenanceBlockWithId = MaintenanceBlock & { _id: Types.ObjectId };

/**
 * CronJob para actualización automática de estados de mantenimiento
 * Se ejecuta cada 5 minutos para detectar mantenimientos que deben iniciar
 */
@Injectable()
export class MaintenanceStatusCron {
  private readonly logger = new Logger(MaintenanceStatusCron.name);

  constructor(
    private readonly repository: MaintenanceBlockRepository,
    private readonly notificationService: MaintenanceNotificationService
  ) {}

  /**
   * Actualiza estados de mantenimientos cada 5 minutos
   * SCHEDULED → IN_PROGRESS cuando llega startDate
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: "maintenance-status-update",
    timeZone: "America/Bogota",
  })
  async updateMaintenanceStatuses(): Promise<void> {
    this.logger.log(
      "🔄 Iniciando actualización de estados de mantenimiento..."
    );

    try {
      const now = new Date();

      // Obtener mantenimientos programados que ya deberían estar en progreso
      const scheduledMaintenance = (await this.repository.findByFilters({
        status: MaintenanceStatus.SCHEDULED,
      })) as MaintenanceBlockWithId[];

      let updatedCount = 0;

      for (const maintenance of scheduledMaintenance) {
        // Si la fecha de inicio ya pasó, cambiar a IN_PROGRESS
        if (maintenance.startDate <= now && maintenance.endDate > now) {
          await this.repository.updateStatus(
            maintenance._id.toString(),
            MaintenanceStatus.IN_PROGRESS
          );

          // Notificar inicio
          await this.notificationService.notifyMaintenanceStarted({
            maintenanceId: maintenance._id.toString(),
            resourceId: maintenance.resourceId.toString(),
            resourceName: maintenance.resourceName || "Recurso",
            startDate: maintenance.startDate,
            endDate: maintenance.endDate,
            description: maintenance.description || "",
          });

          updatedCount++;
          this.logger.log(
            `✅ Mantenimiento ${maintenance._id} iniciado automáticamente`
          );
        }
      }

      // Obtener mantenimientos en progreso que ya deberían estar completados
      const inProgressMaintenance = (await this.repository.findByFilters({
        status: MaintenanceStatus.IN_PROGRESS,
      })) as MaintenanceBlockWithId[];

      for (const maintenance of inProgressMaintenance) {
        // Si la fecha de fin ya pasó, sugerimos completarlo (no auto-completamos)
        if (maintenance.endDate <= now) {
          this.logger.warn(
            `⚠️ Mantenimiento ${maintenance._id} ha superado su fecha de fin. Requiere completarse manualmente.`
          );

          // Publicar alerta para que staff lo revise
          await this.notificationService.sendWebhook({
            event: "maintenance.overdue",
            payload: {
              maintenanceId: maintenance._id.toString(),
              resourceId: maintenance.resourceId.toString(),
              resourceName: maintenance.resourceName || "Recurso",
              endDate: maintenance.endDate,
              message:
                "Este mantenimiento requiere ser completado manualmente.",
            },
          });
        }
      }

      this.logger.log(
        `✅ Actualización completada: ${updatedCount} mantenimiento(s) actualizado(s)`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error en actualización de estados de mantenimiento: ${error.message}`,
        error.stack
      );
    }
  }

  /**
   * Verifica mantenimientos próximos a iniciar (24 horas antes)
   * Envía recordatorios al staff
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM, {
    name: "maintenance-reminder",
    timeZone: "America/Bogota",
  })
  async sendMaintenanceReminders(): Promise<void> {
    this.logger.log("📧 Enviando recordatorios de mantenimientos próximos...");

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Obtener mantenimientos programados para mañana
      const upcomingMaintenance = (await this.repository.findByFilters({
        status: MaintenanceStatus.SCHEDULED,
      })) as MaintenanceBlockWithId[];

      const tomorrowMaintenance = upcomingMaintenance.filter(
        (m) => m.startDate >= tomorrow && m.startDate < dayAfterTomorrow
      );

      for (const maintenance of tomorrowMaintenance) {
        await this.notificationService.sendWebhook({
          event: "maintenance.reminder",
          payload: {
            maintenanceId: maintenance._id.toString(),
            resourceId: maintenance.resourceId.toString(),
            resourceName: maintenance.resourceName || "Recurso",
            startDate: maintenance.startDate,
            endDate: maintenance.endDate,
            description: maintenance.description || "",
            message: "Mantenimiento programado para mañana",
          },
        });
      }

      this.logger.log(
        `✅ Recordatorios enviados: ${tomorrowMaintenance.length} mantenimiento(s)`
      );
    } catch (error) {
      this.logger.error(
        `❌ Error enviando recordatorios: ${error.message}`,
        error.stack
      );
    }
  }
}
