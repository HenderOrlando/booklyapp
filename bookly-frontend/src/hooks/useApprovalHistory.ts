/**
 * useApprovalHistory - Hook para Historial de Aprobaciones
 *
 * Carga aprobaciones pasadas (APPROVED, REJECTED, CANCELLED) desde el backend.
 * - Usuario normal: solo ve sus propias aprobaciones (filtro por requesterId).
 * - Admin/Coordinador: ve todas las aprobaciones.
 *
 * Implementa RF-25 (Registro y trazabilidad de aprobaciones).
 */

import { ApprovalsClient } from "@/infrastructure/api/approvals-client";
import type { PaginatedResponse } from "@/infrastructure/api/types";
import type {
  ApprovalFilters,
  ApprovalRequest,
  ApprovalStatus,
} from "@/types/entities/approval";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRoles, isAdmin, isCoordinador } from "@/utils/roleUtils";
import { approvalKeys } from "./useApprovalRequests";

// ============================================
// TYPES
// ============================================

export interface ApprovalHistoryFilters {
  status?: ApprovalStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================
// CONSTANTS
// ============================================

const COMPLETED_STATUSES: ApprovalStatus[] = [
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const DEFAULT_PAGE_SIZE = 10;
const STALE_TIME = 1000 * 60 * 5; // 5 minutos

// ============================================
// HOOK
// ============================================

/**
 * Hook para obtener historial de aprobaciones desde el backend.
 *
 * @param filters - Filtros opcionales (status, search, fechas, paginación)
 * @returns Query result con datos paginados de aprobaciones completadas
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useApprovalHistory({
 *   status: "APPROVED",
 *   page: 1,
 *   limit: 10,
 * });
 * ```
 */
export function useApprovalHistory(filters?: ApprovalHistoryFilters) {
  const { user } = useAuth();
  const userRoles = normalizeRoles(user?.roles);
  const isAdminUser = isAdmin(userRoles) || isCoordinador(userRoles);

  const apiFilters: ApprovalFilters = {
    status: filters?.status,
    search: filters?.search,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
    page: filters?.page || 1,
    limit: filters?.limit || DEFAULT_PAGE_SIZE,
  };

  if (!isAdminUser && user?.id) {
    apiFilters.requesterId = user.id;
  }

  return useQuery<PaginatedResponse<ApprovalRequest>>({
    queryKey: [
      ...approvalKeys.all,
      "history",
      {
        ...apiFilters,
        isAdmin: isAdminUser,
      },
    ],
    queryFn: async () => {
      const response = await ApprovalsClient.getApprovalRequests(apiFilters);
      const data = response.data || {
        items: [],
        meta: {
          total: 0,
          page: filters?.page || 1,
          limit: filters?.limit || DEFAULT_PAGE_SIZE,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      if (!filters?.status) {
        const filtered = data.items.filter((item) =>
          COMPLETED_STATUSES.includes(item.status as ApprovalStatus),
        );
        return {
          ...data,
          items: filtered,
          meta: {
            ...data.meta,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / (filters?.limit || DEFAULT_PAGE_SIZE)),
          },
        };
      }

      return data;
    },
    enabled: !!user,
    staleTime: STALE_TIME,
  });
}

/**
 * Helper: verifica si el usuario actual puede ver todas las aprobaciones
 */
export function useCanViewAllApprovals(): boolean {
  const { user } = useAuth();
  const userRoles = normalizeRoles(user?.roles);
  return isAdmin(userRoles) || isCoordinador(userRoles);
}
