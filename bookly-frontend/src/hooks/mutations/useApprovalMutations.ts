/**
 * useApprovalMutations - Mutations para Aprobaciones
 *
 * Dominio: Approvals (Flujo de Aprobaciones)
 *
 * Gestiona el flujo de aprobación/rechazo de solicitudes de reserva
 * por parte de coordinadores y administradores
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationKeys } from "../useReservations";

/**
 * DTO para aprobar una reserva
 */
export interface ApproveReservationDto {
  reservationId: string;
  approvedBy: string;
  comments?: string;
  conditions?: string[];
  generateDocument?: boolean;
}

/**
 * DTO para rechazar una reserva
 */
export interface RejectReservationDto {
  reservationId: string;
  rejectedBy: string;
  reason: string;
  comments?: string;
  suggestAlternative?: {
    resourceId?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * DTO para solicitar información adicional
 */
export interface RequestInfoDto {
  reservationId: string;
  requestedBy: string;
  infoRequired: string[];
  deadline?: string;
  comments?: string;
}

// ============================================
// CACHE KEYS
// ============================================

export const approvalKeys = {
  all: ["approvals"] as const,
  lists: () => [...approvalKeys.all, "list"] as const,
  list: (filters?: string) => [...approvalKeys.lists(), { filters }] as const,
  pending: () => [...approvalKeys.all, "pending"] as const,
  history: (reservationId: string) =>
    [...approvalKeys.all, "history", reservationId] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para aprobar una reserva
 *
 * @example
 * ```typescript
 * const approveReservation = useApproveReservation();
 *
 * approveReservation.mutate({
 *   reservationId: "res-123",
 *   approvedBy: "coord-456",
 *   comments: "Aprobada para evento académico",
 *   generateDocument: true
 * });
 * ```
 */
export function useApproveReservation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: ApproveReservationDto) => {
      const response = await httpClient.post(
        `/approvals/${data.reservationId}/approve`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess("Reserva Aprobada", "La reserva se aprobó exitosamente");
      // Invalidar aprobaciones pendientes
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });

      // Invalidar reserva específica
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.reservationId),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });

      // Invalidar historial de aprobaciones
      queryClient.invalidateQueries({
        queryKey: approvalKeys.history(variables.reservationId),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al aprobar la reserva";
      showError("Error al Aprobar", errorMessage);
      console.error("Error al aprobar reserva:", error);
    },
  });
}

/**
 * Hook para rechazar una reserva
 *
 * @example
 * ```typescript
 * const rejectReservation = useRejectReservation();
 *
 * rejectReservation.mutate({
 *   reservationId: "res-123",
 *   rejectedBy: "coord-456",
 *   reason: "Conflicto con evento institucional",
 *   suggestAlternative: {
 *     resourceId: "resource-789",
 *     startDate: "2025-12-02T09:00"
 *   }
 * });
 * ```
 */
export function useRejectReservation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: RejectReservationDto) => {
      const response = await httpClient.post(
        `/approvals/${data.reservationId}/reject`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess("Reserva Rechazada", "La reserva se rechazó correctamente");
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.reservationId),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: approvalKeys.history(variables.reservationId),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al rechazar la reserva";
      showError("Error al Rechazar", errorMessage);
      console.error("Error al rechazar reserva:", error);
    },
  });
}

/**
 * Hook para solicitar información adicional
 *
 * Cuando el coordinador necesita más detalles antes de aprobar
 *
 * @example
 * ```typescript
 * const requestInfo = useRequestAdditionalInfo();
 *
 * requestInfo.mutate({
 *   reservationId: "res-123",
 *   requestedBy: "coord-456",
 *   infoRequired: ["Número de asistentes", "Equipos necesarios"],
 *   deadline: "2025-11-25T17:00"
 * });
 * ```
 */
export function useRequestAdditionalInfo() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: RequestInfoDto) => {
      const response = await httpClient.post(
        `/approvals/${data.reservationId}/request-info`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Información Solicitada",
        "Se solicitó información adicional al usuario"
      );
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() });
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.reservationId),
      });
      queryClient.invalidateQueries({
        queryKey: approvalKeys.history(variables.reservationId),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al solicitar información";
      showError("Error", errorMessage);
      console.error("Error al solicitar información:", error);
    },
  });
}

/**
 * Hook para reasignar aprobador
 *
 * Permite delegar la aprobación a otro coordinador
 *
 * @example
 * ```typescript
 * const reassign = useReassignApproval();
 *
 * reassign.mutate({
 *   reservationId: "res-123",
 *   from: "coord-456",
 *   to: "coord-789",
 *   reason: "Ausencia por vacaciones"
 * });
 * ```
 */
export function useReassignApproval() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: {
      reservationId: string;
      from: string;
      to: string;
      reason?: string;
    }) => {
      const response = await httpClient.post(
        `/approvals/${data.reservationId}/reassign`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Aprobación Reasignada",
        "La aprobación se reasignó correctamente"
      );
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() });
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: approvalKeys.history(variables.reservationId),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al reasignar la aprobación";
      showError("Error al Reasignar", errorMessage);
      console.error("Error al reasignar aprobación:", error);
    },
  });
}

/**
 * Hook para aprobar en lote (batch)
 *
 * Permite aprobar múltiples reservas a la vez
 *
 * @example
 * ```typescript
 * const batchApprove = useBatchApprove();
 *
 * batchApprove.mutate({
 *   reservationIds: ["res-1", "res-2", "res-3"],
 *   approvedBy: "coord-456",
 *   comments: "Aprobación masiva evento académico"
 * });
 * ```
 */
export function useBatchApprove() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: {
      reservationIds: string[];
      approvedBy: string;
      comments?: string;
    }) => {
      const response = await httpClient.post("/approvals/batch-approve", data);
      return response;
    },
    onSuccess: (data: any, variables) => {
      const count = variables.reservationIds.length;
      showSuccess(
        "Aprobación Masiva Exitosa",
        `Se aprobaron ${count} reservas correctamente`
      );
      // Invalidar todo ya que son múltiples reservas
      queryClient.invalidateQueries({ queryKey: approvalKeys.all });
      queryClient.invalidateQueries({ queryKey: reservationKeys.all });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error en la aprobación masiva";
      showError("Error en Aprobación Masiva", errorMessage);
      console.error("Error en aprobación masiva:", error);
    },
  });
}
