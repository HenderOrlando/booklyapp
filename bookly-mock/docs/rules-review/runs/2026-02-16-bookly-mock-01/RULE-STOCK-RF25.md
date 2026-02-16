# RULE-STOCK-RF25 — Registro y trazabilidad de aprobaciones para auditoría

> **Rule file:** `bookly-stockpile-rf25-registro-trazabilidad-auditable.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                   | Path                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Handler — statistics       | `apps/stockpile-service/src/application/handlers/get-approval-statistics.handler.ts`    |
| Handler — get requests     | `apps/stockpile-service/src/application/handlers/get-approval-requests.handler.ts`      |
| Handler — get by id        | `apps/stockpile-service/src/application/handlers/get-approval-request-by-id.handler.ts` |
| Service — approval request | `apps/stockpile-service/src/application/services/approval-request.service.ts`           |

### Key implementation details

- `GetApprovalStatisticsHandler` provides aggregated statistics on approvals.
- `GetApprovalRequestsHandler` returns paginated list of all requests with filters.
- `GetApprovalRequestByIdHandler` returns full detail including step history.
- Each approval step records: `approverId`, `stepName`, `comment`, `timestamp`.
- Events published for all state transitions (approve, reject, cancel).

---

## AC Coverage

| #   | Acceptance Criteria        | Status | Notes                                                  |
| --- | -------------------------- | ------ | ------------------------------------------------------ |
| 1   | Complete approval history  | ✅     | Step-by-step records with approver, timestamp, comment |
| 2   | Statistics and aggregation | ✅     | `GetApprovalStatisticsHandler`                         |
| 3   | Query by filters           | ✅     | Paginated list with filters                            |
| 4   | Detailed view per request  | ✅     | `GetApprovalRequestByIdHandler`                        |
| 5   | Event-sourced audit trail  | ✅     | Events published for all transitions                   |

---

## Gaps

1. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                               | Priority |
| --- | ---------------------------------------------------------------------------------- | -------- |
| 1   | Write BDD specs: `approval-audit-trail.spec.ts`, `get-approval-statistics.spec.ts` | P0       |
