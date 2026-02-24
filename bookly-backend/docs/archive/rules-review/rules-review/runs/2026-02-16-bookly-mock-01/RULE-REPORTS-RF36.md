# RULE-REPORTS-RF36 — Dashboard Interactivo en Tiempo Real

> **Rule file:** `.windsurf/rules/bookly-reports-rf36-dashboard-interactivo-tiempo-real.md`
> **Domain:** reports · **Service:** `apps/reports-service/` + `apps/api-gateway/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/handlers/dashboard.handlers.ts`
- `src/application/queries/dashboard.queries.ts`
- `src/application/services/dashboard.service.ts`
- `apps/api-gateway/src/infrastructure/websocket/websocket.gateway.ts` — real-time push
- `apps/api-gateway/src/infrastructure/controllers/metrics-dashboard.controller.ts`
- `apps/api-gateway/src/infrastructure/services/metrics-dashboard.service.ts`
- `docs/requirements/RF-36_DASHBOARDS.md`

## ACs Coverage

| AC                                                     | Status                                           |
| ------------------------------------------------------ | ------------------------------------------------ |
| Real-time resource status (available/occupied/blocked) | ✅ Dashboard service + WebSocket                 |
| Dynamic occupancy charts                               | Backend provides data                            |
| Custom filters (type, location, program, date)         | ⚠️ Query params need verification                |
| Real-time update                                       | ✅ WebSocket gateway                             |
| CSV export from dashboard                              | ✅ Export service                                |
| Configurable alerts on thresholds                      | ⚠️ Alert service exists (audit-alert.service.ts) |
| Scheduled reports                                      | ⚠️ Needs verification                            |

## Gaps & Tasks

| Priority | Task                                      | Skill            |
| -------- | ----------------------------------------- | ---------------- |
| P0       | Write BDD specs for dashboard queries     | `qa-calidad`     |
| P1       | Verify threshold alert configuration      | `data-reporting` |
| P2       | Dashboard visualization is frontend scope | `web-app`        |
