# RULE-REPORTS-RF37 — Demanda Insatisfecha

> **Rule file:** `.windsurf/rules/bookly-reports-rf37-demanda-insatisfecha.md`
> **Domain:** reports · **Service:** `apps/reports-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/handlers/get-demand-reports.handler.ts`
- `src/application/queries/get-demand-reports.query.ts`
- `src/application/services/demand-report.service.ts`
- `docs/requirements/RF-37_DEMANDA_INSATISFECHA.md`

## ACs Coverage

| AC                                  | Status                           |
| ----------------------------------- | -------------------------------- |
| Filter by date range                | ✅ Query structure               |
| Filter by resource type             | ✅ Query structure               |
| Filter by rejection reason          | ⚠️ Needs verification            |
| Filter by user/program              | ⚠️ Needs verification            |
| Total rejected requests             | ✅ Demand report service         |
| Most demanded unavailable resources | ⚠️ Needs verification            |
| Graphical visualization             | Backend provides data            |
| CSV export                          | ✅ Export service                |
| Threshold alerts                    | ⚠️ audit-alert.service.ts exists |

## Gaps & Tasks

| Priority | Task                                      | Skill            |
| -------- | ----------------------------------------- | ---------------- |
| P0       | Write BDD specs for demand report queries | `qa-calidad`     |
| P1       | Verify rejection-reason aggregation       | `data-reporting` |
| P1       | Verify threshold alert integration        | `data-reporting` |
