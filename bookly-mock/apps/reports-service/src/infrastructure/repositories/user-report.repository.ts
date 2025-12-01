import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserReportEntity } from '@reports/domain/entities";
import { IUserReportRepository } from '@reports/domain/repositories";
import { UserReport } from "../schemas";

@Injectable()
export class UserReportRepository implements IUserReportRepository {
  constructor(
    @InjectModel(UserReport.name)
    private readonly model: Model<UserReport>
  ) {}

  async create(report: UserReportEntity): Promise<UserReportEntity> {
    const doc = new this.model({
      userId: new Types.ObjectId(report.userId),
      userName: report.userName,
      userType: report.userType,
      startDate: report.startDate,
      endDate: report.endDate,
      totalReservations: report.totalReservations,
      confirmedReservations: report.confirmedReservations,
      cancelledReservations: report.cancelledReservations,
      noShowCount: report.noShowCount,
      totalHoursReserved: report.totalHoursReserved,
      resourceTypesUsed: report.resourceTypesUsed,
      favoriteResources: report.favoriteResources.map((r) => ({
        resourceId: new Types.ObjectId(r.resourceId),
        resourceName: r.resourceName,
        usageCount: r.usageCount,
      })),
      peakUsageDays: report.peakUsageDays,
      averageAdvanceBooking: report.averageAdvanceBooking,
      penaltiesCount: report.penaltiesCount,
      feedbackSubmitted: report.feedbackSubmitted,
      metadata: report.metadata,
    });

    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<UserReportEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      userId?: string;
      userType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const mongoQuery: any = {};
    if (filters?.userId) mongoQuery.userId = new Types.ObjectId(filters.userId);
    if (filters?.userType) mongoQuery.userType = filters.userType;
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

  async findByUser(
    userId: string,
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { userId });
  }

  async findByUserType(
    userType: string,
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { userType });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { startDate, endDate });
  }

  async findReliableUsers(
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.model
        .find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.model.countDocuments({}).exec(),
    ]);

    const reliableReports = docs
      .map((doc) => this.toEntity(doc))
      .filter((report) => report.isReliableUser());

    return {
      reports: reliableReports,
      meta: {
        page,
        limit,
        total: reliableReports.length,
        totalPages: Math.ceil(reliableReports.length / limit),
      },
    };
  }

  async findUsersWithPenalties(
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const mongoQuery = { penaltiesCount: { $gt: 0 } };

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

  async update(
    id: string,
    data: Partial<UserReportEntity>
  ): Promise<UserReportEntity> {
    const doc = await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!doc) throw new Error(`User report with ID ${id} not found`);
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    userId?: string;
    userType?: string;
  }): Promise<number> {
    const mongoQuery: any = {};
    if (filters?.userId) mongoQuery.userId = new Types.ObjectId(filters.userId);
    if (filters?.userType) mongoQuery.userType = filters.userType;
    return await this.model.countDocuments(mongoQuery).exec();
  }

  private toEntity(doc: UserReport): UserReportEntity {
    return new UserReportEntity(
      (doc._id as Types.ObjectId).toString(),
      (doc.userId as Types.ObjectId).toString(),
      doc.userName,
      doc.userType,
      doc.startDate,
      doc.endDate,
      doc.totalReservations,
      doc.confirmedReservations,
      doc.cancelledReservations,
      doc.noShowCount,
      doc.totalHoursReserved,
      doc.resourceTypesUsed,
      doc.favoriteResources.map((r) => ({
        resourceId: (r.resourceId as Types.ObjectId).toString(),
        resourceName: r.resourceName,
        usageCount: r.usageCount,
      })),
      doc.peakUsageDays,
      doc.averageAdvanceBooking,
      doc.penaltiesCount,
      doc.feedbackSubmitted,
      doc.metadata,
      (doc as any).createdAt,
      (doc as any).updatedAt
    );
  }
}
