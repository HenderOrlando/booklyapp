import { CreateReferenceDataDto } from "@libs/database";

/**
 * Seed data de referencia para el dominio de Aprobaciones y Flujos de Trabajo.
 */

export const STOCKPILE_REFERENCE_DATA: CreateReferenceDataDto[] = [
  // ─── approval_status ───
  { group: "approval_status", code: "PENDING", name: "Pendiente", color: "#FFC107", icon: "clock", order: 0, isDefault: true, createdBy: "system" },
  { group: "approval_status", code: "APPROVED", name: "Aprobado", color: "#4CAF50", icon: "check", order: 1, createdBy: "system" },
  { group: "approval_status", code: "REJECTED", name: "Rechazado", color: "#F44336", icon: "x", order: 2, createdBy: "system" },
  { group: "approval_status", code: "CANCELLED", name: "Cancelado", color: "#9E9E9E", icon: "slash", order: 3, createdBy: "system" },

  // ─── approval_request_status ───
  { group: "approval_request_status", code: "PENDING", name: "Pendiente", color: "#FFC107", icon: "clock", order: 0, isDefault: true, createdBy: "system" },
  { group: "approval_request_status", code: "IN_REVIEW", name: "En Revisión", color: "#2196F3", icon: "eye", order: 1, createdBy: "system" },
  { group: "approval_request_status", code: "APPROVED", name: "Aprobado", color: "#4CAF50", icon: "check-circle", order: 2, createdBy: "system" },
  { group: "approval_request_status", code: "REJECTED", name: "Rechazado", color: "#F44336", icon: "x-circle", order: 3, createdBy: "system" },
  { group: "approval_request_status", code: "CANCELLED", name: "Cancelado", color: "#9E9E9E", icon: "slash", order: 4, createdBy: "system" },

  // ─── check_in_status ───
  { group: "check_in_status", code: "NOT_CHECKED_IN", name: "Sin Check-in", color: "#9E9E9E", order: 0, isDefault: true, createdBy: "system" },
  { group: "check_in_status", code: "CHECKED_IN", name: "Check-in", color: "#4CAF50", order: 1, createdBy: "system" },
  { group: "check_in_status", code: "CHECKED_OUT", name: "Check-out", color: "#607D8B", order: 2, createdBy: "system" },
  { group: "check_in_status", code: "LATE", name: "Tarde", color: "#FF9800", order: 3, createdBy: "system" },
  { group: "check_in_status", code: "NO_SHOW", name: "No Asistió", color: "#F44336", order: 4, createdBy: "system" },

  // ─── check_in_out_type ───
  { group: "check_in_out_type", code: "AUTOMATIC", name: "Automático (QR, RFID)", order: 0, createdBy: "system" },
  { group: "check_in_out_type", code: "MANUAL", name: "Manual por Staff", order: 1, createdBy: "system" },
  { group: "check_in_out_type", code: "SELF_SERVICE", name: "Self-service", order: 2, isDefault: true, createdBy: "system" },

  // ─── notification_channel ───
  { group: "notification_channel", code: "EMAIL", name: "Correo Electrónico", icon: "mail", order: 0, isDefault: true, createdBy: "system" },
  { group: "notification_channel", code: "WHATSAPP", name: "WhatsApp", icon: "message-circle", order: 1, createdBy: "system" },
  { group: "notification_channel", code: "SMS", name: "SMS", icon: "smartphone", order: 2, createdBy: "system" },
  { group: "notification_channel", code: "PUSH", name: "Push Notification", icon: "bell", order: 3, createdBy: "system" },
  { group: "notification_channel", code: "IN_APP", name: "In-App", icon: "inbox", order: 4, createdBy: "system" },

  // ─── notification_status ───
  { group: "notification_status", code: "PENDING", name: "Pendiente", color: "#FFC107", order: 0, isDefault: true, createdBy: "system" },
  { group: "notification_status", code: "SENT", name: "Enviado", color: "#4CAF50", order: 1, createdBy: "system" },
  { group: "notification_status", code: "FAILED", name: "Fallido", color: "#F44336", order: 2, createdBy: "system" },
  { group: "notification_status", code: "READ", name: "Leído", color: "#607D8B", order: 3, createdBy: "system" },

  // ─── document_template_type ───
  { group: "document_template_type", code: "APPROVAL", name: "Aprobación", order: 0, createdBy: "system" },
  { group: "document_template_type", code: "REJECTION", name: "Rechazo", order: 1, createdBy: "system" },
  { group: "document_template_type", code: "CERTIFICATE", name: "Certificado", order: 2, createdBy: "system" },
  { group: "document_template_type", code: "NOTIFICATION", name: "Notificación", order: 3, createdBy: "system" },

  // ─── reminder_type ───
  { group: "reminder_type", code: "APPROVAL_PENDING", name: "Aprobación Pendiente", order: 0, createdBy: "system" },
  { group: "reminder_type", code: "DEADLINE_APPROACHING", name: "Fecha Límite Próxima", order: 1, createdBy: "system" },
  { group: "reminder_type", code: "CHECK_OUT_REMINDER", name: "Recordatorio de Devolución", order: 2, createdBy: "system" },
  { group: "reminder_type", code: "OVERDUE", name: "Recurso no Devuelto", order: 3, createdBy: "system" },
  { group: "reminder_type", code: "DOCUMENT_READY", name: "Documento Listo", order: 4, createdBy: "system" },
];
