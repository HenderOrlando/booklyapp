import { ReservationStatus } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ReservationEntity } from '@availability/domain/entities/reservation.entity';
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';
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

  async getStats(filters?: {
    userId?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    active: number;
    upcoming: number;
    today: number;
  }> {
    const conditions: any = {};

    if (filters?.userId) {
      conditions.userId = new Types.ObjectId(filters.userId);
    }
    if (filters?.resourceId) {
      conditions.resourceId = new Types.ObjectId(filters.resourceId);
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const pipeline = [
      { $match: conditions },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
          },
          upcoming: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$startDate", today] },
                    { $in: ["$status", ["PENDING", "CONFIRMED"]] }
                  ]
                },
                1,
                0
              ]
            }
          },
          today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$startDate", today] },
                    { $lte: ["$startDate", todayEnd] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ];

    const result = await this.reservationModel.aggregate(pipeline).exec();
    
    if (!result || result.length === 0) {
      return {
        total: 0, pending: 0, confirmed: 0, inProgress: 0, completed: 0,
        cancelled: 0, active: 0, upcoming: 0, today: 0
      };
    }

    const stats = result[0];
    const active = stats.pending + stats.confirmed + stats.inProgress;

    return {
      total: stats.total || 0,
      pending: stats.pending || 0,
      confirmed: stats.confirmed || 0,
      inProgress: stats.inProgress || 0,
      completed: stats.completed || 0,
      cancelled: stats.cancelled || 0,
      active,
      upcoming: stats.upcoming || 0,
      today: stats.today || 0,
    };
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      userId?: string;
      resourceId?: string;
      status?: ReservationStatus;
      startDate?: Date;
      endDate?: Date;
      search?: string;
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

    if (filters?.search) {
      // Búsqueda por propósito (título de reserva)
      // Opcionalmente se podría agregar búsqueda por nombre de recurso si hacemos un lookup/populate
      // pero para mantenerlo simple y eficiente en MongoDB buscamos en los campos de la reserva.
      conditions.$or = [
        { purpose: { $regex: filters.search, $options: "i" } },
        { notes: { $regex: filters.search, $options: "i" } }
      ];
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
