import { FeedbackStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { UserFeedbackEntity } from "../../domain/entities/user-feedback.entity";
import { IFeedbackRepository } from "../../domain/repositories/feedback.repository.interface";

const logger = createLogger("FeedbackService");

export interface CreateFeedbackDto {
  userId: string;
  userName: string;
  reservationId: string;
  resourceId: string;
  resourceName: string;
  rating: number;
  comments?: string;
  category?: string;
  isAnonymous?: boolean;
}

export interface RespondFeedbackDto {
  response: string;
  respondedBy: string;
}

/**
 * Feedback Service
 * Servicio de aplicación para gestión de feedback de usuarios (RF-34)
 */
@Injectable()
export class FeedbackService {
  constructor(
    @Inject("IFeedbackRepository")
    private readonly feedbackRepository: IFeedbackRepository,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Crear feedback de usuario
   * HU-29: Registro de feedback
   */
  async createFeedback(dto: CreateFeedbackDto): Promise<UserFeedbackEntity> {
    try {
      logger.info("Creating user feedback", {
        userId: dto.userId,
        reservationId: dto.reservationId,
        rating: dto.rating,
      });

      // Verificar si ya existe feedback para esta reserva
      const existing = await this.feedbackRepository.findByReservation(
        dto.reservationId
      );

      if (existing) {
        logger.warn("Feedback already exists for reservation", {
          reservationId: dto.reservationId,
        });
        throw new Error("Feedback already exists for this reservation");
      }

      // Crear entidad
      const feedback = new UserFeedbackEntity(
        uuidv4(),
        dto.userId,
        dto.userName,
        dto.reservationId,
        dto.resourceId,
        dto.resourceName,
        dto.rating,
        FeedbackStatus.PENDING,
        dto.comments,
        new Date(),
        dto.category as any,
        dto.isAnonymous || false,
        undefined,
        undefined,
        undefined,
        { createdBy: dto.userId },
        new Date(),
        new Date()
      );

      // Guardar
      const saved = await this.feedbackRepository.save(feedback);

      // Publicar evento
      await this.eventBus.publish("reports.feedback.created", {
        eventId: uuidv4(),
        eventType: "reports.feedback.created",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          feedbackId: saved.id,
          userId: saved.userId,
          resourceId: saved.resourceId,
          rating: saved.rating,
          sentiment: saved.getSentiment(),
          isAnonymous: saved.isAnonymous,
        },
        metadata: {
          aggregateId: saved.id,
        },
      });

      logger.info("Feedback created successfully", {
        feedbackId: saved.id,
        sentiment: saved.getSentiment(),
      });

      return saved;
    } catch (error: any) {
      logger.error("Failed to create feedback", error);
      throw error;
    }
  }

  /**
   * Obtener feedback por ID
   */
  async getFeedbackById(id: string): Promise<UserFeedbackEntity> {
    try {
      const feedback = await this.feedbackRepository.findById(id);

      if (!feedback) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }

      return feedback;
    } catch (error: any) {
      logger.error("Failed to get feedback by ID", error);
      throw error;
    }
  }

  /**
   * Listar feedback por usuario
   */
  async listUserFeedback(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    feedbacks: UserFeedbackEntity[];
    total: number;
    pages: number;
  }> {
    try {
      logger.debug("Listing user feedbacks", { userId, page, limit });

      const { feedbacks, total } = await this.feedbackRepository.findByUser(
        userId,
        page,
        limit
      );

      const pages = Math.ceil(total / limit);

      return { feedbacks, total, pages };
    } catch (error: any) {
      logger.error("Failed to list user feedbacks", error);
      throw error;
    }
  }

  /**
   * Listar feedback por recurso
   */
  async listResourceFeedback(
    resourceId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    feedbacks: UserFeedbackEntity[];
    total: number;
    pages: number;
  }> {
    try {
      logger.debug("Listing resource feedbacks", { resourceId, page, limit });

      const { feedbacks, total } = await this.feedbackRepository.findByResource(
        resourceId,
        page,
        limit
      );

      const pages = Math.ceil(total / limit);

      return { feedbacks, total, pages };
    } catch (error: any) {
      logger.error("Failed to list resource feedbacks", error);
      throw error;
    }
  }

  /**
   * Listar feedback por estado
   */
  async listFeedbackByStatus(
    status: FeedbackStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    feedbacks: UserFeedbackEntity[];
    total: number;
    pages: number;
  }> {
    try {
      logger.debug("Listing feedbacks by status", { status, page, limit });

      const { feedbacks, total } = await this.feedbackRepository.findByStatus(
        status,
        page,
        limit
      );

      const pages = Math.ceil(total / limit);

      return { feedbacks, total, pages };
    } catch (error: any) {
      logger.error("Failed to list feedbacks by status", error);
      throw error;
    }
  }

  /**
   * Listar todos los feedbacks (staff)
   */
  async listAllFeedback(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    feedbacks: UserFeedbackEntity[];
    total: number;
    pages: number;
  }> {
    try {
      logger.debug("Listing all feedbacks", { page, limit });

      const { feedbacks, total } = await this.feedbackRepository.findAll(
        page,
        limit
      );

      const pages = Math.ceil(total / limit);

      return { feedbacks, total, pages };
    } catch (error: any) {
      logger.error("Failed to list all feedbacks", error);
      throw error;
    }
  }

  /**
   * Responder a feedback (staff)
   * HU-29: Registro de feedback con respuesta del staff
   */
  async respondToFeedback(
    id: string,
    dto: RespondFeedbackDto
  ): Promise<UserFeedbackEntity> {
    try {
      logger.info("Responding to feedback", {
        feedbackId: id,
        respondedBy: dto.respondedBy,
      });

      // Verificar que existe
      const existing = await this.feedbackRepository.findById(id);

      if (!existing) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }

      // Actualizar respuesta
      const updated = await this.feedbackRepository.updateResponse(
        id,
        dto.response,
        dto.respondedBy,
        FeedbackStatus.RESPONDED
      );

      if (!updated) {
        throw new Error("Failed to update feedback response");
      }

      // Publicar evento
      await this.eventBus.publish("reports.feedback.responded", {
        eventId: uuidv4(),
        eventType: "reports.feedback.responded",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          feedbackId: updated.id,
          userId: updated.userId,
          resourceId: updated.resourceId,
          respondedBy: dto.respondedBy,
          rating: updated.rating,
        },
        metadata: {
          aggregateId: updated.id,
        },
      });

      logger.info("Feedback responded successfully", { feedbackId: id });

      return updated;
    } catch (error: any) {
      logger.error("Failed to respond to feedback", error);
      throw error;
    }
  }

  /**
   * Actualizar estado de feedback
   */
  async updateFeedbackStatus(
    id: string,
    status: FeedbackStatus
  ): Promise<UserFeedbackEntity> {
    try {
      logger.info("Updating feedback status", { feedbackId: id, status });

      const updated = await this.feedbackRepository.updateStatus(id, status);

      if (!updated) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }

      // Publicar evento
      await this.eventBus.publish("reports.feedback.statusChanged", {
        eventId: uuidv4(),
        eventType: "reports.feedback.statusChanged",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          feedbackId: updated.id,
          userId: updated.userId,
          status,
        },
        metadata: {
          aggregateId: updated.id,
        },
      });

      logger.info("Feedback status updated", { feedbackId: id, status });

      return updated;
    } catch (error: any) {
      logger.error("Failed to update feedback status", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas por recurso
   * RF-34: Análisis de feedback por recurso
   */
  async getResourceStatistics(resourceId: string): Promise<{
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    sentimentDistribution: Record<string, number>;
  }> {
    try {
      logger.debug("Getting resource feedback statistics", { resourceId });

      const stats =
        await this.feedbackRepository.getResourceStatistics(resourceId);

      return stats;
    } catch (error: any) {
      logger.error("Failed to get resource statistics", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales
   * RF-34: Análisis de feedback general
   */
  async getGeneralStatistics(): Promise<{
    totalFeedbacks: number;
    averageRating: number;
    pendingFeedbacks: number;
    respondedFeedbacks: number;
  }> {
    try {
      logger.debug("Getting general feedback statistics");

      const stats = await this.feedbackRepository.getGeneralStatistics();

      return stats;
    } catch (error: any) {
      logger.error("Failed to get general statistics", error);
      throw error;
    }
  }

  /**
   * Eliminar feedback
   */
  async deleteFeedback(id: string): Promise<void> {
    try {
      logger.info("Deleting feedback", { feedbackId: id });

      const deleted = await this.feedbackRepository.delete(id);

      if (!deleted) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }

      logger.info("Feedback deleted successfully", { feedbackId: id });
    } catch (error: any) {
      logger.error("Failed to delete feedback", error);
      throw error;
    }
  }
}
