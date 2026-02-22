# RULE-AVAIL-RF08 — Integración con Calendarios

> **Rule file:** `.windsurf/rules/bookly-availability-rf08-integra-calendars.md`
> **Domain:** availability · **Service:** `apps/availability-service/`
> **Score: 2 / 5** · **Gate:** 🔴 Partial implementation

## Evidence

- `libs/common/src/utils/ical-generator.util.ts` — iCal generation utility
- `docs/requirements/RF-08_INTEGRACION_CALENDARIOS.md`
- No dedicated sync commands or handlers found for bidirectional calendar sync

## ACs Coverage

| AC | Status |
| --- | --- |
| Auto-sync with institutional calendars | 🔴 iCal generator exists but no sync service |
| Conflict detection with official events | ⚠️ Partial — availability checks exist |
| User calendar sync (Google, Outlook) | 🔴 No evidence of OAuth calendar APIs |
| Bidirectional sync | 🔴 Not found |
| Audit of sync operations | ⚠️ Event-store exists generically |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P1 | Implement calendar sync service (Google Calendar API, iCal feeds) | `backend` + `ingenieria-sincronizacion-datos-dificiles` |
| P1 | Add conflict detection against external calendar events | `backend` |
| P0 | Write BDD specs | `qa-calidad` |
