import { UserRole } from "@libs/common/enums";

/**
 * Definiciones de roles del sistema con sus permisos asociados
 */

export interface RoleSeedData {
  name: UserRole;
  displayName: string;
  description: string;
  permissionCodes: string[];
  isActive: boolean;
  isDefault: boolean;
}

/**
 * Rol: Administrador del Sistema
 * Acceso completo a todas las funcionalidades
 */
export const ADMIN_ROLE: RoleSeedData = {
  name: UserRole.GENERAL_ADMIN,
  displayName: "Administrador General",
  description:
    "Acceso completo al sistema. Puede gestionar usuarios, roles, recursos y todas las funcionalidades.",
  permissionCodes: ["*"], // Wildcard: todos los permisos
  isActive: true,
  isDefault: true,
};

/**
 * Rol: Administrador de Programa
 * Gestiona recursos y disponibilidad de su programa académico
 */
export const PROGRAM_ADMIN_ROLE: RoleSeedData = {
  name: UserRole.PROGRAM_ADMIN,
  displayName: "Administrador de Programa",
  description:
    "Gestiona recursos y disponibilidad de su programa académico. Puede aprobar reservas.",
  permissionCodes: [
    // Resources
    "resources:read",
    "resources:write",
    "resources:categories:read",
    "resources:categories:write",
    // Availability
    "availability:read",
    "availability:write",
    "availability:reservations:read",
    "availability:reservations:write",
    "availability:reservations:cancel",
    "availability:approve",
    "availability:reassign",
    // Stockpile
    "stockpile:read",
    "stockpile:approve",
    "stockpile:reject",
    // Reports
    "reports:read",
    "reports:write",
    "reports:export",
  ],
  isActive: true,
  isDefault: true,
};

/**
 * Rol: Docente
 * Crea reservas y aprueba solicitudes de estudiantes
 */
export const TEACHER_ROLE: RoleSeedData = {
  name: UserRole.TEACHER,
  displayName: "Docente",
  description:
    "Puede crear reservas para sus clases y aprobar solicitudes de estudiantes.",
  permissionCodes: [
    // Resources (solo lectura)
    "resources:read",
    "resources:categories:read",
    // Availability
    "availability:read",
    "availability:reservations:read",
    "availability:reservations:write",
    "availability:reservations:cancel", // Solo sus propias reservas
    "availability:approve", // Aprobar reservas de estudiantes
    // Stockpile (lectura)
    "stockpile:read",
    // Reports (lectura)
    "reports:read",
  ],
  isActive: true,
  isDefault: true,
};

/**
 * Rol: Estudiante
 * Visualiza disponibilidad y crea reservas (sujetas a aprobación)
 */
export const STUDENT_ROLE: RoleSeedData = {
  name: UserRole.STUDENT,
  displayName: "Estudiante",
  description:
    "Puede ver disponibilidad de recursos y crear reservas sujetas a aprobación.",
  permissionCodes: [
    // Resources (solo lectura)
    "resources:read",
    "resources:categories:read",
    // Availability (lectura y crear reservas)
    "availability:read",
    "availability:reservations:read", // Solo sus propias reservas
    "availability:reservations:write", // Crear reservas (requiere aprobación)
    "availability:reservations:cancel", // Solo sus propias reservas
  ],
  isActive: true,
  isDefault: true,
};

/**
 * Rol: Personal de Seguridad/Vigilancia
 * Valida check-in y check-out de usuarios
 */
export const SECURITY_ROLE: RoleSeedData = {
  name: UserRole.SECURITY,
  displayName: "Seguridad",
  description:
    "Personal de vigilancia que valida entrada y salida de usuarios en recursos.",
  permissionCodes: [
    // Stockpile (validación)
    "stockpile:read",
    "stockpile:validate",
    // Availability (solo lectura de reservas para validar)
    "availability:reservations:read",
  ],
  isActive: true,
  isDefault: true,
};

/**
 * Rol: Personal Administrativo/Staff
 * Acceso de solo lectura para consultas
 */
export const STAFF_ROLE: RoleSeedData = {
  name: UserRole.ADMINISTRATIVE_STAFF,
  displayName: "Personal Administrativo",
  description:
    "Personal administrativo con acceso de lectura a recursos, disponibilidad y reportes.",
  permissionCodes: [
    // Resources (solo lectura)
    "resources:read",
    "resources:categories:read",
    // Availability (solo lectura)
    "availability:read",
    "availability:reservations:read",
    // Stockpile (solo lectura)
    "stockpile:read",
    // Reports (lectura)
    "reports:read",
  ],
  isActive: true,
  isDefault: true,
};

/**
 * Todos los roles del sistema
 */
export const ALL_ROLES: RoleSeedData[] = [
  ADMIN_ROLE,
  PROGRAM_ADMIN_ROLE,
  TEACHER_ROLE,
  STUDENT_ROLE,
  SECURITY_ROLE,
  STAFF_ROLE,
];

/**
 * Total de roles: 6
 */
export const ROLES_COUNT = ALL_ROLES.length;

/**
 * Mapeo de roles a permisos para referencia rápida
 */
export const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  [UserRole.GENERAL_ADMIN]: ADMIN_ROLE.permissionCodes,
  [UserRole.PROGRAM_ADMIN]: PROGRAM_ADMIN_ROLE.permissionCodes,
  [UserRole.TEACHER]: TEACHER_ROLE.permissionCodes,
  [UserRole.STUDENT]: STUDENT_ROLE.permissionCodes,
  [UserRole.SECURITY]: SECURITY_ROLE.permissionCodes,
  [UserRole.ADMINISTRATIVE_STAFF]: STAFF_ROLE.permissionCodes,
};
