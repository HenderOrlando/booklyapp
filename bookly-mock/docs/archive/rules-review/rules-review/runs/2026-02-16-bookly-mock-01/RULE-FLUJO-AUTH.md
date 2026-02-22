# RULE-FLUJO-AUTH — Flujos de Autenticación y Control de Acceso

> **Rule file:** `.windsurf/rules/bookly-flujos-auth.md`
> **Domain:** auth · **Trigger:** manual
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

### Process Coverage

| Process                      | Commands/Handlers Found                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Role & permission management | create-role, update-role, delete-role, assign-permissions, create-permission, etc. |
| User authentication          | login-user, register-user, logout, refresh-token                                   |
| Password management          | forgot-password, reset-password, change-password                                   |
| 2FA verification             | setup-2fa, verify-2fa, enable-2fa, disable-2fa, regenerate-backup-codes            |
| Access logging               | Audit DTOs, event-store                                                            |
| SSO                          | SSO_GOOGLE_WORKSPACE.md documentation                                              |

## Gaps

1. No BDD tests for any auth flow
2. SSO fallback mechanism needs verification

## Improvement Tasks

| Priority | Task                         | Skill        |
| -------- | ---------------------------- | ------------ |
| P0       | BDD specs for all auth flows | `qa-calidad` |
