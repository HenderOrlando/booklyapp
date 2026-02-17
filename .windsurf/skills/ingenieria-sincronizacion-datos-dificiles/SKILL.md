---
name: ingenieria-sincronizacion-datos-dificiles
description: Skill para diseñar sincronización robusta con resolución de conflictos, estrategias offline multi-dispositivo, backfills para reconstrucción de datos históricos y data contracts formales.
---

# 🔁 Windsurf Skill — Ingeniería de Sincronización y Datos “Difíciles”
**Skill ID:** SK-SYNC-DATA-001  
**Aplica a:** Offline-first, multi-dispositivo, integraciones (bancos/ERP), importaciones masivas, event-driven y reporting histórico.  
**Objetivo:** diseñar sync robusto con resolución de conflictos (delta-sync, merge rules), estrategias offline multi-device (CRDTs cuando aplica), backfills/reprocesamiento para reconstruir agregados y reportes, y data contracts formales (schemas, evolución, validación).

---

## 0) Sync & Data Hardness Profile (output obligatorio)
Antes de diseñar sync o reprocesamiento, Windsurf debe fijar:

- **Data domains:** qué entidades sincronizan (transactions, budgets, notes, rules, etc.)
- **Sources:** app local | backend | bancos/ERP | imports | eventos
- **Offline mode:** none | read-only | full offline-first
- **Concurrency:** single device | multi-device | multi-user (B2B)
- **Consistency needs:** strong | eventual | mixed (por entidad/operación)
- **Conflict tolerance:** low (finanzas) | medium | high (notas)
- **Sync frequency:** realtime | periodic | manual
- **Payload size:** small | medium | large + límites (batching)
- **History:** requiere recalcular históricos (sí/no)
- **Contracts:** OpenAPI/AsyncAPI/JSON schema/Protobuf (definir)
- **Risk Tier:** R0–R3 (finanzas suele ser R2+)

> Gate: sin Sync & Data Hardness Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Dominio manda:** conflictos se resuelven por reglas de negocio, no solo timestamps.
2. **Delta por defecto:** evitar full sync salvo bootstrap o recovery.
3. **Idempotencia end-to-end:** sync, imports, jobs y eventos deben ser re-ejecutables.
4. **Trazabilidad total:** cada cambio debe tener `source`, `actor`, `device`, `timestamp`.
5. **Reprocesamiento seguro:** backfills no deben romper consistencia ni duplicar.
6. **Contracts estrictos:** payloads validados y evolución compatible.

---

## 2) Algoritmos de sync y conflicto
### 2.1 Delta-sync (recomendado)
Opciones válidas:
- **Cursor/Watermark:** `updated_at > cursor` (simple)
- **Change log / CDC:** log de cambios por entidad (robusto)
- **Vector clocks / per-entity version:** para multi-device (avanzado)

Requisitos mínimos:
- `server_cursor` (monótono por usuario/tenant)
- batch + pagination
- compresión (si payload grande)
- retries con backoff

**Gate delta-sync (bloquea):**
- Sync “full refresh” frecuente sin justificar (costo/latencia).
- No existe cursor/watermark ni paginación.

### 2.2 Conflictos: LWW vs merge rules por dominio
**Regla:** LWW solo para campos donde sea aceptable perder cambios (p.ej. preferencia UI).

Patrones por dominio:
- **LWW (OK):**
  - settings, last_opened_at, flags no críticos
- **Merge determinista:**
  - tags (set union), listas (por id), contadores (suma idempotente si aplica)
- **Conflicto explícito (human-in-the-loop):**
  - transacciones financieras editadas en dos dispositivos
  - cambios de categorías masivos
  - ajustes de saldo inicial

**Modelo recomendado:**
- `entity_version` + `field_versions` (si granular)
- `source_priority` (server > device, o por roles)
- `merge_policy` por entidad/campo

**Gate conflictos (bloquea):**
- Usar LWW para entidades financieras críticas sin justificar.
- No hay política por entidad/campo.

### 2.3 Merge rules (framework)
Windsurf debe definir por entidad:
- campos “autoridad servidor”
- campos “mergeable”
- campos “conflictable”
- acción ante conflicto:
  - auto-merge
  - crear “pending conflict” para resolver
  - rechazar y pedir refresh

**Salida obligatoria (tabla):**
- Entity | Field | Policy | Rationale | UX behavior

---

## 3) Offline multi-dispositivo y CRDTs (cuando aplica)
### 3.1 Cuándo usar CRDTs (criterios)
Usar CRDTs solo si:
- hay **edición concurrente real** (multi-user o multi-device)
- se requiere merge automático sin bloqueo
- tolerancia a consistencia eventual es aceptable

Ejemplos:
- notas/comentarios, listas compartidas, tags colaborativos

No recomendado (sin mucha justificación):
- ledger/transacciones “de dinero” (requieren invariantes fuertes)

### 3.2 Estrategias offline multi-device (sin CRDT)
- **Single-writer per entity:** lock lógico por entidad/dispositivo
- **Server-authoritative:** cliente propone cambios, server decide
- **Operational transforms / patch-based:** enviar diffs con preconditions
- **Conflict queue:** cambios offline se encolan y se reconcilian

**Gate offline multi-device (bloquea):**
- Edición concurrente en datos críticos sin estrategia (lock/preconditions/conflict UX).

### 3.3 Identidad de cambios (obligatorio)
Cada mutation debe llevar:
- `mutation_id` (ULID/UUIDv7)
- `entity_id`
- `actor_id`
- `device_id`
- `client_ts`
- `base_version` (optimistic concurrency)
- `patch` (ops) o `full entity` (si simple)

**Gate cambios (bloquea):**
- Mutations sin `mutation_id` → duplicados en retries.
- No hay `base_version` en escenarios con concurrencia.

---

## 4) Backfills y re-procesamiento (reconstrucción histórica)
### 4.1 Objetivos típicos
- reconstruir agregados (dashboards, budgets)
- recalcular reportes históricos por:
  - bug fix
  - nueva regla de negocio
  - cambio de categorías/merchant normalization
- reingesta de integraciones (banco/ERP) con dedupe

### 4.2 Diseño de reprocesamiento (mínimo)
- “Source of truth” definido (event log, OLTP, raw imports)
- Jobs idempotentes:
  - `job_id`
  - range (fecha/tenant)
  - checkpoints
- Estrategia:
  - rebuild en nueva tabla (shadow) → swap
  - o recalcular incremental con flags de “dirty periods”
- Auditoría:
  - before/after counts
  - invariantes (sumas, saldos)

**Gate backfill (bloquea):**
- Backfill que reescribe en sitio sin shadow/snapshot (alto riesgo).
- No hay invariantes ni validación post-job.

### 4.3 Reconstrucción de agregados (patrones)
- **Event replay:** from outbox/event store (si existe)
- **OLTP scan:** por rango temporal con particionado
- **Hybrid:** raw+correcciones

Buenas prácticas:
- limitar blast radius (por tenant y rango)
- rate limit para no tumbar producción
- programar en ventana de baja carga

---

## 5) Data Contracts (schemas, evolución, validación)
### 5.1 Contratos por canal (obligatorio)
- REST: OpenAPI
- Async events: AsyncAPI + schema (JSON Schema/Avro/Protobuf)
- Files (CSV/Excel): schema de import + reglas por columna

### 5.2 Reglas de evolución (backward compatible)
- agregar campos opcionales ✅
- no renombrar/eliminar sin deprecación ❌
- versionado:
  - `schema_version` en eventos
  - `api_version` por endpoint
- compatibilidad:
  - consumer puede ignorar campos nuevos
  - producer no rompe required fields

**Gate contracts (bloquea):**
- Eventos sin schema/version.
- Cambios breaking sin ventana de deprecación.

### 5.3 Validación de payloads (obligatorio)
- Validación al ingreso (API/event consumer):
  - schema validation
  - size limits
  - enum/range checks
- Dead-letter:
  - payload inválido → DLQ con razón
- Observabilidad:
  - métrica `invalid_payload_rate`

**Gate validation (bloquea):**
- Consumidores aceptan payloads “a ojo”.
- No existe DLQ para inválidos.

---

## 6) Observabilidad de sync y datos “difíciles”
Métricas mínimas:
- sync success rate
- conflict rate (por entidad)
- average sync lag
- delta size / payload size
- backfill duration + throughput
- invariant violations
- invalid payload rate (contracts)

Alertas:
- conflict spikes
- backlog/lag anormal
- invariant violations > 0
- DLQ creciendo

**Gate observabilidad (bloquea):**
- No se puede saber si sync está funcionando (sin métricas).
- Violaciones de invariantes no alertan.

---

## 7) Test Strategy (obligatorio)
- Unit:
  - merge policies por entidad/campo
  - idempotency de mutations
  - schema validation
- Integration:
  - delta-sync con paginación y retries
  - conflictos multi-device (simulados)
  - backfill (shadow rebuild) + invariantes
- Property-based tests (recomendado):
  - merge determinista (mismo input → mismo output)
  - commutativity/associativity (si CRDT/merge)

**Gate QA sync (bloquea):**
- Merge policies sin tests.
- Backfills sin pruebas de invariantes.

---

## 8) Outputs obligatorios (por fase BMAD)
### BRIEF
- Sync & Data Hardness Profile + entidades + riesgos + supuestos

### MODEL
- Estrategia delta-sync (cursor/log/CDC)
- Matriz de conflictos (policies por entidad/campo)
- Estrategia offline multi-device (CRDT o alternativa)
- Plan de backfills/reprocessing (shadow + invariantes)
- Data contracts (schemas + reglas de evolución + validación)

### ACTION
- Implementar delta-sync + paginación + retries
- Implementar mutation log + idempotency
- Implementar conflict handling + UX (si aplica)
- Implementar backfill framework + shadow rebuild
- Implementar schema validation + DLQ + métricas

### DEPLOY
- Dashboards sync/lag/conflicts
- Runbooks: conflict spikes, lag, backfill incidents
- Cadencia: revisión de contracts y compatibilidad

---

## 9) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Sync & Data Hardness Profile**  
2) **Delta-Sync Plan** (cursor/log/CDC, batching, retries)  
3) **Conflict Matrix** (entity/field policies + UX behavior)  
4) **Offline Multi-Device Strategy** (CRDT o alternativa + criterios)  
5) **Backfill/Reprocessing Plan** (shadow rebuild, invariantes, blast radius)  
6) **Data Contracts Plan** (schemas, evolución, validation, DLQ)  
7) **Observability Plan** (métricas/alertas)  
8) **Test Plan** (merge + backfills + contracts)  
9) **Next Steps** (accionables)

---

## 10) Señales de deuda en sync y datos “difíciles” (Windsurf debe advertir)
- Full sync frecuente sin delta/cursor.
- LWW aplicado a datos financieros críticos.
- Mutations sin `mutation_id`/`base_version` (duplicados y conflictos).
- Sin manejo UX de conflictos (silencioso).
- Backfills sin shadow ni invariantes.
- Eventos sin schema/version o sin validación.
- Sin métricas de lag/conflicts/DLQ/invariants.

---
**End of skill.**
