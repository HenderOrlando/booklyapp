# RULE-RSRC-RF03 — Definir atributos clave del recurso

> **Rule file:** `bookly-resource-rf03-definir-attrs-recurso.md`
> **Domain:** resources-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                       | Path                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------- |
| Entity                         | `apps/resources-service/src/domain/entities/resource.entity.ts`                   |
| Service — attribute validation | `apps/resources-service/src/application/services/attribute-validation.service.ts` |
| Service — resource             | `apps/resources-service/src/application/services/resource.service.ts`             |

### Key implementation details

- `ResourceEntity` has mandatory fields: `name`, `description`, `type`, `categoryId`, `capacity`, `location`.
- Optional fields: `floor`, `building`, `attributes: Record<string, any>`, `programIds`.
- `status` enum: `AVAILABLE`, `RESERVED`, `MAINTENANCE`, `UNAVAILABLE`.
- `availabilityRules` object: `requiresApproval`, `maxAdvanceBookingDays`, `minBookingDurationMinutes`, `maxBookingDurationMinutes`, `allowRecurring`.
- `maintenanceSchedule` object: `nextMaintenanceDate`, `lastMaintenanceDate`, `maintenanceFrequencyDays`.
- `AttributeValidationService.validateOrThrow()` validates JSON attributes by resource type.
- Entity methods for booking validation: `isValidBookingDuration()`, `requiresApproval()`, `allowsRecurringBooking()`.

---

## AC Coverage

| #   | Acceptance Criteria                                        | Status | Notes                                                                           |
| --- | ---------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| 1   | Name (unique identifier)                                   | ✅     | `name` + `code` fields, uniqueness validated by code                            |
| 2   | Description                                                | ✅     | `description` field                                                             |
| 3   | Location (building, floor, space)                          | ✅     | `location`, `floor`, `building` fields                                          |
| 4   | Capacity                                                   | ✅     | `capacity` field                                                                |
| 5   | Status (Available, In use, Maintenance, Out of service)    | ✅     | `ResourceStatus` enum                                                           |
| 6   | Availability rules (min/max duration, approval, recurring) | ✅     | `availabilityRules` embedded object                                             |
| 7   | Usage rules                                                | ⚠️     | Partially covered by `availabilityRules`; no dedicated "usage rules" text field |
| 8   | Attributes validated by resource type                      | ✅     | `AttributeValidationService`                                                    |
| 9   | Custom/dynamic attributes                                  | ✅     | `attributes: Record<string, any>`                                               |

---

## Gaps

1. **No dedicated "usage rules" field** — The rule mentions explicit usage rules text; only `availabilityRules` object exists.
2. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                                                | Priority |
| --- | --------------------------------------------------------------------------------------------------- | -------- |
| 1   | Consider adding `usageRules: string` or `usageRules: Record<string, any>` field to `ResourceEntity` | P3       |
| 2   | Write BDD spec: `resource-attributes-validation.spec.ts`                                            | P0       |
