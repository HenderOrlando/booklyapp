import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ReassignmentHistory,
  ReassignmentHistoryDocument,
} from "../schemas/reassignment-history.schema";

/**
 * Repository para historial de reasignaciones
 */
@Injectable()
export class ReassignmentHistoryRepository {
  constructor(
    @InjectModel(ReassignmentHistory.name)
    private readonly model: Model<ReassignmentHistoryDocument>
  ) {}

  /**
   * Crear un registro de reasignación
   */
  async create(
    data: Partial<ReassignmentHistory>
  ): Promise<ReassignmentHistory> {
    const history = new this.model(data);
    return await history.save();
  }

  /**
   * Buscar por ID
   */
  async findById(id: string): Promise<ReassignmentHistory | null> {
    return await this.model.findById(id).lean().exec();
  }

  /**
   * Buscar con filtros
   */
  async findByFilters(filters: {
    userId?: string;
    originalReservationId?: string;
    originalResourceId?: string;
    newResourceId?: string;
    accepted?: boolean;
    startDate?: Date;
    endDate?: Date;
    reason?: string;
  }): Promise<ReassignmentHistory[]> {
    const query: any = {};

    if (filters.userId) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    if (filters.originalReservationId) {
      query.originalReservationId = new Types.ObjectId(
        filters.originalReservationId
      );
    }

    if (filters.originalResourceId) {
      query.originalResourceId = new Types.ObjectId(filters.originalResourceId);
    }

    if (filters.newResourceId) {
      query.newResourceId = new Types.ObjectId(filters.newResourceId);
    }

    if (filters.accepted !== undefined) {
      query.accepted = filters.accepted;
    }

    if (filters.reason) {
      query.reason = filters.reason;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    return await this.model.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  /**
   * Actualizar reasignación
   */
  async update(
    id: string,
    data: Partial<ReassignmentHistory>
  ): Promise<ReassignmentHistory | null> {
    return await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean()
      .exec();
  }

  /**
   * Marcar notificación como enviada
   */
  async markNotificationSent(id: string): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, {
        $set: {
          notificationSent: true,
          notifiedAt: new Date(),
        },
      })
      .exec();
  }

  /**
   * Obtener estadísticas de aceptación
   */
  async getAcceptanceStats(filters: {
    startDate?: Date;
    endDate?: Date;
    reason?: string;
  }): Promise<{
    total: number;
    accepted: number;
    rejected: number;
    pending: number;
    acceptanceRate: number;
  }> {
    const query: any = {};

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    if (filters.reason) {
      query.reason = filters.reason;
    }

    const total = await this.model.countDocuments(query).exec();
    const accepted = await this.model
      .countDocuments({ ...query, accepted: true })
      .exec();
    const rejected = await this.model
      .countDocuments({
        ...query,
        accepted: false,
        respondedAt: { $exists: true },
      })
      .exec();
    const pending = total - accepted - rejected;

    return {
      total,
      accepted,
      rejected,
      pending,
      acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
    };
  }

  /**
   * Obtener recursos más frecuentemente usados como alternativas
   */
  async getMostUsedAlternatives(limit: number = 10): Promise<
    Array<{
      resourceId: string;
      resourceName: string;
      count: number;
      averageScore: number;
    }>
  > {
    return await this.model
      .aggregate([
        { $match: { accepted: true } },
        {
          $group: {
            _id: "$newResourceId",
            resourceName: { $first: "$newResourceName" },
            count: { $sum: 1 },
            averageScore: { $avg: "$similarityScore" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            resourceId: { $toString: "$_id" },
            resourceName: 1,
            count: 1,
            averageScore: { $round: ["$averageScore", 2] },
          },
        },
      ])
      .exec();
  }
}
