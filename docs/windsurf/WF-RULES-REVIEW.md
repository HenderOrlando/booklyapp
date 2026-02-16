# WF-RULES-REVIEW — Auditoría de implementación de Rules (Windsurf) + Skills (Repo → Coverage → Gaps)

> **Fuente de verdad de rules (Windsurf):** `.windsurf/rules/*`  
> **Objetivo:** auditar un repositorio (folder) contra ese set de **rules** y generar **1 archivo por rule** en `docs/rules-review/` con evidencia, score y plan de mejora, **indicando qué Skill debe ejecutar cada tarea**.

---

## 0) Skills disponibles (referencia rápida)

Este workflow **solo usa** skills disponibles en `skills.zip`:

| Uso en el workflow                                                                      | Skill (name)                              | Skill ID                 |
| --------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------ |
| Preparación, ejecución local, CI/CD, observabilidad mínima del proceso                  | `plataforma-build-deploy-operate-observe` | `SK-PLAT-OPS-001`        |
| Normalización/catálogo de rules y “calidad del inventario” (metadata, trazabilidad)     | `gestion-datos-calidad`                   | `SK-DATA-OPS-001`        |
| Mapeo arquitectura/gobernanza (taxonomía por dominios, patrones, ADR/API governance)    | `gobierno-de-arquitectura-diseno`         | `SK-ARCH-GOV-001`        |
| Inspección backend real (controllers/handlers/repos/events) y evaluación CQRS/Hexagonal | `backend`                                 | `SK-BE-API-001`          |
| Evaluación NFRs (concurrencia, idempotencia, resiliencia, consistencia)                 | `arquitectura-escalabilidad-resiliencia`  | `SK-SCALE-RES-001`       |
| Evaluación de pruebas, BDD Given-When-Then, gates de calidad                            | `qa-calidad`                              | `SK-QA-001`              |
| Hallazgos de seguridad, privacidad y cumplimiento (baseline)                            | `seguridad-privacidad-compliance`         | `SK-SEC-COMP-001`        |
| Hardening/controles extra (R2+/R3) cuando las rules lo exijan                           | `seguridad-avanzada`                      | `SK-SEC-ADV-001`         |
| Consolidación de resultados en formato “reporte” (tabla, KPIs de coverage)              | `data-reporting`                          | `SK-DATA-001`            |
| Documentación operable + criterios de salida + debt/plan de trabajo                     | `gestion-ingenieria-delivery`             | `SK-ENG-DELIVERY-001`    |
| Preparación para auditorías/certificaciones si las rules lo piden                       | `cumplimiento-certificaciones`            | `SK-COMPLIANCE-CERT-001` |

> **Nota:** si tu set de rules incluye copy/UX/legal disclaimers, puedes sumar `legal-product` (`SK-LEGAL-PRODUCT-001`) y/o `ux-ui` (`SK-UXUI-001`) **solo** para rules de esa naturaleza.

---

## 1) Outputs (artefactos)

```
docs/
  rules-review/
    README.md                       # índice + tabla de cobertura
    _inventory/
      folder-map.md                 # árbol + estadísticas + hallazgos
      file-stats.json               # metadata agregada
    _catalog/
      rules.normalized.json         # rules normalizadas desde .windsurf/rules/*
      rules.index.md                # lista por dominio/módulo
    _evidence/
      <RULE_ID>.json                # evidencias (paths, símbolos, tests, eventos)
    RULE-<DOMAIN>-<RULE_ID>.md      # 1 archivo por rule con gaps + plan
```

---

## 2) Rubrica de nivel de implementación (Score 0–5)

- **0 — No evidencias:** no hay handlers, endpoints, casos de uso, ni tests.
- **1 — Esqueleto:** DTOs/contratos o stubs, pero sin lógica completa.
- **2 — Parcial:** existe lógica, pero faltan validaciones/edge cases/errores.
- **3 — Funcional:** cumple flujo principal; faltan NFRs (idempotencia, observabilidad, resiliencia) o escenarios alternos.
- **4 — Completo con pruebas:** BDD (Given-When-Then) + unit/integration + errores consistentes.
- **5 — Production-grade:** 4 + eventos/AsyncAPI + trazas (OpenTelemetry) + logging (Winston) + métricas/alertas + documentación.

**Gates recomendados**

- Implementación sin tests ⇒ máximo **Score 3**.
- EDA sin idempotencia/dedupe (cuando aplica) ⇒ máximo **Score 3**.
- `Score <= 2` ⇒ marcar como **bloqueante** si es core del MVP.

---

## 3) Flujo general (Mermaid)

```mermaid
flowchart TD
  A[Leer .windsurf/rules/*] --> B[Inventory del repo]
  B --> C[Normalizar rules -> rules.normalized.json]
  C --> D[Rule->Code Mapping (controllers/handlers/repos/events/tests)]
  D --> E[Scoring 0-5 + gaps]
  E --> F[Generar RULE-<DOMAIN>-<RULE_ID>.md]
  F --> G[Generar README + tabla de cobertura]
```

---

# 4) Workflow paso a paso (con Skill por tarea)

## Fase 0 — Preparación (carpetas + verificación de rules)

### Tareas

1. Crear carpetas de salida.  
   **Skill ejecutor:** `plataforma-build-deploy-operate-observe` (`SK-PLAT-OPS-001`)

```bash
mkdir -p docs/rules-review/{_inventory,_catalog,_evidence}
```

2. Verificar que existan rules.  
   **Skill ejecutor:** `plataforma-build-deploy-operate-observe` (`SK-PLAT-OPS-001`)

```bash
ls -la .windsurf/rules
```

---

## Fase 1 — Analizar folder (inventario + organización)

### Tareas

1. Generar árbol + estadísticas del repo (extensiones, tamaños, hotspots).  
   **Skill ejecutor:** `plataforma-build-deploy-operate-observe` (`SK-PLAT-OPS-001`)  
   **Skill apoyo:** `gestion-datos-calidad` (`SK-DATA-OPS-001`) para clasificación y consistencia del inventario.

2. Identificar estructura Nx y mapa de dominios (apps/libs por módulo).  
   **Skill ejecutor:** `gobierno-de-arquitectura-diseno` (`SK-ARCH-GOV-001`)  
   **Skill apoyo:** `backend` (`SK-BE-API-001`) para reconocer patrones CQRS/Hexagonal reales.

### Artefactos

- `docs/rules-review/_inventory/folder-map.md`  
  **Skill ejecutor:** `gestion-ingenieria-delivery` (`SK-ENG-DELIVERY-001`) (documentación operable)
- `docs/rules-review/_inventory/file-stats.json`  
  **Skill ejecutor:** `gestion-datos-calidad` (`SK-DATA-OPS-001`)

---

## Fase 2 — Catalogar y normalizar rules (desde `.windsurf/rules/*`)

### Tareas

1. Leer/parsear rules (MD/JSON/YAML/TXT) desde `.windsurf/rules/*`.  
   **Skill ejecutor:** `gestion-datos-calidad` (`SK-DATA-OPS-001`)

2. Normalizar al modelo interno (id, domain, title, ACs, keywords, source_path).  
   **Skill ejecutor:** `gestion-datos-calidad` (`SK-DATA-OPS-001`)

3. Inferir/validar `domain` (auth/resources/availability/stockpile/reports/other) y mantener taxonomía consistente.  
   **Skill ejecutor:** `gobierno-de-arquitectura-diseno` (`SK-ARCH-GOV-001`)

### Artefactos

- `docs/rules-review/_catalog/rules.normalized.json`  
  **Skill ejecutor:** `gestion-datos-calidad` (`SK-DATA-OPS-001`)
- `docs/rules-review/_catalog/rules.index.md`  
  **Skill ejecutor:** `gestion-ingenieria-delivery` (`SK-ENG-DELIVERY-001`)

---

## Fase 3 — Rule vs Code (mapeo de evidencia)

### Tareas

1. Buscar evidencia por rule:
   - match por ID (si existe), keywords, rutas de dominio
   - patrones CQRS/Hexagonal/EDA
   - tests (`*.spec.ts`, `*.e2e-spec.ts`)  
     **Skill ejecutor:** `backend` (`SK-BE-API-001`)

2. Validar coherencia arquitectónica de la evidencia (ports/adapters, commands/queries, events).  
   **Skill ejecutor:** `gobierno-de-arquitectura-diseno` (`SK-ARCH-GOV-001`)

3. Cuando aplique, detectar NFRs en evidencia (idempotencia, retries, DLQ, consistencia).  
   **Skill ejecutor:** `arquitectura-escalabilidad-resiliencia` (`SK-SCALE-RES-001`)

### Artefacto por rule

- `docs/rules-review/_evidence/<RULE_ID>.json`  
  **Skill ejecutor:** `backend` (`SK-BE-API-001`)

> Regla crítica: **no inventar paths** — todo path debe existir.

---

## Fase 4 — Scoring + Gap Analysis (por rule)

### Tareas (descomposición recomendada)

1. Gap funcional vs criterios de aceptación (AC coverage).  
   **Skill ejecutor:** `backend` (`SK-BE-API-001`)

2. Gap de pruebas (BDD Given-When-Then, unit/integration/e2e/contract).  
   **Skill ejecutor:** `qa-calidad` (`SK-QA-001`)

3. Gap arquitectónico (Hexagonal/CQRS/EDA, contract/versioning, eventos).  
   **Skill ejecutor:** `gobierno-de-arquitectura-diseno` (`SK-ARCH-GOV-001`)

4. Gap de resiliencia/concurrencia/consistencia/idempotencia.  
   **Skill ejecutor:** `arquitectura-escalabilidad-resiliencia` (`SK-SCALE-RES-001`)

5. Gap de observabilidad mínima (logs estructurados, trazas, métricas).  
   **Skill ejecutor:** `plataforma-build-deploy-operate-observe` (`SK-PLAT-OPS-001`)

6. Gap de seguridad/privacidad/compliance (si la rule lo toca).  
   **Skill ejecutor:** `seguridad-privacidad-compliance` (`SK-SEC-COMP-001`)  
   **Escalamiento (R2+/R3):** `seguridad-avanzada` (`SK-SEC-ADV-001`)  
   **Auditoría/certs:** `cumplimiento-certificaciones` (`SK-COMPLIANCE-CERT-001`)

### Resultado

- `score 0..5` + lista priorizada de gaps (bloqueantes → importantes → nice-to-have)

---

## Fase 5 — Generar 1 archivo por rule (requisito final)

Crear: `docs/rules-review/RULE-<DOMAIN>-<RULE_ID>.md`

### Tareas

1. Redactar el documento por rule con:
   - resumen, evidencia, gaps, plan por capas, tests BDD, DoD  
     **Skill ejecutor:** `gestion-ingenieria-delivery` (`SK-ENG-DELIVERY-001`)  
     **Skill apoyo (tests):** `qa-calidad` (`SK-QA-001`)

### Plantilla recomendada (obligatoria)

```md
# <RULE_ID> — <TITLE>

## 1) Resumen

- Dominio: <domain>
- Score (0–5): <score>
- Estado: ✅ Completa | 🟡 Parcial | 🔴 No implementada

## 2) Evidencia encontrada (paths)

- Controllers:
- Handlers / Use cases:
- Domain:
- Persistence:
- Events:
- Tests:

## 3) Qué falta para cumplir al 100% (Gaps)

### Funcional (ACs pendientes)

- [ ] AC-1 …
- [ ] AC-2 …

### Reglas/Edge cases

- [ ] Conflictos / concurrencia / límites …
- [ ] Validaciones …

### Arquitectura (Hexagonal/CQRS/EDA)

- [ ] Falta CommandHandler/QueryHandler …
- [ ] Falta Port + Adapter …
- [ ] Falta evento(s) …

### Observabilidad / Operación

- [ ] Winston logs estructurados (campos mínimos: traceId, ruleId, userId…)
- [ ] OpenTelemetry spans relevantes
- [ ] Manejo de errores con códigos consistentes

## 4) Plan de corrección (acciones concretas)

> Ordenadas por capas

### Domain

1. …
2. …

### Application (CQRS)

1. Command/Query + Handler …
2. …

### Infrastructure

1. Repo adapter …
2. …

### Tests (BDD Jasmine)

- **Given** …
- **When** …
- **Then** …
  Casos mínimos:
- [ ] Happy path
- [ ] Alterno 1
- [ ] Alterno 2
- [ ] Seguridad/Permisos
- [ ] Concurrencia/duplicados (si aplica)

## 5) Definition of Done (DoD)

- [ ] Todos los ACs cubiertos
- [ ] Tests BDD pasan
- [ ] Eventos/documentación actualizada (si aplica)
- [ ] Observabilidad mínima aplicada
```

---

## Fase 6 — README de cobertura (índice final)

Generar `docs/rules-review/README.md`

### Tareas

1. Consolidar tabla de coverage (Rule/Dominio/Score/Estado/Link).  
   **Skill ejecutor:** `data-reporting` (`SK-DATA-001`)

2. Agregar resumen por dominio + top gaps por severidad.  
   **Skill ejecutor:** `gestion-ingenieria-delivery` (`SK-ENG-DELIVERY-001`)

---

# 5) Prompt listo para ejecutar en Windsurf (con skills)

```text
Objetivo: Ejecuta WF-RULES-REVIEW (Windsurf rules in .windsurf/rules/*) usando Skills explícitos.

Fase 0 (SK-PLAT-OPS-001):
1) Verifica .windsurf/rules/* y prepara docs/rules-review/*.

Fase 1 (SK-PLAT-OPS-001 + SK-DATA-OPS-001 + SK-ARCH-GOV-001):
2) Genera inventario del repo: folder-map.md + file-stats.json.
3) Identifica estructura Nx y mapa de dominios.

Fase 2 (SK-DATA-OPS-001 + SK-ARCH-GOV-001):
4) Parse y normaliza rules a rules.normalized.json + rules.index.md.

Fase 3 (SK-BE-API-001 + SK-ARCH-GOV-001 + SK-SCALE-RES-001):
5) Por cada rule: recolecta evidencia (controllers/handlers/domain/repos/events/tests) y escribe _evidence/<RULE_ID>.json.

Fase 4 (SK-QA-001 + SK-SEC-COMP-001 + SK-PLAT-OPS-001 + SK-SCALE-RES-001 + SK-ARCH-GOV-001 + SK-BE-API-001):
6) Asigna score 0..5 y gaps por categorías (funcional, tests, arquitectura, resiliencia, observabilidad, seguridad/compliance).

Fase 5 (SK-ENG-DELIVERY-001 + SK-QA-001):
7) Genera docs/rules-review/RULE-<DOMAIN>-<RULE_ID>.md por cada rule con la plantilla.

Fase 6 (SK-DATA-001 + SK-ENG-DELIVERY-001):
8) Genera docs/rules-review/README.md con tabla de cobertura y resumen por dominio.

Reglas:
- No inventes evidencias: todo path debe existir.
- Si domain no es explícito: infiere y marca ⚠️.
- Mantén consistencia de scoring con los gates.
```

---

## 6) Notas de consistencia

- **Dominio desconocido:** `other` + `⚠️` y documentar por qué no fue inferible.
- **Priorización de gaps:** funcional/AC → arquitectura → tests → NFRs (resiliencia/obs/sec).
- **Evitar alucinación:** si no existe evidencia, declarar “No encontrada” y score 0–1.
