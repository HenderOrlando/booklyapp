---
name: operacion-interna-equipo
description: Skill para estandarizar calidad y operación interna del equipo mediante QA data-driven con datasets y edge cases contables, property-based testing para invariantes de cálculos, y governance de releases con checklists y control estricto de regresiones financieras.
---

# 🧩 Windsurf Skill — Operación Interna del Equipo (QA Data-driven + Invariantes + Release Governance)
**Skill ID:** SK-TEAM-OPS-001  
**Aplica a:** Productos con cálculos financieros/contables, importaciones, reporting y riesgo de regresiones (B2C/B2B).  
**Objetivo:** estandarizar calidad y operación interna: QA data-driven con datasets y edge cases contables, property-based testing para invariantes de cálculos, y governance de releases con checklists y control estricto de regresiones financieras.

---

## 0) Team Ops Quality Profile (output obligatorio)
Antes de definir suites o reglas de salida, Windsurf debe fijar:

- **Critical money flows:** top 3–5 cálculos críticos (saldos, presupuestos, cashflow, deudas, FX, conciliación)
- **Data inputs:** manual, imports (CSV/OFX/QIF/PDF), open banking, ERP
- **Risk Tier:** R0–R3 (finanzas suele ser R2+)
- **Release cadence:** semanal/quincenal/mensual
- **Platforms:** mobile/web/backend
- **Testing stack:** unit/integration/e2e + frameworks
- **Environments:** dev/staging/prod + data masking
- **Owners:** QA lead, tech lead, product owner

> Gate: sin Team Ops Quality Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **“Correctness > features” en finanzas:** no se negocia integridad numérica.
2. **Tests con datos reales anonimizados:** edge cases no se inventan, se capturan.
3. **Invariantes como contratos:** property-based testing valida lo que “nunca debe romperse”.
4. **Release con gates:** no se publica si falla la suite financiera.
5. **Regresión financiera = incidente:** se trata como P0/P1 según impacto.

---

## 2) QA Data-driven (suites con datasets y edge cases contables)
### 2.1 Dataset Pack (obligatorio)
Windsurf debe mantener un “pack” versionado de datasets:
- `dataset_id`
- `domain` (transactions, budgets, FX, debts, reconciliation)
- `scenario` (edge case)
- `format` (JSON/CSV/SQL seed)
- `expected_outputs` (golden results)
- `notes` + `source` (anonimizado)
- `version`

Estructura recomendada:
- `datasets/base/` (casos típicos)
- `datasets/edge/` (casos extremos)
- `datasets/regression/` (bugs ya ocurridos)
- `expected/` (goldens por scenario)

**Gate datasets (bloquea):**
- Tests sin datasets reproducibles.
- No hay goldens/expected outputs.

### 2.2 Edge cases contables mínimos (checklist)
- Montos:
  - cero, negativos, reversos
  - grandes (overflow), muchos decimales (FX)
- Fechas:
  - fin de mes, leap day, DST (si aplica), tz boundaries
- Categorías:
  - uncategorized, split transactions, recategorización masiva
- Duplicados:
  - reimport, same-day same-amount different merchant
- Deudas:
  - intereses, pagos parciales, reestructuración
- FX:
  - tasas faltantes, redondeos, conversión histórica
- Conciliación:
  - diferencias de posted vs txn date
  - preautorización vs captura final
- Multi-tenant/B2B:
  - permisos, aislamiento, cierres por empresa

**Gate edge coverage (bloquea en R2+):**
- No hay escenarios para fin de mes, duplicados, reversos y FX.

### 2.3 Test harness data-driven
- Seeding:
  - cargar dataset → correr cálculo → comparar contra golden
- Reportes:
  - diff claro (campo por campo)
- Tooling:
  - snapshot tests para reportes
  - fixtures reutilizables

**Gate harness (bloquea):**
- Tests “ad-hoc” sin comparación automática con golden.

---

## 3) Property-based testing (invariantes para cálculos)
### 3.1 Invariantes financieras (obligatorias)
Windsurf debe declarar invariantes por dominio, por ejemplo:
- **Ledger/Saldo:**
  - `saldo_final = saldo_inicial + sum(credits) - sum(debits)`
- **Presupuesto:**
  - `spent <= spent + refund` (monotonía bajo reglas definidas)
  - `remaining = budget - spent` (con rounding consistente)
- **Doble partida (si aplica):**
  - `sum(debits) == sum(credits)` por asiento
- **FX:**
  - conversión reversible dentro de tolerancia definida (si policy lo permite)
  - no hay floats (precision/scale invariants)
- **Dedupe:**
  - reimport idempotente (no aumenta conteo)
- **Periodización:**
  - asignación a periodos consistente para tz/cutoffs

**Gate invariantes (bloquea):**
- No existen invariantes explícitos para cálculos core.

### 3.2 Generación de datos (property-based)
- Generadores:
  - montos con rangos + edge values
  - fechas con distribución (incluye boundaries)
  - categorías/merchants
  - FX rates con gaps controlados
- Shrinking:
  - cuando falla, reducir a caso mínimo reproducible
- Seeds:
  - guardar seeds de fallos como regression datasets

**Gate PBT (bloquea si se adopta):**
- No se guardan seeds/casos fallidos → no se aprende.

### 3.3 Dónde aplicar PBT (prioridad)
1) librería de Money/FX rounding
2) cálculo de saldos/cashflow
3) periodización y cutoffs
4) dedupe idempotente y merge policies

---

## 4) Release Governance (criterios de salida + checklist + control de regresión financiera)
### 4.1 Definición de “Release Gates” (obligatorio)
Un release pasa solo si:
- ✅ unit tests + integration tests verdes
- ✅ suite data-driven financiera verde (datasets + goldens)
- ✅ property-based tests (core invariants) verdes
- ✅ e2e smoke tests core flows
- ✅ migration checks (DB) + rollback plan
- ✅ observabilidad mínima activa:
  - crash-free sessions (mobile)
  - error rate/latency (API)
  - parsing/import error rate (si aplica)

**Gate release gates (bloquea):**
- Se publica sin suite financiera data-driven.
- No hay plan de rollback.

### 4.2 Checklist de release (mínimo)
- Version bump + changelog
- Feature flags:
  - defaults seguros
  - kill switch listo
- Migraciones:
  - forward + rollback verificado
- Compatibilidad:
  - API/backward compatible
  - schema/event contracts
- Seguridad:
  - secrets scan, dependency scan
- Datos:
  - backfill jobs (si aplica) con ventana y monitoreo
- Validación post-release:
  - health dashboards + canary checks

**Gate checklist (bloquea):**
- Cambios de cálculo/FX sin checklist y sin canary.

### 4.3 Control de regresiones financieras (policy)
Clasificación:
- **P0:** saldos incorrectos, pérdida/doble conteo de transacciones, FX errado
- **P1:** reportes inconsistentes, dedupe agresivo, import masivo fallando
- **P2:** UI/formatos

Acciones:
- P0:
  - freeze rollout
  - hotfix
  - comunicado + RCA
  - backfill/recompute (si aplica) con evidencia
- P1:
  - fix en 24–72h + rollback si escala
- P2:
  - backlog con prioridad

**Gate regression policy (bloquea):**
- No existe severidad y playbook para regresiones de dinero.

### 4.4 Release cadence y staging discipline
- Staging con datasets representativos (anonimizados)
- “Release candidate” build con tags
- Staged rollout (mobile) / canary (backend)

---

## 5) Artefactos operativos (obligatorios)
- **Quality dashboard:**
  - pass rate suites, flakiness, coverage de invariantes
- **Release notes template:**
  - cambios + riesgos + flags
- **Regression log:**
  - bugs financieros → dataset regression añadido
- **Runbooks:**
  - “saldo incorrecto”
  - “import duplicando”
  - “FX provider down”

**Gate artefactos (bloquea):**
- Bugs financieros recurrentes sin convertir en regression datasets.

---

## 6) Outputs obligatorios (por fase BMAD)
### BRIEF
- Team Ops Quality Profile + flows críticos + supuestos

### MODEL
- Dataset Pack design + edge case catalog
- Invariant catalog + PBT scope
- Release gates + checklist + severidad/regression policy

### ACTION
- Construir datasets + goldens + harness
- Implementar property-based tests en módulos core
- Implementar CI gates (bloqueo por suite financiera)
- Implementar release checklist + dashboards + runbooks

### DEPLOY
- Rituales:
  - weekly quality review
  - post-release review
- Expansión de datasets con cada incidente
- Reducción de flakiness y mantenimiento de suites

---

## 7) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Team Ops Quality Profile**  
2) **QA Data-driven Plan** (dataset packs, edge cases, goldens, harness)  
3) **Invariant Catalog** (por dominio)  
4) **Property-Based Testing Plan** (generators, seeds, scope)  
5) **Release Governance Plan** (gates, checklist, severidad, rollback)  
6) **Artifacts & Cadence** (dashboards, runbooks, regression log)  
7) **Next Steps** (accionables)

---

## 8) Señales de deuda (Windsurf debe advertir)
- Sin datasets reproducibles ni goldens para cálculos.
- Bugs financieros se arreglan sin crear regression dataset.
- Sin invariantes explícitos ni property-based tests en money/FX.
- Releases sin gates financieros y sin rollback plan.
- Tests flaky y no se mide flakiness.
- Staging sin data representativa (anonimizada).

---
**End of skill.**
