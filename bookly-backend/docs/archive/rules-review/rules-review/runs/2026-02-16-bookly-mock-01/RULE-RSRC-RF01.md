# RULE-RSRC-RF01 — Crear, editar y eliminar recursos

> **Rule file:** `bookly-resource-rf01-crear-editar-eliminar-recursos.md`
> **Domain:** resources-service
> **Score:** 3 / 5

---

## Evidence

| Artifact               | Path                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| Command — create       | `apps/resources-service/src/application/commands/create-resource.command.ts`     |
| Command — update       | `apps/resources-service/src/application/commands/update-resource.command.ts`     |
| Command — delete       | `apps/resources-service/src/application/commands/delete-resource.command.ts`     |
| Command — restore      | `apps/resources-service/src/application/commands/restore-resource.command.ts`    |
| Handler — create       | `apps/resources-service/src/application/handlers/create-resource.handler.ts`     |
| Handler — delete       | `apps/resources-service/src/application/handlers/delete-resource.handler.ts`     |
| Service                | `apps/resources-service/src/application/services/resource.service.ts`            |
| Entity                 | `apps/resources-service/src/domain/entities/resource.entity.ts`                  |
| Event — status changed | `apps/resources-service/src/application/events/resource-status-changed.event.ts` |

### Key implementation details

- `ResourceEntity` includes: `id`, `code`, `name`, `description`, `type`, `categoryId`, `capacity`, `location`, `floor`, `building`, `attributes`, `programIds`, `status`, `isActive`, `audit`.
- `ResourceService.createResource()` validates unique code, validates attributes by type, publishes `RESOURCE_CREATED` event, logs action.
- `ResourceService.updateResource()` validates code uniqueness on change, validates attributes, publishes `RESOURCE_CATEGORY_CHANGED` / `AVAILABILITY_RULES_UPDATED` events, invalidates Redis cache.
- `ResourceService.deleteResource()` performs soft delete, publishes `RESOURCE_DELETED` event, invalidates cache.
- `ResourceService.restoreResource()` restores soft-deleted resource, publishes `RESOURCE_RESTORED` event.
- Entity methods: `activate()`, `deactivate()`, `setMaintenance()`, `setAvailable()`, `isAvailableForBooking()`.

---

## AC Coverage

| #   | Acceptance Criteria                                                          | Status | Notes                                                                |
| --- | ---------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| 1   | Admins can create resource with name, type, location, availability, capacity | ✅     | `CreateResourceCommand` + `ResourceService.createResource()`         |
| 2   | Edit resources with audit trail                                              | ✅     | `updateResource()` + `AuditInfo` field on entity                     |
| 3   | Delete resources with restrictions by state                                  | ✅     | Soft delete via `deleteResource()`, restore via `restoreResource()`  |
| 4   | Disabled instead of deleted if previously used                               | ✅     | `deactivate()` sets `isActive=false`, `status=UNAVAILABLE`           |
| 5   | Conflict check on availability vs active reservations                        | ⚠️     | No explicit reservation-conflict check before modifying availability |
| 6   | Validation: no name/type/location required                                   | ✅     | Entity constructor requires `name!`, `type!`, `location!`            |
| 7   | Capacity > 0 validation                                                      | ⚠️     | No explicit `capacity > 0` validation in service                     |
| 8   | No overlapping blocked periods                                               | ⚠️     | Not validated in service layer                                       |
| 9   | Block delete if active reservations                                          | ⚠️     | No cross-service check with availability-service                     |
| 10  | Change history audit                                                         | ✅     | `AuditInfo` on entity, events published for all mutations            |

---

## Gaps

1. **No reservation-conflict validation** — Modifying availability or deleting a resource does not check availability-service for active reservations.
2. **Missing `capacity > 0` validation** — Service accepts any number without validation.
3. **No overlapping blocked-period validation** — `availabilityRules` does not validate against existing blocked periods.
4. **No BDD tests** — 0 spec files for resources-service.

---

## Improvement Tasks

| #   | Task                                                                                               | Priority |
| --- | -------------------------------------------------------------------------------------------------- | -------- |
| 1   | Add cross-service query to availability-service before delete/disable to check active reservations | P1       |
| 2   | Add `capacity > 0` validation in `ResourceService.createResource()` and `updateResource()`         | P1       |
| 3   | Add blocked-period overlap validation for `availabilityRules`                                      | P2       |
| 4   | Write BDD specs: `create-resource.spec.ts`, `update-resource.spec.ts`, `delete-resource.spec.ts`   | P0       |
