import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Injectable } from "@nestjs/common";
import { ApprovalRequestEntity } from '@stockpile/domain/entities';
import {
  EnrichedApprovalRequestDto,
  RequesterInfoDto,
  ResourceInfoDto,
} from '@stockpile/infrastructure/dtos/enriched-approval.dto';

const logger = createLogger("DataEnrichmentService");

/**
 * Data Enrichment Service
 * Servicio para enriquecer datos de aprobaciones con información de otros servicios
 * RF-23: Información enriquecida para vigilantes
 *
 * Implementa Event-Driven Architecture (EDA):
 * - Consulta cache Redis poblado por event handlers
 * - Escucha eventos de availability-service y resources-service
 * - Proporciona degradación graceful si no hay datos en cache
 */
@Injectable()
export class DataEnrichmentService {
  constructor(private readonly redisService: RedisService) {}
  /**
   * Enriquece una solicitud de aprobación con datos de usuario y recurso
   * 
   * Consulta cache Redis poblado por event handlers:
   * - UserInfoEventHandler: Escucha eventos user.created, user.updated, reservation.created
   * - ResourceInfoEventHandler: Escucha eventos resource.created, resource.updated, reservation.created
   * 
   * Si no hay datos en cache, devuelve solo los IDs (degradación graceful)
   */
  async enrichApprovalRequest(
    approval: ApprovalRequestEntity
  ): Promise<EnrichedApprovalRequestDto> {
    try {
      logger.debug("Enriching approval request", {
        approvalId: approval.id,
        reservationId: approval.reservationId,
      });

      // Obtener datos del cache Redis (poblado vía eventos)
      const requesterInfo = await this.getRequesterInfo(
        approval.metadata?.requesterId
      );
      const resourceInfo = await this.getResourceInfo(
        approval.metadata?.resourceId
      );

      return {
        id: approval.id,
        reservationId: approval.reservationId,
        status: approval.status,
        requester: requesterInfo,
        resource: resourceInfo,
        reservationStartDate: approval.metadata?.reservationStartDate
          ? new Date(approval.metadata.reservationStartDate)
          : undefined,
        reservationEndDate: approval.metadata?.reservationEndDate
          ? new Date(approval.metadata.reservationEndDate)
          : undefined,
        purpose: approval.metadata?.purpose,
        approvalHistory: approval.approvalHistory?.map((h) => ({
          stepName: h.stepName,
          decision: h.decision,
          approverId: h.approverId,
          comment: h.comment,
          approvedAt: h.approvedAt,
        })),
        metadata: approval.metadata,
        createdAt: approval.createdAt || new Date(),
        updatedAt: approval.updatedAt || new Date(),
      };
    } catch (error) {
      logger.error("Error enriching approval request", error as Error, {
        approvalId: approval.id,
      });

      // Si falla el enriquecimiento, devolver datos básicos
      return this.toBasicDto(approval);
    }
  }

  /**
   * Enriquece múltiples solicitudes
   */
  async enrichApprovalRequests(
    approvals: ApprovalRequestEntity[]
  ): Promise<EnrichedApprovalRequestDto[]> {
    return Promise.all(
      approvals.map((approval) => this.enrichApprovalRequest(approval))
    );
  }

  /**
   * Obtiene información del solicitante desde Redis cache
   *
   * Cache poblado por event handlers que escuchan:
   * - "user.created" -> cachear datos
   * - "user.updated" -> actualizar cache
   * - "user.deleted" -> invalidar cache
   */
  private async getRequesterInfo(
    requesterId?: string
  ): Promise<RequesterInfoDto> {
    if (!requesterId) {
      return { id: "unknown" };
    }

    try {
      // Consultar cache Redis
      const cached =
        await this.redisService.getCachedWithPrefix<RequesterInfoDto>(
          "CACHE",
          `user:${requesterId}`
        );

      if (cached) {
        logger.debug("User info found in cache", { requesterId });
        return cached;
      }

      // Si no está en cache, devolver datos básicos
      logger.debug("User info not found in cache, returning basic data", {
        requesterId,
      });

      return {
        id: requesterId,
        name: undefined,
        email: undefined,
        program: undefined,
      };
    } catch (error) {
      logger.error("Error getting requester info from cache", error as Error, {
        requesterId,
      });

      return {
        id: requesterId,
        name: undefined,
        email: undefined,
        program: undefined,
      };
    }
  }

  /**
   * Obtiene información del recurso desde Redis cache
   *
   * Cache poblado por event handlers que escuchan:
   * - "resource.created" -> cachear datos
   * - "resource.updated" -> actualizar cache
   * - "resource.deleted" -> invalidar cache
   * - "resource.status.changed" -> actualizar estado en cache
   */
  private async getResourceInfo(resourceId?: string): Promise<ResourceInfoDto> {
    if (!resourceId) {
      return { id: "unknown" };
    }

    try {
      // Consultar cache Redis
      const cached =
        await this.redisService.getCachedWithPrefix<ResourceInfoDto>(
          "CACHE",
          `resource:${resourceId}`
        );

      if (cached) {
        logger.debug("Resource info found in cache", { resourceId });
        return cached;
      }

      // Si no está en cache, devolver datos básicos
      logger.debug("Resource info not found in cache, returning basic data", {
        resourceId,
      });

      return {
        id: resourceId,
        name: undefined,
        type: undefined,
        location: undefined,
        capacity: undefined,
      };
    } catch (error) {
      logger.error("Error getting resource info from cache", error as Error, {
        resourceId,
      });

      return {
        id: resourceId,
        name: undefined,
        type: undefined,
        location: undefined,
        capacity: undefined,
      };
    }
  }

  /**
   * Convierte entidad a DTO básico sin enriquecimiento
   */
  private toBasicDto(
    approval: ApprovalRequestEntity
  ): EnrichedApprovalRequestDto {
    return {
      id: approval.id,
      reservationId: approval.reservationId,
      status: approval.status,
      requester: {
        id: approval.metadata?.requesterId || "unknown",
      },
      resource: {
        id: approval.metadata?.resourceId || "unknown",
      },
      reservationStartDate: approval.metadata?.reservationStartDate
        ? new Date(approval.metadata.reservationStartDate)
        : undefined,
      reservationEndDate: approval.metadata?.reservationEndDate
        ? new Date(approval.metadata.reservationEndDate)
        : undefined,
      purpose: approval.metadata?.purpose,
      approvalHistory: approval.approvalHistory?.map((h) => ({
        stepName: h.stepName,
        decision: h.decision,
        approverId: h.approverId,
        comment: h.comment,
        approvedAt: h.approvedAt,
      })),
      metadata: approval.metadata,
      createdAt: approval.createdAt || new Date(),
      updatedAt: approval.updatedAt || new Date(),
    };
  }
}
