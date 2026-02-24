# RULE-AVAIL-RF11 — Registro de Historial de Uso

> **Rule file:** `.windsurf/rules/bookly-availability-rf11-registro-historial-uso.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `docs/RF-11_IMPLEMENTATION.md`
- `docs/requirements/RF-11_HISTORIAL_USO.md`
- Reservation state machine (pending → confirmed → completed/cancelled)
- Event-store in `libs/event-bus/src/event-store/`
- Check-in/check-out commands track actual usage

## ACs Coverage

| AC | Status |
| --- | --- |
| Auto-record reservations in history | ✅ Event-store + state transitions |
| Store user, date, duration, status, cancellation reason | ✅ Reservation model |
| Filterable history view | ⚠️ Query handlers need verification |
| Immutable records for audit | ✅ Event-store pattern |
| CSV export of history | ⚠️ reports-service handles export |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for history queries | `qa-calidad` |
| P1 | Verify cross-service history export via reports-service | `data-reporting` |
