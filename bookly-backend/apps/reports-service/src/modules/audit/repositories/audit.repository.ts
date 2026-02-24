import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  IAuditQueryOptions,
  IAuditQueryResult,
  IAuditRecord,
} from "@reports/audit-decorators";
import { Model } from "mongoose";
import { AuditRecord } from "../schemas/audit-record.schema";

/**
 * Repositorio de auditoría para MongoDB
 * Gestiona la persistencia de registros de auditoría
 */
@Injectable()
export class AuditRepository {
  private readonly logger = new Logger(AuditRepository.name);

  constructor(
    @InjectModel(AuditRecord.name)
    private readonly auditModel: Model<AuditRecord>
  ) {}

  /**
   * Guardar un registro de auditoría
   */
  async save(record: IAuditRecord): Promise<void> {
    try {
      await this.auditModel.create(record);
    } catch (error) {
      this.logger.error(
        "Error saving audit record",
        error.stack,
        "AuditRepository"
      );
      throw error;
    }
  }

  /**
   * Consultar historial por entidad
   */
  async findByEntityId(
    entityId: string,
    entityType: string,
    options?: IAuditQueryOptions
  ): Promise<IAuditQueryResult> {
    const query: any = { entityId, entityType };

    // Filtros adicionales
    if (options?.action) {
      query.action = options.action;
    }
    if (options?.userId) {
      query.userId = options.userId;
    }
    if (options?.startDate || options?.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate;
      }
    }
    if (options?.serviceName) {
      query.serviceName = options.serviceName;
    }
    if (options?.source) {
      query["metadata.source"] = options.source;
    }

    // Paginación
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditModel.countDocuments(query).exec(),
    ]);

    return {
      records: records as any[],
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
    const query: any = { userId };

    // Filtros adicionales
    if (options?.entityType) {
      query.entityType = options.entityType;
    }
    if (options?.action) {
      query.action = options.action;
    }
    if (options?.startDate || options?.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate;
      }
    }
    if (options?.serviceName) {
      query.serviceName = options.serviceName;
    }
    if (options?.source) {
      query["metadata.source"] = options.source;
    }

    // Paginación
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditModel.countDocuments(query).exec(),
    ]);

    return {
      records: records as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Consultar historial con filtros
   */
  async findWithFilters(
    options: IAuditQueryOptions
  ): Promise<IAuditQueryResult> {
    const query: any = {};

    // Aplicar filtros
    if (options.entityId) {
      query.entityId = options.entityId;
    }
    if (options.entityType) {
      query.entityType = options.entityType;
    }
    if (options.userId) {
      query.userId = options.userId;
    }
    if (options.action) {
      query.action = options.action;
    }
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate;
      }
    }
    if (options.serviceName) {
      query.serviceName = options.serviceName;
    }
    if (options.source) {
      query["metadata.source"] = options.source;
    }

    // Paginación
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      this.auditModel
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditModel.countDocuments(query).exec(),
    ]);

    return {
      records: records as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Eliminar registros antiguos (para limpieza automática)
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.auditModel
      .deleteMany({ timestamp: { $lt: date } })
      .exec();
    return result.deletedCount || 0;
  }

  /**
   * Obtener estadísticas de auditoría
   */
  async getStats(startDate: Date, endDate: Date) {
    return this.auditModel
      .aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              entityType: "$entityType",
              action: "$action",
              serviceName: "$serviceName",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
      ])
      .exec();
  }
}
