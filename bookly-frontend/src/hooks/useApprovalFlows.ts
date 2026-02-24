/**
 * useApprovalFlows - Hooks para Gestión de Flujos de Aprobación
 *
 * Proporciona queries y mutations para el CRUD de flujos de aprobación.
 */

import {
  ApprovalsClient,
  type CreateApprovalFlowDto,
  type UpdateApprovalFlowDto,
} from "@/infrastructure/api/approvals-client";
import type { PaginatedResponse } from "@/infrastructure/api/types";
import type { ApprovalFlowConfig } from "@/types/entities/approval";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const flowKeys = {
  all: ["approval-flows"] as const,
  lists: () => [...flowKeys.all, "list"] as const,
  list: (filters?: { isActive?: boolean; resourceType?: string }) =>
    [...flowKeys.lists(), { filters }] as const,
  details: () => [...flowKeys.all, "detail"] as const,
  detail: (id: string) => [...flowKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener lista de flujos de aprobación
 */
export function useApprovalFlows(filters?: {
  isActive?: boolean;
  resourceType?: string;
}) {
  return useQuery<PaginatedResponse<ApprovalFlowConfig>>({
    queryKey: flowKeys.list(filters),
    queryFn: async () => {
      const response = await ApprovalsClient.getApprovalFlows(filters);
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
 * Hook para obtener detalle de un flujo
 */
export function useApprovalFlow(id: string) {
  return useQuery<ApprovalFlowConfig>({
    queryKey: flowKeys.detail(id),
    queryFn: async () => {
      const response = await ApprovalsClient.getApprovalFlowById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Flujo no encontrado");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear un flujo de aprobación
 */
export function useCreateApprovalFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApprovalFlowDto) => {
      const response = await ApprovalsClient.createApprovalFlow(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear flujo");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flowKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un flujo
 */
export function useUpdateApprovalFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateApprovalFlowDto;
    }) => {
      const response = await ApprovalsClient.updateApprovalFlow(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al actualizar flujo");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: flowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: flowKeys.lists() });
    },
  });
}

/**
 * Hook para eliminar un flujo
 */
export function useDeleteApprovalFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ApprovalsClient.deleteApprovalFlow(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar flujo");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flowKeys.lists() });
    },
  });
}

/**
 * Hook para activar un flujo
 */
export function useActivateApprovalFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ApprovalsClient.activateApprovalFlow(id);
      if (!response.success) {
        throw new Error(response.message || "Error al activar flujo");
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: flowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: flowKeys.lists() });
    },
  });
}

/**
 * Hook para desactivar un flujo
 */
export function useDeactivateApprovalFlow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ApprovalsClient.deactivateApprovalFlow(id);
      if (!response.success) {
        throw new Error(response.message || "Error al desactivar flujo");
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: flowKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: flowKeys.lists() });
    },
  });
}
