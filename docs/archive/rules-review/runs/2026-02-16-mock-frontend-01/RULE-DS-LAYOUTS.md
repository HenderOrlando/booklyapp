# RULE-DS-LAYOUTS — Layouts y Patrones de Página

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 3/5**

---

## Resumen

La rule define layout general (header + sidebar + contenido), patrones de página (listado, detalle, formulario), breakpoints responsive y composición de dashboard. El frontend implementa 5 templates con layout dashboard completo.

## Evidencia encontrada

| Archivo                                                        | Qué implementa                                 |
| -------------------------------------------------------------- | ---------------------------------------------- |
| `src/components/templates/DashboardLayout/DashboardLayout.tsx` | Layout principal: header + sidebar + contenido |
| `src/components/templates/AuthLayout/AuthLayout.tsx`           | Layout para auth (login, register)             |
| `src/components/templates/ListLayout/ListLayout.tsx`           | Patrón de página de listado                    |
| `src/components/templates/DetailLayout/DetailLayout.tsx`       | Patrón de página de detalle                    |
| `src/components/templates/MainLayout/MainLayout.tsx`           | Layout wrapper principal                       |
| `src/components/organisms/AppHeader/AppHeader.tsx`             | Header superior                                |
| `src/components/organisms/AppSidebar/AppSidebar.tsx`           | Sidebar lateral                                |
| `src/app/[locale]/layout.tsx`                                  | Layout de locale con providers                 |
| `src/app/layout.tsx`                                           | Root layout                                    |

## Criterios de Aceptación vs Implementación

| AC                                                           | Estado | Detalle                                                           |
| ------------------------------------------------------------ | ------ | ----------------------------------------------------------------- |
| Layout tipo dashboard (header + sidebar + contenido)         | ✅     | DashboardLayout con AppHeader + AppSidebar                        |
| Fondo bg.app para la app                                     | ✅     | globals.css `--color-bg-app`                                      |
| Superficies bg.surface para cards/paneles                    | ✅     | Card component y panels                                           |
| Página de listado (título, filtros, tabla/cards, paginación) | ✅     | ListLayout + ResourcesTable, InfiniteResourceList                 |
| Página de detalle (header, info, tabs)                       | ✅     | DetailLayout + páginas [id]                                       |
| Página de formulario (campos, botones)                       | ✅     | recursos/nuevo, reservas/nueva                                    |
| Breakpoints (mobile ≤640, tablet 641–1024, desktop >1024)    | ✅     | Tailwind responsive classes                                       |
| Sidebar colapsable en mobile                                 | ⚠️     | Sidebar existe pero colapso en mobile no verificado completamente |
| Tablas convertibles a cards en mobile                        | ⚠️     | DataTable existe pero responsive mode no verificado               |
| Dashboard con KPIs + acciones recientes                      | ✅     | DashboardGrid + KPIGrid + StatCard                                |

## Gaps

1. **Sin tests** para layouts y responsive behavior — Gate: max 3.
2. **Responsive mobile** no completamente verificado (sidebar collapse, table→card).
3. **Sin pruebas de viewport** (Playwright o similares).

## Plan de mejora

| Prioridad | Tarea                                                       | Skill       |
| --------- | ----------------------------------------------------------- | ----------- |
| Alta      | Agregar tests de render para templates/                     | `SK-QA-001` |
| Media     | Verificar y completar responsive behavior (sidebar, tables) | `ux-ui`     |
| Media     | Agregar tests e2e con viewports mobile/tablet/desktop       | `SK-QA-001` |

## Score justificado: **3/5**

Layouts bien estructurados con Atomic Design templates. Funcional. Sin tests → gate a max 3.
