# RULE-FLUJO-RSRC — Flujos de Gestión de Recursos

> **Rule file:** `.windsurf/rules/bookly-flujos-resources.md`
> **Domain:** resources · **Trigger:** manual
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

### Process Coverage

| Process                 | Commands Found                                                                    |
| ----------------------- | --------------------------------------------------------------------------------- |
| Create resource         | create-resource                                                                   |
| Update resource         | update-resource                                                                   |
| Delete/restore resource | delete-resource, restore-resource                                                 |
| Category management     | create-category                                                                   |
| Bulk import             | import-resources, start-async-import, validate-import, rollback-import            |
| Maintenance scheduling  | schedule-maintenance, start-maintenance, complete-maintenance, cancel-maintenance |
| Availability rules sync | availability-rules-updated event                                                  |
| Event handlers          | check-resource-availability, query-candidate-resources, query-resource-by-id/ids  |

## Gaps & Tasks

| Priority | Task                                         | Skill                   |
| -------- | -------------------------------------------- | ----------------------- |
| P0       | BDD specs for resource CRUD + import flows   | `qa-calidad`            |
| P2       | Create dedicated RF rule files (RF-01→RF-06) | `gestion-datos-calidad` |
