# RULE-STOCK-RF28 — Notificaciones automáticas sobre confirmación, cancelación o modificación de reservas

> **Rule file:** `bookly-stockpile-rf28-notificaciones-automaticas-email-whatsapp-confirma-cancela-modifica-reserva.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                        | Path                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| Handler                         | `apps/stockpile-service/src/application/handlers/notification-event.handler.ts`    |
| Service — enhanced notification | `apps/stockpile-service/src/application/services/enhanced-notification.service.ts` |
| Service — reminder              | `apps/stockpile-service/src/application/services/reminder.service.ts`              |

### Key implementation details

- `NotificationEventHandler` explicitly implements RF-28 (noted in JSDoc: "Implementa RF-28: Notificaciones Automáticas de Cambios").
- Handles 5 event types from availability-service:
  - `handleReservationCreated()` — sends confirmation + schedules reminders.
  - `handleReservationUpdated()` — detects significant changes, notifies user, reschedules reminders.
  - `handleReservationCancelled()` — cancels reminders + notifies user.
  - `handleReservationApproved()` — sends approval with PDF + QR via EMAIL + WHATSAPP.
  - `handleReservationRejected()` — sends rejection with reason via EMAIL.
- Significant change detection: filters `startDate`, `endDate`, `resourceId`, `status` changes.
- Field name translation to Spanish for user-facing messages.

---

## AC Coverage

| #   | Acceptance Criteria          | Status | Notes                                                             |
| --- | ---------------------------- | ------ | ----------------------------------------------------------------- |
| 1   | Auto-notify on confirmation  | ✅     | `handleReservationCreated()`                                      |
| 2   | Auto-notify on modification  | ⚠️     | Handler exists but `sendReservationUpdatedNotification` is TODO   |
| 3   | Auto-notify on cancellation  | ⚠️     | Handler exists but `sendReservationCancelledNotification` is TODO |
| 4   | Auto-notify on approval      | ✅     | `handleReservationApproved()` fully implemented                   |
| 5   | Auto-notify on rejection     | ✅     | `handleReservationRejected()` fully implemented                   |
| 6   | Multi-channel delivery       | ✅     | EMAIL, WHATSAPP, PUSH channels used                               |
| 7   | Significant change detection | ✅     | `detectSignificantChanges()` with field filtering                 |

---

## Gaps

1. **Update notification not implemented** — `sendReservationUpdatedNotification` is commented out with TODO.
2. **Cancel notification not implemented** — `sendReservationCancelledNotification` is commented out with TODO.
3. **Data enrichment stubbed** — `enrichReservationData()` returns mock data.
4. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                              | Priority |
| --- | --------------------------------------------------------------------------------- | -------- |
| 1   | Implement `sendReservationUpdatedNotification` in `EnhancedNotificationService`   | P1       |
| 2   | Implement `sendReservationCancelledNotification` in `EnhancedNotificationService` | P1       |
| 3   | Implement real `enrichReservationData()` with cross-service calls                 | P1       |
| 4   | Write BDD spec: `change-notification.spec.ts`                                     | P0       |
