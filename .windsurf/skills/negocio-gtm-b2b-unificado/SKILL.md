---
name: negocio-gtm-b2b-unificado
description: Skill unificada para Producto/Negocio + Operación Go-To-Market + Ventas/Crecimiento B2B. Vive fuera del set “core” de delivery técnico, pero se usa cuando se necesita alinear alcance, monetización, ICP, pricing, empaquetado, métricas y plan de lanzamiento sin frenar el delivery.
---

# 🧭 Windsurf Skill — Negocio + GTM Ops + Ventas/Crecimiento B2B (Unificado)

**Skill ID:** SK-GTM-B2B-001  
**Ubicación sugerida:** `skills/negocio-gtm-b2b-unificado/SKILL.md`  
**Aplica a:** Productos B2B SaaS / B2B2C con roadmap y necesidad de monetización/lanzamiento.  
**Objetivo:** Alinear ingeniería con negocio sin contaminar el “core técnico”: definir **ICP**, **propuesta de valor**, **empaquetado/precio**, **métricas**, **pipeline B2B**, **plan de lanzamiento** y **operación comercial** (CRM/playbooks), produciendo artefactos accionables que no bloqueen el delivery.

> Nota: este skill **no sustituye** arquitectura/QA/DevOps. Su función es reducir re-trabajo técnico por supuestos comerciales no explícitos.

---

## 0) Commercial Profile (output obligatorio)

Antes de entrar en planes o artefactos, Windsurf fija explícitamente:

### A) Producto / Negocio

- **Tipo de producto:** SaaS | Marketplace | Internal tool | Enterprise
- **Segmento:** Universidad/educación | salud | logística | fintech | otro
- **Modelo de ingresos:** suscripción | licencias | usage-based | comisión | híbrido
- **Buyer/Champion:** (roles) y “who signs”
- **Tiempo de valor (TTV):** inmediato | <7 días | <30 días
- **Sensibilidad a compliance:** baja | media | alta

### B) GTM Ops (operación comercial)

- **Canales prioritarios:** outbound | inbound | partners | marketplace | híbrido
- **Ciclo de venta:** <2 semanas | 2–8 semanas | >8 semanas
- **Motion:** self-serve | sales-assisted | enterprise
- **CRM:** HubSpot/Salesforce/Pipedrive/otro | none
- **Pricing readiness:** definido | parcial | desconocido

### C) Ventas / Crecimiento B2B

- **ICP (borrador):** tamaño, región, industria, presupuesto, triggers
- **Oferta inicial:** plan(es) + limitaciones + add-ons
- **Métrica norte (NSM):** 1 métrica principal
- **3 KPIs de salud:** (ej. activación, retención, conversión a pago)

> Gate: si falta info, Windsurf declara **supuestos “Hard”** + impacto (en alcance, arquitectura, costos o timeline). No se bloquea el delivery: se documenta y se procede.

---

## 1) Principios (no negociables)

1. **Delivery-first:** nada de esto debe frenar el avance técnico; se trabaja en paralelo.
2. **Single source of truth:** ICP, pricing, métricas y packaging viven en docs versionados.
3. **Empaquetado guía el scope:** features se priorizan por impacto en ICP/NSM.
4. **Métricas desde el día 1:** instrumentación mínima en MVP para validar hipótesis.
5. **Playbooks sobre improvisación:** ventas y onboarding deben ser repetibles.
6. **Experimentación segura:** cambios de pricing/packaging con control (flags/pilotos).

---

# PARTE I — PRODUCTO / NEGOCIO

## 2) ICP + Problema + Propuesta de Valor (1-pager)

Windsurf debe producir:

- **ICP:** firmographics + technographics + constraints + triggers
- **Jobs-to-be-done (JTBD):** top 3
- **Dolores y consecuencias:** (tiempo, dinero, riesgo)
- **Propuesta de valor:** 1 frase + 3 bullets
- **Diferenciadores:** 3–5 (comparables)
- **No objetivo (anti-ICP):** a quién NO vender

**Gate (bloquea decisiones de producto, no el delivery):**

- No hay ICP mínimo → se marca como riesgo de “scope drift”.

---

## 3) Packaging y Pricing (esqueleto)

Salida mínima:

- **Planes:** Free/Starter/Pro/Enterprise (o equivalente)
- **Límites por plan:** usuarios, sedes, recursos, reservas, integraciones, SLA
- **Add-ons:** (ej. auditoría avanzada, SSO, reportes premium)
- **Estrategia:** seat-based | usage-based | híbrida
- **Reglas de upgrades/downgrades:** y prorrateos (si aplica)
- **Descuentos:** anualidad, volumen, académico (si aplica)

**Gate (bloquea “Go Live” comercial):**

- No hay packaging → no se promete pricing; se lanza “piloto” con condiciones explícitas.

---

## 4) Métricas (NSM + funnel) y Telemetría mínima

Windsurf define:

- **NSM:** 1
- **Funnel:** visita → lead → demo → trial → activación → pago → expansión
- **KPIs mínimos:**
  - **Activación:** definición y umbral
  - **Retención:** 7/30/90 días según producto
  - **Expansión:** seats/uso/ingresos
- **Instrumentación mínima (MVP):**
  - eventos de activación (ej. “recurso creado”, “reserva confirmada”, “aprobación completada”)
  - tracking de origen (campaign/source) cuando aplique
  - cohortes básicas

**Gate (bloquea “growth claims”):**

- No hay definición de activación/retención → no se reporta “éxito”, solo “uso bruto”.

---

# PARTE II — GTM OPS (OPERACIÓN)

## 5) Sistema Operativo Comercial (CRM + pipeline + ownership)

Windsurf produce:

- **Pipeline stages:** Lead → Qualified → Demo → Proposal → Negotiation → Closed Won/Lost
- **Definition of Done por etapa**
- **Campos mínimos en CRM:**
  - ICP fit score, fuente, tamaño, usuarios esperados, fecha target, riesgos
- **RACI:** quién hace qué (producto/ventas/CS/ingeniería)
- **Cadencias:**
  - weekly pipeline review
  - monthly GTM retro (con métricas)

**Gate (bloquea escalamiento):**

- No hay pipeline/CRM mínimo → no se puede escalar outbound/inbound sin perder trazabilidad.

---

## 6) Onboarding & Customer Success (CS) mínimo

Windsurf define:

- **Onboarding checklist (D1/D7/D30)**
- **TTV plan:** pasos para llegar a activación
- **Health score (básico):** uso + tickets + NPS (si aplica)
- **Soporte:** SLAs, canales, horario
- **Riesgos de churn:** señales + acciones

**Gate (bloquea “venta enterprise”):**

- Sin onboarding repetible + SLAs → no se venden planes enterprise.

---

# PARTE III — VENTAS / CRECIMIENTO B2B

## 7) Playbooks de venta (outbound + inbound)

Windsurf produce:

- **Outbound sequences:** 3–5 pasos (email/LinkedIn/call)
- **Discovery script:** pain, urgency, stakeholders, budget, timeline
- **Demo script:** problema → historia → prueba → ROI → siguiente paso
- **Objection handling:** top 10 objeciones + respuestas
- **Competitor notes:** “si comparan vs X, decir Y”
- **Cierre:** propuesta + términos + next steps

**Gate (no bloquea delivery):**

- Si no hay playbooks, se permite venta “piloto”, pero se documentan aprendizajes.

---

## 8) Growth experiments (B2B) — backlog de hipótesis

Windsurf debe generar un backlog con:

- **Hipótesis** (si hacemos X, entonces Y)
- **Métrica objetivo**
- **Duración**
- **Esfuerzo** (S/M/L)
- **Riesgo**
- **Owner**
  Ejemplos:
- landing por vertical
- pricing page test (sin cambiar pricing real)
- piloto con 1 institución (case study)
- referral program B2B (partners académicos)

---

# 9) Outputs obligatorios (por fase BMAD)

### BRIEF

1. Commercial Profile
2. ICP 1-pager (borrador) + supuestos hard

### MODEL

3. Packaging/Pricing skeleton
4. Métricas: NSM + activación/retención + eventos mínimos
5. Pipeline + CRM fields + RACI + cadencias
6. Onboarding checklist (D1/D7/D30)

### ACTION

7. Playbooks (discovery/demo/objeciones)
8. Backlog de experimentos (10–20 items)
9. “Launch plan” (soft launch/piloto → GA)

### DEPLOY

10. Checklist de lanzamiento + “feedback loop” (ventas/CS → producto → ingeniería)

---

## 10) Formato obligatorio de salida (cuando se active este skill)

Windsurf debe responder con:

1. **Commercial Profile**
2. **ICP + Propuesta de Valor (1-pager)**
3. **Packaging/Pricing skeleton**
4. **Métricas + Telemetría mínima**
5. **Pipeline + CRM + RACI + cadencias**
6. **Onboarding/CS mínimo**
7. **Playbooks de ventas**
8. **Experimentos (backlog) + plan de lanzamiento**
9. **Riesgos & Supuestos Hard** (con impacto)

---

## 11) Señales de deuda (Windsurf debe advertir)

- “Scope creep” por no tener ICP/anti-ICP.
- Pricing prometido sin packaging formal.
- Sin definición de activación/retención → métricas inútiles.
- Ventas sin CRM/pipeline → pérdida de oportunidades y contexto.
- Onboarding improvisado → churn temprano.
- Sin playbooks → ventas no repetibles.
- Experimentos sin métricas → “actividad” sin aprendizaje.

---

**End of skill.**
