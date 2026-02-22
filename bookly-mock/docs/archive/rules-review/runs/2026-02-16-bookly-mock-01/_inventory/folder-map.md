# Folder Map — bookly-mock

> **RUN_ID:** `2026-02-16-bookly-mock-01`
> **SCOPE_ROOT:** `bookly-mock/`
> **Generated:** 2026-02-16

## Structure Overview

```
bookly-mock/
├── apps/
│   ├── api-gateway/          (34 files) — Proxy, circuit-breaker, rate-limiter, WebSocket, saga, DLQ, notifications
│   ├── auth-service/         (30 src TS + 1 spec) — Roles, permissions, SSO, 2FA, audit
│   ├── availability-service/ (28+ src TS, 0 specs) — Availability, reservations, recurring, waiting-list, reassignment
│   ├── reports-service/      (31+ src TS, 0 specs) — Usage reports, CSV export, feedback, evaluation, dashboard, demand
│   ├── resources-service/    (29+ src TS, 0 specs) — CRUD, categories, import, maintenance, availability-rules
│   └── stockpile-service/    (29+ src TS, 0 specs) — Approval flows, check-in/out, document generation, notifications
├── libs/
│   ├── common/               — Constants, decorators, enums, events, guards, utils (response, logger, ical-generator)
│   ├── database/             — Database module + service (MongoDB/Mongoose)
│   ├── decorators/           — current-user, permissions, public, roles decorators
│   ├── event-bus/            — RabbitMQ + Kafka adapters, DLQ, event-store
│   ├── filters/              — Exception filters
│   ├── guards/               — Auth guards
│   ├── idempotency/          — Idempotency support
│   ├── interceptors/         — HTTP interceptors
│   ├── kafka/                — Kafka module
│   ├── notifications/        — Notification providers
│   └── redis/                — Redis module
├── docs/                     (136 items) — Cross-service documentation
├── scripts/                  (23 items) — Utility scripts
├── docker-compose.yml        — Full stack compose
├── nest-cli.json             — NestJS workspace config
├── package.json              — Root dependencies
└── tsconfig.json             — TypeScript config
```

## Key Metrics

| Metric                       | Value                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------- |
| Microservices                | 6 (api-gateway + 5 domain services)                                               |
| Shared libs                  | 11                                                                                |
| Total TS source files (apps) | ~180+                                                                             |
| Total TS source files (libs) | ~39                                                                               |
| Spec files                   | **1** (`auth-service/test/unit/services/auth.service.spec.ts`)                    |
| Architecture pattern         | Clean Architecture (domain/application/infrastructure)                            |
| CQRS                         | ✅ Commands + Queries + Handlers per service                                      |
| EDA                          | ✅ Event-bus (RabbitMQ + Kafka), DLQ, event-store                                 |
| Idempotency lib              | ✅ `libs/idempotency/`                                                            |
| Documentation per service    | ARCHITECTURE.md, ENDPOINTS.md, DATABASE.md, EVENT_BUS.md, SEEDS.md, requirements/ |

## Hotspots

- **Test coverage is critically low** — only 1 spec file in entire scope
- **availability-service** is the largest service with most commands (~20 commands)
- **api-gateway** has advanced patterns: circuit-breaker, rate-limiter, saga, WebSocket
- **libs/event-bus** is well-structured with DLQ + event-store
- **libs/idempotency** exists but usage across services needs verification
