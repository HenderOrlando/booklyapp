# RULE-AVAIL-RF14 — Lista de Espera

> **Rule file:** `.windsurf/rules/bookly-availability-rf14-lista-espera-para-sobrecarga.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/add-to-waiting-list.command.ts`
- `src/application/handlers/add-to-waiting-list.handler.ts`
- Waiting list management inferred from command patterns

## ACs Coverage

| AC | Status |
| --- | --- |
| Auto-inscribe when resource full | ✅ add-to-waiting-list command |
| Priority-ordered queue | ⚠️ Needs code verification |
| Auto-notify first in queue on cancellation | ⚠️ Event-driven, needs verification |
| Configurable confirmation timeout | ⚠️ Needs verification |
| Voluntary exit from queue | ⚠️ Needs verification |
| Admin visibility of queue | ⚠️ Needs query handler verification |
| History log | ✅ Event-store |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for waiting list FIFO flow | `qa-calidad` |
| P1 | Verify auto-notification on resource release | `backend` |
| P1 | Verify confirmation timeout and cascade to next user | `backend` |
