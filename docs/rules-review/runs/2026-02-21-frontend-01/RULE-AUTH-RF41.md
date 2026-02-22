# RULE-AUTH-RF41 — Gestión de roles y permisos

> **Score: 3/5 — Funcional** | Domain: auth | Scope: bookly-mock-frontend

## Resumen

El frontend implementa CRUD completo de roles y permisos con UI de administración, hooks para queries/mutations, y API client dedicado. Faltan tests unitarios y algunas UIs avanzadas (historial de cambios, restauración de permisos).

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| Admin page | `src/app/[locale]/admin/usuarios/page.tsx` | Gestión usuarios con roles |
| Admin roles | `src/app/[locale]/admin/roles/` | ⚠️ Requiere verificación si existe como ruta |
| useRoles hook | `src/hooks/useRoles.ts` | CRUD: useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole, useAssignPermissionsToRole, useRemovePermissionsFromRole |
| usePermissions hook | `src/hooks/usePermissions.ts` | CRUD: usePermissions, usePermissionsByModule, useCreatePermission, useUpdatePermission, useDeletePermission |
| useUsers hook | `src/hooks/useUsers.ts` | useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser, useAssignRole |
| useRoleMutations | `src/hooks/mutations/useRoleMutations.ts` | useCreateRole, useUpdateRole, useDeleteRole, useAssignRole, useRevokeRole |
| Auth API client | `src/infrastructure/api/auth-client.ts` | AuthClient con getRoles, createRole, updateRole, deleteRole, assignRole, getPermissions, createPermission, etc. |
| Role types | `src/types/entities/user.ts` | Role, Permission types con id/code/name/permissions/isSystem |
| useAuth hook | `src/hooks/useAuth.ts` | hasPermission(resource, action), hasRole(roleName) |
| useAuthorization | `src/hooks/useAuthorization.ts` | Authorization checks |
| i18n | `src/i18n/translations/{en,es}/admin.json` | Traducciones admin |
| E2E | `e2e/admin.spec.ts`, `e2e/users-admin.spec.ts` | Tests E2E para admin y usuarios |

## Gaps

- **Gap-1**: No se evidencia UI de historial de cambios en permisos para auditoría (AC: "registrar historial de cambios en permisos").
- **Gap-2**: No hay UI para que un usuario vea "permisos actualizados automáticamente" en tiempo real tras cambio de rol (AC: "actualización en tiempo real sin reiniciar sesión").
- **Gap-3**: Falta UI de confirmación especial cuando admin pierde su propio rol de administrador.
- **Gap-4**: Sin tests unitarios para hooks de roles/permisos.

## Gate Check

- E2E tests existen → no aplica gate "sin tests" pero falta cobertura unit.

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Agregar pantalla de historial de cambios de permisos/roles | `web-app` |
| Alta | Implementar WebSocket notification cuando roles cambian para sesión activa | `web-app` |
| Media | Agregar confirmación especial para auto-revocación de admin | `ux-ui` |
| Media | Tests unitarios para useRoles, usePermissions hooks | `qa-calidad` |
| Baja | Diferenciar roles predefinidos (no editables) vs personalizados en UI | `web-app` |
