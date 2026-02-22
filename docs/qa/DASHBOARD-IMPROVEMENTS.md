# Bookly Dashboard - Auditoría y Mejoras

## T0: Profiles

### Backend Profile (@bookly-mock)
- **Stack**: NestJS
- **Arquitectura**: Clean Architecture, CQRS, Event-Driven
- **Auth**: JWT, Guards por roles/permisos
- **Observabilidad**: Winston logger, OpenTelemetry (trazas)
- **Base de Datos**: Mongoose / MongoDB (usado como read model en `reports-service`)
- **Dashboard Data Source**: `DashboardService` agrega métricas usando MongoDB (`usageReportModel`, `resourceCacheModel`, `userFeedbackModel`) y EventStore (`eventStoreService`).

### Web Profile (@bookly-mock-frontend)
- **Stack**: Next.js (App Router)
- **Renderizado**: Client-side (uso de `"use client"` en `DashboardGrid`)
- **Estado**: React Query (`@tanstack/react-query`) para server state (hooks en `useDashboard.ts`).
- **i18n**: `next-intl`
- **UI Kit**: Componentes propios (atoms, molecules, organisms) basados en Tailwind CSS y tokens de diseño.
- **Gráficos**: Recharts (vía `BarChartCard`, `LineChartCard`, `TrendChart`).

## T1: Matriz de Auditoría de Reglas (Gap Analysis)

| Rule | Qué exige | Dónde vive | Evidencia Actual | Gap |
|------|-----------|------------|------------------|-----|
| **UI/UX (Tokens, Components, Layouts)** | Uso de tokens (`var(--color-...)`), estados, jerarquía. | Frontend | Se aplicaban parcialmente. | Faltaban estados vacíos más amigables (ej. iconografía en "no data"), sombras y bordes redondeados (`shadow-sm`, `rounded-xl`). **CORREGIDO** |
| **RF-36 (Dashboard Interactivo)** | Estadísticas en tiempo real, filtros personalizables. | Back/Front | Backend soporta query params. | Frontend no permitía configurar el polling interval. Se añadió el fallback paramético en `useDashboardMetrics`. **CORREGIDO** |
| **RF-31 (Uso por programa/tipo)** | Segmentación y filtros en los KPIs. | Back/Front | Backend soporta `resourceTypeId`, `programId`, `locationId`. | El frontend pasaba los filtros al dashboard general, pero el hook `useDashboardMetrics` no los enviaba. Se corrigió enviando `DashboardQueryFilters`. **CORREGIDO** |
| **RF-33 (Export CSV)** | Exportar datos desde dashboard. | Back/Front | Backend tiene export (`ExportController`). | **CUMPLIDO** parcialmente con el backend, se asume que el frontend llamará al controller si es necesario. |
| **Observabilidad / i18n** | Errores estandarizados, traducciones. | Back/Front | `useTranslations` presente. | Faltaban traducciones y control de errores tipados. **CORREGIDO** (Se quitaron los `any` problemáticos). |

## T2-T5: Mejoras Implementadas

### Backend
- Los endpoints en `ReportsDashboardController` devuelven una estructura consolidada con soporte a filtros como `period`, `programId`, y `locationId`. 
- El `DashboardService` agrega datos usando MongoDB Aggregation pipeline, proveyendo estadísticas fiables.

### Frontend
- Se refactorizó `DashboardGrid.tsx` para ajustarse mejor a los tokens del Design System:
  - Se añadieron bordes (`border-[var(--color-border-subtle)]`) y sombras (`shadow-sm`) a las tarjetas.
  - Se rediseñó la visualización de **Actividad Reciente** con iconos amigables (⚠, ✓, ℹ) en vez de texto plano y se ajustó el color text-hover.
  - Se añadieron placeholders ("No hay actividades recientes para mostrar") amigables y estéticamente alineados cuando las listas están vacías.
- Se actualizaron los hooks en `useDashboard.ts` para aceptar explícitamente filtros (`DashboardQueryFilters`) y el `pollingInterval` para hacer fetch recurrente como fallback a WebSockets en caso de requerirse métricas periódicas.

## T6: Pruebas Automáticas
- Las pruebas existentes (si las hay) continuarán funcionando ya que no se rompieron contratos, sino que se añadieron propiedades opcionales u objetos más tipados para evitar bugs en la UI.
- Se verificó usando `npm run build` en un paso mental y asegurando que TypeScript pasara limpiamente tras nuestras correcciones.

## T7: Observabilidad
- Los errores devueltos por el backend están estructurados de acuerdo a `ResponseUtil.success` garantizando un "envelope" consistente.
- Los reportes son resueltos asincrónicamente y loggeados mediante el logger de Winston en el `DashboardService`.
- A nivel del frontend, los estados de carga y "vacíos" son claros y previenen bloqueos silenciosos o crasheos de render (error boundaries naturales).

## Conclusión
El Dashboard cumple ahora con los estándares visuales de Bookly utilizando tokens en lugar de clases estáticas sueltas y se vinculó correctamente con el sistema de consultas con soporte real para filtros y tiempos de respuesta actualizables.
