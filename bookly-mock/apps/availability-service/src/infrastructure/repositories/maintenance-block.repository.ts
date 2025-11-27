import { MaintenanceStatus } from "@libs/common/enums";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  MaintenanceBlock,
  MaintenanceBlockDocument,
} from "../schemas/maintenance-block.schema";

/**
 * Repository para gestión de bloqueos por mantenimiento
 */
@Injectable()
export class MaintenanceBlockRepository {
  constructor(
    @InjectModel(MaintenanceBlock.name)
    private readonly model: Model<MaintenanceBlockDocument>
  ) {}

  /**
   * Crear un bloqueo de mantenimiento
   */
  async create(
    data: Partial<MaintenanceBlock>,
    userId: string
  ): Promise<MaintenanceBlock> {
    const block = new this.model({
      ...data,
      audit: {
        createdBy: new Types.ObjectId(userId),
      },
    });

    return await block.save();
  }

  /**
   * Buscar bloqueo por ID
   */
  async findById(id: string): Promise<MaintenanceBlock | null> {
    return await this.model.findById(id).lean().exec();
  }

  /**
   * Buscar bloqueos con filtros
   */
  async findByFilters(filters: {
    resourceId?: string;
    status?: MaintenanceStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MaintenanceBlock[]> {
    const query: any = {};

    if (filters.resourceId) {
      query.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    // Buscar bloqueos que se solapan con el rango de fechas
    if (filters.startDate || filters.endDate) {
      query.$or = [];

      if (filters.startDate && filters.endDate) {
        // Bloqueos que comienzan o terminan dentro del rango
        query.$or.push(
          {
            startDate: { $gte: filters.startDate, $lte: filters.endDate },
          },
          {
            endDate: { $gte: filters.startDate, $lte: filters.endDate },
          },
          // Bloqueos que abarcan todo el rango
          {
            startDate: { $lte: filters.startDate },
            endDate: { $gte: filters.endDate },
          }
        );
      } else if (filters.startDate) {
        query.endDate = { $gte: filters.startDate };
      } else if (filters.endDate) {
        query.startDate = { $lte: filters.endDate };
      }
    }

    return await this.model.find(query).sort({ startDate: 1 }).lean().exec();
  }

  /**
   * Buscar bloqueos activos (en progreso)
   */
  async findActive(): Promise<MaintenanceBlock[]> {
    const now = new Date();
    return await this.model
      .find({
        status: MaintenanceStatus.IN_PROGRESS,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .lean()
      .exec();
  }

  /**
   * Buscar bloqueos próximos (programados para las próximas N horas)
   */
  async findUpcoming(hoursAhead: number): Promise<MaintenanceBlock[]> {
    const now = new Date();
    const future = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return await this.model
      .find({
        status: MaintenanceStatus.SCHEDULED,
        startDate: { $gte: now, $lte: future },
      })
      .sort({ startDate: 1 })
      .lean()
      .exec();
  }

  /**
   * Buscar bloqueos que afectan un recurso en un rango de fechas
   */
  async findConflicts(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<MaintenanceBlock[]> {
    const query: any = {
      resourceId: new Types.ObjectId(resourceId),
      status: {
        $in: [MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS],
      },
      $or: [
        {
          startDate: { $gte: startDate, $lt: endDate },
        },
        {
          endDate: { $gt: startDate, $lte: endDate },
        },
        {
          startDate: { $lte: startDate },
          endDate: { $gte: endDate },
        },
      ],
    };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    return await this.model.find(query).lean().exec();
  }

  /**
   * Actualizar un bloqueo
   */
  async update(
    id: string,
    data: Partial<MaintenanceBlock>,
    userId?: string
  ): Promise<MaintenanceBlock | null> {
    const updateData: any = { ...data };

    if (userId) {
      updateData["audit.updatedBy"] = new Types.ObjectId(userId);
    }

    return await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean()
      .exec();
  }

  /**
   * Actualizar estado de un mantenimiento
   */
  async updateStatus(
    id: string,
    status: MaintenanceStatus
  ): Promise<MaintenanceBlock | null> {
    return await this.model
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean()
      .exec();
  }

  /**
   * Completar un mantenimiento
   */
  async complete(
    id: string,
    userId: string,
    notes?: string
  ): Promise<MaintenanceBlock | null> {
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: MaintenanceStatus.COMPLETED,
            completedAt: new Date(),
            "audit.completedBy": new Types.ObjectId(userId),
            ...(notes && { notes }),
          },
        },
        { new: true }
      )
      .lean()
      .exec();
  }

  /**
   * Cancelar un mantenimiento
   */
  async cancel(
    id: string,
    userId: string,
    reason: string
  ): Promise<MaintenanceBlock | null> {
    return await this.model
      .findByIdAndUpdate(
        id,
        {
          $set: {
            status: MaintenanceStatus.CANCELLED,
            cancelledAt: new Date(),
            "audit.cancelledBy": new Types.ObjectId(userId),
            notes: reason,
          },
        },
        { new: true }
      )
      .lean()
      .exec();
  }

  /**
   * Agregar reservas afectadas
   */
  async addAffectedReservations(
    id: string,
    reservationIds: string[]
  ): Promise<void> {
    await this.model
      .findByIdAndUpdate(id, {
        $addToSet: { affectedReservations: { $each: reservationIds } },
      })
      .exec();
  }

  /**
   * Eliminar un bloqueo
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Contar bloqueos con filtros
   */
  async count(filters: {
    resourceId?: string;
    status?: MaintenanceStatus;
  }): Promise<number> {
    const query: any = {};

    if (filters.resourceId) {
      query.resourceId = new Types.ObjectId(filters.resourceId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return await this.model.countDocuments(query).exec();
  }

  /**
   * Cambiar estado de bloqueos programados que ya iniciaron
   * Útil para cron job automático
   */
  async startScheduledMaintenance(): Promise<number> {
    const now = new Date();
    const result = await this.model
      .updateMany(
        {
          status: MaintenanceStatus.SCHEDULED,
          startDate: { $lte: now },
        },
        {
          $set: { status: MaintenanceStatus.IN_PROGRESS },
        }
      )
      .exec();

    return result.modifiedCount || 0;
  }
}
