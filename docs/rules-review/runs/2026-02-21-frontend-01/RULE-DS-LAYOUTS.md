# RULE-DS-LAYOUTS — Layouts y Patrones de Página

> **Score: 3/5 — Funcional** | Domain: design-system | Scope: bookly-mock-frontend

## Resumen

El frontend implementa el layout de dashboard descrito en la rule: header + sidebar + contenido principal. Usa MainLayout como template base. Las páginas siguen los patrones de listado, detalle y formulario. Responsive con Tailwind breakpoints.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| MainLayout template | `src/components/templates/MainLayout` | Layout principal con sidebar + header + content |
| AppHeader | `src/components/organisms/AppHeader/` | Header con navegación |
| AppSidebar | `src/components/organisms/AppSidebar/` | Sidebar con secciones por módulo |
| Listado pattern | `src/app/[locale]/recursos/page.tsx` | Título + filtros + tabla/cards + paginación |
| Detalle pattern | `src/app/[locale]/recursos/[id]/page.tsx` | Header + info panel + tabs |
| Formulario pattern | `src/app/[locale]/recursos/nuevo/page.tsx` | Campos agrupados + botones |
| Dashboard | `src/app/[locale]/dashboard/page.tsx` | KPIs + listado recientes |
| Responsive | Clases `md:`, `lg:`, `grid-cols-1 md:grid-cols-4` | Mobile-first |
| Breakpoints | Tailwind defaults (640/768/1024/1280) | Compatible con rule |

## Gaps

- **Gap-1**: No se evidencia sidebar colapsable a drawer en mobile (rule 4.2).
- **Gap-2**: Tablas extensas no se convierten explícitamente a cards en mobile (rule 4.2).
- **Gap-3**: Sin tests de responsive/visual regression.

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Implementar sidebar drawer en mobile con hamburger menu | `web-app` |
| Media | Responsive tables → card layout en mobile para DataTable | `web-app` |
| Baja | Visual regression tests con Playwright screenshots | `qa-calidad` |
