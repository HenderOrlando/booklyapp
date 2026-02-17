---
name: arquitectura-escalabilidad-resiliencia
description: Skill para diseñar y operar sistemas escalables y resilientes, cubriendo optimización de rendimiento (profiling, queries, caching, colas), alta disponibilidad multi-región con failover, consistencia bajo concurrencia (transacciones, locking, idempotencia), semánticas de entrega (at-least-once, exactly-once), capacity planning con pruebas de carga/estrés, y unit economics (cost per active user).
---

# 🧱 Windsurf Skill — Arquitectura de Escalabilidad y Resiliencia
**Skill ID:** SK-SCALE-RES-001  
**Aplica a:** Fintech, Legaltech, Edtech, Health/Med, Retailtech, Proptech, Foodtech, Regtech (cualquier sistema con cargas variables y SLAs)  
**Objetivo:** diseñar y operar sistemas con **latencia controlada**, **alta disponibilidad**, **consistencia correcta** bajo concurrencia, y **capacidad planificada** con pruebas de carga y unit economics (cost per active user).

---

## 0) Scalability & Resilience Profile (output obligatorio)
Antes de proponer arquitectura u optimizaciones, Windsurf debe fijar:

- **SLIs/SLOs:** p95/p99 latency, error rate, availability, freshness (si aplica)
- **Workload:** RPS/TPS, peak factor, burstiness, reads/writes ratio
- **Data size:** registros totales, crecimiento mensual, cardinalidades
- **Critical paths:** 3 rutas/flows más importantes (ej. crear transacción, reportes, sync)
- **Consistency needs:** strong | eventual | mixed (por operación)
- **Delivery semantics:** at-least-once | at-most-once | exactly-once (por integración/cola)
- **Regions:** 1 región | multi-AZ | multi-región
- **DR targets:** RPO/RTO
- **Cost KPI:** cost per active user / cost per transaction / cost per tenant

> Gate: sin Scalability & Resilience Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Medir antes de optimizar:** profiling y trazas primero.
2. **Hot path minimalista:** reducir dependencias y hops en rutas críticas.
3. **Consistencia por operación:** no “eventual” por accidente.
4. **Idempotencia end-to-end:** API + jobs + eventos + integraciones.
5. **Fallos esperados:** timeouts, retries, circuit breakers, backpressure.
6. **Escala sostenible:** performance sin disparar costos (unit cost monitorizado).

---

## 2) Performance Engineering (profiling, queries, cachés, colas)
### 2.1 Observabilidad de performance (obligatoria)
- Tracing distribuido (OTel) con spans por:
  - controller/handler
  - DB queries
  - cache calls
  - outbound HTTP
  - queue publish/consume
- Métricas:
  - p95/p99 por endpoint y por operación de dominio
  - DB: slow queries, lock wait, connection pool saturation
  - cache hit ratio
  - queue lag

**Gate performance (bloquea):**
- No hay profiling/tracing y se propone “optimización” a ciegas.

### 2.2 Optimización de queries (reglas duras)
- Índices basados en queries reales (EXPLAIN/ANALYZE)
- Evitar N+1 (batching/join predecible)
- Paginar siempre en listas grandes (keyset pagination preferida)
- Consultas de reporting separadas (read models / materialización si aplica)

**Gate queries (bloquea):**
- Endpoints con scanning full table en paths críticos.
- Reporting pesado corriendo en tablas OLTP sin estrategia.

### 2.3 Cachés (patrones recomendados)
- Read-through / cache-aside para lecturas frecuentes
- TTLs explícitos + invalidación por evento (si aplica)
- “Stale-while-revalidate” para dashboards (si aceptable)
- Protección contra stampedes (singleflight/locking)

**Gate cache (bloquea):**
- Caché sin estrategia de invalidación o TTL.
- Hot key sin protección (stampede).

### 2.4 Colas y async (cuando conviene)
- Offload:
  - cálculos agregados
  - import/sync
  - notificaciones
  - heavy reporting
- Backpressure:
  - límites de concurrencia por consumer
  - retries con jitter + DLQ
- Idempotencia del consumer (ver sección 4)

**Gate colas (bloquea):**
- Retries infinitos sin DLQ.
- Consumers no idempotentes (duplican efectos).

---

## 3) Multi-región y alta disponibilidad (replicación, failover)
### 3.1 Niveles de disponibilidad (seleccionar)
- **L1:** single region + multi-AZ (MVP robusto)
- **L2:** active-passive multi-region (DR)
- **L3:** active-active multi-region (alta complejidad)

### 3.2 Replicación y failover
- DB:
  - read replicas (escala de lecturas)
  - failover automático (según engine)
  - lag monitoring (staleness)
- Stateful services:
  - evitar state local; usar Redis/DB
- Routing:
  - health checks + DNS failover
  - circuit breaker por región

**Gate HA (bloquea en L2+):**
- No hay RPO/RTO ni runbooks de failover.
- No se monitorea replication lag.

### 3.3 Estrategia activa/pasiva (recomendada para iniciar)
- Primary region: read/write
- Secondary: warm standby
- DR drills periódicos (restore/failover test)

**Gate DR (bloquea):**
- DR “de papel” sin pruebas (drills).

---

## 4) Concurrencia y consistencia (transacciones, locking, idempotencia)
### 4.1 Transacciones y aislamiento
- Definir por operación:
  - atomicidad requerida
  - aislamiento (READ COMMITTED / REPEATABLE READ / SERIALIZABLE)
- Usar transacciones cortas, evitar locks prolongados

### 4.2 Locking strategies
- Optimistic locking (version field) para entidades editables
- Pessimistic locking solo en secciones críticas
- Idempotency keys para evitar doble write

**Gate locking (bloquea):**
- Operaciones críticas sin estrategia (optimistic/pessimistic/idempotency).
- Transacciones largas en paths críticos.

### 4.3 Idempotencia avanzada (end-to-end)
- API: `Idempotency-Key` + request hash + TTL
- Persistencia del resultado (response replay)
- Jobs/events:
  - dedupe por `event_id`/`message_id`
  - outbox/inbox pattern
- Reintentos:
  - exponential backoff + jitter
  - límites + DLQ

**Gate idempotencia (bloquea):**
- Endpoints transaccionales sin idempotency.
- Retries sin dedupe generan duplicados.

### 4.4 Exactly-once vs at-least-once
- **Default realista:** at-least-once + idempotent consumers
- Exactly-once solo cuando:
  - hay soporte transaccional/stream (p.ej., Kafka EOS) y el costo vale
- Documentar semántica por flujo:
  - publish (outbox)
  - consume (inbox + dedupe)
  - side effects (payments, ledger entries)

**Gate delivery semantics (bloquea):**
- Se afirma “exactly-once” sin mecanismo real.
- No se documenta semántica por flujo.

---

## 5) Capacity Planning (dimensionamiento, picos, load/stress)
### 5.1 Capacity model (mínimo)
- Cargas:
  - promedio y pico (p95 peak factor)
  - estacionalidad (quincena/fin de mes)
- Recursos:
  - CPU/mem por servicio
  - conexiones DB por pool
  - throughput de cola
- Headroom:
  - objetivo 30–50% (ajustable)

### 5.2 Pruebas de carga/estrés (obligatorias en R2+)
- Load test: alcanzar pico esperado
- Stress test: superar pico hasta degradación
- Soak test: estabilidad 2–6h (o más)
- Chaos-lite: simular dependencia caída, latencia, timeouts

Artefactos:
- scripts reproducibles
- reporte con SLIs (p95/p99, error rate)
- plan de remediación

**Gate load testing (bloquea en R2+):**
- No hay pruebas reproducibles antes de un lanzamiento grande.
- No hay reporte ni remediación.

### 5.3 Unit cost: “cost per active user”
- Definir fórmula:
  - (costo cloud periodo) / (MAU o DAU) o / transacciones
- Desglosar por servicio:
  - compute, DB, cache, observability, egress
- Objetivo y alertas:
  - umbral por plan/tier

**Gate cost KPI (bloquea en crecimiento):**
- No existe unit cost definido.
- No hay alertas de budget/costo por servicio.

---

## 6) Patrones recomendados (cuando aplican)
- Outbox pattern para eventos confiables
- CQRS/read models para reporting pesado
- Bulkheads + circuit breakers en integraciones
- Rate limiting y quotas por tenant (B2B)
- Backpressure en consumers
- Caching + materialización (cuando reporting lo pide)

---

## 7) Outputs obligatorios (por fase BMAD)
### BRIEF
- Scalability & Resilience Profile + SLIs/SLOs + picos + supuestos

### MODEL
- Diseño hot paths + estrategias de cache/colas
- HA/DR level (L1/L2/L3) + RPO/RTO
- Modelo de consistencia por operación
- Semánticas de entrega (at-least-once, etc.)

### ACTION
- Instrumentación (OTel) + dashboards
- Indexing + query optimizations + paginación
- Cache plan + stampede protection
- Queue consumers idempotentes + DLQ
- Load/stress test scripts + report template
- Cost KPI pipeline

### DEPLOY
- Runbooks (failover, lag, queue backlog, DB saturation)
- SLO monitoring + alerting
- Capacity review mensual + optimizaciones FinOps

---

## 8) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Scalability & Resilience Profile**  
2) **Performance Plan** (profiling, queries, cache, queues, latency budgets)  
3) **HA/DR Plan** (multi-AZ/region, replication, failover, RPO/RTO)  
4) **Concurrency/Consistency Plan** (tx, locking, idempotency, delivery semantics)  
5) **Capacity Plan** (dimensionamiento, peak factors, load/stress/soak)  
6) **Unit Cost Plan** (cost per active user/tx, cost drivers, alerts)  
7) **Next Steps** (accionables)

---

## 9) Señales de deuda de escalabilidad/resiliencia (Windsurf debe advertir)
- Optimización sin métricas/tracing.
- Reporting pesado sobre OLTP sin read models/materialización.
- Endpoints transaccionales sin idempotency keys.
- Consumers no idempotentes + retries sin DLQ.
- Prometer “exactly-once” sin outbox/inbox/EOS real.
- DR sin pruebas y sin RPO/RTO.
- Sin load tests reproducibles antes de escalar.
- Sin unit cost (costo por usuario activo/transacción).

---
**End of skill.**
