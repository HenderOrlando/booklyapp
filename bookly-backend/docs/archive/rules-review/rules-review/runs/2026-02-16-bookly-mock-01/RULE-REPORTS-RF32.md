# RULE-REPORTS-RF32 — Reservas por Usuario/Profesor

> **Rule file:** `.windsurf/rules/bookly-reports-rf32-reservas-por-usuario.md`
> **Domain:** reports · **Service:** `apps/reports-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/handlers/get-user-reports.handler.ts`
- `src/application/queries/get-user-reports.query.ts`
- `docs/requirements/RF-32_REPORTES_USUARIO.md`

## ACs Coverage

| AC | Status |
| --- | --- |
| Filter by specific user/professor | ✅ User report query |
| Filter by time period | ✅ Query structure |
| Filter by resource type | ⚠️ Needs verification |
| Total reservations per user | ✅ Handler logic |
| Effective vs cancelled percentage | ⚠️ Needs verification |
| Most-used resources per user | ⚠️ Needs verification |
| CSV export | ✅ Export service |
| Scheduled reports | ⚠️ Needs verification |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for user report queries | `qa-calidad` |
| P1 | Verify effective vs cancelled ratio calculation | `data-reporting` |
