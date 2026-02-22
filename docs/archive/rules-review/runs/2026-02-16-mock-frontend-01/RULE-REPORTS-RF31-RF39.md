# RULE-REPORTS — RF-31 a RF-39 (Reportes y Análisis)

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend`

---

## RF-31: Reportes por programa/período/tipo — Score: 3/5

**Evidencia:** `src/app/[locale]/reportes/page.tsx`, `reportes/recursos/page.tsx`. ReportViewer organism. ReportFilters molecule. useReports, useReportFilters hooks. Endpoints USAGE, USAGE_BY_RESOURCE, USAGE_BY_PROGRAM, STATISTICS. reportsClient service.
**ACs cubiertos:** Page de reportes con filtros, visualización por recurso y programa, endpoints completos.
**Gaps:** Sin tests. Filtro por materia no verificado.

---

## RF-32: Reportes por usuario — Score: 3/5

**Evidencia:** `src/app/[locale]/reportes/usuarios/page.tsx`. Endpoints USAGE_BY_USER. UserActivityTable organism.
**ACs cubiertos:** Page dedicada por usuario, endpoint, tabla de actividad.
**Gaps:** Sin tests.

---

## RF-33: Exportación CSV — Score: 3/5

**Evidencia:** ExportPanel organism. ExportButton atom. useReportExport hook. useChartExport hook. Endpoints EXPORT_CSV, EXPORT_PDF, EXPORT_EXCEL. xlsx@0.18.5. jspdf@2.5.1. html2canvas@1.4.1.
**ACs cubiertos:** Export a CSV, PDF, Excel. UI con botón y panel de exportación. Dependencias completas.
**Gaps:** Sin tests.

---

## RF-34: Feedback calidad de servicio — Score: 2/5

**Evidencia:** Endpoints FEEDBACK, FEEDBACK_BY_ID. Tipos report.ts.
**Gaps:** No hay page/modal dedicada para que usuarios dejen feedback. Solo endpoints definidos.

---

## RF-35: Feedback administrativo — Score: 2/5

**Evidencia:** Endpoints EVALUATIONS, EVALUATION_BY_ID.
**Gaps:** No hay UI para evaluación administrativa. Solo endpoints.

---

## RF-36: Dashboard interactivo — Score: 3/5

**Evidencia:** `src/app/[locale]/dashboard/page.tsx`. DashboardGrid organism. KPIGrid molecule. StatCard atom/organism. BarChartCard, LineChartCard, PieChartCard, AreaChartCard, ScatterChartCard molecules. ResourceUtilizationChart organism. PeriodComparison organism. useDashboard hook. recharts@2.12.0. Endpoints DASHBOARD, DASHBOARD_ADMIN, DASHBOARD_USER, STATISTICS_SUMMARY, STATISTICS_TRENDS.
**ACs cubiertos:** Dashboard completo con KPIs, múltiples tipos de gráficos, comparación de períodos, utilización de recursos.
**Gaps:** Sin tests. Real-time updates via WebSocket no verificado para dashboard.

---

## RF-37: Demanda insatisfecha — Score: 2/5

**Evidencia:** Endpoint UNSATISFIED_DEMAND.
**Gaps:** No hay page/componente dedicado para visualizar demanda insatisfecha. Solo endpoint.

---

## RF-38: Conflictos de reserva — Score: 2/5

**Evidencia:** ConflictResolver organism. useConflictValidator hook. Endpoints CHECK_CONFLICTS, CHECK_AVAILABILITY. Tipo conflict.ts.
**ACs cubiertos:** Componente de resolución de conflictos, hook de validación, endpoints.
**Gaps:** Sin tests. Page/reporte dedicado a conflictos no verificado.

---

## RF-39: Cumplimiento de reserva — Score: 2/5

**Evidencia:** Endpoints STATISTICS, STATISTICS_SUMMARY. Check-in/check-out data puede alimentar cumplimiento.
**Gaps:** No hay page/reporte dedicado a tasa de cumplimiento. Métricas de no-show no visibles en UI.
