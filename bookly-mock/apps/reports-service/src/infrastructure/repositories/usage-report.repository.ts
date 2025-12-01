import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UsageReportEntity } from '@reports/domain/entities";
import { IUsageReportRepository } from '@reports/domain/repositories";
import { UsageReport } from "../schemas";

@Injectable()
export class UsageReportRepository implements IUsageReportRepository {
  constructor(
    @InjectModel(UsageReport.name)
    private readonly model: Model<UsageReport>
  ) {}

  async create(report: UsageReportEntity): Promise<UsageReportEntity> {
    const doc = new this.model({
      resourceId: new Types.ObjectId(report.resourceId),
      resourceName: report.resourceName,
      resourceType: report.resourceType,
      startDate: report.startDate,
      endDate: report.endDate,
      totalReservations: report.totalReservations,
      confirmedReservations: report.confirmedReservations,
      cancelledReservations: report.cancelledReservations,
      noShowReservations: report.noShowReservations,
      totalHoursReserved: report.totalHoursReserved,
      totalHoursUsed: report.totalHoursUsed,
      occupancyRate: report.occupancyRate,
      averageSessionDuration: report.averageSessionDuration,
      peakUsageHours: report.peakUsageHours,
      programsBreakdown: report.programsBreakdown,
      metadata: report.metadata,
    });

    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<UsageReportEntity | null> {
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
    }
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const mongoQuery: any = {};
    if (filters?.resourceId) {
      mongoQuery.resourceId = new Types.ObjectId(filters.resourceId);
    }
    if (filters?.resourceType) {
      mongoQuery.resourceType = filters.resourceType;
    }
    if (filters?.startDate || filters?.endDate) {
      mongoQuery.startDate = {};
      if (filters.startDate) mongoQuery.startDate.$gte = filters.startDate;
      if (filters.endDate) mongoQuery.startDate.$lte = filters.endDate;
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(mongoQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.model.countDocuments(mongoQuery).exec(),
    ]);

    return {
      reports: docs.map((doc) => this.toEntity(doc)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceId });
  }

  async findByResourceType(
    resourceType: string,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceType });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { startDate, endDate });
  }

  async update(
    id: string,
    data: Partial<UsageReportEntity>
  ): Promise<UsageReportEntity> {
    const doc = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!doc) throw new Error(`Usage report with ID ${id} not found`);
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    resourceId?: string;
    resourceType?: string;
  }): Promise<number> {
    const mongoQuery: any = {};
    if (filters?.resourceId) {
      mongoQuery.resourceId = new Types.ObjectId(filters.resourceId);
    }
    if (filters?.resourceType) {
      mongoQuery.resourceType = filters.resourceType;
    }
    return await this.model.countDocuments(mongoQuery).exec();
  }

  private toEntity(doc: UsageReport): UsageReportEntity {
    return new UsageReportEntity(
      (doc._id as Types.ObjectId).toString(),
      (doc.resourceId as Types.ObjectId).toString(),
      doc.resourceName,
      doc.resourceType,
      doc.startDate,
      doc.endDate,
      doc.totalReservations,
      doc.confirmedReservations,
      doc.cancelledReservations,
      doc.noShowReservations,
      doc.totalHoursReserved,
      doc.totalHoursUsed,
      doc.occupancyRate,
      doc.averageSessionDuration,
      doc.peakUsageHours,
      doc.programsBreakdown,
      doc.metadata,
      (doc as any).createdAt,
      (doc as any).updatedAt
    );
  }
}
