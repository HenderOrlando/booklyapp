import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  ApprovalFlowEntity,
  ApprovalStep,
} from "../../domain/entities/approval-flow.entity";
import { IApprovalFlowRepository } from "../../domain/repositories";

const logger = createLogger("ApprovalFlowService");

/**
 * Approval Flow Service
 * Servicio para gestión de flujos de aprobación
 */
@Injectable()
export class ApprovalFlowService {
  constructor(
    @Inject("IApprovalFlowRepository")
    private readonly approvalFlowRepository: IApprovalFlowRepository
  ) {}

  /**
   * Crea un nuevo flujo de aprobación
   */
  async createApprovalFlow(params: {
    name: string;
    description: string;
    resourceTypes: string[];
    steps: ApprovalStep[];
    autoApproveConditions?: Record<string, any>;
    createdBy?: string;
  }): Promise<ApprovalFlowEntity> {
    logger.info("Creating approval flow", { name: params.name });

    // Verificar que no exista un flujo con el mismo nombre
    const existing = await this.approvalFlowRepository.existsByName(
      params.name
    );

    if (existing) {
      logger.error(
        "Approval flow name already exists",
        new Error("Approval flow name already exists"),
        { name: params.name }
      );
      throw new Error(`Approval flow with name ${params.name} already exists`);
    }

    // Validar que los pasos estén correctamente ordenados
    const orders = params.steps.map((s) => s.order);
    const sortedOrders = [...orders].sort((a, b) => a - b);

    if (JSON.stringify(orders) !== JSON.stringify(sortedOrders)) {
      logger.error(
        "Steps are not correctly ordered",
        new Error("Steps are not correctly ordered"),
        { steps: params.steps }
      );
      throw new Error("Steps must be ordered sequentially");
    }

    // Crear el flujo
    const flow = new ApprovalFlowEntity(
      "", // ID será generado por el repository
      params.name,
      params.description,
      params.resourceTypes,
      params.steps,
      true, // Activo por defecto
      params.autoApproveConditions,
      new Date(),
      new Date(),
      {
        createdBy: params.createdBy || "system",
      }
    );

    const created = await this.approvalFlowRepository.create(flow);

    logger.info("Approval flow created successfully", { flowId: created.id });

    return created;
  }

  /**
   * Actualiza un flujo de aprobación
   */
  async updateApprovalFlow(params: {
    flowId: string;
    name?: string;
    description?: string;
    resourceTypes?: string[];
    steps?: ApprovalStep[];
    autoApproveConditions?: Record<string, any>;
    updatedBy?: string;
  }): Promise<ApprovalFlowEntity> {
    logger.info("Updating approval flow", { flowId: params.flowId });

    const flow = await this.approvalFlowRepository.findById(params.flowId);

    if (!flow) {
      throw new NotFoundException(
        `Approval flow with ID ${params.flowId} not found`
      );
    }

    // Si se está actualizando el nombre, verificar que no exista otro flujo con ese nombre
    if (params.name && params.name !== flow.name) {
      const existing = await this.approvalFlowRepository.existsByName(
        params.name,
        params.flowId
      );

      if (existing) {
        logger.error(
          "Approval flow name already exists",
          new Error("Approval flow name already exists"),
          {
            name: params.name,
          }
        );
        throw new Error(
          `Approval flow with name ${params.name} already exists`
        );
      }
    }

    // Si se están actualizando los pasos, validar orden
    if (params.steps) {
      const orders = params.steps.map((s) => s.order);
      const sortedOrders = [...orders].sort((a, b) => a - b);

      if (JSON.stringify(orders) !== JSON.stringify(sortedOrders)) {
        logger.error(
          "Steps are not correctly ordered",
          new Error("Steps are not correctly ordered"),
          {
            steps: params.steps,
          }
        );
        throw new Error("Steps must be ordered sequentially");
      }
    }

    const updateData = {
      ...params,
      updatedAt: new Date(),
      audit: {
        createdBy: flow.audit?.createdBy || "system",
        updatedBy: params.updatedBy || "system",
      },
    };

    const updated = await this.approvalFlowRepository.update(
      params.flowId,
      updateData
    );

    logger.info("Approval flow updated successfully", { flowId: updated.id });

    return updated;
  }

  /**
   * Desactiva un flujo de aprobación
   */
  async deactivateApprovalFlow(params: {
    flowId: string;
    updatedBy: string;
  }): Promise<ApprovalFlowEntity> {
    logger.info("Deactivating approval flow", { flowId: params.flowId });

    const flow = await this.approvalFlowRepository.findById(params.flowId);

    if (!flow) {
      throw new NotFoundException(
        `Approval flow with ID ${params.flowId} not found`
      );
    }

    if (!flow.isFlowActive()) {
      logger.warn("Approval flow is already inactive", {
        flowId: params.flowId,
      });
      return flow;
    }

    const deactivated = flow.deactivate(params.updatedBy);
    const updated = await this.approvalFlowRepository.update(
      params.flowId,
      deactivated
    );

    logger.info("Approval flow deactivated successfully", {
      flowId: updated.id,
    });

    return updated;
  }

  /**
   * Activa un flujo de aprobación
   */
  async activateApprovalFlow(params: {
    flowId: string;
    updatedBy: string;
  }): Promise<ApprovalFlowEntity> {
    logger.info("Activating approval flow", { flowId: params.flowId });

    const flow = await this.approvalFlowRepository.findById(params.flowId);

    if (!flow) {
      throw new NotFoundException(
        `Approval flow with ID ${params.flowId} not found`
      );
    }

    if (flow.isFlowActive()) {
      logger.warn("Approval flow is already active", { flowId: params.flowId });
      return flow;
    }

    const activated = flow.activate(params.updatedBy);
    const updated = await this.approvalFlowRepository.update(
      params.flowId,
      activated
    );

    logger.info("Approval flow activated successfully", { flowId: updated.id });

    return updated;
  }

  /**
   * Obtiene flujos de aprobación con filtros
   */
  async getApprovalFlows(
    pagination: PaginationQuery,
    filters?: {
      isActive?: boolean;
      resourceType?: string;
    }
  ): Promise<{ flows: ApprovalFlowEntity[]; meta: PaginationMeta }> {
    logger.info("Getting approval flows", { filters });

    return await this.approvalFlowRepository.findMany(pagination, filters);
  }

  /**
   * Obtiene un flujo por ID
   */
  async getApprovalFlowById(flowId: string): Promise<ApprovalFlowEntity> {
    logger.info("Getting approval flow by ID", { flowId });

    const flow = await this.approvalFlowRepository.findById(flowId);

    if (!flow) {
      throw new NotFoundException(`Approval flow with ID ${flowId} not found`);
    }

    return flow;
  }

  /**
   * Obtiene flujos aplicables a un tipo de recurso
   */
  async getApplicableFlows(
    resourceType: string
  ): Promise<ApprovalFlowEntity[]> {
    logger.info("Getting applicable flows for resource type", {
      resourceType,
    });

    return await this.approvalFlowRepository.findApplicableTo(resourceType);
  }

  /**
   * Elimina un flujo de aprobación
   */
  async deleteApprovalFlow(flowId: string): Promise<boolean> {
    logger.info("Deleting approval flow", { flowId });

    const flow = await this.approvalFlowRepository.findById(flowId);

    if (!flow) {
      throw new NotFoundException(`Approval flow with ID ${flowId} not found`);
    }

    const deleted = await this.approvalFlowRepository.delete(flowId);

    logger.info("Approval flow deleted successfully", { flowId });

    return deleted;
  }
}
