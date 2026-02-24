import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DemandReportEntity } from '@reports/domain/entities';
import { IDemandReportRepository } from '@reports/domain/repositories';
import { DemandReport } from "../schemas";

@Injectable()
export class DemandReportRepository implements IDemandReportRepository {
  constructor(
    @InjectModel(DemandReport.name)
    private readonly model: Model<DemandReport>
  ) {}

  async create(report: DemandReportEntity): Promise<DemandReportEntity> {
    const doc = new this.model({
      resourceType: report.resourceType,
      programId: new Types.ObjectId(report.programId),
      startDate: report.startDate,
      endDate: report.endDate,
      totalDenials: report.totalDenials,
      reasonsBreakdown: report.reasonsBreakdown,
      peakDemandPeriods: report.peakDemandPeriods,
      alternativeResourcesSuggested: report.alternativeResourcesSuggested,
      waitingListEntries: report.waitingListEntries,
      averageWaitTime: report.averageWaitTime,
      metadata: report.metadata,
    });

    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<DemandReportEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      resourceType?: string;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const mongoQuery: any = {};
    if (filters?.resourceType) mongoQuery.resourceType = filters.resourceType;
    if (filters?.programId)
      mongoQuery.programId = new Types.ObjectId(filters.programId);
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

  async findByResourceType(
    resourceType: string,
    query: PaginationQuery
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceType });
  }

  async findByProgram(
    programId: string,
    query: PaginationQuery
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { programId });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { startDate, endDate });
  }

  async update(
    id: string,
    data: Partial<DemandReportEntity>
  ): Promise<DemandReportEntity> {
    const doc = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!doc) throw new Error(`Demand report with ID ${id} not found`);
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    resourceType?: string;
    programId?: string;
  }): Promise<number> {
    const mongoQuery: any = {};
    if (filters?.resourceType) mongoQuery.resourceType = filters.resourceType;
    if (filters?.programId)
      mongoQuery.programId = new Types.ObjectId(filters.programId);
    return await this.model.countDocuments(mongoQuery).exec();
  }

  private toEntity(doc: DemandReport): DemandReportEntity {
    return new DemandReportEntity(
      (doc._id as Types.ObjectId).toString(),
      doc.resourceType,
      (doc.programId as Types.ObjectId).toString(),
      doc.startDate,
      doc.endDate,
      doc.totalDenials,
      doc.reasonsBreakdown,
      doc.peakDemandPeriods,
      doc.alternativeResourcesSuggested,
      doc.waitingListEntries,
      doc.averageWaitTime,
      doc.metadata,
      (doc as any).createdAt,
      (doc as any).updatedAt
    );
  }
}
