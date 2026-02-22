/**
 * Custom Hooks para Resources con React Query
 *
 * Gestiona recursos (salas, equipos, laboratorios) con cache y optimistic updates
 */

import type {
  CreateResourceDto,
  ResourceSearchFilters,
  UpdateResourceDto,
} from "@/infrastructure/api/resources-client";
import { ResourcesClient } from "@/infrastructure/api/resources-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Query keys para cache management
 */
export const resourceKeys = {
  all: ["resources"] as const,
  lists: () => [...resourceKeys.all, "list"] as const,
  list: (filters?: ResourceSearchFilters) =>
    [...resourceKeys.lists(), filters] as const,
  details: () => [...resourceKeys.all, "detail"] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
  categories: ["resources", "categories"] as const,
  programs: ["resources", "programs"] as const,
  maintenance: (id: string) => ["resources", id, "maintenance"] as const,
  characteristics: ["resources", "characteristics"] as const,
  types: ["resources", "types"] as const,
};

// ============================================
// QUERIES (Lectura)
// ============================================

/**
 * Hook para obtener todos los recursos
 *
 * @example
 * ```typescript
 * const { data, isLoading } = useResources();
 * ```
 */
export function useResources() {
  return useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: async () => {
      console.log("[useResources] Fetching all resources...");
      const response = await ResourcesClient.getAll();
      console.log("[useResources] Response received:", response);
      if (!response.success) {
        console.error("[useResources] Error in response:", response.message);
        throw new Error(response.message || "Error al cargar recursos");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (recursos cambian poco)
  });
}

/**
 * Hook para buscar recursos con filtros
 *
 * @param filters - Filtros de búsqueda
 * @example
 * ```typescript
 * const { data } = useResourcesSearch({
 *   type: 'CLASSROOM',
 *   status: 'AVAILABLE',
 *   minCapacity: 30
 * });
 * ```
 */
export function useResourcesSearch(filters: ResourceSearchFilters) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: async () => {
      const response = await ResourcesClient.search(filters);
      if (!response.success) {
        throw new Error(response.message || "Error al buscar recursos");
      }
      return response.data;
    },
    enabled: Object.keys(filters).length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener un recurso por ID
 *
 * @param id - ID del recurso
 * @example
 * ```typescript
 * const { data: resource } = useResource('res_001');
 * ```
 */
export function useResource(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: async () => {
      const response = await ResourcesClient.getById(id);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar recurso");
      }
      return response.data;
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para obtener categorías de recursos
 *
 * @example
 * ```typescript
 * const { data: categories } = useResourceCategories();
 * ```
 */
export function useResourceCategories() {
  return useQuery({
    queryKey: resourceKeys.categories,
    queryFn: async () => {
      const response = await ResourcesClient.getCategories();
      if (!response.success) {
        throw new Error(response.message || "Error al cargar categorías");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos (muy estático)
  });
}

/**
 * Hook para obtener programas académicos
 *
 * @example
 * ```typescript
 * const { data: programs } = useAcademicPrograms();
 * ```
 */
export function useAcademicPrograms() {
  return useQuery({
    queryKey: resourceKeys.programs,
    queryFn: async () => {
      const response = await ResourcesClient.getAcademicPrograms();
      if (!response.success) {
        throw new Error(response.message || "Error al cargar programas");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para obtener el catálogo de características de recursos
 *
 * @example
 * ```typescript
 * const { data: characteristics } = useResourceCharacteristics();
 * ```
 */
export function useResourceCharacteristics() {
  return useQuery({
    queryKey: resourceKeys.characteristics,
    queryFn: async () => {
      const response = await ResourcesClient.getCharacteristics();
      if (!response.success) {
        throw new Error(
          response.message || "Error al cargar catálogo de características",
        );
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para obtener los tipos de recursos desde datos de referencia
 *
 * @example
 * ```typescript
 * const { data: resourceTypes } = useResourceTypes();
 * ```
 */
export function useResourceTypes() {
  return useQuery({
    queryKey: resourceKeys.types,
    queryFn: async () => {
      const response = await ResourcesClient.getResourceTypes();
      if (!response.success) {
        throw new Error(
          response.message || "Error al cargar tipos de recursos",
        );
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora (tipos de recursos son muy estáticos)
  });
}

/**
 * Hook para obtener historial de mantenimiento
 *
 * @param resourceId - ID del recurso
 * @example
 * ```typescript
 * const { data: history } = useMaintenanceHistory('res_001');
 * ```
 */
export function useMaintenanceHistory(resourceId: string) {
  return useQuery({
    queryKey: resourceKeys.maintenance(resourceId),
    queryFn: async () => {
      const response = await ResourcesClient.getMaintenanceHistory(resourceId);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar mantenimiento");
      }
      return response.data;
    },
    enabled: !!resourceId,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// MUTATIONS (Escritura)
// ============================================

/**
 * Hook para crear un nuevo recurso
 *
 * @example
 * ```typescript
 * const createMutation = useCreateResource();
 * await createMutation.mutateAsync(resourceData);
 * ```
 */
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResourceDto) => {
      const response = await ResourcesClient.create(data);
      if (!response.success) {
        throw new Error(response.message || "Error al crear recurso");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un recurso
 *
 * @example
 * ```typescript
 * const updateMutation = useUpdateResource();
 * await updateMutation.mutateAsync({ id: 'res_001', data: { name: 'Nuevo nombre' } });
 * ```
 */
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateResourceDto;
    }) => {
      const response = await ResourcesClient.update(id, data);
      if (!response.success) {
        throw new Error(response.message || "Error al actualizar recurso");
      }
      return response.data;
    },
    onSuccess: (updatedResource) => {
      queryClient.setQueryData(
        resourceKeys.detail(updatedResource.id),
        updatedResource,
      );
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

/**
 * Hook para eliminar un recurso
 *
 * @example
 * ```typescript
 * const deleteMutation = useDeleteResource();
 * await deleteMutation.mutateAsync('res_001');
 * ```
 */
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ResourcesClient.delete(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar recurso");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

/**
 * Hook para registrar mantenimiento
 *
 * @example
 * ```typescript
 * const maintenanceMutation = useCreateMaintenance();
 * await maintenanceMutation.mutateAsync({
 *   resourceId: 'res_001',
 *   data: { type: 'PREVENTIVE', ... }
 * });
 * ```
 */
export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      data,
    }: {
      resourceId: string;
      data: {
        type: string;
        description: string;
        scheduledDate: string;
        estimatedDuration?: number;
      };
    }) => {
      const response = await ResourcesClient.createMaintenance(
        resourceId,
        data,
      );
      if (!response.success) {
        throw new Error(response.message || "Error al registrar mantenimiento");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: resourceKeys.maintenance(variables.resourceId),
      });
    },
  });
}
