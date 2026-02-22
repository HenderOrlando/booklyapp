# RULE-STOCK-RF29 — Recordatorios de reserva personalizables

> **Rule file:** `bookly-stockpile-rf29-recordatorios-reserva-personalizables.md`
> **Domain:** stockpile-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                      | Path                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Service — reminder            | `apps/stockpile-service/src/application/services/reminder.service.ts`                |
| Entity — reminder config      | `apps/stockpile-service/src/domain/entities/reminder-configuration.entity.ts`        |
| Schema — reminder config      | `apps/stockpile-service/src/infrastructure/schemas/reminder-configuration.schema.ts` |
| Handler — notification events | `apps/stockpile-service/src/application/handlers/notification-event.handler.ts`      |

### Key implementation details

- `ReminderConfigurationEntity` models configurable reminders:
  - `type`: `ReminderType` enum (e.g., `APPROVAL_PENDING`, `CHECK_OUT_REMINDER`).
  - `channels`: `NotificationChannel[]` — user-selected delivery channels.
  - `frequency`: `ReminderFrequency` enum (`HOURLY`, `DAILY`, `ONCE`, `CUSTOM`).
  - `triggerBeforeMinutes`: configurable lead time (30 min, 1 hour, 24 hours).
  - `cronExpression`: for custom frequency schedules.
  - `maxRetries`, `messageTemplate`, `metadata`.
  - `metadata.targetRoles`, `metadata.businessHoursOnly`, `metadata.includeWeekends`.
- `ReminderService`:
  - `createConfiguration()`, `getConfigurationByType()`, `getActiveConfigurations()`, `updateConfiguration()`.
  - `scheduleReminders()` — called from `NotificationEventHandler` on reservation created/approved.
  - `cancelReminders()` — called on reservation cancelled/rejected/updated.
  - Uses `@nestjs/schedule` with `@Cron()` for periodic reminder checks.
- Factory methods: `createApprovalPendingReminder()`, `createCheckOutReminder()`.
- Reminders automatically cancelled when reservation is cancelled (in `handleReservationCancelled`).

---

## AC Coverage

| #   | Acceptance Criteria                             | Status | Notes                                               |
| --- | ----------------------------------------------- | ------ | --------------------------------------------------- |
| 1   | User-configurable reminder intervals            | ✅     | `triggerBeforeMinutes` (30, 60, 1440)               |
| 2   | Multi-channel delivery (email, WhatsApp)        | ✅     | `channels: NotificationChannel[]`                   |
| 3   | Default 30 min reminder if not configured       | ✅     | `createCheckOutReminder(triggerBeforeMinutes=30)`   |
| 4   | Reminder includes reservation details           | ✅     | `messageTemplate` with placeholders                 |
| 5   | Cancel reminders on reservation cancellation    | ✅     | `cancelReminders()` in event handler                |
| 6   | Admin audit of sent reminders                   | ⚠️     | No dedicated audit/history query for sent reminders |
| 7   | Consolidate reminders for same-day reservations | ⚠️     | No consolidation logic found                        |
| 8   | Cron-based scheduling                           | ✅     | `@Cron()` decorators + `CronExpression`             |

---

## Gaps

1. **No reminder history/audit query** — Rule requires admins to view sent reminder history.
2. **No consolidation** — Multiple same-day reminders not consolidated into single message.
3. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                                                      | Priority |
| --- | --------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Add `getReminderHistory()` query for admin audit                                                          | P2       |
| 2   | Implement same-day reminder consolidation logic                                                           | P2       |
| 3   | Write BDD specs: `reminder-config.spec.ts`, `reminder-schedule.spec.ts`, `reminder-consolidation.spec.ts` | P0       |
