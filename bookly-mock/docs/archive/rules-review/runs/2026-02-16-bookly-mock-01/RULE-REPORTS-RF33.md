# RULE-REPORTS-RF33 — Exportar Reportes en CSV

> **Rule file:** `.windsurf/rules/bookly-reports-rf33-exportar-en-csv.md`
> **Domain:** reports · **Service:** `apps/reports-service/`
> **Score: 3 / 5** · **Gate:** ⚠️ No tests

## Evidence

- `src/application/commands/export.commands.ts`
- `src/application/handlers/export.handlers.ts`
- `src/application/queries/export.queries.ts`
- `src/application/services/export.service.ts`
- `src/application/services/export-processor.service.ts`
- `src/application/services/generators/csv-generator.service.ts`
- `src/application/services/generators/excel-generator.service.ts`
- `docs/RF-33_EXPORT_TESTING_GUIDE.md`
- `docs/requirements/RF-33_EXPORTACION_CSV.md`

## ACs Coverage

| AC | Status |
| --- | --- |
| CSV export of reports | ✅ CSV generator service |
| Selectable data columns | ⚠️ Needs verification |
| Clear column headers | ⚠️ Needs verification |
| Filter by date/type/user/status | ✅ Export queries |
| Export history | ⚠️ Needs verification |
| Download notification | ⚠️ Needs verification |
| Excel export (bonus) | ✅ Excel generator exists |

## Gaps & Tasks

| Priority | Task | Skill |
| --- | --- | --- |
| P0 | Write BDD specs per testing guide | `qa-calidad` |
| P1 | Verify customizable column selection | `data-reporting` |
| P2 | Verify export history persistence | `backend` |
