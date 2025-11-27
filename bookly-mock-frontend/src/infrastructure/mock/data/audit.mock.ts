/**
 * Mock Data - Audit Logs
 *
 * Datos mock para el sistema de auditoría
 * Sistema transversal que registra todas las acciones
 */

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  status: "success" | "error" | "warning";
}

// ============================================
// LOGS DE AUDITORÍA MOCK
// ============================================
export const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: "admin@ufps.edu.co",
    action: "login",
    entity: "Auth",
    entityId: "user-1",
    details: "Inicio de sesión exitoso desde el dashboard",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    user: "profesor@ufps.edu.co",
    action: "crear",
    entity: "Reserva",
    entityId: "res-123",
    details: "Creó reserva para Sala A101 el 2025-11-25",
    ipAddress: "192.168.1.101",
    status: "success",
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    user: "estudiante@ufps.edu.co",
    action: "editar",
    entity: "Perfil",
    entityId: "user-5",
    details: "Actualizó su información de perfil",
    ipAddress: "192.168.1.102",
    status: "success",
  },
  {
    id: "log-4",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    user: "coordinador@ufps.edu.co",
    action: "aprobar",
    entity: "Reserva",
    entityId: "res-124",
    details: "Aprobó reserva del Auditorio Principal",
    ipAddress: "192.168.1.103",
    status: "success",
  },
  {
    id: "log-5",
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    user: "admin@ufps.edu.co",
    action: "eliminar",
    entity: "Usuario",
    entityId: "user-20",
    details: "Eliminó usuario inactivo del sistema",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "log-6",
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    user: "profesor@ufps.edu.co",
    action: "login",
    entity: "Auth",
    entityId: "user-3",
    details: "Intento de login fallido - contraseña incorrecta",
    ipAddress: "192.168.1.105",
    status: "error",
  },
  {
    id: "log-7",
    timestamp: new Date(Date.now() - 25200000).toISOString(),
    user: "admin@ufps.edu.co",
    action: "editar",
    entity: "Rol",
    entityId: "role-2",
    details: "Modificó permisos del rol Coordinador",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "log-8",
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    user: "estudiante@ufps.edu.co",
    action: "crear",
    entity: "Reserva",
    entityId: "res-125",
    details: "Intentó crear reserva sin permisos suficientes",
    ipAddress: "192.168.1.106",
    status: "warning",
  },
  {
    id: "log-9",
    timestamp: new Date(Date.now() - 32400000).toISOString(),
    user: "coordinador@ufps.edu.co",
    action: "rechazar",
    entity: "Reserva",
    entityId: "res-126",
    details: "Rechazó reserva del Laboratorio B por conflicto de horarios",
    ipAddress: "192.168.1.103",
    status: "success",
  },
  {
    id: "log-10",
    timestamp: new Date(Date.now() - 36000000).toISOString(),
    user: "admin@ufps.edu.co",
    action: "crear",
    entity: "Recurso",
    entityId: "rec-45",
    details: "Creó nuevo recurso: Sala de Conferencias C301",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "log-11",
    timestamp: new Date(Date.now() - 39600000).toISOString(),
    user: "profesor@ufps.edu.co",
    action: "editar",
    entity: "Reserva",
    entityId: "res-123",
    details: "Modificó horario de reserva existente",
    ipAddress: "192.168.1.101",
    status: "success",
  },
  {
    id: "log-12",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    user: "estudiante@ufps.edu.co",
    action: "logout",
    entity: "Auth",
    entityId: "user-5",
    details: "Cerró sesión correctamente",
    ipAddress: "192.168.1.102",
    status: "success",
  },
];

// ============================================
// HELPER: Obtener logs filtrados
// ============================================
export function getFilteredAuditLogs(filters?: {
  user?: string;
  action?: string;
  status?: string;
  search?: string;
}): AuditLog[] {
  let filtered = [...mockAuditLogs];

  if (filters?.user) {
    filtered = filtered.filter((log) => log.user === filters.user);
  }

  if (filters?.action) {
    filtered = filtered.filter((log) => log.action === filters.action);
  }

  if (filters?.status) {
    filtered = filtered.filter((log) => log.status === filters.status);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.user.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower) ||
        log.entity.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

// ============================================
// HELPER: Agregar nuevo log de auditoría
// ============================================
export function addAuditLog(log: Omit<AuditLog, "id" | "timestamp">): AuditLog {
  const newLog: AuditLog = {
    id: `log-${mockAuditLogs.length + 1}`,
    timestamp: new Date().toISOString(),
    ...log,
  };

  mockAuditLogs.unshift(newLog);
  return newLog;
}
