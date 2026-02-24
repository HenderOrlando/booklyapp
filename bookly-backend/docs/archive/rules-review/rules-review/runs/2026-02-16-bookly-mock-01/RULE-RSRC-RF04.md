# RULE-RSRC-RF04 — Importación masiva de recursos mediante CSV

> **Rule file:** `bookly-resource-rf04-importar-recursos-csv.md`
> **Domain:** resources-service
> **Score:** 3 / 5

---

## Evidence

| Artifact               | Path                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Command — import       | `apps/resources-service/src/application/commands/import-resources.command.ts`         |
| Command — validate     | `apps/resources-service/src/application/commands/validate-import.command.ts`          |
| Command — rollback     | `apps/resources-service/src/application/commands/rollback-import.command.ts`          |
| Command — async import | `apps/resources-service/src/application/commands/start-async-import.command.ts`       |
| Handler — template     | `apps/resources-service/src/application/handlers/generate-import-template.handler.ts` |
| Handler — get job      | `apps/resources-service/src/application/handlers/get-import-job.handlers.ts`          |
| Entity — import job    | `apps/resources-service/src/domain/entities/import-job.entity.ts`                     |

### Key implementation details

- `ImportResourcesCommand` accepts: `csvContent`, `mode` (`CREATE` / `UPDATE`), `skipErrors`, `userId`.
- Full import pipeline: validate → import → rollback on failure.
- `ImportJobEntity` tracks job status, progress, errors.
- `StartAsyncImportCommand` supports async/background import for large files.
- `GenerateImportTemplateHandler` generates CSV template for users.
- `RollbackImportCommand` allows undoing a failed or incorrect import.

---

## AC Coverage

| #   | Acceptance Criteria                                | Status | Notes                                        |
| --- | -------------------------------------------------- | ------ | -------------------------------------------- |
| 1   | Import resources from CSV files                    | ✅     | `ImportResourcesCommand` with `csvContent`   |
| 2   | Validation before import (format, required fields) | ✅     | `ValidateImportCommand` dedicated step       |
| 3   | Support create and update modes                    | ✅     | `ImportResourceMode.CREATE` / `UPDATE`       |
| 4   | Error handling with skip option                    | ✅     | `skipErrors: boolean` flag                   |
| 5   | Async import for large files                       | ✅     | `StartAsyncImportCommand`                    |
| 6   | Job tracking with progress                         | ✅     | `ImportJobEntity` with status tracking       |
| 7   | Rollback capability                                | ✅     | `RollbackImportCommand`                      |
| 8   | CSV template generation                            | ✅     | `GenerateImportTemplateHandler`              |
| 9   | Integration with university systems                | ⚠️     | No external system integration adapter found |

---

## Gaps

1. **No external system integration** — Rule mentions integration with university systems; only CSV import is implemented.
2. **No BDD tests** — 0 spec files.

---

## Improvement Tasks

| #   | Task                                                                                              | Priority |
| --- | ------------------------------------------------------------------------------------------------- | -------- |
| 1   | Design adapter interface for university system integration (future phase)                         | P3       |
| 2   | Write BDD specs: `import-resources.spec.ts`, `validate-import.spec.ts`, `rollback-import.spec.ts` | P0       |
