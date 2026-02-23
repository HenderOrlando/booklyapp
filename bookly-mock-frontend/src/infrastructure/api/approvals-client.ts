/**
 * Cliente HTTP Type-Safe para Stockpile Service (Aprobaciones)
 *
 * Integración con backend Bookly Stockpile Service via API Gateway
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  ApprovalFilters,
  ApprovalFlowConfig,
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

export interface CreateApprovalFlowDto {
  name: string;
  description: string;
  resourceTypes: string[];
  steps: Array<{
    name: string;
    approverRoles: string[];
    order: number;
    isRequired: boolean;
    allowParallel: boolean;
    timeoutHours?: number;
  }>;
  autoApproveConditions?: Record<string, unknown>;
}

export interface UpdateApprovalFlowDto extends Partial<CreateApprovalFlowDto> {
  isActive?: boolean;
}

export class ApprovalsClient {
  /**
   * Obtiene flujos de aprobación con filtros
   */
  static async getApprovalFlows(filters?: {
    isActive?: boolean;
    resourceType?: string;
  }): Promise<ApiResponse<PaginatedResponse<ApprovalFlowConfig>>> {
    return httpClient.get<PaginatedResponse<ApprovalFlowConfig>>(
      STOCKPILE_ENDPOINTS.APPROVAL_FLOWS,
      { params: filters }
    );
  }

  /**
   * Obtiene un flujo por ID
   */
  static async getApprovalFlowById(
    id: string
  ): Promise<ApiResponse<ApprovalFlowConfig>> {
    return httpClient.get<ApprovalFlowConfig>(
      STOCKPILE_ENDPOINTS.APPROVAL_FLOW_BY_ID(id)
    );
  }

  /**
   * Crea un nuevo flujo de aprobación
   */
  static async createApprovalFlow(
    data: CreateApprovalFlowDto
  ): Promise<ApiResponse<ApprovalFlowConfig>> {
    return httpClient.post<ApprovalFlowConfig>(
      STOCKPILE_ENDPOINTS.APPROVAL_FLOWS,
      data
    );
  }

  /**
   * Actualiza un flujo de aprobación
   */
  static async updateApprovalFlow(
    id: string,
    data: UpdateApprovalFlowDto
  ): Promise<ApiResponse<ApprovalFlowConfig>> {
    return httpClient.patch<ApprovalFlowConfig>(
      STOCKPILE_ENDPOINTS.APPROVAL_FLOW_BY_ID(id),
      data
    );
  }

  /**
   * Elimina un flujo de aprobación
   */
  static async deleteApprovalFlow(id: string): Promise<ApiResponse<void>> {
    return httpClient.delete<void>(STOCKPILE_ENDPOINTS.APPROVAL_FLOW_BY_ID(id));
  }

  /**
   * Activa un flujo de aprobación
   */
  static async activateApprovalFlow(
    id: string
  ): Promise<ApiResponse<ApprovalFlowConfig>> {
    return httpClient.post<ApprovalFlowConfig>(
      `${STOCKPILE_ENDPOINTS.APPROVAL_FLOW_BY_ID(id)}/activate`
    );
  }

  /**
   * Desactiva un flujo de aprobación
   */
  static async deactivateApprovalFlow(
    id: string
  ): Promise<ApiResponse<ApprovalFlowConfig>> {
    return httpClient.post<ApprovalFlowConfig>(
      `${STOCKPILE_ENDPOINTS.APPROVAL_FLOW_BY_ID(id)}/deactivate`
    );
  }

  /**
   * Obtiene solicitudes de aprobación con filtros
   *
   * Mapea los filtros del frontend al contrato del backend:
   * - userId → requesterId
   * - resourceId, programId, priority, search, startDate, endDate → query params directos
   * - level, categoryId → no soportados por backend (filtrado local en UI)
   *
   * @param filters - Filtros de búsqueda
   * @returns Lista paginada de solicitudes
   */
  static async getApprovalRequests(
    filters?: ApprovalFilters
  ): Promise<ApiResponse<PaginatedResponse<ApprovalRequest>>> {
    const params: Record<string, unknown> = {};

    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.requesterId) params.requesterId = filters.requesterId;
      else if (filters.userId) params.requesterId = filters.userId;
      if (filters.resourceId) params.resourceId = filters.resourceId;
      if (filters.programId) params.programId = filters.programId;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      if (filters.startDate || filters.dateFrom) params.startDate = filters.startDate || filters.dateFrom;
      if (filters.endDate || filters.dateTo) params.endDate = filters.endDate || filters.dateTo;
      if (filters.reviewerId && !filters.requesterId && !filters.userId) params.requesterId = filters.reviewerId;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;
    }

    return httpClient.get<PaginatedResponse<ApprovalRequest>>(
      STOCKPILE_ENDPOINTS.APPROVAL_REQUESTS,
      { params }
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
  ): Promise<ApiResponse<unknown>> {
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
  ): Promise<ApiResponse<unknown>> {
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
  ): Promise<ApiResponse<unknown>> {
    const data: CancelApprovalRequestDto = { reason };
    return httpClient.post(STOCKPILE_ENDPOINTS.CANCEL(id), data);
  }
}
