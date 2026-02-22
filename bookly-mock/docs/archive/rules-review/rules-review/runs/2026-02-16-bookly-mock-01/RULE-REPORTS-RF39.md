# RULE-REPORTS-RF39 — Cumplimiento de Reservas

> **Rule file:** `.windsurf/rules/bookly-reports-rf39-cumplimiento-reserva.md`
> **Domain:** reports · **Service:** `apps/reports-service/` + `apps/availability-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Partial — no dedicated compliance report handler

## Evidence

- `apps/availability-service/src/application/commands/check-in-reservation.command.ts`
- `apps/availability-service/src/application/commands/check-out-reservation.command.ts`
- No dedicated `get-compliance-reports.handler.ts` in reports-service
- Check-in/out data exists but aggregation into compliance report not confirmed

## ACs Coverage

| AC                                     | Status                                                         |
| -------------------------------------- | -------------------------------------------------------------- |
| Compare reservations made vs used      | 🔴 No dedicated handler                                        |
| Register no-shows automatically        | ⚠️ Check-in timeout logic in availability, aggregation missing |
| Filter by user/program/resource/period | 🔴 No dedicated handler                                        |
| Compliance history per user            | 🔴 Not aggregated                                              |
| Restrictions for high no-show rate     | ⚠️ Evaluation service may cover partially                      |
| User self-view of compliance           | 🔴 Not confirmed                                               |
| CSV export                             | ✅ Export service available once data exists                   |
| Threshold alerts                       | 🔴 Not configured                                              |

## Gaps & Tasks

| Priority | Task                                                                          | Skill            |
| -------- | ----------------------------------------------------------------------------- | ---------------- |
| P1       | Implement get-compliance-reports handler + query + service                    | `data-reporting` |
| P1       | Aggregate check-in/out data from availability-service into compliance metrics | `backend`        |
| P1       | Link compliance data to evaluation/restriction enforcement                    | `backend`        |
| P0       | Write BDD specs for compliance report                                         | `qa-calidad`     |
