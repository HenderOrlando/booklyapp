---
name: gestion-ingenieria-delivery
description: Skill para gestionar documentación técnica (help center, changelog, release notes), deuda técnica con métricas y refactors planificados, y FinOps con presupuestos, alertas y costo por usuario activo.
---

# 🧭 Windsurf Skill — Gestión de Ingeniería y Delivery
**Skill ID:** SK-ENG-DELIVERY-001  
**Aplica a:** Todos los verticals; **crítico** cuando hay equipo y releases frecuentes  
**Objetivo:** mejorar ejecución y sostenibilidad: documentación operable (help center, guías, changelog), control de deuda técnica con métricas y refactors planificados, y FinOps para operar costos cloud con presupuestos/alertas y optimización por servicio (costo por usuario activo).

---

## 0) Engineering Delivery Profile (output obligatorio)
Antes de proponer procesos o cambios, Windsurf debe fijar:

- **Cadencia:** weekly | biweekly | monthly releases
- **Repos/monorepo:** sí/no + tooling (Nx, etc.)
- **Definition of Done:** incluye docs/QA/observabilidad (sí/no)
- **Docs surfaces:** help center | docs in-app | repo docs | changelog
- **Tech debt posture:** low | medium | high + hotspots
- **Cloud footprint:** AWS/GCP/Azure/Hetzner/on-prem + servicios principales
- **Cost drivers:** compute | DB | storage | egress | observability | queues
- **FinOps maturity:** basic | standard | advanced
- **Primary unit cost:** costo por usuario activo | por tenant | por transacción
- **Risk Tier:** R0–R3

> Gate: sin Engineering Delivery Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Docs son parte del delivery:** feature sin docs = feature incompleta (cuando aplica).
2. **Deuda técnica visible y priorizable:** se mide, se planifica, se paga.
3. **Costos como métrica de producto:** unit cost se monitorea como un KPI.
4. **Automatización por defecto:** release notes y changelog no deben ser “manuales”.
5. **Feedback loop:** incidentes y soporte alimentan deuda y roadmap.

---

## 2) Technical writing / documentación de producto
### 2.1 Superficies de documentación (mínimo viable)
- **Help Center (usuario):**
  - getting started
  - FAQ
  - troubleshooting (import/sync, errores comunes)
  - privacidad y datos (export/borrado, si aplica)
- **Guías (producto):**
  - flujos principales (paso a paso)
  - conceptos (categorías, presupuestos, cashflow)
- **Changelog (externo):**
  - cambios por versión
  - breaking changes (si aplica)
- **Release notes (interno/externo):**
  - qué se lanzó, impacto, rollout, flags, riesgos
- **Runbooks (interno):**
  - incident response
  - rollback
  - jobs críticos (imports/sync)

### 2.2 Estándares de calidad de docs
- Estructura consistente: propósito → pasos → screenshots (si aplica) → errores → FAQ
- Copy claro, sin jerga innecesaria
- Versionado: cada release actualiza changelog/release notes
- Búsqueda: tags/categorías
- Ownership: dueño por sección

**Gate docs (bloquea):**
- Feature que cambia comportamiento del usuario sin actualización de help center/changelog.
- Breaking change sin nota y sin plan de comunicación.

### 2.3 Automatización de docs (recomendado)
- Changelog desde commits (con convención) + PR labels
- Release notes desde pipeline (incluye flags y rollout)
- Checklist en PR: “Docs updated?” + link a página/archivo

**Gate docs automation (bloquea en cadencia alta):**
- Releases frecuentes sin release notes consistentes.
- No existe checklist de docs en PR.

---

## 3) Gestión de deuda técnica (métricas + refactors planificados)
### 3.1 Taxonomía de deuda (obligatoria)
- **Debt-Design:** arquitectura/contratos incorrectos
- **Debt-Code:** duplicación, complejidad, falta de tests
- **Debt-Data:** migraciones frágiles, queries lentas, modelos inconsistentes
- **Debt-Ops:** falta de observabilidad, deploy manual, DR débil
- **Debt-Security:** defaults inseguros, secretos, falta de hardening

### 3.2 Métricas mínimas (seleccionar y medir)
- **DORA:** lead time, deploy frequency, change failure rate, MTTR
- **Quality:** test coverage (útil pero no suficiente), flakiness, defect escape rate
- **Maintainability:** cyclomatic complexity hotspots, lint issues, duplication
- **Performance:** p95 latency, error rate, queue lag
- **Reliability:** incidents por release, SLA/SLO breaches
- **Security:** CVEs abiertas, tiempo de remediación

### 3.3 Proceso de gestión
- **Debt register** (backlog visible) con:
  - descripción, impacto, riesgo, esfuerzo, owner
  - “interest rate” (costo creciente de no hacerlo)
- **Capacity allocation:**
  - baseline 10–20% por sprint (ajustar según postura)
  - “refactor budget” por trimestre
- **Refactors planificados:**
  - objetivos medibles
  - plan incremental (no big-bang)
  - gates: mantener compatibilidad + tests + observabilidad

**Gate tech debt (bloquea):**
- No existe debt register con owners.
- Refactors grandes sin plan incremental ni criterios de éxito.
- Cambios de arquitectura sin ADR (cuando aplica).

---

## 4) FinOps (costos cloud)
### 4.1 Baseline FinOps (obligatorio)
- **Budgets y alertas:**
  - budget mensual por entorno
  - alertas 50/80/100%
- **Tagging/labels:**
  - service, env, owner, tenant (si aplica), cost-center
- **Dashboards:**
  - costo diario/semanal
  - top servicios por gasto
  - costo por entorno
- **Unit cost:**
  - costo por usuario activo (DAU/MAU) o por tenant/transacción

**Gate FinOps (bloquea):**
- No hay presupuestos ni alertas.
- Recursos sin tagging básico.
- No existe unit cost definido.

### 4.2 Optimización por servicio (playbook)
Windsurf debe revisar:
- Compute:
  - rightsizing (CPU/mem)
  - autoscaling
  - spot/preemptible (cuando safe)
- DB:
  - índices y queries
  - storage y retention
  - réplicas solo si necesarias
- Observability:
  - sampling (traces)
  - retención de logs
  - cardinalidad de métricas
- Storage:
  - lifecycle policies
  - compresión
- Egress:
  - caching/CDN
  - minimizar transfers entre regiones

### 4.3 Cost allocation y chargeback/showback (B2B)
- por tenant/plan:
  - límites de uso
  - cuotas y throttling
  - reportes de consumo
- “expensive features” identificadas y optimizadas

**Gate optimización (bloquea en crecimiento):**
- Observabilidad cuesta más que el producto (sin control).
- Egress inesperado sin diagnóstico.
- No se monitorea costo por usuario activo.

---

## 5) Outputs obligatorios (por fase BMAD)
### BRIEF
- Engineering Delivery Profile + objetivos (cadencia, calidad, costo) + supuestos

### MODEL
- Arquitectura de documentación (surfaces + ownership)
- Modelo de debt register + métricas
- FinOps model (tagging, budgets, unit cost)

### ACTION
- Implementar checklist docs en PR + generación de release notes
- Crear debt register + dashboard de métricas
- Configurar budgets/alerts + tagging
- Establecer unit cost pipeline (cost → DAU/MAU)

### DEPLOY
- Changelog y release notes por versión
- Reporte mensual de deuda (trend) + refactors ejecutados
- Reporte FinOps: top drivers + optimizaciones + unit cost

---

## 6) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Engineering Delivery Profile**  
2) **Docs Plan** (help center, guías, changelog, release notes, ownership, automatización)  
3) **Tech Debt Plan** (taxonomía, métricas, debt register, refactor roadmap)  
4) **FinOps Plan** (budgets/alerts, tagging, dashboards, unit cost, optimización)  
5) **Next Steps** (accionables)

---

## 7) Señales de deuda de delivery (Windsurf debe advertir)
- Releases sin changelog/release notes consistentes.
- Help center desactualizado vs producto real.
- Deuda técnica sin registro, sin owners, sin métricas.
- Refactors “big-bang” sin plan incremental.
- Cloud sin budgets/alertas/tagging.
- No existe costo por usuario activo/tenant (unit cost).

---
**End of skill.**
