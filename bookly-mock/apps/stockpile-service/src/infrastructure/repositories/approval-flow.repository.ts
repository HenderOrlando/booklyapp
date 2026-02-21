import { PaginationMeta, PaginationQuery } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ApprovalFlowEntity } from "@stockpile/domain/entities/approval-flow.entity";
import { IApprovalFlowRepository } from "@stockpile/domain/repositories";
import { ApprovalFlow } from "../schemas";

/**
 * Approval Flow Repository
 * Implementación con Mongoose del repositorio de flujos de aprobación
 */
@Injectable()
export class ApprovalFlowRepository implements IApprovalFlowRepository {
  constructor(
    @InjectModel(ApprovalFlow.name)
    private readonly model: Model<ApprovalFlow>
  ) {}

  /**
   * Crea un nuevo flujo de aprobación
   */
  async create(flow: ApprovalFlowEntity): Promise<ApprovalFlowEntity> {
    const doc = new this.model({
      name: flow.name,
      description: flow.description,
      resourceTypes: flow.resourceTypes,
      steps: flow.steps.map(step => ({
        name: step.name,
        approverRoles: step.approverRoles,
        order: step.order,
        isRequired: step.isRequired,
        allowParallel: step.allowParallel,
        timeoutHours: step.timeoutHours,
      })),
      isActive: flow.isActive,
      autoApproveConditions: flow.autoApproveConditions,
      createdBy: new Types.ObjectId(flow.audit?.createdBy || ""),
      updatedBy: flow.audit?.updatedBy
        ? new Types.ObjectId(flow.audit.updatedBy)
        : undefined,
    });

    const saved = await doc.save();
    return this.toEntity(saved);
  }

  /**
   * Busca un flujo por ID
   */
  async findById(id: string): Promise<ApprovalFlowEntity | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Busca múltiples flujos con paginación
   */
  async findMany(
    query: PaginationQuery,
    filters?: {
      isActive?: boolean;
      resourceType?: string;
    }
  ): Promise<{ flows: ApprovalFlowEntity[]; meta: PaginationMeta }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const mongoQuery: any = {};

    if (filters?.isActive !== undefined) {
      mongoQuery.isActive = filters.isActive;
    }
    if (filters?.resourceType) {
      mongoQuery.resourceTypes = filters.resourceType;
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(mongoQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.model.countDocuments(mongoQuery).exec(),
    ]);

    return {
      flows: docs.map((doc) => this.toEntity(doc)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca flujos activos
   */
  async findActive(
    query: PaginationQuery
  ): Promise<{ flows: ApprovalFlowEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { isActive: true });
  }

  /**
   * Busca flujos por tipo de recurso
   */
  async findByResourceType(
    resourceType: string,
    query: PaginationQuery
  ): Promise<{ flows: ApprovalFlowEntity[]; meta: PaginationMeta }> {
    return this.findMany(query, { resourceType });
  }

  /**
   * Busca flujos que aplican a un tipo de recurso específico
   */
  async findApplicableTo(resourceType: string): Promise<ApprovalFlowEntity[]> {
    const docs = await this.model
      .find({
        resourceTypes: resourceType,
        isActive: true,
      })
      .exec();

    return docs.map((doc) => this.toEntity(doc));
  }

  /**
   * Busca flujo por nombre
   */
  async findByName(name: string): Promise<ApprovalFlowEntity | null> {
    const doc = await this.model.findOne({ name }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * Actualiza un flujo
   */
  async update(
    id: string,
    data: Partial<ApprovalFlowEntity>
  ): Promise<ApprovalFlowEntity> {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.description) updateData.description = data.description;
    if (data.resourceTypes) updateData.resourceTypes = data.resourceTypes;
    if (data.steps) {
      updateData.steps = data.steps.map(step => ({
        name: step.name,
        approverRoles: step.approverRoles,
        order: step.order,
        isRequired: step.isRequired,
        allowParallel: step.allowParallel,
        timeoutHours: step.timeoutHours,
      }));
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.autoApproveConditions)
      updateData.autoApproveConditions = data.autoApproveConditions;
    if (data.audit?.updatedBy) {
      updateData.updatedBy = new Types.ObjectId(data.audit.updatedBy);
    }

    const doc = await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!doc) {
      throw new Error(`Approval flow with ID ${id} not found`);
    }

    return this.toEntity(doc);
  }

  /**
   * Elimina un flujo
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  /**
   * Cuenta flujos con filtros opcionales
   */
  async count(filters?: {
    isActive?: boolean;
    resourceType?: string;
  }): Promise<number> {
    const mongoQuery: any = {};

    if (filters?.isActive !== undefined) {
      mongoQuery.isActive = filters.isActive;
    }
    if (filters?.resourceType) {
      mongoQuery.resourceTypes = filters.resourceType;
    }

    return await this.model.countDocuments(mongoQuery).exec();
  }

  /**
   * Verifica si existe un flujo con el mismo nombre
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const query: any = { name };

    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const count = await this.model.countDocuments(query).exec();
    return count > 0;
  }

  /**
   * Convierte un documento de Mongoose a entidad de dominio
   */
  private toEntity(doc: ApprovalFlow): ApprovalFlowEntity {
    return new ApprovalFlowEntity(
      (doc._id as Types.ObjectId).toString(),
      doc.name,
      doc.description,
      doc.resourceTypes,
      doc.steps,
      doc.isActive,
      doc.autoApproveConditions,
      doc.metadata,
      (doc as any).createdAt,
      (doc as any).updatedAt,
      {
        createdBy: (doc.createdBy as Types.ObjectId).toString(),
        updatedBy: doc.updatedBy
          ? (doc.updatedBy as Types.ObjectId).toString()
          : undefined,
      }
    );
  }
}
