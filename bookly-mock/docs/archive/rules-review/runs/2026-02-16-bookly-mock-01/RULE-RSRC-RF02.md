# RULE-RSRC-RF02 — Asociar recurso a categoría y programa académico

> **Rule file:** `bookly-resource-rf02-asociar-recurso-a-categorias-o-programas.md`
> **Domain:** resources-service
> **Score:** 3 / 5

---

## Evidence

| Artifact                  | Path                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Command — create category | `apps/resources-service/src/application/commands/create-category.command.ts`       |
| Handler — create category | `apps/resources-service/src/application/handlers/create-category.handler.ts`       |
| Handler — get categories  | `apps/resources-service/src/application/handlers/get-categories.handler.ts`        |
| Service — category        | `apps/resources-service/src/application/services/category.service.ts`              |
| Entity — category         | `apps/resources-service/src/domain/entities/category.entity.ts`                    |
| Entity — resource         | `apps/resources-service/src/domain/entities/resource.entity.ts`                    |
| Event — category changed  | `apps/resources-service/src/application/events/resource-category-changed.event.ts` |

### Key implementation details

- `CategoryEntity` supports: `id`, `code`, `name`, `description`, `type`, `color`, `icon`, `parentId` (hierarchy), `isActive`, `metadata`, `audit`.
- `ResourceEntity.categoryId` associates resource to a category.
- `ResourceEntity.programIds: string[]` associates resource to multiple programs.
- `ResourceService.updateResource()` publishes `RESOURCE_CATEGORY_CHANGED` event when `categoryId` changes.
- `ResourceService.getResourcesByCategory()` and `getResourcesByProgram()` enable filtered queries.
- Category hierarchy supported via `parentId` and `isRoot()` method.

---

## AC Coverage

| #   | Acceptance Criteria                             | Status | Notes                                                                              |
| --- | ----------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| 1   | Resources classified in configurable categories | ✅     | `CategoryEntity` with CRUD, hierarchy via `parentId`                               |
| 2   | Resource associated to one or more programs     | ✅     | `ResourceEntity.programIds: string[]`                                              |
| 3   | Multiple category assignment                    | ⚠️     | Only single `categoryId` per resource, not array                                   |
| 4   | Admins can edit category and program            | ✅     | `updateResource()` supports `categoryId` and `programIds`                          |
| 5   | Dynamic filter by category or program           | ✅     | `getResourcesByCategory()`, `getResourcesByProgram()`, `searchResourcesAdvanced()` |

---

## Gaps

1. **Single category only** — `ResourceEntity.categoryId` is a single string, not an array. Rule says a resource can belong to multiple categories.
2. **No notification on reassignment** — Rule requires notifying affected users when category/program changes; event is published but no notification consumer confirmed.
3. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                                         | Priority |
| --- | -------------------------------------------------------------------------------------------- | -------- |
| 1   | Evaluate changing `categoryId: string` to `categoryIds: string[]` for multi-category support | P2       |
| 2   | Add notification consumer for `RESOURCE_CATEGORY_CHANGED` event to notify affected users     | P2       |
| 3   | Write BDD specs: `create-category.spec.ts`, `assign-resource-category.spec.ts`               | P0       |
