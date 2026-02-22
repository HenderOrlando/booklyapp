# RULE-AUTH-RF44 — Auditoría de Accesos

> **Rule file:** `.windsurf/rules/bookly-auth-rf44-auditoria.md`
> **Domain:** auth · **Service:** `apps/auth-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests (capped at 3)

---

## Evidence

### DTOs

- `src/application/dtos/audit/create-audit-log.dto.ts`
- `src/application/dtos/audit/audit-log-response.dto.ts`

### Documentation

- `docs/fase1-sprint1-rf44-auditoria/RF44_SISTEMA_AUDITORIA_COMPLETO.md`
- `docs/requirements/RF-44_AUDITORIA_ACCESOS.md`

### Shared

- `libs/common/src/utils/logger.util.ts` — structured logging
- `libs/event-bus/src/event-store/event-store.service.ts` — event persistence

### Tests

- None specific to RF-44

---

## ACs Coverage

| # | Acceptance Criteria | Status |
| --- | --- | --- |
| 1 | Log all accesses and relevant activities | ✅ Audit DTOs + event-store |
| 2 | Store user, timestamp, IP, device, action type | ✅ DTO fields |
| 3 | Admin filter by user/date/action/scope/level | ⚠️ Query handlers need verification |
| 4 | Export audit logs as CSV | ⚠️ Needs verification (reports-service may handle) |
| 5 | Alert on consecutive failed access attempts | ⚠️ Alert mechanism needs verification |
| 6 | Configurable log retention | ⚠️ Retention policy needs verification |
| 7 | Audit-only admin access | ✅ Permission-based access |

## Gaps

1. **No BDD tests**
2. CSV export of audit logs needs cross-service verification
3. Brute-force alert generation needs verification
4. Log retention TTL config needs verification

## Improvement Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs for audit log creation and query | `qa-calidad` |
| P1 | Verify brute-force detection alerts | `seguridad-privacidad-compliance` |
| P1 | Verify retention policy implementation | `backend` |
