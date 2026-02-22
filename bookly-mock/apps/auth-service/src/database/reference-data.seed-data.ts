import { CreateReferenceDataDto } from "@libs/database";

/**
 * Seed data de referencia para el dominio de Auth.
 * Incluye: user_role (como referencia, los roles reales están en la colección roles)
 */

export const AUTH_REFERENCE_DATA: CreateReferenceDataDto[] = [
  // ─── user_role (referencia visual, los roles reales están en collection "roles") ───
  { group: "user_role", code: "GENERAL_ADMIN", name: "Administrador General", icon: "shield", order: 0, isDefault: false, createdBy: "system" },
  { group: "user_role", code: "PROGRAM_ADMIN", name: "Administrador de Programa", icon: "settings", order: 1, createdBy: "system" },
  { group: "user_role", code: "TEACHER", name: "Profesor", icon: "book-open", order: 2, createdBy: "system" },
  { group: "user_role", code: "STUDENT", name: "Estudiante", icon: "graduation-cap", order: 3, isDefault: true, createdBy: "system" },
  { group: "user_role", code: "SECURITY", name: "Seguridad", icon: "lock", order: 4, createdBy: "system" },
  { group: "user_role", code: "ADMINISTRATIVE_STAFF", name: "Personal Administrativo", icon: "briefcase", order: 5, createdBy: "system" },

  // ─── audit_action ───
  { group: "audit_action", code: "CREATE", name: "Crear", order: 0, createdBy: "system" },
  { group: "audit_action", code: "UPDATE", name: "Actualizar", order: 1, createdBy: "system" },
  { group: "audit_action", code: "DELETE", name: "Eliminar", order: 2, createdBy: "system" },
  { group: "audit_action", code: "VIEW", name: "Ver", order: 3, createdBy: "system" },
  { group: "audit_action", code: "ACCESS", name: "Acceso", order: 4, createdBy: "system" },
  { group: "audit_action", code: "UNAUTHORIZED_ACCESS", name: "Acceso no autorizado", color: "#EF4444", order: 5, createdBy: "system" },
];
