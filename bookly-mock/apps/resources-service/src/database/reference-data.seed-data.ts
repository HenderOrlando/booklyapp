import { CreateReferenceDataDto } from "@libs/database";

/**
 * Seed data de referencia para el dominio de Recursos.
 * Incluye: resource_type, resource_status, maintenance_type, maintenance_status, category_type
 */

export const RESOURCES_REFERENCE_DATA: CreateReferenceDataDto[] = [
  // ─── resource_type ───
  { group: "resource_type", code: "CLASSROOM", name: "Salón de Clase", color: "#3B82F6", icon: "school", order: 0, createdBy: "system" },
  { group: "resource_type", code: "LABORATORY", name: "Laboratorio", color: "#8B5CF6", icon: "flask", order: 1, createdBy: "system" },
  { group: "resource_type", code: "AUDITORIUM", name: "Auditorio", color: "#EF4444", icon: "megaphone", order: 2, createdBy: "system" },
  { group: "resource_type", code: "MULTIMEDIA_EQUIPMENT", name: "Equipo Multimedia", color: "#F59E0B", icon: "monitor", order: 3, createdBy: "system" },
  { group: "resource_type", code: "SPORTS_FACILITY", name: "Instalación Deportiva", color: "#10B981", icon: "trophy", order: 4, createdBy: "system" },
  { group: "resource_type", code: "MEETING_ROOM", name: "Salón de Reuniones", color: "#6366F1", icon: "users", order: 5, createdBy: "system" },

  // ─── resource_status ───
  { group: "resource_status", code: "AVAILABLE", name: "Disponible", color: "#4CAF50", icon: "check-circle", order: 0, isDefault: true, createdBy: "system" },
  { group: "resource_status", code: "RESERVED", name: "Reservado", color: "#F44336", icon: "clock", order: 1, createdBy: "system" },
  { group: "resource_status", code: "MAINTENANCE", name: "Mantenimiento", color: "#FF9800", icon: "wrench", order: 2, createdBy: "system" },
  { group: "resource_status", code: "UNAVAILABLE", name: "No Disponible", color: "#9E9E9E", icon: "x-circle", order: 3, createdBy: "system" },

  // ─── maintenance_type ───
  { group: "maintenance_type", code: "PREVENTIVE", name: "Preventivo", color: "#10B981", icon: "shield", order: 0, createdBy: "system" },
  { group: "maintenance_type", code: "CORRECTIVE", name: "Correctivo", color: "#F59E0B", icon: "tool", order: 1, createdBy: "system" },
  { group: "maintenance_type", code: "EMERGENCY", name: "Emergencia", color: "#EF4444", icon: "alert-triangle", order: 2, createdBy: "system" },
  { group: "maintenance_type", code: "CLEANING", name: "Limpieza", color: "#6366F1", icon: "sparkles", order: 3, createdBy: "system" },
  { group: "maintenance_type", code: "UPGRADE", name: "Actualización", color: "#3B82F6", icon: "arrow-up", order: 4, createdBy: "system" },
  { group: "maintenance_type", code: "INSPECTION", name: "Inspección", color: "#8B5CF6", icon: "eye", order: 5, createdBy: "system" },

  // ─── maintenance_status ───
  { group: "maintenance_status", code: "SCHEDULED", name: "Programado", color: "#3B82F6", icon: "calendar", order: 0, isDefault: true, createdBy: "system" },
  { group: "maintenance_status", code: "IN_PROGRESS", name: "En Proceso", color: "#F59E0B", icon: "loader", order: 1, createdBy: "system" },
  { group: "maintenance_status", code: "COMPLETED", name: "Completado", color: "#10B981", icon: "check", order: 2, createdBy: "system" },
  { group: "maintenance_status", code: "CANCELLED", name: "Cancelado", color: "#9E9E9E", icon: "x", order: 3, createdBy: "system" },

  // ─── category_type ───
  { group: "category_type", code: "RESOURCE_TYPE", name: "Tipo de Recurso", order: 0, createdBy: "system" },
  { group: "category_type", code: "MAINTENANCE_TYPE", name: "Tipo de Mantenimiento", order: 1, createdBy: "system" },
];
