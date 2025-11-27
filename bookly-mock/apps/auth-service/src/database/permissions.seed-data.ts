/**
 * Definiciones de permisos del sistema
 * Organizados por módulo/recurso
 */

export interface PermissionSeedData {
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  isActive: boolean;
}

/**
 * Permisos del módulo Auth
 */
export const AUTH_PERMISSIONS: PermissionSeedData[] = [
  {
    code: "auth:users:read",
    name: "Ver Usuarios",
    description: "Permite ver la lista de usuarios del sistema",
    resource: "auth",
    action: "users:read",
    isActive: true,
  },
  {
    code: "auth:users:write",
    name: "Gestionar Usuarios",
    description: "Permite crear y editar usuarios del sistema",
    resource: "auth",
    action: "users:write",
    isActive: true,
  },
  {
    code: "auth:users:delete",
    name: "Eliminar Usuarios",
    description: "Permite eliminar usuarios del sistema",
    resource: "auth",
    action: "users:delete",
    isActive: true,
  },
  {
    code: "auth:roles:read",
    name: "Ver Roles",
    description: "Permite ver la lista de roles del sistema",
    resource: "auth",
    action: "roles:read",
    isActive: true,
  },
  {
    code: "auth:roles:write",
    name: "Gestionar Roles",
    description: "Permite crear y editar roles del sistema",
    resource: "auth",
    action: "roles:write",
    isActive: true,
  },
  {
    code: "auth:roles:delete",
    name: "Eliminar Roles",
    description: "Permite eliminar roles del sistema",
    resource: "auth",
    action: "roles:delete",
    isActive: true,
  },
];

/**
 * Permisos del módulo Resources
 */
export const RESOURCES_PERMISSIONS: PermissionSeedData[] = [
  {
    code: "resources:read",
    name: "Ver Recursos",
    description: "Permite ver la lista de recursos del sistema",
    resource: "resources",
    action: "read",
    isActive: true,
  },
  {
    code: "resources:write",
    name: "Gestionar Recursos",
    description: "Permite crear y editar recursos del sistema",
    resource: "resources",
    action: "write",
    isActive: true,
  },
  {
    code: "resources:delete",
    name: "Eliminar Recursos",
    description: "Permite eliminar recursos del sistema",
    resource: "resources",
    action: "delete",
    isActive: true,
  },
  {
    code: "resources:categories:read",
    name: "Ver Categorías",
    description: "Permite ver categorías de recursos",
    resource: "resources",
    action: "categories:read",
    isActive: true,
  },
  {
    code: "resources:categories:write",
    name: "Gestionar Categorías",
    description: "Permite crear y editar categorías de recursos",
    resource: "resources",
    action: "categories:write",
    isActive: true,
  },
  {
    code: "resources:categories:delete",
    name: "Eliminar Categorías",
    description: "Permite eliminar categorías de recursos",
    resource: "resources",
    action: "categories:delete",
    isActive: true,
  },
];

/**
 * Permisos del módulo Availability
 */
export const AVAILABILITY_PERMISSIONS: PermissionSeedData[] = [
  {
    code: "availability:read",
    name: "Ver Disponibilidad",
    description: "Permite ver la disponibilidad de recursos",
    resource: "availability",
    action: "read",
    isActive: true,
  },
  {
    code: "availability:write",
    name: "Gestionar Disponibilidad",
    description: "Permite configurar disponibilidad de recursos",
    resource: "availability",
    action: "write",
    isActive: true,
  },
  {
    code: "availability:delete",
    name: "Eliminar Disponibilidad",
    description: "Permite eliminar configuraciones de disponibilidad",
    resource: "availability",
    action: "delete",
    isActive: true,
  },
  {
    code: "availability:reservations:read",
    name: "Ver Reservas",
    description: "Permite ver reservas del sistema",
    resource: "availability",
    action: "reservations:read",
    isActive: true,
  },
  {
    code: "availability:reservations:write",
    name: "Crear Reservas",
    description: "Permite crear y editar reservas",
    resource: "availability",
    action: "reservations:write",
    isActive: true,
  },
  {
    code: "availability:reservations:cancel",
    name: "Cancelar Reservas",
    description: "Permite cancelar reservas propias o de otros",
    resource: "availability",
    action: "reservations:cancel",
    isActive: true,
  },
  {
    code: "availability:approve",
    name: "Aprobar Reservas",
    description: "Permite aprobar solicitudes de reserva",
    resource: "availability",
    action: "approve",
    isActive: true,
  },
  {
    code: "availability:reassign",
    name: "Reasignar Reservas",
    description: "Permite reasignar reservas a otros recursos",
    resource: "availability",
    action: "reassign",
    isActive: true,
  },
  {
    code: "availability:override",
    name: "Sobreescribir Restricciones",
    description: "Permite sobreescribir restricciones de reserva",
    resource: "availability",
    action: "override",
    isActive: true,
  },
];

/**
 * Permisos del módulo Stockpile
 */
export const STOCKPILE_PERMISSIONS: PermissionSeedData[] = [
  {
    code: "stockpile:read",
    name: "Ver Aprobaciones",
    description: "Permite ver flujos de aprobación",
    resource: "stockpile",
    action: "read",
    isActive: true,
  },
  {
    code: "stockpile:write",
    name: "Gestionar Aprobaciones",
    description: "Permite configurar flujos de aprobación",
    resource: "stockpile",
    action: "write",
    isActive: true,
  },
  {
    code: "stockpile:delete",
    name: "Eliminar Aprobaciones",
    description: "Permite eliminar flujos de aprobación",
    resource: "stockpile",
    action: "delete",
    isActive: true,
  },
  {
    code: "stockpile:approve",
    name: "Aprobar Solicitudes",
    description: "Permite aprobar solicitudes de reserva",
    resource: "stockpile",
    action: "approve",
    isActive: true,
  },
  {
    code: "stockpile:reject",
    name: "Rechazar Solicitudes",
    description: "Permite rechazar solicitudes de reserva",
    resource: "stockpile",
    action: "reject",
    isActive: true,
  },
  {
    code: "stockpile:validate",
    name: "Validar Check-in/Check-out",
    description: "Permite validar entrada y salida de usuarios",
    resource: "stockpile",
    action: "validate",
    isActive: true,
  },
];

/**
 * Permisos del módulo Reports
 */
export const REPORTS_PERMISSIONS: PermissionSeedData[] = [
  {
    code: "reports:read",
    name: "Ver Reportes",
    description: "Permite ver reportes del sistema",
    resource: "reports",
    action: "read",
    isActive: true,
  },
  {
    code: "reports:write",
    name: "Generar Reportes",
    description: "Permite generar reportes personalizados",
    resource: "reports",
    action: "write",
    isActive: true,
  },
  {
    code: "reports:export",
    name: "Exportar Reportes",
    description: "Permite exportar reportes en CSV u otros formatos",
    resource: "reports",
    action: "export",
    isActive: true,
  },
];

/**
 * Todos los permisos del sistema
 */
export const ALL_PERMISSIONS: PermissionSeedData[] = [
  ...AUTH_PERMISSIONS,
  ...RESOURCES_PERMISSIONS,
  ...AVAILABILITY_PERMISSIONS,
  ...STOCKPILE_PERMISSIONS,
  ...REPORTS_PERMISSIONS,
];

/**
 * Total de permisos: 30
 */
export const PERMISSIONS_COUNT = ALL_PERMISSIONS.length;
