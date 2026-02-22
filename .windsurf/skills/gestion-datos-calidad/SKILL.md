---
name: gestion-datos-calidad
description: Skill para gestionar datos operacionales con calidad, gobernanza y auditoría como reglas de DQ, lineage, catálogo de datos, control de cambios, MDM ligero para merchants/categorías/tags, y trazabilidad por acción y entidad.
---

# 🗂️ Windsurf Skill — Gestión de Datos y Calidad (Operacional)
**Skill ID:** SK-DATA-OPS-001  
**Aplica a:** Todos los verticals; **crítico** en fintech/PFM/SMB, regtech, legaltech, health/med  
**Objetivo:** asegurar que los datos operacionales sean **confiables**, **gobernables** y **auditables**: reglas de calidad, lineage, catálogo, control de cambios; MDM ligero (merchants/categorías/tags); y auditoría por acción y entidad.

---

## 0) Data Ops Profile (output obligatorio)
Antes de diseñar/codificar, Windsurf debe fijar:

- **Scope:** operacional | analítico | ambos
- **System(s) of Record (SoR):** por entidad (ej. Transaction, Merchant, Category, Customer)
- **Data classes:** PII | PHI | financieros | evidencias | menores | pagos
- **Multi-tenant:** sí/no + nivel de aislamiento
- **DQ strictness:** Basic | Standard | Regulated (R3)
- **Audit level:** none | action-only | entity-versioning | immutable log
- **Catalog tool:** manual md | db tables | DataHub/Amundsen/otro
- **Change control:** PR-only | PR + approvals | PR + ADR + audit (R3)

> Gate: sin Data Ops Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Datos operacionales correctos antes de insights.**
2. **Reglas explícitas:** la “calidad” no se asume; se define y se prueba.
3. **Lineage mínimo siempre:** saber “de dónde vino” y “qué lo transformó”.
4. **MDM ligero:** normalizar entidades clave para evitar duplicados y análisis erróneo.
5. **Auditoría útil:** acción + entidad + antes/después (según riesgo).
6. **Control de cambios:** toda modificación de reglas/MDM/catálogo deja evidencia.

---

## 2) Data Quality & Data Governance
### 2.1 Reglas de calidad (DQ Rules)
Windsurf debe definir reglas por entidad (mínimo):
- **Completeness:** campos obligatorios (not null)
- **Validity:** rangos y formatos (fechas, montos, moneda)
- **Uniqueness:** claves naturales (external_ref, event_id, etc.)
- **Consistency:** invariantes cross-entity (sumas, estados válidos)
- **Timeliness:** freshness (si hay sync/import)
- **Integrity:** FK y constraints

**Formato de regla (obligatorio):**
- `DQ-<Entity>-<NNN>`
- Descripción
- Severidad: `S0` crítico | `S1` alto | `S2` medio | `S3` bajo
- SQL/logic de validación
- Acción: bloquear write | marcar warning | enviar a quarantine | corregir automático
- Owner (equipo responsable)

**Gate DQ (bloquea):**
- Entidades core sin reglas mínimas (completeness/validity/uniqueness).
- No hay decisión de “qué hacer” al fallar la regla.

---

### 2.2 Lineage (mínimo viable)
Windsurf debe implementar lineage al menos a nivel:
- **Fuente:** user/manual | import file | provider | internal service
- **Batch/Run:** `source_batch_id` / `job_run_id`
- **Transformación:** versión de regla/mapeo aplicada
- **Destino:** entity + record id

**Mínimos técnicos:**
- Campos estándar en entidades importadas/sincronizadas:
  - `source_type`, `source_provider`, `source_ref`, `source_batch_id`, `ingested_at`
  - `transformation_version` (cuando aplique)

**Gate lineage (bloquea):**
- Imports/sync sin `batch_id` o sin `source_ref`.
- Transformaciones sin versión.

---

### 2.3 Catálogo de datos (Data Catalog)
**Catálogo mínimo (puede ser markdown o tabla DB):**
- Entidad / tabla
- Descripción (Ubiquitous Language)
- Campos: tipo + sensibilidad (PII/finanzas)
- SoR
- Owners
- Retención/borrado (si aplica)
- Índices principales
- DQ rules aplicadas

**Gate catálogo (bloquea en R2+):**
- No hay listado de entidades core y sensibilidad.
- No hay owners definidos para datos críticos.

---

### 2.4 Control de cambios (Change Control)
**Reglas:**
- Cambios de schema/MDM/reglas DQ requieren PR
- Para `R2+`: aprobación de Tech Lead/QA (y PO si afecta negocio)
- Versionado de:
  - mapeos de importación
  - normalización de merchants/categorías
  - reglas de conciliación
  - reglas tributarias (si aplica)

**Gate change control (bloquea):**
- Cambios de reglas sin versionado.
- Cambios directos en prod sin PR/rollback.

---

## 3) MDM ligero (Master Data Management)
### 3.1 Objetivo
Reducir duplicados y variaciones en entidades “maestras” que afectan reportes y UX.

### 3.2 Dominios MDM mínimos (según producto)
- **Merchant/Counterparty:** normalización de nombre, alias, identificadores (MCC si existe)
- **Category:** taxonomía estable, jerarquías, mapeo proveedor→interna
- **Tags:** normalización, duplicados, casing
- (Opcional) **Accounts:** nombres consistentes, tipos

### 3.3 Modelo recomendado (operacional)
- `MasterMerchant` (canonical)
- `MerchantAlias` (alias → canonical_id, fuente, confianza)
- `Category` + `CategoryMapping` (source_category → internal_category)
- `Tag` + `TagAlias`

### 3.4 Reglas de normalización (mínimo)
- lowercase/trim
- eliminación de caracteres comunes (según estrategia)
- heurísticas de similitud (opcional): Jaro/Winkler, trigram
- “human-in-the-loop” para casos ambiguos (cola de revisión)

**Gate MDM (bloquea):**
- No existe entidad canónica (solo strings libres) para merchant/categorías en productos financieros.
- No hay política de resolución (auto vs manual) para colisiones.

---

## 4) Auditoría y trazabilidad (por acción y por entidad)
### 4.1 Niveles de auditoría (elegir según Risk Tier)
- **Level A — Action audit (mínimo):**
  - `who/what/when/where/outcome`
- **Level B — Entity diff audit (recomendado en PyMEs):**
  - antes/después (diff) por cambios relevantes
- **Level C — Immutable audit log (R3 / regulado):**
  - append-only + hash chain (si se requiere evidencia fuerte)

### 4.2 Modelo mínimo de audit log
- `audit_id`
- `occurred_at`
- `tenant_id`
- `actor_id` + `actor_role`
- `action` (create/update/delete/approve/export/login/etc.)
- `entity_type` + `entity_id`
- `request_id/correlation_id`
- `before` (opcional) / `after` (opcional) / `diff` (recomendado)
- `ip/device` (si aplica y permitido)
- `reason` (para overrides/aprobaciones)

**Reglas:**
- No registrar secretos.
- Minimizar PII en audit; usar referencias cuando sea posible.
- Exportaciones y acciones “sensibles” siempre auditadas.

**Gate auditoría (bloquea):**
- Acciones críticas (finanzas, configuración, export) sin audit log.
- Audit log con PII innecesaria o sin tenant/actor.

---

## 5) “Quarantine” y corrección operativa (recomendado)
Para DQ fallas severas, Windsurf debe proponer:
- Tabla/cola `quarantine_records`
- UI/endpoint de revisión
- Re-proceso idempotente
- Métricas: quarantine_rate, time_to_resolve

**Gate quarantine (bloquea en pipelines críticos):**
- Fallos de calidad se pierden o solo “se loguean” sin manejo.

---

## 6) Observabilidad de datos (operacional)
Métricas mínimas:
- DQ_fail_rate por regla y entidad
- dedupe_rate (imports/sync)
- MDM_merge_rate / alias_added_rate
- audit_event_rate + failures
- data_freshness (last_ingest_at)

Alertas:
- spikes de DQ failures
- stale data (no ingesta en X horas/días)
- aumento de duplicados

**Gate data observability (bloquea en R2+):**
- No hay métricas de fallas de calidad o freshness.

---

## 7) Test Strategy (obligatorio)
- Unit: normalización (merchant/category/tag), hashing/dedupe
- Integration: import/sync con batch_id + lineage + quarantine
- Golden datasets: duplicados, strings raros, formatos de fecha/monto
- Audit tests: acciones críticas generan eventos con campos mínimos
- Migration tests: cambios de schema no rompen DQ rules

**Gate QA data ops (bloquea):**
- Reglas DQ/MDM sin tests (golden datasets).

---

## 8) Outputs obligatorios (por fase BMAD)
### BRIEF
- Data Ops Profile + entidades core + sensibilidad + riesgos + supuestos

### MODEL
- Catálogo mínimo + SoR por entidad
- DQ rule set (mínimo por entidad)
- MDM model (canonical + alias/mapping)
- Auditoría level seleccionado + esquema

### ACTION
- Implementación de DQ checks (DB + app) + quarantine
- Implementación lineage (campos + batch runs)
- Implementación MDM (normalización + cola de revisión)
- Implementación audit logs (action/entity)
- Métricas y alertas data ops

### DEPLOY
- Dashboards data ops + runbook (DQ spike, stale data, duplicates)
- Control de cambios activo (PR + versioning)

---

## 9) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Data Ops Profile**  
2) **Data Catalog (mínimo)** + SoR por entidad  
3) **DQ Rules** (lista + severidad + acción)  
4) **Lineage Plan** (source/batch/transformation version)  
5) **MDM Plan** (merchants/categories/tags)  
6) **Audit Plan** (nivel A/B/C + esquema)  
7) **Observability Plan** (métricas/alertas)  
8) **Test Plan** (golden datasets)  
9) **Next Steps** (accionables)

---

## 10) Señales de deuda data ops (Windsurf debe advertir)
- “Calidad” sin reglas ni acciones ante fallos.
- Imports/sync sin batch_id, source_ref y dedupe.
- Strings libres para merchant/categorías sin canonicalización.
- Cambios de reglas sin versionado ni PR.
- Acciones críticas sin auditoría.
- Sin métricas de DQ/freshness/duplicates.

---
**End of skill.**
