---
name: ingenieria-de-producto
description: Skill para diseñar y ejecutar experimentos de producto (A/B testing, feature flags, paywall optimization) con instrumentación correcta, métricas definidas, guardrails éticos y behavioral design responsable.
---

# 🧪 Windsurf Skill — Ingeniería de Producto (Experimentación)
**Skill ID:** SK-PROD-EXP-001  
**Aplica a:** Todos los verticals; **muy útil** en productos de consumo y suscripción (PFM/fintech, edtech, health/med, retail)  
**Objetivo:** ejecutar experimentos de producto con rigor suficiente (A/B, multivariante simple), instrumentación correcta, feature flags orientadas a tests, optimización de paywall/pricing, y behavioral design (nudges) sin caer en dark patterns.

---

## 0) Experimentation Profile (output obligatorio)
Antes de proponer o implementar un experimento, Windsurf debe fijar:

- **North Star metric:** (1) métrica primaria del producto
- **Funnel target:** activation | conversion | retention | revenue | engagement
- **Population:** nuevos usuarios | activos | segmento específico | tenants (B2B)
- **Unit of randomization:** user | device | tenant | session
- **Experiment type:** A/B | multivariante simple | holdout | phased rollout
- **Tooling:** LaunchDarkly/Unleash/custom flags + Amplitude/Mixpanel/GA4 (definir)
- **Guardrails:** métricas que no deben degradarse (crash rate, churn, refunds, CS tickets)
- **Risk Tier:** R0–R3 (paywalls y pricing suelen ser R1/R2)

> Gate: sin Experimentation Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Hipótesis explícita:** qué cambia, por qué, y qué métrica mueve.
2. **Un cambio dominante por experimento:** evitar mezclar señales.
3. **Instrumentación primero:** sin eventos correctos, no hay experimento.
4. **Guardrails obligatorios:** no “ganar” rompiendo confianza/soporte.
5. **Feature flags = infraestructura de experimentos:** asignación, targeting, kill switch.
6. **Ética:** nudges sí; manipulación/dark patterns no.

---

## 2) Diseño de experimentos (A/B testing)
### 2.1 Especificación mínima del experimento (obligatoria)
- `EXP-<AREA>-<NNN>` nombre
- Hipótesis (causal)
- Variantes (A control, B tratamiento, opcional C)
- Métrica primaria + definición exacta
- Guardrails (3–5)
- Segmentos incluidos/excluidos
- Unidad de randomización (user/tenant)
- Duración o criterio de parada (no solo “2 semanas”)
- Plan de análisis (cómo se decide ganador)

**Gate experiment spec (bloquea):**
- No hay métrica primaria definida con fórmula.
- No hay guardrails.
- No hay unidad de randomización (riesgo de contaminación).

### 2.2 Randomización y exposición
- Sticky assignment (misma variante para el mismo user/tenant)
- Exposición controlada (solo si el usuario entra al flujo)
- Evitar “peeking” constante (ver sección power)

### 2.3 Power básico (sin volverse estadístico extremo)
Windsurf debe declarar:
- **Baseline rate** (estimación)
- **MDE** (mínimo efecto detectable) razonable
- **Alpha** (ej. 0.05) y **power** (ej. 0.8) como defaults
- Si no hay números: usar rangos y justificar limitaciones

**Reglas prácticas:**
- Si tráfico bajo: usar **holdouts** + métricas de proxy, o tests más largos
- Preferir “señales fuertes” (conversion/activation) sobre micro-métricas

**Gate power (bloquea en decisiones grandes):**
- No hay baseline ni MDE (aunque sea aproximado).
- Se decide ganador con 20 usuarios sin contexto.

---

## 3) Feature flags orientadas a tests
### 3.1 Requisitos de flags (obligatorios)
- Targeting por:
  - % rollout
  - segmento (nuevo/activo), plataforma, país, plan, tenant
- Sticky bucketing
- Kill switch inmediato
- Auditoría de cambios (quién/cuándo)
- Separación por entorno (dev/staging/prod)

### 3.2 Anti-patterns
- Flags sin expiración (“flag debt”)
- Flags que cambian contratos de backend sin versionado
- Flags que rompen consistencia de datos (ej. pricing diferente sin guardar contexto)

**Gate flags (bloquea):**
- No existe kill switch.
- Asignación no es sticky (experimento contaminado).
- No hay auditoría/owner y fecha de retiro.

---

## 4) Pricing & Paywall Optimization
### 4.1 Componentes del sistema (mínimo)
- **Paywall placements:** dónde aparece (onboarding, feature gate, report)
- **Plans:** free/pro/premium (ejemplo) + límites (features/uso)
- **Trials:** duración, condiciones, conversión
- **Grace periods:** para fallos de pago o expiración (reduce churn)
- **Dunning:** reintentos, mensajes, escalamiento
- **Entitlements:** fuente de verdad (server-side)

### 4.2 Experimentos típicos (permitidos)
- Planes/bundles (A: 2 planes vs B: 3 planes)
- Trial length (7d vs 14d)
- Paywall copy/benefits order
- Pricing display (mensual vs anual por defecto)
- Grace period (0d vs 3d) para evitar churn por pagos fallidos

### 4.3 Métricas paywall (definiciones)
- View → Click CTA → Start trial → Subscribe → Retain D30
- ARPU/ARPPU, MRR, churn, refunds/chargebacks (si aplica)
- Guardrails:
  - soporte/tickets
  - reseñas negativas
  - cancelaciones tempranas

**Gate paywall/pricing (bloquea):**
- Entitlements solo en cliente (riesgo fraude).
- Cambios de pricing sin compatibilidad con usuarios existentes (grandfathering/plan migration).
- No hay tracking de funnel del paywall.

---

## 5) Behavioral Design (Finanzas): nudges, hábitos, fricción, gamificación sobria
### 5.1 Principios éticos (no negociables)
- Transparencia: el usuario entiende por qué se sugiere algo
- Control: opt-out y preferencias
- No usar vergüenza, miedo, ni manipulación

### 5.2 Patrones recomendados
- **Nudges contextuales:** “Estás cerca del presupuesto” (con explicación)
- **Implementation intentions:** “Cuando reciba mi sueldo → separar X%”
- **Habit loops:** recordatorios suaves + recompensa informativa (insight)
- **Reduce friction:** plantillas, categorías sugeridas, autofill, import inteligente
- **Gamificación sobria:** streaks, metas, badges discretos (sin presión)

### 5.3 Qué medir (behavior)
- % usuarios que completan hábito (D7/D30)
- reducción de “drop-off” en flujo financiero
- aumento de registros consistentes (p.ej., 3 transacciones/semana)
- impacto en churn y NPS (si se mide)

**Gate behavioral (bloquea):**
- Nudges sin opt-out o sin explicación.
- Gamificación agresiva que degrade confianza (especialmente en finanzas/salud).

---

## 6) Operación de experimentos (ciclo completo)
- Pre-registro del experimento (spec)
- Checklist de instrumentación (eventos + propiedades + QA)
- Launch gradual (1% → 10% → 50%)
- Monitoreo de guardrails (alertas)
- Decisión: ship / iterate / rollback
- Postmortem breve: aprendizaje + acción

**Gate ops experimentos (bloquea):**
- Experimento lanzado sin QA de eventos.
- No hay monitoreo de guardrails.
- No se documenta el resultado.

---

## 7) Test Strategy (mínimo)
- Unit: asignación de variantes (bucketing), entitlements
- Integration: flags + backend contracts + paywall flow
- E2E: 1–2 flows críticos (view paywall → subscribe)
- Data correctness: métricas calculadas consistentes

---

## 8) Outputs obligatorios (por fase BMAD)
### BRIEF
- Experimentation Profile + hipótesis + métricas + guardrails + riesgos

### MODEL
- Diseño A/B (randomización, unit, segmentos)
- Plan de instrumentación (event taxonomy)
- Diseño de flags (targeting + kill switch)
- Plan paywall (si aplica) + entitlements

### ACTION
- Implementación flags + bucketing + audit
- Implementación eventos + dashboards
- Implementación variantes (UI/UX) + QA
- Plan de análisis y decisión

### DEPLOY
- Rollout gradual + monitoreo
- Decisión + documentación + retiro de flags

---

## 9) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Experimentation Profile**  
2) **Experiment Spec** (hipótesis, variantes, métricas, guardrails, duración/stop)  
3) **Power Basics** (baseline, MDE, supuestos)  
4) **Instrumentation Plan** (eventos + propiedades)  
5) **Feature Flags Plan** (bucketing, targeting, kill switch, audit, expiry)  
6) **Paywall/Pricing Plan** (si aplica) + entitlements + dunning/grace  
7) **Behavioral Design Plan** (nudges/hábitos + ética)  
8) **Ops Plan** (launch, monitoreo, decisión, cleanup)  
9) **Next Steps** (accionables)

---

## 10) Señales de deuda en experimentación (Windsurf debe advertir)
- Experimentos sin métrica primaria o sin guardrails.
- Randomización no sticky o por unidad incorrecta.
- Decisiones con muestras mínimas sin MDE/baseline.
- Flags sin kill switch o sin expiración.
- Paywall con entitlements en cliente y sin funnel tracking.
- Nudges sin consentimiento/opt-out o con dark patterns.

---
**End of skill.**
