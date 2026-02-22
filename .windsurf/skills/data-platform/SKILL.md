---
name: data-platform
description: Diseña plataformas de datos escalables con warehouse/lakehouse, modelado estrella, cargas incrementales, capa semántica para BI self-serve con métricas gobernadas, data products y feature store para ML cuando el producto supera el reporting operacional básico.
---

# 🏗️ Windsurf Skill — Data Platform (cuando reporting crece)
**Skill ID:** SK-DATA-PLAT-001  
**Aplica a:** Cuando el producto supera reporting “operacional” y requiere analítica avanzada / BI self-serve / ML.  
**Objetivo:** diseñar una plataforma de datos escalable: warehouse/lakehouse con modelado estrella y cargas incrementales, capa semántica para BI con métricas gobernadas y data products, y (si aplica) feature store/gestión de datos ML con consistencia online/offline y versionado.

---

## 0) Data Platform Profile (output obligatorio)
Antes de proponer tecnología o arquitectura, Windsurf debe fijar:

- **Maturity stage:** reporting básico | analítica avanzada | BI self-serve | ML/IA
- **Volumen:** eventos/día, filas transaccionales, crecimiento mensual
- **Freshness target:** batch diario | hourly | near-real-time
- **Sources:** OLTP DB, eventos, proveedores (bancos/ERP), logs
- **Consumers:** producto (dashboards), negocio (BI), data science (ML)
- **Multi-tenant:** sí/no + aislamiento (row-level, schema per tenant)
- **Data classes:** PII/PHI/financieros + requirements de privacidad
- **Tooling constraints:** cloud/provider, presupuesto, skills del equipo
- **Risk Tier:** R0–R3

> Gate: sin Data Platform Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Métricas gobernadas:** “una verdad” para KPIs (evitar dashboards contradictorios).
2. **Incremental-first:** cargas incrementales + backfills controlados.
3. **Reproducibilidad:** pipelines versionados, datasets trazables.
4. **Separación OLTP vs OLAP:** reporting pesado no debe tumbar producción.
5. **Privacidad y minimización:** PII separada, acceso por roles, masking.
6. **Cost-aware:** particionado y almacenamiento con lifecycle policies.

---

## 2) Warehouse / Lakehouse (estrella, particionado, incremental loads)
### 2.1 Arquitectura de alto nivel (recomendada)
- **Bronze (raw):** datos crudos (eventos, extracts) con mínima transformación
- **Silver (clean):** normalización, dedupe, tipado, llaves consistentes
- **Gold (serving):** modelos analíticos (estrella), métricas, data marts

> Si el equipo es pequeño: empezar con Silver+Gold “lite” y crecer.

### 2.2 Modelado estrella (obligatorio para BI)
- **Fact tables** (ejemplos):
  - `fact_transactions`
  - `fact_subscriptions`
  - `fact_events` (si analítica de producto)
- **Dimensions**:
  - `dim_user`
  - `dim_tenant`
  - `dim_time`
  - `dim_category/merchant`
  - `dim_plan`
- Claves:
  - surrogate keys en dims
  - natural keys preservadas para lineage

**Gate modelado (bloquea):**
- Reportes críticos sin fact/dim claros → métricas inconsistentes.
- No existe `dim_time` para comparaciones y time-series.

### 2.3 Particionado y clustering
- Particionar por:
  - `event_date` / `posted_date` (tiempo) como default
- Clustering por:
  - `tenant_id`, `user_id`, `category_id`, `plan_id` según queries
- Políticas:
  - evitar particiones ultra-finas (costos)
  - definir retention por capas (bronze/silver/gold)

**Gate performance/costo (bloquea):**
- Tablas grandes sin particionado por tiempo.
- Consultas escanean meses/años completos sin necesidad.

### 2.4 Cargas incrementales (CDC / incremental)
Windsurf debe elegir estrategia:
- **CDC (ideal):** Debezium/replication/log-based
- **Incremental by watermark:** `updated_at` / `ingested_at`
- **Event-driven:** streams (Kafka) a landing

Requisitos:
- idempotencia (reprocesar sin duplicar)
- dedupe por `event_id`/`source_ref`
- backfills controlados:
  - rango de fechas
  - versión de pipeline
  - auditoría del backfill

**Gate incremental (bloquea):**
- ETL full refresh diario sin justificar (costo/tiempo).
- No existe watermark/CDC y hay updates frecuentes.

---

## 3) BI self-serve (semantic layer, métricas gobernadas, data products)
### 3.1 Semantic layer (obligatorio si hay múltiples dashboards)
- Definir “métricas oficiales”:
  - definición, fórmula, filtros, ventanas, exclusions
- Versionado de métricas (cambios auditables)
- Reutilización:
  - dashboards consumen métricas desde capa semántica, no SQL suelto

**Gate semántica (bloquea):**
- Cada dashboard calcula KPI diferente (sin gobernanza).
- No hay documentación de métricas (definición exacta).

### 3.2 Data products (contratos de datos)
Para cada data product:
- dueño (owner)
- SLA de freshness
- schema contract (campos, tipos)
- quality checks (DQ rules)
- consumers
- versión

**Gate data products (bloquea en self-serve):**
- No hay contratos; cambios rompen BI sin aviso.
- No hay owners ni SLAs.

### 3.3 Gobernanza y acceso
- Row-level security por tenant (B2B)
- Masking de PII
- Roles:
  - viewer / analyst / admin
- Auditoría de accesos (R2+)

**Gate access (bloquea):**
- BI expone datos cross-tenant por error.
- No hay policy de PII en datasets analíticos.

---

## 4) Feature store / ML data management (si hacen IA)
### 4.1 Requisitos (online/offline consistency)
- Features definidas una sola vez y reutilizables:
  - misma lógica para entrenamiento (offline) y serving (online)
- Timestamps y point-in-time correctness
- Versionado:
  - `feature_version`
  - `training_dataset_version`
- Lineage:
  - de qué tablas/eventos salen

**Gate ML data (bloquea):**
- Training usa features diferentes a producción.
- No hay point-in-time correctness (data leakage).

### 4.2 Feature registry (mínimo viable)
- `feature_name`
- descripción
- owner
- entidad (user/tenant/transaction)
- ventana (7d/30d)
- lógica (SQL/transform)
- freshness SLA
- validaciones (nulls, ranges, drift)

### 4.3 Drift y monitoreo (si ML en prod)
- data drift / concept drift (básico)
- performance monitoring (si labels existen)
- rollback de modelos y features

**Gate drift (bloquea en ML prod):**
- No hay monitoreo de inputs (drift).
- No hay versioning/rollback.

---

## 5) Calidad de datos y operaciones (platform-grade)
- DQ checks automáticos en pipelines:
  - schema, completeness, uniqueness, anomalies
- Quarantine + replay
- Observabilidad:
  - pipeline success rate
  - lag/freshness
  - costo por pipeline (si cloud)
- Runbooks:
  - backfill
  - schema change
  - incident de datos

**Gate ops data platform (bloquea):**
- Pipelines sin DQ checks.
- Fallos de pipelines sin alertas ni runbooks.

---

## 6) Cost & performance management (FinOps para data)
- presupuestos por proyecto/dataset
- particionado correcto para bajar scans
- retención por capa
- sampling en analítica exploratoria (cuando aplica)
- caching/materialized views para queries caras

**Gate cost (bloquea):**
- Se desconoce costo por query/pipeline.
- No hay políticas de retención y el storage crece indefinidamente.

---

## 7) Outputs obligatorios (por fase BMAD)
### BRIEF
- Data Platform Profile + consumers + freshness + supuestos

### MODEL
- Arquitectura Bronze/Silver/Gold
- Modelo estrella (facts/dims)
- Estrategia incremental (CDC/watermark)
- Semantic layer (métricas oficiales) + data products
- Feature store design (si aplica)

### ACTION
- Implementar ingestion + incremental loads + backfills
- Implementar modelos gold (fact/dim) + particionado
- Implementar semantic layer + catálogo de métricas
- Implementar gobernanza (RLS/masking)
- Implementar feature registry + online/offline sync (si ML)
- DQ checks + observabilidad + alertas

### DEPLOY
- Runbooks data ops
- SLOs de freshness
- Revisión de costos y optimizaciones periódicas

---

## 8) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Data Platform Profile**  
2) **Warehouse/Lakehouse Plan** (layers, star schema, partitioning, incremental)  
3) **BI Self-Serve Plan** (semantic layer, métricas gobernadas, data products)  
4) **Governance Plan** (RLS, masking, auditing, PII handling)  
5) **Feature Store Plan** *(si aplica)* (registry, online/offline, versioning, drift)  
6) **Data Ops Plan** (DQ checks, alerts, runbooks, backfills)  
7) **Cost Plan** (budgets, retention, optimizaciones)  
8) **Next Steps** (accionables)

---

## 9) Señales de deuda data platform (Windsurf debe advertir)
- BI con SQL libre sin métricas gobernadas (múltiples “verdades”).
- Full refresh costoso sin incremental/CDC.
- Tablas grandes sin particionado por tiempo.
- No hay RLS/masking en multi-tenant.
- ML con features distintas online vs offline (data leakage).
- Pipelines sin DQ checks, sin alertas y sin runbooks.
- Costos del data stack sin visibilidad.

---
**End of skill.**
