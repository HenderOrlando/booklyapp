import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { ConflictReportEntity } from "../../domain/entities/conflict-report.entity";
import { IConflictReportRepository } from "../../domain/repositories/conflict-report.repository.interface";
import { ConflictReport } from "../schemas/conflict-report.schema";

@Injectable()
export class ConflictReportRepository implements IConflictReportRepository {
  constructor(
    @InjectModel(ConflictReport.name)
    private readonly model: Model<ConflictReport>,
  ) {}

  async create(report: ConflictReportEntity): Promise<ConflictReportEntity> {
    const doc = new this.model({
      resourceId: new Types.ObjectId(report.resourceId),
      resourceName: report.resourceName,
      resourceType: report.resourceType,
      startDate: report.startDate,
      endDate: report.endDate,
      totalConflicts: report.totalConflicts,
      resolvedConflicts: report.resolvedConflicts,
      unresolvedConflicts: report.unresolvedConflicts,
      conflictTypesBreakdown: report.conflictTypesBreakdown,
      peakConflictPeriods: report.peakConflictPeriods,
      averageResolutionTimeMinutes: report.averageResolutionTimeMinutes,
      resolutionMethodsBreakdown: report.resolutionMethodsBreakdown,
      affectedUsers: report.affectedUsers,
      metadata: report.metadata,
    });

    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<ConflictReportEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
      severity?: string;
      status?: string;
    },
  ): Promise<{ reports: ConflictReportEntity[]; meta: PaginationMeta }> {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereConditions: any = {};

    if (filters?.resourceId) {
      whereConditions.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters?.resourceType) {
      whereConditions.resourceType = filters.resourceType;
    }

    if (filters?.startDate || filters?.endDate) {
      whereConditions.startDate = {};
      if (filters?.startDate) {
        whereConditions.startDate.$gte = filters.startDate;
      }
      if (filters?.endDate) {
        whereConditions.startDate.$lte = filters.endDate;
      }
    }

    if (filters?.severity) {
      whereConditions["conflicts.severity"] = filters.severity;
    }

    if (filters?.status) {
      whereConditions["conflicts.status"] = filters.status;
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(whereConditions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(whereConditions).exec(),
    ]);

    const meta: PaginationMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      reports: docs.map((doc) => this.toEntity(doc)),
      meta,
    };
  }

  async findByResource(
    resourceId: string,
    query: PaginationQuery,
  ): Promise<{ reports: ConflictReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceId });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    resourceId?: string;
    resourceType?: string;
    severity?: string;
    status?: string;
  }): Promise<number> {
    const whereConditions: any = {};

    if (filters?.resourceId) {
      whereConditions.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters?.resourceType) {
      whereConditions.resourceType = filters.resourceType;
    }

    if (filters?.severity) {
      whereConditions["conflicts.severity"] = filters.severity;
    }

    if (filters?.status) {
      whereConditions["conflicts.status"] = filters.status;
    }

    return await this.model.countDocuments(whereConditions).exec();
  }

  private toEntity(doc: ConflictReport & Document): ConflictReportEntity {
    return new ConflictReportEntity(
      (doc._id as Types.ObjectId).toString(),
      doc.resourceId.toString(),
      doc.resourceName,
      doc.resourceType,
      doc.startDate,
      doc.endDate,
      doc.totalConflicts,
      doc.resolvedConflicts,
      doc.unresolvedConflicts,
      doc.conflictTypesBreakdown,
      doc.peakConflictPeriods,
      doc.averageResolutionTimeMinutes,
      doc.resolutionMethodsBreakdown,
      doc.affectedUsers,
      doc.metadata,
      new Date(),
      new Date(),
    );
  }
}
