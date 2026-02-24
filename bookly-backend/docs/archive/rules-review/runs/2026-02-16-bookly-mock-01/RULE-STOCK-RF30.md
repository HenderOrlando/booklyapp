# RULE-STOCK-RF30 — Alertas en tiempo real por cancelación (espera activa)

> **Rule file:** `bookly-stockpile-rf30-notificacion-tiempo-real-recurso-disponible-por-cancelacion.md`
> **Domain:** stockpile-service
> **Score:** 2 / 5

---

## Evidence

| Artifact                         | Path                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| Service — proximity notification | `apps/stockpile-service/src/application/services/proximity-notification.service.ts` |
| Handler — notification events    | `apps/stockpile-service/src/application/handlers/notification-event.handler.ts`     |
| Service — enhanced notification  | `apps/stockpile-service/src/application/services/enhanced-notification.service.ts`  |

### Key implementation details

- `ProximityNotificationService` exists — likely handles nearby-resource alerts.
- `NotificationEventHandler.handleReservationCancelled()` detects cancellations but notification dispatch is TODO (commented out).
- `EnhancedNotificationService` supports real-time channels (`PUSH`, `WHATSAPP`).
- **No dedicated waiting list subscription model found** for "espera activa".
- **No priority queue for notifying subscribers in FIFO order**.
- **No time-limited reservation window** (10 min expiry) for alerted users.

---

## AC Coverage

| #   | Acceptance Criteria                            | Status | Notes                                                |
| --- | ---------------------------------------------- | ------ | ---------------------------------------------------- |
| 1   | Subscribe to active wait for specific resource | ⚠️     | No subscription model/entity found                   |
| 2   | Real-time alert on cancellation                | ⚠️     | Cancellation handler exists but notification is TODO |
| 3   | Direct link to reserve freed resource          | ❌     | Not implemented                                      |
| 4   | FIFO notification order                        | ❌     | No priority queue for subscribers                    |
| 5   | Time-limited reservation window (10 min)       | ❌     | Not implemented                                      |
| 6   | Admin audit of alerts sent                     | ❌     | No audit trail for active-wait alerts                |
| 7   | Unsubscribe from active wait                   | ❌     | No unsubscribe mechanism                             |
| 8   | Auto-expire past subscriptions                 | ❌     | Not implemented                                      |

---

## Gaps

1. **Missing subscription model** — No `ActiveWaitSubscription` entity/schema for tracking users waiting for specific resources.
2. **Missing FIFO notification queue** — No priority-based alerting on cancellation.
3. **Cancellation notification not implemented** — Handler exists but actual dispatch is commented out.
4. **No time-limited reservation window** — Rule requires 10-min window before notifying next user.
5. **No unsubscribe mechanism**.
6. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                                                        | Priority |
| --- | ----------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Create `ActiveWaitSubscriptionEntity` with `userId`, `resourceId`, `dateRange`, `subscribedAt`              | P1       |
| 2   | Create `SubscribeToActiveWaitCommand` + handler                                                             | P1       |
| 3   | Create `UnsubscribeFromActiveWaitCommand` + handler                                                         | P1       |
| 4   | Implement FIFO notification queue on `ReservationCancelled` event                                           | P1       |
| 5   | Add 10-min reservation window with auto-expiry and next-user notification                                   | P1       |
| 6   | Implement `sendReservationCancelledNotification` in `EnhancedNotificationService`                           | P1       |
| 7   | Write BDD specs: `active-wait-subscription.spec.ts`, `cancellation-alert.spec.ts`, `priority-queue.spec.ts` | P0       |
