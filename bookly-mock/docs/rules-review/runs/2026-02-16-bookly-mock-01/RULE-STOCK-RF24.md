# RULE-STOCK-RF24 — Configuración de flujos de aprobación diferenciados

> **Rule file:** `bookly-stockpile-rf24-configuracion-flujo-segun-tipo-de-usuario.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                | Path                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Command — create flow   | `apps/stockpile-service/src/application/commands/create-approval-flow.command.ts`     |
| Command — update flow   | `apps/stockpile-service/src/application/commands/update-approval-flow.command.ts`     |
| Command — deactivate    | `apps/stockpile-service/src/application/commands/deactivate-approval-flow.command.ts` |
| Handler — create flow   | `apps/stockpile-service/src/application/handlers/create-approval-flow.handler.ts`     |
| Handler — get flows     | `apps/stockpile-service/src/application/handlers/get-approval-flows.handler.ts`       |
| Handler — get by id     | `apps/stockpile-service/src/application/handlers/get-approval-flow-by-id.handler.ts`  |
| Service — approval flow | `apps/stockpile-service/src/application/services/approval-flow.service.ts`            |
| Entity — approval flow  | `apps/stockpile-service/src/domain/entities/approval-flow.entity.ts`                  |

### Key implementation details

- `CreateApprovalFlowHandler` creates flow with `name`, `description`, `resourceTypes`, `steps`, `autoApproveConditions`.
- Flow steps define role-based approval sequence.
- `autoApproveConditions` allows automatic approval for certain conditions (e.g., trusted users).
- Full CRUD: create, update, deactivate, query by ID, list all.
- Flows scoped by `resourceTypes` — different resource types trigger different flows.

---

## AC Coverage

| #   | Acceptance Criteria           | Status | Notes                             |
| --- | ----------------------------- | ------ | --------------------------------- |
| 1   | Different flows per user type | ✅     | Steps define role-based approvers |
| 2   | Configurable step sequence    | ✅     | `steps` array in flow definition  |
| 3   | Auto-approve conditions       | ✅     | `autoApproveConditions` field     |
| 4   | Flow scoped by resource type  | ✅     | `resourceTypes` filter            |
| 5   | CRUD for flows                | ✅     | Create, update, deactivate, query |

---

## Gaps

1. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                                                                | Priority |
| --- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Write BDD specs: `create-approval-flow.spec.ts`, `update-approval-flow.spec.ts`, `deactivate-approval-flow.spec.ts` | P0       |
