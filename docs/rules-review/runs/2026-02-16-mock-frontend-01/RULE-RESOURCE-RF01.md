# RULE-RESOURCE-RF01 — CRUD de recursos

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 3/5**

## Evidencia

- `src/app/[locale]/recursos/page.tsx` — Lista de recursos con filtros y tabla
- `src/app/[locale]/recursos/[id]/page.tsx` — Detalle de recurso
- `src/app/[locale]/recursos/nuevo/page.tsx` — Formulario de creación
- `src/app/[locale]/recursos/[id]/editar/page.tsx` — Formulario de edición
- `src/app/[locale]/recursos/components/ResourcesTable.tsx` — Tabla de recursos
- `src/app/[locale]/recursos/components/ResourceFiltersSection.tsx` — Filtros avanzados
- `src/app/[locale]/recursos/components/ResourceStatsCards.tsx` — KPIs
- `src/components/organisms/ResourceCard/ResourceCard.tsx` — Tarjeta de recurso
- `src/components/organisms/ResourceFilterPanel.tsx` — Panel de filtros
- `src/hooks/useResources.ts` — Hook CRUD
- `src/hooks/mutations/useResourceMutations.ts` — Mutations (create, update, delete)
- `src/infrastructure/api/resources-client.ts` — Cliente API
- `src/infrastructure/api/endpoints.ts` (L52–85) — RESOURCES_ENDPOINTS
- `src/types/entities/resource.ts` — Resource, CreateResourceDto, UpdateResourceDto
- `src/infrastructure/mock/data/resources-service.mock.ts` — Mock data
- `src/i18n/translations/es/resources.json` — Traducciones

## ACs: ✅ Crear | ✅ Editar | ✅ Eliminar/deshabilitar | ⚠️ Validaciones (parciales en frontend) | ⚠️ Conflicto disponibilidad (backend)

## Score: **3/5** — Flujo CRUD completo con pages, tipos, hooks, endpoints. Sin tests.
