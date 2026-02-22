# RULE-AUTH-RF43 — Autenticación y SSO

> **Rule file:** `.windsurf/rules/bookly-auth-rf43-autenticacion-y-sso.md`
> **Domain:** auth · **Service:** `apps/auth-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests (capped at 3)

---

## Evidence

### Commands

- `src/application/commands/login-user.command.ts`
- `src/application/commands/register-user.command.ts`
- `src/application/commands/logout.command.ts`
- `src/application/commands/refresh-token.command.ts`
- `src/application/commands/forgot-password.command.ts`
- `src/application/commands/reset-password.command.ts`
- `src/application/commands/change-password.command.ts`

### Infrastructure

- `apps/api-gateway/src/infrastructure/middleware/jwt-extractor.middleware.ts`
- `apps/api-gateway/REDIS_JWT_IMPLEMENTATION_SUMMARY.md`
- `libs/guards/` — Auth guards

### Documentation

- `docs/SSO_GOOGLE_WORKSPACE.md`
- `docs/requirements/RF-43_SSO_AUTENTICACION.md`

### Tests

- `test/unit/services/auth.service.spec.ts` (1 file)

---

## ACs Coverage

| # | Acceptance Criteria | Status |
| --- | --- | --- |
| 1 | Login via university credentials / SSO | ✅ SSO docs + login command |
| 2 | Single Sign-On support | ✅ Google Workspace SSO documented |
| 3 | Auto-role assignment on auth | ✅ Role assignment in login flow |
| 4 | Access denied message for unauthorized | ✅ Guard pattern |
| 5 | Access history logging | ✅ Audit system |
| 6 | Manual user management for exceptions | ⚠️ Register command exists, admin flow needs verification |
| 7 | Fallback auth when SSO fails | ⚠️ Password-based fallback needs verification |

## Gaps

1. **Minimal test coverage** — only 1 generic spec
2. SSO fallback mechanism needs code verification
3. Session expiration config needs verification

## Improvement Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for login, SSO, token refresh flows | `qa-calidad` |
| P1 | Verify SSO fallback to local credentials | `seguridad-avanzada` |
| P1 | Verify configurable session timeout | `backend` |
