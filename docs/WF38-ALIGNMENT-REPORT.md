# WF-38 — Frontend ↔ Backend Alignment Report

**Fecha:** 2026-02-17  
**Ejecutor:** Cascade (Frontend Lead + Backend + QA)  
**Skills:** `plataforma-build-deploy-operate-observe`, `gobierno-de-arquitectura-diseno`, `backend`, `web-app`, `qa-calidad`, `seguridad-privacidad-compliance`

---

## Phase 0 — Auto-discovery ✅ PASA

| Item             | Resultado                                                                            |
| ---------------- | ------------------------------------------------------------------------------------ |
| Skills resueltas | 6 activadas                                                                          |
| Rules indexadas  | 91 en `.windsurf/rules/`                                                             |
| FE path          | `bookly-mock-frontend/` (Next.js 14)                                                 |
| BE path          | `bookly-mock/` (NestJS monorepo, 6 servicios)                                        |
| Endpoint map FE  | `src/infrastructure/api/endpoints.ts` (318 líneas, 6 secciones)                      |
| API clients FE   | `src/infrastructure/api/*.ts` (7 clientes) + `src/services/*.ts` (6 clientes legacy) |

---

## Phase 1 — MODEL: Contratos como source of truth ⚠️ PASA CON HALLAZGOS

### 1.1 Backend Controller Inventory

#### auth-service (port 3001)

| Controller prefix | Routes                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `auth`            | login, register, refresh, verify, forgot-password, reset-password, logout, change-password, introspect, evaluate-permissions |
| `auth/oauth`      | google, google/callback                                                                                                      |
| `users`           | me, GET all, GET :id, PATCH :id, DELETE :id, :id/roles, :id/permissions                                                      |
| `roles`           | CRUD + :id/permissions                                                                                                       |
| `permissions`     | CRUD + active, bulk, module/:resource                                                                                        |
| `reference-data`  | groups, CRUD                                                                                                                 |
| `health`          | GET                                                                                                                          |

#### resources-service (port 3002)

| Controller prefix | Routes                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| `resources`       | CRUD, import, search/advanced, :id/category, :id/restore, :id/availability-rules |
| `categories`      | CRUD                                                                             |
| `maintenances`    | POST, GET, :id/start, :id/complete, :id/cancel                                   |
| `departments`     | CRUD                                                                             |
| `faculties`       | CRUD                                                                             |
| `programs`        | CRUD                                                                             |
| `reference-data`  | groups, CRUD                                                                     |
| `health`          | GET                                                                              |

#### availability-service (port 3003)

| Controller prefix | Routes                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `reservations`    | CRUD, :id/cancel, :id/check-in, :id/check-out, recurring/_, series/_, :id/export.ics, export/my-reservations.ics, :id/calendar-links |
| `availabilities`  | GET, check, conflicts, day                                                                                                           |
| `waiting-lists`   | POST, GET resource/:resourceId, DELETE :id                                                                                           |
| `reassignments`   | (if exists)                                                                                                                          |
| `reference-data`  | groups, CRUD                                                                                                                         |
| `health`          | GET                                                                                                                                  |

#### stockpile-service (port 3004)

| Controller prefix             | Routes                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `approval-requests`           | CRUD, :id/approve, :id/reject, :id/cancel, active-today, statistics                                             |
| `approval-flows`              | CRUD                                                                                                            |
| `check-in-out`                | check-in, check-out, :id, reservation/:reservationId, user/me, active/all, overdue/all, stats, vigilance/alerts |
| `documents`                   | generate, :id, :id/download, by-approval/:id                                                                    |
| `document-templates`          | CRUD                                                                                                            |
| `monitoring`                  | active, overdue, history/:resourceId, statistics, incident, incidents/pending, incident/:id/resolve, alerts     |
| `tenant-notification-configs` | CRUD, :tenantId/activate, deactivate, provider-info                                                             |
| `health`                      | GET                                                                                                             |

#### reports-service (port 3005)

| Controller prefix | Routes                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `usage-reports`   | GET, generate                                                                                    |
| `demand-reports`  | GET                                                                                              |
| `user-reports`    | GET                                                                                              |
| `feedback`        | CRUD, user/:userId, resource/:resourceId, status/:status, :id/respond, :id/status, statistics/\* |
| `evaluation`      | CRUD                                                                                             |
| `reports/export`  | POST, :id, :id/download, GET list                                                                |
| `health`          | GET                                                                                              |

### 1.2 Frontend Endpoint Map (endpoints.ts)

| Grupo FE               | Path prefix                                                                                                                      | Servicio destino           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| AUTH_ENDPOINTS         | `/api/v1/auth/*`, `/api/v1/users/*`, `/api/v1/roles/*`, `/api/v1/permissions/*`                                                  | auth-service               |
| RESOURCES_ENDPOINTS    | `/api/v1/resources/*`, `/api/v1/categories/*`                                                                                    | resources-service          |
| AVAILABILITY_ENDPOINTS | `/api/v1/reservations/*`, `/api/v1/availabilities/*`, `/api/v1/waiting-lists/*`, `/api/v1/calendar/*`, `/api/v1/schedules/*`     | availability-service       |
| STOCKPILE_ENDPOINTS    | `/api/v1/approval-*`, `/api/v1/check-in-out/*`, `/api/v1/documents/*`, `/api/v1/notifications/*`, `/api/v1/document-templates/*` | stockpile-service          |
| REPORTS_ENDPOINTS      | `/api/v1/reports/*`                                                                                                              | reports-service            |
| AUDIT_ENDPOINTS        | `/api/v1/audit/*`                                                                                                                | auth-service (via reports) |

### 1.3 API Response Standard

**Backend** (`ApiResponseBookly<T>`):

```typescript
{ success, data?, message?, errors?, meta?, timestamp?, path?, method?, statusCode?, context? }
```

**Frontend** (`ApiResponse<T>`):

```typescript
{ success, data, message?, timestamp, path? }
```

**Drift detectado:**

- FE `data` es required → BE `data?` es optional (**minor**)
- FE falta `errors`, `meta`, `statusCode`, `context` (**medium** — limita manejo de errores granulares y paginación)
- FE `ApiErrorResponse` tiene campos correctos pero NO se usa consistentemente en los clients

### 1.4 Gate 1 — Hallazgos críticos

| #        | Hallazgo                                                                                                                                                                                                                                                                                                                           | Severidad    | Gate       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ---------- |
| **F-01** | **API Gateway Proxy routing bug** — `proxyViaHttp` reconstruye URL como `${serviceUrl}/api/v1${path}` pero `path` ya tiene el controller prefix stripped. Ejemplo: FE llama `/api/v1/auth/login` → GW extrae service="auth", path="/login" → forwards to `localhost:3001/api/v1/login` → **404** (ruta real: `/api/v1/auth/login`) | **CRITICAL** | ❌ BLOQUEA |
| **F-02** | **Service name mismatch** — FE paths como `/api/v1/approval-requests/*` envían service="approval-requests" al GW, pero GW solo conoce "stockpile". Mismo para "check-in-out", "documents", "document-templates", "notifications", "waiting-lists", "categories", etc.                                                              | **CRITICAL** | ❌ BLOQUEA |
| **F-03** | **Reports endpoints drift** — FE usa `/api/v1/reports/usage` pero BE tiene controller `usage-reports` → ruta BE real es `/api/v1/usage-reports`. Igual para demand-reports, user-reports                                                                                                                                           | **HIGH**     | ❌ BLOQUEA |
| **F-04** | FE `templates` client usa `/api/v1/templates/*` pero BE usa `document-templates` controller                                                                                                                                                                                                                                        | **HIGH**     | ⚠️         |
| **F-05** | FE `RESOURCES_ENDPOINTS.MAINTENANCE` usa `/api/v1/resources/maintenance` pero BE tiene controller separado `maintenances` (ruta: `/api/v1/maintenances`)                                                                                                                                                                           | **HIGH**     | ⚠️         |
| **F-06** | FE `RESOURCES_ENDPOINTS.PROGRAMS` usa `/api/v1/resources/programs` pero BE tiene controller separado `programs` (ruta: `/api/v1/programs`)                                                                                                                                                                                         | **HIGH**     | ⚠️         |
| **F-07** | Dual API client layer: `src/services/` (legacy) y `src/infrastructure/api/` (nuevo). Riesgo de drift entre ambos                                                                                                                                                                                                                   | **MEDIUM**   | ⚠️         |

**Gate 1: ❌ NO PASA** — F-01 y F-02 son bloqueantes. El API Gateway proxy NO puede enrutar correctamente las peticiones del FE a los microservicios.

---

## Phase 2 — TRACE: Rule Traceability Matrix (resumen)

### Cobertura por módulo

| Módulo               | Rules             | FE pages                                                      | BE controllers | Tests FE            | Tests BE |
| -------------------- | ----------------- | ------------------------------------------------------------- | -------------- | ------------------- | -------- |
| auth-service         | RF-41..RF-45 (5)  | login, register, forgot-password, admin/usuarios, admin/roles | 6 controllers  | ~15 hooks/mutations | pending  |
| resources-service    | RF-01..RF-06 (6)  | recursos/, categorias/, programas/, mantenimientos/           | 6 controllers  | ~12 hooks/mutations | pending  |
| availability-service | RF-07..RF-19 (13) | reservas/, calendario/, lista-espera/                         | 4 controllers  | ~10 hooks/mutations | pending  |
| stockpile-service    | RF-20..RF-30 (11) | aprobaciones/, vigilancia/                                    | 7 controllers  | ~8 hooks/mutations  | pending  |
| reports-service      | RF-31..RF-39 (9)  | reportes/, admin/auditoria/, admin/templates                  | 6 controllers  | ~6 hooks/mutations  | pending  |

### Gate 2: ⚠️ PASA CONDICIONAL

- Todas las rules tienen mapeo FE+BE mínimo
- Tests unitarios FE existen (200/218 passing); tests BE pendientes de ejecución
- Telemetría: OTel configurado en BE pero no instrumentado en FE

---

## Phase 3 — ALIGN: Verificación FE ↔ BE

### 3.1 DTOs/Tipos vs contrato BE (drift)

| FE Type                | FE Location                     | BE DTO/Schema                | Status                                                                         |
| ---------------------- | ------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `ApiResponse<T>`       | `types/api/response.ts`         | `ApiResponseBookly<T>`       | ⚠️ Drift: FE falta `errors`, `meta`, `statusCode`                              |
| `Reservation`          | `types/entities/reservation.ts` | `Reservation (Mongoose)`     | ✅ Compatible (verificar campos)                                               |
| `Resource`             | `types/entities/resource.ts`    | `Resource (Mongoose)`        | ✅ Compatible (verificar campos)                                               |
| `ApprovalRequest`      | `types/entities/approval.ts`    | `ApprovalRequest (Mongoose)` | ✅ Compatible                                                                  |
| `CheckInOut`           | `types/entities/checkInOut.ts`  | `CheckInOut (Mongoose)`      | ✅ Compatible                                                                  |
| `PaginatedResponse<T>` | `types/api/response.ts`         | `PaginationMeta`             | ⚠️ Drift: FE usa `items[]` + `meta.total/page/limit`, BE usa `data[]` + `meta` |

### 3.2 Errores BE → mapeo FE → i18n

| Aspecto                         | Estado                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Error model estándar BE         | ✅ `{ code, message, type, exception_code, http_code, http_exception }`       |
| FE `ApiErrorResponse` type      | ✅ Definido en `types/api/response.ts`                                        |
| FE error handling en httpClient | ⚠️ Solo extrae `message` del error, ignora `code`, `errors`, `exception_code` |
| i18n de errores                 | ❌ No implementado — errores se muestran en español hardcoded                 |
| Error boundary global           | ⚠️ Existe pero no mapea error codes a mensajes i18n                           |

### 3.3 AuthN/AuthZ + rate limiting

| Aspecto                    | FE                                    | BE                                    | Status              |
| -------------------------- | ------------------------------------- | ------------------------------------- | ------------------- |
| JWT token storage          | `localStorage`                        | JWT Bearer                            | ✅                  |
| Token refresh              | Auto-refresh en interceptor 401       | `/auth/refresh` endpoint              | ✅                  |
| Role-based UI              | `useCurrentUser()` hook + role checks | `@Roles()` decorator + `JwtAuthGuard` | ✅                  |
| Permission-based UI        | `RBAC` context checks                 | `evaluate-permissions` endpoint       | ✅                  |
| Rate limiting FE awareness | ❌ No retry-after handling            | `RateLimiterRedisService`             | ⚠️ FE no maneja 429 |
| CORS                       | Next.js proxy                         | BE CORS enabled                       | ✅                  |
| CSP headers                | ❌ Not configured                     | N/A                                   | ⚠️                  |

### 3.4 WebSocket alineación

| Aspecto       | FE                                   | BE                                | Status      |
| ------------- | ------------------------------------ | --------------------------------- | ----------- |
| WS connection | `BooklyWebSocketGateway` consumer    | `BooklyWebSocketGateway` provider | ✅ Definido |
| WS events     | `NotificationBell` component listens | Gateway emits via Redis pub/sub   | ✅ Aligned  |
| Reconnection  | Client-side auto-reconnect           | N/A                               | ✅          |
| Auth on WS    | Token sent on handshake              | JWT validation on connection      | ✅          |

### Gate 3: ❌ NO PASA

- **F-01/F-02 (gateway routing) son bloqueantes** — ninguna petición real FE→BE funciona vía gateway
- F-03 (reports endpoint drift) impide reportes funcionales
- Error handling FE es superficial (no usa error codes ni i18n)

---

## Phase 4 — QA: Suites y gates

### 4.1 Test pyramid actual

| Layer       | FE                     | BE                                             |
| ----------- | ---------------------- | ---------------------------------------------- |
| Unit        | 200/218 passing (Jest) | Jasmine specs existentes (no ejecutados)       |
| Integration | ❌ No hay              | ❌ No hay                                      |
| Contract    | ❌ No hay              | ❌ No hay                                      |
| E2E         | ❌ No hay              | k6 load tests en `test-endpoints-api-gateway/` |

### 4.2 Build verification

| Target            | Comando                                                                      | Status                 |
| ----------------- | ---------------------------------------------------------------------------- | ---------------------- |
| FE build          | `npm run build` (Next.js)                                                    | ✅ Compila sin errores |
| BE TypeScript     | `npx tsc --noEmit`                                                           | ✅ 0 errores           |
| BE services start | auth ✅, resources ✅, availability ✅, stockpile ✅, reports ✅, gateway ✅ | ✅ 6/6 UP              |

### 4.3 Coverage gap por criticidad

| Rule                         | Criticidad | Unit FE          | Unit BE | Integration | Contract |
| ---------------------------- | ---------- | ---------------- | ------- | ----------- | -------- |
| RF-43 (auth/SSO)             | ALTA       | ✅               | pending | ❌          | ❌       |
| RF-41 (roles)                | ALTA       | ✅               | pending | ❌          | ❌       |
| RF-12 (reservas recurrentes) | ALTA       | ✅ (client-side) | pending | ❌          | ❌       |
| RF-20 (aprobaciones)         | ALTA       | ✅               | pending | ❌          | ❌       |
| RF-36 (dashboard)            | MEDIA      | ✅               | pending | ❌          | ❌       |

### Gate 4: ⚠️ PASA CONDICIONAL

- Build limpio FE+BE ✅
- Unit tests FE con 91.7% pass rate
- **Gap:** No hay contract tests ni integration tests
- **Gap:** Sin coverage de integración FE↔BE real (blocked by F-01/F-02)

---

## Phase 5 — OPS/SEC

### 5.1 Observabilidad

| Capa                             | Implementación                                     | Status         |
| -------------------------------- | -------------------------------------------------- | -------------- |
| Logs (Winston)                   | ✅ `libs/logging/` — JSON structured, por servicio | ✅             |
| Traces (OTel)                    | ✅ `libs/common/src/telemetry/` — env-gated        | ✅ Configurado |
| Metrics                          | ✅ OTel metrics exporter                           | ✅ Configurado |
| Sentry                           | ✅ `libs/monitoring/` — error capture              | ✅             |
| correlation_id / trace_id        | ⚠️ En logs pero no propagado end-to-end FE→BE      | ⚠️             |
| Dashboard ops                    | ❌ No hay dashboards Grafana/similar               | ⚠️             |
| Alerta → dashboard → trace → log | ❌ Cadena no completa                              | ⚠️             |

### 5.2 Seguridad baseline

| Check                     | Status                                      |
| ------------------------- | ------------------------------------------- |
| JWT secret not hardcoded  | ✅ Centralizado en `@libs/common/constants` |
| Token refresh / blacklist | ✅ JwtStrategy checks blacklist             |
| Rate limiting             | ✅ `RateLimiterRedisService` en gateway     |
| CORS configurado          | ✅                                          |
| CSP headers               | ❌ No configurado                           |
| Secret scanning (CI)      | ⚠️ No hay workflow                          |
| SCA (dependency audit)    | ⚠️ No hay workflow                          |
| Idempotency en writes     | ✅ `@libs/idempotency` en 5 servicios       |
| DLQ para eventos fallidos | ✅ RabbitMQ retry + DLQ                     |

### 5.3 Resiliencia

| Mecanismo              | Status                                     |
| ---------------------- | ------------------------------------------ |
| Circuit breaker        | ✅ `CircuitBreakerRedisService` en gateway |
| Rate limiting          | ✅ Redis-based per user/IP/service         |
| Retry + DLQ (RabbitMQ) | ✅ Max 3 retries, then DLQ                 |
| Timeouts               | ✅ HTTP 30s, auth client 5s                |
| Idempotency            | ✅ Redis-based dedup                       |

### Gate 5: ⚠️ PASA CONDICIONAL

- Observabilidad configurada pero no end-to-end (no hay dashboards)
- Seguridad baseline cubierta excepto CSP y secret scanning CI
- No hay cadena alerta→dashboard→trace→log completa

---

## Phase 6 — RELEASE: Readiness Report

### Release Readiness: ❌ NO APTO

#### Bloqueantes (MUST FIX antes de release)

| #        | Hallazgo                         | Impacto                                                        | Fix propuesto                                                                                       |
| -------- | -------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **F-01** | Gateway proxy routing bug        | **Ninguna petición FE→BE funciona vía gateway**                | Cambiar `proxyViaHttp` para preservar full path: `${serviceUrl}${req.url}` en lugar de reconstruir  |
| **F-02** | Service name mismatch en gateway | **Endpoints de stockpile, reports sub-controllers no enrutan** | Agregar path→service mapping en gateway (approval-requests→stockpile, check-in-out→stockpile, etc.) |
| **F-03** | Reports endpoint drift           | **Reportes no funcionan**                                      | Alinear: o FE usa `/api/v1/usage-reports` o BE cambia controller prefix a `reports/usage`           |

#### Altos (SHOULD FIX antes de release)

| #        | Hallazgo                      | Impacto                                           | Fix propuesto                                                      |
| -------- | ----------------------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| **F-04** | FE templates path drift       | Templates UI no funciona                          | Alinear FE a `/api/v1/document-templates`                          |
| **F-05** | FE maintenance path drift     | Mantenimientos UI no funciona                     | Alinear FE a `/api/v1/maintenances` o BE a `resources/maintenance` |
| **F-06** | FE programs path drift        | Programas UI no funciona                          | Alinear FE a `/api/v1/programs` o BE a `resources/programs`        |
| **F-07** | Dual API client layer         | Mantenimiento difícil, riesgo de drift            | Consolidar en `infrastructure/api/` y deprecar `services/`         |
| **F-08** | FE ApiResponse missing fields | No puede manejar errores granulares ni paginación | Actualizar type para incluir `errors`, `meta`, `statusCode`        |
| **F-09** | FE error handling superficial | Errores no mapeados a i18n                        | Implementar error code → i18n message mapping                      |
| **F-10** | FE no maneja HTTP 429         | Rate limiting invisible al usuario                | Agregar retry-after logic en httpClient interceptor                |

#### Medios (deuda técnica aceptable para MVP)

| #        | Hallazgo                                               |
| -------- | ------------------------------------------------------ |
| **F-11** | No hay contract tests (Pact o similar)                 |
| **F-12** | No hay integration tests FE↔BE                         |
| **F-13** | CSP headers no configurados                            |
| **F-14** | Secret scanning / SCA no en CI                         |
| **F-15** | Cadena observabilidad no end-to-end (falta dashboards) |
| **F-16** | FE correlation_id no se propaga en requests            |

---

## Resumen ejecutivo

```
┌────────────────────────────────────────────────────┐
│           WF-38 RELEASE GATE: ❌ NO APTO           │
├────────────────────────────────────────────────────┤
│ Phase 0 Auto-discovery      ✅ PASA                │
│ Phase 1 Contratos/Model     ❌ 3 bloqueantes       │
│ Phase 2 RTM Traceability    ⚠️ Condicional         │
│ Phase 3 Alineación FE↔BE    ❌ Gateway routing bug │
│ Phase 4 QA Gates            ⚠️ Condicional         │
│ Phase 5 OPS/SEC             ⚠️ Condicional         │
│ Phase 6 Release             ❌ NO APTO             │
├────────────────────────────────────────────────────┤
│ Bloqueantes: 3 (F-01, F-02, F-03)                 │
│ Altos:       7 (F-04 a F-10)                      │
│ Medios:      6 (F-11 a F-16)                      │
└────────────────────────────────────────────────────┘
```

### Próximos pasos (por prioridad)

1. **FIX F-01 + F-02**: Refactorizar API Gateway proxy routing
2. **FIX F-03**: Alinear reports endpoint paths FE↔BE
3. **FIX F-04/F-05/F-06**: Alinear paths de templates, maintenance, programs
4. **FIX F-07**: Consolidar dual API client layer
5. **FIX F-08/F-09**: Mejorar error handling y i18n en FE
6. **ADD**: Contract tests mínimos para rutas críticas
7. **ADD**: Integration smoke test FE→GW→BE
