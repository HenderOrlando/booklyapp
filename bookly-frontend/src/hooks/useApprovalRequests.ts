/**
 * useApprovalRequests - Hooks para Flujo de Aprobaciones
 *
 * Proporciona queries y mutations para gestión de aprobaciones
 */

import {
  ApprovalsClient,
  type ApproveStepDto,
  type RejectStepDto,
} from "@/infrastructure/api/approvals-client";
import type { PaginatedResponse } from "@/infrastructure/api/types";
import type {
  ApprovalFilters,
  ApprovalRequest,
  CreateApprovalRequestDto,
} from "@/types/entities/approval";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const approvalKeys = {
  all: ["approvals"] as const,
  lists: () => [...approvalKeys.all, "list"] as const,
  list: (filters?: ApprovalFilters) =>
    [...approvalKeys.lists(), { filters }] as const,
  activeToday: () => [...approvalKeys.all, "activeToday"] as const,
  details: () => [...approvalKeys.all, "detail"] as const,
  detail: (id: string) => [...approvalKeys.details(), id] as const,
  statistics: () => [...approvalKeys.all, "statistics"] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener lista de solicitudes de aprobación
 */
export function useApprovalRequests(filters?: ApprovalFilters) {
  return useQuery<PaginatedResponse<ApprovalRequest>>({
    queryKey: approvalKeys.list(filters),
    queryFn: async () => {
      const response = await ApprovalsClient.getApprovalRequests(filters);
      return (
        response.data || {
          items: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }
      );
    },
  });
}

/**
 * Hook para obtener solicitudes activas hoy (Dashboard/Vigilancia)
 */
export function useActiveApprovalsToday(filters?: {
  resourceId?: string;
  programId?: string;
}) {
  return useQuery<PaginatedResponse<ApprovalRequest>>({
    queryKey: [...approvalKeys.activeToday(), filters],
    queryFn: async () => {
      const response = await ApprovalsClient.getActiveToday(filters);
      return (
        response.data || {
          items: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }
      );
    },
    staleTime: 1000 * 60, // 1 minuto (información sensible al tiempo)
  });
}

/**
 * Hook para obtener detalle de una solicitud
 */
export function useApprovalRequest(id: string) {
  return useQuery<ApprovalRequest>({
    queryKey: approvalKeys.detail(id),
    queryFn: async () => {
      const response = await ApprovalsClient.getApprovalRequestById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Solicitud no encontrada");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para estadísticas de aprobación
 */
export function useApprovalStatistics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...approvalKeys.statistics(), { startDate, endDate }],
    queryFn: async () => {
      const response = await ApprovalsClient.getStatistics(startDate, endDate);
      return response.data;
    },
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear una solicitud de aprobación
 */
export function useCreateApprovalRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApprovalRequestDto) => {
      const response = await ApprovalsClient.createApprovalRequest(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear solicitud");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
    },
  });
}

/**
 * Hook para aprobar una solicitud
 */
export function useApproveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ApproveStepDto }) => {
      const response = await ApprovalsClient.approveRequest(id, data);
      if (!response.success) {
        throw new Error(response.message || "Error al aprobar solicitud");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.statistics() });
    },
  });
}

/**
 * Hook para rechazar una solicitud
 */
export function useRejectRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RejectStepDto }) => {
      const response = await ApprovalsClient.rejectRequest(id, data);
      if (!response.success) {
        throw new Error(response.message || "Error al rechazar solicitud");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.statistics() });
    },
  });
}

/**
 * Hook para cancelar una solicitud
 */
export function useCancelRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await ApprovalsClient.cancelRequest(id, reason);
      if (!response.success) {
        throw new Error(response.message || "Error al cancelar solicitud");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
    },
  });
}
