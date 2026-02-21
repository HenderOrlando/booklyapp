# RULE-AVAIL-RF12 — Reservas Periódicas

> **Rule file:** `.windsurf/rules/bookly-availability-rf12-permite-reserva-periodica.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/create-recurring-reservation.command.ts`
- `src/application/commands/cancel-recurring-instance.command.ts`
- `src/application/commands/cancel-recurring-series.command.ts`
- `src/application/commands/modify-recurring-instance.command.ts`
- `src/application/commands/update-recurring-series.command.ts`
- `src/application/handlers/cancel-recurring-instance.handler.ts`
- `src/application/handlers/cancel-recurring-series.handler.ts`
- `docs/RF12_RESERVAS_RECURRENTES.md`
- `docs/RF12_API_ENDPOINTS.md`
- `docs/RF12_DIAGRAMAS_FLUJO.md`
- `docs/RF12_RESUMEN_IMPLEMENTACION.md`
- `docs/requirements/RF-12_RESERVAS_PERIODICAS.md`

## ACs Coverage

| AC | Status |
| --- | --- |
| Periodic reservation option | ✅ create-recurring-reservation |
| Date range definition | ✅ Command parameters |
| Frequency: daily/weekly/monthly | ✅ Documented |
| Auto-verify all dates | ⚠️ Needs code verification |
| Conflict notification | ⚠️ Needs verification |
| Edit/cancel series or single instance | ✅ Dedicated commands for both |
| Calendar update | ✅ Events emitted |
| Auto-notifications | ⚠️ Event-driven, delivery needs verification |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for recurring CRUD flows | `qa-calidad` |
| P1 | Verify batch availability validation across all dates | `backend` |
