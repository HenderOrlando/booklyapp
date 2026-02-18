/**
 * Mapa centralizado de endpoints del API Gateway
 * Todos los endpoints usan el prefijo /api/v1
 *
 * @see https://github.com/bookly/docs/API_GATEWAY.md
 */

export const API_VERSION = "/api/v1";

/**
 * Endpoints de Autenticación (Auth Service - Puerto 3001)
 */
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_VERSION}/auth/login`,
  REGISTER: `${API_VERSION}/auth/register`,
  LOGOUT: `${API_VERSION}/auth/logout`,
  PROFILE: `${API_VERSION}/users/me`,
  PROFILE_DETAILS: `${API_VERSION}/users/me/profile`,
  PROFILE_UPDATE: `${API_VERSION}/users/me/profile`,
  PROFILE_PHOTO: `${API_VERSION}/users/me/photo`,
  PROFILE_PREFERENCES: `${API_VERSION}/users/me/preferences`,
  REFRESH_TOKEN: `${API_VERSION}/auth/refresh`,
  VERIFY_EMAIL: `${API_VERSION}/auth/verify-email`,
  FORGOT_PASSWORD: `${API_VERSION}/auth/forgot-password`,
  RESET_PASSWORD: `${API_VERSION}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_VERSION}/auth/change-password`,

  // Gestión de Usuarios
  USERS: `${API_VERSION}/users`,
  USER_BY_ID: (id: string) => `${API_VERSION}/users/${id}`,
  USER_ASSIGN_ROLE: (userId: string) => `${API_VERSION}/users/${userId}/role`,

  // Roles y Permisos
  ROLES: `${API_VERSION}/roles`,
  ROLE_BY_ID: (id: string) => `${API_VERSION}/roles/${id}`,
  ROLE_ASSIGN_PERMISSIONS: (id: string) =>
    `${API_VERSION}/roles/${id}/permissions`,
  ROLE_REMOVE_PERMISSIONS: (id: string) =>
    `${API_VERSION}/roles/${id}/permissions`,

  PERMISSIONS: `${API_VERSION}/permissions`,
  PERMISSION_BY_ID: (id: string) => `${API_VERSION}/permissions/${id}`,
  PERMISSIONS_BY_MODULE: (resource: string) =>
    `${API_VERSION}/permissions/module/${resource}`,
  ACTIVE_PERMISSIONS: `${API_VERSION}/permissions/active`,
  BULK_PERMISSIONS: `${API_VERSION}/permissions/bulk`,

  // OAuth
  GOOGLE_LOGIN: `${API_VERSION}/auth/oauth/google`,
  GOOGLE_CALLBACK: `${API_VERSION}/auth/oauth/google/callback`,
} as const;

/**
 * Endpoints de Recursos (Resources Service - Puerto 3002)
 */
export const RESOURCES_ENDPOINTS = {
  // CRUD de Recursos
  BASE: `${API_VERSION}/resources`,
  BY_ID: (id: string) => `${API_VERSION}/resources/${id}`,

  // Categorías
  CATEGORIES: `${API_VERSION}/categories`,
  CATEGORY_BY_ID: (id: string) => `${API_VERSION}/categories/${id}`,

  // Programas Académicos (BE controller: "programs")
  PROGRAMS: `${API_VERSION}/programs`,
  PROGRAM_BY_ID: (id: string) => `${API_VERSION}/programs/${id}`,

  // Importación/Exportación
  IMPORT_CSV: `${API_VERSION}/resources/import/csv`,
  EXPORT_CSV: `${API_VERSION}/resources/export/csv`,
  EXPORT_PDF: `${API_VERSION}/resources/export/pdf`,

  // Mantenimiento (BE controller: "maintenances")
  MAINTENANCE: `${API_VERSION}/maintenances`,
  MAINTENANCE_BY_ID: (id: string) => `${API_VERSION}/maintenances/${id}`,
  MAINTENANCE_HISTORY: (resourceId: string) =>
    `${API_VERSION}/maintenances?resourceId=${resourceId}`,

  // Disponibilidad
  AVAILABILITY: `${API_VERSION}/resources/availability`,
  AVAILABILITY_BY_ID: (id: string) =>
    `${API_VERSION}/resources/${id}/availability`,

  // Atributos
  ATTRIBUTES: `${API_VERSION}/resources/attributes`,
  EQUIPMENT: `${API_VERSION}/resources/equipment`,
} as const;

/**
 * Endpoints de Disponibilidad y Reservas (Availability Service - Puerto 3003)
 */
export const AVAILABILITY_ENDPOINTS = {
  // CRUD de Reservas
  BASE: `${API_VERSION}/reservations`,
  RESERVATIONS: `${API_VERSION}/reservations`,
  RESERVATION_BY_ID: (id: string) => `${API_VERSION}/reservations/${id}`,

  // Calendario
  CALENDAR: `${API_VERSION}/calendar`,
  CALENDAR_BY_RESOURCE: (resourceId: string) =>
    `${API_VERSION}/calendar/${resourceId}`,

  // Disponibilidad
  AVAILABILITIES: `${API_VERSION}/availabilities`,

  // Conflictos y Validación
  CHECK_CONFLICTS: `${API_VERSION}/availabilities/conflicts`,
  CHECK_AVAILABILITY: `${API_VERSION}/availabilities/check`,

  // Reservas Recurrentes
  RECURRING: `${API_VERSION}/reservations/recurring`,
  RECURRING_BY_ID: (id: string) =>
    `${API_VERSION}/reservations/recurring/${id}`,

  // Espera y Reasignación
  WAITLIST: `${API_VERSION}/waiting-lists`,
  WAITLIST_BY_ID: (id: string) => `${API_VERSION}/waiting-lists/${id}`,
  REASSIGNMENT: `${API_VERSION}/reassignments`,
  REASSIGNMENT_BY_ID: (id: string) => `${API_VERSION}/reassignments/${id}`,

  // Horarios
  SCHEDULES: `${API_VERSION}/schedules`,
  SCHEDULE_BY_ID: (id: string) => `${API_VERSION}/schedules/${id}`,

  // Integración de Calendarios
  CALENDAR_INTEGRATION: `${API_VERSION}/calendar-integration`,
  SYNC_CALENDAR: (integrationId: string) =>
    `${API_VERSION}/calendar-integration/${integrationId}/sync`,
} as const;

/**
 * Endpoints de Aprobaciones y Notificaciones (Stockpile Service - Puerto 3004)
 */
export const STOCKPILE_ENDPOINTS = {
  // Flujos de Aprobación
  BASE: `${API_VERSION}/approval-flows`,
  APPROVAL_FLOWS: `${API_VERSION}/approval-flows`,
  APPROVAL_FLOW_BY_ID: (id: string) => `${API_VERSION}/approval-flows/${id}`,

  // Solicitudes de Aprobación
  APPROVAL_REQUESTS: `${API_VERSION}/approval-requests`,
  APPROVAL_REQUEST_BY_ID: (id: string) =>
    `${API_VERSION}/approval-requests/${id}`,
  APPROVE: (id: string) => `${API_VERSION}/approval-requests/${id}/approve`,
  REJECT: (id: string) => `${API_VERSION}/approval-requests/${id}/reject`,
  CANCEL: (id: string) => `${API_VERSION}/approval-requests/${id}/cancel`,
  ACTIVE_TODAY: `${API_VERSION}/approval-requests/active-today`,
  STATISTICS: `${API_VERSION}/approval-requests/statistics`,

  // Plantillas de Documentos
  DOCUMENT_TEMPLATES: `${API_VERSION}/document-templates`,
  DOCUMENT_TEMPLATE_BY_ID: (id: string) =>
    `${API_VERSION}/document-templates/${id}`,

  // Documentos Generados
  DOCUMENTS: `${API_VERSION}/documents`,
  DOCUMENT_BY_ID: (id: string) => `${API_VERSION}/documents/${id}`,
  DOWNLOAD_DOCUMENT: (id: string) => `${API_VERSION}/documents/${id}/download`,

  // Notificaciones
  NOTIFICATIONS: `${API_VERSION}/notifications`,
  NOTIFICATION_BY_ID: (id: string) => `${API_VERSION}/notifications/${id}`,
  MARK_AS_READ: (id: string) => `${API_VERSION}/notifications/${id}/read`,
  MARK_ALL_AS_READ: `${API_VERSION}/notifications/read-all`,

  // Plantillas de Notificaciones
  NOTIFICATION_TEMPLATES: `${API_VERSION}/notification-templates`,
  NOTIFICATION_TEMPLATE_BY_ID: (id: string) =>
    `${API_VERSION}/notification-templates/${id}`,

  // Check-in/Check-out
  CHECKIN: `${API_VERSION}/check-in-out/check-in`,
  CHECKOUT: `${API_VERSION}/check-in-out/check-out`,
  CHECK_IN_BY_ID: (id: string) => `${API_VERSION}/check-in-out/${id}`,
  CHECK_IN_BY_RESERVATION: (reservationId: string) =>
    `${API_VERSION}/check-in-out/reservation/${reservationId}`,
  MY_CHECKIN_HISTORY: `${API_VERSION}/check-in-out/user/me`,
  ACTIVE_CHECKINS: `${API_VERSION}/check-in-out/active/all`,
  OVERDUE_CHECKINS: `${API_VERSION}/check-in-out/overdue/all`,
} as const;

/**
 * Endpoints de Reportes y Análisis (Reports Service - Puerto 3005)
 */
export const REPORTS_ENDPOINTS = {
  // Dashboard (routed via reports service)
  BASE: `${API_VERSION}/usage-reports`,
  DASHBOARD: `${API_VERSION}/reports/dashboard`,
  DASHBOARD_ADMIN: `${API_VERSION}/reports/dashboard?scope=admin`,
  DASHBOARD_USER: `${API_VERSION}/reports/dashboard?scope=user`,

  // Reportes de Uso (BE controller: "usage-reports")
  USAGE: `${API_VERSION}/usage-reports`,
  USAGE_BY_RESOURCE: (resourceId: string) =>
    `${API_VERSION}/usage-reports?resourceId=${resourceId}`,
  USAGE_BY_USER: (userId: string) =>
    `${API_VERSION}/usage-reports?userId=${userId}`,
  USAGE_BY_PROGRAM: (programId: string) =>
    `${API_VERSION}/usage-reports?programId=${programId}`,

  // Estadísticas (via usage-reports generate)
  STATISTICS: `${API_VERSION}/usage-reports/generate`,
  STATISTICS_SUMMARY: `${API_VERSION}/usage-reports/generate?type=summary`,
  STATISTICS_TRENDS: `${API_VERSION}/usage-reports/generate?type=trends`,

  // Exportación (BE controller: "reports/export")
  EXPORT: `${API_VERSION}/reports/export`,
  EXPORT_CSV: `${API_VERSION}/reports/export`,
  EXPORT_PDF: `${API_VERSION}/reports/export`,
  EXPORT_EXCEL: `${API_VERSION}/reports/export`,

  // Demanda Insatisfecha (BE controller: "demand-reports")
  UNSATISFIED_DEMAND: `${API_VERSION}/demand-reports`,

  // Feedback y Evaluaciones (BE controllers: "feedback", "evaluation")
  FEEDBACK: `${API_VERSION}/feedback`,
  FEEDBACK_BY_ID: (id: string) => `${API_VERSION}/feedback/${id}`,
  EVALUATIONS: `${API_VERSION}/evaluations`,
  EVALUATION_BY_ID: (id: string) => `${API_VERSION}/evaluations/${id}`,

  // Categorías (compartido con Resources)
  CATEGORIES: `${API_VERSION}/categories`,
  CATEGORY_BY_ID: (id: string) => `${API_VERSION}/categories/${id}`,
} as const;

/**
 * Endpoints de Auditoría (Auth Service - Puerto 3001)
 */
export const AUDIT_ENDPOINTS = {
  LOGS: `${API_VERSION}/audit/logs`,
  LOG_BY_ID: (id: string) => `${API_VERSION}/audit/logs/${id}`,
  EXPORT: `${API_VERSION}/audit/export`,
} as const;

/**
 * Endpoints de Sistema y Health Checks
 */
export const SYSTEM_ENDPOINTS = {
  HEALTH: `${API_VERSION}/health`,
  HEALTH_AGGREGATED: `${API_VERSION}/health/aggregated`,
  VERSION: `${API_VERSION}/version`,
} as const;

/**
 * Helper: Construir URL con query params
 *
 * @example
 * buildUrl(RESOURCES_ENDPOINTS.BASE, { page: 1, limit: 20, search: 'sala' })
 * // => '/api/v1/resources?page=1&limit=20&search=sala'
 */
export function buildUrl(
  endpoint: string,
  params?: Record<string, unknown>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const queryString = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

/**
 * Helper: Obtener servicio desde endpoint
 * Útil para debugging y logging
 */
export function getServiceFromEndpoint(endpoint: string): string {
  // Auth Service (incluye auditoría)
  if (
    endpoint.includes("/auth") ||
    endpoint.includes("/users") ||
    endpoint.includes("/audit")
  )
    return "AUTH";

  // Resources Service
  if (
    endpoint.includes("/resources") ||
    endpoint.includes("/categories") ||
    endpoint.includes("/programs")
  )
    return "RESOURCES";

  // Availability Service
  if (
    endpoint.includes("/reservations") ||
    endpoint.includes("/availabilities") ||
    endpoint.includes("/waiting-lists") ||
    endpoint.includes("/calendar") ||
    endpoint.includes("/schedules")
  )
    return "AVAILABILITY";

  // Stockpile Service
  if (
    endpoint.includes("/approval") ||
    endpoint.includes("/check-in-out") ||
    endpoint.includes("/documents") ||
    endpoint.includes("/notifications")
  )
    return "STOCKPILE";

  // Reports Service
  if (endpoint.includes("/reports") || endpoint.includes("/feedback"))
    return "REPORTS";

  if (endpoint.includes("/health")) return "SYSTEM";

  return "UNKNOWN";
}
