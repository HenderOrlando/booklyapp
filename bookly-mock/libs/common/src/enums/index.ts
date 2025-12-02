/**
 * Common Enums for Bookly Mock
 */

export enum UserRole {
  STUDENT = "STUDENT", // Estudiante
  TEACHER = "TEACHER", // Profesor
  GENERAL_ADMIN = "GENERAL_ADMIN", // Admin General
  PROGRAM_ADMIN = "PROGRAM_ADMIN", // Admin de Programa
  SECURITY = "SECURITY", // Seguridad
  ADMINISTRATIVE_STAFF = "ADMINISTRATIVE_STAFF", // Personal Administrativo
}

export enum ResourceStatus {
  AVAILABLE = "AVAILABLE", // Disponible
  RESERVED = "RESERVED", // Reservado
  MAINTENANCE = "MAINTENANCE", // Mantenimiento
  UNAVAILABLE = "UNAVAILABLE", // No disponible
}

export enum ResourceType {
  CLASSROOM = "CLASSROOM", // Aula
  LABORATORY = "LABORATORY", // Laboratorio
  AUDITORIUM = "AUDITORIUM", // Auditorio
  MULTIMEDIA_EQUIPMENT = "MULTIMEDIA_EQUIPMENT", // Equipo Multimedial
  SPORTS_FACILITY = "SPORTS_FACILITY", // Instalación Deportiva
  MEETING_ROOM = "MEETING_ROOM", // Salón de Reuniones
}

export enum MaintenanceType {
  PREVENTIVE = "PREVENTIVE", // Preventivo
  CORRECTIVE = "CORRECTIVE", // Correctivo
  EMERGENCY = "EMERGENCY", // Emergencia
  CLEANING = "CLEANING", // Limpieza
  UPGRADE = "UPGRADE", // Actualización
  INSPECTION = "INSPECTION", // Inspección
}

export enum MaintenanceStatus {
  SCHEDULED = "SCHEDULED", // Programado
  IN_PROGRESS = "IN_PROGRESS", // En Proceso
  COMPLETED = "COMPLETED", // Completado
  CANCELLED = "CANCELLED", // Cancelado
}

export enum ReservationStatus {
  PENDING = "PENDING", // Pendiente
  CONFIRMED = "CONFIRMED", // Confirmado
  APPROVED = "APPROVED", // Aprobado
  REJECTED = "REJECTED", // Rechazado
  CHECKED_IN = "CHECKED_IN", // Recibido
  ACTIVE = "ACTIVE", // Activo
  COMPLETED = "COMPLETED", // Completado
  CANCELLED = "CANCELLED", // Cancelado
}

export enum ApprovalStatus {
  PENDING = "PENDING", // Pendiente
  APPROVED = "APPROVED", // Aprobado
  REJECTED = "REJECTED", // Rechazado
  CANCELLED = "CANCELLED", // Cancelado
}

export enum ApprovalRequestStatus {
  PENDING = "PENDING", // Pendiente
  IN_REVIEW = "IN_REVIEW", // En Revisión
  APPROVED = "APPROVED", // Aprobado
  REJECTED = "REJECTED", // Rechazado
  CANCELLED = "CANCELLED", // Cancelado
}

export enum ApprovalHistoryDecision {
  APPROVED = "APPROVED", // Aprobado
  REJECTED = "REJECTED", // Rechazado
}

export enum NotificationChannel {
  EMAIL = "EMAIL", // Email
  WHATSAPP = "WHATSAPP", // Whatsapp
  SMS = "SMS", // SMS
  PUSH = "PUSH", // Push
  IN_APP = "IN_APP", // In-App
}

export enum NotificationStatus {
  PENDING = "PENDING", // Pendiente
  SENT = "SENT", // Enviado
  FAILED = "FAILED", // Fallido
  READ = "READ", // Leído
}

export enum NotificationType {
  APPROVAL = "APPROVAL", // Aprobación
  REJECTION = "REJECTION", // Rechazo
  PENDING_APPROVAL = "PENDING_APPROVAL", // Pendiente de Aprobación
  REMINDER = "REMINDER", // Recordatorio
  CANCELLATION = "CANCELLATION", // Cancelación
  MODIFICATION = "MODIFICATION", // Modificación
  OTHER = "OTHER", // Otro
}

export enum NotificationPriority {
  LOW = "LOW", // Bajo
  NORMAL = "NORMAL", // Normal
  HIGH = "HIGH", // Alto
  URGENT = "URGENT", // Urgente
}

export enum NotificationEventType {
  SEND_EMAIL = "notification.send.email",
  SEND_SMS = "notification.send.sms",
  SEND_WHATSAPP = "notification.send.whatsapp",
  SEND_PUSH = "notification.send.push",
  NOTIFICATION_SENT = "notification.sent",
  NOTIFICATION_FAILED = "notification.failed",
  NOTIFICATION_DELIVERED = "notification.delivered",
}

export enum EventType {
  // API Gateway events
  API_GATEWAY_REQUEST_REPLY = "api-gateway.replies",
  API_GATEWAY_GROUP = "api-gateway-consumer",

  // Auth events
  USER_REGISTERED = "user.registered",
  USER_LOGGED_IN = "user.logged_in",
  USER_LOGGED_OUT = "user.logged_out",
  PASSWORD_CHANGED = "password.changed",
  PASSWORD_RESET_REQUESTED = "password.reset.requested",
  ROLE_ASSIGNED = "role.assigned",
  PERMISSION_GRANTED = "permission.granted",
  TWO_FACTOR_ENABLED = "two_factor.enabled",
  TWO_FACTOR_DISABLED = "two_factor.disabled",
  TWO_FACTOR_VERIFICATION_FAILED = "two_factor.verification.failed",

  // Resource events
  RESOURCE_CREATED = "resource.created",
  RESOURCE_UPDATED = "resource.updated",
  RESOURCE_DELETED = "resource.deleted",
  RESOURCE_RESTORED = "resource.restored",
  RESOURCE_CATEGORY_CHANGED = "resource.category.changed",
  RESOURCE_STATUS_CHANGED = "resource.status.changed",
  RESOURCE_AVAILABILITY_CHANGED = "resource.availability.changed",
  RESOURCE_MAINTENANCE_SCHEDULED = "resource.maintenance.scheduled",
  RESOURCE_MAINTENANCE_COMPLETED = "resource.maintenance.completed",
  MAINTENANCE_SCHEDULED = "maintenance.scheduled",
  MAINTENANCE_COMPLETED = "maintenance.completed",
  CATEGORY_CREATED = "category.created",
  CATEGORY_UPDATED = "category.updated",

  // Reservation events
  RESERVATION_CREATED = "reservation.created",
  RESERVATION_UPDATED = "reservation.updated",
  RESERVATION_CANCELLED = "reservation.cancelled",
  RESERVATION_APPROVED = "reservation.approved",
  RESERVATION_REJECTED = "reservation.rejected",
  RESERVATION_COMPLETED = "reservation.completed",
  RESERVATION_CONFIRMED = "reservation.confirmed",
  WAITING_LIST_ADDED = "waiting_list.added",
  WAITING_LIST_NOTIFIED = "waiting_list.notified",
  SCHEDULE_CONFLICT_DETECTED = "schedule.conflict.detected",

  // Stockpile events
  CHECK_IN = "check-in",
  CHECK_OUT = "check-out",
  CHECK_OUT_OVERDUE = "check-out.overdue",
  CHECK_OUT_COMPLETED = "check-out.completed",
  CHECK_IN_COMPLETED = "check-in.completed",

  // Availability events
  AVAILABILITY_RULES_UPDATED = "availability.rules.updated",
  AVAILABILITY_SERVICE_RULES_GROUP = "availability-service.rules.sync",
  AVAILABILITY_SERVICE_RULES = "bookly.resources.availability-rules",
  AVAILABILITY_SERVICE_RESOURCE_STATUS_GROUP = "availability-service.resource.status.sync",

  // Recurring events
  RECURRING_SERIES_CREATED = "recurring.series.created",
  RECURRING_SERIES_CANCELLED = "recurring.series.cancelled",
  RECURRING_INSTANCE_MODIFIED = "recurring.instance.modified",
  RECURRING_SERIES_UPDATED = "recurring.series.updated",
  RECURRING_INSTANCE_CANCELLED = "recurring.instance.cancelled",

  // Approval events
  APPROVAL_REQUEST_CREATED = "approval_request.created",
  APPROVAL_REQUEST_APPROVED = "approval_request.approved",
  APPROVAL_REQUEST_REJECTED = "approval_request.rejected",
  APPROVAL_REQUESTED = "approval.requested",
  APPROVAL_GRANTED = "approval.granted",
  APPROVAL_REJECTED = "approval.rejected",
  DOCUMENT_GENERATED = "document.generated",

  // Notification events
  NOTIFICATION_SENT = "notification.sent",
  NOTIFICATION_FAILED = "notification.failed",

  // Audit events
  AUDIT_LOG_CREATED = "audit.log.created",
  AUDIT_UNAUTHORIZED_ATTEMPT = "audit.unauthorized_attempt",
  AUDIT_GROUP = "reports-service-audit-group",

  // Reports events
  REPORT_GENERATED = "report.generated",
  FEEDBACK_SUBMITTED = "feedback.submitted",
  DASHBOARD_UPDATED = "dashboard.updated",

  // User events
  USER_CREATED = "user.created",
  USER_UPDATED = "user.updated",
  USER_DELETED = "user.deleted",

  // Stockpile events
  STOCKPILE_GROUP = "stockpile-group",
}

export enum CategoryType {
  RESOURCE_TYPE = "RESOURCE_TYPE", // Recurso
  MAINTENANCE_TYPE = "MAINTENANCE_TYPE", // Mantenimiento
  APPROVAL_STATUS = "APPROVAL_STATUS", // Estado de Aprobación
  ROLE = "ROLE", // Rol
}

export enum ServiceName {
  AUTH = "AUTH", // Autenticación
  RESOURCES = "RESOURCES", // Recursos
  AVAILABILITY = "AVAILABILITY", // Disponibilidad
  STOCKPILE = "STOCKPILE", // Stockpile
  REPORTS = "REPORTS", // Informes
  GATEWAY = "GATEWAY", // Gateway
}

export enum WeekDay {
  MONDAY = "MONDAY", // Lunes
  TUESDAY = "TUESDAY", // Martes
  WEDNESDAY = "WEDNESDAY", // Miércoles
  THURSDAY = "THURSDAY", // Jueves
  FRIDAY = "FRIDAY", // Viernes
  SATURDAY = "SATURDAY", // Sábado
  SUNDAY = "SUNDAY", // Domingo
}

export enum RecurrenceType {
  NONE = "NONE", // Ninguno
  DAILY = "DAILY", // Diario
  WEEKLY = "WEEKLY", // Semanal
  MONTHLY = "MONTHLY", // Mensual
}

export enum ConflictResolutionStrategy {
  REJECT = "REJECT", // Rechazar
  WAITING_LIST = "WAITING_LIST", // Lista de Espera
  AUTO_REASSIGN = "AUTO_REASSIGN", // Reasignación Automática
  MANUAL_REVIEW = "MANUAL_REVIEW", // Revisión Manual
}

export enum ExportFormat {
  CSV = "CSV", // CSV
  EXCEL = "EXCEL", // Excel
  PDF = "PDF", // PDF
  JSON = "JSON", // JSON
}

export enum ReportType {
  USAGE_BY_RESOURCE = "USAGE_BY_RESOURCE", // Uso por Recurso
  USAGE_BY_USER = "USAGE_BY_USER", // Uso por Usuario
  USAGE_BY_PROGRAM = "USAGE_BY_PROGRAM", // Uso por Programa
  UNMET_DEMAND = "UNMET_DEMAND", // Demanda No Cumplida
  CONFLICTS = "CONFLICTS", // Conflicto
  COMPLIANCE = "COMPLIANCE", // Cumplimiento
}

export enum FeedbackType {
  POSITIVE = "POSITIVE", // Positivo
  NEGATIVE = "NEGATIVE", // Negativo
  SUGGESTION = "SUGGESTION", // Sugerencia
  COMPLAINT = "COMPLAINT", // Queja
}

export enum CheckInStatus {
  NOT_CHECKED_IN = "NOT_CHECKED_IN", // No Check-in
  CHECKED_IN = "CHECKED_IN", // Check-in
  CHECKED_OUT = "CHECKED_OUT", // Check-out
  LATE = "LATE", // Tarde
  NO_SHOW = "NO_SHOW", // No Asistió
}

export enum CheckInOutStatus {
  CHECKED_IN = "CHECKED_IN", // Usuario recibe el recurso a tiempo
  CHECKED_OUT = "CHECKED_OUT", // Usuario devuelve el recurso a tiempo
  LATE = "LATE", // Usuario recibe el recurso tarde
  OVERDUE = "OVERDUE", // Usuario devuelve el recurso tarde
  CANCELLED = "CANCELLED", // Cancelado
}

export enum CheckInOutType {
  AUTOMATIC = "AUTOMATIC", // Check-in/out automático (QR, RFID)
  MANUAL = "MANUAL", // Check-in/out manual por staff
  SELF_SERVICE = "SELF_SERVICE", // Self-service por usuario
}

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

export enum FeedbackSentiment {
  POSITIVE = "POSITIVE", // Positivo
  NEGATIVE = "NEGATIVE", // Negativo
  NEUTRAL = "NEUTRAL", // Neutral
}

export enum FeedbackStatus {
  PENDING = "PENDING", // Pendiente
  RESPONDED = "RESPONDED", // Respondido
  CLOSED = "CLOSED", // Cerrado
}

export enum FeedbackCategory {
  FACILITY = "FACILITY", // Instalaciones
  SERVICE = "SERVICE", // Servicio
  EQUIPMENT = "EQUIPMENT", // Equipamiento
  CLEANLINESS = "CLEANLINESS", // Limpieza
  AVAILABILITY = "AVAILABILITY", // Disponibilidad
  OTHER = "OTHER", // Otro
}

export enum PerformanceLevel {
  EXCELLENT = "EXCELLENT", // Excelente
  GOOD = "GOOD", // Bueno
  REGULAR = "REGULAR", // Regular
  POOR = "POOR", // Malo
}

export enum UsageStatisticType {
  RESOURCE = "RESOURCE", // Recurso
  USER = "USER", // Usuario
  PROGRAM = "PROGRAM", // Programa
}

export enum DocumentTemplateType {
  APPROVAL = "APPROVAL", // Aprobación
  REJECTION = "REJECTION", // Rechazo
  CERTIFICATE = "CERTIFICATE", // Certificado
  NOTIFICATION = "NOTIFICATION", // Notificación
}

export enum DocumentTemplateFormat {
  PDF = "PDF", // PDF
  HTML = "HTML", // HTML
  EMAIL = "EMAIL", // Email
}

export enum UnsatisfiedDemandReason {
  CONFLICT = "CONFLICT", // Conflicto
  UNAVAILABLE = "UNAVAILABLE", // No disponible
  CAPACITY = "CAPACITY", // Capacidad
  MAINTENANCE = "MAINTENANCE", // Mantenimiento
  OTHER = "OTHER", // Otro
}

export enum UnsatisfiedDemandPriority {
  LOW = "LOW", // Bajo
  NORMAL = "NORMAL", // Normal
  HIGH = "HIGH", // Alto
  URGENT = "URGENT", // Urgente
}

export enum UnsatisfiedDemandStatus {
  PENDING = "PENDING", // Pendiente
  RESOLVED = "RESOLVED", // Resuelto
  CANCELLED = "CANCELLED", // Cancelado
}

export enum AuditAction {
  CREATE = "CREATE", // Crear
  UPDATE = "UPDATE", // Actualizar
  DELETE = "DELETE", // Eliminar
  VIEW = "VIEW", // Ver
  ACCESS = "ACCESS", // Acceso
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS", // Acceso no autorizado
}

export enum AuditStatus {
  SUCCESS = "SUCCESS", // Exitoso
  FAILED = "FAILED", // Fallido
}

export enum AuditAlertType {
  SUSPICIOUS = "SUSPICIOUS", // sospechoso
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS", // Acceso no autorizado
  SUSPICIOUS_PATTERN = "SUSPICIOUS_PATTERN", // Patrón sospechoso
  SUSPICIOUS_LOGIN = "SUSPICIOUS_LOGIN", // Inicio de sesión sospechoso
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY", // Actividad sospechosa
  SUSPICIOUS_ACCESS = "SUSPICIOUS_ACCESS", // Acceso sospechoso
}

export enum AuditAlertSeverity {
  LOW = "LOW", // Bajo
  MEDIUM = "MEDIUM", // Medio
  HIGH = "HIGH", // Alto
  CRITICAL = "CRITICAL", // Crítico
}

export enum ApprovalAuditLogActionType {
  REQUEST_CREATED = "REQUEST_CREATED",
  STEP_APPROVED = "STEP_APPROVED",
  STEP_REJECTED = "STEP_REJECTED",
  REQUEST_APPROVED = "REQUEST_APPROVED",
  REQUEST_REJECTED = "REQUEST_REJECTED",
  REQUEST_CANCELLED = "REQUEST_CANCELLED",
  DOCUMENT_GENERATED = "DOCUMENT_GENERATED",
  NOTIFICATION_SENT = "APPROVAL_NOTIFICATION_SENT",
  FLOW_ASSIGNED = "FLOW_ASSIGNED",
  DEADLINE_EXTENDED = "DEADLINE_EXTENDED",
  COMMENT_ADDED = "COMMENT_ADDED",
}

export enum ImportResourceMode {
  CREATE = "CREATE", // Crear
  UPDATE = "UPDATE", // Actualizar
  UPSERT = "UPSERT", // Insertar o actualizar
}

export enum ImportJobStatus {
  PENDING = "PENDING", // Pendiente
  PROCESSING = "PROCESSING", // Procesando
  COMPLETED = "COMPLETED", // Completado
  FAILED = "FAILED", // Fallido
  ROLLED_BACK = "ROLLED_BACK", // Rollback
}

export enum SortOrder {
  ASC = "asc", // Ascendente
  DESC = "desc", // Descendente
}

export enum SortByField {
  SCORE = "score", // Puntuación
  CAPACITY = "capacity", // Capacidad
  AVAILABLE_FROM = "availableFrom", // Disponible desde
  RESOURCE_NAME = "resourceName", // Nombre del recurso
}

export enum ReminderType {
  APPROVAL_PENDING = "APPROVAL_PENDING", // Recordatorio de aprobación pendiente
  DEADLINE_APPROACHING = "DEADLINE_APPROACHING", // Fecha límite próxima
  CHECK_OUT_REMINDER = "CHECK_OUT_REMINDER", // Recordatorio de devolución
  OVERDUE = "OVERDUE", // Recurso no devuelto a tiempo
  DOCUMENT_READY = "DOCUMENT_READY", // Documento listo para recoger
}

export enum ReminderFrequency {
  ONCE = "ONCE", // Una sola vez
  DAILY = "DAILY", // Diario
  HOURLY = "HOURLY", // Por hora
  CUSTOM = "CUSTOM", // Personalizado (cron)
}

export enum CalendarViewType {
  MONTH = "month",
  WEEK = "week",
  DAY = "day",
}

export enum SlotStatus {
  AVAILABLE = "available",
  RESERVED = "reserved",
  PENDING = "pending",
  BLOCKED = "blocked",
  OWN_RESERVATION = "own_reservation",
}

export enum ExceptionReason {
  HOLIDAY = "HOLIDAY", // Día festivo
  MAINTENANCE = "MAINTENANCE", // Mantenimiento programado
  INSTITUTIONAL_EVENT = "INSTITUTIONAL_EVENT", // Evento institucional
  TEMPORARY_CLOSURE = "TEMPORARY_CLOSURE", // Cierre temporal
  CUSTOM = "CUSTOM", // Motivo personalizado
}

export enum ReassignmentReason {
  MAINTENANCE = "MAINTENANCE", // Mantenimiento programado
  UNAVAILABLE = "UNAVAILABLE", // No disponible
  OVERBOOKING = "OVERBOOKING", // Sobrecarga
  USER_REQUEST = "USER_REQUEST", // Solicitud del usuario
  DAMAGE = "DAMAGE", // Daño
  OTHER = "OTHER", // Otro
}

export enum ReportsExportStatus {
  PENDING = "PENDING", // Pendiente
  PROCESSING = "PROCESSING", // Procesando
  COMPLETED = "COMPLETED", // Completado
  FAILED = "FAILED", // Fallido
}

export enum ReportsExportFormat {
  CSV = "CSV", // CSV
  EXCEL = "EXCEL", // Excel
  PDF = "PDF", // PDF
}

export enum ReportTrendPeriod {
  DAILY = "DAILY", // Diario
  WEEKLY = "WEEKLY", // Semanal
  MONTHLY = "MONTHLY", // Mensual
}

export enum ReportTrendType {
  INCREASING = "INCREASING", // Aumento
  DECREASING = "DECREASING", // Disminución
  STABLE = "STABLE", // Estable
}

export enum ReportMetricType {
  OVERVIEW = "OVERVIEW", // Vista general
  OCCUPANCY = "OCCUPANCY", // Ocupación
  TRENDS = "TRENDS", // Tendencias
  COMPARISON = "COMPARISON", // Comparación
}

export enum ReportDataType {
  USAGE = "USAGE", // Uso
  DEMAND = "DEMAND", // Demanda
  USER = "USER", // Usuario
  FEEDBACK = "FEEDBACK", // Feedback
  EVALUATION = "EVALUATION", // Evaluación
}

export enum AuditMetadataSource {
  HTTP = "http",
  WEBSOCKET = "websocket",
  EVENT = "event",
}

export enum ResponseContextType {
  HTTP = "http",
  WEBSOCKET = "websocket",
  EVENT = "event",
  RPC = "rpc",
}

export enum ResponseContextPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}
