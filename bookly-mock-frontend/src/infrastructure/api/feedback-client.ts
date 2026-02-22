/**
 * Cliente HTTP Type-Safe para Feedback y Evaluaciones
 *
 * Integración con backend Bookly Reports Service via API Gateway
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import { REPORTS_ENDPOINTS } from "./endpoints";
import type { PaginatedResponse } from "./types";

export interface Feedback {
  id: string;
  userId: string;
  userName?: string;
  resourceId: string;
  resourceName?: string;
  reservationId?: string;
  rating: number;
  comment?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  resourceId: string;
  reservationId?: string;
  rating: number;
  comment?: string;
  category?: string;
}

export interface UpdateFeedbackDto {
  rating?: number;
  comment?: string;
  category?: string;
}

export interface FeedbackFilters {
  resourceId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  category?: string;
  page?: number;
  limit?: number;
}

export interface Evaluation {
  id: string;
  evaluatorId: string;
  evaluatorName?: string;
  userId: string;
  userName?: string;
  score: number;
  comments?: string;
  period?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvaluationDto {
  userId: string;
  score: number;
  comments?: string;
  period?: string;
}

export interface UpdateEvaluationDto {
  score?: number;
  comments?: string;
}

export interface EvaluationFilters {
  userId?: string;
  evaluatorId?: string;
  period?: string;
  page?: number;
  limit?: number;
}

export class FeedbackClient {
  // ============================================
  // FEEDBACK (RF-34)
  // ============================================

  /**
   * Obtiene todos los feedbacks con filtros
   */
  static async getAll(
    filters?: FeedbackFilters,
  ): Promise<ApiResponse<PaginatedResponse<Feedback>>> {
    return httpClient.get<PaginatedResponse<Feedback>>(
      REPORTS_ENDPOINTS.FEEDBACK,
      { params: filters },
    );
  }

  /**
   * Obtiene un feedback por ID
   */
  static async getById(id: string): Promise<ApiResponse<Feedback>> {
    return httpClient.get<Feedback>(REPORTS_ENDPOINTS.FEEDBACK_BY_ID(id));
  }

  /**
   * Crea un nuevo feedback
   */
  static async create(
    data: CreateFeedbackDto,
  ): Promise<ApiResponse<Feedback>> {
    return httpClient.post<Feedback>(REPORTS_ENDPOINTS.FEEDBACK, data);
  }

  /**
   * Actualiza un feedback existente
   */
  static async update(
    id: string,
    data: UpdateFeedbackDto,
  ): Promise<ApiResponse<Feedback>> {
    return httpClient.patch<Feedback>(
      REPORTS_ENDPOINTS.FEEDBACK_BY_ID(id),
      data,
    );
  }

  /**
   * Elimina un feedback
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(REPORTS_ENDPOINTS.FEEDBACK_BY_ID(id));
  }

  // ============================================
  // EVALUACIONES (RF-35)
  // ============================================

  /**
   * Obtiene todas las evaluaciones con filtros
   */
  static async getEvaluations(
    filters?: EvaluationFilters,
  ): Promise<ApiResponse<PaginatedResponse<Evaluation>>> {
    return httpClient.get<PaginatedResponse<Evaluation>>(
      REPORTS_ENDPOINTS.EVALUATIONS,
      { params: filters },
    );
  }

  /**
   * Obtiene una evaluación por ID
   */
  static async getEvaluationById(
    id: string,
  ): Promise<ApiResponse<Evaluation>> {
    return httpClient.get<Evaluation>(REPORTS_ENDPOINTS.EVALUATION_BY_ID(id));
  }

  /**
   * Crea una nueva evaluación
   */
  static async createEvaluation(
    data: CreateEvaluationDto,
  ): Promise<ApiResponse<Evaluation>> {
    return httpClient.post<Evaluation>(REPORTS_ENDPOINTS.EVALUATIONS, data);
  }

  /**
   * Actualiza una evaluación existente
   */
  static async updateEvaluation(
    id: string,
    data: UpdateEvaluationDto,
  ): Promise<ApiResponse<Evaluation>> {
    return httpClient.patch<Evaluation>(
      REPORTS_ENDPOINTS.EVALUATION_BY_ID(id),
      data,
    );
  }
}
