# RULE-AUTH-RF44 — Auditoría de accesos

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 2/5**

---

## Evidencia

| Archivo                                            | Qué implementa                           |
| -------------------------------------------------- | ---------------------------------------- |
| `src/app/[locale]/admin/auditoria/page.tsx`        | Página de auditoría                      |
| `src/infrastructure/api/endpoints.ts` (L227–231)   | AUDIT_ENDPOINTS: LOGS, LOG_BY_ID, EXPORT |
| `src/infrastructure/mock/data/audit.mock.ts`       | Mock data para auditoría                 |
| `src/infrastructure/api/base-client.ts` (L204–242) | Logging interceptor (request/response)   |

## ACs cubiertos

- ✅ Página de consulta de logs de auditoría
- ✅ Endpoints para obtener y exportar logs
- ⚠️ Filtros avanzados en auditoría (no verificado si la page tiene filtros)
- ⚠️ Historial de accesos por usuario (endpoint existe, UI no verificada)

## Gaps

1. Sin tests
2. Detalle de la page de auditoría no verificado (filtros, paginación, export)
3. Registro de intentos de acceso no autorizados: depende del backend, frontend solo muestra

## Score: **2/5** — Parcial. Page y endpoints existen, pero funcionalidad completa no verificada.
