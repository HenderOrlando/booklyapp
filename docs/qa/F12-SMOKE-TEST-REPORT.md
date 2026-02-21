# F-12: Integration Smoke Test Report

**Date:** 2026-02-17
**Scope:** Backend Hardening + Full Stack Smoke Test (FE → GW → BE)

---

## 1. Backend Hardening Summary

### Fixes Applied

| Fix                                | File(s)                                                                | Impact                                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `serviceName` added to RedisModule | `resources.module.ts`, `reports.module.ts`                             | Per-service Redis key prefixing and metrics                                                                                 |
| Health controllers hardened (4/6)  | `resources`, `availability`, `stockpile`, `reports` health controllers | DB health check, uptime, Swagger decorators — matching gateway/auth pattern                                                 |
| Circuit breaker 4xx fix            | `circuit-breaker-redis.service.ts`, `proxy.service.ts`                 | 4xx client errors (401, 403, 404) no longer trip the circuit breaker; only 5xx and network errors count as service failures |
| Per-service `.env` files updated   | All 6 `apps/*/.env` files                                              | All services point to single MongoDB on port 27017 with separate databases                                                  |

### Compilation Status

- **TypeScript (tsc --noEmit):** ✅ 0 errors

---

## 2. Infrastructure Status

| Component | Container                | Port       | Status     |
| --------- | ------------------------ | ---------- | ---------- |
| MongoDB   | bookly-mock-mongodb-auth | 27017      | ✅ Healthy |
| Redis     | bookly-mock-redis        | 6379       | ✅ Healthy |
| RabbitMQ  | bookly-mock-rabbitmq     | 5672/15672 | ✅ Healthy |

---

## 3. Service Health Checks (Direct)

| Service              | Port | Endpoint         | Status | DB Connected        | Latency |
| -------------------- | ---- | ---------------- | ------ | ------------------- | ------- |
| api-gateway          | 3000 | `/health`        | ✅ ok  | bookly-gateway      | 1ms     |
| auth-service         | 3001 | `/api/v1/health` | ✅ ok  | bookly-auth         | 1ms     |
| resources-service    | 3002 | `/api/v1/health` | ✅ ok  | bookly-resources    | 2ms     |
| availability-service | 3003 | `/api/v1/health` | ✅ ok  | bookly-availability | 2ms     |
| stockpile-service    | 3004 | `/api/v1/health` | ✅ ok  | bookly-stockpile    | 2ms     |
| reports-service      | 3005 | `/api/v1/health` | ✅ ok  | bookly-reports      | 3ms     |

---

## 4. Gateway Proxy Routing (Unauthenticated)

| Route                            | Target Service       | HTTP Code | Result                     |
| -------------------------------- | -------------------- | --------- | -------------------------- |
| `GET /api/v1/users/`             | auth-service         | 401       | ✅ Correct (auth required) |
| `GET /api/v1/categories/`        | resources-service    | 401       | ✅ Correct (auth required) |
| `GET /api/v1/reservations/`      | availability-service | 401       | ✅ Correct (auth required) |
| `GET /api/v1/approval-requests/` | stockpile-service    | 401       | ✅ Correct (auth required) |
| `GET /api/v1/usage-reports/`     | reports-service      | 401       | ✅ Correct (auth required) |

**Key:** All 5 routes return 401 (not 503 circuit breaker fallback) — confirming the circuit breaker fix works.

---

## 5. Auth Flow (Register → Login → JWT → Authenticated)

| Step          | Endpoint                         | HTTP Code | Result                                   |
| ------------- | -------------------------------- | --------- | ---------------------------------------- |
| Register      | `POST /api/v1/auth/register`     | 200       | ✅ User created with STUDENT role        |
| Login         | `POST /api/v1/auth/login`        | 200       | ✅ JWT access + refresh tokens returned  |
| Users (admin) | `GET /api/v1/users/`             | 403       | ✅ Correct (STUDENT lacks GENERAL_ADMIN) |
| Categories    | `GET /api/v1/categories/`        | 200       | ✅ Empty array (no data yet)             |
| Reservations  | `GET /api/v1/reservations/`      | 200       | ✅ Empty array (no data yet)             |
| Approvals     | `GET /api/v1/approval-requests/` | 200       | ✅ Empty array (no data yet)             |
| Reports       | `GET /api/v1/usage-reports/`     | 200       | ✅ Empty array (no data yet)             |

---

## 6. Frontend Status

| Check              | Result                                |
| ------------------ | ------------------------------------- |
| Next.js dev server | ✅ Running on port 4200               |
| Login page         | ✅ HTTP 200 (`/es/login`)             |
| API Gateway URL    | ✅ `http://localhost:3000`            |
| Direct services    | ✅ Configured for all 5 microservices |
| Data mode          | ✅ `serve` (real backend data)        |

---

## 7. Bugs Found & Fixed

### BUG-1: Circuit Breaker Counting 4xx as Service Failures (Critical)

- **Root cause:** `proxyViaHttp` threw errors for all HTTP error responses; `attemptExecution` in circuit breaker caught ALL errors as failures
- **Impact:** Any 401/403/404 from backend services would accumulate failures and trip the circuit breaker, making the service appear "unavailable" (503) even though it was responding correctly
- **Fix:** Two-part fix:
  1. `proxy.service.ts`: 4xx errors throw HttpException directly (not generic errors)
  2. `circuit-breaker-redis.service.ts`: `attemptExecution` checks if error is `HttpException` with status < 500 → treats as success (service IS alive), re-throws for client handling

### BUG-2: Missing `serviceName` in RedisModule (Minor)

- **Affected:** resources-service, reports-service
- **Impact:** Redis keys lacked service-specific prefix, potential key collisions
- **Fix:** Added `serviceName` parameter to `RedisModule.forRootAsync` calls

### BUG-3: Basic Health Controllers Without DB Checks (Minor)

- **Affected:** resources, availability, stockpile, reports services
- **Impact:** Health checks returned static `{status:"ok"}` without verifying database connectivity
- **Fix:** Added `DatabaseService` injection and DB health check matching gateway/auth pattern

---

## 8. Verdict

**Status: ✅ PASS — Full Stack Operational**

All 6 backend services compile, start, connect to MongoDB/Redis/RabbitMQ, and respond correctly through the API Gateway. The auth flow (register → login → JWT → protected endpoints) works end-to-end. The frontend connects to the gateway and renders correctly.
