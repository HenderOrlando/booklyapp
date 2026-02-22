# RULE-AUTH-RF44 — Registro de accesos y actividades para auditoría

> **Score: 2/5 — Parcial** | Domain: auth | Scope: bookly-mock-frontend

## Resumen

La auditoría es primariamente responsabilidad del backend. El frontend tiene evidencia parcial: el admin module existe, hay hooks de usuario que consultan datos, pero no se evidencia una pantalla dedicada de "Auditoría" con filtros avanzados, exportación CSV de logs, ni alertas de seguridad visibles.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| Admin module | `src/app/[locale]/admin/` | 29 items, potencialmente incluye auditoría |
| Auth client | `src/infrastructure/api/auth-client.ts` | Endpoints de users/roles que podrían incluir logs |
| UserActivityTable | `src/components/organisms/UserActivityTable.tsx` | Tabla de actividad de usuarios (7.4KB) |
| Historial aprobaciones | `src/app/[locale]/historial-aprobaciones/` | Historial de decisiones de aprobación |
| ApprovalTimeline | `src/components/molecules/ApprovalTimeline.tsx` | Timeline de acciones (10KB) |

## Gaps

- **Gap-1**: No se evidencia pantalla dedicada de auditoría con filtros por usuario, fecha, tipo de acción, alcance, nivel (AC).
- **Gap-2**: No hay exportación CSV de registros de auditoría (AC: "exportarse en formato CSV").
- **Gap-3**: No se evidencian alertas visuales de seguridad por intentos fallidos consecutivos.
- **Gap-4**: No hay UI de retención configurable de registros.
- **Gap-5**: Requiere evidencia fuera de scope (backend audit service).

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Crear página `/admin/auditoria` con DataTable + filtros avanzados | `web-app` |
| Alta | Agregar endpoint en API client para consultar audit logs | `web-app` |
| Media | Implementar exportación CSV de audit logs | `web-app` |
| Media | Agregar badge de alerta en header para intentos fallidos | `ux-ui` |
| Baja | UI de configuración de retención de logs | `web-app` |
