import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { UserEvaluationEntity } from '@reports/domain/entities/user-evaluation.entity";
import { IUserEvaluationRepository } from '@reports/domain/repositories/user-evaluation.repository.interface";

const logger = createLogger("UserEvaluationService");

export interface CreateEvaluationDto {
  userId: string;
  userName: string;
  userEmail: string;
  evaluatedBy: string;
  evaluatorName: string;
  evaluatorRole: string;
  complianceScore: number;
  punctualityScore: number;
  resourceCareScore: number;
  comments?: string;
  recommendations?: string;
  period?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface UpdateEvaluationDto {
  complianceScore?: number;
  punctualityScore?: number;
  resourceCareScore?: number;
  overallScore?: number;
  comments?: string;
  recommendations?: string;
}

/**
 * User Evaluation Service
 * Servicio de aplicación para gestión de evaluaciones de usuarios (RF-35)
 */
@Injectable()
export class UserEvaluationService {
  constructor(
    @Inject("IUserEvaluationRepository")
    private readonly evaluationRepository: IUserEvaluationRepository,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Crear evaluación de usuario
   * HU-30: Evaluación de usuarios
   */
  async createEvaluation(
    dto: CreateEvaluationDto
  ): Promise<UserEvaluationEntity> {
    try {
      logger.debug("Creating user evaluation", {
        userId: dto.userId,
        evaluatorId: dto.evaluatedBy,
      });

      // Calcular overall score como promedio ponderado
      const overallScore = this.calculateOverallScore(
        dto.complianceScore,
        dto.punctualityScore,
        dto.resourceCareScore
      );

      // Crear entidad
      const evaluation = new UserEvaluationEntity(
        uuidv4(),
        dto.userId,
        dto.userName,
        dto.userEmail,
        dto.evaluatedBy,
        dto.evaluatorName,
        dto.evaluatorRole,
        new Date(),
        dto.complianceScore,
        dto.punctualityScore,
        dto.resourceCareScore,
        overallScore,
        dto.comments,
        dto.recommendations,
        dto.period,
        {},
        new Date(),
        new Date()
      );

      // Guardar
      const saved = await this.evaluationRepository.save(evaluation);

      // Publicar evento
      await this.publishEvaluationCreatedEvent(saved);

      // Verificar si obtiene acceso prioritario
      if (overallScore >= 80) {
        await this.publishPriorityAccessGrantedEvent(saved);
      }

      logger.info("User evaluation created successfully", {
        evaluationId: saved.id,
        userId: dto.userId,
        overallScore,
      });

      return saved;
    } catch (error: any) {
      logger.error(`Error creating user evaluation ${dto.userId}`, error);
      throw error;
    }
  }

  /**
   * Obtener evaluación por ID
   */
  async getEvaluationById(evaluationId: string): Promise<UserEvaluationEntity> {
    try {
      logger.debug("Getting evaluation by ID", { evaluationId });

      const evaluation = await this.evaluationRepository.findById(evaluationId);

      if (!evaluation) {
        throw new NotFoundException(
          `Evaluation with ID ${evaluationId} not found`
        );
      }

      return evaluation;
    } catch (error: any) {
      logger.error(`Error getting evaluation by ID ${evaluationId}`, error);
      throw error;
    }
  }

  /**
   * Listar evaluaciones de usuario
   */
  async listUserEvaluations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
    pages: number;
  }> {
    try {
      logger.debug("Listing user evaluations", { userId, page, limit });

      const { evaluations, total } = await this.evaluationRepository.findByUser(
        userId,
        page,
        limit
      );

      const pages = Math.ceil(total / limit);

      return { evaluations, total, pages };
    } catch (error: any) {
      logger.error(`Error listing user evaluations ${userId}`, error);
      throw error;
    }
  }

  /**
   * Obtener última evaluación de usuario
   */
  async getLatestUserEvaluation(
    userId: string
  ): Promise<UserEvaluationEntity | null> {
    try {
      logger.debug("Getting latest user evaluation", { userId });

      return await this.evaluationRepository.findLatestByUser(userId);
    } catch (error: any) {
      logger.error(`Error getting latest user evaluation ${userId}`, error);
      throw error;
    }
  }

  /**
   * Listar evaluaciones por período
   */
  async listEvaluationsByPeriod(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    evaluations: UserEvaluationEntity[];
    total: number;
    pages: number;
  }> {
    try {
      logger.debug("Listing evaluations by period", {
        startDate,
        endDate,
        page,
        limit,
      });

      const { evaluations, total } =
        await this.evaluationRepository.findByPeriod(
          startDate,
          endDate,
          page,
          limit
        );

      const pages = Math.ceil(total / limit);

      return { evaluations, total, pages };
    } catch (error: any) {
      logger.error(
        `Error listing evaluations by period ${startDate} - ${endDate}`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtener usuarios con acceso prioritario
   */
  async getPriorityUsers(
    threshold: number = 80
  ): Promise<UserEvaluationEntity[]> {
    try {
      logger.debug("Getting priority users", { threshold });

      return await this.evaluationRepository.findPriorityUsers(threshold);
    } catch (error: any) {
      logger.error(`Error getting priority users ${threshold}`, error);
      throw error;
    }
  }

  /**
   * Obtener evaluaciones que requieren seguimiento
   */
  async getEvaluationsNeedingFollowUp(): Promise<UserEvaluationEntity[]> {
    try {
      logger.debug("Getting evaluations needing follow-up");

      return await this.evaluationRepository.findNeedingFollowUp();
    } catch (error: any) {
      logger.error(`Error getting evaluations needing follow-up`, error);
      throw error;
    }
  }

  /**
   * Actualizar evaluación
   */
  async updateEvaluation(
    evaluationId: string,
    dto: UpdateEvaluationDto
  ): Promise<UserEvaluationEntity> {
    try {
      logger.debug("Updating evaluation", { evaluationId, dto });

      // Verificar que existe
      const existing = await this.getEvaluationById(evaluationId);

      // Recalcular overallScore si se actualizan los scores individuales
      let overallScore = dto.overallScore;
      if (
        dto.complianceScore !== undefined ||
        dto.punctualityScore !== undefined ||
        dto.resourceCareScore !== undefined
      ) {
        overallScore = this.calculateOverallScore(
          dto.complianceScore ?? existing.complianceScore,
          dto.punctualityScore ?? existing.punctualityScore,
          dto.resourceCareScore ?? existing.resourceCareScore
        );
      }

      // Actualizar
      const updated = await this.evaluationRepository.update(evaluationId, {
        ...dto,
        overallScore,
      });

      // Publicar evento de actualización
      await this.publishEvaluationUpdatedEvent(updated);

      // Verificar cambio en acceso prioritario
      const hadPriority = existing.overallScore >= 80;
      const hasPriority = updated.overallScore >= 80;

      if (!hadPriority && hasPriority) {
        await this.publishPriorityAccessGrantedEvent(updated);
      } else if (hadPriority && !hasPriority) {
        await this.publishPriorityAccessRevokedEvent(updated);
      }

      logger.info("Evaluation updated successfully", { evaluationId });

      return updated;
    } catch (error: any) {
      logger.error(`Error updating evaluation ${evaluationId}`, error);
      throw error;
    }
  }

  /**
   * Eliminar evaluación
   */
  async deleteEvaluation(evaluationId: string): Promise<void> {
    try {
      logger.debug("Deleting evaluation", { evaluationId });

      // Verificar que existe
      await this.getEvaluationById(evaluationId);

      // Eliminar
      await this.evaluationRepository.delete(evaluationId);

      logger.info("Evaluation deleted successfully", { evaluationId });
    } catch (error: any) {
      logger.error(`Error deleting evaluation ${evaluationId}`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de evaluación de usuario
   */
  async getUserStatistics(userId: string): Promise<{
    totalEvaluations: number;
    averageOverallScore: number;
    averageComplianceScore: number;
    averagePunctualityScore: number;
    averageResourceCareScore: number;
    latestScore: number;
    trend: "improving" | "stable" | "declining";
  }> {
    try {
      logger.debug("Getting user evaluation statistics", { userId });

      return await this.evaluationRepository.getUserStatistics(userId);
    } catch (error: any) {
      logger.error(`Error getting user evaluation statistics ${userId}`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales
   */
  async getGeneralStatistics(): Promise<{
    totalEvaluations: number;
    averageScore: number;
    excellentCount: number;
    goodCount: number;
    regularCount: number;
    poorCount: number;
    usersWithPriorityAccess: number;
    usersNeedingFollowUp: number;
  }> {
    try {
      logger.debug("Getting general evaluation statistics");

      return await this.evaluationRepository.getGeneralStatistics();
    } catch (error: any) {
      logger.error(`Error getting general evaluation statistics`, error);
      throw error;
    }
  }

  /**
   * Calcular overall score como promedio ponderado
   * - Compliance: 40%
   * - Punctuality: 30%
   * - Resource Care: 30%
   */
  private calculateOverallScore(
    complianceScore: number,
    punctualityScore: number,
    resourceCareScore: number
  ): number {
    const weighted =
      complianceScore * 0.4 + punctualityScore * 0.3 + resourceCareScore * 0.3;

    return Math.round(weighted);
  }

  /**
   * Publicar evento: Evaluación Creada
   */
  private async publishEvaluationCreatedEvent(
    evaluation: UserEvaluationEntity
  ): Promise<void> {
    try {
      await this.eventBus.publish("reports.evaluation.created", {
        eventId: uuidv4(),
        eventType: "reports.evaluation.created",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          evaluationId: evaluation.id,
          userId: evaluation.userId,
          userName: evaluation.userName,
          evaluatedBy: evaluation.evaluatedBy,
          evaluatorName: evaluation.evaluatorName,
          overallScore: evaluation.overallScore,
          performanceLevel: evaluation.getPerformanceLevel(),
          evaluationDate: evaluation.evaluationDate,
        },
        metadata: {
          aggregateId: evaluation.id,
        },
      });

      logger.debug("Published evaluation.created event", {
        evaluationId: evaluation.id,
      });
    } catch (error: any) {
      logger.error(
        `Error publishing evaluation.created event ${evaluation.id}`,
        error
      );
    }
  }

  /**
   * Publicar evento: Evaluación Actualizada
   */
  private async publishEvaluationUpdatedEvent(
    evaluation: UserEvaluationEntity
  ): Promise<void> {
    try {
      await this.eventBus.publish("reports.evaluation.updated", {
        eventId: uuidv4(),
        eventType: "reports.evaluation.updated",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          evaluationId: evaluation.id,
          userId: evaluation.userId,
          overallScore: evaluation.overallScore,
          performanceLevel: evaluation.getPerformanceLevel(),
        },
        metadata: {
          aggregateId: evaluation.id,
        },
      });

      logger.debug("Published evaluation.updated event", {
        evaluationId: evaluation.id,
      });
    } catch (error: any) {
      logger.error(
        `Error publishing evaluation.updated event ${evaluation.id}`,
        error
      );
    }
  }

  /**
   * Publicar evento: Acceso Prioritario Otorgado
   */
  private async publishPriorityAccessGrantedEvent(
    evaluation: UserEvaluationEntity
  ): Promise<void> {
    try {
      await this.eventBus.publish("reports.evaluation.priorityGranted", {
        eventId: uuidv4(),
        eventType: "reports.evaluation.priorityGranted",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          evaluationId: evaluation.id,
          userId: evaluation.userId,
          userName: evaluation.userName,
          userEmail: evaluation.userEmail,
          overallScore: evaluation.overallScore,
          performanceLevel: evaluation.getPerformanceLevel(),
          grantedAt: new Date(),
        },
        metadata: {
          aggregateId: evaluation.userId,
          reason: "High compliance score",
        },
      });

      logger.info("Published priorityAccessGranted event", {
        evaluationId: evaluation.id,
        userId: evaluation.userId,
        score: evaluation.overallScore,
      });
    } catch (error: any) {
      logger.error(
        `Error publishing priorityAccessGranted event ${evaluation.id}`,
        error
      );
    }
  }

  /**
   * Publicar evento: Acceso Prioritario Revocado
   */
  private async publishPriorityAccessRevokedEvent(
    evaluation: UserEvaluationEntity
  ): Promise<void> {
    try {
      await this.eventBus.publish("reports.evaluation.priorityRevoked", {
        eventId: uuidv4(),
        eventType: "reports.evaluation.priorityRevoked",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          evaluationId: evaluation.id,
          userId: evaluation.userId,
          userName: evaluation.userName,
          overallScore: evaluation.overallScore,
          performanceLevel: evaluation.getPerformanceLevel(),
          revokedAt: new Date(),
        },
        metadata: {
          aggregateId: evaluation.userId,
          reason: "Score below threshold",
        },
      });

      logger.info("Published priorityAccessRevoked event", {
        evaluationId: evaluation.id,
        userId: evaluation.userId,
        score: evaluation.overallScore,
      });
    } catch (error: any) {
      logger.error(
        `Error publishing priorityAccessRevoked event ${evaluation.id}`,
        error
      );
    }
  }
}
