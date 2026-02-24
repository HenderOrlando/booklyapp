import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ApprovalAuditLogActionType,
  ApprovalAuditLogEntity,
} from "@stockpile/domain/entities/approval-audit-log.entity";
import { IApprovalAuditLogRepository } from "@stockpile/domain/repositories/approval-audit-log.repository.interface";
import { ApprovalAuditLog } from "../schemas/approval-audit-log.schema";

/**
 * Approval Audit Log Repository Implementation
 */
@Injectable()
export class ApprovalAuditLogRepository implements IApprovalAuditLogRepository {
  constructor(
    @InjectModel(ApprovalAuditLog.name)
    private readonly model: Model<ApprovalAuditLog>
  ) {}

  async create(
    log: Omit<ApprovalAuditLogEntity, "id" | "createdAt">
  ): Promise<ApprovalAuditLogEntity> {
    const created = await this.model.create({
      approvalRequestId: new Types.ObjectId(log.approvalRequestId),
      action: log.action,
      actorId: new Types.ObjectId(log.actorId),
      actorRole: log.actorRole,
      timestamp: log.timestamp,
      metadata: log.metadata,
      changes: log.changes,
    });

    return ApprovalAuditLogEntity.fromObject(created.toObject());
  }

  async findById(id: string): Promise<ApprovalAuditLogEntity | null> {
    const log = await this.model.findById(id).lean();
    return log ? ApprovalAuditLogEntity.fromObject(log) : null;
  }

  async findByRequestId(requestId: string): Promise<ApprovalAuditLogEntity[]> {
    const logs = await this.model
      .find({ approvalRequestId: new Types.ObjectId(requestId) })
      .sort({ timestamp: -1 })
      .lean();

    return logs.map((log) => ApprovalAuditLogEntity.fromObject(log));
  }

  async findByActorId(actorId: string): Promise<ApprovalAuditLogEntity[]> {
    const logs = await this.model
      .find({ actorId: new Types.ObjectId(actorId) })
      .sort({ timestamp: -1 })
      .lean();

    return logs.map((log) => ApprovalAuditLogEntity.fromObject(log));
  }

  async findByAction(
    action: ApprovalAuditLogActionType
  ): Promise<ApprovalAuditLogEntity[]> {
    const logs = await this.model
      .find({ action })
      .sort({ timestamp: -1 })
      .lean();

    return logs.map((log) => ApprovalAuditLogEntity.fromObject(log));
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ApprovalAuditLogEntity[]> {
    const logs = await this.model
      .find({
        timestamp: { $gte: startDate, $lte: endDate },
      })
      .sort({ timestamp: -1 })
      .lean();

    return logs.map((log) => ApprovalAuditLogEntity.fromObject(log));
  }

  async findWithFilters(filters: {
    requestId?: string;
    actorId?: string;
    actions?: ApprovalAuditLogActionType[];
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    logs: ApprovalAuditLogEntity[];
    total: number;
  }> {
    const query: any = {};

    if (filters.requestId) {
      query.approvalRequestId = new Types.ObjectId(filters.requestId);
    }

    if (filters.actorId) {
      query.actorId = new Types.ObjectId(filters.actorId);
    }

    if (filters.actions && filters.actions.length > 0) {
      query.action = { $in: filters.actions };
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100)
        .skip(filters.offset || 0)
        .lean(),
      this.model.countDocuments(query),
    ]);

    return {
      logs: logs.map((log) => ApprovalAuditLogEntity.fromObject(log)),
      total,
    };
  }

  async countByAction(): Promise<Record<ApprovalAuditLogActionType, number>> {
    const result = await this.model.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<ApprovalAuditLogActionType, number> = {} as any;

    for (const action of Object.values(ApprovalAuditLogActionType)) {
      counts[action] = 0;
    }

    result.forEach((item) => {
      counts[item._id as ApprovalAuditLogActionType] = item.count;
    });

    return counts;
  }

  async getStatistics(filters?: { startDate?: Date; endDate?: Date }): Promise<{
    totalLogs: number;
    byAction: Record<ApprovalAuditLogActionType, number>;
    byActor: Record<string, number>;
    criticalActions: number;
  }> {
    const query: any = {};

    if (filters?.startDate || filters?.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    const [totalLogs, byActionResult, byActorResult, criticalActions] =
      await Promise.all([
        this.model.countDocuments(query),
        this.model.aggregate([
          { $match: query },
          {
            $group: {
              _id: "$action",
              count: { $sum: 1 },
            },
          },
        ]),
        this.model.aggregate([
          { $match: query },
          {
            $group: {
              _id: "$actorId",
              count: { $sum: 1 },
            },
          },
        ]),
        this.model.countDocuments({
          ...query,
          action: {
            $in: [
              ApprovalAuditLogActionType.REQUEST_APPROVED,
              ApprovalAuditLogActionType.REQUEST_REJECTED,
              ApprovalAuditLogActionType.REQUEST_CANCELLED,
            ],
          },
        }),
      ]);

    const byAction: Record<ApprovalAuditLogActionType, number> = {} as any;
    for (const action of Object.values(ApprovalAuditLogActionType)) {
      byAction[action] = 0;
    }
    byActionResult.forEach((item) => {
      byAction[item._id as ApprovalAuditLogActionType] = item.count;
    });

    const byActor: Record<string, number> = {};
    byActorResult.forEach((item) => {
      byActor[item._id.toString()] = item.count;
    });

    return {
      totalLogs,
      byAction,
      byActor,
      criticalActions,
    };
  }

  async exportLogs(filters: {
    requestId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const query: any = {};

    if (filters.requestId) {
      query.approvalRequestId = new Types.ObjectId(filters.requestId);
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    const logs = await this.model.find(query).sort({ timestamp: -1 }).lean();

    return logs.map((log) => ({
      id: log._id.toString(),
      approvalRequestId: log.approvalRequestId.toString(),
      action: log.action,
      actorId: log.actorId.toString(),
      actorRole: log.actorRole,
      timestamp: log.timestamp,
      metadata: log.metadata,
      changes: log.changes,
      createdAt: log.createdAt,
    }));
  }
}
