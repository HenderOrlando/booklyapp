/**
 * useCurrentUser - Hook para usuario actual
 *
 * Ahora usa AuthContext en lugar de React Query
 */

import { useAuth } from "@/contexts/AuthContext";
import { httpClient } from "@/infrastructure/http/httpClient";
import type { User } from "@/types/entities/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const currentUserKeys = {
  all: ["current-user"] as const,
  user: () => [...currentUserKeys.all, "profile"] as const,
  permissions: () => [...currentUserKeys.all, "permissions"] as const,
  roles: () => [...currentUserKeys.all, "roles"] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener usuario actual autenticado
 *
 * Ahora usa AuthContext en lugar de React Query
 *
 * @example
 * ```typescript
 * const { data: user, isLoading } = useCurrentUser();
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (!user) return <Navigate to="/login" />;
 *
 * return <div>Welcome, {user.name}!</div>;
 * ```
 */
export function useCurrentUser() {
  const { user, isLoading } = useAuth();

  return {
    data: user,
    isLoading,
    error: null,
  };
}

/**
 * Hook para obtener permisos del usuario actual
 */
export function useCurrentUserPermissions() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: currentUserKeys.permissions(),
    queryFn: async () => {
      const response = await httpClient.get("/auth/permissions");
      return response.data || [];
    },
    enabled: !!user, // Solo ejecutar si hay usuario
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}

/**
 * Hook para obtener roles del usuario actual
 */
export function useCurrentUserRoles() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: currentUserKeys.roles(),
    queryFn: async () => {
      const response = await httpClient.get("/auth/roles");
      return response.data || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para login
 *
 * Setea el usuario en cache automáticamente
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await httpClient.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // SISTEMA REAL: Guardar en sessionStorage + cookies (como /login)
      if (data.accessToken) {
        // 1. SessionStorage
        sessionStorage.setItem("accessToken", data.accessToken);
        sessionStorage.setItem("user", JSON.stringify(data.user));

        // 2. Cookie para middleware (24 horas)
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400`;
      }

      // 3. Setear usuario en cache
      queryClient.setQueryData(currentUserKeys.user(), data.user);

      // Prefetch permisos y roles
      queryClient.prefetchQuery({ queryKey: currentUserKeys.permissions() });
      queryClient.prefetchQuery({ queryKey: currentUserKeys.roles() });
    },
  });
}

/**
 * Hook para logout
 *
 * Limpia cache de usuario automáticamente
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await httpClient.post("/auth/logout");
    },
    onSuccess: () => {
      // SISTEMA REAL: Limpiar sessionStorage + cookies
      // 1. SessionStorage
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");

      // 2. Cookie
      document.cookie = "accessToken=; path=/; max-age=0";

      // 3. Limpiar cache de auth
      queryClient.setQueryData(currentUserKeys.user(), null);
      queryClient.removeQueries({ queryKey: currentUserKeys.permissions() });
      queryClient.removeQueries({ queryKey: currentUserKeys.roles() });
    },
  });
}

/**
 * Hook para actualizar perfil
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await httpClient.put("/auth/profile", data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Actualizar usuario en cache
      queryClient.setQueryData(currentUserKeys.user(), updatedUser);
    },
  });
}

// ============================================
// HELPERS
// ============================================

/**
 * Helper para verificar si usuario está autenticado
 *
 * @example
 * ```typescript
 * const { isAuthenticated } = useIsAuthenticated();
 * if (!isAuthenticated) return <Navigate to="/login" />;
 * ```
 */
export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();

  return {
    isAuthenticated: !!user && !isLoading,
    isLoading,
    user,
  };
}

/**
 * Helper para verificar permisos
 *
 * @example
 * ```typescript
 * const { hasPermission } = useHasPermission();
 * if (hasPermission('resources', 'create')) {
 *   return <CreateButton />;
 * }
 * ```
 */
export function useHasPermission() {
  const { data: permissions = [] } = useCurrentUserPermissions();

  const hasPermission = (resource: string, action: string): boolean => {
    return permissions.some(
      (p: any) => p.resource === resource && p.action === action
    );
  };

  return { hasPermission, permissions };
}

/**
 * Helper para verificar roles
 *
 * @example
 * ```typescript
 * const { hasRole } = useHasRole();
 * if (hasRole('admin')) {
 *   return <AdminPanel />;
 * }
 * ```
 */
export function useHasRole() {
  const { data: roles = [] } = useCurrentUserRoles();

  const hasRole = (roleName: string): boolean => {
    return roles.some((r: any) => r.name === roleName);
  };

  return { hasRole, roles };
}
