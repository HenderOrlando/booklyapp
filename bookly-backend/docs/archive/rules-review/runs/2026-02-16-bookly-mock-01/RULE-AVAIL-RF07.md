# RULE-AVAIL-RF07 — Horarios Disponibles

> **Rule file:** `.windsurf/rules/bookly-availability-rf07-horarios-disponibles.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/create-availability.command.ts`
- `src/application/commands/create-availability-exception.command.ts`
- `src/application/commands/delete-availability-exception.command.ts`
- `src/application/commands/create-maintenance-block.command.ts`
- `src/application/handlers/create-availability.handler.ts` (inferred)
- `src/application/events/availability-rules-updated.event.ts`
- `docs/RF-07_IMPLEMENTATION.md`
- `docs/requirements/RF-07_CONFIGURAR_DISPONIBILIDAD.md`

## ACs Coverage

| AC | Status |
| --- | --- |
| Config per resource type | ✅ create-availability command |
| Recurring time slots | ⚠️ Needs verification |
| Holiday/non-lecture periods | ✅ availability-exception command |
| Academic-period differentiation | ⚠️ Needs verification |
| Institutional restrictions | ⚠️ Partial |
| Maintenance blocks | ✅ maintenance-block commands |
| Calendar visualization | Backend data ready, frontend scope |
| Notifications on availability change | ⚠️ Event emitted, notification delivery needs verification |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs | `qa-calidad` |
| P1 | Verify recurring slot configuration | `backend` |
| P1 | Verify academic period support | `backend` |
