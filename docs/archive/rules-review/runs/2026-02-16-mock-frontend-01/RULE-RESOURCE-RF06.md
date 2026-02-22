# RULE-RESOURCE-RF06 — Mantenimiento de recursos

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 3/5**

## Evidencia

- `src/app/[locale]/mantenimientos/page.tsx` — Página de mantenimientos
- `src/components/organisms/MaintenanceModal/MaintenanceModal.tsx` — Modal crear/editar mantenimiento
- `src/hooks/mutations/useMaintenanceMutations.ts` — Mutations
- `src/types/entities/resource.ts` (L80–94) — Maintenance entity (types, status, technician, cost)
- `src/types/entities/resource.ts` (L179–186) — ScheduleMaintenanceDto
- `src/types/entities/resource.ts` (L40–44) — MaintenanceSchedule en Resource
- `src/infrastructure/api/endpoints.ts` (L70–75) — MAINTENANCE, MAINTENANCE_BY_ID, MAINTENANCE_HISTORY

## ACs: ✅ Programar mantenimiento | ✅ Tipos (PREVENTIVE, CORRECTIVE, EMERGENCY) | ✅ Estados (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED) | ✅ Historial por recurso

## Score: **3/5** — Funcional con page, modal, tipos y endpoints. Sin tests.
