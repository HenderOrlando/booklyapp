# RULE-RSRC-RF05 — Configuración de reglas de disponibilidad

> **Rule file:** `bookly-resource-rf05-configure-reglas-disponibilidad-recursos.md`
> **Domain:** resources-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                           | Path                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| Entity — resource                  | `apps/resources-service/src/domain/entities/resource.entity.ts`                                |
| Service — resource                 | `apps/resources-service/src/application/services/resource.service.ts`                          |
| Event — rules updated              | `apps/resources-service/src/application/events/availability-rules-updated.event.ts`            |
| Event handler — check availability | `apps/resources-service/src/application/event-handlers/check-resource-availability.handler.ts` |

### Key implementation details

- `ResourceEntity.availabilityRules` embedded object:
  - `requiresApproval: boolean`
  - `maxAdvanceBookingDays: number`
  - `minBookingDurationMinutes: number`
  - `maxBookingDurationMinutes: number`
  - `allowRecurring: boolean`
- `ResourceService.updateResource()` publishes `AVAILABILITY_RULES_UPDATED` event when rules change.
- Entity methods: `isValidBookingDuration()`, `requiresApproval()`, `allowsRecurringBooking()`.
- `CheckResourceAvailabilityHandler` responds to cross-service queries about resource availability.

---

## AC Coverage

| #   | Acceptance Criteria              | Status | Notes                                                    |
| --- | -------------------------------- | ------ | -------------------------------------------------------- |
| 1   | Min/max booking duration         | ✅     | `minBookingDurationMinutes`, `maxBookingDurationMinutes` |
| 2   | Max advance booking days         | ✅     | `maxAdvanceBookingDays`                                  |
| 3   | Approval required flag           | ✅     | `requiresApproval`                                       |
| 4   | Recurring booking flag           | ✅     | `allowRecurring`                                         |
| 5   | Blocked periods configuration    | ⚠️     | No explicit blocked-periods array in entity              |
| 6   | Priority-based usage rules       | ⚠️     | No priority/role-based rules in `availabilityRules`      |
| 7   | Event published on rule changes  | ✅     | `AVAILABILITY_RULES_UPDATED` event                       |
| 8   | Cross-service availability check | ✅     | `CheckResourceAvailabilityHandler` event handler         |

---

## Gaps

1. **No blocked-periods configuration** — Rule mentions configuring blocked periods; entity only has duration limits.
2. **No priority/role-based rules** — Rule mentions usage priorities by role; not modeled.
3. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                     | Priority |
| --- | ------------------------------------------------------------------------ | -------- |
| 1   | Add `blockedPeriods: Array<{start, end, reason}>` to `availabilityRules` | P2       |
| 2   | Add `priorityRules: Array<{role, priority}>` to `availabilityRules`      | P2       |
| 3   | Write BDD spec: `availability-rules-sync.spec.ts`                        | P0       |
