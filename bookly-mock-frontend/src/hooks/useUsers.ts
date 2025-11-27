/**
 * useUsers - Hooks para Gestión de Usuarios
 *
 * Proporciona queries y mutations para administración de usuarios del sistema
 * Requiere permisos de administrador
 */

import { AuthClient } from "@/infrastructure/api/auth-client";
import type { PaginatedResponse } from "@/infrastructure/api/types";
import type { RegisterDto } from "@/types/entities/auth";
import type { UpdateUserDto, User } from "@/types/entities/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// ============================================
// TYPES
// ============================================

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener lista de usuarios
 *
 * @param filters - Filtros opcionales
 * @example
 * ```typescript
 * const { data: users, isLoading } = useUsers({ role: 'ADMIN' });
 * ```
 */
export function useUsers(filters?: UserFilters) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const response = await AuthClient.getUsers();
      // TODO: Aplicar filtros cuando backend lo soporte
      return response.data || { items: [], total: 0, page: 1, limit: 10 };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener un usuario específico
 *
 * @param id - ID del usuario
 * @example
 * ```typescript
 * const { data: user } = useUser("user_123");
 * ```
 */
export function useUser(id: string) {
  return useQuery<User>({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await AuthClient.getUserById(id);
      if (!response.success || !response.data) {
        throw new Error("Usuario no encontrado");
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear un nuevo usuario
 *
 * @example
 * ```typescript
 * const createUser = useCreateUser();
 * createUser.mutate({
 *   email: "nuevo@example.com",
 *   name: "Usuario Nuevo",
 *   password: "securePassword123"
 * });
 * ```
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      const response = await AuthClient.createUser(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear usuario");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidar lista de usuarios
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un usuario existente
 *
 * @example
 * ```typescript
 * const updateUser = useUpdateUser();
 * updateUser.mutate({
 *   id: "user_123",
 *   data: { name: "Nombre Actualizado" }
 * });
 * ```
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateUserDto>;
    }) => {
      const response = await AuthClient.updateUser(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al actualizar usuario");
      }
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Invalidar lista y detalle del usuario
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userKeys.detail(updatedUser.id),
      });
    },
  });
}

/**
 * Hook para eliminar un usuario
 *
 * @example
 * ```typescript
 * const deleteUser = useDeleteUser();
 * deleteUser.mutate("user_123");
 * ```
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AuthClient.deleteUser(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar usuario");
      }
      return response.data;
    },
    onSuccess: (_, deletedId) => {
      // Invalidar lista y eliminar del cache el usuario eliminado
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
    },
  });
}

/**
 * Hook para asignar rol a un usuario
 *
 * @example
 * ```typescript
 * const assignRole = useAssignRole();
 * assignRole.mutate({ userId: "user_123", roleId: "role_admin" });
 * ```
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      roleId,
    }: {
      userId: string;
      roleId: string;
    }) => {
      const response = await AuthClient.assignRole(userId, roleId);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al asignar rol");
      }
      return response.data;
    },
    onSuccess: (_, { userId }) => {
      // Invalidar usuario específico y lista
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
