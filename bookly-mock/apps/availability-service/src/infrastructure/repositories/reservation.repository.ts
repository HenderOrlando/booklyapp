import { ReservationStatus } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ReservationEntity } from '@availability/domain/entities/reservation.entity";
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface";
import {
  Reservation,
  ReservationDocument,
} from "../schemas/reservation.schema";

/**
 * Reservation Repository Implementation
 * Implementación del repositorio de reservas usando Mongoose
 */
@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>
  ) {}

  async create(reservation: ReservationEntity): Promise<ReservationEntity> {
    const created = new this.reservationModel({
      resourceId: new Types.ObjectId(reservation.resourceId),
      userId: new Types.ObjectId(reservation.userId),
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      purpose: reservation.purpose,
      status: reservation.status,
      isRecurring: reservation.isRecurring,
      recurringPattern: reservation.recurringPattern,
      participants: reservation.participants,
      notes: reservation.notes,
      checkInTime: reservation.checkInTime,
      checkOutTime: reservation.checkOutTime,
      externalCalendarId: reservation.externalCalendarId,
      externalCalendarEventId: reservation.externalCalendarEventId,
      seriesId: reservation.seriesId,
      parentReservationId: reservation.parentReservationId
        ? new Types.ObjectId(reservation.parentReservationId)
        : undefined,
      instanceNumber: reservation.instanceNumber,
      exceptions: reservation.exceptions,
      audit: reservation.audit,
    });

    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const doc = await this.reservationModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      userId?: string;
      resourceId?: string;
      status?: ReservationStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }> {
    const conditions: any = {};

    if (filters?.userId) {
      conditions.userId = new Types.ObjectId(filters.userId);
    }

    if (filters?.resourceId) {
      conditions.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters?.status) {
      conditions.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      conditions.$and = [];
      if (filters.startDate) {
        conditions.$and.push({ endDate: { $gte: filters.startDate } });
      }
      if (filters.endDate) {
        conditions.$and.push({ startDate: { $lte: filters.endDate } });
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const total = await this.reservationModel.countDocuments(conditions);
    const docs = await this.reservationModel
      .find(conditions)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return {
      reservations: docs.map((doc) => this.toEntity(doc)),
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
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { userId });
  }

  async findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceId });
  }

  async findActiveByResource(resourceId: string): Promise<ReservationEntity[]> {
    const docs = await this.reservationModel
      .find({
        resourceId: new Types.ObjectId(resourceId),
        status: {
          $in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN],
        },
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReservationEntity[]> {
    const docs = await this.reservationModel
      .find({
        resourceId: new Types.ObjectId(resourceId),
        $and: [
          { endDate: { $gte: startDate } },
          { startDate: { $lte: endDate } },
        ],
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findConflicts(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeReservationId?: string
  ): Promise<ReservationEntity[]> {
    const conditions: any = {
      resourceId: new Types.ObjectId(resourceId),
      status: {
        $in: [
          ReservationStatus.PENDING,
          ReservationStatus.CONFIRMED,
          ReservationStatus.CHECKED_IN,
        ],
      },
      $and: [{ endDate: { $gt: startDate } }, { startDate: { $lt: endDate } }],
    };

    if (excludeReservationId) {
      conditions._id = { $ne: new Types.ObjectId(excludeReservationId) };
    }

    const docs = await this.reservationModel.find(conditions).exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findUpcoming(
    minutesAhead: number,
    query: PaginationQuery
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }> {
    const now = new Date();
    const future = new Date(now.getTime() + minutesAhead * 60000);

    const conditions = {
      status: ReservationStatus.CONFIRMED,
      startDate: { $gte: now, $lte: future },
    };

    const page = query.page || 1;
    const limit = query.limit || 10;

    const total = await this.reservationModel.countDocuments(conditions);
    const docs = await this.reservationModel
      .find(conditions)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ startDate: 1 })
      .exec();

    return {
      reservations: docs.map((doc) => this.toEntity(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPendingCheckIn(): Promise<ReservationEntity[]> {
    const now = new Date();
    const docs = await this.reservationModel
      .find({
        status: ReservationStatus.CONFIRMED,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findPendingCheckOut(): Promise<ReservationEntity[]> {
    const now = new Date();
    const docs = await this.reservationModel
      .find({
        status: ReservationStatus.CHECKED_IN,
        endDate: { $lte: now },
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findRecurring(
    query: PaginationQuery
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, {});
  }

  async update(
    id: string,
    data: Partial<ReservationEntity>
  ): Promise<ReservationEntity> {
    const updateData: any = { ...data };

    if (data.resourceId) {
      updateData.resourceId = new Types.ObjectId(data.resourceId);
    }
    if (data.userId) {
      updateData.userId = new Types.ObjectId(data.userId);
    }

    const updated = await this.reservationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`Reservation with ID ${id} not found`);
    }

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.reservationModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    userId?: string;
    resourceId?: string;
    status?: ReservationStatus;
  }): Promise<number> {
    const conditions: any = {};

    if (filters?.userId) {
      conditions.userId = new Types.ObjectId(filters.userId);
    }
    if (filters?.resourceId) {
      conditions.resourceId = new Types.ObjectId(filters.resourceId);
    }
    if (filters?.status) {
      conditions.status = filters.status;
    }

    return await this.reservationModel.countDocuments(conditions);
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<void> {
    await this.reservationModel.findByIdAndUpdate(id, { status }).exec();
  }

  async findByExternalCalendar(
    externalCalendarId: string,
    externalCalendarEventId: string
  ): Promise<ReservationEntity | null> {
    const doc = await this.reservationModel
      .findOne({ externalCalendarId, externalCalendarEventId })
      .exec();

    return doc ? this.toEntity(doc) : null;
  }

  async find(
    filters: any,
    options?: { skip?: number; limit?: number; sort?: any }
  ): Promise<ReservationEntity[]> {
    let query = this.reservationModel.find(filters);

    if (options?.skip) {
      query = query.skip(options.skip);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    const docs = await query.exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findOne(filters: any): Promise<ReservationEntity | null> {
    const doc = await this.reservationModel.findOne(filters).exec();
    return doc ? this.toEntity(doc) : null;
  }

  private toEntity(doc: ReservationDocument): ReservationEntity {
    return ReservationEntity.fromObject({
      id: (doc._id as Types.ObjectId).toString(),
      resourceId: doc.resourceId.toString(),
      userId: doc.userId.toString(),
      startDate: doc.startDate,
      endDate: doc.endDate,
      purpose: doc.purpose,
      status: doc.status,
      isRecurring: doc.isRecurring,
      recurringPattern: doc.recurringPattern,
      participants: doc.participants,
      notes: doc.notes,
      checkInTime: doc.checkInTime,
      checkOutTime: doc.checkOutTime,
      externalCalendarId: doc.externalCalendarId,
      externalCalendarEventId: doc.externalCalendarEventId,
      seriesId: doc.seriesId,
      parentReservationId: doc.parentReservationId?.toString(),
      instanceNumber: doc.instanceNumber,
      exceptions: doc.exceptions,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      audit: doc.audit,
    });
  }
}
