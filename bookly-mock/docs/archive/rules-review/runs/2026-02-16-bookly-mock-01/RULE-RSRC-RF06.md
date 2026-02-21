# RULE-RSRC-RF06 — Mantenimiento de recursos

> **Rule file:** `bookly-resource-rf06-mantenimiento-recursos.md`
> **Domain:** resources-service
> **Score:** 3 / 5

---

## Evidence

| Artifact              | Path                                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| Command — schedule    | `apps/resources-service/src/application/commands/schedule-maintenance.command.ts` |
| Command — start       | `apps/resources-service/src/application/commands/start-maintenance.command.ts`    |
| Command — complete    | `apps/resources-service/src/application/commands/complete-maintenance.command.ts` |
| Command — cancel      | `apps/resources-service/src/application/commands/cancel-maintenance.command.ts`   |
| Handler — schedule    | `apps/resources-service/src/application/handlers/schedule-maintenance.handler.ts` |
| Service — maintenance | `apps/resources-service/src/application/services/maintenance.service.ts`          |
| Entity — maintenance  | `apps/resources-service/src/domain/entities/maintenance.entity.ts`                |

### Key implementation details

- `MaintenanceEntity` fields: `resourceId`, `type`, `title`, `description`, `scheduledStartDate`, `scheduledEndDate`, `actualStartDate`, `actualEndDate`, `status`, `performedBy`, `cost`, `notes`, `affectsAvailability`, `audit`.
- Full lifecycle: `SCHEDULED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`.
- `MaintenanceService.startMaintenanceWithResourceBlock()` — blocks resource when maintenance starts (sets `ResourceStatus.MAINTENANCE`).
- `MaintenanceService.completeMaintenanceWithResourceRestore()` — restores resource to `AVAILABLE` when maintenance completes.
- `MaintenanceService.cancelMaintenanceWithResourceRestore()` — restores resource if cancelled during `IN_PROGRESS`.
- Events published: `RESOURCE_STATUS_CHANGED` on block/restore.
- Query methods: `getScheduledMaintenances()`, `getMaintenancesInProgress()`, `getMaintenancesByDateRange()`, `getUpcomingMaintenancesByResource()`.
- `ResourceEntity.needsMaintenance()` checks against `maintenanceSchedule.nextMaintenanceDate`.
- `ResourceService.getResourcesNeedingMaintenance()` returns resources due for maintenance.

---

## AC Coverage

| #   | Acceptance Criteria               | Status | Notes                                                      |
| --- | --------------------------------- | ------ | ---------------------------------------------------------- |
| 1   | Register damage/incidents         | ✅     | `MaintenanceEntity` with `type`, `description`, `notes`    |
| 2   | Schedule maintenance              | ✅     | `ScheduleMaintenanceCommand` with dates                    |
| 3   | Track maintenance lifecycle       | ✅     | `SCHEDULED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`    |
| 4   | Block resource during maintenance | ✅     | `startMaintenanceWithResourceBlock()`                      |
| 5   | Restore resource after completion | ✅     | `completeMaintenanceWithResourceRestore()`                 |
| 6   | Cost tracking                     | ✅     | `cost` field on entity                                     |
| 7   | Maintenance frequency tracking    | ✅     | `maintenanceSchedule.maintenanceFrequencyDays` on resource |
| 8   | Query upcoming maintenances       | ✅     | `getUpcomingMaintenancesByResource()`                      |
| 9   | Event-driven status changes       | ✅     | `RESOURCE_STATUS_CHANGED` events on block/restore          |

---

## Gaps

1. **No incident reporting form** — Entity captures data but no dedicated incident-reporting command/handler.
2. **No automatic maintenance scheduling** — `needsMaintenance()` exists but no cron/job triggers it automatically.
3. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                                                         | Priority |
| --- | ------------------------------------------------------------------------------------------------------------ | -------- |
| 1   | Add `ReportIncidentCommand` for dedicated incident flow                                                      | P2       |
| 2   | Add scheduled job to auto-detect resources needing maintenance                                               | P3       |
| 3   | Write BDD specs: `schedule-maintenance.spec.ts`, `start-maintenance.spec.ts`, `complete-maintenance.spec.ts` | P0       |
