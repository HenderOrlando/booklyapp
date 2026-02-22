# Resources Module Alignment Worklog

**Date:** 2026-02-18
**Scope:** Recursos (listar, crear, editar, ver detalle) + contratos asociados en frontend/mock

## Objective

Eliminar 404s y drift de contrato en el módulo de Recursos, alineando frontend y mock al contrato backend (`resources-service`) con `Resource.programIds` como fuente de verdad para asociaciones con programas.

## Contract Decisions Applied

1. `program-resources` se deja de usar en flujos de Recursos (detalle/crear/editar).
2. Asociaciones recurso-programa se gestionan con `programIds` dentro de `Resource` (`POST/PATCH /resources`).
3. Catálogo de programas se consume desde `GET /programs`.
4. Para create/update se sanitiza `availabilityRules` al shape soportado por DTO backend.

## Files Updated

### Frontend pages/hooks

- `src/app/[locale]/recursos/page.tsx`
  - Normalización tipada de payloads para listas de recursos/categorías.
  - Copy del toggle actualizado a `view_list`.
- `src/app/[locale]/recursos/[id]/page.tsx`
  - Programas asociados derivados desde `resource.programIds` + `GET /programs`.
  - Rutas locale-aware para navegación desde detalle.
- `src/app/[locale]/recursos/[id]/editar/page.tsx`
  - Eliminada dependencia de `program-resources`.
  - Persistencia de selección por `programIds` en `PATCH /resources/:id`.
  - Sanitización de `availabilityRules` al guardar.
- `src/app/[locale]/recursos/nuevo/page.tsx`
  - Persistencia de `programIds` en `POST /resources`.
  - Sanitización de `availabilityRules` al crear.
  - Carga tipada de categorías/programas.
- `src/hooks/usePrograms.ts`
  - Endpoints migrados a `/programs`.
  - `useProgramResources` ahora usa `/resources?programId=...`.
- `src/hooks/usePrefetch.ts`
  - Prefetch de programas actualizado a `/programs/:id`.
  - Tipado y normalización en prefetch paginado.

### Mock layer

- `src/infrastructure/mock/mockService.ts`
  - Soporte para `/programs` (con compatibilidad legacy `/academic-programs`).
  - Filtro por `programId` en `GET /resources`.
- `src/infrastructure/mock/data/resources-service.mock.ts`
  - `resource.programIds` normalizados a IDs `prog_*` (consistentes con `mockAcademicPrograms`).

### i18n

- `src/i18n/translations/en/resources.json`
- `src/i18n/translations/es/resources.json`
- `src/i18n/translations/en/resource_detail.json`
- `src/i18n/translations/es/resource_detail.json`

Corrección de placeholders para `next-intl`: `{count}`, `{total}`, `{date}`.

## New Regression Test Added

- `src/infrastructure/mock/data/resources-service.mock.contract.test.ts`
  - Verifica que todos los `resource.programIds` existan en `mockAcademicPrograms`.
  - Verifica ausencia de IDs duplicados por recurso.

## Validation Evidence

### ESLint (focalizado)

```bash
npx eslint "src/app/[locale]/recursos/[id]/page.tsx" \
  "src/app/[locale]/recursos/[id]/editar/page.tsx" \
  "src/app/[locale]/recursos/nuevo/page.tsx" \
  "src/app/[locale]/recursos/page.tsx" \
  "src/hooks/usePrograms.ts" \
  "src/hooks/usePrefetch.ts" \
  "src/infrastructure/mock/mockService.ts" \
  "src/i18n/translations/es/resource_detail.json" \
  "src/i18n/translations/en/resource_detail.json"
```

Result: **PASS**

### Jest (contratos)

```bash
npx jest \
  src/__tests__/contracts/endpoint-contract.test.ts \
  src/infrastructure/api/__tests__/reservations-client.contract.test.ts \
  src/infrastructure/mock/data/resources-service.mock.contract.test.ts \
  --runInBand
```

Result: **PASS** (3 suites, 41 tests)

## Notes

- `type-check` global del frontend sigue fallando por issues preexistentes fuera del alcance de Recursos (admin/reportes/hooks legacy).
- El scope de este worklog se mantiene en Recursos + alineación contractual asociada.
