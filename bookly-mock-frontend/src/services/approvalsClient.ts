/**
 * @deprecated Use `ApprovalsClient` from `@/infrastructure/api` instead.
 * This file is kept for backward compatibility with existing hooks.
 * New code should import from `@/infrastructure/api/approvals-client`.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  ApprovalActionDto,
  ApprovalFilters,
  ApprovalRequest,
  ApprovalStats,
  CreateApprovalRequestDto,
  UpdateApprovalRequestDto,
} from "@/types/entities/approval";

/**
 * Cliente HTTP para el servicio de Aprobaciones (Stockpile Service)
 *
 * Endpoints base: /api/v1/approval-requests
 */

const BASE_PATH = "/api/v1/approval-requests";

/**
 * Obtener lista de solicitudes de aprobación con filtros
 */
export async function getApprovalRequests(
  filters?: ApprovalFilters,
): Promise<ApprovalRequest[]> {
  const params = new URLSearchParams();

  if (filters?.status) {
    const statusValue = Array.isArray(filters.status)
      ? filters.status.join(",")
      : filters.status;
    params.append("status", statusValue);
  }
  if (filters?.level) params.append("level", filters.level);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.userId) params.append("userId", filters.userId);
  if (filters?.resourceId) params.append("resourceId", filters.resourceId);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH;

  const response = await httpClient.get<ApprovalRequest[]>(url);
  return response.data;
}

/**
 * Obtener detalle de una solicitud de aprobación
 */
export async function getApprovalRequestById(
  id: string,
): Promise<ApprovalRequest> {
  const response = await httpClient.get<ApprovalRequest>(`${BASE_PATH}/${id}`);
  return response.data;
}

/**
 * Crear nueva solicitud de aprobación
 */
export async function createApprovalRequest(
  data: CreateApprovalRequestDto,
): Promise<ApprovalRequest> {
  const response = await httpClient.post<ApprovalRequest>(BASE_PATH, data);
  return response.data;
}

/**
 * Actualizar solicitud de aprobación
 */
export async function updateApprovalRequest(
  id: string,
  data: UpdateApprovalRequestDto,
): Promise<ApprovalRequest> {
  const response = await httpClient.patch<ApprovalRequest>(
    `${BASE_PATH}/${id}`,
    data,
  );
  return response.data;
}

/**
 * Aprobar una solicitud
 */
export async function approveRequest(
  id: string,
  action: ApprovalActionDto,
): Promise<ApprovalRequest> {
  const response = await httpClient.post<ApprovalRequest>(
    `${BASE_PATH}/${id}/approve`,
    action,
  );
  return response.data;
}

/**
 * Rechazar una solicitud
 */
export async function rejectRequest(
  id: string,
  action: ApprovalActionDto,
): Promise<ApprovalRequest> {
  const response = await httpClient.post<ApprovalRequest>(
    `${BASE_PATH}/${id}/reject`,
    action,
  );
  return response.data;
}

/**
 * Comentar una solicitud
 */
export async function commentRequest(
  id: string,
  action: ApprovalActionDto,
): Promise<ApprovalRequest> {
  const response = await httpClient.post<ApprovalRequest>(
    `${BASE_PATH}/${id}/comment`,
    action,
  );
  return response.data;
}

/**
 * Delegar una solicitud
 */
export async function delegateRequest(
  id: string,
  action: ApprovalActionDto,
): Promise<ApprovalRequest> {
  const response = await httpClient.post<ApprovalRequest>(
    `${BASE_PATH}/${id}/delegate`,
    action,
  );
  return response.data;
}

/**
 * Obtener historial de una solicitud
 */
export async function getApprovalHistory(id: string) {
  const response = await httpClient.get(`${BASE_PATH}/${id}/history`);
  return response.data;
}

/**
 * Obtener estadísticas de aprobaciones
 */
export async function getApprovalStats(
  filters?: Pick<ApprovalFilters, "startDate" | "endDate">,
): Promise<ApprovalStats> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/stats?${queryString}`
    : `${BASE_PATH}/stats`;

  const response = await httpClient.get<ApprovalStats>(url);
  return response.data;
}
