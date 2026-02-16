"use client";

import * as React from "react";

/**
 * PermissionGate — RF-42: Restricción de modificación por permisos
 *
 * Wrapper que condiciona la visibilidad o habilitación de acciones
 * según los permisos del usuario autenticado.
 *
 * Modos:
 * - "hide": Oculta el contenido si no tiene permiso
 * - "disable": Renderiza el contenido pero deshabilitado
 */

interface PermissionGateProps {
  children: React.ReactNode;
  permissions: string[];
  userPermissions: string[];
  requireAll?: boolean;
  mode?: "hide" | "disable";
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permissions,
  userPermissions,
  requireAll = false,
  mode = "hide",
  fallback = null,
}: PermissionGateProps) {
  const hasPermission = React.useMemo(() => {
    if (permissions.length === 0) return true;

    if (requireAll) {
      return permissions.every((p) => userPermissions.includes(p));
    }
    return permissions.some((p) => userPermissions.includes(p));
  }, [permissions, userPermissions, requireAll]);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (mode === "disable") {
    return (
      <div className="pointer-events-none opacity-50" aria-disabled="true">
        {children}
      </div>
    );
  }

  return <>{fallback}</>;
}
