/**
 * Cliente HTTP Type-Safe para Stockpile Service (Aprobaciones)
 *
 * Integración con backend Bookly Stockpile Service via API Gateway
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  ApprovalFilters,
  ApprovalRequest,
  ApprovalStats,
  CreateApprovalRequestDto,
} from "@/types/entities/approval";
import { STOCKPILE_ENDPOINTS } from "./endpoints";
import type { PaginatedResponse } from "./types";

export interface ApproveStepDto {
  stepName: string;
  comment: string;
}

export interface RejectStepDto {
  stepName: string;
  comment: string;
}

export interface CancelApprovalRequestDto {
  reason: string;
}

export class ApprovalsClient {
  /**
   * Obtiene solicitudes de aprobación con filtros
   *
   * @param filters - Filtros de búsqueda
   * @returns Lista paginada de solicitudes
   */
  static async getApprovalRequests(
    filters?: ApprovalFilters
  ): Promise<ApiResponse<PaginatedResponse<ApprovalRequest>>> {
    return httpClient.get<PaginatedResponse<ApprovalRequest>>(
      STOCKPILE_ENDPOINTS.APPROVAL_REQUESTS,
      { params: filters }
    );
  }

  /**
   * Obtiene una solicitud por ID
   *
   * @param id - ID de la solicitud
   * @returns Solicitud detallada
   */
  static async getApprovalRequestById(
    id: string
  ): Promise<ApiResponse<ApprovalRequest>> {
    return httpClient.get<ApprovalRequest>(
      STOCKPILE_ENDPOINTS.APPROVAL_REQUEST_BY_ID(id)
    );
  }

  /**
   * Obtiene solicitudes activas hoy (para vigilantes/dashboard)
   *
   * @param filters - Filtros opcionales (resourceId, etc)
   * @returns Lista paginada de solicitudes activas
   */
  static async getActiveToday(filters?: {
    resourceId?: string;
    programId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<ApprovalRequest>>> {
    return httpClient.get<PaginatedResponse<ApprovalRequest>>(
      STOCKPILE_ENDPOINTS.ACTIVE_TODAY,
      { params: filters }
    );
  }

  /**
   * Obtiene estadísticas de aprobaciones
   *
   * @param startDate - Fecha inicio
   * @param endDate - Fecha fin
   * @returns Estadísticas
   */
  static async getStatistics(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<ApprovalStats>> {
    return httpClient.get<ApprovalStats>(STOCKPILE_ENDPOINTS.STATISTICS, {
      params: { startDate, endDate },
    });
  }

  /**
   * Crea una nueva solicitud de aprobación
   *
   * @param data - Datos de la solicitud
   * @returns Solicitud creada
   */
  static async createApprovalRequest(
    data: CreateApprovalRequestDto
  ): Promise<ApiResponse<ApprovalRequest>> {
    return httpClient.post<ApprovalRequest>(
      STOCKPILE_ENDPOINTS.APPROVAL_REQUESTS,
      data
    );
  }

  /**
   * Aprueba un paso de la solicitud
   *
   * @param id - ID de la solicitud
   * @param data - Datos de aprobación (comentario, paso)
   * @returns Resultado de la operación
   */
  static async approveRequest(
    id: string,
    data: ApproveStepDto
  ): Promise<ApiResponse<any>> {
    return httpClient.post(STOCKPILE_ENDPOINTS.APPROVE(id), data);
  }

  /**
   * Rechaza un paso de la solicitud
   *
   * @param id - ID de la solicitud
   * @param data - Datos de rechazo (comentario, paso)
   * @returns Resultado de la operación
   */
  static async rejectRequest(
    id: string,
    data: RejectStepDto
  ): Promise<ApiResponse<any>> {
    return httpClient.post(STOCKPILE_ENDPOINTS.REJECT(id), data);
  }

  /**
   * Cancela una solicitud
   *
   * @param id - ID de la solicitud
   * @param reason - Motivo de cancelación
   * @returns Resultado de la operación
   */
  static async cancelRequest(
    id: string,
    reason: string
  ): Promise<ApiResponse<any>> {
    const data: CancelApprovalRequestDto = { reason };
    return httpClient.post(STOCKPILE_ENDPOINTS.CANCEL(id), data);
  }
}
