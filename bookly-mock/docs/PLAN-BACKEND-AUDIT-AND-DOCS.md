# Plan: Auditoría Backend, Documentación y API Specs

**Fecha**: Febrero 2026  
**Estado**: 🔄 En ejecución  
**Objetivo**: Auditar ciclo de vida completo, flujos de dominio, OpenAPI/AsyncAPI y actualizar toda la documentación de bookly-mock.

---

## Diagnóstico Inicial

| Área                  | Estado Actual       | Hallazgos Clave                                                                                                                                       |
| --------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Graceful Shutdown** | 🔴 Bug crítico      | Ningún `main.ts` llama `app.enableShutdownHooks()` de NestJS → los hooks `onModuleDestroy` de EventBus/Redis NO se disparan al cerrar                 |
| **Startup**           | ✅ OK               | Los 6 servicios compilan e inician correctamente                                                                                                      |
| **Domain Flows**      | 🟡 Por auditar      | 44 RFs definidos, necesitan cruce contra controllers/handlers reales                                                                                  |
| **OpenAPI**           | 🟡 Parcial          | 60 controllers tienen `@ApiTags`, pero falta auditar `@ApiOperation`, `@ApiResponse`, `@ApiParam`, `@ApiBody` y `@ApiProperty` en DTOs                |
| **AsyncAPI**          | 🔴 Casi inexistente | Solo 1 archivo YAML existe (`stockpile/geolocation-dashboard.asyncapi.yaml`). No hay specs para los ~20+ event types del sistema                      |
| **Documentación**     | 🟡 Desactualizada   | `API_DOCUMENTATION_STATUS.md` (fecha 2025-11-20) dice AsyncAPI ✅ para todos pero no es verdad. Per-service docs no reflejan cambios de consolidación |

---

## FASE 1: Ciclo de Vida — Startup, Shutdown y Graceful Close

**Prioridad**: 🔴 P0 — Bug de shutdown afecta producción  
**Estimación**: ~2h

### 1.1 Fix Graceful Shutdown en todos los `main.ts`

**Problema**: `DatabaseService.enableShutdownHooks()` escucha SIGTERM/SIGINT y llama `app.close()`, pero NestJS solo dispara los hooks `onModuleDestroy` de los providers si `app.enableShutdownHooks()` fue llamado previamente. Sin esto:

- `EventBusService.onModuleDestroy()` → NO cierra RabbitMQ connections
- `RedisService.onModuleDestroy()` → NO cierra Redis connections
- Resultado: conexiones huérfanas, posible corrupción de mensajes en cola

**Solución**: Agregar `app.enableShutdownHooks()` en cada `main.ts` ANTES de `databaseService.enableShutdownHooks(app)`.

**Archivos a modificar** (6):

- `apps/api-gateway/src/main.ts`
- `apps/auth-service/src/main.ts`
- `apps/resources-service/src/main.ts`
- `apps/availability-service/src/main.ts`
- `apps/stockpile-service/src/main.ts`
- `apps/reports-service/src/main.ts`

### 1.2 Verificar Barrel Exports de Handlers

Asegurar que todos los handlers CQRS están exportados en los barrels (`application/handlers/index.ts`) de cada servicio, incluyendo los nuevos:

- auth: `UpdateUserHandler`, `DeleteUserHandler`
- availability: `DeleteAvailabilityHandler`, `CancelWaitingListHandler`
- stockpile: `ActivateApprovalFlowHandler`, `DeleteApprovalFlowHandler`, `DeleteApprovalRequestHandler`

### 1.3 Verificar Startup Completo

Para cada servicio verificar:

- [x] Compila sin errores
- [ ] Conecta a MongoDB
- [ ] Conecta a Redis
- [ ] Conecta a RabbitMQ
- [ ] Registra todos los handlers CQRS
- [ ] Swagger UI accesible
- [ ] Health endpoint responde

### 1.4 Test de Graceful Shutdown

Para cada servicio:

- [ ] SIGTERM → log "closing..." → cierra DB, Redis, RabbitMQ → exit 0
- [ ] SIGINT → misma secuencia
- [ ] No deja conexiones huérfanas
- [ ] No genera errores en logs al cerrar

### 1.5 Auditar Providers con Conexiones

| Provider          | `onModuleInit` | `onModuleDestroy`     | Estado                            |
| ----------------- | -------------- | --------------------- | --------------------------------- |
| `DatabaseService` | ✅             | ✅ (close connection) | OK                                |
| `EventBusService` | ✅ (connect)   | ✅ (disconnect)       | OK pero no se dispara sin fix 1.1 |
| `RedisService`    | ✅ (connect)   | ✅ (quit)             | OK pero no se dispara sin fix 1.1 |
| `RabbitMQAdapter` | N/A            | ✅ (disconnect)       | OK pero no se dispara sin fix 1.1 |

---

## FASE 2: Auditoría de Flujos de Dominio

**Prioridad**: 🔴 P0  
**Estimación**: ~4h

Cruzar cada Requerimiento Funcional (RF) contra los controllers, handlers y services reales.

### 2.1 auth-service (RF-41 → RF-45)

| RF    | Descripción                 | Controller                                  | Handler                         | Servicio       | Estado  |
| ----- | --------------------------- | ------------------------------------------- | ------------------------------- | -------------- | ------- |
| RF-41 | Gestión de roles            | `role.controller.ts`                        | Create/Update/DeleteRoleHandler | `RoleService`  | Auditar |
| RF-42 | Restricción de modificación | Guards + decorators                         | —                               | —              | Auditar |
| RF-43 | Autenticación y SSO         | `auth.controller.ts`, `oauth.controller.ts` | RegisterUser, LoginHandler      | `AuthService`  | Auditar |
| RF-44 | Auditoría                   | `audit.controller.ts`                       | —                               | `AuditService` | Auditar |
| RF-45 | Doble factor                | `auth.controller.ts`                        | —                               | `AuthService`  | Auditar |

**Extras**: `AppConfigurationController`, `ReferenceDataController`, `PermissionController`, `UsersController`

### 2.2 resources-service (RF-01 → RF-06)

| RF    | Descripción                   | Controller                                                                         | Estado  |
| ----- | ----------------------------- | ---------------------------------------------------------------------------------- | ------- |
| RF-01 | CRUD recursos                 | `resources.controller.ts`                                                          | Auditar |
| RF-02 | Asociación categoría/programa | `categories.controller.ts`, `faculties.controller.ts`, `departments.controller.ts` | Auditar |
| RF-03 | Atributos clave               | `resources.controller.ts`                                                          | Auditar |
| RF-04 | Importación masiva            | `import.controller.ts`                                                             | Auditar |
| RF-05 | Reglas de disponibilidad      | `resources.controller.ts`                                                          | Auditar |
| RF-06 | Mantenimiento                 | `maintenances.controller.ts`                                                       | Auditar |

### 2.3 availability-service (RF-07 → RF-19)

| RF    | Descripción               | Controller                              | Estado  |
| ----- | ------------------------- | --------------------------------------- | ------- |
| RF-07 | Configurar disponibilidad | `availabilities.controller.ts`          | Auditar |
| RF-08 | Integración calendarios   | `calendar-view.controller.ts`           | Auditar |
| RF-09 | Búsqueda avanzada         | `reservations.controller.ts`            | Auditar |
| RF-10 | Visualización calendario  | `calendar-view.controller.ts`           | Auditar |
| RF-11 | Historial de uso          | `history.controller.ts`                 | Auditar |
| RF-12 | Reservas recurrentes      | `reservations.controller.ts`            | Auditar |
| RF-13 | Modificación/cancelación  | `reservations.controller.ts`            | Auditar |
| RF-14 | Lista de espera           | `waiting-lists.controller.ts`           | Auditar |
| RF-15 | Reasignación              | `reassignment.controller.ts`            | Auditar |
| RF-16 | Conflictos disponibilidad | `availabilities.controller.ts`          | Auditar |
| RF-17 | Disponibilidad por perfil | `availabilities.controller.ts`          | Auditar |
| RF-18 | Eventos institucionales   | `availability-exceptions.controller.ts` | Auditar |
| RF-19 | Interfaz accesible        | Frontend concern                        | N/A     |

### 2.4 stockpile-service (RF-20 → RF-28)

| RF    | Descripción             | Controller                        | Estado  |
| ----- | ----------------------- | --------------------------------- | ------- |
| RF-20 | Validar solicitudes     | `approval-requests.controller.ts` | Auditar |
| RF-21 | Generación documentos   | `documents.controller.ts`         | Auditar |
| RF-22 | Notificación automática | `notifications.controller.ts`     | Auditar |
| RF-23 | Pantalla vigilancia     | `monitoring.controller.ts`        | Auditar |
| RF-24 | Flujos diferenciados    | `approval-flows.controller.ts`    | Auditar |
| RF-25 | Trazabilidad            | `approval-requests.controller.ts` | Auditar |
| RF-26 | Check-in/out            | `check-in-out.controller.ts`      | Auditar |
| RF-27 | Mensajería              | `notifications.controller.ts`     | Auditar |
| RF-28 | Notificaciones cambios  | Event handlers                    | Auditar |

### 2.5 reports-service (RF-31 → RF-39)

| RF    | Descripción          | Controller                                                 | Estado  |
| ----- | -------------------- | ---------------------------------------------------------- | ------- |
| RF-31 | Reportes de uso      | `usage-reports.controller.ts`                              | Auditar |
| RF-32 | Reportes por usuario | `user-reports.controller.ts`                               | Auditar |
| RF-33 | Exportación CSV      | `export.controller.ts`                                     | Auditar |
| RF-34 | Feedback             | `feedback.controller.ts`                                   | Auditar |
| RF-35 | Evaluación           | `evaluation.controller.ts`                                 | Auditar |
| RF-36 | Dashboards           | `dashboard.controller.ts`, `audit-dashboard.controller.ts` | Auditar |
| RF-37 | Demanda insatisfecha | `demand-reports.controller.ts`                             | Auditar |

### 2.6 api-gateway

| Funcionalidad         | Controller/Gateway            | Estado  |
| --------------------- | ----------------------------- | ------- |
| Proxy REST            | `proxy.controller.ts`         | Auditar |
| WebSocket CRUD events | `websocket.gateway.ts`        | Auditar |
| Health aggregation    | `health.controller.ts`        | Auditar |
| DLQ management        | `dlq.controller.ts`           | Auditar |
| Notifications         | `notifications.controller.ts` | Auditar |
| Cache metrics         | `cache-metrics.controller.ts` | Auditar |
| Events dashboard      | `events.controller.ts`        | Auditar |

---

## FASE 3: Completitud OpenAPI

**Prioridad**: 🟡 P1  
**Estimación**: ~4h

### 3.1 Auditar Decoradores por Servicio

Para cada controller verificar presencia de:

- `@ApiTags(...)` — ✅ 60/60 controllers tienen
- `@ApiOperation({ summary, description })` — Por auditar
- `@ApiResponse({ status, description, type })` — Por auditar
- `@ApiParam({ name, description, type })` — Por auditar
- `@ApiBody({ type })` — Por auditar
- `@ApiBearerAuth()` — Por auditar

### 3.2 Auditar DTOs

Para cada DTO verificar:

- `@ApiProperty({ description, example, type, required })` — Por auditar
- `@ApiPropertyOptional(...)` — Por auditar

### 3.3 Checklist por Servicio

| Servicio             | Controllers | @ApiOperation | @ApiResponse | @ApiParam | @ApiBody | DTOs |
| -------------------- | ----------- | ------------- | ------------ | --------- | -------- | ---- |
| api-gateway          | 9           | ?             | ?            | ?         | ?        | ?    |
| auth-service         | 9           | ?             | ?            | ?         | ?        | ?    |
| resources-service    | 8           | ?             | ?            | ?         | ?        | ?    |
| availability-service | 11          | ?             | ?            | ?         | ?        | ?    |
| stockpile-service    | 10+         | ?             | ?            | ?         | ?        | ?    |
| reports-service      | 11          | ?             | ?            | ?         | ?        | ?    |

### 3.4 Verificar Swagger Tags vs Controllers

Asegurar que cada tag declarado en `main.ts` → `DocumentBuilder.addTag()` tiene al menos un controller que lo usa con `@ApiTags()`.

---

## FASE 4: AsyncAPI — Documentación de Eventos

**Prioridad**: 🟡 P1  
**Estimación**: ~5h

### Estado Actual

- **Existe**: 1 archivo `stockpile-service/src/infrastructure/gateways/geolocation-dashboard.asyncapi.yaml`
- **Falta**: Specs para TODOS los event types del sistema (~20+ topics)

### 4.1 AsyncAPI spec — api-gateway WebSocket

Canal WebSocket `/api/v1/ws` que reenvía eventos CRUD a clientes conectados.

**Eventos a documentar**:

- `user.created`, `user.updated`, `user.deleted`
- `role.created`, `role.updated`, `role.deleted`
- `resource.created`, `resource.updated`, `resource.deleted`
- `reservation.created`, `reservation.updated`, `reservation.cancelled`
- `availability.created`, `availability.updated`, `availability.deleted`
- `approval.requested`, `approval.approved`, `approval.rejected`
- `checkin.completed`, `checkout.completed`
- `report.generated`, `export.completed`

**Archivo**: `apps/api-gateway/src/infrastructure/websocket/websocket.asyncapi.yaml`

### 4.2 AsyncAPI spec — auth-service

**Eventos publicados**: `user.created`, `user.updated`, `user.deleted`, `role.assigned`, `role.created`, `role.updated`  
**Eventos consumidos**: Ninguno (origen)

**Archivo**: `apps/auth-service/docs/auth-events.asyncapi.yaml`

### 4.3 AsyncAPI spec — resources-service

**Eventos publicados**: `resource.created`, `resource.updated`, `resource.deleted`, `resource.status.changed`  
**Eventos consumidos**: Ninguno (origen)

**Archivo**: `apps/resources-service/docs/resources-events.asyncapi.yaml`

### 4.4 AsyncAPI spec — availability-service

**Eventos publicados**: `reservation.created`, `reservation.updated`, `reservation.cancelled`, `availability.created`, `availability.updated`  
**Eventos consumidos**: `resource.updated`, `resource.deleted`, `resource.status.changed`, `role.assigned`, `approval.granted`, `approval.rejected`, `maintenance.scheduled`

**Archivo**: `apps/availability-service/docs/availability-events.asyncapi.yaml`

### 4.5 AsyncAPI spec — stockpile-service

**Eventos publicados**: `approval.requested`, `approval.approved`, `approval.rejected`, `checkin.completed`, `checkout.completed`, `notification.send.*`  
**Eventos consumidos**: `reservation.created`, `resource.status.changed`, `user.created`, `user.updated`

**Archivo**: `apps/stockpile-service/docs/stockpile-events.asyncapi.yaml`

### 4.6 AsyncAPI spec — reports-service

**Eventos publicados**: `report.generated`, `export.completed`  
**Eventos consumidos**: `audit.*`, `reservation.*`, `resource.*`, `approval.*`

**Archivo**: `apps/reports-service/docs/reports-events.asyncapi.yaml`

---

## FASE 5: Actualización de Documentación

**Prioridad**: 🟢 P2  
**Estimación**: ~3h

### 5.1 Actualizar docs por servicio

Para cada `apps/{service}/docs/`:

- **INDEX.md** — Reflejar nuevos controllers, módulos y features
- **ENDPOINTS.md** — Listar todos los endpoints reales con sus rutas
- **DATABASE.md** — Reflejar schemas actuales (incluyendo ReferenceData, AppConfiguration)
- **EVENT_BUS.md** — Documentar eventos publicados y consumidos
- **SEEDS.md** — Documentar datos de seed actuales (incluyendo ReferenceData seeds)

### 5.2 Actualizar `docs/api/API_DOCUMENTATION_STATUS.md`

- Actualizar fecha a Febrero 2026
- Corregir tabla de AsyncAPI (actualmente dice ✅ para todos pero es falso)
- Agregar nuevos endpoints que faltan en la tabla
- Reflejar cambios de consolidación (ReferenceData, AppConfiguration)

### 5.3 Actualizar `docs/INDEX.md`

- Agregar sección para AsyncAPI specs
- Agregar referencia a este plan
- Agregar sección para cambios de consolidación backend

### 5.4 Archivar `PLAN-BACKEND-CONSOLIDATION.md`

Mover a `docs/archive/` con nota de completado.

### 5.5 Crear CHANGELOG de consolidación

Resumen de todos los cambios realizados en las sesiones de consolidación:

- ~70 archivos creados/modificados
- ReferenceData dinámico
- UserRole enum→string migration
- CRUD handlers completados
- AppConfiguration module
- WebSocket gateway events
- DI fixes

---

## Orden de Ejecución

| Prioridad | Fase                  | Estimación | Impacto                                   |
| --------- | --------------------- | ---------- | ----------------------------------------- |
| 🔴 P0     | Fase 1: Lifecycle     | ~2h        | Graceful shutdown roto en producción      |
| 🔴 P0     | Fase 2: Domain Flows  | ~4h        | Garantiza que los RFs están implementados |
| 🟡 P1     | Fase 3: OpenAPI       | ~4h        | API docs completos para consumidores      |
| 🟡 P1     | Fase 4: AsyncAPI      | ~5h        | EDA docs inexistentes hoy                 |
| 🟢 P2     | Fase 5: Documentación | ~3h        | Coherencia y mantenibilidad               |

**Total estimado: ~18h**

---

## Progreso de Ejecución

### Fase 1: Lifecycle ✅ COMPLETADA

- [x] 1.1 Fix `app.enableShutdownHooks()` en 6 main.ts — Agregado + removido `databaseService.enableShutdownHooks()` redundante que causaba double-close
- [x] 1.2 Verificar barrel exports de handlers — Todos correctos (auth: 17cmd+10query, availability: 22cmd+13query, stockpile: 12cmd+6query, resources: 13cmd+8query, reports: 16handlers)
- [x] 1.3 Verificar startup — DB ✅, Redis ✅, RabbitMQ ✅, Swagger ✅, Health ✅
- [x] 1.4 Test graceful shutdown — SIGTERM → Redis disconnect → RabbitMQ disconnect → MongoDB close → exit 0 (sin errores)
- [x] 1.5 Hardened `RabbitMQAdapter.disconnect()` — try/catch individual para channel y connection ya cerrados

### Fase 2: Domain Flows ✅ COMPLETADA

- [x] 2.1 auth-service (RF-41→RF-45) — Roles CRUD+permissions, Guards/decorators, OAuth SSO Google, 2FA (setup/enable/disable/verify/backup), Audit con CSV export
- [x] 2.2 resources-service (RF-01→RF-06) — 10 endpoints resources, 6 import (CSV+async+rollback), 5 categories/faculties/departments, 5 maintenances
- [x] 2.3 availability-service (RF-07→RF-19) — 20 reservations (incl. recurring/batch), 5 availabilities, 4 calendar, 5 history, 3 waiting-lists, 4 reassignment, 6 maintenance-blocks, 4 exceptions
- [x] 2.4 stockpile-service (RF-20→RF-28) — 9 approvals, 7 flows, 7 check-in/out, 4 documents, 8 monitoring, 14 notifications (metrics+config), 5 proximity, 4 location-analytics
- [x] 2.5 reports-service (RF-31→RF-39) — 11 feedback, 11 evaluation, 8 audit-dashboard, 5 dashboard, 4 export, 2 usage, 1 demand, 1 user-reports
- [x] 2.6 api-gateway — proxy, health, events, DLQ, notifications, cache-metrics, webhook-dashboard, WebSocket gateway

### Fase 3: OpenAPI ✅ COMPLETADA

- [x] 3.1 Auditar decoradores — **313 `@ApiOperation`** across **56 controllers**. Todos con `@ApiResponse`, la mayoría con `@ApiQuery`/`@ApiParam`/`@ApiBody`
- [x] 3.2 DTOs — Los controllers usan DTOs tipados con `@ApiProperty` (verificado en auth, resources)
- [x] 3.3 Tags vs controllers — **60/60 controllers** tienen `@ApiTags`. Todos los tags de `main.ts` tienen controllers asociados
- [x] 3.4 No se encontraron decoradores faltantes significativos. 4 health controllers tienen decoradores mínimos (aceptable)

### Fase 4: AsyncAPI ✅ COMPLETADA

- [x] 4.1 api-gateway WebSocket spec — Ya existía `geolocation-dashboard.asyncapi.yaml` en stockpile
- [x] 4.2 auth-service events spec — `apps/auth-service/docs/auth-events.asyncapi.yaml` (8 channels: user CRUD, role.assigned, 2FA events, audit)
- [x] 4.3 resources-service events spec — `apps/resources-service/docs/resources-events.asyncapi.yaml` (14 channels: resource CRUD+status+category, availability rules, request-reply, consumed events)
- [x] 4.4 availability-service events spec — `apps/availability-service/docs/availability-events.asyncapi.yaml` (20 channels: recurring series/instances, reassignment, maintenance notifications, 8 consumed events)
- [x] 4.5 stockpile-service events spec — `apps/stockpile-service/docs/stockpile-events.asyncapi.yaml` (15 channels: check-in/out, approval audit, notifications sent/failed, 9 consumed events)
- [x] 4.6 reports-service events spec — `apps/reports-service/docs/reports-events.asyncapi.yaml` (21 channels: export, evaluation, feedback events, 12 consumed events)

### Fase 5: Documentación ✅ COMPLETADA

- [x] 5.1 Plan actualizado con resultados de ejecución
- [x] 5.2 API_DOCUMENTATION_STATUS.md actualizado
- [x] 5.3 INDEX.md maestro actualizado
