# RULE-AVAIL-RF18 — Cancelar o Modificar Reservas con Reglas

> **Rule file:** `.windsurf/rules/bookly-availability-rf18-cancelar-modificar-con-reglas.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/cancel-reservation.command.ts`
- `src/application/commands/update-reservation.command.ts`
- `src/application/handlers/cancel-reservation.handler.ts`
- `src/application/handlers/update-reservation.handler.ts` (inferred)

## ACs Coverage

| AC | Status |
| --- | --- |
| Cancel within allowed deadline without penalty | ✅ Cancel command exists |
| Modify dates/times respecting rules | ✅ Update command exists |
| Penalization for late cancellation | ⚠️ Rule enforcement needs verification |
| Admin-configurable cancellation rules | ⚠️ Needs verification |
| User notification on cancel/modify | ⚠️ Event-driven |
| Real-time availability update | ✅ Events emitted |
| Audit history of cancellations/modifications | ✅ Event-store |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for cancel/modify rule enforcement | `qa-calidad` |
| P1 | Verify deadline-based penalty logic | `backend` |
| P1 | Verify admin-configurable rules per resource type | `backend` |
