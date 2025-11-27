import { MaintenanceStatus, MaintenanceType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MaintenanceEntity } from "../../domain/entities/maintenance.entity";
import { IMaintenanceRepository } from "../../domain/repositories/maintenance.repository.interface";
import {
  Maintenance,
  MaintenanceDocument,
} from "../schemas/maintenance.schema";

/**
 * Maintenance Repository Implementation
 * Implementación del repositorio de mantenimientos con Mongoose
 */
@Injectable()
export class MaintenanceRepository implements IMaintenanceRepository {
  private readonly logger = createLogger("MaintenanceRepository");

  constructor(
    @InjectModel(Maintenance.name)
    private readonly maintenanceModel: Model<MaintenanceDocument>
  ) {}

  async create(maintenance: MaintenanceEntity): Promise<MaintenanceEntity> {
    const createdMaintenance = new this.maintenanceModel(
      maintenance.toObject()
    );
    const savedMaintenance = await createdMaintenance.save();

    this.logger.info("Maintenance created", {
      maintenanceId: String(savedMaintenance._id),
      resourceId: savedMaintenance.resourceId,
    });

    return MaintenanceEntity.fromObject(savedMaintenance.toObject());
  }

  async findById(id: string): Promise<MaintenanceEntity | null> {
    const maintenance = await this.maintenanceModel.findById(id).exec();
    return maintenance
      ? MaintenanceEntity.fromObject(maintenance.toObject())
      : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      type?: MaintenanceType;
      status?: MaintenanceStatus;
    }
  ): Promise<{ maintenances: MaintenanceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const mongoFilters: any = {};
    if (filters?.resourceId) mongoFilters.resourceId = filters.resourceId;
    if (filters?.type) mongoFilters.type = filters.type;
    if (filters?.status) mongoFilters.status = filters.status;

    const [maintenances, total] = await Promise.all([
      this.maintenanceModel
        .find(mongoFilters)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.maintenanceModel.countDocuments(mongoFilters).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      maintenances: maintenances.map((maintenance) =>
        MaintenanceEntity.fromObject(maintenance.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ maintenances: MaintenanceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [maintenances, total] = await Promise.all([
      this.maintenanceModel
        .find({ resourceId })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.maintenanceModel.countDocuments({ resourceId }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      maintenances: maintenances.map((maintenance) =>
        MaintenanceEntity.fromObject(maintenance.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findScheduled(query: PaginationQuery): Promise<{
    maintenances: MaintenanceEntity[];
    meta: PaginationMeta;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "scheduledStartDate",
      sortOrder = "asc",
    } = query;
    const skip = (page - 1) * limit;

    const [maintenances, total] = await Promise.all([
      this.maintenanceModel
        .find({ status: MaintenanceStatus.SCHEDULED })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.maintenanceModel
        .countDocuments({ status: MaintenanceStatus.SCHEDULED })
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      maintenances: maintenances.map((maintenance) =>
        MaintenanceEntity.fromObject(maintenance.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findInProgress(): Promise<MaintenanceEntity[]> {
    const maintenances = await this.maintenanceModel
      .find({ status: MaintenanceStatus.IN_PROGRESS })
      .exec();
    return maintenances.map((maintenance) =>
      MaintenanceEntity.fromObject(maintenance.toObject())
    );
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ maintenances: MaintenanceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "scheduledStartDate",
      sortOrder = "asc",
    } = query;
    const skip = (page - 1) * limit;

    const [maintenances, total] = await Promise.all([
      this.maintenanceModel
        .find({
          scheduledStartDate: { $gte: startDate },
          scheduledEndDate: { $lte: endDate },
        })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.maintenanceModel
        .countDocuments({
          scheduledStartDate: { $gte: startDate },
          scheduledEndDate: { $lte: endDate },
        })
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      maintenances: maintenances.map((maintenance) =>
        MaintenanceEntity.fromObject(maintenance.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findUpcomingByResource(
    resourceId: string
  ): Promise<MaintenanceEntity[]> {
    const now = new Date();
    const maintenances = await this.maintenanceModel
      .find({
        resourceId,
        status: MaintenanceStatus.SCHEDULED,
        scheduledStartDate: { $gte: now },
      })
      .sort({ scheduledStartDate: 1 })
      .exec();

    return maintenances.map((maintenance) =>
      MaintenanceEntity.fromObject(maintenance.toObject())
    );
  }

  async update(
    id: string,
    data: Partial<MaintenanceEntity>
  ): Promise<MaintenanceEntity> {
    const updatedMaintenance = await this.maintenanceModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    if (!updatedMaintenance) {
      throw new Error(`Maintenance with ID ${id} not found`);
    }

    this.logger.info("Maintenance updated", { maintenanceId: id });

    return MaintenanceEntity.fromObject(updatedMaintenance.toObject());
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.maintenanceModel.findByIdAndDelete(id).exec();

    if (result) {
      this.logger.info("Maintenance deleted", { maintenanceId: id });
    }

    return !!result;
  }

  async count(filters?: { status?: MaintenanceStatus }): Promise<number> {
    const mongoFilters: any = {};
    if (filters?.status) mongoFilters.status = filters.status;

    return await this.maintenanceModel.countDocuments(mongoFilters).exec();
  }

  async updateStatus(id: string, status: MaintenanceStatus): Promise<void> {
    await this.maintenanceModel
      .findByIdAndUpdate(id, { $set: { status } })
      .exec();

    this.logger.debug("Maintenance status updated", {
      maintenanceId: id,
      status,
    });
  }
}
