---
name: gobierno-de-arquitectura-diseno
description: Skill de gobierno de arquitectura y diseño que garantiza coherencia técnica y velocidad sostenible en productos multi-equipo mediante arquitectura de referencia, Tech Radar, ADRs, domain modeling avanzado y API Governance formal.
---

# 🏛️ Windsurf Skill — Gobierno de Arquitectura y Diseño del Sistema
**Skill ID:** SK-ARCH-GOV-001  
**Aplica a:** Productos con varios módulos/equipos/servicios (fintech, legaltech, health/med, regtech, edtech, retailtech, proptech, foodtech).  
**Objetivo:** mantener coherencia técnica y velocidad sostenible mediante: arquitectura de referencia + Tech Radar, ADRs para decisiones, event storming/domain modeling avanzado (bounded contexts + invariantes), y API Governance formal (OpenAPI/AsyncAPI, versionado y compatibilidad).

---

## 0) Architecture Governance Profile (output obligatorio)
Antes de producir estándares o decisiones, Windsurf debe fijar:

- **Stage:** MVP | Scale-up | Multi-team | Enterprise
- **Top domains:** (3–7) dominios del producto + áreas transversales
- **Architecture style:** modular monolith | microservices | híbrido
- **Integration style:** REST | GraphQL | Async (Kafka/NATS) | mixto
- **Tech constraints:** cloud/provider, lenguaje(s), compliance
- **Versioning stance:** SemVer, compatibilidad, deprecation windows
- **Decision cadence:** semanal/quincenal (ADR reviews)
- **Governance roles:** architect/tech lead, API owner, security, platform
- **Risk Tier:** R0–R3

> Gate: sin Architecture Governance Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Arquitectura como producto:** estándares deben habilitar delivery, no frenarlo.
2. **Decisiones trazables:** toda decisión relevante → ADR (trade-offs explícitos).
3. **Dominio primero:** bounded contexts e invariantes guían APIs, datos y eventos.
4. **Compatibilidad por defecto:** cambios breaking requieren plan de migración.
5. **Governance liviano pero real:** pocos artefactos, alta disciplina.

---

## 2) Arquitectura de referencia + Tech Radar
### 2.1 Arquitectura de referencia (Reference Architecture)
Windsurf debe producir y mantener:
- **C4 (nivel 1–3):**
  - Context, Containers, Components (mínimo)
- **NFRs y SLOs:** latencia, disponibilidad, seguridad, multi-tenant
- **Cross-cutting concerns:**
  - authn/authz
  - logging/metrics/tracing
  - idempotencia
  - outbox/inbox
  - caching
  - feature flags
- **Blueprints:** patrones oficiales:
  - servicio HTTP
  - consumer de eventos
  - módulo de dominio (hexagonal)
  - read model/reporting

**Gate reference architecture (bloquea):**
- Equipos implementan patrones distintos sin blueprint.
- Cross-cutting (auth/logging/idempotency) no está estandarizado.

### 2.2 Tech Radar (evaluación continua)
Formato recomendado (por item):
- **Nombre**
- **Estado:** Adopt | Trial | Assess | Hold
- **Contexto de uso**
- **Riesgos / mitigaciones**
- **Dueño** + **fecha revisión**

Reglas:
- toda nueva tecnología entra como **Assess/Trial**
- decisiones de “Hold” requieren ADR (por qué no)

**Gate tech radar (bloquea):**
- Se introduce tecnología crítica sin pasar por Assess/Trial.
- No hay dueños ni revisiones periódicas.

---

## 3) ADRs (Architecture Decision Records)
### 3.1 Cuándo se debe crear un ADR (trigger list)
- cambio de base de datos / mensajería / cloud
- patrón arquitectónico (monolito→microservicios, CQRS, etc.)
- contratos públicos (API breaking, eventos)
- decisiones de seguridad/compliance relevantes
- vendor lock-in significativo
- cambios en identidad/autenticación
- decisiones que afectan costo > X o riesgo > X

### 3.2 Estructura mínima de ADR (obligatoria)
- Title + Status (Proposed/Accepted/Deprecated/Superseded)
- Context (problema + restricciones)
- Decision
- Alternatives considered
- Consequences (trade-offs)
- Migration/rollout plan (si aplica)
- Links (issues/PRs/design docs)

### 3.3 Reglas de gobierno para ADRs
- owner (quién propone) + reviewer (arquitectura/seguridad)
- ADR index (catálogo)
- supresiones: “superseded by ADR-XXX” (nunca borrar)

**Gate ADR (bloquea):**
- Decisiones relevantes sin ADR.
- ADR sin trade-offs o sin alternativas.
- Breaking changes sin plan de migración.

---

## 4) Event Storming / Domain Modeling avanzado
### 4.1 Objetivo y outputs
Windsurf debe producir, por dominio:
- Bounded Contexts + mapas de contexto (context map)
- Ubiquitous language (glosario + términos prohibidos)
- Invariantes (reglas duras del dominio)
- Aggregates, entities, value objects
- Commands, domain events, policies/sagas
- Read models (queries/reporting)

### 4.2 Invariantes (obligatorio)
- Definir invariantes por aggregate:
  - “lo que nunca puede pasar”
- Señalar dónde se validan:
  - dominio (sync)
  - proceso (saga/policy)
- Pruebas: invariantes deben tener tests

**Gate domain invariants (bloquea):**
- Invariantes sin enforcement (solo “texto”).
- Reglas de negocio en controladores/infrastructure.

### 4.3 Decomposition rules (bounded contexts)
- Separación por:
  - lenguaje distinto
  - ritmo de cambio
  - ownership y dependencias
  - consistencia requerida
- Integración entre contexts:
  - eventos (preferido)
  - APIs (cuando necesario)
  - ACLs (anti-corruption layer) si hay legacy

**Gate bounded contexts (bloquea):**
- Contexts definidos sin criterios (solo módulos arbitrarios).
- Integraciones cross-context sin ACL/contratos.

---

## 5) API Governance formal (OpenAPI/AsyncAPI, versionado, compatibilidad)
### 5.1 Contratos (obligatorio)
- REST: **OpenAPI** por servicio (versionado)
- Async: **AsyncAPI** por stream/topic
- Catálogo central:
  - endpoints, eventos, owners, versiones, status (active/deprecated)

**Gate contracts (bloquea):**
- APIs sin OpenAPI/AsyncAPI actualizados.
- Eventos emitidos sin schema y sin owner.

### 5.2 Guías de versionado y compatibilidad
Reglas mínimas:
- **Backward compatible** por defecto:
  - agregar campos opcionales
  - no renombrar/eliminar sin deprecation
- Deprecation window:
  - anunciar → coexistencia → retirada
- Versioning strategy:
  - REST: /v1, /v2 o headers (definir)
  - Eventos: schema version + compatible evolution

**Gate versioning (bloquea):**
- Breaking changes sin deprecation window.
- Cliente forzado a actualizar “de golpe”.

### 5.3 Linting y contract testing (recomendado/obligatorio en escala)
- OpenAPI lint rules:
  - naming, pagination, error model, idempotency
- Contract tests:
  - consumer-driven contracts (Pact u otro)
  - schema validation en runtime (opcional)
- Compatibility checks en CI:
  - detectar breaking changes en PR

**Gate CI governance (bloquea en multi-team):**
- No hay validación de breaking changes en CI.
- Errores no estandarizados (cada API responde distinto).

### 5.4 Estándares de API (mínimo)
- Error model:
  - `code`, `message`, `details`, `correlation_id`
- Pagination:
  - keyset preferido + `next_cursor`
- Idempotency:
  - `Idempotency-Key` en writes transaccionales
- Observabilidad:
  - `correlation_id` y trazas
- Security:
  - OAuth2 scopes/roles + least privilege

**Gate API standards (bloquea):**
- Writes sin idempotency en operaciones críticas.
- No existe error model estándar.

---

## 6) Outputs obligatorios (por fase BMAD)
### BRIEF
- Architecture Governance Profile + dominios + riesgos + supuestos

### MODEL
- Reference architecture (C4 + cross-cutting blueprints)
- Tech Radar inicial (Adopt/Trial/Assess/Hold)
- Domain modeling pack (contexts + invariants + events)
- API governance spec (OpenAPI/AsyncAPI + versioning rules)

### ACTION
- Crear ADR template + ADR index + primer set de ADRs
- Documentar y publicar reference architecture + blueprints
- Ejecutar event storming (workshop) y capturar outputs
- Implementar OpenAPI/AsyncAPI generation + lint + CI checks
- Definir catálogo de APIs/eventos con owners

### DEPLOY
- Cadencia de reviews:
  - Tech Radar: mensual
  - ADR review: semanal/quincenal
  - API governance: por release
- Auditorías de compatibilidad + deuda de contratos

---

## 7) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Architecture Governance Profile**  
2) **Reference Architecture** (C4 + blueprints + cross-cutting)  
3) **Tech Radar** (items + estado + owners)  
4) **ADR Pack** (triggers, template, index, workflow)  
5) **Domain Modeling Pack** (bounded contexts, invariants, events, policies)  
6) **API Governance Spec** (OpenAPI/AsyncAPI, versioning, lint/CI, standards)  
7) **Next Steps** (accionables)

---

## 8) Señales de deuda de gobierno (Windsurf debe advertir)
- Nuevas tecnologías sin Tech Radar/ADR.
- Decisiones críticas sin ADR (trade-offs perdidos).
- Bounded contexts arbitrarios sin invariantes.
- APIs/eventos sin contratos versionados (OpenAPI/AsyncAPI).
- Breaking changes sin deprecation window.
- Falta de estándares (errores, paginación, idempotencia).
- CI sin checks de compatibilidad/contratos en multi-team.

---
**End of skill.**
