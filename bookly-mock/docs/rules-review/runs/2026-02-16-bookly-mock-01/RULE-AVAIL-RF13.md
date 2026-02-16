# RULE-AVAIL-RF13 — Solicitud de Reserva con VoBo de Docente

> **Rule file:** `.windsurf/rules/bookly-availability-rf13-solicitud-reserva-vobo-docente.md`
> **Domain:** availability + stockpile · **Service:** `apps/availability-service/` + `apps/stockpile-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Partial — VoBo-specific flow not explicit

## Evidence

- `apps/stockpile-service/src/application/commands/create-approval-request.command.ts`
- `apps/stockpile-service/src/application/handlers/approve-step.handler.ts`
- `apps/stockpile-service/src/application/handlers/reject-step.handler.ts` (inferred)
- `apps/stockpile-service/src/application/commands/create-approval-flow.command.ts`
- `docs/requirements/RF-13` — not found as separate doc in availability-service

## ACs Coverage

| AC | Status |
| --- | --- |
| Student selects teacher for VoBo | 🔴 No dedicated VoBo command in availability |
| Request stays "pending approval" | ✅ Approval flow in stockpile |
| Teacher notification | ⚠️ Notification handler exists generically |
| Approve/reject with reason | ✅ approve-step + reject-step |
| Auto-reject on timeout | ⚠️ Timeout logic needs verification |
| History of all requests | ✅ Approval request queries exist |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P1 | Implement explicit student→teacher VoBo command linking reservation to teacher | `backend` |
| P1 | Verify auto-reject timeout for teacher non-response | `backend` |
| P0 | Write BDD specs for VoBo flow | `qa-calidad` |
