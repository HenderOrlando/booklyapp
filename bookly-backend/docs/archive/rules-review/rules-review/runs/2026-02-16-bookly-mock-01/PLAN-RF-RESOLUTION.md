# Plan de Resolución de RFs — bookly-mock

> **Basado en:** `RUN_ID 2026-02-16-bookly-mock-01`
> **Fecha:** 2026-02-16
> **Objetivo:** Llevar todos los RFs a score ≥ 4 (implementación completa + tests)

---

## Resumen Ejecutivo

| Categoría                          | RFs    | Esfuerzo estimado |
| ---------------------------------- | ------ | ----------------- |
| Implementaciones parciales (sc. 2) | 9      | Alto              |
| Tests BDD faltantes (sc. 3→4)      | 44     | Alto              |
| Audit docs pendientes (RSRC+STOCK) | 17     | Medio             |
| **Total RFs únicos a resolver**    | **44** | —                 |

---

## Fase 0 — Infraestructura de Testing (Pre-requisito Global)

> **Bloquea:** Todos los RFs. Sin esto, ningún RF puede superar score 3.

| #   | Tarea                                                              | Servicio | Skill        |
| --- | ------------------------------------------------------------------ | -------- | ------------ |
| 0.1 | Configurar Jasmine/Jest como framework BDD en el monorepo          | global   | `qa-calidad` |
| 0.2 | Crear estructura `test/unit/` y `test/bdd/` por cada microservicio | global   | `qa-calidad` |
| 0.3 | Agregar scripts `test`, `test:cov`, `test:bdd` en `package.json`   | global   | `qa-calidad` |
| 0.4 | Configurar umbral de cobertura mínimo (80%) en CI                  | global   | `qa-calidad` |

**Entregable:** Ejecutar `npm run test` exitosamente en cada servicio (aunque sin specs aún).

---

## Dominio 1 — auth-service (RF-41 → RF-45)

### Estado actual: Score 3 en los 5 RFs — funcional, sin tests

### 1A. Tests BDD (P0 — desbloquea score 4+)

| #   | RF    | Nombre                      | Specs a crear                                                                                |
| --- | ----- | --------------------------- | -------------------------------------------------------------------------------------------- |
| 1.1 | RF-41 | Gestión de Roles y Permisos | `create-role.spec.ts`, `assign-permissions.spec.ts`, `role-hierarchy.spec.ts`                |
| 1.2 | RF-42 | Restricción de Modificación | `admin-only-guard.spec.ts`, `resource-modification-restriction.spec.ts`                      |
| 1.3 | RF-43 | Autenticación y SSO         | `login-user.spec.ts`, `register-user.spec.ts`, `sso-google.spec.ts`, `refresh-token.spec.ts` |
| 1.4 | RF-44 | Auditoría de Accesos        | `audit-log-creation.spec.ts`, `audit-log-query.spec.ts`                                      |
| 1.5 | RF-45 | Verificación 2FA            | `setup-2fa.spec.ts`, `verify-2fa.spec.ts`, `critical-action-requires-2fa.spec.ts`            |

### 1B. Gaps de implementación menores

| #   | Tarea                                                     | Prioridad |
| --- | --------------------------------------------------------- | --------- |
| 1.6 | Verificar fallback cuando SSO Google no está disponible   | P1        |
| 1.7 | Verificar protección brute-force en login (rate limiting) | P1        |
| 1.8 | Verificar expiración de sesión JWT y token rotation       | P1        |

---

## Dominio 2 — resources-service (RF-01 → RF-06)

### Estado actual: Score 3 en los 6 RFs — funcional, sin tests

### 2A. Tests BDD (P0)

| #   | RF    | Specs a crear                                                                               |
| --- | ----- | ------------------------------------------------------------------------------------------- |
| 2.1 | RF-01 | `create-resource.spec.ts`, `update-resource.spec.ts`, `delete-resource.spec.ts`             |
| 2.2 | RF-02 | `create-category.spec.ts`, `assign-resource-category.spec.ts`                               |
| 2.3 | RF-03 | `resource-attributes-validation.spec.ts`                                                    |
| 2.4 | RF-04 | `import-resources.spec.ts`, `validate-import.spec.ts`, `rollback-import.spec.ts`            |
| 2.5 | RF-05 | `availability-rules-sync.spec.ts`                                                           |
| 2.6 | RF-06 | `schedule-maintenance.spec.ts`, `start-maintenance.spec.ts`, `complete-maintenance.spec.ts` |

### 2B. Evidencia de implementación existente

```text
Commands:  create-resource, update-resource, delete-resource, restore-resource,
           create-category, import-resources, start-async-import, validate-import,
           rollback-import, schedule-maintenance, start-maintenance,
           complete-maintenance, cancel-maintenance
Handlers:  13 handlers + 4 event-handlers
Events:    availability-rules-updated, resource-category-changed, resource-status-changed
Tests:     0 spec files
```

---

## Dominio 3 — availability-service (RF-07 → RF-19)

### Estado actual: 8 RFs a score 3, 5 RFs a score 2 (parcial)

### 3A. Implementaciones parciales — Score 2 → 3 (P1 — Bloqueantes)

| #   | RF    | Nombre                      | Gap                                                           | Acción requerida                                                                                              |
| --- | ----- | --------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 3.1 | RF-08 | Integración Calendarios     | Utilidad iCal existe pero falta sincronización bidireccional  | Implementar sync bidireccional con Google Calendar / Outlook. Manejar conflictos de actualización.            |
| 3.2 | RF-10 | Visualización Calendario    | Backend provee datos pero falta endpoint de vista calendario  | Crear query `get-calendar-view` con formato día/semana/mes. (Visualización es scope frontend.)                |
| 3.3 | RF-13 | VoBo Docente                | Flujo estudiante→docente repartido entre availability y stock | Crear command `request-teacher-approval` dedicado. Integrar timeout configurable para auto-rechazo.           |
| 3.4 | RF-16 | Restricciones por Categoría | Falta validación explícita de categoría en reserva            | Agregar guard/interceptor `category-restriction.guard.ts` en `create-reservation` handler.                    |
| 3.5 | RF-17 | Tiempo entre Reservas       | No existe config de buffer entre reservas                     | Agregar campo `preparationTimeMinutes` en modelo de recurso. Validar en `create-reservation`.                 |
| 3.6 | RF-19 | Reservas Múltiples          | No existe batch command para multi-recurso                    | Crear command `create-batch-reservation` que valide disponibilidad simultánea y genere reservas atómicamente. |

### 3B. Tests BDD — Score 3 → 4 (P0)

| #    | RF    | Specs a crear                                                                                    |
| ---- | ----- | ------------------------------------------------------------------------------------------------ |
| 3.7  | RF-07 | `configure-schedule.spec.ts`, `holiday-blocks.spec.ts`                                           |
| 3.8  | RF-08 | `ical-sync.spec.ts`, `calendar-conflict-detection.spec.ts`                                       |
| 3.9  | RF-09 | `search-availability.spec.ts`, `search-filters.spec.ts`                                          |
| 3.10 | RF-10 | `calendar-view-query.spec.ts`                                                                    |
| 3.11 | RF-11 | `usage-history-event-store.spec.ts`, `history-query.spec.ts`                                     |
| 3.12 | RF-12 | `create-recurring-reservation.spec.ts`, `cancel-recurring.spec.ts`, `conflict-in-series.spec.ts` |
| 3.13 | RF-13 | `request-teacher-approval.spec.ts`, `approval-timeout.spec.ts`                                   |
| 3.14 | RF-14 | `add-to-waiting-list.spec.ts`, `waiting-list-promotion.spec.ts`                                  |
| 3.15 | RF-15 | `request-reassignment.spec.ts`, `respond-reassignment.spec.ts`                                   |
| 3.16 | RF-16 | `category-restriction-guard.spec.ts`                                                             |
| 3.17 | RF-17 | `preparation-time-validation.spec.ts`                                                            |
| 3.18 | RF-18 | `cancel-reservation-rules.spec.ts`, `update-reservation-rules.spec.ts`                           |
| 3.19 | RF-19 | `create-batch-reservation.spec.ts`, `partial-batch-conflict.spec.ts`                             |

---

## Dominio 4 — stockpile-service (RF-20 → RF-30)

### Estado actual: 10 RFs a score 3, 1 RF a score 2 (RF-30) — sin tests

### 4A. Tests BDD (P0)

| #    | RF    | Specs a crear                                                                                      |
| ---- | ----- | -------------------------------------------------------------------------------------------------- |
| 4.1  | RF-20 | `create-approval-request.spec.ts`, `validate-request.spec.ts`                                      |
| 4.2  | RF-21 | `generate-document.spec.ts`                                                                        |
| 4.3  | RF-22 | `notification-event.spec.ts`, `auto-notification-trigger.spec.ts`                                  |
| 4.4  | RF-23 | `get-active-today-approvals.spec.ts`                                                               |
| 4.5  | RF-24 | `create-approval-flow.spec.ts`, `update-approval-flow.spec.ts`, `deactivate-approval-flow.spec.ts` |
| 4.6  | RF-25 | `approval-audit-trail.spec.ts`, `get-approval-statistics.spec.ts`                                  |
| 4.7  | RF-26 | `check-in.spec.ts`, `check-out.spec.ts`                                                            |
| 4.8  | RF-27 | `messaging-integration.spec.ts`                                                                    |
| 4.9  | RF-28 | `change-notification.spec.ts`                                                                      |
| 4.10 | RF-29 | `reminder-config.spec.ts`, `reminder-schedule.spec.ts`, `reminder-consolidation.spec.ts`           |
| 4.11 | RF-30 | `active-wait-subscription.spec.ts`, `cancellation-alert.spec.ts`, `priority-queue.spec.ts`         |

### 4B. Evidencia de implementación existente

```text
Commands:  create-approval-request, approve-step, reject-step,
           cancel-approval-request, create-approval-flow,
           update-approval-flow, deactivate-approval-flow,
           generate-document, check-in, check-out
Handlers:  13 handlers + notification-event.handler
Queries:   get-approval-requests, get-approval-request-by-id,
           get-active-today-approvals, get-approval-flows,
           get-approval-flow-by-id, get-approval-statistics
Tests:     0 spec files
```

---

## Dominio 5 — reports-service (RF-31 → RF-39)

### Estado actual: 7 RFs a score 3, 2 RFs a score 2 (parcial)

### 5A. Implementaciones parciales — Score 2 → 3 (P1 — Bloqueantes)

| #   | RF    | Nombre                  | Gap                                          | Acción requerida                                                                                                        |
| --- | ----- | ----------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 5.1 | RF-38 | Conflictos de Reserva   | No existe handler dedicado para este reporte | Crear `get-conflict-reports.handler.ts` + query + service. Agregar eventos de conflicto desde availability-service.     |
| 5.2 | RF-39 | Cumplimiento de Reserva | No existe handler dedicado para este reporte | Crear `get-compliance-reports.handler.ts` + query + service. Consumir datos de check-in/out desde availability-service. |

### 5B. Tests BDD — Score 3 → 4 (P0)

| #    | RF    | Specs a crear                                                                   |
| ---- | ----- | ------------------------------------------------------------------------------- |
| 5.3  | RF-31 | `generate-usage-report.spec.ts`, `usage-report-filters.spec.ts`                 |
| 5.4  | RF-32 | `get-user-reports.spec.ts`                                                      |
| 5.5  | RF-33 | `csv-export.spec.ts`, `excel-export.spec.ts`, `export-column-selection.spec.ts` |
| 5.6  | RF-34 | `create-feedback.spec.ts`, `feedback-eligibility.spec.ts`                       |
| 5.7  | RF-35 | `create-evaluation.spec.ts`, `evaluation-restriction.spec.ts`                   |
| 5.8  | RF-36 | `dashboard-query.spec.ts`, `websocket-realtime.spec.ts`                         |
| 5.9  | RF-37 | `demand-report-query.spec.ts`, `rejection-aggregation.spec.ts`                  |
| 5.10 | RF-38 | `conflict-report-query.spec.ts`                                                 |
| 5.11 | RF-39 | `compliance-report-query.spec.ts`, `no-show-detection.spec.ts`                  |

---

## Dominio 6 — Cross-cutting (Arquitectura, Seguridad, Observabilidad)

### 6A. Arquitectura y Resiliencia

| #   | Tarea                                                                     | Skill                                    | Prioridad |
| --- | ------------------------------------------------------------------------- | ---------------------------------------- | --------- |
| 6.1 | Auditar uso de alias en imports en todos los servicios                    | `gobierno-de-arquitectura-diseno`        | P1        |
| 6.2 | Verificar que handlers solo llaman a services (no controller→handler→svc) | `gobierno-de-arquitectura-diseno`        | P1        |
| 6.3 | Verificar adopción de `libs/idempotency/` en todos los command handlers   | `arquitectura-escalabilidad-resiliencia` | P1        |
| 6.4 | Verificar response estándar (`response.util.ts`) en todos los endpoints   | `gobierno-de-arquitectura-diseno`        | P2        |

### 6B. Seguridad

| #   | Tarea                                                          | Skill                             | Prioridad |
| --- | -------------------------------------------------------------- | --------------------------------- | --------- |
| 6.5 | Verificar JWT token rotation y expiración de sesión            | `seguridad-avanzada`              | P1        |
| 6.6 | Verificar rate limiting a nivel servicio (no solo gateway)     | `seguridad-avanzada`              | P1        |
| 6.7 | Verificar protección brute-force en endpoints de autenticación | `seguridad-privacidad-compliance` | P1        |

### 6C. Observabilidad

| #   | Tarea                                                           | Skill                                     | Prioridad |
| --- | --------------------------------------------------------------- | ----------------------------------------- | --------- |
| 6.8 | Verificar logging estructurado (Winston) en todos los servicios | `plataforma-build-deploy-operate-observe` | P2        |
| 6.9 | Agregar tracing spans (OpenTelemetry) en flujos críticos        | `plataforma-build-deploy-operate-observe` | P2        |

---

## Orden de Ejecución Recomendado

```text
Sprint 1 — Fundamentos (1-2 semanas)
├── Fase 0: Infraestructura de testing (global)
├── 1A: Tests BDD auth-service (RF-41→45)
└── 2A: Tests BDD resources-service (RF-01→06)

Sprint 2 — Desbloquear parciales + Tests (2-3 semanas)
├── 3A: Corregir 6 RFs parciales de availability-service
├── 5A: Implementar RF-38 y RF-39 en reports-service
└── 4A: Tests BDD stockpile-service (RF-20→30)

Sprint 3 — Testing masivo (2-3 semanas)
├── 3B: Tests BDD availability-service (RF-07→19)
├── 5B: Tests BDD reports-service (RF-31→39)
└── Revisión de coverage y score final

Sprint 4 — Hardening (1-2 semanas)
├── 6A: Auditoría de arquitectura y resiliencia
├── 6B: Verificación de seguridad
└── 6C: Verificación de observabilidad
```

---

## Métricas de Éxito

| Métrica                 | Actual | Objetivo Sprint 1 | Objetivo Sprint 3 | Objetivo Sprint 4 |
| ----------------------- | ------ | ----------------- | ----------------- | ----------------- |
| RFs con rule file       | 44/44  | 44/44             | 44/44             | 44/44             |
| RFs con score ≥ 3       | 35/44  | 35/44             | 44/44             | 44/44             |
| RFs con score ≥ 4       | 0/44   | 11/44             | 44/44             | 44/44             |
| Spec files              | 1      | ~30               | ~90               | ~90+              |
| Cobertura de tests      | ~0%    | >30%              | >80%              | >80%              |
| RFs parciales (score 2) | 9      | 9                 | 0                 | 0                 |

---

## Dependencias entre Dominios

```text
availability-service ──depends on──▶ resources-service (consulta recursos)
stockpile-service ────depends on──▶ availability-service (aprueba reservas)
reports-service ──────depends on──▶ availability-service (consume eventos de reserva)
reports-service ──────depends on──▶ stockpile-service (consume eventos de aprobación)
auth-service ─────────consumed by─▶ todos (guards, permisos, JWT)
api-gateway ──────────routes to───▶ todos
```

> **Recomendación:** Empezar por auth-service (sin dependencias internas), luego resources → availability → stockpile → reports.
