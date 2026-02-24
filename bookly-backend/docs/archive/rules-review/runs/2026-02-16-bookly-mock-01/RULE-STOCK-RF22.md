# RULE-STOCK-RF22 — Notificación automática al solicitante con carta

> **Rule file:** `bookly-stockpile-rf22-notificacion-a-solicitante-con-carta.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                        | Path                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Handler — notification events   | `apps/stockpile-service/src/application/handlers/notification-event.handler.ts`       |
| Service — enhanced notification | `apps/stockpile-service/src/application/services/enhanced-notification.service.ts`    |
| Service — notification template | `apps/stockpile-service/src/application/services/notification-template.service.ts`    |
| Service — notification provider | `apps/stockpile-service/src/infrastructure/services/notification-provider.service.ts` |

### Key implementation details

- `NotificationEventHandler.handleReservationApproved()` sends approval notification with document PDF and QR code via `EMAIL` + `WHATSAPP`.
- `NotificationEventHandler.handleReservationRejected()` sends rejection notification with reason via `EMAIL`.
- `EnhancedNotificationService` supports multi-channel delivery (`EMAIL`, `WHATSAPP`, `PUSH`, `SMS`), document attachment, priority, retries.
- `NotificationTemplateService` provides template rendering per channel.
- `NotificationOptions.includeDocument` flag for attaching generated documents.

---

## AC Coverage

| #   | Acceptance Criteria                  | Status | Notes                                                |
| --- | ------------------------------------ | ------ | ---------------------------------------------------- |
| 1   | Auto-notify on approval with letter  | ✅     | `handleReservationApproved()` with `includeDocument` |
| 2   | Auto-notify on rejection with reason | ✅     | `handleReservationRejected()` with `rejectionReason` |
| 3   | Multi-channel delivery               | ✅     | EMAIL, WHATSAPP, PUSH, SMS supported                 |
| 4   | Document attachment                  | ✅     | `includeDocument` flag in notification options       |

---

## Gaps

1. **Data enrichment is stubbed** — `enrichReservationData()` returns mock data (TODO in code).
2. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                               | Priority |
| --- | ---------------------------------------------------------------------------------- | -------- |
| 1   | Implement `enrichReservationData()` with real cross-service calls                  | P1       |
| 2   | Write BDD specs: `notification-event.spec.ts`, `auto-notification-trigger.spec.ts` | P0       |
