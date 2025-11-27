/**
 * usePermissions - Hooks para Gestión de Permisos
 *
 * Proporciona queries y mutations para administración de permisos
 */

import {
  AuthClient,
  type CreatePermissionDto,
  type UpdatePermissionDto,
} from "@/infrastructure/api/auth-client";
import type { Permission } from "@/types/entities/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (filters?: any) => [...permissionKeys.lists(), { filters }] as const,
  byModule: (resource: string) =>
    [...permissionKeys.all, "module", resource] as const,
  details: () => [...permissionKeys.all, "detail"] as const,
  detail: (id: string) => [...permissionKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener lista de permisos
 */
export function usePermissions(filters?: {
  resource?: string;
  action?: string;
  search?: string;
}) {
  return useQuery<Permission[]>({
    queryKey: permissionKeys.list(filters),
    queryFn: async () => {
      const response = await AuthClient.getPermissions(filters);
      // Adaptador por si devuelve estructura paginada
      if ((response.data as any).items) {
        return (response.data as any).items;
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (cambian poco)
  });
}

/**
 * Hook para obtener permisos por módulo
 */
export function usePermissionsByModule(resource: string) {
  return useQuery<Permission[]>({
    queryKey: permissionKeys.byModule(resource),
    queryFn: async () => {
      const response = await AuthClient.getPermissionsByModule(resource);
      return response.data || [];
    },
    enabled: !!resource,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear un permiso
 */
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePermissionDto) => {
      const response = await AuthClient.createPermission(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear permiso");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un permiso
 */
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePermissionDto;
    }) => {
      const response = await AuthClient.updatePermission(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al actualizar permiso");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: permissionKeys.detail(id) });
    },
  });
}

/**
 * Hook para eliminar un permiso
 */
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AuthClient.deletePermission(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar permiso");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
    },
  });
}
