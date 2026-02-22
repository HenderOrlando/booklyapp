# RULE-RESOURCES-RF01 — CRUD de recursos

> **Score: 3/5 — Funcional** | Domain: resources | Scope: bookly-mock-frontend

## Resumen

El frontend implementa CRUD completo de recursos con páginas de listado, creación, edición y detalle. API client dedicado, hooks con React Query, filtros avanzados, virtualización de listas. Falta cobertura de tests unitarios y algunas validaciones avanzadas.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| Listado | `src/app/[locale]/recursos/` (12 items) | Incluye page, [id], nuevo, editar |
| ResourceCard | `src/components/organisms/ResourceCard/` | Card de recurso |
| ResourceFilterPanel | `src/components/organisms/ResourceFilterPanel.tsx` (11.5KB) | Filtros avanzados |
| InfiniteResourceList | `src/components/organisms/InfiniteResourceList.tsx` | Scroll infinito |
| VirtualizedResourceList | `src/components/organisms/VirtualizedResourceList.tsx` | Lista virtualizada |
| ImportResourcesModal | `src/components/organisms/ImportResourcesModal/` | Importación masiva (RF-04) |
| MaintenanceModal | `src/components/organisms/MaintenanceModal/` | Mantenimiento (RF-06) |
| useResources | `src/hooks/useResources.ts` (9.6KB) | Queries y mutations |
| useInfiniteResources | `src/hooks/useInfiniteResources.ts` | Paginación infinita |
| resources-client | `src/infrastructure/api/resources-client.ts` (12KB) | API client completo |
| Resource types | `src/types/entities/resource.ts` (5.1KB) | Tipos tipados |
| E2E | `e2e/resources.spec.ts`, `e2e/smoke/resources.smoke.spec.ts`, `e2e/regression/resource-edit-selectors.spec.ts` | Tests E2E + smoke + regression |
| i18n | `src/i18n/translations/{en,es}/resources.json` | Traducciones |

## Gaps

- **Gap-1**: No se evidencia validación frontend de "capacidad debe ser entero > 0" explícita en formulario.
- **Gap-2**: No hay UI de confirmación especial antes de eliminar recurso (ConfirmDialog existe pero ¿se usa aquí?).
- **Gap-3**: No se evidencia notificación a usuarios con reservas previas cuando se modifica ubicación/disponibilidad.
- **Gap-4**: Sin tests unitarios para useResources hook.

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Media | Agregar validaciones Zod/Yup para capacidad > 0, nombre requerido, etc. | `web-app` |
| Media | Verificar ConfirmDialog antes de eliminar recurso | `web-app` |
| Media | Tests unitarios para useResources hooks | `qa-calidad` |
| Baja | Agregar toast de notificación cuando recurso modificado afecta reservas | `web-app` |
