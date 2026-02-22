# RULE-STOCK-RF23 — Pantalla para personal de vigilancia

> **Rule file:** `bookly-stockpile-rf23-visualizacion-reservas-aprobadas-vigilante.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact | Path                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| Query    | `apps/stockpile-service/src/application/queries/get-active-today-approvals.query.ts`    |
| Handler  | `apps/stockpile-service/src/application/handlers/get-active-today-approvals.handler.ts` |
| Service  | `apps/stockpile-service/src/application/services/approval-request.service.ts`           |
| DTO      | `apps/stockpile-service/src/infrastructure/dtos/enriched-approval-request.dto.ts`       |

### Key implementation details

- `GetActiveTodayApprovalsHandler` implements RF-23 (noted in JSDoc).
- Returns `EnrichedApprovalRequestDto[]` with pagination and filters.
- Query accepts `date`, `page`, `limit`, `filters` parameters.
- Service method `getActiveTodayApprovals()` provides enriched data for display.

---

## AC Coverage

| #   | Acceptance Criteria                   | Status | Notes                                           |
| --- | ------------------------------------- | ------ | ----------------------------------------------- |
| 1   | Display today's approved reservations | ✅     | `GetActiveTodayApprovalsQuery` with date filter |
| 2   | Enriched data (user, resource, time)  | ✅     | `EnrichedApprovalRequestDto`                    |
| 3   | Pagination support                    | ✅     | `page`, `limit` in query                        |
| 4   | Filters (by resource, time, etc.)     | ✅     | `filters` parameter                             |
| 5   | Real-time updates                     | ⚠️     | No WebSocket/SSE push for vigilance screen      |

---

## Gaps

1. **No real-time push** — Vigilance screen requires manual refresh; no WebSocket/SSE subscription.
2. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                         | Priority |
| --- | ------------------------------------------------------------ | -------- |
| 1   | Add WebSocket gateway for real-time vigilance screen updates | P2       |
| 2   | Write BDD spec: `get-active-today-approvals.spec.ts`         | P0       |
