# Bookly — Domain KPIs & Operational Metrics

## Overview

KPIs are grouped by domain service. Each metric includes its source, collection method, and alerting threshold.

**Collection**: OTel SDK (`@libs/common/telemetry`) when `OTEL_ENABLED=true`, plus in-app counters via existing services.

---

## 1. Auth Service (Identity & Access)

| # | KPI | Source | Method | Alert Threshold |
|---|-----|--------|--------|-----------------|
| 1 | **Login success rate** | auth-service | `login_success / login_attempts * 100` | < 95% over 5 min |
| 2 | **Login latency (p95)** | OTel HTTP span | `POST /auth/login` duration | > 500ms |
| 3 | **Token introspection latency (p95)** | OTel HTTP span | `POST /auth/introspect` duration | > 100ms |
| 4 | **Failed login attempts per user** | auth-service audit log | Count per userId per hour | > 10/hour |
| 5 | **Active sessions** | Redis | Count of non-blacklisted tokens | Informational |

## 2. Resources Service (Resource Management)

| # | KPI | Source | Method | Alert Threshold |
|---|-----|--------|--------|-----------------|
| 6 | **Resources created per day** | event store | Count `bookly.resource.created` events | Informational |
| 7 | **Import success rate** | resources-service | `successful_imports / total_imports * 100` | < 90% |
| 8 | **Resources under maintenance** | resources-service DB | Count where `maintenanceStatus = ACTIVE` | > 20% of total |

## 3. Availability Service (Reservations & Scheduling)

| # | KPI | Source | Method | Alert Threshold |
|---|-----|--------|--------|-----------------|
| 9 | **Reservations created per day** | event store | Count `bookly.reservation.created` events | Informational |
| 10 | **Reservation conflict rate** | availability-service | `conflicts / creation_attempts * 100` | > 15% |
| 11 | **Waiting list conversion rate** | availability-service | `promoted / waitlisted * 100` | Informational |
| 12 | **Average reservation lead time** | availability-service DB | `avg(startDate - createdAt)` | Informational |

## 4. Stockpile Service (Approvals & Workflows)

| # | KPI | Source | Method | Alert Threshold |
|---|-----|--------|--------|-----------------|
| 13 | **Approval turnaround time (p50)** | stockpile-service DB | `avg(decidedAt - requestedAt)` | > 24 hours |
| 14 | **Approval rate** | stockpile-service | `approved / total_decisions * 100` | Informational |
| 15 | **Check-in compliance rate** | stockpile-service | `checked_in / approved * 100` | < 70% |

## 5. Reports Service (Analytics & Audit)

| # | KPI | Source | Method | Alert Threshold |
|---|-----|--------|--------|-----------------|
| 16 | **Report generation latency (p95)** | OTel HTTP span | Report endpoint durations | > 5s |
| 17 | **Audit events processed per minute** | reports-service | Consumer throughput counter | < 1/min (stale) |

## 6. Platform / Cross-Cutting

| # | KPI | Source | Method | Alert Threshold |
|---|-----|--------|--------|-----------------|
| 18 | **Event store write success rate** | event-bus service | `stored / published * 100` | < 99% |
| 19 | **DLQ depth** | DLQ collection | Count by status=FAILED | > 50 |
| 20 | **RabbitMQ consumer lag** | RabbitMQ management API | Queue message count | > 1000 |
| 21 | **Notification delivery success rate** | NotificationMetricsService | `success / sent * 100` | < 90% |
| 22 | **HTTP error rate (5xx)** | OTel HTTP span | `5xx / total * 100` per service | > 1% over 5 min |
| 23 | **Service health** | `/health` endpoint | Periodic probe | Any DOWN |

---

## Dashboard Endpoints

| Endpoint | Service | Description |
|----------|---------|-------------|
| `GET /api/v1/dashboard/overview` | reports-service | Aggregated KPIs |
| `GET /api/v1/dashboard/usage` | reports-service | Resource usage metrics |
| `GET /api/v1/dashboard/demand` | reports-service | Demand analysis |
| `GET /dlq/stats` | api-gateway | DLQ statistics |
| `GET /health` | all services | Health check |

---

## OTel Integration

When `OTEL_ENABLED=true`, all HTTP spans and MongoDB operations are auto-instrumented. Custom metrics (counters, histograms) can be added via `@opentelemetry/api`:

```typescript
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("bookly-availability");
const reservationCounter = meter.createCounter("bookly.reservations.created");
reservationCounter.add(1, { resourceType: "sala" });
```

---

**Last updated**: February 17, 2026
