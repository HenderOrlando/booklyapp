import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WaitingListEntity } from '@availability/domain/entities/waiting-list.entity";
import { IWaitingListRepository } from '@availability/domain/repositories/waiting-list.repository.interface";
import {
  WaitingList,
  WaitingListDocument,
} from "../schemas/waiting-list.schema";

/**
 * Waiting List Repository Implementation
 * Implementación del repositorio de lista de espera usando Mongoose
 */
@Injectable()
export class WaitingListRepository implements IWaitingListRepository {
  constructor(
    @InjectModel(WaitingList.name)
    private readonly waitingListModel: Model<WaitingListDocument>
  ) {}

  async create(waitingList: WaitingListEntity): Promise<WaitingListEntity> {
    const created = new this.waitingListModel({
      resourceId: new Types.ObjectId(waitingList.resourceId),
      userId: new Types.ObjectId(waitingList.userId),
      requestedStartDate: waitingList.requestedStartDate,
      requestedEndDate: waitingList.requestedEndDate,
      priority: waitingList.priority,
      purpose: waitingList.purpose,
      isActive: waitingList.isActive,
      notifiedAt: waitingList.notifiedAt,
      expiresAt: waitingList.expiresAt,
      convertedToReservationId: waitingList.convertedToReservationId
        ? new Types.ObjectId(waitingList.convertedToReservationId)
        : undefined,
      audit: waitingList.audit,
    });

    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<WaitingListEntity | null> {
    const doc = await this.waitingListModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      userId?: string;
      isActive?: boolean;
    }
  ): Promise<{ waitingLists: WaitingListEntity[]; meta: PaginationMeta }> {
    const conditions: any = {};

    if (filters?.resourceId) {
      conditions.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters?.userId) {
      conditions.userId = new Types.ObjectId(filters.userId);
    }

    if (filters?.isActive !== undefined) {
      conditions.isActive = filters.isActive;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const total = await this.waitingListModel.countDocuments(conditions);
    const docs = await this.waitingListModel
      .find(conditions)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ priority: -1, createdAt: 1 })
      .exec();

    return {
      waitingLists: docs.map((doc) => this.toEntity(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(
    userId: string,
    query: PaginationQuery
  ): Promise<{ waitingLists: WaitingListEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { userId });
  }

  async findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ waitingLists: WaitingListEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceId });
  }

  async findActiveByResource(resourceId: string): Promise<WaitingListEntity[]> {
    const docs = await this.waitingListModel
      .find({
        resourceId: new Types.ObjectId(resourceId),
        isActive: true,
      })
      .sort({ priority: -1, createdAt: 1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findActiveInDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WaitingListEntity[]> {
    const docs = await this.waitingListModel
      .find({
        resourceId: new Types.ObjectId(resourceId),
        isActive: true,
        $and: [
          { requestedEndDate: { $gte: startDate } },
          { requestedStartDate: { $lte: endDate } },
        ],
      })
      .sort({ priority: -1, createdAt: 1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findExpired(): Promise<WaitingListEntity[]> {
    const now = new Date();
    const docs = await this.waitingListModel
      .find({
        isActive: true,
        expiresAt: { $lte: now },
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findNext(resourceId: string): Promise<WaitingListEntity | null> {
    const doc = await this.waitingListModel
      .findOne({
        resourceId: new Types.ObjectId(resourceId),
        isActive: true,
      })
      .sort({ priority: -1, createdAt: 1 })
      .exec();

    return doc ? this.toEntity(doc) : null;
  }

  async update(
    id: string,
    data: Partial<WaitingListEntity>
  ): Promise<WaitingListEntity> {
    const updateData: any = { ...data };

    if (data.resourceId) {
      updateData.resourceId = new Types.ObjectId(data.resourceId);
    }
    if (data.userId) {
      updateData.userId = new Types.ObjectId(data.userId);
    }
    if (data.convertedToReservationId) {
      updateData.convertedToReservationId = new Types.ObjectId(
        data.convertedToReservationId
      );
    }

    const updated = await this.waitingListModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`Waiting list entry with ID ${id} not found`);
    }

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.waitingListModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    resourceId?: string;
    userId?: string;
    isActive?: boolean;
  }): Promise<number> {
    const conditions: any = {};

    if (filters?.resourceId) {
      conditions.resourceId = new Types.ObjectId(filters.resourceId);
    }
    if (filters?.userId) {
      conditions.userId = new Types.ObjectId(filters.userId);
    }
    if (filters?.isActive !== undefined) {
      conditions.isActive = filters.isActive;
    }

    return await this.waitingListModel.countDocuments(conditions);
  }

  async existsForUser(
    userId: string,
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const count = await this.waitingListModel
      .countDocuments({
        userId: new Types.ObjectId(userId),
        resourceId: new Types.ObjectId(resourceId),
        isActive: true,
        $and: [
          { requestedEndDate: { $gte: startDate } },
          { requestedStartDate: { $lte: endDate } },
        ],
      })
      .exec();

    return count > 0;
  }

  private toEntity(doc: WaitingListDocument): WaitingListEntity {
    return WaitingListEntity.fromObject({
      id: (doc._id as Types.ObjectId).toString(),
      resourceId: doc.resourceId.toString(),
      userId: doc.userId.toString(),
      requestedStartDate: doc.requestedStartDate,
      requestedEndDate: doc.requestedEndDate,
      priority: doc.priority,
      purpose: doc.purpose,
      isActive: doc.isActive,
      notifiedAt: doc.notifiedAt,
      expiresAt: doc.expiresAt,
      convertedToReservationId: doc.convertedToReservationId
        ? doc.convertedToReservationId.toString()
        : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      audit: doc.audit,
    });
  }
}
