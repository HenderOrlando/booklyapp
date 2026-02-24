"use client";

import { useAuth as useAuthContext } from "@/contexts/AuthContext";

/**
 * Hook personalizado para gestión de autenticación
 * Redirige al nuevo AuthContext
 */
export function useAuth() {
  const context = useAuthContext();
  
  const hasPermission = (resource: string, action: string): boolean => {
    if (!context.user?.permissions) return false;

    return context.user.permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    );
  };

  const hasRole = (roleName: string): boolean => {
    if (!context.user?.roles) return false;

    return context.user.roles.some((role) => role.name === roleName);
  };

  return {
    ...context,
    hasPermission,
    hasRole,
  };
}
