/**
 * Common Constants for Bookly Mock
 */

export * from "./seed-ids";

export const API_VERSION = "v1";
export const API_PREFIX = "api";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

export const JWT_SECRET =
  process.env.JWT_SECRET || "bookly-secret-key-change-in-production";
export const JWT_EXPIRATION = "1d";
export const JWT_REFRESH_EXPIRATION = "7d";

export const CACHE_TTL = 3600; // 1 hour in seconds
export const SESSION_TTL = 86400; // 24 hours in seconds

export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCKOUT_DURATION = 900; // 15 minutes in seconds

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 128;

export const MIN_RESERVATION_DURATION = 30; // 30 minutes
export const MAX_RESERVATION_DURATION = 480; // 8 hours
export const MIN_ADVANCE_BOOKING = 60; // 1 hour
export const MAX_ADVANCE_BOOKING = 43200; // 30 days

export const DEFAULT_BUSINESS_HOURS = {
  start: "06:00",
  end: "22:00",
};

export const WORKING_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export const KAFKA_TOPICS = {
  AUTH_EVENTS: "auth.events",
  RESOURCES_EVENTS: "resources.events",
  AVAILABILITY_EVENTS: "availability.events",
  STOCKPILE_EVENTS: "stockpile.events",
  REPORTS_EVENTS: "reports.events",
};

export const REDIS_PREFIXES = {
  SESSION: "session:",
  CACHE: "cache:",
  LOCK: "lock:",
  RATE_LIMIT: "rate_limit:",
  TOKEN_BLACKLIST: "token_blacklist:",
  PASSWORD_RESET: "password_reset:",
};

export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: "AUTH_001",
  AUTH_TOKEN_EXPIRED: "AUTH_002",
  AUTH_TOKEN_INVALID: "AUTH_003",
  AUTH_ACCOUNT_LOCKED: "AUTH_004",
  AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_005",

  // Resource errors
  RESOURCE_NOT_FOUND: "RSC_001",
  RESOURCE_UNAVAILABLE: "RSC_002",
  RESOURCE_IN_MAINTENANCE: "RSC_003",
  RESOURCE_ALREADY_EXISTS: "RSC_004",

  // Reservation errors
  RESERVATION_CONFLICT: "RSV_001",
  RESERVATION_NOT_FOUND: "RSV_002",
  RESERVATION_CANCELLED: "RSV_003",
  RESERVATION_INVALID_TIME: "RSV_004",
  RESERVATION_APPROVAL_REQUIRED: "RSV_005",

  // Approval errors
  APPROVAL_NOT_FOUND: "APR_001",
  APPROVAL_ALREADY_PROCESSED: "APR_002",
  APPROVAL_UNAUTHORIZED: "APR_003",

  // Validation errors
  VALIDATION_FAILED: "VAL_001",
  INVALID_INPUT: "VAL_002",
  REQUIRED_FIELD_MISSING: "VAL_003",

  // System errors
  INTERNAL_ERROR: "SYS_001",
  DATABASE_ERROR: "SYS_002",
  NETWORK_ERROR: "SYS_003",
  SERVICE_UNAVAILABLE: "SYS_004",
};

export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PASSWORD_CHANGED: "Password changed successfully",

  RESOURCE_CREATED: "Resource created successfully",
  RESOURCE_UPDATED: "Resource updated successfully",
  RESOURCE_DELETED: "Resource deleted successfully",

  RESERVATION_CREATED: "Reservation created successfully",
  RESERVATION_UPDATED: "Reservation updated successfully",
  RESERVATION_CANCELLED: "Reservation cancelled successfully",
  RESERVATION_APPROVED: "Reservation approved successfully",

  APPROVAL_PROCESSED: "Approval processed successfully",

  REPORT_GENERATED: "Report generated successfully",
  EXPORT_COMPLETED: "Export completed successfully",
};

export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIMETYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
};

export const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,
  },
  SEARCH: {
    windowMs: 60 * 1000, // 1 minute
    max: 30,
  },
};

export const NOTIFICATION_TEMPLATES = {
  RESERVATION_CREATED: "reservation_created",
  RESERVATION_APPROVED: "reservation_approved",
  RESERVATION_REJECTED: "reservation_rejected",
  RESERVATION_REMINDER: "reservation_reminder",
  RESERVATION_CANCELLED: "reservation_cancelled",
  APPROVAL_REQUEST: "approval_request",
  MAINTENANCE_SCHEDULED: "maintenance_scheduled",
};

export const DEFAULT_ROLES = {
  STUDENT: {
    name: "Student",
    code: "STUDENT",
    permissions: ["reservation:create", "reservation:view", "resource:view"],
  },
  TEACHER: {
    name: "Teacher",
    code: "TEACHER",
    permissions: [
      "reservation:create",
      "reservation:view",
      "reservation:approve",
      "resource:view",
      "report:view",
    ],
  },
  PROGRAM_ADMIN: {
    name: "Program Administrator",
    code: "PROGRAM_ADMIN",
    permissions: [
      "reservation:*",
      "resource:*",
      "approval:*",
      "report:*",
      "user:view",
    ],
  },
  GENERAL_ADMIN: {
    name: "General Administrator",
    code: "GENERAL_ADMIN",
    permissions: ["*:*"],
  },
  SECURITY: {
    name: "Security",
    code: "SECURITY",
    permissions: [
      "reservation:view",
      "reservation:checkin",
      "reservation:checkout",
    ],
  },
  ADMINISTRATIVE_STAFF: {
    name: "Administrative Staff",
    code: "ADMINISTRATIVE_STAFF",
    permissions: ["reservation:view", "resource:view", "report:view"],
  },
};

export const ACADEMIC_PROGRAMS = [
  { code: "ING-SIS", name: "Ingeniería de Sistemas" },
  { code: "ING-IND", name: "Ingeniería Industrial" },
  { code: "ING-CIV", name: "Ingeniería Civil" },
  { code: "ING-ELE", name: "Ingeniería Electrónica" },
  { code: "MED-GEN", name: "Medicina General" },
  { code: "DER-GEN", name: "Derecho" },
  { code: "ADM-EMP", name: "Administración de Empresas" },
  { code: "CON-PUB", name: "Contaduría Pública" },
];

export const DEFAULT_CATEGORIES = {
  RESOURCE_TYPES: [
    { code: "CLASSROOM", name: "Salón de Clase", color: "#3B82F6" },
    { code: "LABORATORY", name: "Laboratorio", color: "#8B5CF6" },
    { code: "AUDITORIUM", name: "Auditorio", color: "#EF4444" },
    {
      code: "MULTIMEDIA_EQUIPMENT",
      name: "Equipo Multimedia",
      color: "#F59E0B",
    },
  ],
  MAINTENANCE_TYPES: [
    { code: "PREVENTIVE", name: "Preventivo", color: "#10B981" },
    { code: "CORRECTIVE", name: "Correctivo", color: "#F59E0B" },
    { code: "EMERGENCY", name: "Emergencia", color: "#EF4444" },
    { code: "CLEANING", name: "Limpieza", color: "#6366F1" },
  ],
};

/**
 * Constantes de colores para el calendario
 * Basado en Material Design color palette
 */
export const CALENDAR_COLORS = {
  AVAILABLE: "#4CAF50", // Verde - Slots disponibles para reserva
  RESERVED: "#F44336", // Rojo - Slots ya reservados
  PENDING: "#FFC107", // Amarillo - Reservas pendientes de aprobación
  BLOCKED: "#9E9E9E", // Gris - Slots bloqueados o en mantenimiento
  OWN_RESERVATION: "#2196F3", // Azul - Reservas del usuario actual
} as const;

/**
 * Tipo de estado de slot con su color correspondiente
 */
export type ColorMapping = typeof CALENDAR_COLORS;
