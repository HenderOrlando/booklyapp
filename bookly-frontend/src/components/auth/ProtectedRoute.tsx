/**
 * ProtectedRoute - Componente para rutas protegidas
 *
 * Verifica autenticación usando React Query (useCurrentUser)
 * Reemplaza lógica de Redux
 */

"use client";

import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { useIsAuthenticated } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredRole?: string;
  requiredPermission?: { resource: string; action: string };
}

export function ProtectedRoute({
  children,
  redirectTo = "/login",
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check required role
  if (requiredRole && user) {
    const hasRole = user.roles?.some((r: any) => r.name === requiredRole);
    if (!hasRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-400">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        </div>
      );
    }
  }

  // Check required permission
  if (requiredPermission && user) {
    const hasPermission = user.permissions?.some(
      (p: any) =>
        p.resource === requiredPermission.resource &&
        p.action === requiredPermission.action
    );
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-400">
              No tienes los permisos necesarios para esta acción.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
