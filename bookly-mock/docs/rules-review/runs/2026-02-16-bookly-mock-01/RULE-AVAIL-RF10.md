# RULE-AVAIL-RF10 — Visualización en Formato Calendario

> **Rule file:** `.windsurf/rules/bookly-availability-rf10-visualizacion-en-calendar.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Backend-only (visualization is frontend)

## Evidence

- `docs/RF-10_IMPLEMENTATION.md`
- `docs/requirements/RF-10_VISUALIZACION_CALENDARIO.md`
- Availability query endpoints provide data for calendar rendering
- No calendar component in bookly-mock (backend scope)

## ACs Coverage

| AC | Status |
| --- | --- |
| Daily/weekly/monthly views | 🔴 Frontend scope — backend provides data |
| Color-coded available/occupied | 🔴 Frontend scope |
| Real-time update on booking/cancel | ✅ Backend events emitted |
| Filters by resource type/location/date | ✅ Query endpoints |
| Direct booking from calendar click | API ready, UX is frontend |
| Responsive design | Frontend scope |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for calendar data query endpoints | `qa-calidad` |
| P2 | Calendar visualization is frontend scope (bookly-mock-frontend) | `web-app` |
