# Plan de Consolidación Backend — Bookly Mock

**Fecha**: Febrero 16, 2026
**Objetivo**: Asegurar que todo el backend está funcional, documentado y accesible.

---

## Principios de Diseño

1. **Zero hardcoded data** — Roles, permisos, categorías, tipos, estados, facultades, departamentos, programas y recursos se cargan desde la base de datos. El único rol fijo (seed) es `GENERAL_ADMIN`.
2. **EventBus + WebSocket** — Las escrituras (POST/PUT/DELETE) pasan por EventBus. El frontend recibe notificaciones vía WebSocket (`BooklyWebSocketGateway`) para actualizar la vista o mostrar notificaciones según convenga.
3. **GENERAL_ADMIN = Admin** — No se crea un rol SUPERADMIN. El `GENERAL_ADMIN` es quien configura Bookly.
4. **OpenAPI generado desde decoradores** — Se usa la librería `@nestjs/swagger` ya integrada. Cada controller genera su OpenAPI automáticamente desde los decoradores `@ApiOperation`, `@ApiResponse`, `@ApiProperty`, etc.
5. **Owner en entidades organizacionales** — Programas y Departamentos tienen un `ownerId` (user) como responsable.

---

## Auditoría del Estado Actual

### Servicios y Puertos

| Servicio             | Puerto | Swagger     | Controllers | Estado             |
| -------------------- | ------ | ----------- | ----------- | ------------------ |
| api-gateway          | 3000   | `/api/docs` | 8           | ⚠️ Parcial         |
| auth-service         | 3001   | `/api/docs` | 7           | ⚠️ TODOs           |
| resources-service    | 3002   | `/api/docs` | 5           | ⚠️ Enums hardcoded |
| availability-service | 3003   | `/api/docs` | 9           | ⚠️ Stubs + enums   |
| stockpile-service    | 3004   | `/api/docs` | 11          | ⚠️ Stubs/TODOs     |
| reports-service      | 3005   | `/api/docs` | 10          | ⚠️ Enums hardcoded |

### CRUD Stubs/TODOs (endpoints que retornan placeholder)

| Servicio             | Controller                                 | Endpoint                              | Problema                        |
| -------------------- | ------------------------------------------ | ------------------------------------- | ------------------------------- |
| auth-service         | `users.controller.ts`                      | `PATCH /users/:id`                    | Retorna placeholder sin command |
| auth-service         | `users.controller.ts`                      | `DELETE /users/:id`                   | Retorna placeholder sin command |
| availability-service | `availabilities.controller.ts`             | `DELETE /availabilities/:id`          | Stub: "to be implemented"       |
| availability-service | `waiting-lists.controller.ts`              | `DELETE /waiting-lists/:id`           | Stub: "to be implemented"       |
| stockpile-service    | `approval-requests.controller.ts`          | `DELETE /approval-requests/:id`       | Stub: "to be implemented"       |
| stockpile-service    | `approval-flows.controller.ts`             | `POST /approval-flows/:id/activate`   | Stub: "to be implemented"       |
| stockpile-service    | `approval-flows.controller.ts`             | `DELETE /approval-flows/:id`          | Stub: "to be implemented"       |
| stockpile-service    | `document.controller.ts`                   | `GET /documents/:id/download`         | Retorna 501 (no storage)        |
| stockpile-service    | `tenant-notification-config.controller.ts` | `POST /tenants/:id/channels/:ch/test` | Retorna "Not implemented"       |
| api-gateway          | `webhook-dashboard.controller.ts`          | Múltiples endpoints                   | TODOs: Sin BD, auth comentado   |

### Datos Hardcoded que deben migrar a BD

| Archivo                              | Dato hardcoded                                    | Debe ser                                                    |
| ------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| `libs/common/src/enums/index.ts`     | `UserRole` (6 valores)                            | Solo seed initial, consultar desde `roles` collection       |
| `libs/common/src/enums/index.ts`     | `ResourceType` (6 valores)                        | Collection `reference_data` group=`resource_type`           |
| `libs/common/src/enums/index.ts`     | `ResourceStatus` (4 valores)                      | Collection `reference_data` group=`resource_status`         |
| `libs/common/src/enums/index.ts`     | `MaintenanceType` (6 valores)                     | Collection `reference_data` group=`maintenance_type`        |
| `libs/common/src/enums/index.ts`     | `MaintenanceStatus` (4 valores)                   | Collection `reference_data` group=`maintenance_status`      |
| `libs/common/src/enums/index.ts`     | `ReservationStatus` (8 valores)                   | Collection `reference_data` group=`reservation_status`      |
| `libs/common/src/enums/index.ts`     | `ApprovalStatus` (4 valores)                      | Collection `reference_data` group=`approval_status`         |
| `libs/common/src/enums/index.ts`     | `ApprovalRequestStatus` (5 valores)               | Collection `reference_data` group=`approval_request_status` |
| `libs/common/src/enums/index.ts`     | `NotificationChannel` (5 valores)                 | Collection `reference_data` group=`notification_channel`    |
| `libs/common/src/enums/index.ts`     | `CheckInStatus`, `CheckInOutStatus`, etc.         | Collection `reference_data` por group                       |
| `libs/common/src/enums/index.ts`     | `FeedbackCategory`, `FeedbackType`, etc.          | Collection `reference_data` por group                       |
| `libs/common/src/constants/index.ts` | `DEFAULT_ROLES` (6 roles con permisos)            | Seed data para `roles` collection (ya existe)               |
| `libs/common/src/constants/index.ts` | `ACADEMIC_PROGRAMS` (8 programas)                 | Seed data para `programs` collection (ya existe)            |
| `libs/common/src/constants/index.ts` | `DEFAULT_CATEGORIES` (resource/maintenance types) | Seed data para `reference_data` collection                  |
| `resource.schema.ts`                 | `enum: Object.values(ResourceType)`               | Validación dinámica desde BD                                |
| `resource.schema.ts`                 | `enum: Object.values(ResourceStatus)`             | Validación dinámica desde BD                                |
| Múltiples schemas                    | Validaciones `enum` con import de enums           | Validación dinámica desde BD                                |

### Entidades Ausentes

| Entidad              | Estado       | Descripción                                                 |
| -------------------- | ------------ | ----------------------------------------------------------- |
| **Faculty**          | ❌ No existe | Facultades con `ownerId` (user responsable)                 |
| **Department**       | ❌ No existe | Departamentos con `ownerId` y `facultyId`                   |
| **ReferenceData**    | ❌ No existe | Colección genérica para tipos/estados/categorías dinámicos  |
| **AppConfiguration** | ❌ No existe | Configuración de la aplicación (registro, SSO, theme, i18n) |

### Funcionalidades Ausentes

| Feature                           | Estado            | Descripción                                             |
| --------------------------------- | ----------------- | ------------------------------------------------------- |
| **App Configuration**             | ❌ No existe      | No hay módulo para configuración de la aplicación       |
| **Toggle de registro**            | ❌ No existe      | No se puede habilitar/deshabilitar registro             |
| **Toggle auth corporativa**       | ❌ No existe      | No se puede configurar SSO desde admin                  |
| **Configuración de theme**        | ❌ No existe      | No hay endpoint para dark/light mode                    |
| **Configuración de traducciones** | ❌ No existe      | No hay gestión de i18n desde admin                      |
| **AsyncAPI completo**             | ⚠️ Solo 1 archivo | Solo `geolocation-dashboard.asyncapi.yaml` en stockpile |
| **OpenAPI unificado en Gateway**  | ⚠️ Parcial        | Gateway solo muestra sus propios controllers            |

### Google OAuth/SSO — Estado Actual

- ✅ `GoogleStrategy` existe con validación de dominio (`@ufps.edu.co`)
- ✅ `OAuthController` con endpoints `GET /auth/oauth/google` y `GET /auth/oauth/google/callback`
- ✅ `validateOrCreateSSOUser()` en `AuthService` — auto-crea usuario si no existe
- ✅ Asignación de roles por dominio de email
- ❌ No hay forma de deshabilitar SSO desde configuración (AppConfiguration)
- ❌ No valida si el registro general está habilitado antes de auto-crear

### API Gateway Routing — Estado

- ✅ **Correcto**: Proxy envía POST/PUT/DELETE/PATCH vía EventBus (fire-and-forget)
- ✅ **Correcto**: GET y endpoints auth van por HTTP directo
- ✅ **Correcto**: `BooklyWebSocketGateway` en `/api/v1/ws` notifica al frontend vía Socket.IO
- ⚠️ **Mejorar**: Asegurar que cada escritura exitosa en microservicio publica evento → WebSocket notifica al frontend
- ⚠️ **Mejorar**: OpenAPI del gateway solo muestra controllers propios, no los de microservicios

---

## Plan de Ejecución

### Fase 1: Datos Dinámicos desde BD (Prioridad Alta)

**Objetivo**: Eliminar todos los datos hardcoded (enums, constantes) y mover a colecciones en MongoDB consultables por API.

#### 1.1 Crear colección `ReferenceData` (genérica para tipos/estados/categorías)

**Schema reutilizable**: `libs/database/` — El schema y el módulo se definen una sola vez como código compartido.
**Datos por dominio**: Cada microservicio registra la colección `reference_data` en su propia base de datos y gestiona sus propios grupos de datos. No hay una BD centralizada de reference data.

```typescript
ReferenceData {
  group: string        // Ej: "resource_type", "resource_status", "reservation_status"
  code: string         // Ej: "CLASSROOM", "AVAILABLE", "PENDING"
  name: string         // Ej: "Salón de Clase", "Disponible"
  description?: string
  color?: string       // Para UI (Ej: "#3B82F6")
  icon?: string        // Para UI (Ej: "school")
  order: number        // Para ordenamiento en UI
  isActive: boolean
  isDefault: boolean   // Si es el valor por defecto para su grupo
  metadata?: Record<string, any>
  audit: { createdBy, updatedBy }
}
// Index compuesto: { group: 1, code: 1 } unique
```

**Archivos a crear:**

- [ ] `libs/database/src/schemas/reference-data.schema.ts`
- [ ] `libs/database/src/repositories/reference-data.repository.ts`
- [ ] `libs/database/src/services/reference-data.service.ts`

**Controller (en auth-service o api-gateway):**

- [ ] `apps/auth-service/src/infrastructure/controllers/reference-data.controller.ts`

```
GET    /reference-data?group=resource_type    — Listar por grupo
GET    /reference-data/groups                 — Listar grupos disponibles
GET    /reference-data/:id                    — Obtener por ID
POST   /reference-data                        — Crear (GENERAL_ADMIN)
PATCH  /reference-data/:id                    — Actualizar (GENERAL_ADMIN)
DELETE /reference-data/:id                    — Desactivar (GENERAL_ADMIN)
```

**Grupos iniciales (seed):**

- `resource_type`: CLASSROOM, LABORATORY, AUDITORIUM, MULTIMEDIA_EQUIPMENT, SPORTS_FACILITY, MEETING_ROOM
- `resource_status`: AVAILABLE, RESERVED, MAINTENANCE, UNAVAILABLE
- `maintenance_type`: PREVENTIVE, CORRECTIVE, EMERGENCY, CLEANING, UPGRADE, INSPECTION
- `maintenance_status`: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- `reservation_status`: PENDING, CONFIRMED, APPROVED, REJECTED, CHECKED_IN, ACTIVE, COMPLETED, CANCELLED
- `approval_status`: PENDING, APPROVED, REJECTED, CANCELLED
- `approval_request_status`: PENDING, IN_REVIEW, APPROVED, REJECTED, CANCELLED
- `notification_channel`: EMAIL, WHATSAPP, SMS, PUSH, IN_APP
- `notification_status`: PENDING, SENT, FAILED, READ
- `check_in_status`: NOT_CHECKED_IN, CHECKED_IN, CHECKED_OUT, LATE, NO_SHOW
- `feedback_category`: FACILITY, SERVICE, EQUIPMENT, CLEANLINESS, AVAILABILITY, OTHER
- `feedback_type`: POSITIVE, NEGATIVE, SUGGESTION, COMPLAINT
- `document_template_type`: APPROVAL, REJECTION, CERTIFICATE, NOTIFICATION
- `export_format`: CSV, EXCEL, PDF, JSON
- `recurrence_type`: NONE, DAILY, WEEKLY, MONTHLY
- `week_day`: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

#### 1.2 Crear entidad Faculty

**Ubicación**: `apps/resources-service/`

```typescript
Faculty {
  code: string         // Ej: "FING"
  name: string         // Ej: "Facultad de Ingeniería"
  description?: string
  ownerId: string      // User ID del decano/responsable
  ownerName?: string   // Cache
  ownerEmail?: string  // Cache
  isActive: boolean
  audit: { createdBy, updatedBy }
}
```

- [ ] `apps/resources-service/src/infrastructure/schemas/faculty.schema.ts`
- [ ] `apps/resources-service/src/infrastructure/controllers/faculties.controller.ts` — CRUD completo
- [ ] Commands/Handlers: create, update, delete faculty
- [ ] Queries: list, getById, getByOwner
- [ ] Registrar en `resources.module.ts`

#### 1.3 Crear entidad Department

**Ubicación**: `apps/resources-service/`

```typescript
Department {
  code: string         // Ej: "DIS"
  name: string         // Ej: "Departamento de Ingeniería de Sistemas"
  description?: string
  facultyId: string    // Referencia a Faculty
  ownerId: string      // User ID del director/responsable
  ownerName?: string   // Cache
  ownerEmail?: string  // Cache
  isActive: boolean
  audit: { createdBy, updatedBy }
}
```

- [ ] `apps/resources-service/src/infrastructure/schemas/department.schema.ts`
- [ ] `apps/resources-service/src/infrastructure/controllers/departments.controller.ts` — CRUD completo
- [ ] Commands/Handlers: create, update, delete department
- [ ] Queries: list, getById, getByFaculty, getByOwner
- [ ] Registrar en `resources.module.ts`

#### 1.4 Ajustar entidad Program — agregar ownerId

El schema `program.schema.ts` ya tiene `coordinatorId`. Formalizar:

- [ ] Agregar campo `ownerId` (alias o mismo que `coordinatorId`)
- [ ] Agregar `departmentId` como referencia (actualmente `department` es solo string)
- [ ] Agregar `facultyId` como referencia (actualmente `faculty` es solo string)
- [ ] Actualizar seed para crear programas con referencias reales

#### 1.5 Refactorizar schemas: quitar validación enum hardcoded

En todos los schemas que usan `enum: Object.values(SomeEnum)`:

- [ ] `resource.schema.ts` — `type` y `status`: cambiar `enum` por `type: String` (validar vía service contra BD)
- [ ] `reservation.schema.ts` — `status`: quitar enum hardcoded
- [ ] `maintenance.schema.ts` — `type` y `status`: quitar enum hardcoded
- [ ] `approval-flow.schema.ts` — quitar enums hardcoded
- [ ] `user.schema.ts` — `roles`: quitar `enum: UserRole`, usar `[String]`
- [ ] Demás schemas con enums: migrar a `type: String`

#### 1.6 Refactorizar guards y validaciones

- [ ] `PermissionsGuard` — Consultar permisos del usuario desde BD (via role → permissions)
- [ ] `RolesGuard` — Validar contra roles de BD, no contra enum `UserRole`
- [ ] Decorador `@Roles()` — Aceptar strings en vez de `UserRole` enum
- [ ] Decorador `@RequirePermissions()` — Validar contra permisos de BD

#### 1.7 Actualizar seeds

- [ ] `apps/auth-service/src/database/seed.ts` — Seed solo `GENERAL_ADMIN` como rol fijo + demás roles como data inicial editable
- [ ] `apps/resources-service/src/database/seed.ts` — Seed de faculties, departments, categories desde `reference_data`
- [ ] Crear `libs/database/src/seeds/reference-data.seed.ts` — Seed de toda la reference data
- [ ] Actualizar `libs/common/src/constants/index.ts` — Mover `DEFAULT_ROLES`, `ACADEMIC_PROGRAMS`, `DEFAULT_CATEGORIES` a seed files, eliminar de constants
- [ ] Los enums en `libs/common/src/enums/index.ts` se mantienen como **referencia de código** pero NO se usan para validación en schemas. Se usan solo como type hints opcionales.

---

### Fase 2: CRUD Funcional — Completar Stubs (Prioridad Alta)

#### 2.1 auth-service

- [ ] `commands/update-user.command.ts` + `handlers/update-user.handler.ts`
- [ ] `commands/delete-user.command.ts` + `handlers/delete-user.handler.ts`
- [ ] Actualizar `users.controller.ts` para usar commands reales
- [ ] Registrar handlers en `AllHandlers`
- [ ] Publicar eventos `USER_UPDATED` / `USER_DELETED` → WebSocket notifica al frontend

#### 2.2 availability-service

- [ ] `commands/delete-availability.command.ts` + handler
- [ ] `commands/cancel-waiting-list.command.ts` + handler
- [ ] Actualizar `availabilities.controller.ts` (DELETE) y `waiting-lists.controller.ts` (DELETE)
- [ ] Publicar eventos correspondientes → WebSocket

#### 2.3 stockpile-service

- [ ] `commands/delete-approval-request.command.ts` + handler
- [ ] `commands/activate-approval-flow.command.ts` + handler
- [ ] `commands/delete-approval-flow.command.ts` + handler
- [ ] Resolver document download (file storage service con filesystem local)
- [ ] Implementar tenant notification channel test
- [ ] Publicar eventos correspondientes → WebSocket

#### 2.4 api-gateway webhook-dashboard

- [ ] Implementar persistencia básica para webhooks (MongoDB collection)
- [ ] Descomentar guard de auth en `webhook-dashboard.controller.ts`

---

### Fase 3: App Configuration Module (Prioridad Alta)

**El GENERAL_ADMIN es quien configura la aplicación.**

#### 3.1 Crear módulo AppConfiguration en auth-service

```typescript
AppConfiguration {
  // Registration
  registrationEnabled: boolean        // Habilitar/deshabilitar registro manual
  corporateAuthEnabled: boolean       // Habilitar/deshabilitar SSO Google
  allowedDomains: string[]            // Dominios permitidos para SSO (Ej: ["ufps.edu.co"])
  autoRegisterOnSSO: boolean          // Auto-registrar al autenticarse por SSO
  // Theme
  themeMode: 'light' | 'dark' | 'system'
  primaryColor: string
  secondaryColor: string
  // i18n
  defaultLocale: string               // Ej: "es"
  supportedLocales: string[]          // Ej: ["es", "en"]
  // General
  appName: string                     // Ej: "Bookly UFPS"
  appLogoUrl: string
  maintenanceMode: boolean
  // Metadata
  updatedBy: string
  updatedAt: Date
}
```

**Archivos a crear:**

- [ ] `apps/auth-service/src/infrastructure/schemas/app-configuration.schema.ts`
- [ ] `apps/auth-service/src/infrastructure/repositories/app-configuration.repository.ts`
- [ ] `apps/auth-service/src/application/services/app-configuration.service.ts`
- [ ] `apps/auth-service/src/application/commands/update-app-configuration.command.ts`
- [ ] `apps/auth-service/src/application/handlers/update-app-configuration.handler.ts`
- [ ] `apps/auth-service/src/application/queries/get-app-configuration.query.ts`
- [ ] `apps/auth-service/src/application/handlers/get-app-configuration.handler.ts`
- [ ] `apps/auth-service/src/infrastructure/controllers/app-configuration.controller.ts`

**Endpoints:**

```
GET  /app-config          — Obtener configuración completa (GENERAL_ADMIN)
PUT  /app-config          — Actualizar configuración (GENERAL_ADMIN)
GET  /app-config/public   — Config pública sin auth (theme, locale, registration status, SSO status)
```

- [ ] Registrar en `auth.module.ts`
- [ ] Seed de configuración por defecto
- [ ] Publicar evento `APP_CONFIG_UPDATED` → WebSocket notifica a todos los clientes

#### 3.2 Integrar configuración en flujos existentes

- [ ] **`auth.controller.ts` → `register()`**: Validar `registrationEnabled` antes de permitir registro
- [ ] **`google.strategy.ts` → `validate()`**: Validar `corporateAuthEnabled` y `autoRegisterOnSSO`
- [ ] Si `autoRegisterOnSSO = false` y el usuario no existe → error amigable
- [ ] `allowedDomains` desde AppConfiguration (fallback a env vars)

---

### Fase 4: API Gateway — Notificaciones y OpenAPI (Prioridad Alta)

#### 4.1 Asegurar notificaciones WebSocket en escrituras

El patrón actual es correcto (EventBus fire-and-forget + WebSocket). Mejorar:

- [ ] Verificar que cada microservicio publica evento tras escribir exitosamente
- [ ] Verificar que `BooklyWebSocketGateway.initializeEventListeners()` escucha y reenvia eventos relevantes
- [ ] Agregar tipos de eventos WebSocket para CRUD: `resource.created`, `reservation.updated`, `approval.approved`, etc.
- [ ] Asegurar que `emitToUser()` y `emitToChannel()` se usan correctamente
- [ ] Extraer `userId` del JWT en el handshake del WebSocket (actualmente TODO en línea 374)

#### 4.2 OpenAPI agregado en Gateway

- [ ] Configurar el Swagger del gateway con múltiples documentos (uno por microservicio)
- [ ] Cada microservicio expone su OpenAPI JSON en `/api/docs-json`
- [ ] Gateway agrega las specs usando `SwaggerModule.setup()` con múltiples paths:
  - `/api/docs` — Gateway overview
  - `/api/docs/auth` — Auth service
  - `/api/docs/resources` — Resources service
  - `/api/docs/availability` — Availability service
  - `/api/docs/stockpile` — Stockpile service
  - `/api/docs/reports` — Reports service
- [ ] Agregar tags claros por servicio

---

### Fase 5: OpenAPI y AsyncAPI — Completar Documentación (Prioridad Media)

#### 5.1 OpenAPI — Tags faltantes en `main.ts`

- [ ] **auth-service**: Agregar tags `OAuth / SSO`, `App Configuration`, `Reference Data`
- [ ] **resources-service**: Agregar tags `Faculties`, `Departments`, `Programs`
- [ ] **availability-service**: Agregar tags Calendar View, History, Maintenance Blocks, Reassignment, Availability Exceptions, Metrics
- [ ] **stockpile-service**: Agregar tags Documents, Check-In/Out, Monitoring, Location Analytics, Notifications, Proximity
- [ ] **reports-service**: Agregar tags Feedback, Evaluations, Exports, Audit Records

#### 5.2 OpenAPI — Completar decoradores

- [ ] Revisar que TODOS los endpoints tengan `@ApiOperation` con `summary` y `description` claros
- [ ] Revisar que TODOS los endpoints tengan `@ApiResponse` para status codes relevantes (200, 201, 400, 401, 403, 404, 409, 500)
- [ ] Asegurar que los DTOs tengan `@ApiProperty` con `description`, `example` y `type`

#### 5.3 AsyncAPI — Crear specs por servicio

Actualmente solo existe 1 archivo AsyncAPI (stockpile geolocation):

- [ ] `apps/auth-service/docs/auth-events.asyncapi.yaml` — user.registered, user.logged_in, password.changed, role.assigned, app_config.updated, etc.
- [ ] `apps/resources-service/docs/resource-events.asyncapi.yaml` — resource.created/updated/deleted, category.created, faculty.created, department.created, maintenance.scheduled, etc.
- [ ] `apps/availability-service/docs/availability-events.asyncapi.yaml` — reservation.created/cancelled, waiting_list.added, recurring.series.created, etc.
- [ ] `apps/stockpile-service/docs/stockpile-events.asyncapi.yaml` — approval_request.created/approved, check-in, check-out, notification.sent, etc.
- [ ] `apps/reports-service/docs/reports-events.asyncapi.yaml` — audit.log.created, report.generated, feedback.submitted, dashboard.updated
- [ ] `docs/api/ASYNCAPI_INDEX.md` — Índice de todos los AsyncAPI specs

Referencia: `libs/common/src/enums/index.ts` → `EventType` enum (60+ eventos definidos)

#### 5.4 Acceso sin dificultades

- [ ] Verificar que cada servicio sirve su Swagger en `/api/docs`
- [ ] Verificar acceso directo a cada servicio: `http://localhost:300X/api/docs`
- [ ] Verificar acceso agregado desde gateway: `http://localhost:3000/api/docs`
- [ ] Asegurar CORS habilitado para desarrollo

---

### Fase 6: Pruebas de Flujos Completos (Prioridad Alta)

**Objetivo**: Probar todos los flujos de la aplicación end-to-end desde el backend.

#### 6.1 Flujo de Auth

- [ ] Register usuario → verificar en BD → Login → obtener tokens
- [ ] Google OAuth → auto-register si no existe → obtener tokens
- [ ] Login con 2FA → setup → enable → login/2fa
- [ ] Refresh token → verificar token rotation
- [ ] Forgot/Reset password
- [ ] Logout → verificar token blacklisted
- [ ] Admin deshabilita registro → verificar que register falla
- [ ] Admin deshabilita SSO → verificar que Google OAuth falla

#### 6.2 Flujo de Configuración (GENERAL_ADMIN)

- [ ] Login como admin → GET /app-config → PUT /app-config (cambiar theme, toggle registro, toggle SSO)
- [ ] Verificar que `/app-config/public` refleja cambios sin auth
- [ ] Verificar que evento `APP_CONFIG_UPDATED` llega por WebSocket

#### 6.3 Flujo de Datos de Referencia (GENERAL_ADMIN)

- [ ] CRUD de roles (crear, listar, actualizar, desactivar)
- [ ] CRUD de permisos
- [ ] CRUD de reference data (crear nuevo resource_type, listar por grupo, etc.)
- [ ] CRUD de faculties (crear, asignar owner, listar)
- [ ] CRUD de departments (crear, asignar a faculty, asignar owner)
- [ ] CRUD de programs (crear, asignar a department, asignar owner)

#### 6.4 Flujo de Recursos

- [ ] Crear recurso con `type` consultado de reference_data
- [ ] Asociar recurso a categoría y programa
- [ ] Buscar recursos con filtros avanzados
- [ ] Importar recursos desde CSV
- [ ] Programar mantenimiento → cambiar status del recurso
- [ ] Editar recurso sin afectar reservas activas
- [ ] Desactivar recurso

#### 6.5 Flujo de Reservas

- [ ] Configurar disponibilidad de un recurso
- [ ] Consultar disponibilidad
- [ ] Crear reserva → verificar conflictos
- [ ] Crear reserva recurrente
- [ ] Cancelar reserva → notificar vía WebSocket
- [ ] Modificar reserva
- [ ] Lista de espera: agregar, notificar cuando hay slot
- [ ] Reasignar reserva a otro recurso
- [ ] Exportar calendario (iCal)

#### 6.6 Flujo de Aprobaciones

- [ ] Crear flujo de aprobación diferenciado
- [ ] Enviar solicitud de reserva que requiere aprobación
- [ ] Aprobar solicitud → generar documento PDF
- [ ] Rechazar solicitud → notificar usuario
- [ ] Check-in digital (QR/manual)
- [ ] Check-out digital
- [ ] Verificar pantalla de monitoreo (dashboard vigilancia)

#### 6.7 Flujo de Reportes

- [ ] Generar reporte de uso por recurso/programa/período
- [ ] Generar reporte por usuario
- [ ] Exportar en CSV
- [ ] Crear feedback de usuario
- [ ] Crear evaluación de usuario por staff
- [ ] Ver dashboard en tiempo real
- [ ] Reporte de demanda insatisfecha

#### 6.8 Flujo vía API Gateway

- [ ] Repetir flujos anteriores via `http://localhost:3000/api/v1/:service/...`
- [ ] Verificar que GET retorna datos directamente
- [ ] Verificar que POST/PUT/DELETE retorna `"Command accepted"` + `eventId`
- [ ] Verificar que WebSocket recibe notificación cuando el command se procesa
- [ ] Verificar rate limiting y circuit breaker

---

## Orden de Ejecución Recomendado

```text
Fase 1.1 → ReferenceData collection + CRUD + seed
Fase 1.2 → Faculty entity + CRUD
Fase 1.3 → Department entity + CRUD
Fase 1.4 → Program entity ajustes (ownerId, refs)
Fase 1.5 → Refactorizar schemas (quitar enums hardcoded)
Fase 1.6 → Refactorizar guards/validaciones
Fase 1.7 → Actualizar seeds
Fase 2   → CRUD stubs (auth, availability, stockpile)
Fase 3.1 → AppConfiguration module
Fase 3.2 → Integrar config en register + SSO
Fase 4.1 → WebSocket notificaciones en escrituras
Fase 4.2 → Gateway OpenAPI agregado
Fase 5.1 → OpenAPI tags faltantes
Fase 5.2 → OpenAPI decoradores completos
Fase 5.3 → AsyncAPI specs
Fase 6   → Pruebas de flujos completos
```

---

## Estimación

| Fase                      | Esfuerzo | Archivos                                |
| ------------------------- | -------- | --------------------------------------- |
| Fase 1 (Datos dinámicos)  | Alto     | ~25 archivos nuevos + ~20 modificados   |
| Fase 2 (CRUD stubs)       | Medio    | ~15 archivos nuevos + 8 modificados     |
| Fase 3 (AppConfig)        | Medio    | ~10 archivos nuevos + 4 modificados     |
| Fase 4 (Gateway)          | Medio    | ~5 archivos modificados                 |
| Fase 5 (OpenAPI/AsyncAPI) | Medio    | ~6 nuevos + ~15 modificados             |
| Fase 6 (Pruebas)          | Alto     | Scripts de prueba / Postman collections |

**Total estimado**: ~60 archivos nuevos + ~50 modificados

---

**Última actualización**: Febrero 16, 2026
**Mantenido por**: Equipo Bookly
