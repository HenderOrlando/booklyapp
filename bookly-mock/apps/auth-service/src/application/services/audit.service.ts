import { AuditStatus, EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  AuditLog,
  AuditLogDocument,
} from '@auth/infrastructure/schemas/audit-log.schema';
import { CreateAuditLogDto } from "../dtos/audit/create-audit-log.dto";

/**
 * Servicio para gestión de auditoría
 * Registra todas las acciones críticas del sistema
 */
@Injectable()
export class AuditService {
  private readonly logger = createLogger("AuditService");

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly eventBusService: EventBusService
  ) {}

  /**
   * Registrar una acción en el log de auditoría
   * @param auditData - Datos de la acción a auditar
   */
  async log(auditData: CreateAuditLogDto): Promise<void> {
    try {
      // Crear registro de auditoría
      const auditLog = await this.auditLogModel.create({
        ...auditData,
        timestamp: new Date(),
      });

      this.logger.info("Audit log created", {
        auditLogId: auditLog._id?.toString(),
        userId: auditData.userId,
        action: auditData.action,
        resource: auditData.resource,
        status: auditData.status,
      });

      // Publicar evento para sistemas externos
      await this.publishAuditEvent(EventType.AUDIT_LOG_CREATED, {
        auditLogId: auditLog._id?.toString(),
        userId: auditData.userId,
        action: auditData.action,
        resource: auditData.resource,
        status: auditData.status,
        timestamp: auditLog.timestamp,
      });

      // Notificar administradores si es un intento fallido
      if (auditData.status === AuditStatus.FAILED) {
        await this.notifyAdministrators(auditLog);
      }
    } catch (error: any) {
      this.logger.error("Failed to create audit log", error, { auditData });
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Obtener logs de auditoría por usuario
   * @param userId - ID del usuario
   * @param status - Estado opcional (SUCCESS o FAILED)
   * @param limit - Límite de registros
   */
  async getUserAuditLogs(
    userId: string,
    status?: AuditStatus,
    limit = 50
  ): Promise<AuditLog[]> {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Obtener logs de auditoría por recurso
   * @param resource - Nombre del recurso
   * @param action - Acción opcional
   * @param limit - Límite de registros
   */
  async getResourceAuditLogs(
    resource: string,
    action?: string,
    limit = 50
  ): Promise<AuditLog[]> {
    const query: any = { resource };
    if (action) {
      query.action = action;
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Obtener intentos fallidos recientes
   * @param hours - Últimas N horas
   * @param limit - Límite de registros
   */
  async getFailedAttempts(hours = 24, limit = 50): Promise<AuditLog[]> {
    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hours);

    return this.auditLogModel
      .find({
        status: AuditStatus.FAILED,
        timestamp: { $gte: hoursAgo },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Notificar a administradores sobre intentos no autorizados
   * @param auditLog - Registro de auditoría
   */
  private async notifyAdministrators(
    auditLog: AuditLogDocument
  ): Promise<void> {
    try {
      // Publicar evento para notificaciones a administradores
      await this.publishAuditEvent(EventType.AUDIT_UNAUTHORIZED_ATTEMPT, {
        auditLogId: auditLog._id?.toString(),
        userId: auditLog.userId,
        action: auditLog.action,
        resource: auditLog.resource,
        timestamp: auditLog.timestamp,
        ip: auditLog.ip,
        error: auditLog.error,
      });

      this.logger.warn("Unauthorized attempt detected", {
        auditLogId: auditLog._id?.toString(),
        userId: auditLog.userId,
        action: auditLog.action,
        resource: auditLog.resource,
        ip: auditLog.ip,
      });
    } catch (error: any) {
      this.logger.error("Failed to notify administrators", error, {
        auditLogId: auditLog._id?.toString(),
      });
    }
  }

  /**
   * Limpiar logs antiguos
   * @param days - Días de retención (default: 90)
   */
  async cleanOldLogs(
    days = 90
  ): Promise<{ deletedCount: number; acknowledged: boolean }> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const result = await this.auditLogModel.deleteMany({
      timestamp: { $lt: daysAgo },
    });

    this.logger.info("Old audit logs cleaned", {
      deletedCount: result.deletedCount,
      days,
    });

    return {
      deletedCount: result.deletedCount,
      acknowledged: result.acknowledged,
    };
  }

  /**
   * Publicar evento de auditoría a Kafka
   * @param eventType - Tipo de evento
   * @param data - Datos del evento
   */
  private async publishAuditEvent<T = any>(
    eventType: EventType,
    data: T
  ): Promise<void> {
    try {
      const event: EventPayload<T> = {
        eventId: uuidv4(),
        eventType,
        timestamp: new Date(),
        service: "auth-service",
        data,
        metadata: {
          source: "AuditService",
          version: "1.0.0",
          aggregateId: (data as any).userId || (data as any).auditLogId,
          aggregateType: "AuditLog",
        },
      };

      await this.eventBusService.publish(eventType, event);

      this.logger.debug("Audit event published", {
        eventType,
        eventId: event.eventId,
      });
    } catch (error: any) {
      // No lanzar error para no interrumpir el flujo de auditoría
      this.logger.error("Failed to publish audit event", error, {
        eventType,
      });
    }
  }
}
