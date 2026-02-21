# RULE-AVAIL-RF19 — Reservas Múltiples en Una Solicitud

> **Rule file:** `.windsurf/rules/bookly-availability-rf19-reservas-multiples-en-una-solicitud.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Partial — no explicit multi-resource command found

## Evidence

- `src/application/commands/create-reservation.command.ts` — single reservation
- No dedicated `create-multi-reservation` or batch command found
- `apps/api-gateway/src/application/services/saga.service.ts` — saga pattern exists for multi-step flows

## ACs Coverage

| AC | Status |
| --- | --- |
| Select multiple resources in one request | 🔴 No explicit multi-resource command |
| Verify simultaneous availability | 🔴 Not confirmed for batch |
| Show unavailable resources clearly | ⚠️ Single resource flow handles this |
| Single request with linked reservations | 🔴 Saga service exists but multi-booking flow not confirmed |
| Summary confirmation | 🔴 Not confirmed |
| Modify/cancel individual within group | 🔴 Not confirmed |
| Single notification for multi-booking | 🔴 Not confirmed |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P1 | Implement create-multi-reservation command using saga pattern | `backend` |
| P1 | Add batch availability validation | `backend` |
| P1 | Add temporary resource locking during multi-booking flow | `arquitectura-escalabilidad-resiliencia` |
| P0 | Write BDD specs for multi-resource booking | `qa-calidad` |
