import { ApprovalRequestStatus } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ApprovalRequestEntity } from '@stockpile/domain/entities';
import {
  IApprovalFlowRepository,
  IApprovalRequestRepository,
} from '@stockpile/domain/repositories';
import { EnrichedApprovalRequestDto } from '@stockpile/infrastructure/dtos';
import { DataEnrichmentService } from "./data-enrichment.service";

const logger = createLogger("ApprovalRequestService");

/**
 * Approval Request Service
 * Servicio para gestión de solicitudes de aprobación
 */
@Injectable()
export class ApprovalRequestService {
  constructor(
    @Inject("IApprovalRequestRepository")
    private readonly approvalRequestRepository: IApprovalRequestRepository,
    @Inject("IApprovalFlowRepository")
    private readonly approvalFlowRepository: IApprovalFlowRepository,
    private readonly dataEnrichmentService: DataEnrichmentService
  ) {}

  /**
   * Crea una nueva solicitud de aprobación
   */
  async createApprovalRequest(params: {
    reservationId: string;
    requesterId: string;
    approvalFlowId: string;
    metadata?: Record<string, any>;
    createdBy?: string;
  }): Promise<ApprovalRequestEntity> {
    logger.info("Creating approval request", {
      reservationId: params.reservationId,
      requesterId: params.requesterId,
      approvalFlowId: params.approvalFlowId,
    });

    // Verificar que el flujo de aprobación existe y está activo
    const flow = await this.approvalFlowRepository.findById(
      params.approvalFlowId
    );

    if (!flow) {
      logger.error(
        "Approval flow not found",
        new Error("Approval flow not found"),
        {
          approvalFlowId: params.approvalFlowId,
        }
      );
      throw new NotFoundException(
        `Approval flow with ID ${params.approvalFlowId} not found`
      );
    }

    if (!flow.isFlowActive()) {
      logger.error(
        "Approval flow is not active",
        new Error("Approval flow is not active"),
        {
          approvalFlowId: params.approvalFlowId,
        }
      );
      throw new Error(`Approval flow ${flow.name} is not active`);
    }

    // Verificar que no existe una solicitud activa para la misma reserva
    const existingRequest =
      await this.approvalRequestRepository.findByReservation(
        params.reservationId
      );

    if (existingRequest && !existingRequest.isCompleted()) {
      logger.error(
        "Active approval request already exists for reservation",
        new Error("Active approval request already exists for reservation"),
        {
          reservationId: params.reservationId,
          existingRequestId: existingRequest.id,
        }
      );
      throw new Error(
        `An active approval request already exists for reservation ${params.reservationId}`
      );
    }

    // Crear la solicitud
    const request = new ApprovalRequestEntity(
      "", // ID será generado por el repository
      params.reservationId,
      params.requesterId,
      params.approvalFlowId,
      ApprovalRequestStatus.PENDING,
      0, // Comienza en paso 0
      new Date(),
      undefined,
      params.metadata,
      [],
      new Date(),
      new Date(),
      {
        createdBy: params.createdBy || params.requesterId,
      }
    );

    const created = await this.approvalRequestRepository.create(request);

    logger.info("Approval request created successfully", {
      requestId: created.id,
    });

    return created;
  }

  /**
   * Aprueba un paso del flujo
   */
  async approveStep(params: {
    approvalRequestId: string;
    approverId: string;
    stepName: string;
    comment?: string;
  }): Promise<ApprovalRequestEntity> {
    logger.info("Approving step", {
      approvalRequestId: params.approvalRequestId,
      approverId: params.approverId,
      stepName: params.stepName,
    });

    const request = await this.approvalRequestRepository.findById(
      params.approvalRequestId
    );

    if (!request) {
      throw new NotFoundException(
        `Approval request with ID ${params.approvalRequestId} not found`
      );
    }

    if (!request.isInReview() && !request.isPending()) {
      throw new Error("Approval request is not in reviewable state");
    }

    // Obtener el flujo para validar el paso
    const flow = await this.approvalFlowRepository.findById(
      request.approvalFlowId
    );

    if (!flow) {
      throw new NotFoundException(
        `Approval flow with ID ${request.approvalFlowId} not found`
      );
    }

    const currentStep = flow.getStep(request.currentStepIndex);

    if (!currentStep || currentStep.name !== params.stepName) {
      throw new Error(
        `Step ${params.stepName} does not match current step in flow`
      );
    }

    // Aprobar el paso
    let updated = request.approveStep(
      params.approverId,
      params.stepName,
      params.comment
    );

    // Verificar si es el último paso
    if (updated.currentStepIndex >= flow.getTotalSteps()) {
      updated = updated.complete();
      logger.info("Approval request completed", {
        requestId: updated.id,
      });
    }

    return await this.approvalRequestRepository.update(request.id, updated);
  }

  /**
   * Rechaza un paso del flujo
   */
  async rejectStep(params: {
    approvalRequestId: string;
    approverId: string;
    stepName: string;
    comment?: string;
  }): Promise<ApprovalRequestEntity> {
    logger.info("Rejecting step", {
      approvalRequestId: params.approvalRequestId,
      approverId: params.approverId,
      stepName: params.stepName,
    });

    const request = await this.approvalRequestRepository.findById(
      params.approvalRequestId
    );

    if (!request) {
      throw new NotFoundException(
        `Approval request with ID ${params.approvalRequestId} not found`
      );
    }

    if (!request.isInReview() && !request.isPending()) {
      throw new Error("Approval request is not in reviewable state");
    }

    const updated = request.rejectStep(
      params.approverId,
      params.stepName,
      params.comment
    );

    logger.info("Approval request rejected", {
      requestId: updated.id,
    });

    return await this.approvalRequestRepository.update(request.id, updated);
  }

  /**
   * Cancela una solicitud de aprobación
   */
  async cancelApprovalRequest(params: {
    approvalRequestId: string;
    cancelledBy: string;
    reason?: string;
  }): Promise<ApprovalRequestEntity> {
    logger.info("Cancelling approval request", {
      approvalRequestId: params.approvalRequestId,
      cancelledBy: params.cancelledBy,
    });

    const request = await this.approvalRequestRepository.findById(
      params.approvalRequestId
    );

    if (!request) {
      throw new NotFoundException(
        `Approval request with ID ${params.approvalRequestId} not found`
      );
    }

    if (request.isCompleted()) {
      throw new Error("Cannot cancel a completed approval request");
    }

    const updated = request.cancel(params.cancelledBy);

    logger.info("Approval request cancelled", {
      requestId: updated.id,
    });

    return await this.approvalRequestRepository.update(request.id, updated);
  }

  /**
   * Obtiene solicitudes con filtros
   */
  async getApprovalRequests(
    pagination: PaginationQuery,
    filters?: {
      requesterId?: string;
      approvalFlowId?: string;
      status?: ApprovalRequestStatus;
      reservationId?: string;
    }
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    logger.info("Getting approval requests", { filters });

    return await this.approvalRequestRepository.findMany(pagination, filters);
  }

  /**
   * Obtiene una solicitud por ID
   */
  async getApprovalRequestById(
    approvalRequestId: string
  ): Promise<ApprovalRequestEntity> {
    logger.info("Getting approval request by ID", { approvalRequestId });

    const request =
      await this.approvalRequestRepository.findById(approvalRequestId);

    if (!request) {
      throw new NotFoundException(
        `Approval request with ID ${approvalRequestId} not found`
      );
    }

    return request;
  }

  /**
   * Obtiene estadísticas de aprobaciones
   */
  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    approvalFlowId?: string;
  }): Promise<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    averageApprovalTime: number;
  }> {
    logger.info("Getting approval statistics", { filters });

    return await this.approvalRequestRepository.getStatistics(filters);
  }

  /**
   * Obtiene solicitudes que requieren aprobación de un rol específico
   */
  async getRequestsRequiringApprovalFromRole(
    role: string,
    pagination: PaginationQuery
  ): Promise<{ requests: ApprovalRequestEntity[]; meta: PaginationMeta }> {
    logger.info("Getting requests requiring approval from role", { role });

    return await this.approvalRequestRepository.findRequiringApprovalFromRole(
      role,
      pagination
    );
  }

  /**
   * Obtiene aprobaciones activas del día (para vigilantes)
   * RF-23: Visualización de reservas aprobadas para vigilante con paginación, filtros y datos enriquecidos
   *
   * Retorna aprobaciones con estado APPROVED cuya reserva
   * asociada está programada para el día especificado, con información enriquecida
   * de usuarios y recursos (preparado para integración con eventos).
   *
   * NOTA: Asume que metadata.reservationStartDate contiene la fecha de inicio de la reserva.
   * Este campo debe ser poblado al crear la ApprovalRequest.
   */
  async getActiveTodayApprovals(params: {
    date?: string;
    page?: number;
    limit?: number;
    filters?: {
      resourceId?: string;
      programId?: string;
      resourceType?: string;
    };
  }): Promise<{
    requests: EnrichedApprovalRequestDto[];
    meta: PaginationMeta;
  }> {
    // Determinar la fecha objetivo (hoy si no se especifica)
    const targetDate = params.date ? new Date(params.date) : new Date();

    // Calcular inicio y fin del día
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    logger.info("Getting active today approvals", {
      date: targetDate.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
      page: params.page,
      limit: params.limit,
      filters: params.filters,
    });

    // Buscar en el repositorio usando el filtro optimizado con paginación
    const result = await this.approvalRequestRepository.findActiveByDateRange(
      startOfDay,
      endOfDay,
      {
        page: params.page || 1,
        limit: params.limit || 20,
      },
      params.filters
    );

    // Enriquecer los datos con información de usuarios y recursos
    const enrichedRequests =
      await this.dataEnrichmentService.enrichApprovalRequests(result.requests);

    logger.info("Active today approvals found and enriched", {
      count: enrichedRequests.length,
      total: result.meta.total,
      date: targetDate.toISOString().split("T")[0],
    });

    return {
      requests: enrichedRequests,
      meta: result.meta,
    };
  }

  /**
   * Obtiene aprobaciones pendientes más antiguas que X horas
   * Para sistema de recordatorios automáticos
   */
  async findPendingOlderThan(
    thresholdHours: number
  ): Promise<ApprovalRequestEntity[]> {
    logger.info("Finding pending approvals older than threshold", {
      thresholdHours,
    });

    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - thresholdHours);

    const result = await this.approvalRequestRepository.findMany(
      { page: 1, limit: 100 },
      {
        status: ApprovalRequestStatus.PENDING,
      }
    );

    // Filtrar solo las que están pendientes desde antes del threshold
    const oldPendingRequests = result.requests.filter(
      (request) => request.createdAt && request.createdAt < thresholdDate
    );

    logger.info("Old pending approvals found", {
      count: oldPendingRequests.length,
      thresholdDate: thresholdDate.toISOString(),
    });

    return oldPendingRequests;
  }
}
