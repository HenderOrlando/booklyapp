# RULE-STOCK-RF27 — Integración con sistemas de mensajería (correo, WhatsApp)

> **Rule file:** `bookly-stockpile-rf27-integracion-emails-whatsapp.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                        | Path                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| Service — enhanced notification | `apps/stockpile-service/src/application/services/enhanced-notification.service.ts`    |
| Service — notification provider | `apps/stockpile-service/src/infrastructure/services/notification-provider.service.ts` |
| Service — notification template | `apps/stockpile-service/src/application/services/notification-template.service.ts`    |
| Handler — notification events   | `apps/stockpile-service/src/application/handlers/notification-event.handler.ts`       |
| DTO — tenant config             | `apps/stockpile-service/src/application/dto/tenant-notification-config.dto.ts`        |
| Lib — notifications             | `libs/notifications/`                                                                 |

### Key implementation details

- `EnhancedNotificationService` supports channels: `EMAIL`, `WHATSAPP`, `PUSH`, `SMS`.
- `NotificationProviderService` abstracts delivery per channel.
- `NotificationTemplateService` renders templates per channel type (`TemplateChannel`).
- `NotificationOptions` includes: `channels`, `priority`, `includeDocument`, `retryOnFailure`, `maxRetries`.
- `EnhancedNotificationResult` tracks per-channel success/failure with `messageId` and `error`.
- `TenantNotificationConfigDto` allows tenant-level notification configuration.
- `libs/notifications/` shared library for cross-service notification infrastructure.

---

## AC Coverage

| #   | Acceptance Criteria           | Status | Notes                                                |
| --- | ----------------------------- | ------ | ---------------------------------------------------- |
| 1   | Email integration             | ✅     | `NotificationChannel.EMAIL` supported                |
| 2   | WhatsApp integration          | ✅     | `NotificationChannel.WHATSAPP` supported             |
| 3   | Push notifications            | ✅     | `NotificationChannel.PUSH` supported                 |
| 4   | SMS notifications             | ✅     | `NotificationChannel.SMS` supported                  |
| 5   | Template-based messages       | ✅     | `NotificationTemplateService`                        |
| 6   | Retry on failure              | ✅     | `retryOnFailure`, `maxRetries` in options            |
| 7   | Per-channel delivery tracking | ✅     | `EnhancedNotificationResult` with per-channel status |
| 8   | Tenant-level configuration    | ✅     | `TenantNotificationConfigDto`                        |

---

## Gaps

1. **External provider integration not confirmed** — WhatsApp/SMS provider adapters may be stubs.
2. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                    | Priority |
| --- | ----------------------------------------------------------------------- | -------- |
| 1   | Verify WhatsApp and SMS provider adapters are functional (Twilio, etc.) | P2       |
| 2   | Write BDD spec: `messaging-integration.spec.ts`                         | P0       |
