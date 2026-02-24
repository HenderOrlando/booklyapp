/**
 * useRoleMutations - Mutations para Roles y Permisos
 *
 * Dominio: Roles (Gestión de Roles y Permisos)
 *
 * Gestiona creación y asignación de roles del sistema
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DTO para crear rol
 */
export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}

/**
 * DTO para asignar rol a usuario
 */
export interface AssignRoleDto {
  userId: string;
  roleId: string;
}

// ============================================
// CACHE KEYS
// ============================================

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  permissions: ["roles", "permissions"] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear rol
 */
export function useCreateRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateRoleDto) => {
      const response = await httpClient.post("/roles", data);
      return response;
    },
    onSuccess: () => {
      showSuccess("Rol Creado", "El nuevo rol se ha creado exitosamente");
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear el rol";
      showError("Error al Crear", errorMessage);
    },
  });
}

/**
 * Hook para actualizar rol
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRoleDto>;
    }) => {
      const response = await httpClient.put(`/roles/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess("Rol Actualizado", "Los cambios se guardaron correctamente");
      queryClient.invalidateQueries({
        queryKey: roleKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar el rol";
      showError("Error al Actualizar", errorMessage);
    },
  });
}

/**
 * Hook para eliminar rol
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/roles/${id}`);
      return id;
    },
    onSuccess: (id) => {
      showSuccess("Rol Eliminado", "El rol se eliminó correctamente");
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar el rol";
      showError("Error al Eliminar", errorMessage);
    },
  });
}

/**
 * Hook para asignar rol a usuario
 */
export function useAssignRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: AssignRoleDto) => {
      const response = await httpClient.post("/roles/assign", data);
      return response;
    },
    onSuccess: () => {
      showSuccess("Rol Asignado", "El rol se asignó correctamente al usuario");
      // Invalidar usuarios y roles
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al asignar rol";
      showError("Error al Asignar", errorMessage);
    },
  });
}

/**
 * Hook para revocar rol de usuario
 */
export function useRevokeRole() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: { userId: string; roleId: string }) => {
      const response = await httpClient.post("/roles/revoke", data);
      return response;
    },
    onSuccess: () => {
      showSuccess("Rol Revocado", "El rol se revocó correctamente");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al revocar rol";
      showError("Error al Revocar", errorMessage);
    },
  });
}
