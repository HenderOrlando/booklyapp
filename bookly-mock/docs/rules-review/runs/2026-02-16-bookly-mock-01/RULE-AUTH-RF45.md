# RULE-AUTH-RF45 — Verificación 2FA en Solicitudes Críticas

> **Rule file:** `.windsurf/rules/bookly-auth-rf45-verificacion-2fa-solicitudes-criticas.md`
> **Domain:** auth · **Service:** `apps/auth-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests (capped at 3)

---

## Evidence

### Commands

- `src/application/commands/setup-2fa.command.ts`
- `src/application/commands/verify-2fa.command.ts`
- `src/application/commands/enable-2fa.command.ts`
- `src/application/commands/disable-2fa.command.ts`
- `src/application/commands/regenerate-backup-codes.command.ts`

### Documentation

- `docs/TWO_FACTOR_AUTH.md`
- `docs/requirements/RF-45_AUTENTICACION_2FA.md`

### Tests

- None specific to RF-45

---

## ACs Coverage

| # | Acceptance Criteria | Status |
| --- | --- | --- |
| 1 | 2FA required for critical actions | ✅ Commands exist |
| 2 | Email verification code | ⚠️ Needs verification |
| 3 | Authenticator app support (TOTP) | ✅ setup-2fa + verify-2fa |
| 4 | Time-limited code validity | ⚠️ TTL config needs verification |
| 5 | Auto-reject on timeout | ⚠️ Needs verification |
| 6 | Authentication history | ✅ Audit system |
| 7 | Admin support fallback | ⚠️ Backup codes exist, admin override needs verification |
| 8 | Cannot disable 2FA for critical without admin | ✅ disable-2fa command (permission-gated) |

## Gaps

1. **No BDD tests**
2. Email-based 2FA code delivery needs verification
3. Code expiration TTL needs verification
4. Integration with critical action gates across other services

## Improvement Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for 2FA setup, verify, enable, disable flows | `qa-calidad` |
| P1 | Verify email code delivery mechanism | `backend` |
| P1 | Verify 2FA gate integration in stockpile/resources critical actions | `seguridad-avanzada` |
