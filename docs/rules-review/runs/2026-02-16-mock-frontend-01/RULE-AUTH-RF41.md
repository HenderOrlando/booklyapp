# RULE-AUTH-RF41 — Gestión de roles y permisos según perfil

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 3/5**

---

## Evidencia

| Archivo                                                        | Qué implementa                                         |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `src/app/[locale]/admin/roles/page.tsx`                        | Página de gestión de roles                             |
| `src/app/[locale]/admin/roles/components/RolesTable.tsx`       | Tabla de roles                                         |
| `src/app/[locale]/admin/roles/components/RoleFormModal.tsx`    | Modal crear/editar rol                                 |
| `src/app/[locale]/admin/roles/components/RoleDetailPanel.tsx`  | Panel detalle de rol                                   |
| `src/app/[locale]/admin/roles/components/RoleStatsCards.tsx`   | KPIs de roles                                          |
| `src/app/[locale]/admin/usuarios/page.tsx`                     | Gestión de usuarios                                    |
| `src/app/[locale]/admin/usuarios/components/UserFormModal.tsx` | Modal asignar rol a usuario                            |
| `src/hooks/useRoles.ts`                                        | Hook CRUD de roles                                     |
| `src/hooks/usePermissions.ts`                                  | Hook de permisos                                       |
| `src/hooks/useAuthorization.ts`                                | Hook de autorización por rol                           |
| `src/hooks/mutations/useRoleMutations.ts`                      | Mutations para roles                                   |
| `src/hooks/mutations/useUserMutations.ts`                      | Mutations para usuarios                                |
| `src/infrastructure/api/endpoints.ts` (L29–43)                 | Endpoints: ROLES, PERMISSIONS, ROLE_ASSIGN_PERMISSIONS |
| `src/types/entities/user.ts`                                   | Tipo User con roles                                    |
| `src/components/auth/ProtectedRoute.tsx`                       | Protección por rol                                     |
| `src/i18n/translations/es/admin.json`                          | Traducciones admin                                     |

## ACs cubiertos

- ✅ Asignar roles y permisos específicos por usuario
- ✅ Interfaz de administración de roles (RolesTable + RoleFormModal)
- ✅ Perfiles diferenciados (endpoints y hooks)
- ⚠️ Historial de cambios en permisos (auditoría page existe, pero vinculación a roles no verificada)
- ⚠️ Actualización automática de permisos al cambiar rol (lógica backend, frontend muestra)
- ✅ Solo admin puede modificar roles (ProtectedRoute + useAuthorization)

## Gaps

1. Sin tests para componentes de admin/roles
2. Historial de cambios de permisos: UI puede existir en auditoría pero no está vinculada directamente
3. Verificación de que cada perfil (Estudiante, Docente, Admin, Vigilante, Administrativo) tenga acceso correcto no está testada en frontend

## Score: **3/5** — Funcional, sin tests (gate max 3)
