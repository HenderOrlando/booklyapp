# Rules Review — bookly-mock

> **RUN_ID:** `2026-02-16-bookly-mock-01`
> **SCOPE_ROOT:** `bookly-mock/`
> **Date:** 2026-02-16
> **Auditor:** Cascade (WF-RULES-REVIEW)

---

## Executive Summary

| KPI                                     | Value       |
| --------------------------------------- | ----------- |
| Total rules in `.windsurf/rules/`       | 53          |
| Applicable to scope                     | 50          |
| Excluded (design-system, frontend-only) | 3           |
| Missing RF rule files                   | **0**       |
| Average score (applicable rules)        | **2.8 / 5** |
| Rules at score ≤ 2 (blockers if core)   | 9           |
| Rules at score 3 (functional, no tests) | 41          |
| Rules at score ≥ 4                      | **0**       |
| Test files in scope                     | **1**       |
| **Global gate: all scores capped at 3** | ⚠️ No tests |

### Critical Findings

1. **Test coverage is near-zero** — Only 1 spec file (`auth.service.spec.ts`) in the entire backend. This caps ALL rule scores at max **3** per rubric.
2. **All 44 RF rule files now exist** — resources-service (RF-01→RF-06) and stockpile-service (RF-20→RF-30) rule files created.
3. **Architecture is well-structured** — Clean Architecture, CQRS, EDA patterns are consistently applied across all 6 services.
4. **RF-30 (espera activa) is the least mature** — Score 2, missing subscription model, FIFO queue, and time-limited reservation window.
5. **Documentation is rich** — Each service has ARCHITECTURE.md, ENDPOINTS.md, DATABASE.md, EVENT_BUS.md, SEEDS.md, and per-RF implementation docs.

---

## Scoring Matrix

### Rubric (0–5)

| Score | Level            | Description                               |
| ----- | ---------------- | ----------------------------------------- |
| 0     | No evidence      | No files, no code, no docs                |
| 1     | Skeleton         | Files exist but minimal/empty             |
| 2     | Partial          | Some ACs covered, gaps remain             |
| 3     | Functional       | Most ACs implemented, **no tests**        |
| 4     | Complete + tests | ACs + BDD/unit tests                      |
| 5     | Production-grade | Tests + observability + resilience + docs |

**Gates:** No tests → max 3 · EDA without idempotency verification → max 3 · Score ≤ 2 → blocker if core

---

### Cross-cutting Rules

| Rule ID      | Name                 | Score | Gate        | Skill                             |
| ------------ | -------------------- | ----- | ----------- | --------------------------------- |
| RULE-BASE    | Arquitectura General | 3     | ⚠️ no tests | `gobierno-de-arquitectura-diseno` |
| RULE-MODULES | Resumen por Módulo   | 3     | ⚠️ no tests | `gobierno-de-arquitectura-diseno` |
| RULE-PLAN    | Planificación        | 3     | —           | `gestion-ingenieria-delivery`     |

### Flow Definitions

| Rule ID          | Name                | Score | Gate        | Skill     |
| ---------------- | ------------------- | ----- | ----------- | --------- |
| RULE-FLUJO-AUTH  | Flujos Auth         | 3     | ⚠️ no tests | `backend` |
| RULE-FLUJO-AVAIL | Flujos Availability | 3     | ⚠️ no tests | `backend` |
| RULE-FLUJO-RSRC  | Flujos Resources    | 3     | ⚠️ no tests | `backend` |
| RULE-FLUJO-STOCK | Flujos Stockpile    | 3     | ⚠️ no tests | `backend` |
| RULE-FLUJO-RPT   | Flujos Reports      | 3     | ⚠️ no tests | `backend` |

### Auth Service (RF-41 → RF-45)

| Rule ID | Name                        | Score | Gate        | Skill                                         |
| ------- | --------------------------- | ----- | ----------- | --------------------------------------------- |
| RF-41   | Gestión de Roles y Permisos | 3     | ⚠️ no tests | `backend` + `seguridad-privacidad-compliance` |
| RF-42   | Restricción de Modificación | 3     | ⚠️ no tests | `backend` + `seguridad-privacidad-compliance` |
| RF-43   | Autenticación y SSO         | 3     | ⚠️ no tests | `backend` + `seguridad-avanzada`              |
| RF-44   | Auditoría de Accesos        | 3     | ⚠️ no tests | `backend` + `seguridad-privacidad-compliance` |
| RF-45   | Verificación 2FA            | 3     | ⚠️ no tests | `backend` + `seguridad-avanzada`              |

### Availability Service (RF-07 → RF-19)

| Rule ID | Name                          | Score | Gate            | Skill                                                   |
| ------- | ----------------------------- | ----- | --------------- | ------------------------------------------------------- |
| RF-07   | Horarios Disponibles          | 3     | ⚠️ no tests     | `backend`                                               |
| RF-08   | Integración Calendarios       | 2     | 🔴 partial      | `backend` + `ingenieria-sincronizacion-datos-dificiles` |
| RF-09   | Búsqueda Disponibilidad       | 3     | ⚠️ no tests     | `backend`                                               |
| RF-10   | Visualización Calendario      | 2     | 🔴 backend-only | `backend` + `web-app`                                   |
| RF-11   | Historial de Uso              | 3     | ⚠️ no tests     | `backend` + `data-reporting`                            |
| RF-12   | Reservas Periódicas           | 3     | ⚠️ no tests     | `backend`                                               |
| RF-13   | VoBo Docente                  | 2     | 🔴 partial      | `backend`                                               |
| RF-14   | Lista de Espera               | 3     | ⚠️ no tests     | `backend`                                               |
| RF-15   | Reasignación Reservas         | 3     | ⚠️ no tests     | `backend`                                               |
| RF-16   | Restricciones por Categoría   | 2     | 🔴 partial      | `backend`                                               |
| RF-17   | Tiempo entre Reservas         | 2     | 🔴 partial      | `backend`                                               |
| RF-18   | Cancelar/Modificar con Reglas | 3     | ⚠️ no tests     | `backend`                                               |
| RF-19   | Reservas Múltiples            | 2     | 🔴 partial      | `backend`                                               |

### Resources Service (RF-01 → RF-06)

| Rule ID | Name                         | Score | Gate        | Skill     |
| ------- | ---------------------------- | ----- | ----------- | --------- |
| RF-01   | CRUD Recursos                | 3     | ⚠️ no tests | `backend` |
| RF-02   | Asociar Categoría y Programa | 3     | ⚠️ no tests | `backend` |
| RF-03   | Atributos Clave Recurso      | 3     | ⚠️ no tests | `backend` |
| RF-04   | Importación Masiva CSV       | 3     | ⚠️ no tests | `backend` |
| RF-05   | Reglas de Disponibilidad     | 3     | ⚠️ no tests | `backend` |
| RF-06   | Mantenimiento Recursos       | 3     | ⚠️ no tests | `backend` |

### Stockpile Service (RF-20 → RF-30)

| Rule ID | Name                          | Score | Gate        | Skill     |
| ------- | ----------------------------- | ----- | ----------- | --------- |
| RF-20   | Validar Solicitudes           | 3     | ⚠️ no tests | `backend` |
| RF-21   | Generar Documentos            | 3     | ⚠️ no tests | `backend` |
| RF-22   | Notificación con Carta        | 3     | ⚠️ no tests | `backend` |
| RF-23   | Pantalla Vigilancia           | 3     | ⚠️ no tests | `backend` |
| RF-24   | Flujos Diferenciados          | 3     | ⚠️ no tests | `backend` |
| RF-25   | Trazabilidad Auditable        | 3     | ⚠️ no tests | `backend` |
| RF-26   | Check-in/Check-out Digital    | 3     | ⚠️ no tests | `backend` |
| RF-27   | Integración Email/WhatsApp    | 3     | ⚠️ no tests | `backend` |
| RF-28   | Notificaciones Automáticas    | 3     | ⚠️ no tests | `backend` |
| RF-29   | Recordatorios Personalizables | 3     | ⚠️ no tests | `backend` |
| RF-30   | Espera Activa por Cancelación | 2     | 🔴 partial  | `backend` |

### Reports Service (RF-31 → RF-39)

| Rule ID | Name                          | Score | Gate        | Skill                        |
| ------- | ----------------------------- | ----- | ----------- | ---------------------------- |
| RF-31   | Uso por Programa/Período/Tipo | 3     | ⚠️ no tests | `data-reporting`             |
| RF-32   | Reservas por Usuario          | 3     | ⚠️ no tests | `data-reporting`             |
| RF-33   | Exportar CSV                  | 3     | ⚠️ no tests | `data-reporting`             |
| RF-34   | Feedback Calidad Servicio     | 3     | ⚠️ no tests | `backend` + `data-reporting` |
| RF-35   | Feedback Administrativo       | 3     | ⚠️ no tests | `backend` + `data-reporting` |
| RF-36   | Dashboard Tiempo Real         | 3     | ⚠️ no tests | `data-reporting` + `web-app` |
| RF-37   | Demanda Insatisfecha          | 3     | ⚠️ no tests | `data-reporting`             |
| RF-38   | Conflictos de Reserva         | 2     | 🔴 partial  | `data-reporting`             |
| RF-39   | Cumplimiento de Reserva       | 2     | 🔴 partial  | `data-reporting`             |

---

## Score Distribution

```text
Score 0: 0 rules  (  0%)
Score 1: 0 rules  (  0%)
Score 2: 9 rules  ( 18%)  ← blockers if core
Score 3: 41 rules ( 82%)  ← all capped by no-tests gate
Score 4: 0 rules  (  0%)
Score 5: 0 rules  (  0%)
```

---

## Gap Analysis Summary

### 1. Testing (CRITICAL — blocks all rules from score ≥ 4)

- **Current:** 1 spec file in entire backend
- **Required:** BDD specs (Given-When-Then with Jasmine) per service per RF
- **Skill:** `qa-calidad` (`SK-QA-001`)
- **Effort:** HIGH — Needs test infrastructure + per-RF spec files

### 2. Partial Implementations (Score 2 — 9 rules)

| Rule  | Gap Description                                                                  | Priority       |
| ----- | -------------------------------------------------------------------------------- | -------------- |
| RF-08 | Calendar integration utility exists but full bidirectional sync not verified     | Medium         |
| RF-10 | Backend provides calendar data but visualization is frontend scope               | Low (frontend) |
| RF-13 | VoBo-specific student→teacher flow needs dedicated command                       | High           |
| RF-16 | Category-based booking restrictions need explicit validation in reservation flow | High           |
| RF-17 | Preparation time between reservations config needs verification                  | Medium         |
| RF-19 | Multi-resource booking in single request needs verification                      | Medium         |
| RF-38 | Conflict report aggregation needs dedicated handler                              | Medium         |
| RF-39 | Compliance report based on check-in/out data needs dedicated handler             | Medium         |
| RF-28 | Update/cancel notification methods are TODO (commented out)                      | High           |
| RF-30 | Espera activa: missing subscription model, FIFO queue, time-limited window       | High           |

### 3. Architecture & Resilience

- **Idempotency:** `libs/idempotency/` exists — verify adoption across all command handlers
- **EDA:** Event-bus with DLQ + event-store is well-structured
- **Observability:** Logger util exists in libs/common — verify structured logging adoption
- **Skill:** `arquitectura-escalabilidad-resiliencia` (`SK-SCALE-RES-001`)

### 4. Security

- **Guards/Decorators:** permissions.guard, roles.decorator, permissions.decorator exist in libs
- **2FA:** Full implementation (setup, verify, enable, disable, backup codes)
- **Audit:** DTOs and docs confirm audit system
- **Gap:** Verify JWT token management, session expiration, brute-force protection
- **Skill:** `seguridad-privacidad-compliance` (`SK-SEC-COMP-001`)

---

## Improvement Plan (Priority Order)

### P0 — Unblock Score 4+ (Testing)

1. Set up Jasmine/Jest test infrastructure per service
2. Write BDD specs for all RF-41→RF-45 (auth core)
3. Write BDD specs for RF-07, RF-09, RF-12, RF-14, RF-15, RF-18 (availability core)
4. Write BDD specs for RF-31→RF-37 (reports core)

### P1 — Fix Score 2 Rules (Blockers)

1. RF-13: Implement dedicated VoBo command/handler in availability-service
2. RF-16: Add category-based restriction check in create-reservation handler
3. RF-17: Verify/implement preparation time buffer in availability validation
4. RF-19: Verify/implement multi-resource single-request flow

### P2 — Harden for Production

1. Verify idempotency adoption in all command handlers
2. Add structured logging (Winston) across all services
3. Add OpenTelemetry tracing spans
4. Implement rate-limiting at service level (not just gateway)

---

## Artifacts

| Artifact        | Path                                             |
| --------------- | ------------------------------------------------ |
| Folder map      | `_inventory/folder-map.md`                       |
| Rules index     | `_catalog/rules.index.md`                        |
| Per-rule docs   | `RULE-AUTH-RF41.md` through `RULE-STOCK-RF30.md` |
| Resolution plan | `PLAN-RF-RESOLUTION.md`                          |
| This README     | `README.md`                                      |
