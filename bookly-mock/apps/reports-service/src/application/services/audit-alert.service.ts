import {
  AuditAlertSeverity,
  AuditAlertType,
  NotificationChannel,
  NotificationPriority,
} from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { NotificationService } from "@libs/notifications";
import { Injectable } from "@nestjs/common";
import { AuditAnalyticsService } from "./audit-analytics.service";

export interface AlertConfig {
  enabled: boolean;
  threshold: number;
  interval: number; // en minutos
  notificationChannels: string[];
}

export interface Alert {
  alertId: string;
  type: AuditAlertType;
  severity: AuditAlertSeverity;
  title: string;
  description: string;
  data: Record<string, any>;
  timestamp: Date;
}

/**
 * Servicio para gestión de alertas automáticas de auditoría
 */
@Injectable()
export class AuditAlertService {
  private readonly logger = createLogger("AuditAlertService");
  private alertHistory: Alert[] = [];

  constructor(
    private readonly auditAnalyticsService: AuditAnalyticsService,
    private readonly notificationService: NotificationService
  ) {}

  /**
   * Procesar intento no autorizado y generar alerta si es necesario
   */
  async processUnauthorizedAttempt(eventData: {
    eventId: string;
    userId: string;
    action: string;
    resource: string;
    ip?: string;
    error?: string;
  }): Promise<void> {
    try {
      this.logger.warn("Processing unauthorized attempt", {
        eventId: eventData.eventId,
        userId: eventData.userId,
        resource: eventData.resource,
      });

      // Verificar si ya se alertó este evento
      const attempts = await this.auditAnalyticsService.getUnauthorizedAttempts(
        1,
        false
      );

      const alreadyAlerted = attempts.some(
        (a) => a.eventId === eventData.eventId && a.alerted
      );

      if (alreadyAlerted) {
        this.logger.debug("Event already alerted", {
          eventId: eventData.eventId,
        });
        return;
      }

      // Generar alerta
      const alert: Alert = {
        alertId: `alert-${eventData.eventId}`,
        type: AuditAlertType.UNAUTHORIZED_ACCESS,
        severity: AuditAlertSeverity.HIGH,
        title: "Intento de Acceso No Autorizado Detectado",
        description: `Usuario ${eventData.userId} intentó ${eventData.action} en ${eventData.resource} sin permisos suficientes`,
        data: {
          userId: eventData.userId,
          action: eventData.action,
          resource: eventData.resource,
          ip: eventData.ip,
          error: eventData.error,
          eventId: eventData.eventId,
        },
        timestamp: new Date(),
      };

      // Enviar alerta
      await this.sendAlert(alert);

      // Marcar como alertado
      await this.auditAnalyticsService.markAsAlerted(eventData.eventId);

      this.logger.info("Alert sent for unauthorized attempt", {
        alertId: alert.alertId,
        userId: eventData.userId,
      });
    } catch (error: any) {
      this.logger.error("Failed to process unauthorized attempt", error, {
        eventId: eventData.eventId,
      });
    }
  }

  /**
   * Monitorear patrones sospechosos periódicamente
   */
  async monitorSuspiciousPatterns(): Promise<void> {
    try {
      const patterns =
        await this.auditAnalyticsService.detectSuspiciousPatterns();

      if (patterns.length === 0) {
        return;
      }

      for (const pattern of patterns) {
        const alert: Alert = {
          alertId: `pattern-${pattern.userId}-${Date.now()}`,
          type: AuditAlertType.SUSPICIOUS_PATTERN,
          severity:
            pattern.failedAttempts >= 5
              ? AuditAlertSeverity.CRITICAL
              : AuditAlertSeverity.HIGH,
          title: "Patrón Sospechoso Detectado",
          description: `Usuario ${pattern.userId} tiene ${pattern.failedAttempts} intentos fallidos en la última hora`,
          data: {
            userId: pattern.userId,
            failedAttempts: pattern.failedAttempts,
            lastAttempt: pattern.lastAttempt,
            detectedAt: new Date(),
          },
          timestamp: new Date(),
        };

        await this.sendAlert(alert);
      }

      this.logger.warn("Suspicious patterns alerts sent", {
        count: patterns.length,
      });
    } catch (error: any) {
      this.logger.error("Failed to monitor suspicious patterns", error);
    }
  }

  /**
   * Enviar alerta a los canales configurados
   */
  private async sendAlert(alert: Alert): Promise<void> {
    try {
      // Agregar a historial
      this.alertHistory.push(alert);

      // Mantener solo las últimas 1000 alertas en memoria
      if (this.alertHistory.length > 1000) {
        this.alertHistory = this.alertHistory.slice(-1000);
      }

      // Logging local
      this.logger.warn(
        `[ALERT ${alert.severity.toUpperCase()}] ${alert.title}`,
        {
          alertId: alert.alertId,
          type: alert.type,
          severity: alert.severity,
          description: alert.description,
          data: alert.data,
        }
      );

      // Enviar notificación por email a administradores
      const priority =
        alert.severity === AuditAlertSeverity.CRITICAL
          ? NotificationPriority.HIGH
          : alert.severity === AuditAlertSeverity.HIGH
            ? NotificationPriority.NORMAL
            : NotificationPriority.LOW;

      try {
        await this.notificationService.sendNotification(
          NotificationChannel.EMAIL,
          {
            to: ["admin@bookly.com"], // TODO: Obtener de configuración
            subject: `[BOOKLY ALERT ${alert.severity.toUpperCase()}] ${alert.title}`,
            message: alert.description,
            template: "audit-alert",
            templateData: {
              alertId: alert.alertId,
              type: alert.type,
              severity: alert.severity,
              title: alert.title,
              description: alert.description,
              timestamp: alert.timestamp.toISOString(),
              ...alert.data,
            },
          },
          undefined, // tenantId
          priority
        );

        this.logger.info("Alert notification sent successfully", {
          alertId: alert.alertId,
          channel: NotificationChannel.EMAIL,
          priority,
        });
      } catch (notificationError: any) {
        // No fallar si la notificación falla, solo loggear
        this.logger.error(
          "Failed to send alert notification",
          notificationError,
          {
            alertId: alert.alertId,
          }
        );
      }
    } catch (error: any) {
      this.logger.error("Failed to send alert", error, {
        alertId: alert.alertId,
      });
    }
  }

  /**
   * Obtener historial de alertas recientes
   */
  getRecentAlerts(limit = 50): Alert[] {
    return this.alertHistory.slice(-limit).reverse();
  }

  /**
   * Obtener estadísticas de alertas
   */
  getAlertStatistics(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const stats = {
      total: this.alertHistory.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    for (const alert of this.alertHistory) {
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      stats.bySeverity[alert.severity] =
        (stats.bySeverity[alert.severity] || 0) + 1;
    }

    return stats;
  }
}
