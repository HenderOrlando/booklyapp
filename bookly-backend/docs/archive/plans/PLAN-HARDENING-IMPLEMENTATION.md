# Bookly Mock — Hardening Implementation Plan

## FASE 0: Inventory + Profiles

### 0.1 Repo Inventory

#### Services (6 apps)

| Service                  | Port | DB                  | CQRS                                | EventBus                   | Redis | JWT Strategy | Auth Guards                                          |
| ------------------------ | ---- | ------------------- | ----------------------------------- | -------------------------- | ----- | ------------ | ---------------------------------------------------- |
| **api-gateway**          | 3000 | bookly-gateway      | ✅ (CqrsModule via AuditDecorators) | ✅ forRootAsync (RabbitMQ) | ✅    | ✅ (local)   | JwtAuthGuard+RolesGuard (admin endpoints)            |
| **auth-service**         | 3001 | bookly-auth         | ✅ CqrsModule                       | ✅ forRootAsync (RabbitMQ) | ✅    | ✅ (local)   | JwtAuthGuard+RolesGuard+PermissionsGuard+ActionGuard |
| **resources-service**    | 3002 | bookly-resources    | ✅ CqrsModule                       | ✅ forRootAsync (RabbitMQ) | ✅    | ✅ (local)   | JwtAuthGuard+RolesGuard                              |
| **availability-service** | 3003 | bookly-availability | ✅ CqrsModule                       | ✅ forRootAsync (RabbitMQ) | ✅    | ✅ (local)   | JwtAuthGuard+RolesGuard                              |
| **stockpile-service**    | 3004 | bookly-stockpile    | ✅ CqrsModule                       | ✅ forRootAsync (RabbitMQ) | ✅    | ✅ (local)   | JwtAuthGuard+RolesGuard                              |
| **reports-service**      | 3005 | bookly-reports      | ✅ CqrsModule                       | ✅ forRootAsync (RabbitMQ) | ❌    | ✅ (local)   | JwtAuthGuard                                         |

#### Shared Libraries (12 libs)

| Library               | Path               | Purpose                                                                              | Used By                                           |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `@libs/common`        | libs/common        | Interfaces, ResponseUtil, EventPayload, JwtPayload, constants, enums, decorators     | ALL                                               |
| `@libs/event-bus`     | libs/event-bus     | EventBusService (RabbitMQ/Kafka), EventStoreService, DLQService, RequestReplyService | ALL services                                      |
| `@libs/redis`         | libs/redis         | RedisModule + RedisService (caching)                                                 | gateway, auth, resources, availability, stockpile |
| `@libs/database`      | libs/database      | DatabaseModule (Mongoose connection), ReferenceDataModule                            | ALL services                                      |
| `@libs/guards`        | libs/guards        | JwtAuthGuard, RolesGuard, PermissionsGuard, WsJwtGuard                               | ALL services                                      |
| `@libs/decorators`    | libs/decorators    | @Roles, @Permissions, @CurrentUser, custom decorators                                | ALL services                                      |
| `@libs/filters`       | libs/filters       | Exception filters                                                                    | ALL services                                      |
| `@libs/interceptors`  | libs/interceptors  | Logging/transform interceptors                                                       | ALL services                                      |
| `@libs/notifications` | libs/notifications | NotificationsModule, channels (email/sms/whatsapp/push), webhooks                    | stockpile, reports, gateway                       |
| `@libs/storage`       | libs/storage       | StorageModule (Local/S3/GCS adapters)                                                | gateway                                           |
| `@libs/idempotency`   | libs/idempotency   | IdempotencyService, CorrelationService, decorators, middleware, event handler        | Available but **NOT imported** by any service yet |
| `@libs/kafka`         | libs/kafka         | Kafka-specific utilities                                                             | Available, not actively used (RabbitMQ is active) |

#### Event Transport

- **Active broker**: RabbitMQ (CloudAMQP: `amqps://...horse.lmq.cloudamqp.com/...`)
- **Exchange**: `bookly-events` (topic type, durable)
- **Topic prefix**: `bookly` → all topics become `bookly.<domain>.<event>`
- **Event Store**: Schema exists (`event_store` collection), service exists, but **`ENABLE_EVENT_STORE=true` is NOT set in `.env`** → event store is **disabled** in all services
- **DLQ**: Schema + service exist in `@libs/event-bus`, DLQ collection registered via `forRootAsync`, but **no service actively routes failed events to DLQ** — the RabbitMQ adapter does `nack(msg, false, true)` (requeue) instead of sending to DLQ
- **Idempotency lib**: Full implementation exists (`@libs/idempotency`) but **NOT imported/used** by any service

#### Auth Architecture (Current State)

- **JWT**: Each service validates JWT locally with its own `JwtStrategy` using shared `JWT_SECRET`
- **Roles/permissions**: Embedded in JWT payload (`roles[]`, `permissions[]`), validated by local guards
- **No inter-service auth calls**: Services do NOT call auth-service to resolve/validate users (except stockpile's `AuthServiceClient` which fetches user data via events for enrichment)
- **RBAC source**: auth-service owns User/Role/Permission schemas; other services trust JWT claims
- **Gap**: If a role/permission is revoked, existing JWTs remain valid until expiration — no revocation mechanism

#### JWT Secret Management (Current State)

| Service              | JWT Secret Source                                                               |
| -------------------- | ------------------------------------------------------------------------------- |
| auth-service         | `JWT_SECRET` from constants (`@libs/common/constants`)                          |
| resources-service    | `configService.get('JWT_SECRET') \|\| 'bookly-secret-key-change-in-production'` |
| availability-service | `process.env.JWT_SECRET \|\| 'bookly-secret-key'`                               |
| stockpile-service    | `process.env.JWT_SECRET \|\| 'bookly-secret-key-change-in-production'`          |
| reports-service      | `process.env.JWT_SECRET \|\| 'bookly-secret-key'`                               |
| api-gateway          | `process.env.JWT_SECRET \|\| 'bookly-secret-key-change-in-production'`          |

**Gap**: Fallback values are inconsistent. If `JWT_SECRET` env var is not set, services use different fallbacks → tokens signed by auth-service won't validate elsewhere.

#### Conventions

- **CQRS**: Commands/Queries + Handlers in `application/handlers/`; aggregated via `AllHandlers` array
- **Hexagonal**: `domain/` (entities/ports), `application/` (services/handlers), `infrastructure/` (controllers/repos/schemas/strategies)
- **Responses**: `ResponseUtil.success()` / `ResponseUtil.error()` from `@libs/common`
- **Logging**: `createLogger('ServiceName')` from `@libs/common` (Winston-based)
- **Events**: `EventPayload<T>` interface with `eventId`, `eventType`, `timestamp`, `service`, `data`, `metadata`
- **Topic naming**: `bookly.<aggregate>.<action>` (e.g., `bookly.resource.created`)

---

### 0.2 Profiles

#### Backend Profile (SK-BE-API-001)

| Attribute     | Value                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| API style     | REST (per service)                                                            |
| Versioning    | URL prefix (`/api/v1`) per service; gateway proxies                           |
| Stack         | NestJS 10.x + Mongoose (MongoDB) + TypeScript                                 |
| Architecture  | DDD + Hexagonal (Ports & Adapters)                                            |
| CQRS          | ON — all services use `CqrsModule` with Command/Query handlers                |
| Eventing      | Async events via RabbitMQ (topic exchange)                                    |
| Auth          | JWT (local validation per service, signed by auth-service)                    |
| Multi-tenant  | **Not implemented** — single-tenant (UFPS university)                         |
| Data          | MongoDB Atlas (per-service DB) + Redis (caching)                              |
| Jobs/Queue    | RabbitMQ consumers (event-driven) + `@nestjs/schedule` (cron in availability) |
| Observability | Winston (structured JSON logs) — **no OTel tracing yet**                      |
| Risk Tier     | R1 (institutional, non-financial)                                             |

#### Security & Compliance Profile (SK-SEC-COMP-001)

| Attribute           | Value                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------- |
| AuthN               | JWT (access + refresh tokens) via auth-service                                                |
| AuthZ               | RBAC (roles from DB, embedded in JWT)                                                         |
| MFA                 | Optional 2FA (TOTP) in auth-service                                                           |
| Session management  | Stateless JWT + refresh rotation                                                              |
| Secret management   | `.env` file, `JWT_SECRET` constant in `@libs/common`                                          |
| API security        | Rate limiting (Redis-based in gateway), CORS configured                                       |
| OWASP baseline      | Partial — input validation (ValidationPipe), but no SAST/DAST/SBOM pipeline                   |
| Audit               | AuditLog schema in auth-service + AuditEvent in reports-service + `@reports/audit-decorators` |
| **HARD assumption** | No compliance certifications needed (educational context)                                     |

#### Platform Ops Profile (SK-PLAT-OPS-001)

| Attribute         | Value                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------- |
| Container runtime | Docker/Podman (compose files present)                                                  |
| Orchestration     | docker-compose (local), K8s (planned but not in bookly-mock)                           |
| CI/CD             | GitHub Actions (workflows exist in `../.github/workflows/`)                            |
| Monitoring        | **Winston logs only** — no Prometheus/Grafana/OTel yet                                 |
| Tracing           | **Not implemented** — `@libs/idempotency` has correlation IDs but unused               |
| DLQ               | Schema + service exist but **not wired** — failed events are requeued, not sent to DLQ |
| Health checks     | `/health` endpoint per service                                                         |
| Runbooks          | **None**                                                                               |

#### Scalability & Resilience Profile (SK-SCALE-RES-001)

| Attribute       | Value                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Idempotency     | `@libs/idempotency` lib exists (IdempotencyService, decorators, event handler) but **NOT used** |
| Retries         | RabbitMQ adapter does `nack(msg, false, true)` — infinite requeue, no backoff                   |
| Circuit breaker | Redis-based in api-gateway (`CircuitBreakerRedisService`) for proxy calls                       |
| Rate limiting   | Redis-based in api-gateway per user + per service                                               |
| Timeouts        | HTTP proxy timeout 30s in gateway                                                               |
| Backpressure    | RabbitMQ `prefetchCount: 1` per service                                                         |
| Event delivery  | At-least-once (no exactly-once guarantees, no inbox/dedupe)                                     |

#### Data Ops Profile (SK-DATA-OPS-001)

| Attribute        | Value                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Event Store      | Schema + service exist (`event_store` collection), MongoDB-backed, **disabled by default** (`ENABLE_EVENT_STORE` not set) |
| Event versioning | `version` field in EventStore schema, but **no event version enforcement** in publishing                                  |
| Lineage          | `correlationId`/`causationId` in `ResponseContext` interface, but **not propagated** in event publishing                  |
| Audit trail      | AuditLog in auth-service + AuditEvent consumer in reports-service                                                         |
| Data retention   | **No policies defined**                                                                                                   |

---

### 0.3 Implementation Plan

#### HARD Assumptions (with impact)

1. **ENABLE_EVENT_STORE must be `true`** — Currently disabled. Impact: Events not persisted. Will set in `.env` and verify all services handle it.
2. **JWT_SECRET consistency** — Fallback values differ across services. Impact: Token validation may fail. Will standardize to use `@libs/common/constants`.
3. **Multi-tenant NOT needed** — Single UFPS tenant. Impact: No `tenantId` scoping needed.
4. **No Kafka** — RabbitMQ is the active broker. Impact: Kafka-specific code is dead code.

---

## Workstream 1 — Centralized Security via auth-service

### 1.1 AuthZ/AuthN Internal Contract

**Goal**: Define and implement internal endpoints for token introspection and permission evaluation.

| Deliverable                                       | File/Path                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| `POST /api/v1/auth/introspect` endpoint           | `apps/auth-service/src/infrastructure/controllers/auth.controller.ts`     |
| `POST /api/v1/auth/evaluate-permissions` endpoint | `apps/auth-service/src/infrastructure/controllers/auth.controller.ts`     |
| IntrospectTokenCommand + handler                  | `apps/auth-service/src/application/commands/introspect-token.command.ts`  |
| EvaluatePermissionsQuery + handler                | `apps/auth-service/src/application/queries/evaluate-permissions.query.ts` |
| DTOs: IntrospectTokenDto, EvaluatePermissionsDto  | `apps/auth-service/src/application/dto/`                                  |
| Contract test                                     | `apps/auth-service/test/contract/auth-contract.spec.ts`                   |

### 1.2 Shared Auth Client SDK

**Goal**: Create `libs/security/` with an auth-client that caches resolutions.

| Deliverable                                                                     | File/Path                                         |
| ------------------------------------------------------------------------------- | ------------------------------------------------- |
| `AuthClientModule` (dynamic module)                                             | `libs/security/src/auth-client.module.ts`         |
| `AuthClientService` (HTTP calls + Redis cache)                                  | `libs/security/src/auth-client.service.ts`        |
| `AuthResolverGuard` (replaces per-service JwtAuthGuard for fine-grained checks) | `libs/security/src/guards/auth-resolver.guard.ts` |
| Barrel export                                                                   | `libs/security/src/index.ts`                      |
| tsconfig path `@libs/security`                                                  | `tsconfig.json`                                   |
| Integration in all 5 services + gateway                                         | Each service module                               |

### 1.3 Policy Enforcement Uniform

| Deliverable                                | File/Path                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| Standardize JWT_SECRET across all services | All `*.module.ts` files — use `JWT_SECRET` from `@libs/common/constants`     |
| Gateway: coarse authz (scopes)             | `apps/api-gateway/src/infrastructure/middleware/jwt-extractor.middleware.ts` |
| Services: domain authz via auth-client     | Each service's guards                                                        |

### 1.4 Advanced Security (MVP)

| Deliverable                          | File/Path                                                    |
| ------------------------------------ | ------------------------------------------------------------ |
| Token revocation list (Redis-backed) | `libs/security/src/services/token-revocation.service.ts`     |
| Refresh token rotation enforcement   | `apps/auth-service/src/application/services/auth.service.ts` |
| Secrets scan in CI (GitHub Action)   | `../.github/workflows/security-scan.yml`                     |

---

## Workstream 2 — Event Store in All Domains

### 2.1 Enable Event Store

| Deliverable                                                  | File/Path                                              |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| Set `ENABLE_EVENT_STORE=true` in `.env`                      | `.env`                                                 |
| Add `tenantId` field to EventStore schema                    | `libs/event-bus/src/event-store/event-store.schema.ts` |
| Add `idempotencyKey` field                                   | `libs/event-bus/src/event-store/event-store.schema.ts` |
| Add event version enforcement in `EventBusService.publish()` | `libs/event-bus/src/event-bus.service.ts`              |
| Verify all services persist events on startup                | Integration tests                                      |

### 2.2 Outbox Pattern (Lightweight)

| Deliverable                             | File/Path                                       |
| --------------------------------------- | ----------------------------------------------- |
| `OutboxSchema` (MongoDB)                | `libs/event-bus/src/outbox/outbox.schema.ts`    |
| `OutboxService` (save + poll + publish) | `libs/event-bus/src/outbox/outbox.service.ts`   |
| `OutboxProcessor` (cron-based poller)   | `libs/event-bus/src/outbox/outbox.processor.ts` |
| Integration with `EventBusService`      | `libs/event-bus/src/event-bus.service.ts`       |

### 2.3 Idempotent Consumers

| Deliverable                                        | File/Path                                        |
| -------------------------------------------------- | ------------------------------------------------ |
| Import `@libs/idempotency` in all services         | Each service module                              |
| `InboxSchema` + `InboxService` (dedupe by eventId) | `libs/idempotency/src/services/inbox.service.ts` |
| Wrap existing event handlers with inbox check      | Each service's event handlers                    |
| Idempotency tests                                  | `test/idempotency/` per service                  |

---

## Workstream 3 — Events + DLQ Operable

### 3.1 Event Standard

| Deliverable                                 | File/Path                                      |
| ------------------------------------------- | ---------------------------------------------- |
| Event naming convention doc                 | `docs/architecture/EVENT-NAMING-CONVENTION.md` |
| Event catalog (all events by domain)        | `docs/architecture/EVENT-CATALOG.md`           |
| AsyncAPI specs per domain (update existing) | `apps/*/docs/*-events.asyncapi.yaml`           |
| `EventVersion` enum and enforcement         | `libs/common/src/enums/event-version.enum.ts`  |

### 3.2 DLQ per Queue + Retry Strategy

| Deliverable                                                   | File/Path                                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Wire DLQ in RabbitMQ adapter (send to DLQ instead of requeue) | `libs/event-bus/src/adapters/rabbitmq.adapter.ts`                            |
| Configure dead-letter-exchange per queue                      | `libs/event-bus/src/adapters/rabbitmq.adapter.ts`                            |
| Retry with exponential backoff (max 3 attempts)               | `libs/event-bus/src/dlq/retry-strategy.interface.ts`                         |
| DLQ redrive endpoint in gateway                               | `apps/api-gateway/src/infrastructure/controllers/dlq.controller.ts` (exists) |
| DLQ runbook                                                   | `docs/operations/DLQ-RUNBOOK.md`                                             |

### 3.3 Queue Observability

| Deliverable                                           | File/Path                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| Add correlationId/causationId to all event publishing | `libs/event-bus/src/event-bus.service.ts`                           |
| Log queue depth metrics                               | `libs/event-bus/src/adapters/rabbitmq.adapter.ts`                   |
| Metrics endpoint for DLQ stats                        | `apps/api-gateway/src/infrastructure/controllers/dlq.controller.ts` |

---

## Workstream 4 — Metrics Service

### 4.1 OTel Instrumentation

| Deliverable                       | File/Path                                                      |
| --------------------------------- | -------------------------------------------------------------- |
| OTel SDK setup (traces + metrics) | `libs/common/src/telemetry/otel.setup.ts`                      |
| HTTP instrumentation middleware   | `libs/common/src/telemetry/http-instrumentation.middleware.ts` |
| Integration per service `main.ts` | `apps/*/src/main.ts`                                           |

### 4.2 Domain KPIs

| Deliverable                                           | File/Path                                              |
| ----------------------------------------------------- | ------------------------------------------------------ |
| 15 KPIs defined (reservations, auth, resources, etc.) | `docs/operations/KPIS.md`                              |
| Metrics endpoint in reports-service                   | `apps/reports-service/src/infrastructure/controllers/` |
| Dashboard overview enhanced                           | Existing `DashboardController`                         |

---

## Workstream 5 — Notifications

### 5.1 Event-Driven Notifications

| Deliverable                         | File/Path                                             |
| ----------------------------------- | ----------------------------------------------------- |
| Consume reservation/approval events | `apps/stockpile-service/src/infrastructure/handlers/` |
| Dedupe by event_id + channel        | Via `@libs/idempotency` inbox                         |
| WebSocket + email channels          | `@libs/notifications` + existing WS gateway           |

### 5.2 Notification DLQ

| Deliverable                      | File/Path                         |
| -------------------------------- | --------------------------------- |
| Retries for failed notifications | `@libs/notifications` enhancement |
| DLQ for notification failures    | Via standard DLQ (WS3.2)          |

---

## Workstream 6 — Documentation

| Deliverable                         | File/Path                                    |
| ----------------------------------- | -------------------------------------------- |
| Architecture (C4 Mermaid)           | `docs/architecture/C4-ARCHITECTURE.md`       |
| Security flow (auth-service as SoT) | `docs/architecture/SECURITY-ARCHITECTURE.md` |
| AsyncAPI updated                    | `apps/*/docs/*.asyncapi.yaml`                |
| How to run + env vars + secrets     | `docs/GETTING-STARTED.md`                    |
| ADR-001: auth-service as SoT        | `docs/adr/ADR-001-auth-service-sot.md`       |
| ADR-002: event store + outbox       | `docs/adr/ADR-002-event-store-outbox.md`     |
| ADR-003: DLQ policy                 | `docs/adr/ADR-003-dlq-policy.md`             |
| DLQ runbook                         | `docs/operations/DLQ-RUNBOOK.md`             |

---

## QA Gates

| Test Type   | Scope                                    | File/Path                          |
| ----------- | ---------------------------------------- | ---------------------------------- |
| Contract    | auth-service introspect/evaluate API     | `apps/auth-service/test/contract/` |
| Integration | Auth-enforced flow per service           | `apps/*/test/integration/`         |
| Idempotency | Consumer reprocess no duplicate effects  | `apps/*/test/idempotency/`         |
| Smoke       | All services health + auth + basic flows | `test-endpoints-api-gateway/`      |

---

## Execution Order

1. **WS1** (Security) — auth contract + SDK + enforcement + JWT standardization
2. **WS2** (Event Store) — enable + outbox + idempotent consumers
3. **WS3** (DLQ/Events) — wire DLQ + naming + AsyncAPI
4. **WS4** (Metrics) — OTel + KPIs
5. **WS5** (Notifications) — dedupe + DLQ
6. **WS6** (Docs) — architecture + ADRs + runbooks
7. **QA** — contract + integration + smoke tests

---

**Created**: Feb 17, 2026
**Status**: FASE 0 complete. Ready to execute WS1.
