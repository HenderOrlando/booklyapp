import { ResourceStatus, ResourceType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ResourceEntity } from '@resources/domain/entities/resource.entity';
import { IResourceRepository } from '@resources/domain/repositories/resource.repository.interface';
import { Resource, ResourceDocument } from "../schemas/resource.schema";

/**
 * Resource Repository Implementation
 * Implementación del repositorio de recursos con Mongoose
 */
@Injectable()
export class ResourceRepository implements IResourceRepository {
  private readonly logger = createLogger("ResourceRepository");

  constructor(
    @InjectModel(Resource.name)
    private readonly resourceModel: Model<ResourceDocument>
  ) {}

  async create(resource: ResourceEntity): Promise<ResourceEntity> {
    const createdResource = new this.resourceModel(resource.toObject());
    const savedResource = await createdResource.save();

    this.logger.info("Resource created", {
      resourceId: String(savedResource._id),
      code: savedResource.code,
    });

    return ResourceEntity.fromObject(savedResource.toObject());
  }

  async findById(id: string): Promise<ResourceEntity | null> {
    const resource = await this.resourceModel.findById(id).exec();
    return resource ? ResourceEntity.fromObject(resource.toObject()) : null;
  }

  async findByCode(code: string): Promise<ResourceEntity | null> {
    const resource = await this.resourceModel
      .findOne({ code: code.toUpperCase() })
      .exec();
    return resource ? ResourceEntity.fromObject(resource.toObject()) : null;
  }

  async findMany(
    query: PaginationQuery,
    filters?: {
      type?: ResourceType;
      categoryId?: string;
      programId?: string;
      status?: ResourceStatus;
      isActive?: boolean;
      location?: string;
      building?: string;
      minCapacity?: number;
      maxCapacity?: number;
      search?: string;
    }
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const mongoFilters: any = {};
    if (filters?.type) mongoFilters.type = filters.type;
    if (filters?.categoryId) mongoFilters.categoryId = filters.categoryId;
    if (filters?.programId) mongoFilters.programIds = filters.programId;
    if (filters?.status) mongoFilters.status = filters.status;
    if (filters?.isActive !== undefined)
      mongoFilters.isActive = filters.isActive;
    if (filters?.location)
      mongoFilters.location = new RegExp(filters.location, "i");
    if (filters?.building)
      mongoFilters.building = new RegExp(filters.building, "i");

    // Filtro por capacidad
    if (
      filters?.minCapacity !== undefined ||
      filters?.maxCapacity !== undefined
    ) {
      mongoFilters.capacity = {};
      if (filters.minCapacity !== undefined) {
        mongoFilters.capacity.$gte = filters.minCapacity;
      }
      if (filters.maxCapacity !== undefined) {
        mongoFilters.capacity.$lte = filters.maxCapacity;
      }
    }

    // Filtro por búsqueda full-text (nombre, código o descripción)
    if (filters?.search) {
      mongoFilters.$or = [
        { name: new RegExp(filters.search, "i") },
        { code: new RegExp(filters.search, "i") },
        { description: new RegExp(filters.search, "i") },
      ];
    }

    const [resources, total] = await Promise.all([
      this.resourceModel
        .find(mongoFilters)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel.countDocuments(mongoFilters).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resources: resources.map((resource) =>
        ResourceEntity.fromObject(resource.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findByType(
    type: ResourceType,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      this.resourceModel
        .find({ type })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel.countDocuments({ type }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resources: resources.map((resource) =>
        ResourceEntity.fromObject(resource.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findByCategory(
    categoryId: string,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      this.resourceModel
        .find({ categoryId })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel.countDocuments({ categoryId }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resources: resources.map((resource) =>
        ResourceEntity.fromObject(resource.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findByProgram(
    programId: string,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      this.resourceModel
        .find({ programIds: programId })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel.countDocuments({ programIds: programId }).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resources: resources.map((resource) =>
        ResourceEntity.fromObject(resource.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findAvailable(query: PaginationQuery): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      this.resourceModel
        .find({
          isActive: true,
          status: ResourceStatus.AVAILABLE,
        })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel
        .countDocuments({
          isActive: true,
          status: ResourceStatus.AVAILABLE,
        })
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resources: resources.map((resource) =>
        ResourceEntity.fromObject(resource.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findNeedingMaintenance(): Promise<ResourceEntity[]> {
    const now = new Date();
    const resources = await this.resourceModel
      .find({
        isActive: true,
        "maintenanceSchedule.nextMaintenanceDate": { $lte: now },
      })
      .exec();

    return resources.map((resource) =>
      ResourceEntity.fromObject(resource.toObject())
    );
  }

  async update(
    id: string,
    data: Partial<ResourceEntity>
  ): Promise<ResourceEntity> {
    const updatedResource = await this.resourceModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    if (!updatedResource) {
      throw new Error(`Resource with ID ${id} not found`);
    }

    this.logger.info("Resource updated", { resourceId: id });

    return ResourceEntity.fromObject(updatedResource.toObject());
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.resourceModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            isActive: false,
            status: ResourceStatus.UNAVAILABLE,
            deletedAt: new Date(),
          },
        },
        { new: true }
      )
      .exec();

    if (result) {
      this.logger.info("Resource soft deleted", { resourceId: id });
    }

    return !!result;
  }

  async restore(id: string): Promise<boolean> {
    const result = await this.resourceModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            isActive: true,
            status: ResourceStatus.AVAILABLE,
            deletedAt: null,
          },
          $unset: {
            "audit.deletedBy": 1,
          },
        },
        { new: true }
      )
      .exec();

    if (result) {
      this.logger.info("Resource restored", { resourceId: id });
    }

    return !!result;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.resourceModel
      .countDocuments({ code: code.toUpperCase() })
      .exec();
    return count > 0;
  }

  async count(filters?: {
    isActive?: boolean;
    status?: ResourceStatus;
  }): Promise<number> {
    const mongoFilters: any = {};
    if (filters?.isActive !== undefined)
      mongoFilters.isActive = filters.isActive;
    if (filters?.status) mongoFilters.status = filters.status;

    return await this.resourceModel.countDocuments(mongoFilters).exec();
  }

  async updateStatus(id: string, status: ResourceStatus): Promise<void> {
    await this.resourceModel.findByIdAndUpdate(id, { $set: { status } }).exec();

    this.logger.debug("Resource status updated", { resourceId: id, status });
  }

  async findByLocation(
    location: string,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;
    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      this.resourceModel
        .find({ location: new RegExp(location, "i") })
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel
        .countDocuments({ location: new RegExp(location, "i") })
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      resources: resources.map((resource) =>
        ResourceEntity.fromObject(resource.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async searchAdvanced(filters: {
    types?: ResourceType[];
    minCapacity?: number;
    maxCapacity?: number;
    categoryIds?: string[];
    programIds?: string[];
    hasEquipment?: string[];
    location?: string;
    building?: string;
    status?: ResourceStatus;
    availableOn?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    const { page, limit, sortBy, sortOrder, ...searchFilters } = filters;
    const skip = (page - 1) * limit;

    // Construir query de MongoDB
    const mongoFilters: any = {};

    // Filtro por tipos
    if (searchFilters.types && searchFilters.types.length > 0) {
      mongoFilters.type = { $in: searchFilters.types };
    }

    // Filtro por capacidad
    if (
      searchFilters.minCapacity !== undefined ||
      searchFilters.maxCapacity !== undefined
    ) {
      mongoFilters.capacity = {};
      if (searchFilters.minCapacity !== undefined) {
        mongoFilters.capacity.$gte = searchFilters.minCapacity;
      }
      if (searchFilters.maxCapacity !== undefined) {
        mongoFilters.capacity.$lte = searchFilters.maxCapacity;
      }
    }

    // Filtro por categorías
    if (searchFilters.categoryIds && searchFilters.categoryIds.length > 0) {
      mongoFilters.categoryId = { $in: searchFilters.categoryIds };
    }

    // Filtro por programas
    if (searchFilters.programIds && searchFilters.programIds.length > 0) {
      mongoFilters.programIds = { $in: searchFilters.programIds };
    }

    // Filtro por equipamiento (búsqueda en atributos JSON)
    if (searchFilters.hasEquipment && searchFilters.hasEquipment.length > 0) {
      mongoFilters["attributes.equipment"] = {
        $in: searchFilters.hasEquipment,
      };
    }

    // Filtro por ubicación
    if (searchFilters.location) {
      mongoFilters.location = new RegExp(searchFilters.location, "i");
    }

    // Filtro por edificio
    if (searchFilters.building) {
      mongoFilters.building = searchFilters.building;
    }

    // Filtro por estado
    if (searchFilters.status) {
      mongoFilters.status = searchFilters.status;
    }

    // Solo recursos activos por defecto
    mongoFilters.isActive = true;

    this.logger.debug("Advanced search filters", { mongoFilters });

    const [resources, total] = await Promise.all([
      this.resourceModel
        .find(mongoFilters)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.resourceModel.countDocuments(mongoFilters).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    this.logger.info("Advanced search completed", {
      total,
      page,
      filters: searchFilters,
    });

    return {
      resources: resources.map((resource) =>
        ResourceEntity.fromObject(resource.toObject())
      ),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}
