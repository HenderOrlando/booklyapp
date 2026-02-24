# RULE-REPORTS-RF34 — Feedback de Calidad de Servicio

> **Rule file:** `.windsurf/rules/bookly-reports-rf34-registro-feedbck-calidad-servicio.md`
> **Domain:** reports · **Service:** `apps/reports-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/feedback.commands.ts`
- `src/application/handlers/feedback.handlers.ts`
- `src/application/queries/feedback.queries.ts`
- `src/application/services/feedback.service.ts`
- `docs/RF-34_FEEDBACK_TESTING_GUIDE.md`
- `docs/requirements/RF-34_FEEDBACK.md`

## ACs Coverage

| AC                                  | Status                                         |
| ----------------------------------- | ---------------------------------------------- |
| Register feedback after reservation | ✅ Feedback commands                           |
| Star rating (1-5) + comments        | ⚠️ Command structure needs verification        |
| Auto-reminder to submit feedback    | ⚠️ Notification integration needs verification |
| Admin filter/export feedback        | ✅ Feedback queries                            |
| Reports by resource/program/period  | ⚠️ Needs verification                          |
| Only for used reservations          | ⚠️ Validation needs verification               |
| Content moderation                  | ⚠️ Needs verification                          |

## Gaps & Tasks

| Priority | Task                                                            | Skill        |
| -------- | --------------------------------------------------------------- | ------------ |
| P0       | Write BDD specs per testing guide                               | `qa-calidad` |
| P1       | Verify feedback eligibility check (only completed reservations) | `backend`    |
| P1       | Verify content moderation flow                                  | `backend`    |
