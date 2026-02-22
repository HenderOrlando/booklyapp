# Rules Review — bookly-mock-frontend

> **Run ID:** `2026-02-21-frontend-01`
> **Scope:** `bookly-mock-frontend`
> **Date:** 2026-02-21
> **Total Rules:** 41 | **Applicable:** 41

## Resumen Ejecutivo

El frontend de Bookly (`bookly-mock-frontend`) es una aplicación Next.js con Atomic Design, i18n (en/es), Redux Toolkit, React Query, Tailwind CSS y Playwright para E2E. Cubre **todos los dominios funcionales** del sistema con 24 rutas, 122+ componentes, 44 hooks, 15 API clients y 14 tipos de entidad.

### KPIs de Cobertura

| Métrica | Valor |
| --- | --- |
| **Score promedio** | **2.6 / 5** |
| Rules con score >= 3 | 25 / 41 (61%) |
| Rules con score <= 2 (bloqueantes si core) | 16 / 41 (39%) |
| Rules con score 0-1 | 4 / 41 (10%) |
| Rules con detalle individual (.md) | 9 |
| Unit tests en scope | 7 archivos |
| E2E tests en scope | 19 spec files |
| Idiomas soportados | 2 (en, es) |

### Score Distribution

| Score | Count | % |
| --- | --- | --- |
| 0 — No evidencias | 0 | 0% |
| 1 — Esqueleto | 4 | 10% |
| 2 — Parcial | 12 | 29% |
| 3 — Funcional | 25 | 61% |
| 4 — Completo con pruebas | 0 | 0% |
| 5 — Production-grade | 0 | 0% |

---

## Tabla de Cobertura Completa

### Design System (Avg: 3.0)

| ID | Title | Score | Key Evidence | Gaps | Detail |
| --- | --- | --- | --- | --- | --- |
| DS-COLORES | Colores y Tokens | **3** | tailwind.config.ts, CSS vars, ThemeToggle, ThemeColorEditorPanel | Hex directos, contraste AA no validado | [RULE-DS-COLORES.md](RULE-DS-COLORES.md) |
| DS-COMPONENTES | Componentes y Estados | **3** | 44 atoms, 36 molecules, 42 organisms, Atomic Design | Storybook ausente, estados disabled inconsistentes | [RULE-DS-COMPONENTES.md](RULE-DS-COMPONENTES.md) |
| DS-LAYOUTS | Layouts y Páginas | **3** | MainLayout, AppHeader, AppSidebar, responsive Tailwind | Sidebar drawer mobile, tabla→card mobile | [RULE-DS-LAYOUTS.md](RULE-DS-LAYOUTS.md) |

### Auth (Avg: 2.4)

| ID | Title | Score | Key Evidence | Gaps | Detail |
| --- | --- | --- | --- | --- | --- |
| RF-41 | Gestión roles/permisos | **3** | useRoles, usePermissions, useUsers, admin page, E2E tests | Historial cambios permisos, notificación real-time rol | [RULE-AUTH-RF41.md](RULE-AUTH-RF41.md) |
| RF-42 | Restricción modificaciones | **3** | hasPermission, hasRole, middleware, ConfirmDialog | 2FA/PIN para eliminar, versiones recurso | [RULE-AUTH-RF42.md](RULE-AUTH-RF42.md) |
| RF-43 | Autenticación y SSO | **3** | next-auth, login/register pages, auth-client.ts, E2E | SSO provider no implementado, cerrar sesión global | [RULE-AUTH-RF43.md](RULE-AUTH-RF43.md) |
| RF-44 | Auditoría | **2** | UserActivityTable, admin module, historial-aprobaciones | Pantalla auditoría dedicada, exportar CSV logs, alertas seguridad | [RULE-AUTH-RF44.md](RULE-AUTH-RF44.md) |
| RF-45 | 2FA solicitudes críticas | **1** | twoFactorEnabled en tipos User | Modal 2FA, interceptor acciones críticas, activación 2FA | [RULE-AUTH-RF45.md](RULE-AUTH-RF45.md) |

### Resources (Avg: 3.3)

| ID | Title | Score | Key Evidence | Gaps | Detail |
| --- | --- | --- | --- | --- | --- |
| RF-01 | CRUD recursos | **3** | recursos/ (12 items), useResources, resources-client, E2E+smoke+regression | Validaciones frontend capacidad, tests unit hooks | [RULE-RESOURCES-RF01.md](RULE-RESOURCES-RF01.md) |
| RF-02 | Categorías y programas | **3** | categorias/ page, programas/ page, usePrograms, filtros dinámicos | Tests E2E para categorías, notificación reasignación | — |
| CHAR | Características recursos | **3** | CharacteristicModal, characteristics-client, E2E characteristics.spec.ts, i18n | Buena alineación con rule (contract definido) | — |

### Availability (Avg: 2.5)

| ID | Title | Score | Key Evidence | Gaps | Detail |
| --- | --- | --- | --- | --- | --- |
| RF-07 | Horarios disponibles | **2** | useSchedules, calendario/ page | Drag-and-drop calendar config, bloqueos recurrentes UI | — |
| RF-08 | Integración calendarios | **2** | CalendarView component | No hay integración iCal/Google Calendar export | — |
| RF-09 | Búsqueda disponibilidad | **3** | AdvancedSearchModal, ResourceFilterPanel (11.5KB), SavedFiltersPanel | Búsqueda por usuario autorizado | — |
| RF-10 | Visualización calendario | **3** | CalendarView, CalendarGrid, CalendarHeader, CalendarDayCell, CalendarEventBadge | Indicadores visuales de bloqueos parcial | — |
| RF-11 | Historial de uso | **2** | historial-aprobaciones/ page | Historial de uso de recursos separado de aprobaciones | — |
| RF-12 | Reservas periódicas | **3** | RecurringPatternSelector (9KB), RecurringReservationPreview (12KB), useRecurringReservations | Tests E2E ausentes | — |
| RF-13 | Solicitud reserva VoBo | **3** | ApprovalModal, useApprovalActions, flujo approve/reject | Tests unit ausentes | — |
| RF-14 | Lista de espera | **3** | WaitlistManager (10.7KB), lista-espera/ page, waitlist.smoke.spec.ts, waitlist types | Buena cobertura | — |
| RF-15 | Reasignación reservas | **3** | ResourceReassignmentModal (13KB), useReassignment, reasignacion/ page con test | Test unitario page.test.tsx existe | — |
| RF-16 | Restricciones por categoría | **2** | useConflictValidator, ConflictResolver | UI de configuración de restricciones por categoría | — |
| RF-17 | Tiempo entre reservas | **1** | No evidencia directa en frontend | Config backend, sin UI | — |
| RF-18 | Cancelar/modificar reglas | **3** | useCancelReservation, useUpdateReservation, RescheduleConfirmModal | Reglas de antelación en UI | — |
| RF-19 | Reservas múltiples | **2** | MultiResourceSelector component | Flujo completo multi-resource en una solicitud parcial | — |

### Stockpile (Avg: 2.7)

| ID | Title | Score | Key Evidence | Gaps | Detail |
| --- | --- | --- | --- | --- | --- |
| RF-20 | Validación responsable | **3** | ApprovalModal (29KB), ApprovalCard, ApprovalRequestList, useApprovalActions, useApprovalRequests, approvals-client | Buena cobertura | — |
| RF-21 | Generación documentos | **3** | DocumentGenerator (13KB), DocumentPreview (8KB), useDocumentGeneration, documents-client | PDF viewer con react-pdf | — |
| RF-22 | Notificación solicitante | **3** | NotificationInbox, useNotificationChannels, notifications-client | Integración con sistema de notificaciones | — |
| RF-23 | Pantalla vigilancia | **3** | VigilancePanel (30KB), vigilancia/ page, QRViewerModal, QRCodeDisplay | Componente grande y funcional | — |
| RF-24 | Flujo por tipo usuario | **3** | ApprovalFlowModal (18KB), useApprovalFlows | Configuración de flujos diferenciados | — |
| RF-25 | Trazabilidad auditable | **3** | ApprovalTimeline (10KB), historial-aprobaciones/ page, approvals.smoke.spec.ts | Timeline con steps detallados | — |
| RF-26 | Check-in/check-out | **3** | CheckInOutPanel (7.4KB), useCheckInOut, check-in/ page, CheckInButton, CheckOutButton | Buena cobertura | — |
| RF-27 | Integración email/WhatsApp | **2** | handleShare con medium: email/sms/whatsapp en aprobaciones | Simulado, no integración real | — |
| RF-28 | Notificaciones automáticas | **3** | WebSocketToastBridge, useWebSocket (5.3KB), useWebSocketToasts (5.6KB), NotificationBell | WebSocket real-time | — |
| RF-29 | Recordatorios personalizables | **2** | ReminderConfigModal component | UI parcial, sin evidencia de configuración completa | — |
| RF-30 | Notificación tiempo real disponibilidad | **2** | useWebSocketToasts, NotificationInbox | Parcial, depende de backend events | — |

### Reports (Avg: 2.3)

| ID | Title | Score | Key Evidence | Gaps | Detail |
| --- | --- | --- | --- | --- | --- |
| RF-31 | Reporte uso programa/periodo | **3** | ReportViewer (6.6KB), useReportData (6.6KB), reportes/ (11 items), reports-client (10KB) | Buena cobertura | — |
| RF-32 | Reporte por usuario | **3** | UserActivityTable (7.4KB), reportes/ pages | Tabla de actividad | — |
| RF-33 | Exportar CSV | **3** | ExportPanel (5.2KB), ExportButton (3.4KB), useReportExport, useChartExport | Funcional | — |
| RF-34 | Feedback calidad | **2** | FeedbackModal component, useEvaluations | UI parcial, flujo post-uso incompleto | — |
| RF-35 | Feedback administrativo | **2** | useEvaluations | Similar a RF-34, UI parcial | — |
| RF-36 | Dashboard interactivo | **3** | DashboardGrid (6KB), dashboard/ page, useDashboard (14KB), KPIGrid, AreaChart, BarChart, PieChart, LineChart, ScatterChart | Rico en visualizaciones | — |
| RF-37 | Demanda insatisfecha | **2** | PeriodComparison component | Reporte específico parcial | — |
| RF-38 | Conflictos reserva | **2** | ConflictResolver (13KB), ConflictAlert | Componente de resolución pero sin reporte dedicado | — |
| RF-39 | Cumplimiento reserva | **1** | No evidencia directa | Reporte ausente | — |
| RF-40 | Cancelaciones y ausencias | **1** | No evidencia directa | Reporte ausente | — |

### Cross-cutting (Avg: 3.0)

| ID | Title | Score | Key Evidence | Gaps | Detail |
| --- | --- | --- | --- | --- | --- |
| BASE | Arquitectura base | **3** | Atomic Design, Next.js App Router, infrastructure layer, i18n | No hexagonal (es frontend) | — |
| MODULES | Módulos del sistema | **3** | Todos los módulos tienen rutas/pages/hooks/clients | Cobertura completa de módulos | — |
| DOC-STD | Documentación estándar | **3** | docs/ con INDEX.md, architecture-and-standards/, api-integration/ | Docs bien organizados | — |
| PLAN | Planificación e hitos | **3** | Todos los hitos core (1-5) y complementarios (6-10) tienen evidencia UI | Hitos 9-10 parciales | — |
| FLUJO-AUTH | Flujos auth | **3** | Login, roles, permisos, middleware, profile | SSO y 2FA ausentes | — |
| FLUJO-RESOURCES | Flujos recursos | **3** | CRUD, categorías, importación, mantenimiento | Completo | — |
| FLUJO-AVAIL | Flujos disponibilidad | **3** | Calendar, reservas, waitlist, reasignación, conflictos | Parcial en config avanzada | — |
| FLUJO-STOCKPILE | Flujos aprobaciones | **3** | Approve/reject, documentos, vigilancia, check-in, notificaciones | Completo | — |
| FLUJO-REPORTS | Flujos reportes | **3** | Reportes, dashboard, export CSV, charts | Feedback y reportes avanzados parciales | — |

---

## Top Gaps (Bloqueantes o Alta Prioridad)

| # | Rule | Score | Gap Crítico | Impacto |
| --- | --- | --- | --- | --- |
| 1 | **RF-45** (2FA) | 1 | No hay flujo 2FA implementado | Seguridad: acciones críticas sin verificación adicional |
| 2 | **RF-44** (Auditoría) | 2 | No hay pantalla de auditoría dedicada | Compliance: sin visibilidad de logs para admins |
| 3 | **RF-39** (Cumplimiento) | 1 | Reporte ausente | Reportes: sin visibilidad de cumplimiento |
| 4 | **RF-40** (Cancelaciones) | 1 | Reporte ausente | Reportes: sin análisis de cancelaciones |
| 5 | **RF-17** (Tiempo entre reservas) | 1 | Sin UI de configuración | Config: depende 100% de backend |
| 6 | **Tests unitarios** | — | Solo 7 unit test files para ~490 archivos fuente | Calidad: cobertura < 2% |

## Top Fortalezas

- **Cobertura de módulos**: Todos los 5 dominios tienen páginas, hooks, API clients y tipos.
- **Atomic Design**: 122+ componentes bien organizados en atoms/molecules/organisms.
- **i18n**: 22 namespaces en 2 idiomas (en/es) con verificación automatizada.
- **E2E testing**: 19 spec files cubriendo auth, resources, reservations, reports, approvals, admin.
- **Infrastructure layer**: 15 API clients tipados con data providers y error mapping.
- **Real-time**: WebSocket integration con toast notifications.
- **Approval workflow**: Flujo completo con approve/reject/delegate/batch + timeline + document generation.

## Recomendaciones Priorizadas

### Prioridad Alta (Bloqueantes para producción)

1. **Implementar flujo 2FA** (RF-45): TwoFactorModal + hook interceptor para acciones críticas.
2. **Pantalla de auditoría** (RF-44): DataTable con filtros + exportación CSV.
3. **Aumentar cobertura de tests unitarios**: Target 40%+ en hooks y utils.

### Prioridad Media (Funcionalidad completa)

4. **Reportes de cumplimiento y cancelaciones** (RF-39, RF-40).
5. **SSO provider** (RF-43): Agregar OAuth2 en next-auth.
6. **UI configuración tiempo entre reservas** (RF-17).
7. **Sidebar drawer en mobile** (DS-LAYOUTS).
8. **Storybook** para documentación de componentes (DS-COMPONENTES).

### Prioridad Baja (Production-grade)

9. Lint rule para tokens (no hex directos).
10. Visual regression tests.
11. Contraste AA automatizado (axe-core).
12. Integración real email/WhatsApp (RF-27).

---

## Artefactos del Run

```text
docs/rules-review/runs/2026-02-21-frontend-01/
├── README.md                          (este archivo)
├── _inventory/
│   ├── folder-map.md                  (mapa de carpetas)
│   └── file-stats.json                (estadísticas de archivos)
├── _catalog/
│   ├── rules.normalized.json          (catálogo normalizado)
│   └── rules.index.md                 (índice de rules por dominio)
├── RULE-DS-COLORES.md
├── RULE-DS-COMPONENTES.md
├── RULE-DS-LAYOUTS.md
├── RULE-AUTH-RF41.md
├── RULE-AUTH-RF42.md
├── RULE-AUTH-RF43.md
├── RULE-AUTH-RF44.md
├── RULE-AUTH-RF45.md
└── RULE-RESOURCES-RF01.md
```
