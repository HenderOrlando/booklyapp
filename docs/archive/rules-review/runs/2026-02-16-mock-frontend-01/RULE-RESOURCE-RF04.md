# RULE-RESOURCE-RF04 — Importación masiva CSV

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 2/5**

## Evidencia

- `src/types/entities/resource.ts` (L146–160) — ImportResourcesDto (csvContent, mode, skipErrors), ImportResult
- `src/infrastructure/api/endpoints.ts` (L66–68) — IMPORT_CSV, EXPORT_CSV, EXPORT_PDF
- `package.json` — xlsx@0.18.5 para manejo de archivos

## ACs: ✅ Tipos para import/export | ✅ Endpoints definidos | ⚠️ UI de importación (no hay page dedicada verificada) | ✅ xlsx dependency

## Gaps: No se encontró page o modal dedicada para importación CSV en las rutas. Funcionalidad posiblemente integrada en la page de recursos pero no verificada.

## Score: **2/5** — Parcial. Tipos y endpoints listos, UI de importación no evidente.
