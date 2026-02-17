import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  ReferenceData,
  ReferenceDataDocument,
} from "../schemas/reference-data.schema";

export interface CreateReferenceDataDto {
  group: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isDefault?: boolean;
  metadata?: Record<string, any>;
  createdBy: string;
}

export interface UpdateReferenceDataDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  isDefault?: boolean;
  metadata?: Record<string, any>;
  updatedBy: string;
}

export interface ReferenceDataFilter {
  group?: string;
  isActive?: boolean;
  code?: string;
}

/**
 * ReferenceData Repository
 * Repositorio reutilizable para datos de referencia dinámicos.
 * Cada microservicio inyecta su propia instancia conectada a su BD.
 */
@Injectable()
export class ReferenceDataRepository {
  private readonly logger = new Logger(ReferenceDataRepository.name);

  constructor(
    @InjectModel(ReferenceData.name)
    private readonly model: Model<ReferenceDataDocument>,
  ) {}

  async create(dto: CreateReferenceDataDto): Promise<ReferenceDataDocument> {
    const doc = new this.model({
      group: dto.group,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      color: dto.color,
      icon: dto.icon,
      order: dto.order ?? 0,
      isDefault: dto.isDefault ?? false,
      metadata: dto.metadata ?? {},
      audit: { createdBy: dto.createdBy },
    });
    return doc.save();
  }

  async findById(id: string): Promise<ReferenceDataDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByGroupAndCode(
    group: string,
    code: string,
  ): Promise<ReferenceDataDocument | null> {
    return this.model.findOne({ group, code }).exec();
  }

  async findByGroup(
    group: string,
    onlyActive = true,
  ): Promise<ReferenceDataDocument[]> {
    const filter: Record<string, any> = { group };
    if (onlyActive) filter.isActive = true;
    return this.model.find(filter).sort({ order: 1, name: 1 }).exec();
  }

  async findAll(
    filter: ReferenceDataFilter = {},
  ): Promise<ReferenceDataDocument[]> {
    const query: Record<string, any> = {};
    if (filter.group) query.group = filter.group;
    if (filter.isActive !== undefined) query.isActive = filter.isActive;
    if (filter.code) query.code = filter.code;
    return this.model.find(query).sort({ group: 1, order: 1, name: 1 }).exec();
  }

  async getGroups(): Promise<string[]> {
    return this.model.distinct("group").exec();
  }

  async update(
    id: string,
    dto: UpdateReferenceDataDto,
  ): Promise<ReferenceDataDocument | null> {
    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.order !== undefined) updateData.order = dto.order;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.isDefault !== undefined) updateData.isDefault = dto.isDefault;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;
    updateData["audit.updatedBy"] = dto.updatedBy;

    return this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
  }

  async deactivate(
    id: string,
    updatedBy: string,
  ): Promise<ReferenceDataDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { $set: { isActive: false, "audit.updatedBy": updatedBy } },
        { new: true },
      )
      .exec();
  }

  async upsert(dto: CreateReferenceDataDto): Promise<ReferenceDataDocument> {
    return this.model
      .findOneAndUpdate(
        { group: dto.group, code: dto.code },
        {
          $set: {
            name: dto.name,
            description: dto.description,
            color: dto.color,
            icon: dto.icon,
            order: dto.order ?? 0,
            isDefault: dto.isDefault ?? false,
            metadata: dto.metadata ?? {},
            isActive: true,
            "audit.updatedBy": dto.createdBy,
          },
          $setOnInsert: {
            "audit.createdBy": dto.createdBy,
          },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  /**
   * Valida que un código exista dentro de un grupo.
   * Útil para validación dinámica en servicios.
   */
  async isValidCode(group: string, code: string): Promise<boolean> {
    const count = await this.model
      .countDocuments({ group, code, isActive: true })
      .exec();
    return count > 0;
  }

  /**
   * Obtiene los códigos válidos para un grupo.
   */
  async getValidCodes(group: string): Promise<string[]> {
    const docs = await this.model
      .find({ group, isActive: true }, { code: 1 })
      .exec();
    return docs.map((d) => d.code);
  }
}
