import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  IAuditQueryOptions,
  IAuditQueryResult,
  IAuditRecord,
} from "@reports/audit-decorators";
import { Model, Types } from "mongoose";
import {
  ReservationHistory,
  ReservationHistoryDocument,
} from "../schemas/reservation-history.schema";

/**
 * Repositorio de historial de reservas
 * Maneja el historial local de reservas en availability-service
 * La auditoría general se hace via eventos hacia reports-service
 */
@Injectable()
export class ReservationHistoryRepository {
  constructor(
    @InjectModel(ReservationHistory.name)
    private readonly historyModel: Model<ReservationHistoryDocument>
  ) {}

  /**
   * Guardar registro de auditoría
   */
  async save(record: IAuditRecord): Promise<void> {
    await this.historyModel.create({
      reservationId: new Types.ObjectId(record.entityId),
      action: record.action,
      beforeData: record.beforeData,
      afterData: record.afterData,
      userId: new Types.ObjectId(record.userId),
      ip: record.ip,
      userAgent: record.userAgent,
      location: record.location,
      timestamp: record.timestamp,
      metadata: record.metadata,
    });
  }

  /**
   * Consultar historial por reserva
   */
  async findByEntityId(
    entityId: string,
    entityType: string,
    options?: IAuditQueryOptions
  ): Promise<IAuditQueryResult> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
      reservationId: new Types.ObjectId(entityId),
    };

    // Aplicar filtros adicionales
    if (options?.action) {
      filter.action = options.action;
    }

    if (options?.startDate || options?.endDate) {
      filter.timestamp = {};
      if (options.startDate) {
        filter.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.timestamp.$lte = options.endDate;
      }
    }

    const [records, total] = await Promise.all([
      this.historyModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.historyModel.countDocuments(filter).exec(),
    ]);

    return {
      records: records.map((r) => this.toAuditRecord(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Consultar historial por usuario
   */
  async findByUserId(
    userId: string,
    options?: IAuditQueryOptions
  ): Promise<IAuditQueryResult> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
      userId: new Types.ObjectId(userId),
    };

    // Aplicar filtros adicionales
    if (options?.action) {
      filter.action = options.action;
    }

    if (options?.startDate || options?.endDate) {
      filter.timestamp = {};
      if (options.startDate) {
        filter.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.timestamp.$lte = options.endDate;
      }
    }

    const [records, total] = await Promise.all([
      this.historyModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.historyModel.countDocuments(filter).exec(),
    ]);

    return {
      records: records.map((r) => this.toAuditRecord(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Consultar historial con múltiples filtros
   */
  async findWithFilters(
    options: IAuditQueryOptions
  ): Promise<IAuditQueryResult> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (options.entityId) {
      filter.reservationId = new Types.ObjectId(options.entityId);
    }

    if (options.userId) {
      filter.userId = new Types.ObjectId(options.userId);
    }

    if (options.action) {
      filter.action = options.action;
    }

    if (options.startDate || options.endDate) {
      filter.timestamp = {};
      if (options.startDate) {
        filter.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.timestamp.$lte = options.endDate;
      }
    }

    const [records, total] = await Promise.all([
      this.historyModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.historyModel.countDocuments(filter).exec(),
    ]);

    return {
      records: records.map((r) => this.toAuditRecord(r)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Exportar historial a CSV
   */
  async exportToCsv(options: IAuditQueryOptions): Promise<string> {
    const filter: any = {};

    if (options.entityId) {
      filter.reservationId = new Types.ObjectId(options.entityId);
    }

    if (options.userId) {
      filter.userId = new Types.ObjectId(options.userId);
    }

    if (options.action) {
      filter.action = options.action;
    }

    if (options.startDate || options.endDate) {
      filter.timestamp = {};
      if (options.startDate) {
        filter.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        filter.timestamp.$lte = options.endDate;
      }
    }

    const records = await this.historyModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(10000) // Límite de seguridad
      .lean()
      .exec();

    // Construir CSV
    const headers = [
      "Timestamp",
      "Reservation ID",
      "Action",
      "User ID",
      "IP",
      "User Agent",
      "Changes",
    ];

    const rows = records.map((record) => {
      const changes = this.summarizeChanges(
        record.beforeData,
        record.afterData
      );
      return [
        record.timestamp.toISOString(),
        record.reservationId.toString(),
        record.action,
        record.userId.toString(),
        record.ip,
        record.userAgent,
        changes,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  /**
   * Convertir documento Mongoose a IAuditRecord
   */
  private toAuditRecord(doc: any): IAuditRecord {
    return {
      entityId: doc.reservationId.toString(),
      entityType: "RESERVATION",
      action: doc.action,
      beforeData: doc.beforeData,
      afterData: doc.afterData,
      userId: doc.userId.toString(),
      serviceName: "availability-service",
      ip: doc.ip,
      userAgent: doc.userAgent,
      location: doc.location,
      timestamp: doc.timestamp,
      metadata: doc.metadata || {},
    };
  }

  /**
   * Resumir cambios entre estado anterior y nuevo
   */
  private summarizeChanges(
    before: Record<string, any> | undefined,
    after: Record<string, any>
  ): string {
    if (!before) {
      return "Created";
    }

    const changes: string[] = [];
    const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

    for (const key of allKeys) {
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changes.push(`${key}: ${before[key]} → ${after[key]}`);
      }
    }

    return changes.join("; ") || "No changes";
  }
}
