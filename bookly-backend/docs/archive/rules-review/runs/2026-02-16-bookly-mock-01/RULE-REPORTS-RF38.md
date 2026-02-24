# RULE-REPORTS-RF38 — Conflictos de Reserva

> **Rule file:** `.windsurf/rules/bookly-reports-rf38-conflictos-reserva.md`
> **Domain:** reports · **Service:** `apps/reports-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Partial — no dedicated conflict report handler

## Evidence

- No dedicated `get-conflict-reports.handler.ts` found
- Conflict data likely aggregatable from availability-service reservation logs
- `src/application/services/demand-report.service.ts` — may partially cover
- `docs/requirements/` — no RF-38 specific requirement doc found in reports-service

## ACs Coverage

| AC                               | Status                                       |
| -------------------------------- | -------------------------------------------- |
| Filter by date range             | 🔴 No dedicated handler                      |
| Filter by resource type/location | 🔴 No dedicated handler                      |
| Total conflicts per resource     | 🔴 Not implemented                           |
| Critical saturation periods      | 🔴 Not implemented                           |
| Graphical visualization          | 🔴 No data endpoint                          |
| CSV export                       | ✅ Export service available once data exists |
| Threshold alerts for saturation  | 🔴 Not configured                            |

## Gaps & Tasks

| Priority | Task                                                     | Skill            |
| -------- | -------------------------------------------------------- | ---------------- |
| P1       | Implement get-conflict-reports handler + query + service | `data-reporting` |
| P1       | Aggregate conflict data from availability-service events | `backend`        |
| P0       | Write BDD specs for conflict report                      | `qa-calidad`     |
