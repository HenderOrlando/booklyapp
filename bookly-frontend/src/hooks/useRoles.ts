/**
 * useRoles - Hooks para Gestión de Roles
 *
 * Proporciona queries y mutations para administración de roles y permisos
 */

import {
  AuthClient,
  type CreateRoleDto,
  type UpdateRoleDto,
} from "@/infrastructure/api/auth-client";
import type { Role } from "@/types/entities/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "./useUsers"; // Reutilizamos keys relacionadas o creamos nuevas

// ============================================
// CACHE KEYS
// ============================================

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters?: any) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener lista de roles
 */
export function useRoles(filters?: {
  name?: string;
  isActive?: boolean;
  search?: string;
}) {
  return useQuery<Role[]>({
    queryKey: roleKeys.list(filters),
    queryFn: async () => {
      const response = await AuthClient.getRoles(filters);
      // Si la respuesta viene paginada (que no debería según auth-client actualizado, pero por seguridad)
      if ((response.data as any).items) {
        return (response.data as any).items;
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para obtener un rol específico
 */
export function useRole(id: string) {
  return useQuery<Role>({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const response = await AuthClient.getRoleById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Rol no encontrado");
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
 * Hook para crear un rol
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleDto) => {
      const response = await AuthClient.createRole(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear rol");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un rol
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleDto }) => {
      const response = await AuthClient.updateRole(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al actualizar rol");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      // También invalidar usuarios ya que sus roles pueden haber cambiado (indirectamente)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook para eliminar un rol
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AuthClient.deleteRole(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar rol");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook para asignar permisos a un rol
 */
export function useAssignPermissionsToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => {
      const response = await AuthClient.assignPermissionsToRole(
        id,
        permissionIds
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al asignar permisos");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
}

/**
 * Hook para remover permisos de un rol
 */
export function useRemovePermissionsFromRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => {
      const response = await AuthClient.removePermissionsFromRole(
        id,
        permissionIds
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al remover permisos");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
    },
  });
}
