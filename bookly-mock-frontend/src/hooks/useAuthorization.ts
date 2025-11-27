"use client";

import { useAuth } from "./useAuth";

/**
 * Hook para gestión de permisos y autorización (Access Control)
 * Siguiendo los principios del sistema de diseño Bookly
 */
export function useAuthorization() {
  const { user, hasPermission, hasRole } = useAuth();

  /**
   * Verifica si el usuario tiene permiso para una acción en un recurso
   */
  const can = (resource: string, action: string): boolean => {
    return hasPermission(resource, action);
  };

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  /**
   * Verifica si el usuario tiene todos los roles especificados
   */
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => hasRole(role));
  };

  /**
   * Verifica si el usuario es administrador (General o de Programa)
   */
  const isAdmin = (): boolean => {
    return hasAnyRole(["Administrador General", "Administrador de Programa"]);
  };

  /**
   * Verifica si el usuario es coordinador
   */
  const isCoordinator = (): boolean => {
    return hasRole("Coordinador");
  };

  /**
   * Verifica si el usuario es profesor
   */
  const isTeacher = (): boolean => {
    return hasRole("Profesor");
  };

  /**
   * Verifica si el usuario es estudiante
   */
  const isStudent = (): boolean => {
    return hasRole("Estudiante");
  };

  /**
   * Verifica si el usuario puede gestionar recursos
   */
  const canManageResources = (): boolean => {
    return can("resources", "update") || can("resources", "delete");
  };

  /**
   * Verifica si el usuario puede aprobar reservas
   */
  const canApproveReservations = (): boolean => {
    return can("reservations", "approve") || isAdmin() || isCoordinator();
  };

  /**
   * Verifica si el usuario puede ver reportes
   */
  const canViewReports = (): boolean => {
    return can("reports", "read") || isAdmin();
  };

  return {
    can,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isCoordinator,
    isTeacher,
    isStudent,
    canManageResources,
    canApproveReservations,
    canViewReports,
    user,
  };
}
