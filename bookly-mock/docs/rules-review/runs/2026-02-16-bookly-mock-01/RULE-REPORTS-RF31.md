# RULE-REPORTS-RF31 — Uso por Programa/Período/Tipo de Recurso

> **Rule file:** `.windsurf/rules/bookly-reports-rf31-uso-programa-periodo-tipo-recurso.md`
> **Domain:** reports · **Service:** `apps/reports-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/handlers/generate-usage-report.handler.ts`
- `src/application/handlers/get-usage-reports.handler.ts`
- `src/application/queries/generate-usage-report.query.ts`
- `src/application/queries/get-usage-reports.query.ts`
- `src/application/services/usage-report.service.ts` (inferred)
- `docs/requirements/RF-31_REPORTES_USO.md`

## ACs Coverage

| AC | Status |
| --- | --- |
| Filter by academic program | ⚠️ Query params need verification |
| Filter by subject | ⚠️ Query params need verification |
| Filter by date range | ✅ Query structure supports ranges |
| Filter by resource type | ✅ Query structure |
| Total reservations in period | ✅ Handler logic |
| Average utilization | ⚠️ Needs verification |
| Most/least demanded resources | ⚠️ Needs verification |
| CSV export | ✅ Export service exists |
| Graphical visualization | Backend provides data, frontend renders |
| Scheduled automatic reports | ⚠️ Needs verification |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for usage report generation | `qa-calidad` |
| P1 | Verify all filter dimensions (program, subject, type) | `data-reporting` |
| P2 | Verify scheduled report functionality | `backend` |
