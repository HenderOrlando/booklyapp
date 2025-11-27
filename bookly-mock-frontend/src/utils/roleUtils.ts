/**
 * Utilidades para manejo y normalización de roles
 *
 * Este módulo centraliza la lógica de mapeo entre los roles del backend
 * (nombres completos como "Administrador General") y los identificadores
 * internos del frontend (como "admin").
 */

import { Role } from "@/types/entities/user";

/**
 * Mapeo de roles del backend a identificadores internos
 *
 * Backend: Usa nombres descriptivos completos
 * Frontend: Usa identificadores cortos para validación
 */
export const ROLE_MAPPER: Record<string, string> = {
  "Administrador General": "admin",
  "Administrador de Programa": "coordinador",
  Estudiante: "estudiante",
  Docente: "profesor",
  Vigilante: "vigilancia",
  "Administrativo General": "admin",
};

/**
 * Roles disponibles en el sistema (identificadores internos)
 */
export const ROLES = {
  ADMIN: "admin",
  COORDINADOR: "coordinador",
  ESTUDIANTE: "estudiante",
  PROFESOR: "profesor",
  VIGILANCIA: "vigilancia",
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

/**
 * Normaliza un nombre de rol del backend al identificador interno
 *
 * @param roleName - Nombre del rol desde el backend
 * @returns Identificador normalizado o null si no se reconoce
 *
 * @example
 * ```typescript
 * normalizeRole("Administrador General") // "admin"
 * normalizeRole("Estudiante") // "estudiante"
 * normalizeRole("Docente") // "profesor"
 * ```
 */
export function normalizeRole(roleName: string): string | null {
  if (!roleName || typeof roleName !== "string") {
    return null;
  }

  // Primero intentar mapeo directo
  if (ROLE_MAPPER[roleName]) {
    return ROLE_MAPPER[roleName];
  }

  // Fallback: convertir a minúsculas y remover espacios
  const normalized = roleName.toLowerCase().trim();

  // Mapeos adicionales basados en palabras clave
  if (normalized.includes("admin") || normalized.includes("administrador")) {
    return ROLES.ADMIN;
  }
  if (normalized.includes("coordinador") || normalized.includes("programa")) {
    return ROLES.COORDINADOR;
  }
  if (normalized.includes("estudiante")) {
    return ROLES.ESTUDIANTE;
  }
  if (normalized.includes("docente") || normalized.includes("profesor")) {
    return ROLES.PROFESOR;
  }
  if (normalized.includes("vigilancia") || normalized.includes("vigilante")) {
    return ROLES.VIGILANCIA;
  }

  // Si no se encuentra, retornar el rol en minúsculas
  console.warn(
    `[roleUtils] Rol no reconocido: "${roleName}", usando versión normalizada`
  );
  return normalized;
}

/**
 * Normaliza un array de roles del backend
 *
 * @param roles - Array de roles desde el backend
 * @returns Array de identificadores normalizados
 *
 * @example
 * ```typescript
 * const userRoles = [
 *   { id: '1', name: 'Administrador General', ... },
 *   { id: '2', name: 'Docente', ... }
 * ];
 * normalizeRoles(userRoles) // ["admin", "profesor"]
 * ```
 */
export function normalizeRoles(
  roles: Role[] | string[] | undefined | null
): string[] {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return [];
  }

  return roles
    .map((role) => {
      // Manejar tanto strings como objetos Role
      const roleName = typeof role === "string" ? role : role?.name;
      if (!roleName) return null;

      return normalizeRole(roleName);
    })
    .filter((role): role is string => role !== null);
}

/**
 * Verifica si el usuario tiene al menos uno de los roles especificados
 *
 * @param userRoles - Roles del usuario (normalizados o sin normalizar)
 * @param requiredRoles - Roles requeridos para la acción
 * @returns true si el usuario tiene al menos uno de los roles requeridos
 *
 * @example
 * ```typescript
 * const user = { roles: [{ name: "Administrador General" }] };
 * const userRoles = normalizeRoles(user.roles);
 *
 * hasRole(userRoles, ["admin"]) // true
 * hasRole(userRoles, ["estudiante"]) // false
 * hasRole(userRoles, ["admin", "coordinador"]) // true (tiene admin)
 * ```
 */
export function hasRole(
  userRoles: string[] | undefined | null,
  requiredRoles: string | string[]
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  const required = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  if (required.length === 0) {
    return true; // Sin restricciones de rol
  }

  return required.some((role) => userRoles.includes(role));
}

/**
 * Verifica si el usuario tiene TODOS los roles especificados
 *
 * @param userRoles - Roles del usuario (normalizados)
 * @param requiredRoles - Roles requeridos
 * @returns true si el usuario tiene todos los roles requeridos
 */
export function hasAllRoles(
  userRoles: string[] | undefined | null,
  requiredRoles: string[]
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  if (requiredRoles.length === 0) {
    return true;
  }

  return requiredRoles.every((role) => userRoles.includes(role));
}

/**
 * Verifica si el usuario tiene rol de administrador
 *
 * @param userRoles - Roles del usuario (normalizados)
 * @returns true si el usuario es administrador
 */
export function isAdmin(userRoles: string[] | undefined | null): boolean {
  return hasRole(userRoles, ROLES.ADMIN);
}

/**
 * Verifica si el usuario tiene rol de coordinador
 *
 * @param userRoles - Roles del usuario (normalizados)
 * @returns true si el usuario es coordinador
 */
export function isCoordinador(userRoles: string[] | undefined | null): boolean {
  return hasRole(userRoles, ROLES.COORDINADOR);
}

/**
 * Verifica si el usuario tiene rol de profesor
 *
 * @param userRoles - Roles del usuario (normalizados)
 * @returns true si el usuario es profesor
 */
export function isProfesor(userRoles: string[] | undefined | null): boolean {
  return hasRole(userRoles, ROLES.PROFESOR);
}

/**
 * Verifica si el usuario tiene rol de estudiante
 *
 * @param userRoles - Roles del usuario (normalizados)
 * @returns true si el usuario es estudiante
 */
export function isEstudiante(userRoles: string[] | undefined | null): boolean {
  return hasRole(userRoles, ROLES.ESTUDIANTE);
}

/**
 * Verifica si el usuario tiene privilegios administrativos
 * (admin o coordinador)
 *
 * @param userRoles - Roles del usuario (normalizados)
 * @returns true si el usuario tiene privilegios administrativos
 */
export function hasAdminPrivileges(
  userRoles: string[] | undefined | null
): boolean {
  return hasRole(userRoles, [ROLES.ADMIN, ROLES.COORDINADOR]);
}

/**
 * Obtiene el rol de mayor privilegio del usuario
 *
 * @param userRoles - Roles del usuario (normalizados)
 * @returns El rol de mayor privilegio o null si no tiene roles
 */
export function getHighestRole(
  userRoles: string[] | undefined | null
): string | null {
  if (!userRoles || userRoles.length === 0) {
    return null;
  }

  // Orden de privilegios (mayor a menor)
  const roleHierarchy = [
    ROLES.ADMIN,
    ROLES.COORDINADOR,
    ROLES.PROFESOR,
    ROLES.VIGILANCIA,
    ROLES.ESTUDIANTE,
  ];

  for (const role of roleHierarchy) {
    if (userRoles.includes(role)) {
      return role;
    }
  }

  // Si no encuentra ninguno conocido, retornar el primero
  return userRoles[0];
}

/**
 * Obtiene el nombre legible de un rol
 *
 * @param roleId - Identificador interno del rol
 * @returns Nombre legible del rol
 */
export function getRoleDisplayName(roleId: string): string {
  const displayNames: Record<string, string> = {
    admin: "Administrador",
    coordinador: "Coordinador de Programa",
    estudiante: "Estudiante",
    profesor: "Docente",
    vigilancia: "Personal de Vigilancia",
  };

  return displayNames[roleId] || roleId;
}
