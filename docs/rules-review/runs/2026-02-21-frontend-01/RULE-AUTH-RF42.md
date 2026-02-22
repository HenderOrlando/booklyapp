# RULE-AUTH-RF42 — Restricción de modificaciones a administradores

> **Score: 3/5 — Funcional** | Domain: auth | Scope: bookly-mock-frontend

## Resumen

El frontend implementa control de acceso basado en roles con hasPermission/hasRole en useAuth, middleware de autenticación, y ocultación de opciones de edición según rol. Falta doble confirmación con PIN para eliminación y restauración de versiones.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| useAuth | `src/hooks/useAuth.ts` | hasPermission(resource, action), hasRole(roleName) |
| useAuthorization | `src/hooks/useAuthorization.ts` | Authorization helper |
| Middleware | `src/middleware.ts` | Next.js middleware para auth routing |
| ConfirmDialog | `src/components/molecules/ConfirmDialog/` | Confirmación antes de eliminar |
| Admin-only pages | `src/app/[locale]/admin/` | 29 items, restringido a admins |
| Resource CRUD pages | `src/app/[locale]/recursos/` | 12 items, con restricciones por rol |

## Gaps

- **Gap-1**: No se evidencia autenticación adicional (PIN/2FA) antes de eliminar un recurso (AC: "doble confirmación con PIN").
- **Gap-2**: No hay UI de control de versiones / restaurar versión anterior de un recurso.
- **Gap-3**: No se registra intento de modificación por usuario sin permisos en UI (AC: "registrar intento y notificar admin").
- **Gap-4**: Sin tests para verificar que UI oculta opciones correctamente por rol.

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Agregar 2FA/PIN modal antes de eliminar recurso | `web-app` + `seguridad-privacidad-compliance` |
| Media | Implementar UI de historial de versiones de recurso | `web-app` |
| Media | Interceptor que capture 403 y muestre notificación de intento bloqueado | `web-app` |
| Baja | Tests E2E que verifiquen ocultación de botones por rol | `qa-calidad` |
