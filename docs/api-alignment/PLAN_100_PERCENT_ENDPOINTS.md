# Plan de Implementación 100% Endpoints Backend + Frontend

**Fecha**: 22 de Febrero de 2026
**Objetivo**: Llevar TODOS los endpoints a 100% funcional en backend y 100% implementados y consumidos en frontend.
**Fuentes**: `BACKEND_FRONTEND_ENDPOINTS_AUDIT.md`, `FRONTEND_BACKEND_ENDPOINT_MAPPING.md`

---

## Inventario de Brechas (Verificado 2026-02-22)

> **NOTA**: Tras verificar el código fuente real (`src/hooks/`, `src/infrastructure/api/`),
> se descubrió que **Fases 1-4 están completadas**. El frontend ya tiene ~60 hooks
> y ~15 clientes HTTP implementados cubriendo Auth, Resources, Availability y Stockpile.

### Resumen de Gaps REALES por Capa

| Capa | Tipo de Gap | Cantidad |
|------|-------------|----------|
| **Backend** | Endpoints STUB (Reports Service) | 31 endpoints |
| **Backend** | Endpoints menores faltantes | 5 endpoints |
| **Frontend** | Clientes + hooks para stubs tras implementación | 31 métodos + hooks |
| **Frontend** | Páginas nuevas para Reports avanzados | ~5 páginas |

---

## ✅ Fase 1: Auth Service — COMPLETADA

> Verificado contra código real. Todos los hooks existen en:
> - `src/hooks/useUsers.ts` — `useUsers()`, `useUser(id)`, `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()`, `useAssignRole()`
> - `src/hooks/useRoles.ts` — `useRoles()`, `useRole(id)`, `useCreateRole()`, `useUpdateRole()`, `useDeleteRole()`, `useAssignPermissionsToRole()`, `useRemovePermissionsFromRole()`
> - `src/hooks/usePermissions.ts` — `usePermissions()`, `usePermissionsByModule()`, `useCreatePermission()`, `useUpdatePermission()`, `useDeletePermission()`
> - `src/hooks/useAuditLogs.ts` — `useAuditLogs()`, `useAuditStats()`, `getAuditExportUrl()`
> - `src/hooks/useCurrentUser.ts` — `useCurrentUser()`, `useCurrentUserPermissions()`, `useCurrentUserRoles()`, `useLogin()`, `useLogout()`, `useUpdateCurrentUser()`, `useIsAuthenticated()`, `useHasPermission()`, `useHasRole()`
> - `src/hooks/mutations/useUserMutations.ts` — `useUpdateUserProfile()`, `useChangePassword()`, `useUploadProfilePhoto()`, `useUpdateUserPreferences()`

---

## ✅ Fase 2: Resources Service — COMPLETADA

> Verificado contra código real. Todos los hooks existen en:
>
> - `src/hooks/useResources.ts` — `useResources()`, `useResource(id)`, `useResourcesSearch()`, `useResourceCategories()`, `useAcademicPrograms()`, `useResourceCharacteristics()`, `useResourceTypes()`, `useMaintenanceHistory()`, `useCreateResource()`, `useUpdateResource()`, `useDeleteResource()`, `useCreateMaintenance()`
> - `src/hooks/mutations/useResourceMutations.ts` — `useImportResources()`, `useScheduleMaintenance()`
> - `src/hooks/mutations/useCategoryMutations.ts` — `useCreateCategory()`, `useUpdateCategory()`, `useDeleteCategory()`
> - `src/hooks/mutations/useMaintenanceMutations.ts` — `useCompleteMaintenance()`, `useCancelMaintenance()`, `useUpdateMaintenance()`, `useAssignTechnician()`, `useRescheduleMaintenance()`, `useReportMaintenanceIncident()`
> - `src/hooks/mutations/useProgramMutations.ts` — `useCreateProgram()`, `useUpdateProgram()`, `useDeleteProgram()`, `useAssignResourcesToProgram()`

---

## ✅ Fase 3: Availability Service — COMPLETADA

> Verificado contra código real. Todos los hooks existen en:
>
> - `src/hooks/useReservations.ts` — `useReservations()`, `useReservation(id)`, `useReservationStats()`, `useCreateReservation()`, `useUpdateReservation()`, `useCancelReservation()`
> - `src/hooks/useCheckIn.ts` — `useActiveCheckIns()`, `useOverdueCheckIns()`, `useMyCheckInHistory()`, `useCheckInByReservation()`, `useCheckIn()`, `useCheckOut()`
> - `src/hooks/useCheckInOut.ts` — `useCheckInOut()` (versión con validaciones y toast)
> - `src/hooks/useCalendarReservations.ts` — `useCalendarReservations()`
> - `src/hooks/useConflictValidator.ts` — `useConflictValidator()`, `useEventConflictValidator()`, `useDragConflictValidator()`
> - `src/hooks/useInfiniteReservations.ts` — Reservas con scroll infinito
> - `src/hooks/mutations/useReservationMutations.ts` — Mutations adicionales
> - `src/hooks/mutations/useWaitlistMutations.ts` — `useAddToWaitlist()`, `useRemoveFromWaitlist()`, `useNotifyWaitlist()`, `useUpdateWaitlistPriority()`, `useAcceptWaitlistOffer()`
>
> **Pendiente menor** (2 endpoints sin cliente frontend):
> - `POST /availabilities` — Configurar disponibilidad
> - `GET /availabilities/calendar` — Vista calendario dedicada

---

## ✅ Fase 4: Stockpile Service — COMPLETADA

> Verificado contra código real. Todos los hooks existen en:
>
> - `src/hooks/useApprovalRequests.ts` — `useApprovalRequests()`, `useActiveApprovalsToday()`, `useApprovalRequest(id)`, `useApprovalStatistics()`, `useCreateApprovalRequest()`, `useApproveRequest()`, `useRejectRequest()`, `useCancelRequest()`
> - `src/hooks/useApprovalFlows.ts` — `useApprovalFlows()`, `useApprovalFlow(id)`, `useCreateApprovalFlow()`, `useUpdateApprovalFlow()`, `useDeleteApprovalFlow()`, `useActivateApprovalFlow()`, `useDeactivateApprovalFlow()`
> - `src/hooks/useApprovalActions.ts` — `useApprovalActions()` (versión integrada con toast)
> - `src/hooks/useDocumentGeneration.ts` — Generación de documentos
> - `src/hooks/mutations/useApprovalMutations.ts` — `useApproveReservation()`, `useRejectReservation()`, `useBatchApprove()`, `useReassignApproval()`, `useRequestAdditionalInfo()`
> - `src/hooks/mutations/useNotificationMutations.ts` — `useMarkAsRead()`, `useMarkAllAsRead()`, `useDeleteNotification()`, `useSendNotification()`
>
> **Pendiente menor** (2 endpoints sin cliente frontend):
> - `POST /approval-requests/:id/notification` — Enviar notificación por solicitud
> - `GET /check-in-out/location/:locationId` — Check-ins por ubicación

---

## ⚠️ Fase 5: Reports Service — TRABAJO PENDIENTE PRINCIPAL

> Esta es la fase crítica. El 87% de los controladores son STUB (definidos pero no implementados).
> Los hooks de dashboard, feedback y evaluaciones YA existen:
>
> - `src/hooks/useDashboard.ts` — `useDashboardMetrics()`, `useUserStats()`, `useResourceStats()`, `useReservationStats()`, `useRecentActivity()`, `useUpcomingReservations()`
> - `src/hooks/useFeedback.ts` — `useFeedbackList()`, `useFeedbackDetail()`, `useEvaluationList()`, `useEvaluationDetail()`
> - `src/hooks/useEvaluations.ts` — `useEvaluations()`, `useEvaluation()`, `useSaveEvaluation()`
> - `src/hooks/useCancellationReport.ts` — `useCancellationReport()`
> - `src/hooks/useComplianceReport.ts` — `useComplianceReport()`
> - `src/hooks/mutations/useReportMutations.ts` — `useGenerateReport()`, `useExportReport()`, `useScheduleReport()`, `useUpdateScheduledReport()`, `useDeleteScheduledReport()`, `useShareReport()`, `useDeleteReport()`
> - `src/hooks/mutations/useFeedbackMutations.ts` — `useCreateFeedback()`, `useUpdateFeedback()`, `useDeleteFeedback()`, `useCreateEvaluation()`, `useUpdateEvaluation()`

### Tarea 5.1: (YA NO NECESARIA — Hooks de endpoints funcionales ya existen)

### Tarea 5.2-5.7: Implementar controladores STUB en backend

> Estas tareas siguen siendo necesarias. Ver detalles originales más abajo.

---

### Tarea 3.4 (renumerada como Tarea pendiente menor): Endpoints avanzados de Availability (backend + frontend)

**Gap**: Endpoints en MAPPING marcados "FALTA FRONTEND": search/suggestions, waiting-lists/position, calendar/conflicts, calendar/optimize.

**Entregables Backend**:

- [ ] Verificar que `GET /search/suggestions` esté funcional
- [ ] Verificar que `GET /waiting-lists/position/:id` esté funcional
- [ ] Verificar que `GET /calendar/conflicts` esté funcional
- [ ] Verificar que `POST /calendar/optimize` esté funcional

**Entregables Frontend**:

- [ ] Agregar métodos en clientes: `getSearchSuggestions()`, `getWaitlistPosition()`, `getCalendarConflicts()`, `optimizeCalendar()`
- [ ] Hooks: `useSearchSuggestions()`, `useWaitlistPosition(id)`, `useCalendarConflicts()`, `useOptimizeCalendar()`

**Skills**: `web-app`, `backend`
**Rules**: `bookly-availability-rf09-busqueda-disponibilidad`, `bookly-availability-rf14-lista-espera-para-sobrecarga`, `bookly-availability-rf10-visualizacion-en-calendar`

---

### Tarea 3.5: Página de Búsqueda Avanzada y Lista de Espera

**Gap**: Según MAPPING, páginas "Availability/Advanced-Search" y "Availability/Waiting-List" son prioridad MEDIO.

**Entregables**:

- [ ] Página `src/app/(dashboard)/availability/advanced-search/page.tsx`
- [ ] Página `src/app/(dashboard)/availability/waiting-list/page.tsx`

**Skills**: `web-app`, `ux-ui`
**Rules**: `bookly-availability-rf09-busqueda-disponibilidad`, `bookly-availability-rf14-lista-espera-para-sobrecarga`
**Rules condicionales (frontend)**: `design-system-colores-tokens`, `design-system-componentes`, `design-system-layouts-pages`

---

## Fase 4: Stockpile Service — 100% Cobertura

**Duración estimada**: 4-5 días
**Prioridad**: 🟡 Media-Alta

### Tarea 4.1: Hooks faltantes para Aprobaciones

**Gap**: Todos los métodos de `ApprovalsClient` carecen de hooks.

**Entregables**:

- [ ] `useApprovalRequests(filters)` — Lista paginada
- [ ] `useApprovalRequest(id)` — Solicitud por ID
- [ ] `useCreateApprovalRequest()` — Mutación crear solicitud
- [ ] `useApproveRequest()` — Mutación aprobar
- [ ] `useRejectRequest()` — Mutación rechazar
- [ ] `useCancelApprovalRequest()` — Mutación cancelar
- [ ] `useActiveToday()` — Solicitudes activas hoy (vigilancia)
- [ ] `useApprovalStatistics()` — Estadísticas
- [ ] `useApprovalFlows()` — Lista de flujos
- [ ] `useApprovalFlow(id)` — Flujo por ID
- [ ] `useCreateApprovalFlow()`, `useUpdateApprovalFlow()`, `useDeleteApprovalFlow()` — Mutaciones CRUD

**Skills**: `web-app`
**Rules**: `bookly-flujos-stockpile`

---

### Tarea 4.2: Hooks faltantes para Check-In/Check-Out

**Gap**: Métodos de `CheckInClient` carecen de hooks.

**Entregables**:

- [ ] `useCheckIn()` — Mutación registrar check-in
- [ ] `useCheckOut()` — Mutación registrar check-out
- [ ] `useCheckInById(id)` — Registro por ID
- [ ] `useCheckInByReservation(reservationId)` — Registro por reserva
- [ ] `useMyCheckInHistory()` — Historial del usuario
- [ ] `useActiveCheckIns()` — Check-ins activos (vigilancia)
- [ ] `useOverdueCheckIns()` — Check-ins vencidos

**Skills**: `web-app`
**Rules**: `bookly-flujos-stockpile`

---

### Tarea 4.3: Clientes faltantes de Stockpile

**Gap**: `POST /approval-requests/:id/notification` y `GET /check-in-out/location/:locationId` no tienen cliente.

**Entregables Backend**:

- [ ] Verificar que ambos endpoints estén funcionales en backend

**Entregables Frontend**:

- [ ] Agregar `sendNotification(id)` en `approvals-client.ts`
- [ ] Agregar `getByLocation(locationId)` en `check-in-client.ts`
- [ ] Agregar endpoints en `endpoints.ts`
- [ ] Hooks: `useSendApprovalNotification()`, `useCheckInsByLocation(locationId)`

**Skills**: `web-app`, `backend`
**Rules**: `bookly-flujos-stockpile`

---

### Tarea 4.4: Endpoints avanzados de Stockpile (backend + frontend)

**Gap**: Endpoints en MAPPING: metrics, bulk-approve, document-templates/variables, notifications/batch-send, delivery-status.

**Entregables Backend**:

- [ ] Verificar funcionalidad de `GET /approval-flows/metrics`
- [ ] Verificar funcionalidad de `POST /approval-flows/bulk-approve`
- [ ] Verificar funcionalidad de `GET /document-templates/variables`
- [ ] Verificar funcionalidad de `POST /notifications/batch-send`
- [ ] Verificar funcionalidad de `GET /notifications/delivery-status/:id`

**Entregables Frontend**:

- [ ] Agregar métodos en clientes correspondientes
- [ ] Hooks: `useApprovalMetrics()`, `useBulkApprove()`, `useTemplateVariables()`, `useBatchSendNotifications()`, `useNotificationDeliveryStatus(id)`

**Skills**: `web-app`, `backend`
**Rules**: `bookly-flujos-stockpile`

---

## Fase 5: Reports Service — 100% Cobertura (CRÍTICO)

**Duración estimada**: 2-4 semanas
**Prioridad**: 🔴 Crítica (87% del servicio son stubs)

### Tarea 5.1: Hooks faltantes para endpoints YA funcionales

**Gap**: Endpoints de uso, exportación y reportes de usuario existen en backend y en cliente pero sin hooks.

**Entregables**:

- [ ] `useUsageReport(filters)` — Reporte de uso
- [ ] `useUserReport(userId)` — Reporte de usuario
- [ ] `useDemandReport(filters)` — Demanda insatisfecha
- [ ] `useOccupancyReport(filters)` — Ocupación
- [ ] `useExportCSV(reportId)` — Exportar CSV
- [ ] `useExportPDF(reportId)` — Exportar PDF

**Skills**: `web-app`
**Rules**: `bookly-reports-rf31-uso-programa-periodo-tipo-recurso`, `bookly-reports-rf32-reservas-por-usuario`, `bookly-reports-rf33-exportar-en-csv`, `bookly-flujos-reports`

---

### Tarea 5.2: Implementar Scheduled Reports en Backend (6 endpoints)

**Gap**: `scheduled-reports.controller.ts` es STUB.

**Entregables Backend**:

- [ ] Implementar `GET /scheduled-reports` — Listar reportes programados
- [ ] Implementar `POST /scheduled-reports/create` — Crear reporte programado
- [ ] Implementar `PUT /scheduled-reports/:id` — Actualizar
- [ ] Implementar `DELETE /scheduled-reports/:id` — Eliminar
- [ ] Implementar `POST /scheduled-reports/:id/execute` — Ejecutar manualmente
- [ ] Implementar `GET /scheduled-reports/:id/history` — Historial

**Entregables Frontend**:

- [ ] Agregar métodos en `reports-client.ts`
- [ ] Agregar endpoints en `endpoints.ts`
- [ ] Hooks: `useScheduledReports()`, `useCreateScheduledReport()`, `useUpdateScheduledReport()`, `useDeleteScheduledReport()`, `useExecuteScheduledReport()`, `useScheduledReportHistory(id)`

**Skills**: `backend`, `web-app`, `data-reporting`
**Rules**: `bookly-reports-rf37-demanda-insatisfecha`, `bookly-flujos-reports`

---

### Tarea 5.3: Implementar Custom Reports en Backend (5 endpoints)

**Gap**: `custom-reports.controller.ts` es STUB.

**Entregables Backend**:

- [ ] Implementar `GET /custom-reports` — Listar reportes personalizados
- [ ] Implementar `POST /custom-reports/create` — Crear
- [ ] Implementar `PUT /custom-reports/:id` — Actualizar
- [ ] Implementar `DELETE /custom-reports/:id` — Eliminar
- [ ] Implementar `POST /custom-reports/:id/execute` — Ejecutar

**Entregables Frontend**:

- [ ] Métodos en `reports-client.ts`
- [ ] Endpoints en `endpoints.ts`
- [ ] Hooks: `useCustomReports()`, `useCreateCustomReport()`, `useUpdateCustomReport()`, `useDeleteCustomReport()`, `useExecuteCustomReport()`

**Skills**: `backend`, `web-app`, `data-reporting`
**Rules**: `bookly-reports-rf36-dashboard-interactivo-tiempo-real`, `bookly-flujos-reports`

---

### Tarea 5.4: Implementar Report Templates en Backend (5 endpoints)

**Gap**: `templates.controller.ts` es STUB.

**Entregables Backend**:

- [ ] Implementar `GET /report-templates` — Listar plantillas
- [ ] Implementar `POST /report-templates/create` — Crear
- [ ] Implementar `PUT /report-templates/:id` — Actualizar
- [ ] Implementar `DELETE /report-templates/:id` — Eliminar
- [ ] Implementar `POST /report-templates/:id/preview` — Vista previa

**Entregables Frontend**:

- [ ] Métodos en `reports-client.ts`
- [ ] Endpoints en `endpoints.ts`
- [ ] Hooks: `useReportTemplates()`, `useCreateReportTemplate()`, `useUpdateReportTemplate()`, `useDeleteReportTemplate()`, `usePreviewReportTemplate(id)`

**Skills**: `backend`, `web-app`, `data-reporting`
**Rules**: `bookly-flujos-reports`

---

### Tarea 5.5: Implementar Alert Management en Backend (6 endpoints)

**Gap**: `alerts.controller.ts` es STUB.

**Entregables Backend**:

- [ ] Implementar `GET /alerts/list` — Listar alertas
- [ ] Implementar `POST /alerts/create` — Crear alerta
- [ ] Implementar `PUT /alerts/:id` — Actualizar
- [ ] Implementar `DELETE /alerts/:id` — Eliminar
- [ ] Implementar `GET /alerts/history` — Historial
- [ ] Implementar `POST /alerts/thresholds` — Configurar umbrales

**Entregables Frontend**:

- [ ] Métodos en `reports-client.ts` o nuevo `alerts-client.ts`
- [ ] Endpoints en `endpoints.ts`
- [ ] Hooks: `useAlerts()`, `useCreateAlert()`, `useUpdateAlert()`, `useDeleteAlert()`, `useAlertHistory()`, `useConfigureThresholds()`

**Skills**: `backend`, `web-app`, `data-reporting`
**Rules**: `bookly-reports-rf36-dashboard-interactivo-tiempo-real`, `bookly-flujos-reports`

---

### Tarea 5.6: Implementar Performance Monitoring en Backend (4 endpoints)

**Gap**: `performance.controller.ts` es STUB.

**Entregables Backend**:

- [ ] Implementar `GET /performance` — Métricas generales
- [ ] Implementar `GET /performance/queries` — Rendimiento de queries
- [ ] Implementar `GET /performance/cache` — Stats de caché
- [ ] Implementar `GET /performance/system` — Métricas de sistema

**Entregables Frontend**:

- [ ] Métodos en `reports-client.ts` o `monitoring-client.ts`
- [ ] Endpoints en `endpoints.ts`
- [ ] Hooks: `usePerformanceMetrics()`, `useQueryPerformance()`, `useCacheStats()`, `useSystemMetrics()`

**Skills**: `backend`, `web-app`, `plataforma-build-deploy-operate-observe`
**Rules**: `bookly-flujos-reports`

---

### Tarea 5.7: Implementar Data Processing en Backend (5 endpoints)

**Gap**: `data-processing.controller.ts` es STUB.

**Entregables Backend**:

- [ ] Implementar `POST /data-processing/aggregation` — Agregación
- [ ] Implementar `POST /data-processing/validation` — Validación
- [ ] Implementar `POST /data-processing/cleansing` — Limpieza
- [ ] Implementar `POST /data-processing/refresh` — Refrescar datos
- [ ] Implementar `GET /data-processing/status` — Estado

**Entregables Frontend**:

- [ ] Métodos en `reports-client.ts`
- [ ] Endpoints en `endpoints.ts`
- [ ] Hooks: `useDataAggregation()`, `useDataValidation()`, `useDataCleansing()`, `useDataRefresh()`, `useDataProcessingStatus()`

**Skills**: `backend`, `web-app`, `data-reporting`, `gestion-datos-calidad`
**Rules**: `bookly-flujos-reports`

---

### Tarea 5.8: Endpoint faltante — Historial de usuario

**Gap**: `GET /reports/user/:userId/history` no tiene cliente ni hook.

**Entregables Backend**:

- [ ] Verificar que el endpoint esté funcional

**Entregables Frontend**:

- [ ] Agregar `getUserReportHistory(userId)` en `reports-client.ts`
- [ ] Hook: `useUserReportHistory(userId)`

**Skills**: `web-app`, `backend`
**Rules**: `bookly-reports-rf32-reservas-por-usuario`, `bookly-flujos-reports`

---

### Tarea 5.9: Páginas de Reports avanzados

**Gap**: Según MAPPING, página "Reports/Advanced-Analytics" es prioridad ALTO.

**Entregables**:

- [ ] Página `src/app/(dashboard)/reports/scheduled/page.tsx` — Reportes programados
- [ ] Página `src/app/(dashboard)/reports/custom/page.tsx` — Reportes personalizados
- [ ] Página `src/app/(dashboard)/reports/templates/page.tsx` — Plantillas
- [ ] Página `src/app/(dashboard)/admin/alerts/page.tsx` — Gestión de alertas
- [ ] Página `src/app/(dashboard)/admin/performance/page.tsx` — Monitoreo de rendimiento

**Skills**: `web-app`, `ux-ui`, `data-reporting`
**Rules**: `bookly-reports-rf36-dashboard-interactivo-tiempo-real`, `bookly-flujos-reports`
**Rules condicionales (frontend)**: `design-system-colores-tokens`, `design-system-componentes`, `design-system-layouts-pages`

---

## Fase 6: Import Service — Servicio Independiente

**Duración estimada**: 1-2 semanas
**Prioridad**: 🟡 Media

### Tarea 6.1: Implementar Import Service en Backend

**Gap**: Todos los endpoints de Import Service son `❌ NO EXISTE`. Están temporalmente en Resources.

**Entregables Backend**:

- [ ] Crear microservicio `import-service` o módulo dentro de `resources-service`
- [ ] Implementar `POST /import/resources/csv` — Importar CSV
- [ ] Implementar `GET /import/templates/resources` — Descargar plantilla
- [ ] Implementar `POST /import/validate/csv` — Validar antes de importar
- [ ] Implementar `GET /import/history` — Historial de importaciones
- [ ] Implementar `GET /import/status/:jobId` — Estado de job asíncrono

**Entregables Frontend**:

- [ ] Crear o ampliar `resources-client.ts` con métodos de importación avanzada
- [ ] Agregar endpoints en `endpoints.ts`
- [ ] Hooks: `useImportCSV()`, `useImportTemplate()`, `useValidateCSV()`, `useImportHistory()`, `useImportJobStatus(jobId)`

**Skills**: `backend`, `web-app`, `gestion-datos-calidad`
**Rules**: `bookly-flujos-resources`, `bookly-resource-rf01-crear-editar-eliminar-recursos`

---

### Tarea 6.2: Página de Importación Masiva

**Entregables**:

- [ ] Página `src/app/(dashboard)/resources/import/page.tsx`
- [ ] Upload de CSV con preview, validación y progreso

**Skills**: `web-app`, `ux-ui`
**Rules**: `bookly-flujos-resources`
**Rules condicionales (frontend)**: `design-system-colores-tokens`, `design-system-componentes`, `design-system-layouts-pages`

---

## Fase 7: Alineación de URLs y Corrección de Inconsistencias

**Duración estimada**: 1 día
**Prioridad**: 🟡 Media

### Tarea 7.1: Corregir URLs desalineadas en `endpoints.ts`

**Gap**: Varias URLs del frontend no coinciden exactamente con el backend.

**Entregables**:

- [ ] Auditar `endpoints.ts` contra controladores reales del backend
- [ ] Corregir `categories` → `resource-categories` si aplica
- [ ] Verificar prefijo `/api/v1` en todas las rutas
- [ ] Actualizar `getServiceFromEndpoint()` si hay nuevas rutas

**Skills**: `web-app`, `backend`
**Rules**: `bookly-flujos-auth`, `bookly-flujos-resources`, `bookly-flujos-availability`, `bookly-flujos-stockpile`, `bookly-flujos-reports`

---

## Fase 8: Admin — Operaciones Masivas

**Duración estimada**: 3-4 días
**Prioridad**: 🟢 Baja

### Tarea 8.1: Página de Operaciones Masivas

**Gap**: Según MAPPING, página "Admin/Bulk-Operations" es prioridad MEDIO.

**Entregables**:

- [ ] Página `src/app/(dashboard)/admin/bulk-operations/page.tsx`
- [ ] Integrar `useBulkUpdateResources()` y `useBulkApprove()`

**Skills**: `web-app`, `ux-ui`
**Rules**: `bookly-flujos-resources`, `bookly-flujos-stockpile`
**Rules condicionales (frontend)**: `design-system-colores-tokens`, `design-system-componentes`, `design-system-layouts-pages`

---

## Fase 9: Testing y Validación E2E

**Duración estimada**: 1-2 semanas (en paralelo con las fases anteriores)
**Prioridad**: 🔴 Alta (gate de calidad)

### Tarea 9.1: Tests de integración por servicio

**Entregables**:

- [ ] Tests para Auth Service (sesiones, audit, roles, permisos)
- [ ] Tests para Resources Service (mantenimiento, import, bulk)
- [ ] Tests para Availability Service (recurrentes, calendario, conflictos)
- [ ] Tests para Stockpile Service (aprobaciones, check-in, notificaciones)
- [ ] Tests para Reports Service (todos los controllers nuevos)

**Skills**: `qa-calidad`, `operacion-interna-equipo`
**Rules**: Aplicar rule de cada servicio correspondiente

---

### Tarea 9.2: Tests E2E con Playwright

**Entregables**:

- [ ] Flujo completo de reserva → aprobación → check-in → check-out
- [ ] Flujo de reportes: generar, exportar, programar
- [ ] Flujo de admin: gestión de usuarios, roles, permisos
- [ ] Flujo de importación masiva

**Skills**: `qa-calidad`, `web-app`
**Rules**: Workflow `/align-front-back`

---

### Tarea 9.3: Contract Tests (frontend ↔ backend)

**Entregables**:

- [ ] Validar que todos los DTOs del frontend coincidan con los del backend
- [ ] Validar que los interceptores de error mapeen correctamente
- [ ] Ejecutar `/align-front-back` workflow como gate final

**Skills**: `qa-calidad`, `operacion-interna-equipo`
**Rules**: Workflow `/align-front-back`, `/review`

---

## Fase 10: Actualización de Documentación

**Duración estimada**: 1 día
**Prioridad**: 🟡 Media (al finalizar cada fase)

### Tarea 10.1: Actualizar documentos de auditoría

**Entregables**:

- [ ] Actualizar `BACKEND_FRONTEND_ENDPOINTS_AUDIT.md` — Marcar todo como ✅
- [ ] Actualizar `FRONTEND_BACKEND_ENDPOINT_MAPPING.md` — Marcar todo como IMPLEMENTADO
- [ ] Actualizar `PROGRESO_IMPLEMENTACION.md`
- [ ] Actualizar `DIRECTORIO_DOCUMENTACION.md` con referencia a este plan

**Skills**: `gestion-ingenieria-delivery`
**Rules**: `bookly-documentacion-estandar`

---

## Resumen de Skills por Fase

| Fase | Skills Principales | Skills de Soporte |
|------|-------------------|-------------------|
| **1. Auth** | `web-app`, `backend` | `seguridad-avanzada`, `ux-ui` |
| **2. Resources** | `web-app`, `backend` | `ux-ui` |
| **3. Availability** | `web-app`, `backend` | `ux-ui` |
| **4. Stockpile** | `web-app`, `backend` | `ux-ui` |
| **5. Reports** | `backend`, `web-app`, `data-reporting` | `gestion-datos-calidad`, `plataforma-build-deploy-operate-observe`, `ux-ui` |
| **6. Import** | `backend`, `web-app`, `gestion-datos-calidad` | `ux-ui` |
| **7. Alineación** | `web-app`, `backend` | — |
| **8. Bulk Ops** | `web-app`, `ux-ui` | — |
| **9. Testing** | `qa-calidad`, `operacion-interna-equipo` | `web-app` |
| **10. Docs** | `gestion-ingenieria-delivery` | — |

---

## Resumen de Rules por Servicio

| Servicio | Rules Obligatorias |
|----------|-------------------|
| **Auth** | `bookly-auth-rf41-gestion-de-roles`, `bookly-auth-rf42-restriccion-de-modificacion`, `bookly-auth-rf43-autenticacion-y-sso`, `bookly-auth-rf44-auditoria`, `bookly-auth-rf45-verificacion-2fa-solicitudes-criticas`, `bookly-flujos-auth` |
| **Resources** | `bookly-resource-rf01-crear-editar-eliminar-recursos`, `bookly-resource-rf02-asociar-recurso-a-categorias-o-programas`, `bookly-resource-characteristics`, `bookly-flujos-resources` |
| **Availability** | `bookly-availability-rf07-horarios-disponibles`, `bookly-availability-rf09-busqueda-disponibilidad`, `bookly-availability-rf10-visualizacion-en-calendar`, `bookly-availability-rf11-registro-historial-uso`, `bookly-availability-rf12-permite-reserva-periodica`, `bookly-availability-rf14-lista-espera-para-sobrecarga`, `bookly-flujos-availability` |
| **Stockpile** | `bookly-flujos-stockpile` |
| **Reports** | `bookly-reports-rf31` a `bookly-reports-rf40`, `bookly-flujos-reports` |
| **Frontend (siempre)** | `design-system-colores-tokens`, `design-system-componentes`, `design-system-layouts-pages` |
| **Documentación** | `bookly-documentacion-estandar` |

---

## Cronograma Estimado

| Semana | Fases | Foco |
|--------|-------|------|
| **S1** | Fase 1 + Fase 2 | Auth 100% + Resources 100% |
| **S2** | Fase 3 + Fase 4 | Availability 100% + Stockpile 100% |
| **S3-S4** | Fase 5 (5.1-5.5) | Reports Service backend stubs → funcional |
| **S4-S5** | Fase 5 (5.6-5.9) + Fase 7 | Reports frontend + Alineación URLs |
| **S5-S6** | Fase 6 + Fase 8 | Import Service + Bulk Operations |
| **S1-S6 (paralelo)** | Fase 9 | Testing continuo |
| **S6** | Fase 10 | Documentación final |

**Duración total estimada: 6 semanas**

---

*Plan creado: 2026-02-22*
*Próxima revisión: Al completar Fase 1*
