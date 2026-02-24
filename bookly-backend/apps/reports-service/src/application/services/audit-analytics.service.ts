import { AuditStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  AuditEvent,
  AuditEventDocument,
} from '@reports/infrastructure/schemas/audit-event.schema';

export interface AuditStatistics {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  unauthorizedAttempts: number;
  alertsSent: number;
  topUsers: Array<{ userId: string; count: number }>;
  topResources: Array<{ resource: string; count: number }>;
  topActions: Array<{ action: string; count: number }>;
}

export interface TimeSeriesData {
  timestamp: Date;
  count: number;
  successCount: number;
  failedCount: number;
}

export interface UnauthorizedAttempt {
  eventId: string;
  userId: string;
  action: string;
  resource: string;
  ip?: string;
  error?: string;
  eventTimestamp: Date;
  alerted: boolean;
}

/**
 * Servicio para análisis y procesamiento de eventos de auditoría
 */
@Injectable()
export class AuditAnalyticsService {
  private readonly logger = createLogger("AuditAnalyticsService");

  constructor(
    @InjectModel(AuditEvent.name)
    private readonly auditEventModel: Model<AuditEventDocument>
  ) {}

  /**
   * Almacenar evento de auditoría desde Kafka
   */
  async storeAuditEvent(eventData: {
    eventId: string;
    auditLogId: string;
    userId: string;
    action: string;
    resource: string;
    status: string;
    timestamp: Date;
    ip?: string;
    error?: string;
  }): Promise<AuditEventDocument> {
    try {
      // Evitar duplicados por eventId
      const existing = await this.auditEventModel.findOne({
        eventId: eventData.eventId,
      });

      if (existing) {
        this.logger.debug("Event already processed", {
          eventId: eventData.eventId,
        });
        return existing;
      }

      const auditEvent = await this.auditEventModel.create({
        eventId: eventData.eventId,
        auditLogId: eventData.auditLogId,
        userId: eventData.userId,
        action: eventData.action,
        resource: eventData.resource,
        status: eventData.status,
        eventTimestamp: eventData.timestamp,
        ip: eventData.ip,
        error: eventData.error,
        alerted: false,
        processedAt: new Date(),
      });

      this.logger.info("Audit event stored", {
        eventId: auditEvent.eventId,
        userId: auditEvent.userId,
        action: auditEvent.action,
        status: auditEvent.status,
      });

      return auditEvent;
    } catch (error: any) {
      this.logger.error("Failed to store audit event", error, {
        eventId: eventData.eventId,
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales de auditoría
   */
  async getStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditStatistics> {
    const matchStage: any = {};

    if (startDate || endDate) {
      matchStage.eventTimestamp = {};
      if (startDate) matchStage.eventTimestamp.$gte = startDate;
      if (endDate) matchStage.eventTimestamp.$lte = endDate;
    }

    const [
      totalResult,
      statusResult,
      topUsersResult,
      topResourcesResult,
      topActionsResult,
      alertsResult,
    ] = await Promise.all([
      // Total de eventos
      this.auditEventModel.countDocuments(matchStage),

      // Eventos por status
      this.auditEventModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Top usuarios
      this.auditEventModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { userId: "$_id", count: 1, _id: 0 } },
      ]),

      // Top recursos
      this.auditEventModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$resource", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { resource: "$_id", count: 1, _id: 0 } },
      ]),

      // Top acciones
      this.auditEventModel.aggregate([
        { $match: matchStage },
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { action: "$_id", count: 1, _id: 0 } },
      ]),

      // Alertas enviadas
      this.auditEventModel.countDocuments({ ...matchStage, alerted: true }),
    ]);

    const statusMap = statusResult.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalEvents: totalResult,
      successfulEvents: statusMap[AuditStatus.SUCCESS] || 0,
      failedEvents: statusMap[AuditStatus.FAILED] || 0,
      unauthorizedAttempts: statusMap[AuditStatus.FAILED] || 0,
      alertsSent: alertsResult,
      topUsers: topUsersResult,
      topResources: topResourcesResult,
      topActions: topActionsResult,
    };
  }

  /**
   * Obtener datos de serie temporal para gráficos
   */
  async getTimeSeriesData(
    startDate: Date,
    endDate: Date,
    interval: "hour" | "day" = "hour"
  ): Promise<TimeSeriesData[]> {
    const dateFormat =
      interval === "hour"
        ? {
            $dateToString: {
              format: "%Y-%m-%dT%H:00:00Z",
              date: "$eventTimestamp",
            },
          }
        : { $dateToString: { format: "%Y-%m-%d", date: "$eventTimestamp" } };

    const result = await this.auditEventModel.aggregate([
      {
        $match: {
          eventTimestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: dateFormat,
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", AuditStatus.SUCCESS] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", AuditStatus.FAILED] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          timestamp: { $toDate: "$_id" },
          count: 1,
          successCount: 1,
          failedCount: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  /**
   * Obtener intentos no autorizados recientes
   */
  async getUnauthorizedAttempts(
    limit = 50,
    onlyUnalerted = false
  ): Promise<UnauthorizedAttempt[]> {
    const query: any = { status: AuditStatus.FAILED };
    if (onlyUnalerted) {
      query.alerted = false;
    }

    const events = await this.auditEventModel
      .find(query)
      .sort({ eventTimestamp: -1 })
      .limit(limit)
      .lean();

    return events.map((event) => ({
      eventId: event.eventId,
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      ip: event.ip,
      error: event.error,
      eventTimestamp: event.eventTimestamp,
      alerted: event.alerted,
    }));
  }

  /**
   * Marcar evento como alertado
   */
  async markAsAlerted(eventId: string): Promise<void> {
    await this.auditEventModel.updateOne(
      { eventId },
      { alerted: true, alertedAt: new Date() }
    );

    this.logger.info("Event marked as alerted", { eventId });
  }

  /**
   * Obtener actividad de un usuario específico
   */
  async getUserActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditEventDocument[]> {
    const query: any = { userId };

    if (startDate || endDate) {
      query.eventTimestamp = {};
      if (startDate) query.eventTimestamp.$gte = startDate;
      if (endDate) query.eventTimestamp.$lte = endDate;
    }

    return this.auditEventModel
      .find(query)
      .sort({ eventTimestamp: -1 })
      .limit(100);
  }

  /**
   * Detectar patrones sospechosos
   */
  async detectSuspiciousPatterns(): Promise<
    Array<{
      userId: string;
      failedAttempts: number;
      lastAttempt: Date;
    }>
  > {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await this.auditEventModel.aggregate([
      {
        $match: {
          status: AuditStatus.FAILED,
          eventTimestamp: { $gte: oneHourAgo },
        },
      },
      {
        $group: {
          _id: "$userId",
          failedAttempts: { $sum: 1 },
          lastAttempt: { $max: "$eventTimestamp" },
        },
      },
      {
        $match: {
          failedAttempts: { $gte: 3 }, // 3 o más intentos fallidos en 1 hora
        },
      },
      { $sort: { failedAttempts: -1 } },
      {
        $project: {
          userId: "$_id",
          failedAttempts: 1,
          lastAttempt: 1,
          _id: 0,
        },
      },
    ]);

    if (result.length > 0) {
      this.logger.warn("Suspicious patterns detected", {
        count: result.length,
        users: result.map((r) => r.userId),
      });
    }

    return result;
  }
}
