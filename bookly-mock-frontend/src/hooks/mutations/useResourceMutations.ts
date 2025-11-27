/**
 * useResourceMutations - Mutations para Recursos
 *
 * Dominio: Resources (Salas, Equipos, Laboratorios)
 *
 * Gestiona todas las operaciones de escritura (CUD) sobre recursos
 * usando React Query para manejo de estado, cache e invalidaciones automáticas
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import type { Resource } from "@/types/entities/resource";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceKeys } from "../useResources";

/**
 * DTO para crear un recurso
 */
export interface CreateResourceDto {
  name: string;
  type: string;
  capacity: number;
  location?: string;
  description?: string;
  categoryId?: string;
  programIds?: string[];
  attributes?: Record<string, any>;
  availabilityRules?: any;
}

/**
 * DTO para actualizar un recurso
 */
export interface UpdateResourceDto extends Partial<CreateResourceDto> {
  isActive?: boolean;
  maintenanceStatus?: string;
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear un nuevo recurso
 *
 * @example
 * ```typescript
 * const createResource = useCreateResource();
 *
 * createResource.mutate({
 *   name: "Aula 101",
 *   type: "CLASSROOM",
 *   capacity: 30
 * }, {
 *   onSuccess: (resource) => {
 *     console.log("Recurso creado:", resource.id);
 *   }
 * });
 * ```
 */
export function useCreateResource() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateResourceDto) => {
      const response = await httpClient.post<Resource>("/resources", data);
      return response;
    },
    onSuccess: (response) => {
      const resourceName = response?.data?.name || "recurso";
      showSuccess(
        "Recurso Creado",
        `El recurso "${resourceName}" se creó exitosamente`
      );
      // Invalidar listas de recursos
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear el recurso";
      showError("Error al Crear Recurso", errorMessage);
      console.error("Error al crear recurso:", error);
    },
  });
}

/**
 * Hook para actualizar un recurso existente
 *
 * @example
 * ```typescript
 * const updateResource = useUpdateResource();
 *
 * updateResource.mutate({
 *   id: "resource-123",
 *   data: { capacity: 35 }
 * });
 * ```
 */
export function useUpdateResource() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateResourceDto;
    }) => {
      const response = await httpClient.put<Resource>(`/resources/${id}`, data);
      return response;
    },
    onSuccess: (data, variables) => {
      showSuccess(
        "Recurso Actualizado",
        "Los cambios se guardaron correctamente"
      );
      // Invalidar detalle del recurso y listas
      queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar el recurso";
      showError("Error al Actualizar", errorMessage);
      console.error("Error al actualizar recurso:", error);
    },
  });
}

/**
 * Hook para eliminar/deshabilitar un recurso
 *
 * @example
 * ```typescript
 * const deleteResource = useDeleteResource();
 *
 * deleteResource.mutate("resource-123");
 * ```
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/resources/${id}`);
      return id;
    },
    onSuccess: (id) => {
      showSuccess("Recurso Eliminado", "El recurso se eliminó correctamente");
      // Invalidar cache
      queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar el recurso";
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar recurso:", error);
    },
  });
}

/**
 * Hook para programar mantenimiento de un recurso
 *
 * @example
 * ```typescript
 * const scheduleMaintenance = useScheduleMaintenance();
 *
 * scheduleMaintenance.mutate({
 *   resourceId: "resource-123",
 *   startDate: "2025-12-01",
 *   endDate: "2025-12-05",
 *   reason: "Mantenimiento preventivo"
 * });
 * ```
 */
export function useScheduleMaintenance() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: {
      resourceId: string;
      startDate: string;
      endDate: string;
      reason?: string;
      notes?: string;
    }) => {
      const { resourceId, ...maintenanceData } = data;
      const response = await httpClient.post(
        `/resources/${resourceId}/maintenance`,
        maintenanceData
      );
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Mantenimiento Programado",
        "El mantenimiento se programó exitosamente"
      );
      // Invalidar cache del recurso y su mantenimiento
      queryClient.invalidateQueries({
        queryKey: resourceKeys.detail(variables.resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: resourceKeys.maintenance(variables.resourceId),
      });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al programar el mantenimiento";
      showError("Error al Programar Mantenimiento", errorMessage);
      console.error("Error al programar mantenimiento:", error);
    },
  });
}

/**
 * Hook para importación masiva de recursos
 *
 * @example
 * ```typescript
 * const importResources = useImportResources();
 *
 * importResources.mutate({
 *   file: csvFile,
 *   categoryId: "cat-123"
 * });
 * ```
 */
export function useImportResources() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: { file: File; categoryId?: string }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      if (data.categoryId) {
        formData.append("categoryId", data.categoryId);
      }

      const response = await httpClient.post("/resources/import", formData);
      return response;
    },
    onSuccess: (data: any) => {
      const count = data?.imported || 0;
      showSuccess(
        "Importación Exitosa",
        `Se importaron ${count} recursos correctamente`
      );
      // Invalidar todas las listas
      queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al importar los recursos";
      showError("Error al Importar", errorMessage);
      console.error("Error al importar recursos:", error);
    },
  });
}
