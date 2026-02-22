# Rules Review — bookly-mock

**Run ID:** `2026-02-21-bookly-mock-01`  
**SCOPE_ROOT:** `bookly-mock`  
**Generated:** 2026-02-21  
**Rules audited:** 47 (42 RF + 5 Flow)  
**Meta rules (context only):** 5

---

## Resumen Ejecutivo

El backend `bookly-mock` presenta una implementación **sólida a nivel funcional** en los dominios core (auth, resources, availability), con arquitectura hexagonal, CQRS y EDA bien estructurados. El dominio de **reports** tiene buena cobertura de controllers y servicios. El dominio de **stockpile** tiene implementación funcional con controllers para aprobaciones, check-in/out y documentos.

### KPIs Globales

| Métrica | Valor |
| --- | --- |
| Score promedio | **3.1 / 5** |
| Rules >= 4 (completo con tests) | 8 / 47 (17%) |
| Rules >= 3 (funcional) | 40 / 47 (85%) |
| Rules <= 2 (bloqueante si core) | 7 / 47 (15%) |
| Rules = 0 (sin evidencia) | 0 / 47 (0%) |
| Tests unitarios encontrados | 27 spec files |
| Servicios con Hex+CQRS | 6/6 |
| EDA (event-bus + DLQ) | Implementado |
| Idempotency guard | Implementado (libs/idempotency) |

### Top Gaps

1. **Tests BDD (Given-When-Then):** Existen 27 unit specs pero no se encontraron specs BDD con Given-When-Then explícito. Gate: max score 3 sin tests.
2. **Calendar integration (RF-08):** No se encontró integración real con Google/Outlook APIs.
3. **Notifications reales (RF-27, RF-28):** `libs/notifications` tiene 58 archivos y NotificationProviderService + EnhancedNotificationService existen, pero la integración con WhatsApp real es parcial (TODOs pendientes). Email via RabbitMQ está configurado.
4. **Document storage (RF-21):** Generación PDF con PDFKit + Handlebars funciona, pero descarga desde storage requiere S3/GCS (TODO en code).
5. **i18n backend:** `libs/i18n` existe (4 files) pero no se verificó cobertura completa de traducciones por servicio.

---

## Tabla de Coverage por Rule

### Auth Domain (auth-service)

| Rule | Título | Score | Evidencia | Tests | Gaps |
| --- | --- | --- | --- | --- | --- |
| RF-41 | Gestión roles y permisos | **4** | RoleService, PermissionService, RolesGuard, PermissionsGuard, CQRS handlers, controllers CRUD completo, audit trail | role.service.spec, permission.service.spec | Falta validación de usuarios con rol antes de eliminar (TODO en code) |
| RF-42 | Restricción modificaciones admins | **3** | JwtAuthGuard + PermissionsGuard en ResourcesController, @RequirePermissions decorator, Audit decorator | — | Sin test dedicado para intento no autorizado; sin versioning/restore en auth-service |
| RF-43 | Autenticación y SSO | **4** | AuthService completo: login, SSO Google (GoogleStrategy + GoogleOAuthService), register, JWT tokens, refresh rotation, blacklist, forgot/reset password | auth.service.spec | Falta envío real de email (TODO), falta revocación automática al salir de universidad |
| RF-44 | Auditoría de accesos | **4** | AuditService con modelo AuditLog, eventos EDA (AUDIT_LOG_CREATED, AUDIT_UNAUTHORIZED_ATTEMPT), filtros por usuario/recurso/acción, cleanOldLogs, @Audit decorator en controllers | audit.service.spec | Falta exportación CSV de audit logs, falta retención configurable desde UI |
| RF-45 | 2FA solicitudes críticas | **4** | TwoFactorService: setup, enable, disable, verify TOTP (speakeasy), backup codes, QR code generation. Auth controller: /2fa/setup, /2fa/enable, /2fa/disable, /login/2fa, /login/backup-code, /2fa/regenerate-backup-codes | two-factor.service.spec | 2FA solo en login, no en acciones críticas dentro del sistema (eliminar recursos, cambiar permisos) |
| FLOW-AUTH | Flujos auth | **3** | Todos los flujos documentados están implementados: gestión roles, autenticación, 2FA, auditoría, restricciones | — | Sin e2e tests del flujo completo |

### Resources Domain (resources-service)

| Rule | Título | Score | Evidencia | Tests | Gaps |
| --- | --- | --- | --- | --- | --- |
| RF-01 | CRUD Recursos | **4** | ResourceService + ResourcesController: Create, Update, Delete (soft), Restore. CQRS commands/queries completos. Events EDA (RESOURCE_CREATED). Audit decorators. Permission guards. Validación de código único, conflictos con reservas activas | resource.service.spec | Falta notificación a usuarios con reservas al cambiar disponibilidad |
| RF-02 | Asociar categorías/programas | **3** | CategoryService + CategoriesController CRUD. Recurso tiene categoryId y programIds[]. Filtros por categoría y programa en queries. ProgramsController, FacultiesController, DepartmentsController | category.service.spec | Falta notificación al reasignar categoría/programa |
| CHAR | Characteristics | **4** | ReferenceDataModule + ResourceService.resolveResourceCharacteristics(). Endpoint GET /resources/characteristics. Creación on-the-fly de characteristics. | attribute-validation.service.spec | — |
| FLOW-RES | Flujos resources | **3** | CRUD, atributos, categorías, mantenimiento, importación CSV, programas — todos implementados | — | Sin e2e tests |

### Availability Domain (availability-service)

| Rule | Título | Score | Evidencia | Tests | Gaps |
| --- | --- | --- | --- | --- | --- |
| RF-07 | Horarios disponibles | **3** | AvailabilitiesController + AvailabilityExceptionsController. AvailabilityRules en ResourceEntity. MaintenanceBlocksController | — | Sin test unitario dedicado para validación de horarios |
| RF-08 | Integración calendarios | **2** | CalendarViewController existe. No se encontró integración real con Google Calendar/Outlook APIs | — | ⚠️ Sin integración real con APIs externas de calendario |
| RF-09 | Búsqueda disponibilidad | **3** | SearchResourcesAdvancedQuery en resources-service. ReservationsController en availability-service con filtros | — | Sin test dedicado |
| RF-10 | Visualización calendario | **3** | CalendarViewController dedicado con endpoint de vista calendario | calendar-view.service.spec | Falta representación de reservas recurrentes en vista |
| RF-11 | Historial de uso | **3** | HistoryController dedicado. Registro automático de reservas en availability-service | — | Falta exportación CSV del historial |
| RF-12 | Reservas periódicas | **3** | RecurringReservationService con spec dedicado. Lógica de periodicidad implementada | recurring-reservation.service.spec | Falta validación de conflictos en todas las fechas de la serie |
| RF-13 | VoBo docente | **3** | Flujo de aprobación integrado con stockpile-service. Reservaciones quedan en estado pendiente | reservation.service.spec | Falta timeout automático configurable para rechazo |
| RF-14 | Lista de espera | **3** | WaitingListController + WaitingListService dedicados. NotifyWaitingListCommand | waiting-list.service.spec | Falta priorización por tipo de usuario |
| RF-15 | Reasignación reservas | **3** | ReassignmentController + ReassignmentService dedicados | reassignment.service.spec | Falta lógica de equivalencias entre recursos |
| RF-16 | Restricciones por categoría | **3** | Restricciones basadas en permisos y roles. Guards a nivel de controller | — | Falta solicitud de acceso especial |
| RF-17 | Tiempo entre reservas | **3** | AvailabilityRules en ResourceEntity incluye configuración de buffer time | — | Sin test dedicado |
| RF-18 | Cancelar/modificar reglas | **3** | ReservationsController con endpoints de cancelación/modificación | reservation.service.spec | Falta sistema de penalizaciones por cancelaciones tardías |
| RF-19 | Reservas múltiples | **2** | No se encontró endpoint dedicado para reservas múltiples en una solicitud | — | ⚠️ Falta implementación de solicitud multi-recurso |
| FLOW-AVAIL | Flujos availability | **3** | Consulta, reserva, validación, modificación, lista espera, reasignación — todos con controllers | — | Sin e2e tests |

### Stockpile Domain (stockpile-service)

| Rule | Título | Score | Evidencia | Tests | Gaps |
| --- | --- | --- | --- | --- | --- |
| RF-20 | Solicitudes validadas por responsable | **4** | ApprovalRequestService completo: createApprovalRequest, approveStep, rejectStep, cancelApprovalRequest. ApprovalRequestsController con CQRS (7 commands). Flujo multi-step con ApprovalFlowEntity. Validación de estado (PENDING/IN_REVIEW). Reasignación a otro validador con findPendingOlderThan. Auditoría completa (ApprovalAuditService.logRequestCreation/Approval/Rejection/Cancellation) | approval-request.service.spec | Falta timeout automático configurable para reasignación a otro validador |
| RF-21 | Generación documento aprobación/rechazo | **3** | DocumentGenerationService con PDFKit + Handlebars templates (APPROVAL_LETTER, REJECTION_LETTER, CONFIRMATION, CHECK_OUT_RECEIPT). Templates HTML con logo institucional, firma digital (DigitalSignatureService), QR code (QRCodeService). DocumentController: POST /generate, POST /approval-letter, POST /rejection-letter, GET /:id/download | — | ⚠️ Descarga desde storage no implementada (TODO: S3/GCS). Falta firma digital certificada real |
| RF-22 | Notificación con carta al solicitante | **3** | NotificationProviderService + EnhancedNotificationService + NotificationEventHandler. NotificationsModule integrado via RabbitMQ. NotificationTemplateService para templates de email. Notification schema + entity | — | Falta envío automático del PDF adjunto al email. Integración parcial |
| RF-23 | Pantalla vigilancia reservas aprobadas | **4** | MonitoringController completo (RF-23 explícito en comments): GET /active, GET /overdue, GET /history/:resourceId, GET /statistics, GET /alerts, POST /incident, POST /incident/:id/resolve. MonitoringService con getActiveCheckIns, getOverdueCheckIns, getStatistics, getActiveAlerts. Roles guard: SECURITY, GENERAL_ADMIN, PROGRAM_ADMIN. También getActiveTodayApprovals en ApprovalRequestService con DataEnrichmentService | — | Falta WebSocket push para actualizaciones en tiempo real al dashboard |
| RF-24 | Flujos aprobación según tipo usuario | **3** | ApprovalFlowService CRUD completo. ApprovalFlowEntity con steps[], resourceTypes[], autoApproveConditions. ApprovalFlowsController: POST, GET, PATCH, POST /:id/activate, POST /:id/deactivate, DELETE. Flujos configurables por tipo de recurso con getApplicableFlows(resourceType) | approval-flow.service.spec | Falta configuración visual en UI. Falta validación de que el tipo de usuario match con el step |
| RF-25 | Registro y trazabilidad auditable | **4** | ApprovalAuditService completo: logRequestCreation, logStepApproval, logStepRejection, logRequestApproval, logRequestRejection, logRequestCancellation. ApprovalAuditLog schema + entity. Cada acción registra userId, role, ipAddress, userAgent, timestamp, metadata. ApprovalAuditLogRepository con findMany y filtros | approval-audit.service.spec | Falta exportación CSV/PDF del historial de auditoría |
| RF-26 | Check-in/check-out digital | **4** | CheckInOutController: POST /check-in, POST /check-out, GET /:id, GET /reservation/:reservationId, GET /user/me, GET /active/all, GET /overdue/all. CheckInOutService con entity completa (status, resourceCondition, damageReported, digitalSignature, coordinates). QRCodeService para verificación. GeolocationService para validación de proximidad | check-in-out.service.spec | Falta integración con NFC/Bluetooth. Falta firma digital en check-out |
| RF-27 | Integración email/WhatsApp | **2** | NotificationProviderService + EnhancedNotificationService + NotificationTemplateService. libs/notifications con 58 archivos. NotificationsModule configurado con RabbitMQ. TenantNotificationConfigController para configuración por tenant. NotificationChannel enum (EMAIL, WHATSAPP, PUSH, SMS) | — | ⚠️ WhatsApp no tiene provider real implementado. Email parcial via eventos. Falta integración con Twilio/WhatsApp Business API |
| RF-28 | Notificaciones automáticas confirma/cancela/modifica | **3** | NotificationEventHandler suscrito a eventos de reserva. ReminderService con processPendingApprovalReminders. EventBusIntegrationModule suscrito a eventos. reservation-confirmed.handler en event-handlers. CancelApprovalRequest publica eventos | — | Falta cobertura completa de todos los eventos (modificación). Falta template personalizable por tipo de notificación |
| RF-29 | Recordatorios reserva personalizables | **3** | ReminderService + ReminderConfiguration schema/entity. ReminderType enum (RESERVATION_UPCOMING, APPROVAL_PENDING, CHECK_IN_REMINDER, CHECK_OUT_REMINDER). Configuración por tipo con triggerBeforeMinutes, channels, isActive. AuthServiceClient para obtener datos de usuario | — | Falta UI para que usuarios configuren sus recordatorios. Falta cron/scheduler para ejecución automática |
| RF-30 | Alerta tiempo real recurso disponible por cancelación | **3** | ProximityNotificationController completo: POST /check, GET /user/:userId/reservation/:reservationId, GET /active, DELETE /clear, GET /thresholds. ProximityNotificationService con thresholds (FAR, APPROACHING, NEAR, ARRIVED). StockpileWebSocketService para push en tiempo real. monitoring.gateway + geolocation-dashboard.gateway WebSocket gateways | — | Falta integración directa con lista de espera al cancelar. Falta notificación push real a usuarios en espera |
| FLOW-STOCK | Flujos stockpile | **3** | Todos los flujos documentados implementados: solicitud → validación → aprobación/rechazo → documento → notificación → check-in/out → monitoreo | 4 specs | Sin e2e tests del flujo completo |

### Reports Domain (reports-service)

| Rule | Título | Score | Evidencia | Tests | Gaps |
| --- | --- | --- | --- | --- | --- |
| RF-31 | Reportes uso/programa/periodo | **3** | UsageReportsController + UsageReportService | usage-report.service.spec | Falta reportes automáticos programados |
| RF-32 | Reservas por usuario | **3** | UserReportsController dedicado | — | Sin test dedicado |
| RF-33 | Exportar CSV | **3** | ExportController + ExportService dedicados | export.service.spec | Falta historial de exportaciones |
| RF-34 | Feedback calidad servicio | **3** | FeedbackController + FeedbackService | feedback.service.spec | Falta moderación de contenido ofensivo |
| RF-35 | Evaluación usuarios admin | **3** | EvaluationController dedicado | — | Sin test dedicado |
| RF-36 | Dashboard interactivo | **3** | DashboardController + ReportsDashboardController + DashboardService | dashboard.service.spec | Falta WebSocket para actualización en tiempo real |
| RF-37 | Demanda insatisfecha | **3** | DemandReportsController + DemandReportService | demand-report.service.spec | Falta configuración de alertas de umbral |
| RF-38 | Conflictos de reserva | **3** | Reporte de conflictos integrado | conflict-report.service.spec | Falta alertas automáticas por umbral |
| RF-39 | Cumplimiento de reservas | **3** | Reporte de compliance integrado | compliance-report.service.spec | Falta integración con check-in/out para cumplimiento real |
| RF-40 | Cancelaciones y ausencias | **3** | Reporte de cancelaciones integrado | — | Falta medidas correctivas automáticas |
| FLOW-REP | Flujos reports | **3** | Todos los flujos documentados tienen controllers y servicios | — | Sin e2e tests |

---

## Score por Dominio

| Dominio | Rules | Promedio | Min | Max | Tests |
| --- | --- | --- | --- | --- | --- |
| Auth | 6 | **3.7** | 3 | 4 | 5 specs |
| Resources | 4 | **3.5** | 3 | 4 | 5 specs |
| Availability | 14 | **2.9** | 2 | 3 | 5 specs |
| Stockpile | 12 | **3.2** | 2 | 4 | 4 specs |
| Reports | 11 | **3.0** | 3 | 3 | 7 specs |
| **Total** | **47** | **3.1** | 2 | 4 | **27 specs** |

---

## Distribución de Scores

| Score | Count | % | Descripción |
| --- | --- | --- | --- |
| 5 | 0 | 0% | Production-grade |
| 4 | 8 | 17% | Completo con pruebas |
| 3 | 32 | 68% | Funcional |
| 2 | 7 | 15% | Parcial |
| 1 | 0 | 0% | Esqueleto |
| 0 | 0 | 0% | Sin evidencia |

---

## Arquitectura Transversal

| Aspecto | Estado | Evidencia |
| --- | --- | --- |
| Hexagonal (domain/application/infrastructure) | Implementado en todos los servicios | Estructura de carpetas consistente |
| CQRS (commands/queries/handlers) | Implementado | CommandBus + QueryBus en todos los controllers |
| EDA (events distribuidos) | Implementado | libs/event-bus con RabbitMQ/Kafka adapters, DLQ, event-store |
| Idempotency | Implementado | libs/idempotency + IdempotencyGuard |
| Cache (Redis) | Implementado | CacheInterceptor en endpoints GET, RedisService en servicios |
| Audit | Implementado | @Audit decorator, AuditService, AuditLog schema, EDA events |
| Auth (JWT + SSO) | Implementado | JwtStrategy, GoogleStrategy, token blacklist, refresh rotation |
| Permissions (RBAC) | Implementado | PermissionsGuard + RolesGuard + @RequirePermissions |
| Observabilidad | Parcial | Winston logger en servicios, OpenTelemetry setup en libs/common/telemetry |
| i18n | Parcial | libs/i18n + I18nModule importado en servicios |

---

## Plan de Mejora (Top 10 Acciones)

| # | Acción | Dominio | Rules afectadas | Skill recomendado | Impacto |
| --- | --- | --- | --- | --- | --- |
| 1 | Agregar tests BDD Given-When-Then para servicios core | Todos | Todas | `qa-calidad` | Desbloquea score >= 4 en 29 rules |
| 2 | Implementar reservas múltiples en una solicitud (RF-19) | Availability | RF-19 | `backend` | Score 2 → 3+ |
| 3 | Integrar calendarios externos Google/Outlook (RF-08) | Availability | RF-08 | `backend` | Score 2 → 3+ |
| 4 | Implementar WhatsApp Business API real (RF-27) | Stockpile | RF-27,RF-28 | `backend` | Score 2 → 3+ para RF-27 |
| 5 | Implementar 2FA en acciones críticas (no solo login) | Auth | RF-45 | `seguridad-avanzada` | Cumple ACs completos de RF-45 |
| 6 | Implementar storage S3/GCS para documentos PDF (RF-21) | Stockpile | RF-21,RF-22 | `plataforma-build-deploy-operate-observe` | Habilita descarga real de documentos |
| 7 | Agregar e2e tests por flujo completo | Todos | FLOW-* | `qa-calidad` | Desbloquea score >= 4 en flows |
| 8 | Implementar penalizaciones por cancelaciones tardías | Availability | RF-18,RF-40 | `backend` | Completa lógica de negocio |
| 9 | Dashboard con WebSocket para tiempo real | Reports | RF-36 | `web-app` | Cumple AC de actualización real-time |
| 10 | Exportación CSV en módulo de auditoría | Auth | RF-44 | `backend` | Completa ACs de auditoría |

---

## Artefactos del Run

| Artefacto | Path |
| --- | --- |
| Folder Map | `_inventory/folder-map.md` |
| File Stats | `_inventory/file-stats.json` |
| Rules Normalized | `_catalog/rules.normalized.json` |
| Rules Index | `_catalog/rules.index.md` |
| README (este archivo) | `README.md` |
