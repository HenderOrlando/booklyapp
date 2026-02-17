---
name: data-reporting
description: Skill para diseñar e implementar pipelines de datos, KPIs, reporting y sistemas de insights/recomendaciones con calidad, deduplicación y trazabilidad
---

# 📊 Windsurf Skill — Data, Reporting & Insights
**Skill ID:** SK-DATA-001  
**Aplica a:** Fintech, Legaltech, Edtech, Healthtech, Retailtech, Proptech, Foodtech, Medtech, Regtech  
**Objetivo:** habilitar analítica confiable (eventos, KPIs, agregaciones), reporting escalable y un camino seguro hacia insights/recomendaciones (reglas → ML), con calidad, deduplicación y trazabilidad.

---

## 0) Data Profile (output obligatorio)
Antes de diseñar/codificar, Windsurf debe fijar:

- **Data scope:** product analytics | reporting business | both
- **Primary warehouse/store:** Postgres (inicio) | BigQuery/Snowflake/ClickHouse (luego) | otro
- **Event collector:** GA4 | Segment | RudderStack | custom | none (definir)
- **BI:** Metabase | Looker | Superset | custom dashboards | otro
- **Refresh:** real-time | near-real-time | daily
- **PII policy:** none | pseudonymized | encrypted | tokenized (definir)
- **Retention:** días/meses/años (definir)
- **Risk Tier:** R0–R3 (según regla base) + data classes (PII/PHI/finanzas/etc.)

> Gate: sin Data Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Métrica sin definición = ruido:** cada KPI debe tener fórmula, ventana y segmentación.
2. **Single source of truth:** definir sistema de record (SoR) para datos operacionales vs analíticos.
3. **Calidad primero:** dedupe, validaciones y lineage mínimo antes de “insights”.
4. **Privacidad por diseño:** minimización, pseudonimización y control de acceso.
5. **Incremental:** empezar con ELT ligero; escalar solo cuando el costo/beneficio lo justifique.
6. **Reproducibilidad:** reportes deben ser consistentes y auditables.

---

## 2) Data Modeling para analítica (eventos, KPIs, agregaciones)
### 2.1 Event taxonomy (obligatorio si hay analytics)
- Naming consistente: `verb_noun` (ej. `created_transaction`)
- Campos obligatorios por evento:
  - `event_id` (uuid)
  - `event_name`
  - `occurred_at` (UTC)
  - `actor_id` (o `user_id`)
  - `tenant_id` (si aplica)
  - `platform` (web/mobile)
  - `app_version`
  - `session_id` (si aplica)
  - `properties` (json tipado)

**Regla:** eventos deben ser **idempotentes** (dedupe por `event_id` o hash).

### 2.2 KPI catalog (output obligatorio)
Para cada KPI:
- **Nombre**
- **Definición**
- **Fórmula**
- **Ventana** (D1/D7/D30, MTD, etc.)
- **Dimensiones:** tenant, plan, cohort, canal, categoría, región, etc.
- **Guardrails:** métricas que no deben degradarse
- **Owner:** responsable

### 2.3 Agregaciones por periodo/categoría
- Granularidad estándar: **día/semana/mes** (definir)
- Dimensiones típicas:
  - categoría, subcategoría, merchant, account, currency, channel
- Estrategia:
  - materialized views / tablas agregadas incremental
  - snapshots (si reporting financiero/ledger)

**Gate modeling (bloquea):**
- No existe catálogo de KPIs (definiciones).
- Eventos sin schema mínimo o sin `occurred_at`.
- Agregaciones calculadas “on the fly” en rutas críticas sin plan de performance.

---

## 3) ETL/ELT (ligero al inicio)
### 3.1 ELT inicial recomendado (MVP)
- **Fuente:** DB operacional (SoR)
- **Destino:** schema analítico en el mismo Postgres (inicio)
- **Jobs:** nightly o near-real-time (según necesidad)
- **Transformaciones:** SQL/dbt-like (aunque sea manual al inicio)

### 3.2 Calidad de datos (mínimos)
- **Checks por tabla:**
  - not null en claves
  - rangos válidos (fechas, montos)
  - referential integrity (si aplica)
  - uniqueness (event_id, external_id)
- **Dedupe strategy:**
  - clave natural + ventana temporal
  - hash de campos relevantes
- **Backfill strategy:** re-procesar periodos sin duplicar

### 3.3 Lineage mínimo
- Documentar “de dónde sale cada métrica”
- Versionado de transformaciones (migraciones SQL)
- Auditoría de jobs (inicio/fin/filas procesadas/errores)

**Gate ETL/ELT (bloquea):**
- No hay deduplicación definida.
- No hay checks mínimos de calidad.
- Jobs sin observabilidad (logs/metrics) o sin reintentos.

---

## 4) Reporting (externo e interno)
### 4.1 Reporting “producto” (funnels/cohorts)
- Activation funnel y retention cohorts (D7/D30)
- Segmentación por plan, canal y plataforma

### 4.2 Reporting “negocio”
- Revenue, churn, MRR/ARR (si aplica)
- Unit economics: CAC (si hay data), LTV (modelo), margen
- Uso por tenant (B2B): seats, activity, limits

### 4.3 Reporting “operacional”
- Latencia, errores, fallos de jobs, lag de colas
- SLIs/SLOs visibles en dashboard

**Gate reporting (bloquea):**
- Reportes sin definición exacta (KPI catalog).
- Dashboards sin owner ni frecuencia de revisión.
- Métricas sin segmentación básica (plan/tenant/canal).

---

## 5) Insights y recomendaciones (opcional, luego)
> En orden de madurez: **Reglas → Heurísticas → ML**.

### 5.1 Reglas (primero)
- Detección simple:
  - gasto inusual vs promedio
  - presupuesto excedido
  - suscripciones duplicadas
  - ingresos irregulares
- Explicabilidad obligatoria:
  - “Por qué te lo digo” (features/rules)

### 5.2 ML (después, si hay data suficiente)
Casos típicos:
- **Anomalías:** isolation forest / z-score robusto / modelos bayesianos
- **Predicción:** series de tiempo (Prophet/ARIMA/LSTM según madurez)
- **Clustering:** segmentación de comportamiento

**Reglas ML (obligatorias si se usa):**
- Dataset versionado + entrenamiento reproducible
- Evaluación offline + monitoreo drift
- Fairness/robustez según vertical (especial cuidado en regtech/medtech)
- Controles: feature flags + rollback

**Gate insights/ML (bloquea):**
- No hay baseline reglas/heurísticas.
- No hay explicabilidad.
- No hay evaluación ni monitoreo post-deploy.
- Se usan datos sensibles sin policy/consent.

---

## 6) Dashboards internos (salud producto + revenue + cohortes)
### 6.1 Dashboard mínimo (siempre)
- **Producto:** activation, retention, DAU/WAU/MAU, conversion (si aplica)
- **Calidad:** crash/error rate, latency p95, incidents
- **Datos:** freshness (última carga), fail rate ETL, filas procesadas, dedupe rate

### 6.2 Cadencia
- Revisión semanal (producto)
- Revisión diaria/alertas (operación)

**Gate dashboards (bloquea):**
- No hay data freshness visible.
- No existen alertas para fallos de pipeline.
- Dashboards sin cadencia/owner.

---

## 7) Seguridad y privacidad de datos (mínimos)
- Pseudonimización de IDs (cuando aplique)
- Minimización de propiedades en eventos (no loggear PHI/PII innecesaria)
- Acceso por rol (RBAC/ABAC) a BI y datasets
- Retención y borrado (si aplica por jurisdicción/vertical)

**Gate data privacy (bloquea):**
- Eventos incluyen datos sensibles sin necesidad.
- No hay política de retención/borrado.

---

## 8) Test Strategy (mínimos exigibles)
- **Unit:** transformaciones críticas (si hay lógica)
- **Data tests:** constraints + uniqueness + freshness
- **Pipeline tests:** idempotencia y dedupe
- **KPI tests:** queries de validación (golden datasets)

---

## 9) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Data Profile**  
2) **Event Taxonomy + Schema** (mínimo)  
3) **KPI Catalog** (definiciones + fórmulas)  
4) **Aggregation Plan** (periodos/dimensiones/materialización)  
5) **ETL/ELT Plan** (pipelines, dedupe, calidad, backfill)  
6) **Insights Roadmap** (reglas → ML, con gates)  
7) **Internal Dashboards** (producto/negocio/operación)  
8) **Privacy & Access Plan**  
9) **Next Steps** (accionables)

---

## 10) Señales de deuda data (Windsurf debe advertir)
- KPIs sin definición formal.
- Eventos sin schema o con PII innecesaria.
- Dedupe inexistente (métricas infladas).
- Pipelines sin observabilidad ni retries.
- Dashboards sin freshness/owner.
- ML sin baseline reglas, sin explicabilidad, sin monitoreo.

---
**End of skill.**
