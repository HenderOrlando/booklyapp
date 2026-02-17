---
name: plataforma-build-deploy-operate-observe
description: Skill unificada para Plataforma (DevOps) + Confiabilidad Operativa (SRE) + Observabilidad Avanzada. Separa explícitamente responsabilidades en “Build/Deploy” vs “Operate/Observe”, con gates operativos, SLI/SLO+error budgets, tracing end-to-end (OTel), incident response, runbooks, postmortems, DR (RPO/RTO) y chaos testing selectivo.
---

# 🧭 Windsurf Skill — Plataforma: Build/Deploy + Operate/Observe (DevOps + SRE + Observabilidad)

**Skill ID:** SK-PLAT-OPS-001  
**Aplica a:** Todos los verticals; **obligatorio** en sistemas con async (colas/jobs/eventos), microservicios o R2+ (B2B crítico, PII, cumplimiento).  
**Objetivo:** entregar una plataforma **desplegable** y **operable**: CI/CD seguro, IaC, releases controlados, observabilidad accionable end-to-end, SLI/SLO con error budgets, gestión de incidentes (runbooks/postmortems), DR probado y resiliencia validada.

---

## 0) Platform Ops Profile (output obligatorio)

Antes de diseñar/codificar, Windsurf debe fijar explícitamente:

### A) Build/Deploy

- **Stage:** MVP | Growth | Scale | Regulated (R3)
- **Cloud:** AWS | GCP | Azure | Hetzner | on-prem | híbrido
- **Compute:** PaaS | containers | Kubernetes
- **IaC:** Pulumi | Terraform | otro (definir)
- **CI/CD:** GitHub Actions | GitLab CI | CircleCI | otro
- **Release model:** trunk-based | gitflow | release trains (definir)
- **Envs:** dev/staging/prod (+ preview envs si aplica)
- **Secrets:** KMS/Vault/SM/SSM (definir)
- **Registry:** GHCR/ECR/GCR/ACR/otro
- **Feature flags:** LaunchDarkly | Unleash | custom | none (definir)

### B) Operate/Observe

- **Critical journeys:** top 3 flujos que no pueden fallar
- **Topology:** monolito modular | microservicios | híbrido
- **Async paths:** colas | jobs | eventos | integraciones externas
- **Observability tooling:** OTel Collector + (Datadog/NewRelic/Grafana/etc.) + logs (ELK/Loki) + metrics (Prom/Cloud)
- **SLIs candidatos:** latency, availability, error rate, freshness, queue lag, correctness (si aplica)
- **On-call:** 24/7 | extendido | laboral + escalamiento
- **Noise level:** low/medium/high (con ejemplos)
- **DR targets:** RPO/RTO (definir)
- **Risk Tier:** R0–R3

> Gate: sin Platform Ops Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)

1. **Everything as code:** infra, pipelines y config (sin clicks).
2. **Safe deploys:** rollout controlado + rollback/kill-switch reales.
3. **Observability-first:** sin logs/métricas/traces accionables no hay operación real.
4. **Alertas accionables:** toda alerta debe tener owner + runbook + severidad.
5. **SLOs gobiernan el delivery:** error budgets definen cuánto riesgo se puede tomar.
6. **DR probado:** backup sin restore test = “no existe”.
7. **Resiliencia verificable:** fallos realistas se prueban (chaos selectivo).

---

# PARTE I — BUILD / DEPLOY

## 2) CI/CD (pipelines, versionado, releases, gates)

### 2.1 Pipeline mínimo (obligatorio)

- **Static checks:** lint, format
- **Tests:** unit + integration (según módulo)
- **Build:** artifact + container image
- **Security:** SCA (deps), secret scanning, (SAST recomendado en R2+)
- **Publish:** registry (image/npm/etc.)
- **Deploy:** staging → prod con approvals (según Risk Tier)
- **Release notes:** auto o checklist

### 2.2 Versionado y migraciones

- SemVer (o calver) + tags
- Migraciones DB compatibles (expand/contract)
- “Release artifact immutability” (mismo artifact = mismo deploy)

### 2.3 Progressive delivery (según riesgo)

- `R1+`: staging obligatorio
- `R2+`: canary o blue/green recomendado
- Rollback plan: app + DB (o forward fix con feature flags)

### 2.4 Feature flags (obligatorio para cambios riesgosos)

- Flags para:
  - features nuevas
  - integraciones externas
  - cambios de schema/query
- **Kill switch** documentado (runbook)

**Gate CI/CD (bloquea):**

- Deploy a prod sin tests/build verificables.
- No hay rollback/kill switch definido.
- Cambios de alto riesgo sin feature flag.

---

## 3) Infra & Runtime (IaC, contenedores, K8s/PaaS)

### 3.1 Elección de plataforma (progressive complexity)

- **PaaS (inicio):** menor carga operativa
- **Containers (medio):** control + portabilidad
- **Kubernetes (escala):** solo si hay drivers reales (multi-servicios, autoscaling, compliance, workloads)

### 3.2 IaC (Pulumi/Terraform)

- Estructura por entornos (dev/staging/prod)
- Estado remoto + locking (si aplica)
- Módulos/componentes reutilizables
- Secrets fuera del repo (KMS/Vault/SM)

### 3.3 Contenedores (mínimos)

- Multi-stage builds + imágenes minimalistas
- SBOM (recomendado R2+)
- Escaneo de imágenes (recomendado)

### 3.4 Kubernetes (si aplica)

- Requests/limits definidos
- Readiness/liveness probes
- HPA cuando tenga sentido
- Network policies (R2+)
- ConfigMaps/Secrets gestionados correctamente

**Gate Infra (bloquea):**

- Infra manual sin IaC.
- Secrets en repo/manifests.
- K8s sin requests/limits y probes.
- No hay separación real de entornos.

---

## 4) Seguridad de plataforma (mínimos)

- IAM least privilege
- Separación de roles (deploy vs ops) en R2+
- Auditoría de cambios (pipeline + IaC plan/apply)
- DB/colas no públicas sin justificación
- Rotación/expiración de credenciales donde aplique

**Gate platform security (bloquea):**

- Permisos amplios sin justificación.
- DB expuesta públicamente sin necesidad.
- Sin auditoría de cambios en infra.

---

# PARTE II — OPERATE / OBSERVE

## 5) Observabilidad end-to-end (logs, métricas, trazas, dashboards)

### 5.1 Estándar mínimo (obligatorio)

- **Logs estructurados** (JSON):
  - `trace_id`, `span_id`, `request_id`
  - `tenant_id` (si aplica), `actor_id` (si aplica)
  - `outcome`, `error_code`
- **Métricas RED/USE**:
  - request rate, error rate, duration (p95/p99)
  - saturación CPU/mem (contextual, no paging por sí sola)
- **Tracing distribuido (OpenTelemetry)**

### 5.2 Correlación total (request→job→evento→DB)

Campos estándar recomendados:

- `trace_id`, `span_id` (OTel)
- `correlation_id` (externo/usuario; si aplica)
- `job_id`, `event_id`, `message_id`
- `idempotency_key` (si aplica)

Reglas:

- Propagar `traceparent` por:
  - HTTP/gRPC
  - colas/eventos (headers/metadata)
  - jobs internos
- Instrumentar spans mínimos:
  - `http.server`
  - `domain.usecase`
  - `db.query`
  - `queue.publish` / `queue.consume` (con links)
  - `external.http`
  - `retry` + estado de circuit breaker (si aplica)

### 5.3 Sampling (cost-aware)

- 100% para:
  - errores
  - latencias > p99 threshold
  - rutas críticas
- 1–10% para tráfico normal (ajustable)
- Tail-based sampling en collector (si disponible)

### 5.4 Dashboards de operación (obligatorio)

- **Journey dashboard:** SLIs por flujo crítico (con breakdown por tenant/region si aplica)
- **Dependency dashboard:** terceros + colas + DB health (en contexto)
- **Error dashboard:** top error signatures + traces
- **Deploy dashboard:** correlación releases ↔ incidentes (change failure rate)

**Gate Observability (bloquea):**

- No hay `trace_id` en logs.
- Tracing no cubre hops async (publish/consume/jobs).
- No se puede ir de alerta → dashboard → trace → logs.

---

## 6) SRE: SLI/SLO, error budgets, alertas accionables (noise control)

### 6.1 SLIs por journey (mínimo)

- Availability, latency (p95/p99), error rate
- Queue lag/backlog (si hay colas)
- Freshness (si hay sync/import)
- Correctness (si hay invariantes de negocio)

### 6.2 SLOs (targets numéricos + ventana)

- Definir SLO por ruta crítica (mensual/semanal)
- Ejemplos (ajustables):
  - Availability 99.9% mensual (core)
  - p95 < 300ms (reads core), p95 < 800ms (writes core)
  - queue lag p95 < 2 min

### 6.3 Error budgets (política de delivery)

- Conectar SLO → release gates:
  - budget < X% → solo hotfix
  - budget OK → releases normales
- Revisiones mensuales (ajuste SLO/alertas)

### 6.4 Alertas (síntoma-first) + dedupe + burn-rate

- Alertar por **síntomas (SLIs)**:
  - spikes de error rate
  - spikes de p95/p99
  - breach de queue lag
  - freshness vencida
  - violación de invariantes (si aplica)
- Dedupe y agrupación:
  - service + endpoint + firma de error
  - tenant/region (si aplica)
- Burn-rate recomendado para paging (menos flapping)

**Gate alerting (bloquea):**

- Paging por CPU/mem sin vínculo a SLI.
- Alertas sin owner/runbook.
- “Alert storms” sin dedupe/agrupación.

---

## 7) Incident Response (on-call, runbooks, postmortems, RCA)

### 7.1 Roles mínimos

- **Incident Commander (IC)**
- **Comms Lead**
- **SME**
- **Scribe**

### 7.2 Severidad (obligatoria)

- **SEV0:** seguridad/privacidad, pérdida/corrupción de datos
- **SEV1:** core caído / resultados incorrectos masivos
- **SEV2:** degradación significativa
- **SEV3:** impacto menor/localizado

### 7.3 Runbooks (obligatorios)

Runbooks mínimos:

- latencia p95 alta (API)
- DB saturation/slow queries
- cola backlog/DLQ
- integración externa con timeouts/rate limits
- rollback/kill switch

### 7.4 Postmortems (obligatorio SEV0/SEV1)

- Resumen + impacto + timeline
- Root cause + contributing factors
- Acciones correctivas (owner + deadline + verificación)
- Evidencia (dashboards/traces/logs/PRs)

### 7.5 RCA + taxonomía (closing the loop)

- Metodología: 5 Whys / Fishbone / Fault Tree / STAMP (definir)
- Taxonomía:
  - tipo (latency/availability/correctness/security/etc.)
  - origen (code/config/infra/vendor/data/process)
  - blast radius
  - detectabilidad
  - prevenibilidad
- Cadencias:
  - weekly incident review
  - monthly reliability review

**Gate ops (bloquea):**

- No existe runbook de rollback/kill switch.
- SEV0/SEV1 sin postmortem con acciones rastreables.

---

## 8) Backups y DR (RPO/RTO + restore probado)

### 8.1 Definir objetivos

- **RPO:** cuánto dato puedo perder
- **RTO:** cuánto tiempo puedo estar caído

### 8.2 Reglas duras

- Backups automatizados (DB + object storage + config crítica)
- Encriptación + control de acceso
- Restore runbook documentado
- **Restore test periódico**:
  - R2+: mensual mínimo
  - R3: semanal recomendado

**Gate DR (bloquea):**

- No hay RPO/RTO definidos.
- No hay pruebas de restauración.

---

## 9) Resiliencia validada (chaos testing selectivo)

### 9.1 Alcance y guardrails

- Iniciar en **staging**
- Componentes típicos:
  - integraciones externas (timeouts/5xx)
  - colas (delay/duplication/drop)
  - cache (eviction/latency)
  - red (packet loss)
- Definir blast radius + abort plan

### 9.2 Experimentos mínimos

- Timeout externo → circuit breaker abre + degradación controlada
- Duplicación de mensajes → consumer idempotente
- Cache down → fallback a DB sin romper SLO (o degradación aceptada)

**Gate chaos (bloquea en R2+ con integraciones críticas):**

- No se prueba tolerancia a fallos en rutas críticas.
- No existen timeouts/retries/circuit breakers antes del chaos.

---

## 10) Outputs obligatorios (por fase BMAD)

### BRIEF

- Platform Ops Profile + riesgos + supuestos hard

### MODEL

- Diseño de CI/CD + release strategy
- Diseño de IaC + env separation
- Observabilidad end-to-end (correlación + spans + sampling)
- SLIs/SLOs + error budgets policy
- IR plan (severidad, runbooks, postmortems) + RCA/taxonomía
- DR design (RPO/RTO)
- Chaos plan (selectivo)

### ACTION

- Implementar pipelines + gates
- IaC (stacks/entornos) + deploy reproducible
- Instrumentación OTel + dashboards + alertas (dedupe/burn-rate)
- Runbooks + plantillas postmortem + tracking de acciones
- Backup/restore automation + restore tests
- Chaos drills en staging + registro de resultados

### DEPLOY

- Checklist rollout/rollback/kill switch
- Evidencia de restore tests
- Cadencia de reliability/incident review + noise reduction

---

## 11) Formato obligatorio de salida (cuando se active este skill)

Windsurf debe responder con:

1. **Platform Ops Profile**
2. **Build/Deploy Plan** (CI/CD, releases, IaC, envs, security hardening)
3. **Operate/Observe Plan** (OTel end-to-end, dashboards, alerting, SLI/SLO, error budgets)
4. **Incident Response Plan** (roles, severidad, runbooks, postmortems, RCA/taxonomía)
5. **Backup & DR Plan** (RPO/RTO + restore tests)
6. **Resilience Plan** (chaos selectivo + guardrails)
7. **Next Steps** (accionables)

---

## 12) Señales de deuda (Windsurf debe advertir)

- Deploy a prod manual o sin rollback/kill switch.
- Infra sin IaC o secrets en repo/manifests.
- Tracing parcial (no enlaza async jobs/colas/eventos).
- Logs sin `trace_id` → RCA lento/impreciso.
- Alertas por “causas internas” sin SLIs (ruido).
- Alert storms sin dedupe/agrupación.
- No existen SLIs/SLOs ni política de error budget.
- SEV0/SEV1 sin postmortems con acciones verificables.
- Backups sin restore test.
- Integraciones críticas sin timeouts/retries/CB ni drills.

---

**End of skill.**
