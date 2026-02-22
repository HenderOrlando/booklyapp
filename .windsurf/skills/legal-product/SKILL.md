---
name: legal-product
description: Skill para diseñar y validar disclaimers legales, políticas anti-abuso, flujos de suspensión/apelación y gestión de reclamaciones con evidencias auditables en productos fintech y de datos sensibles.
---

# ⚖️ Windsurf Skill — Legal-Product (Confianza y Riesgo)
**Skill ID:** SK-LEGAL-PRODUCT-001  
**Aplica a:** Fintech/PFM, regtech, health/med, legaltech y productos B2C/B2B con datos sensibles y riesgo reputacional/legal.  
**Objetivo:** diseñar “legal-product” como parte del producto: disclaimers y límites (no asesoría financiera) integrados al UX, políticas anti-abuso (Términos, límites, suspensión/apelación), y gestión de reclamaciones con evidencias auditables/exportables.

---

## 0) Legal-Product Profile (output obligatorio)
Antes de redactar copy o diseñar flujos, Windsurf debe fijar:

- **Producto:** tipo (PFM, budgeting, insights, inversiones, pagos)
- **Mercados:** países + idioma(s)
- **Risk Tier:** R0–R3 (finanzas/PII suele ser R2+)
- **Claims del producto:** qué promete (y qué NO debe prometer)
- **Supervisión humana:** existe (sí/no) para casos de riesgo
- **Abuso esperado:** fraude, spam, scraping, chargebacks, multi-cuenta
- **Registros/auditoría:** qué logs existen y por cuánto tiempo
- **Soporte legal:** (interno/externo) + SLA de revisión
- **Exportables:** formatos (PDF/CSV/JSON) y cadena de custodia (si aplica)

> Gate: sin Legal-Product Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **No “financial advice”:** el producto informa/organiza, no recomienda decisiones de inversión/finanzas personalizadas sin marco legal.
2. **Disclaimers contextuales:** donde el riesgo ocurre, no solo en T&C.
3. **Procesos justos:** suspensión con razones, evidencias y apelación.
4. **Evidencia audit-ready:** trazabilidad de cambios y exports verificables.
5. **Separar “UX copy” de “legal text”:** el primero es claro; el segundo es formal y referenciado.

---

## 2) Disclaimers y límites de asesoría financiera (copy legal + UX)
### 2.1 Biblioteca de disclaimers (obligatoria)
Windsurf debe definir un set por contexto:
- **General:** “Información, no asesoría”
- **Insights/Recomendaciones:** “No es recomendación financiera”
- **Presupuestos:** “Estimaciones, dependen de datos”
- **Integraciones bancarias/imports:** “Posibles diferencias por fuente”
- **Alertas/anomalías:** “Señal, no diagnóstico”
- **Contenido educativo:** “No reemplaza asesoría profesional”

Campos por disclaimer:
- `disclaimer_id`
- `context` (screen/flow)
- `copy_short` (1 línea)
- `copy_long` (modal)
- `locale`
- `version`
- `legal_owner`

**Gate disclaimers (bloquea):**
- Disclaimers solo en T&C, no en contextos de riesgo.
- Copy ambiguo (“te conviene…”, “deberías…”) que parece consejo.

### 2.2 UX patterns (recomendados)
- Inline note + link “Ver detalles”
- Modal “Learn more” para features de alto riesgo
- “Acknowledge” solo cuando:
  - el usuario ejecuta acción sensible (ej. exportar, integrar banco)
- No usar dark patterns:
  - evitar consentimiento forzado para cosas no esenciales

**Gate UX legal (bloquea):**
- Pedir “aceptar” repetidamente sin necesidad (fatiga/anti-UX).
- Ocultar disclaimers en texto pequeño e ilegible.

### 2.3 Reglas de lenguaje (finanzas)
- Evitar:
  - “invierte”, “compra”, “vende”, “garantizado”, “seguro”, “rendimiento”
- Preferir:
  - “podría”, “estimación”, “tendencia”, “posible”, “según tus datos”
- Cuando haya IA:
  - “generado automáticamente” + “puede contener errores”

**Gate lenguaje (bloquea):**
- Copy con claims fuertes sin base ni disclaimers.

---

## 3) Políticas anti-abuso del producto (Términos, límites, suspensión, apelaciones)
### 3.1 Catálogo de abuso (obligatorio)
- categorías:
  - spam/automatización
  - scraping
  - fraude de pagos (si aplica)
  - multi-cuenta abusiva
  - uso fuera de límites del plan
  - ataques (credential stuffing)
- señales:
  - rate spikes, device anomalies, IP patterns, chargebacks
- severidad:
  - low/medium/high

**Gate anti-abuse (bloquea):**
- No existe catálogo; respuestas ad-hoc.

### 3.2 Límites de uso (producto + enforcement)
- Por plan:
  - transacciones/mes
  - cuentas vinculadas
  - imports diarios
  - usuarios/roles (B2B)
- Rate limiting:
  - por endpoint y por tenant
- Fair use:
  - “no automatización no autorizada” (si aplica)

**Gate limits (bloquea):**
- Límites definidos en pricing pero no enforced técnicamente.

### 3.3 Flujo de suspensión y rehabilitación (obligatorio en B2B)
Estados sugeridos:
- `active`
- `restricted` (solo lectura)
- `suspended` (bloqueo)
- `appeal_pending`
- `reinstated`

Reglas:
- notificación:
  - razón de alto nivel + link a política
- preservación de datos:
  - no destruir evidencia
- escalamiento:
  - S1: suspender inmediato (fraude/ataque)
  - S2: warning + throttle
- apelación:
  - formulario + documentos (si aplica)
  - tiempos de respuesta (SLA)

**Gate suspensión (bloquea):**
- Suspensión sin razón comunicable ni canal de apelación (riesgo reputacional).
- No hay estado “restricted” para minimizar daño en falsos positivos.

---

## 4) Gestión de reclamaciones y evidencias (auditables/exportables)
### 4.1 Evidencia mínima por “claim”
Cuando un usuario dispute:
- “transacción duplicada”
- “categoría incorrecta”
- “saldo no cuadra”
- “cuenta suspendida”
Windsurf debe poder exportar:
- cambios relevantes (audit trail)
- fuente de datos (import/banco/manual)
- timestamps y actor/device (si aplica)
- versión de reglas/modelos usadas (si aplica)

**Gate evidencias (bloquea):**
- No existe trazabilidad de cambios por entidad.
- No se guarda fuente/origen del dato.

### 4.2 Audit trail (obligatorio)
Para entidades críticas (transactions, budgets, rules, account status):
- `audit_event_id`
- `entity_type`, `entity_id`
- `action` (create/update/delete/merge/recalc)
- `before`, `after` (redactado si PII)
- `actor_id` + rol
- `device_id` (si aplica)
- `ip_hash` (si aplica)
- `timestamp` (UTC)
- `correlation_id` (request/job/event)
- `reason_code` (si por policy)

**Gate audit trail (bloquea):**
- Logs no estructurados sin before/after o sin correlación.

### 4.3 Exportables auditables (cadena de custodia “ligera”)
- formatos:
  - PDF (humano)
  - CSV (análisis)
  - JSON (máquina)
- incluir:
  - `export_id`
  - rango temporal
  - hash checksum del archivo
  - versión de esquema
- “redaction by default”:
  - ocultar PII no necesaria
- Legal hold (si aplica):
  - evitar borrado mientras hay disputa

**Gate exportables (bloquea):**
- Export sin metadata (export_id, rango, hash).
- Export incluye PII innecesaria.

### 4.4 Workflow de reclamación (mínimo)
Estados:
- `opened` → `triage` → `evidence_collected` → `resolved` → `closed`
- SLA por severidad
- plantillas de respuesta (copy + links)

**Gate claims workflow (bloquea):**
- Reclamos sin estados ni SLA → caos operativo.

---

## 5) Instrumentación y métricas (obligatorio)
- Disclaimers:
  - views, “learn more”, acknowledgements
- Anti-abuse:
  - suspensions rate, false positive rate, appeal win rate
- Claims:
  - volume, time-to-resolution, top root causes
- Trust:
  - NPS/CSAT (si aplica), ticket deflection

**Gate métricas (bloquea):**
- No se mide false positives en suspensión.
- No se mide tiempo de resolución de reclamos.

---

## 6) Outputs obligatorios (por fase BMAD)
### BRIEF
- Legal-Product Profile + claims/riesgos + supuestos

### MODEL
- Disclaimer library + placements por flujo
- Anti-abuse catalog + limits + enforcement plan
- Suspension/appeals state machine
- Claims workflow + audit trail + export formats

### ACTION
- Implementar disclaimers contextuales + i18n + versionado
- Implementar rate limiting y límites por plan
- Implementar estados de cuenta (active/restricted/suspended) + apelaciones
- Implementar audit trail estructurado + exportables con hash
- Dashboards + plantillas de soporte

### DEPLOY
- Revisión trimestral de copy/policies (por mercado)
- Auditoría de evidencias (can we prove it?)
- Postmortems de suspensiones erróneas y reclamos recurrentes

---

## 7) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Legal-Product Profile**  
2) **Disclaimer System** (biblioteca, placements, rules de copy, versionado)  
3) **Anti-Abuse Policy & Enforcement** (catálogo, límites, rate limiting)  
4) **Suspension & Appeals Flow** (estados, UX, SLA, fairness)  
5) **Claims & Evidence System** (audit trail, exportables, chain-of-custody lite)  
6) **Metrics Plan** (trust, claims, abuse, disclaimers)  
7) **Next Steps** (accionables)

---

## 8) Señales de deuda legal-product (Windsurf debe advertir)
- Insights/IA que suenan a “consejo financiero” sin disclaimers.
- Suspensiones sin razón, sin apelación y sin estado “restricted”.
- Límites de plan no enforced → abuso y costos.
- No hay audit trail por entidad crítica.
- Exportables sin metadata/hashes (no audit-ready).
- Reclamos sin workflow, sin SLA y sin métricas de resolución.

---
**End of skill.**
