# RULE-AUTH-RF42 — Restricción de Modificación

> **Rule file:** `.windsurf/rules/bookly-auth-rf42-restriccion-de-modificacion.md`
> **Domain:** auth · **Service:** `apps/auth-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests (capped at 3)

---

## Evidence

### Code

- `libs/common/src/guards/permissions.guard.ts` — enforces permission checks
- `libs/decorators/src/permissions.decorator.ts` — route-level permission annotation
- `libs/decorators/src/roles.decorator.ts` — role-based access
- Audit DTOs: `src/application/dtos/audit/create-audit-log.dto.ts`, `audit-log-response.dto.ts`

### Documentation

- `docs/fase1-sprint1-rf42-restricciones/AUDIT_SYSTEM_COMPLETE.md`
- `docs/fase1-sprint1-rf42-restricciones/FASE3_INTEGRACION_COMPLETA.md`
- `docs/fase1-sprint1-rf42-restricciones/INTEGRACION_EVENT_BUS.md`
- `docs/requirements/RF-42_RESTRICCION_MODIFICACION.md`

### Tests

- None specific to RF-42

---

## ACs Coverage

| # | Acceptance Criteria | Status |
| --- | --- | --- |
| 1 | Only admins can modify resources | ✅ Guard/decorator pattern |
| 2 | Non-admin users blocked with error message | ✅ Guard rejects |
| 3 | Modification history with who/when/what | ✅ Audit log DTOs |
| 4 | Unauthorized attempts logged + notified | ⚠️ Logging yes, notification needs verification |
| 5 | Version restore capability | ⚠️ Needs code verification |
| 6 | Additional auth for resource deletion | ⚠️ 2FA integration needs verification |

## Gaps

1. **No BDD tests**
2. Version restore (rollback) for resources needs verification
3. PIN/2FA confirmation before deletion needs verification

## Improvement Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for permission guard blocking | `qa-calidad` |
| P1 | Verify version restore capability in resources-service | `backend` |
| P1 | Verify 2FA gate on resource deletion | `seguridad-avanzada` |
