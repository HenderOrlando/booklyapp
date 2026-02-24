import { CreateReferenceDataDto } from "@libs/database";

/**
 * Seed data de referencia para el dominio de Reportes y Análisis.
 */

export const REPORTS_REFERENCE_DATA: CreateReferenceDataDto[] = [
  // ─── feedback_type ───
  { group: "feedback_type", code: "POSITIVE", name: "Positivo", color: "#4CAF50", icon: "thumbs-up", order: 0, createdBy: "system" },
  { group: "feedback_type", code: "NEGATIVE", name: "Negativo", color: "#F44336", icon: "thumbs-down", order: 1, createdBy: "system" },
  { group: "feedback_type", code: "SUGGESTION", name: "Sugerencia", color: "#2196F3", icon: "lightbulb", order: 2, createdBy: "system" },
  { group: "feedback_type", code: "COMPLAINT", name: "Queja", color: "#FF9800", icon: "alert-circle", order: 3, createdBy: "system" },

  // ─── feedback_category ───
  { group: "feedback_category", code: "FACILITY", name: "Instalaciones", order: 0, createdBy: "system" },
  { group: "feedback_category", code: "SERVICE", name: "Servicio", order: 1, createdBy: "system" },
  { group: "feedback_category", code: "EQUIPMENT", name: "Equipamiento", order: 2, createdBy: "system" },
  { group: "feedback_category", code: "CLEANLINESS", name: "Limpieza", order: 3, createdBy: "system" },
  { group: "feedback_category", code: "AVAILABILITY", name: "Disponibilidad", order: 4, createdBy: "system" },
  { group: "feedback_category", code: "ACCESSIBILITY", name: "Accesibilidad", order: 5, createdBy: "system" },
  { group: "feedback_category", code: "OTHER", name: "Otro", order: 6, createdBy: "system" },

  // ─── feedback_sentiment ───
  { group: "feedback_sentiment", code: "POSITIVE", name: "Positivo", color: "#4CAF50", order: 0, createdBy: "system" },
  { group: "feedback_sentiment", code: "NEGATIVE", name: "Negativo", color: "#F44336", order: 1, createdBy: "system" },
  { group: "feedback_sentiment", code: "NEUTRAL", name: "Neutral", color: "#9E9E9E", order: 2, isDefault: true, createdBy: "system" },

  // ─── feedback_status ───
  { group: "feedback_status", code: "PENDING", name: "Pendiente", color: "#FFC107", order: 0, isDefault: true, createdBy: "system" },
  { group: "feedback_status", code: "RESPONDED", name: "Respondido", color: "#4CAF50", order: 1, createdBy: "system" },
  { group: "feedback_status", code: "CLOSED", name: "Cerrado", color: "#9E9E9E", order: 2, createdBy: "system" },

  // ─── performance_level ───
  { group: "performance_level", code: "EXCELLENT", name: "Excelente", color: "#4CAF50", order: 0, createdBy: "system" },
  { group: "performance_level", code: "GOOD", name: "Bueno", color: "#8BC34A", order: 1, createdBy: "system" },
  { group: "performance_level", code: "REGULAR", name: "Regular", color: "#FF9800", order: 2, createdBy: "system" },
  { group: "performance_level", code: "POOR", name: "Malo", color: "#F44336", order: 3, createdBy: "system" },

  // ─── export_format ───
  { group: "export_format", code: "CSV", name: "CSV", icon: "file-text", order: 0, isDefault: true, createdBy: "system" },
  { group: "export_format", code: "EXCEL", name: "Excel", icon: "table", order: 1, createdBy: "system" },
  { group: "export_format", code: "PDF", name: "PDF", icon: "file", order: 2, createdBy: "system" },
  { group: "export_format", code: "JSON", name: "JSON", icon: "code", order: 3, createdBy: "system" },

  // ─── report_type ───
  { group: "report_type", code: "USAGE_BY_RESOURCE", name: "Uso por Recurso", order: 0, createdBy: "system" },
  { group: "report_type", code: "USAGE_BY_USER", name: "Uso por Usuario", order: 1, createdBy: "system" },
  { group: "report_type", code: "USAGE_BY_PROGRAM", name: "Uso por Programa", order: 2, createdBy: "system" },
  { group: "report_type", code: "UNMET_DEMAND", name: "Demanda No Cumplida", order: 3, createdBy: "system" },
  { group: "report_type", code: "CONFLICTS", name: "Conflictos", order: 4, createdBy: "system" },
  { group: "report_type", code: "COMPLIANCE", name: "Cumplimiento", order: 5, createdBy: "system" },

  // ─── unsatisfied_demand_reason ───
  { group: "unsatisfied_demand_reason", code: "CONFLICT", name: "Conflicto", order: 0, createdBy: "system" },
  { group: "unsatisfied_demand_reason", code: "UNAVAILABLE", name: "No Disponible", order: 1, createdBy: "system" },
  { group: "unsatisfied_demand_reason", code: "CAPACITY", name: "Capacidad", order: 2, createdBy: "system" },
  { group: "unsatisfied_demand_reason", code: "MAINTENANCE", name: "Mantenimiento", order: 3, createdBy: "system" },
  { group: "unsatisfied_demand_reason", code: "OTHER", name: "Otro", order: 4, createdBy: "system" },

  // ─── export_status ───
  { group: "export_status", code: "PENDING", name: "Pendiente", color: "#FFC107", order: 0, isDefault: true, createdBy: "system" },
  { group: "export_status", code: "PROCESSING", name: "Procesando", color: "#2196F3", order: 1, createdBy: "system" },
  { group: "export_status", code: "COMPLETED", name: "Completado", color: "#4CAF50", order: 2, createdBy: "system" },
  { group: "export_status", code: "FAILED", name: "Fallido", color: "#F44336", order: 3, createdBy: "system" },
];
