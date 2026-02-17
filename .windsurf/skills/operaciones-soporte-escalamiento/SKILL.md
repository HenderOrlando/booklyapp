---
name: operaciones-soporte-escalamiento
description: Skill para operar el producto como negocio con soporte técnico estructurado (SLAs, incidentes), escalamiento vía comunidad y partnerships, y base legal mínima (T&C, privacidad, tratamiento de datos y responsabilidades).
---

# 🧩 Windsurf Skill — Operaciones, Soporte y Escalamiento del Negocio
**Skill ID:** SK-OPS-SCALE-001  
**Aplica a:** Todos los verticals; especialmente fintech/SMB por soporte, partnerships y legal  
**Objetivo:** operar el producto como negocio: soporte técnico estructurado (SLAs, incidentes), escalamiento vía comunidad/partnerships, y base legal mínima (T&C, privacidad, tratamiento de datos y responsabilidades).

---

## 0) Ops & Scale Profile (output obligatorio)
Antes de diseñar procesos o herramientas, Windsurf debe fijar:

- **Modelo:** B2C | B2B | híbrido
- **Canales de soporte:** in-app | email | chat | teléfono | comunidad
- **Horario de soporte:** local + cobertura (L1/L2/L3)
- **SLA targets:** first response + resolution por severidad
- **Tooling:** Zendesk/Intercom/Freshdesk/Jira Service Mgmt/otro
- **Incident model:** on-call (sí/no), escalamiento, comunicación
- **Community:** canales (Discord/WhatsApp/Slack/FB/YouTube) + moderación
- **Partnership ICP:** contadores | pymes | creadores | bancos | ERPs
- **Legal scope:** jurisdicción(s) + idiomas + tipo de datos
- **Risk Tier:** R0–R3 (R2+ si PII/finanzas)

> Gate: sin Ops & Scale Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Soporte = producto:** cada ticket alimenta roadmap y reduce churn.
2. **SLAs realistas y medibles:** no prometer lo que no se puede cumplir.
3. **Incidentes con disciplina:** detectar, mitigar, comunicar, aprender.
4. **Partners con incentivos claros:** valor mutuo + tracking.
5. **Legal no es adorno:** define responsabilidades y reduce riesgo operativo.

---

## 2) Soporte técnico estructurado (playbooks, macros, SLAs, incidentes)
### 2.1 Estructura de soporte (L1/L2/L3)
- **L1 (Triage):** clasificación, macros, requests de info, workaround
- **L2 (Producto):** reproducción, bugs, mejoras, configuración
- **L3 (Engineering):** incidentes, hotfix, escalamiento técnico

### 2.2 Taxonomía de tickets (obligatoria)
- Categoría: acceso/auth | datos/cálculos | import/sync | pagos/billing | UX | bug | feature request
- Subcategoría + severidad + componente (API/mobile/web)
- Etiquetas:
  - `data_correctness` (alta prioridad en finanzas)
  - `security_privacy`
  - `integration_provider`
  - `billing_dispute`
- Estado: new → triaged → in_progress → waiting_user → resolved → closed

**Gate soporte (bloquea):**
- No hay taxonomía; todo es “general”.
- No existe tag para “data correctness” o “security”.

### 2.3 SLAs (baseline)
Definir por severidad:
- **S0:** seguridad/privacidad, pérdida/corrupción de datos
- **S1:** números incorrectos, duplicados, conciliación rota
- **S2:** flujo core roto, crashes
- **S3:** UI/UX menor, preguntas

Ejemplo de estructura (ajustable):
- S0: respuesta < 1h, mitigación < 4h, update cada 1–2h
- S1: respuesta < 4h, resolución < 1–2 días hábiles
- S2: respuesta < 1 día, resolución < 3–5 días hábiles
- S3: respuesta < 2 días, resolución según backlog

**Gate SLA (bloquea):**
- No existe SLA por severidad.
- No hay medición (first response, resolution time).

### 2.4 Macros y playbooks (obligatorios)
**Macros mínimas:**
- solicitud de información (capturas, logs, pasos)
- restablecimiento acceso (auth/MFA)
- import errores (CSV/OFX/QIF)
- duplicados/sync issues
- facturación/pagos (si aplica)

**Playbooks mínimos:**
- “Números no cuadran” (data correctness)
- “No sincroniza banco/proveedor” (integraciones)
- “Incidente en producción” (mitigación + comunicación)
- “Solicitud de export/borrado de datos” (privacy)

**Gate playbooks (bloquea):**
- No hay playbook para data correctness (finanzas).
- No hay procedimiento para incidentes.

### 2.5 Manejo de incidentes (SRE-lite)
- Roles: Incident Commander, Comms, Ops/Eng
- Fases:
  1) detectar (alerta/ticket)
  2) triage (impacto, severidad)
  3) mitigar (feature flag/rollback)
  4) comunicar (status page o canal)
  5) postmortem (acción correctiva)

**Artefactos mínimos:**
- template de postmortem
- timeline + root cause + preventive actions
- métricas: MTTA, MTTR

**Gate incident mgmt (bloquea en R2+):**
- No hay runbook de rollback/mitigación.
- No se hace postmortem en S0/S1.

---

## 3) Gestión de comunidad y partnerships (contadores, pymes, creadores)
### 3.1 Objetivo y propuesta de valor
Windsurf debe definir:
- Segmentos:
  - contadores (asesores)
  - pymes (dueños/administración)
  - creadores (audiencia financiera)
- Oferta:
  - referral (comisión)
  - bundles (plantillas, reportes)
  - co-marketing (webinars, contenido)
  - “pro” para contadores (multi-client, dashboards)

### 3.2 Programa de partnerships (mínimo viable)
- Funnel partner:
  - apply → qualify → onboard → enable → activate → grow
- Materiales:
  - media kit
  - guía de producto + casos de uso
  - tracking links/códigos
- Incentivos:
  - comisión por suscripción
  - revenue share
  - descuentos para sus clientes
- Governance:
  - términos del programa
  - anti-fraude (auto-referrals, spam)

**Gate partnerships (bloquea):**
- No hay tracking de referrals (link/código).
- Incentivos no están definidos o generan abuso.

### 3.3 Comunidad (operación)
- Canales: Discord/WhatsApp/Telegram/FB/YouTube (definir)
- Moderación:
  - reglas claras
  - manejo de spam
  - respuesta a crisis
- Calendario:
  - AMAs, tips semanales, casos reales
- Feedback loop:
  - top issues + top requests mensual

**Gate comunidad (bloquea):**
- No hay reglas de moderación.
- No hay proceso para elevar feedback al roadmap.

---

## 4) Legal/contratos (T&C, privacidad, tratamiento de datos, responsabilidades)
> Windsurf no sustituye asesoría legal, pero debe estructurar requisitos y entregables.

### 4.1 Paquete legal mínimo (obligatorio para lanzamiento)
- **Términos y Condiciones (T&C)**
- **Política de Privacidad**
- **Política de Cookies** (si web y tracking)
- **Tratamiento de datos** (según país)
- **Acuerdo de procesamiento de datos (DPA)** (si B2B o proveedores)

### 4.2 Contenidos clave (checklist)
**T&C:**
- alcance del servicio, limitaciones, disponibilidad (SLA si aplica)
- responsabilidades del usuario
- disclaimers (no asesoría financiera si aplica)
- pagos, renovaciones, reembolsos (si monetiza)
- suspensión/cancelación
- propiedad intelectual
- jurisdicción y resolución de disputas

**Privacidad:**
- qué datos se recolectan, base legal/consentimiento
- propósito del procesamiento
- compartición con terceros (proveedores)
- retención y borrado
- derechos del titular (export/delete)
- seguridad aplicada

**Tratamiento de datos:**
- roles (controller/processor)
- medidas técnicas/organizativas
- subprocesadores y auditoría

**Gate legal (bloquea):**
- No hay política de privacidad antes de capturar PII.
- No hay términos para pagos/suscripciones (si monetiza).
- No hay proceso de DSR (export/delete) implementable.

### 4.3 Operación legal (continuo)
- Versionado de políticas (v1, v2) + changelog
- Consent registry (timestamp + versión)
- Evidencia de aceptación (user_id, accepted_at, policy_version)

**Gate legal ops (bloquea):**
- No se registra aceptación/versiones.
- Cambios de políticas sin notificación/consent actualizado cuando aplica.

---

## 5) Outputs obligatorios (por fase BMAD)
### BRIEF
- Ops & Scale Profile + SLAs target + estrategia partnerships + jurisdicción legal

### MODEL
- Soporte model (L1–L3), taxonomía, SLAs
- Incident process + artefactos
- Programa partnerships + tracking
- Paquete legal: documentos + checklist + versionado

### ACTION
- Configuración de herramienta de soporte + macros
- Playbooks + templates (postmortem, escalamiento)
- Implementar tracking referral + dashboard
- Implementar consent registry + acceptance logs
- Backlog de mejoras desde tickets/comunidad

### DEPLOY
- Reporte semanal: tickets, SLAs, top issues
- Postmortems y acciones
- Métricas de partners y comunidad
- Auditoría de versiones legales y aceptación

---

## 6) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Ops & Scale Profile**  
2) **Support Model** (L1/L2/L3 + canales + taxonomía)  
3) **SLAs** (por severidad) + medición  
4) **Playbooks & Macros** (lista mínima)  
5) **Incident Management** (roles, runbooks, postmortem template)  
6) **Community Plan** (canales, moderación, calendario, feedback loop)  
7) **Partnership Program** (ICP, incentivos, tracking, anti-abuso)  
8) **Legal Deliverables** (T&C, privacidad, DPA, versionado + acceptance logs)  
9) **Next Steps** (accionables)

---

## 7) Señales de deuda Ops/Scale (Windsurf debe advertir)
- Soporte sin SLAs ni taxonomía.
- Tickets sin feedback loop al backlog.
- Incidentes sin runbooks ni postmortems.
- Partners sin tracking ni reglas anti-abuso.
- Comunidad sin moderación ni proceso de escalamiento.
- Políticas legales sin versionado ni registro de aceptación.

---
**End of skill.**
