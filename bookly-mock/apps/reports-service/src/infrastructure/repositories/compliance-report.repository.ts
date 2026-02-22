import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Document, Model, Types } from "mongoose";
import { ComplianceReportEntity } from "../../domain/entities/compliance-report.entity";
import { IComplianceReportRepository } from "../../domain/repositories/compliance-report.repository.interface";
import { ComplianceReport } from "../schemas/compliance-report.schema";

@Injectable()
export class ComplianceReportRepository implements IComplianceReportRepository {
  constructor(
    @InjectModel(ComplianceReport.name)
    private readonly model: Model<ComplianceReport>,
  ) {}

  async create(
    report: ComplianceReportEntity,
  ): Promise<ComplianceReportEntity> {
    const doc = new this.model({
      resourceId: new Types.ObjectId(report.resourceId),
      resourceName: report.resourceName,
      resourceType: report.resourceType,
      startDate: report.startDate,
      endDate: report.endDate,
      totalReservations: report.totalReservations,
      checkedInReservations: report.checkedInReservations,
      noShowReservations: report.noShowReservations,
      lateCheckIns: report.lateCheckIns,
      earlyCheckOuts: report.earlyCheckOuts,
      onTimeCheckIns: report.onTimeCheckIns,
      complianceRate: report.complianceRate,
      noShowRate: report.noShowRate,
      averageCheckInDelayMinutes: report.averageCheckInDelayMinutes,
      usersWithNoShow: report.usersWithNoShow.map((user) => ({
        userId: new Types.ObjectId(user.userId),
        noShowCount: user.noShowCount,
      })),
      complianceByDayOfWeek: report.complianceByDayOfWeek,
      complianceByHour: report.complianceByHour,
      metadata: report.metadata,
    });

    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<ComplianceReportEntity | null> {
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
    },
  ): Promise<{ reports: ComplianceReportEntity[]; meta: PaginationMeta }> {
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
  ): Promise<{ reports: ComplianceReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceId });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    resourceId?: string;
    resourceType?: string;
  }): Promise<number> {
    const whereConditions: any = {};

    if (filters?.resourceId) {
      whereConditions.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters?.resourceType) {
      whereConditions.resourceType = filters.resourceType;
    }

    return await this.model.countDocuments(whereConditions).exec();
  }

  private toEntity(doc: ComplianceReport & Document): ComplianceReportEntity {
    return new ComplianceReportEntity(
      (doc._id as Types.ObjectId).toString(),
      doc.resourceId.toString(),
      doc.resourceName,
      doc.resourceType,
      doc.startDate,
      doc.endDate,
      doc.totalReservations,
      doc.checkedInReservations,
      doc.noShowReservations,
      doc.lateCheckIns,
      doc.earlyCheckOuts,
      doc.onTimeCheckIns,
      doc.complianceRate,
      doc.noShowRate,
      doc.averageCheckInDelayMinutes,
      doc.usersWithNoShow.map((user) => ({
        userId: user.userId.toString(),
        noShowCount: user.noShowCount,
      })),
      doc.complianceByDayOfWeek,
      doc.complianceByHour,
      doc.metadata,
      new Date(),
      new Date(),
    );
  }
}
