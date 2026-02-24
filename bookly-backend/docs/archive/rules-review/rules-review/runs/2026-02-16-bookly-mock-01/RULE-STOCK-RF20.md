# RULE-STOCK-RF20 — Validar solicitudes de reserva por responsable

> **Rule file:** `bookly-stockpile-rf20-solicitudes-validadas-por-responsable.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                   | Path                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Command — create request   | `apps/stockpile-service/src/application/commands/create-approval-request.command.ts` |
| Command — approve step     | `apps/stockpile-service/src/application/commands/approve-step.command.ts`            |
| Command — reject step      | `apps/stockpile-service/src/application/commands/reject-step.command.ts`             |
| Handler — create request   | `apps/stockpile-service/src/application/handlers/create-approval-request.handler.ts` |
| Handler — approve step     | `apps/stockpile-service/src/application/handlers/approve-step.handler.ts`            |
| Service — approval request | `apps/stockpile-service/src/application/services/approval-request.service.ts`        |
| Entity — approval request  | `apps/stockpile-service/src/domain/entities/approval-request.entity.ts`              |

### Key implementation details

- `CreateApprovalRequestHandler` creates approval request with `reservationId`, `requesterId`, `approvalFlowId`, `metadata`.
- `ApproveStepHandler` processes step-by-step approval with `approverId`, `stepName`, `comment`; invalidates cache after approval.
- Multi-step approval flow: each step has a designated approver role (director, engineer, secretary).
- `CacheInvalidationService` used to invalidate active approvals cache after changes.

---

## AC Coverage

| #   | Acceptance Criteria                                               | Status | Notes                                              |
| --- | ----------------------------------------------------------------- | ------ | -------------------------------------------------- |
| 1   | Requests validated by responsible (director, engineer, secretary) | ✅     | Multi-step approval flow with role-based approvers |
| 2   | Step-by-step approval process                                     | ✅     | `approveStep` / `rejectStep` per flow step         |
| 3   | Approval request linked to reservation                            | ✅     | `reservationId` in command                         |
| 4   | Comments on approval/rejection                                    | ✅     | `comment` field in `ApproveStepCommand`            |

---

## Gaps

1. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                           | Priority |
| --- | ------------------------------------------------------------------------------ | -------- |
| 1   | Write BDD specs: `create-approval-request.spec.ts`, `validate-request.spec.ts` | P0       |
