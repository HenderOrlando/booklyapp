import { ExceptionReason } from "@libs/common/enums";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  AvailabilityException,
  AvailabilityExceptionDocument,
} from "../schemas/availability-exception.schema";

/**
 * Repository para gestión de excepciones de disponibilidad
 */
@Injectable()
export class AvailabilityExceptionRepository {
  constructor(
    @InjectModel(AvailabilityException.name)
    private readonly model: Model<AvailabilityExceptionDocument>
  ) {}

  /**
   * Crear una excepción de disponibilidad
   */
  async create(
    data: Partial<AvailabilityException>,
    userId: string
  ): Promise<AvailabilityException> {
    const exception = new this.model({
      ...data,
      createdBy: new Types.ObjectId(userId),
    });

    return await exception.save();
  }

  /**
   * Buscar excepción por ID
   */
  async findById(id: string): Promise<AvailabilityException | null> {
    return await this.model.findById(id).lean().exec();
  }

  /**
   * Buscar excepciones con filtros
   */
  async findByFilters(filters: {
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    reason?: ExceptionReason;
    isAvailable?: boolean;
  }): Promise<AvailabilityException[]> {
    const query: any = {};

    if (filters.resourceId) {
      query.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters.startDate || filters.endDate) {
      query.exceptionDate = {};
      if (filters.startDate) {
        query.exceptionDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.exceptionDate.$lte = filters.endDate;
      }
    }

    if (filters.reason) {
      query.reason = filters.reason;
    }

    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    return await this.model
      .find(query)
      .sort({ exceptionDate: 1 })
      .lean()
      .exec();
  }

  /**
   * Buscar excepciones de un recurso en una fecha específica
   */
  async findByResourceAndDate(
    resourceId: string,
    date: Date
  ): Promise<AvailabilityException | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .findOne({
        resourceId: new Types.ObjectId(resourceId),
        exceptionDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .lean()
      .exec();
  }

  /**
   * Buscar excepciones de múltiples recursos en un rango de fechas
   */
  async findByResourcesAndDateRange(
    resourceIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<AvailabilityException[]> {
    return await this.model
      .find({
        resourceId: {
          $in: resourceIds.map((id) => new Types.ObjectId(id)),
        },
        exceptionDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ exceptionDate: 1 })
      .lean()
      .exec();
  }

  /**
   * Actualizar una excepción
   */
  async update(
    id: string,
    data: Partial<AvailabilityException>
  ): Promise<AvailabilityException | null> {
    return await this.model
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean()
      .exec();
  }

  /**
   * Eliminar una excepción
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Contar excepciones con filtros
   */
  async count(filters: {
    resourceId?: string;
    reason?: ExceptionReason;
    isAvailable?: boolean;
  }): Promise<number> {
    const query: any = {};

    if (filters.resourceId) {
      query.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters.reason) {
      query.reason = filters.reason;
    }

    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    return await this.model.countDocuments(query).exec();
  }

  /**
   * Verificar si existe una excepción para un recurso en una fecha
   */
  async exists(resourceId: string, date: Date): Promise<boolean> {
    const exception = await this.findByResourceAndDate(resourceId, date);
    return !!exception;
  }

  /**
   * Eliminar excepciones pasadas
   * Útil para limpieza de datos históricos
   */
  async deleteOldExceptions(beforeDate: Date): Promise<number> {
    const result = await this.model
      .deleteMany({
        exceptionDate: { $lt: beforeDate },
      })
      .exec();

    return result.deletedCount || 0;
  }
}
