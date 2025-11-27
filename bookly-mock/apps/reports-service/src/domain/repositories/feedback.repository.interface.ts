import { FeedbackStatus } from "@libs/common/enums";
import { UserFeedbackEntity } from "../entities/user-feedback.entity";

/**
 * IFeedbackRepository
 * Interface del repositorio para gestión de feedback de usuarios (RF-34)
 */
export interface IFeedbackRepository {
  /**
   * Guardar feedback
   */
  save(feedback: UserFeedbackEntity): Promise<UserFeedbackEntity>;

  /**
   * Buscar por ID
   */
  findById(id: string): Promise<UserFeedbackEntity | null>;

  /**
   * Buscar por usuario
   */
  findByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }>;

  /**
   * Buscar por recurso
   */
  findByResource(
    resourceId: string,
    page?: number,
    limit?: number
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }>;

  /**
   * Buscar por reserva
   */
  findByReservation(reservationId: string): Promise<UserFeedbackEntity | null>;

  /**
   * Buscar por estado
   */
  findByStatus(
    status: FeedbackStatus,
    page?: number,
    limit?: number
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }>;

  /**
   * Buscar todos con paginación
   */
  findAll(
    page?: number,
    limit?: number
  ): Promise<{ feedbacks: UserFeedbackEntity[]; total: number }>;

  /**
   * Actualizar respuesta
   */
  updateResponse(
    id: string,
    response: string,
    respondedBy: string,
    status: FeedbackStatus
  ): Promise<UserFeedbackEntity | null>;

  /**
   * Actualizar estado
   */
  updateStatus(
    id: string,
    status: FeedbackStatus
  ): Promise<UserFeedbackEntity | null>;

  /**
   * Eliminar feedback
   */
  delete(id: string): Promise<boolean>;

  /**
   * Obtener estadísticas por recurso
   */
  getResourceStatistics(resourceId: string): Promise<{
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    sentimentDistribution: Record<string, number>;
  }>;

  /**
   * Obtener estadísticas generales
   */
  getGeneralStatistics(): Promise<{
    totalFeedbacks: number;
    averageRating: number;
    pendingFeedbacks: number;
    respondedFeedbacks: number;
  }>;
}
