import { WeekDay } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AvailabilityEntity } from '@availability/domain/entities/availability.entity";
import { IAvailabilityRepository } from '@availability/domain/repositories/availability.repository.interface";
import {
  Availability,
  AvailabilityDocument,
} from "../schemas/availability.schema";

/**
 * Availability Repository Implementation
 * Implementación del repositorio de disponibilidad usando Mongoose
 */
@Injectable()
export class AvailabilityRepository implements IAvailabilityRepository {
  constructor(
    @InjectModel(Availability.name)
    private readonly availabilityModel: Model<AvailabilityDocument>
  ) {}

  async create(availability: AvailabilityEntity): Promise<AvailabilityEntity> {
    const created = new this.availabilityModel({
      resourceId: new Types.ObjectId(availability.resourceId),
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isAvailable: availability.isAvailable,
      maxConcurrentReservations: availability.maxConcurrentReservations,
      effectiveFrom: availability.effectiveFrom,
      effectiveUntil: availability.effectiveUntil,
      notes: availability.notes,
      audit: availability.audit,
    });

    const saved = await created.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<AvailabilityEntity | null> {
    const doc = await this.availabilityModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      dayOfWeek?: WeekDay;
      isAvailable?: boolean;
    }
  ): Promise<{ availabilities: AvailabilityEntity[]; meta: PaginationMeta }> {
    const conditions: any = {};

    if (filters?.resourceId) {
      conditions.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters?.dayOfWeek) {
      conditions.dayOfWeek = filters.dayOfWeek;
    }

    if (filters?.isAvailable !== undefined) {
      conditions.isAvailable = filters.isAvailable;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;

    const total = await this.availabilityModel.countDocuments(conditions);
    const docs = await this.availabilityModel
      .find(conditions)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ dayOfWeek: 1, startTime: 1 })
      .exec();

    return {
      availabilities: docs.map((doc) => this.toEntity(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByResource(resourceId: string): Promise<AvailabilityEntity[]> {
    const docs = await this.availabilityModel
      .find({ resourceId: new Types.ObjectId(resourceId) })
      .sort({ dayOfWeek: 1, startTime: 1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByDayOfWeek(
    resourceId: string,
    dayOfWeek: WeekDay
  ): Promise<AvailabilityEntity[]> {
    const docs = await this.availabilityModel
      .find({
        resourceId: new Types.ObjectId(resourceId),
        dayOfWeek,
      })
      .sort({ startTime: 1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findActiveOn(
    resourceId: string,
    date: Date
  ): Promise<AvailabilityEntity[]> {
    const docs = await this.availabilityModel
      .find({
        resourceId: new Types.ObjectId(resourceId),
        isAvailable: true,
        $or: [
          { effectiveFrom: { $exists: false } },
          { effectiveFrom: { $lte: date } },
        ],
        $and: [
          {
            $or: [
              { effectiveUntil: { $exists: false } },
              { effectiveUntil: { $gte: date } },
            ],
          },
        ],
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findOverlapping(
    resourceId: string,
    dayOfWeek: WeekDay,
    startTime: string,
    endTime: string
  ): Promise<AvailabilityEntity[]> {
    const docs = await this.availabilityModel
      .find({
        resourceId: new Types.ObjectId(resourceId),
        dayOfWeek,
        $or: [
          {
            $and: [
              { startTime: { $lte: startTime } },
              { endTime: { $gt: startTime } },
            ],
          },
          {
            $and: [
              { startTime: { $lt: endTime } },
              { endTime: { $gte: endTime } },
            ],
          },
          {
            $and: [
              { startTime: { $gte: startTime } },
              { endTime: { $lte: endTime } },
            ],
          },
        ],
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async update(
    id: string,
    data: Partial<AvailabilityEntity>
  ): Promise<AvailabilityEntity> {
    const updateData: any = { ...data };

    if (data.resourceId) {
      updateData.resourceId = new Types.ObjectId(data.resourceId);
    }

    const updated = await this.availabilityModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updated) {
      throw new Error(`Availability with ID ${id} not found`);
    }

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.availabilityModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(filters?: {
    resourceId?: string;
    isAvailable?: boolean;
  }): Promise<number> {
    const conditions: any = {};

    if (filters?.resourceId) {
      conditions.resourceId = new Types.ObjectId(filters.resourceId);
    }
    if (filters?.isAvailable !== undefined) {
      conditions.isAvailable = filters.isAvailable;
    }

    return await this.availabilityModel.countDocuments(conditions);
  }

  async existsForResource(resourceId: string): Promise<boolean> {
    const count = await this.availabilityModel
      .countDocuments({ resourceId: new Types.ObjectId(resourceId) })
      .exec();
    return count > 0;
  }

  async findAvailableInDateRange(
    startDate: Date,
    endDate: Date,
    filters?: {
      timeStart?: string;
      timeEnd?: string;
      isAvailable?: boolean;
    }
  ): Promise<AvailabilityEntity[]> {
    const conditions: any = {
      $or: [
        // Disponibilidades sin fecha de fin o con fecha de fin después del inicio de búsqueda
        { effectiveUntil: null },
        { effectiveUntil: { $gte: startDate } },
      ],
      $and: [
        // Disponibilidades que empiezan antes del fin de búsqueda
        {
          $or: [{ effectiveFrom: null }, { effectiveFrom: { $lte: endDate } }],
        },
      ],
    };

    if (filters?.isAvailable !== undefined) {
      conditions.isAvailable = filters.isAvailable;
    }

    if (filters?.timeStart && filters?.timeEnd) {
      // Filtrar por rango de horas
      conditions.$and.push({
        $or: [
          // Horario del recurso se solapa con el rango buscado
          {
            startTime: { $lte: filters.timeEnd },
            endTime: { $gte: filters.timeStart },
          },
        ],
      });
    }

    const docs = await this.availabilityModel
      .find(conditions)
      .sort({ resourceId: 1, dayOfWeek: 1, startTime: 1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  async findByResourceIds(
    resourceIds: string[]
  ): Promise<AvailabilityEntity[]> {
    const objectIds = resourceIds.map((id) => new Types.ObjectId(id));
    const docs = await this.availabilityModel
      .find({ resourceId: { $in: objectIds } })
      .sort({ resourceId: 1, dayOfWeek: 1, startTime: 1 })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  private toEntity(doc: AvailabilityDocument): AvailabilityEntity {
    return AvailabilityEntity.fromObject({
      id: (doc._id as Types.ObjectId).toString(),
      resourceId: doc.resourceId.toString(),
      dayOfWeek: doc.dayOfWeek,
      startTime: doc.startTime,
      endTime: doc.endTime,
      isAvailable: doc.isAvailable,
      maxConcurrentReservations: doc.maxConcurrentReservations,
      effectiveFrom: doc.effectiveFrom,
      effectiveUntil: doc.effectiveUntil,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      audit: doc.audit,
    });
  }
}
