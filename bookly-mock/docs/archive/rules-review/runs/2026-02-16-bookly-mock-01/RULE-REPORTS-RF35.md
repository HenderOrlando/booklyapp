# RULE-REPORTS-RF35 — Evaluación Administrativa de Usuarios

> **Rule file:** `.windsurf/rules/bookly-reports-rf35-registro-feedback-administrativo.md`
> **Domain:** reports · **Service:** `apps/reports-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/evaluation.commands.ts`
- `src/application/handlers/evaluation.handlers.ts`
- `src/application/queries/evaluation.queries.ts`
- `src/application/services/evaluation.service.ts` (inferred)
- `docs/RF-35_EVALUATION_TESTING_GUIDE.md`
- `docs/requirements/RF-35_EVALUACION_USUARIOS.md`

## ACs Coverage

| AC                                                      | Status                              |
| ------------------------------------------------------- | ----------------------------------- |
| Admin evaluates user after reservation use              | ✅ Evaluation commands              |
| Criteria: attendance, resource condition, cancellations | ⚠️ Command fields need verification |
| User evaluation history (admin-only view)               | ✅ Evaluation queries               |
| Restrictions for negative evaluations                   | ⚠️ Enforcement needs verification   |
| User can view own evaluations                           | ⚠️ Needs verification               |
| Appeal mechanism                                        | ⚠️ Needs verification               |
| Evaluation immutability                                 | ⚠️ Needs verification               |

## Gaps & Tasks

| Priority | Task                                               | Skill        |
| -------- | -------------------------------------------------- | ------------ |
| P0       | Write BDD specs per testing guide                  | `qa-calidad` |
| P1       | Verify restriction enforcement on negative history | `backend`    |
| P1       | Verify appeal/review request flow                  | `backend`    |
