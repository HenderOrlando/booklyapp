import { CreateReferenceDataDto } from "@libs/database";

/**
 * Seed data de referencia para el dominio de Disponibilidad y Reservas.
 */

export const AVAILABILITY_REFERENCE_DATA: CreateReferenceDataDto[] = [
  // ─── reservation_status ───
  { group: "reservation_status", code: "PENDING", name: "Pendiente", color: "#FFC107", icon: "clock", order: 0, isDefault: true, createdBy: "system" },
  { group: "reservation_status", code: "CONFIRMED", name: "Confirmado", color: "#2196F3", icon: "check-circle", order: 1, createdBy: "system" },
  { group: "reservation_status", code: "APPROVED", name: "Aprobado", color: "#4CAF50", icon: "thumbs-up", order: 2, createdBy: "system" },
  { group: "reservation_status", code: "REJECTED", name: "Rechazado", color: "#F44336", icon: "thumbs-down", order: 3, createdBy: "system" },
  { group: "reservation_status", code: "CHECKED_IN", name: "Recibido", color: "#009688", icon: "log-in", order: 4, createdBy: "system" },
  { group: "reservation_status", code: "ACTIVE", name: "Activo", color: "#4CAF50", icon: "zap", order: 5, createdBy: "system" },
  { group: "reservation_status", code: "IN_PROGRESS", name: "En Progreso", color: "#FF9800", icon: "play-circle", order: 6, createdBy: "system" },
  { group: "reservation_status", code: "COMPLETED", name: "Completado", color: "#607D8B", icon: "check", order: 7, createdBy: "system" },
  { group: "reservation_status", code: "CANCELLED", name: "Cancelado", color: "#9E9E9E", icon: "x", order: 8, createdBy: "system" },
  { group: "reservation_status", code: "REJECTED", name: "Rechazado (Reserva)", color: "#E91E63", icon: "x-octagon", order: 9, createdBy: "system" },
  { group: "reservation_status", code: "NO_SHOW", name: "No Asistió", color: "#795548", icon: "user-x", order: 10, createdBy: "system" },

  // ─── recurrence_type ───
  { group: "recurrence_type", code: "NONE", name: "Ninguno", order: 0, isDefault: true, createdBy: "system" },
  { group: "recurrence_type", code: "DAILY", name: "Diario", order: 1, createdBy: "system" },
  { group: "recurrence_type", code: "WEEKLY", name: "Semanal", order: 2, createdBy: "system" },
  { group: "recurrence_type", code: "MONTHLY", name: "Mensual", order: 3, createdBy: "system" },

  // ─── slot_status ───
  { group: "slot_status", code: "available", name: "Disponible", color: "#4CAF50", order: 0, isDefault: true, createdBy: "system" },
  { group: "slot_status", code: "reserved", name: "Reservado", color: "#F44336", order: 1, createdBy: "system" },
  { group: "slot_status", code: "pending", name: "Pendiente", color: "#FFC107", order: 2, createdBy: "system" },
  { group: "slot_status", code: "blocked", name: "Bloqueado", color: "#9E9E9E", order: 3, createdBy: "system" },
  { group: "slot_status", code: "own_reservation", name: "Mi Reserva", color: "#2196F3", order: 4, createdBy: "system" },

  // ─── week_day ───
  { group: "week_day", code: "MONDAY", name: "Lunes", order: 0, createdBy: "system" },
  { group: "week_day", code: "TUESDAY", name: "Martes", order: 1, createdBy: "system" },
  { group: "week_day", code: "WEDNESDAY", name: "Miércoles", order: 2, createdBy: "system" },
  { group: "week_day", code: "THURSDAY", name: "Jueves", order: 3, createdBy: "system" },
  { group: "week_day", code: "FRIDAY", name: "Viernes", order: 4, createdBy: "system" },
  { group: "week_day", code: "SATURDAY", name: "Sábado", order: 5, createdBy: "system" },
  { group: "week_day", code: "SUNDAY", name: "Domingo", order: 6, createdBy: "system" },

  // ─── exception_reason ───
  { group: "exception_reason", code: "HOLIDAY", name: "Día Festivo", color: "#FF9800", order: 0, createdBy: "system" },
  { group: "exception_reason", code: "MAINTENANCE", name: "Mantenimiento", color: "#F59E0B", order: 1, createdBy: "system" },
  { group: "exception_reason", code: "INSTITUTIONAL_EVENT", name: "Evento Institucional", color: "#3B82F6", order: 2, createdBy: "system" },
  { group: "exception_reason", code: "TEMPORARY_CLOSURE", name: "Cierre Temporal", color: "#EF4444", order: 3, createdBy: "system" },
  { group: "exception_reason", code: "CUSTOM", name: "Personalizado", color: "#6366F1", order: 4, createdBy: "system" },

  // ─── reassignment_reason ───
  { group: "reassignment_reason", code: "MAINTENANCE", name: "Mantenimiento", order: 0, createdBy: "system" },
  { group: "reassignment_reason", code: "UNAVAILABLE", name: "No Disponible", order: 1, createdBy: "system" },
  { group: "reassignment_reason", code: "OVERBOOKING", name: "Sobrecarga", order: 2, createdBy: "system" },
  { group: "reassignment_reason", code: "USER_REQUEST", name: "Solicitud del Usuario", order: 3, createdBy: "system" },
  { group: "reassignment_reason", code: "DAMAGE", name: "Daño", order: 4, createdBy: "system" },
  { group: "reassignment_reason", code: "OTHER", name: "Otro", order: 5, createdBy: "system" },

  // ─── conflict_resolution ───
  { group: "conflict_resolution", code: "REJECT", name: "Rechazar", order: 0, isDefault: true, createdBy: "system" },
  { group: "conflict_resolution", code: "WAITING_LIST", name: "Lista de Espera", order: 1, createdBy: "system" },
  { group: "conflict_resolution", code: "AUTO_REASSIGN", name: "Reasignación Automática", order: 2, createdBy: "system" },
  { group: "conflict_resolution", code: "MANUAL_REVIEW", name: "Revisión Manual", order: 3, createdBy: "system" },
];
