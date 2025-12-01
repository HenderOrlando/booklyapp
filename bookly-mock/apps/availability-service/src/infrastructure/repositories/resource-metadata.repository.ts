import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  IResourceMetadata,
  IResourceMetadataRepository,
} from '@availability/domain/interfaces/resource-metadata.interface";
import {
  ResourceMetadata,
  ResourceMetadataDocument,
} from "../schemas/resource-metadata.schema";

/**
 * Resource Metadata Repository Implementation
 * Cache local de metadatos de recursos para búsquedas avanzadas
 */
@Injectable()
export class ResourceMetadataRepository implements IResourceMetadataRepository {
  constructor(
    @InjectModel(ResourceMetadata.name)
    private readonly metadataModel: Model<ResourceMetadataDocument>
  ) {}

  async upsert(metadata: IResourceMetadata): Promise<void> {
    await this.metadataModel.findOneAndUpdate(
      { resourceId: metadata.id },
      {
        resourceId: metadata.id,
        name: metadata.name,
        type: metadata.type,
        capacity: metadata.capacity,
        location: metadata.location,
        features: metadata.features || [],
        program: metadata.program,
        status: metadata.status,
        categoryId: metadata.categoryId,
        categoryCode: metadata.categoryCode,
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  async findById(resourceId: string): Promise<IResourceMetadata | null> {
    const doc = await this.metadataModel.findOne({ resourceId }).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async findByIds(resourceIds: string[]): Promise<IResourceMetadata[]> {
    const docs = await this.metadataModel
      .find({ resourceId: { $in: resourceIds } })
      .exec();
    return docs.map((doc) => this.toInterface(doc));
  }

  async findByFilters(filters: {
    types?: string[];
    minCapacity?: number;
    maxCapacity?: number;
    features?: string[];
    program?: string;
    location?: string;
    status?: string;
  }): Promise<IResourceMetadata[]> {
    const conditions: any = {};

    if (filters.types && filters.types.length > 0) {
      conditions.type = { $in: filters.types };
    }

    if (
      filters.minCapacity !== undefined ||
      filters.maxCapacity !== undefined
    ) {
      conditions.capacity = {};
      if (filters.minCapacity !== undefined) {
        conditions.capacity.$gte = filters.minCapacity;
      }
      if (filters.maxCapacity !== undefined) {
        conditions.capacity.$lte = filters.maxCapacity;
      }
    }

    if (filters.features && filters.features.length > 0) {
      // Todos los features deben estar presentes
      conditions.features = { $all: filters.features };
    }

    if (filters.program) {
      conditions.program = filters.program;
    }

    if (filters.location) {
      conditions.location = { $regex: filters.location, $options: "i" };
    }

    if (filters.status) {
      conditions.status = filters.status;
    }

    const docs = await this.metadataModel.find(conditions).exec();
    return docs.map((doc) => this.toInterface(doc));
  }

  async delete(resourceId: string): Promise<boolean> {
    const result = await this.metadataModel
      .findOneAndDelete({ resourceId })
      .exec();
    return !!result;
  }

  async count(filters?: {
    types?: string[];
    status?: string;
  }): Promise<number> {
    const conditions: any = {};

    if (filters?.types && filters.types.length > 0) {
      conditions.type = { $in: filters.types };
    }

    if (filters?.status) {
      conditions.status = filters.status;
    }

    return await this.metadataModel.countDocuments(conditions);
  }

  private toInterface(doc: ResourceMetadataDocument): IResourceMetadata {
    return {
      id: doc.resourceId,
      name: doc.name,
      type: doc.type,
      capacity: doc.capacity,
      location: doc.location,
      features: doc.features,
      program: doc.program,
      status: doc.status,
      categoryId: doc.categoryId,
      categoryCode: doc.categoryCode,
    };
  }
}
