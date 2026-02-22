/**
 * useMaintenanceMutations - Mutations para Mantenimiento
 *
 * Dominio: Maintenance (Mantenimiento de Recursos)
 *
 * Gestiona programación y seguimiento de mantenimientos
 * preventivos, correctivos y emergencias
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceKeys } from "../useResources";

/**
 * DTO para crear mantenimiento
 */
export interface CreateMaintenanceDto {
  resourceId: string;
  type: "PREVENTIVO" | "CORRECTIVO" | "EMERGENCIA" | "LIMPIEZA";
  startDate: string;
  endDate: string;
  estimatedDuration?: number; // En minutos
  description: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  assignedTo?: string; // ID del técnico
  requiredParts?: string[];
  cost?: number;
  notes?: string;
}

/**
 * DTO para actualizar mantenimiento
 */
export interface UpdateMaintenanceDto extends Partial<CreateMaintenanceDto> {
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DELAYED";
  actualDuration?: number;
  actualCost?: number;
  completionNotes?: string;
  followUpRequired?: boolean;
}

/**
 * DTO para completar mantenimiento
 */
export interface CompleteMaintenanceDto {
  maintenanceId: string;
  completedBy: string;
  completionDate: string;
  actualDuration: number;
  actualCost?: number;
  partsUsed?: string[];
  workPerformed: string;
  resourceCondition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  followUpRequired: boolean;
  followUpDate?: string;
  notes?: string;
}

// ============================================
// CACHE KEYS
// ============================================

export const maintenanceKeys = {
  all: ["maintenance"] as const,
  lists: () => [...maintenanceKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...maintenanceKeys.lists(), { filters }] as const,
  details: () => [...maintenanceKeys.all, "detail"] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
  byResource: (resourceId: string) =>
    [...maintenanceKeys.all, "resource", resourceId] as const,
  upcoming: ["maintenance", "upcoming"] as const,
  history: (resourceId: string) =>
    [...maintenanceKeys.all, "history", resourceId] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear/programar mantenimiento
 *
 * @example
 * ```typescript
 * const createMaintenance = useCreateMaintenance();
 *
 * createMaintenance.mutate({
 *   resourceId: "resource-123",
 *   type: "PREVENTIVO",
 *   startDate: "2025-12-01T08:00",
 *   endDate: "2025-12-01T12:00",
 *   description: "Revisión trimestral del equipo",
 *   priority: "MEDIUM",
 *   assignedTo: "tech-456"
 * });
 * ```
 */
export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceDto) => {
      const response = await httpClient.post("/maintenance", data);
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Mantenimiento Creado",
        "El mantenimiento se ha programado correctamente"
      );
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.byResource(variables.resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(variables.resourceId),
      });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.upcoming });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear el mantenimiento";
      showError("Error al Crear", errorMessage);
      console.error("Error al crear mantenimiento:", error);
    },
  });
}

/**
 * Hook para actualizar mantenimiento
 *
 * @example
 * ```typescript
 * const updateMaintenance = useUpdateMaintenance();
 *
 * updateMaintenance.mutate({
 *   id: "maint-123",
 *   data: {
 *     status: "IN_PROGRESS",
 *     notes: "Iniciado el mantenimiento"
 *   }
 * });
 * ```
 */
export function useUpdateMaintenance() {
  const queryClient = useQueryClient();
  const { showSuccess: _showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMaintenanceDto;
    }) => {
      const response = await httpClient.put(`/maintenance/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.upcoming });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Error al actualizar el mantenimiento";
      showError("Error al Actualizar", errorMessage);
      console.error("Error al actualizar mantenimiento:", error);
    },
  });
}

/**
 * Hook para completar mantenimiento
 *
 * Marca el mantenimiento como completado y registra detalles
 *
 * @example
 * ```typescript
 * const completeMaintenance = useCompleteMaintenance();
 *
 * completeMaintenance.mutate({
 *   maintenanceId: "maint-123",
 *   completedBy: "tech-456",
 *   completionDate: "2025-12-01T12:00",
 *   actualDuration: 240, // 4 horas
 *   workPerformed: "Limpieza completa, cambio de filtros",
 *   resourceCondition: "EXCELLENT",
 *   followUpRequired: false
 * });
 * ```
 */
export function useCompleteMaintenance() {
  const queryClient = useQueryClient();
  const { showSuccess: _showSuccess, showError: _showError } = useToast();

  return useMutation({
    mutationFn: async (data: CompleteMaintenanceDto) => {
      const response = await httpClient.post(
        `/maintenance/${data.maintenanceId}/complete`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.detail(variables.maintenanceId),
      });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.upcoming });
      // Invalidar recurso ya que puede cambiar disponibilidad
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
    onError: (error) => {
      console.error("Error al completar mantenimiento:", error);
    },
  });
}

/**
 * Hook para cancelar mantenimiento
 *
 * @example
 * ```typescript
 * const cancelMaintenance = useCancelMaintenance();
 *
 * cancelMaintenance.mutate({
 *   id: "maint-123",
 *   reason: "Recurso no disponible",
 *   reschedule: true,
 *   newDate: "2025-12-15T08:00"
 * });
 * ```
 */
export function useCancelMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      reason: string;
      reschedule?: boolean;
      newDate?: string;
    }) => {
      const response = await httpClient.post(
        `/maintenance/${data.id}/cancel`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.upcoming });
    },
    onError: (error) => {
      console.error("Error al cancelar mantenimiento:", error);
    },
  });
}

/**
 * Hook para reprogramar mantenimiento
 *
 * @example
 * ```typescript
 * const rescheduleMaintenance = useRescheduleMaintenance();
 *
 * rescheduleMaintenance.mutate({
 *   id: "maint-123",
 *   newStartDate: "2025-12-15T08:00",
 *   newEndDate: "2025-12-15T12:00",
 *   reason: "Conflicto de agenda"
 * });
 * ```
 */
export function useRescheduleMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      newStartDate: string;
      newEndDate: string;
      reason?: string;
    }) => {
      const response = await httpClient.post(
        `/maintenance/${data.id}/reschedule`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.upcoming });
    },
    onError: (error) => {
      console.error("Error al reprogramar mantenimiento:", error);
    },
  });
}

/**
 * Hook para asignar técnico a mantenimiento
 *
 * @example
 * ```typescript
 * const assignTechnician = useAssignTechnician();
 *
 * assignTechnician.mutate({
 *   maintenanceId: "maint-123",
 *   technicianId: "tech-456",
 *   notes: "Especialista en equipos audiovisuales"
 * });
 * ```
 */
export function useAssignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      maintenanceId: string;
      technicianId: string;
      notes?: string;
    }) => {
      const response = await httpClient.post(
        `/maintenance/${data.maintenanceId}/assign`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.detail(variables.maintenanceId),
      });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
    },
    onError: (error) => {
      console.error("Error al asignar técnico:", error);
    },
  });
}

/**
 * Hook para registrar incidencia durante mantenimiento
 *
 * @example
 * ```typescript
 * const reportIncident = useReportMaintenanceIncident();
 *
 * reportIncident.mutate({
 *   maintenanceId: "maint-123",
 *   severity: "HIGH",
 *   description: "Daño encontrado en componente principal",
 *   requiresApproval: true
 * });
 * ```
 */
export function useReportMaintenanceIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      maintenanceId: string;
      severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      description: string;
      requiresApproval?: boolean;
      estimatedCost?: number;
    }) => {
      const response = await httpClient.post(
        `/maintenance/${data.maintenanceId}/incident`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: maintenanceKeys.detail(variables.maintenanceId),
      });
    },
    onError: (error) => {
      console.error("Error al reportar incidencia:", error);
    },
  });
}
