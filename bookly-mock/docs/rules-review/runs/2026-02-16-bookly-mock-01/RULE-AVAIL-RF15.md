# RULE-AVAIL-RF15 — Reasignación de Reservas

> **Rule file:** `.windsurf/rules/bookly-availability-rf15-reasignacion-reserva.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/request-reassignment.command.ts`
- `src/application/commands/respond-reassignment.command.ts`
- `src/application/handlers/request-reassignment.handler.ts` (inferred)
- `src/application/handlers/respond-reassignment.handler.ts` (inferred)
- `docs/RF-15_IMPLEMENTATION.md`

## ACs Coverage

| AC | Status |
| --- | --- |
| Register resource unavailability | ✅ Maintenance block commands |
| Change affected reservations to "Pending Reassignment" | ✅ request-reassignment command |
| Auto-suggest alternatives | ⚠️ Needs code verification |
| User notification with options | ⚠️ Event-driven, delivery needs verification |
| Accept/reject reassignment | ✅ respond-reassignment command |
| Admin manual reassignment | ⚠️ Needs verification |
| History of reassignments | ✅ Event-store |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for reassignment flow | `qa-calidad` |
| P1 | Verify auto-suggestion of alternative resources | `backend` |
