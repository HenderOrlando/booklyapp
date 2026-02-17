---
name: cumplimiento-certificaciones
description: Guía completa para implementar cumplimiento normativo (SOC 2, ISO 27001, ISO 27701), gestión de evidencias auditables, retención de datos con borrado verificable, legal hold y gestión de riesgos de terceros (TPRM) en productos B2B que requieren pasar auditorías.
---

# ✅ Windsurf Skill — Cumplimiento y Certificaciones (B2B serio)
**Skill ID:** SK-COMPLIANCE-CERT-001  
**Aplica a:** B2B/PyME/Enterprise en fintech, legaltech, health/med, regtech (o cualquier producto que deba pasar auditorías)  
**Objetivo:** habilitar preparación y ejecución de compliance: SOC 2 / ISO 27001 / ISO 27701 (privacidad), políticas y evidencias auditables, data retention & legal hold con borrado verificable, y TPRM (gestión de proveedores) con DPAs y acuerdos de seguridad.

---

## 0) Compliance Profile (output obligatorio)
Antes de diseñar políticas o controles, Windsurf debe fijar:

- **Target:** SOC 2 Type I/II | ISO 27001 | ISO 27701 | mixto
- **Scope:** productos, entornos, procesos, sedes/equipos
- **Clientes objetivo:** SMB | mid-market | enterprise + requisitos típicos
- **Data classes:** PII | PHI | financieros | evidencias legales | menores
- **Jurisdicciones:** país(es) + regulaciones (GDPR/local)
- **Hosting:** cloud/provider + regiones
- **Vendors críticos:** auth, payments, analytics, support, email, storage
- **Retention:** periodos por tipo de dato (si conocidos) + legal hold (sí/no)
- **Audit evidence owner:** responsables (Sec/Eng/Ops/Legal/PM)
- **Risk Tier:** R0–R3 (normalmente R2/R3)

> Gate: sin Compliance Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Compliance = controles + evidencia + operación continua**, no solo documentos.
2. **Scope controlado:** certificar poco y bien antes de ampliar.
3. **Automatizar evidencia:** logs, tickets, pipelines y configuraciones como pruebas.
4. **Retención y borrado son funcionalidad:** medible y verificable.
5. **Riesgo de terceros es riesgo propio:** TPRM obligatorio en B2B serio.

---

## 2) SOC 2 / ISO 27001 / ISO 27701 — controles, evidencias, políticas
### 2.1 Mapeo rápido (lo que Windsurf debe producir)
- **Control Catalog**:
  - Control ID
  - Descripción (qué protege)
  - Norma objetivo (SOC2/ISO)
  - Owner
  - Evidencia (qué archivo/log/ticket lo prueba)
  - Frecuencia (continua/mensual/trimestral)
  - Estado (implemented/partial/planned)

### 2.2 Familias de controles (mínimo para iniciar)
**Seguridad (ISO 27001 / SOC2 Security):**
- IAM: MFA, RBAC, least privilege, joiner/mover/leaver
- Secrets management + KMS
- Logging + monitoring + alerting
- Vulnerability mgmt: SCA/SAST/patching
- Incident response: runbooks + postmortems
- Backup/DR: RPO/RTO + pruebas de restore

**Disponibilidad (SOC2 Availability):**
- SLI/SLO, capacity planning, change management

**Confidencialidad / Privacidad (ISO 27701 / SOC2 Confidentiality/Privacy):**
- Data classification, minimization
- Consent registry
- DSRs (export/delete)
- Retención/borrado verificable
- Subprocesadores (vendors) y DPAs

### 2.3 Evidencia (obligatoria, “audit-ready”)
Windsurf debe garantizar que cada control tenga evidencia como:
- Configs versionadas (IaC), PRs y approvals
- Logs de auditoría (access logs, admin actions)
- Reportes de SCA/SAST/DAST y SBOM por release
- Tickets de cambios (change management)
- Incidents: timeline + postmortem + acciones
- Restore drills documentados
- Training/security awareness (si aplica)

**Gate controles/evidencias (bloquea):**
- Políticas sin evidencia operacional.
- Controles “enunciados” sin owner ni frecuencia.
- No hay change management rastreable (PR approvals, releases).

### 2.4 Políticas mínimas (starter pack)
- Information Security Policy
- Access Control Policy (MFA, RBAC, JML)
- Secure SDLC / Change Management
- Incident Response Policy
- Vulnerability Management Policy
- Data Classification & Handling
- Backup & DR Policy
- Vendor Management Policy
- Privacy Policy + Data Processing (si aplica)

**Gate políticas (bloquea en B2B serio):**
- No existe control de accesos formal (JML).
- No hay incident response formalizado.
- No hay vendor management policy.

---

## 3) Data retention & legal hold (eDiscovery, borrado verificable)
### 3.1 Retention policy (obligatoria)
Windsurf debe definir **por tipo de dato**:
- categoría (PII, transacciones, logs, evidencias, tickets)
- periodo de retención (ej. 30d/1y/5y)
- base legal/negocio (si aplica)
- ubicación (DB, object storage, logs vendor)
- método de borrado (soft/hard/crypto-erase)
- verificación (cómo se prueba el borrado)

### 3.2 Legal hold (obligatorio cuando aplica)
- `legal_hold_id` + motivo + alcance (usuario/tenant/datos)
- congelar borrados y rotaciones que afecten evidencia
- auditoría:
  - quién activó/levantó hold
  - cuándo
- integración con DSRs:
  - si hay hold → responder “no se puede borrar X por obligación legal” (con proceso)

### 3.3 eDiscovery (si aplica, legaltech/regtech)
- Exportación de evidencia:
  - formato, cadena de custodia, hashes
- Registro de accesos a evidencia
- Retención de versiones (WORM storage si necesario)

### 3.4 Borrado verificable
- Hard delete o crypto-shredding (envelope keys) para datos sensibles
- Jobs de borrado con:
  - batch id
  - conteos borrados
  - evidencia (logs firmados o audit logs)
- Pruebas:
  - muestreo de registros borrados
  - verificación en backups (según política)

**Gate retention/legal hold (bloquea):**
- Retención no definida por tipo de dato.
- Borrado “best effort” sin verificación.
- No existe mecanismo de legal hold cuando es necesario.

---

## 4) Gestión de proveedores (TPRM)
### 4.1 Inventario de proveedores (obligatorio)
- proveedor + servicio
- datos procesados (PII/finanzas/PHI)
- criticidad (low/med/high)
- dependencia (core vs auxiliar)
- regiones/subprocesadores
- contrato/DPA (sí/no) + vencimiento

### 4.2 Evaluación de riesgo (lightweight TPRM)
Windsurf debe implementar un flujo mínimo:
- cuestionario de seguridad (baseline)
- revisión de:
  - SOC2/ISO report (si existe)
  - políticas de retención
  - cifrado y keys
  - incident notification SLA
- scoring:
  - riesgo inherente
  - controles compensatorios
  - decisión: approve/approve-with-mitigations/reject

### 4.3 DPAs y acuerdos de seguridad (obligatorio en vendors que tocan PII)
- DPA con:
  - roles (controller/processor)
  - subprocesadores
  - breach notification
  - retención y borrado
  - auditoría y asistencia DSR
- Security addendum:
  - cifrado, access control
  - logging
  - SLA/availability
  - ubicación de datos

### 4.4 Controles operativos con vendors
- Rotación de credenciales y scopes mínimos
- Monitoreo de fallos (SLOs por vendor)
- Plan de salida (exit plan):
  - export data
  - delete vendor data
  - cutover

**Gate TPRM (bloquea):**
- Proveedor crítico sin inventario ni evaluación.
- Vendor con PII sin DPA.
- No hay exit plan para vendors core.

---

## 5) Evidencia y auditoría continua (operación)
Windsurf debe establecer:
- “Evidence locker” (repo/folder) con estructura y owners
- Cadencia:
  - mensual: access reviews, vulnerability review
  - trimestral: DR drill, vendor review
  - continuo: CI reports, change logs, incident logs
- Auditorías internas:
  - checklist + hallazgos + remediación

**Gate auditoría continua (bloquea):**
- Evidencias dispersas sin estructura/owners.
- No hay cadencia de revisiones.

---

## 6) Outputs obligatorios (por fase BMAD)
### BRIEF
- Compliance Profile + target framework(s) + scope + supuestos

### MODEL
- Control catalog + evidence map + políticas mínimas
- Retention matrix + legal hold design
- TPRM process + vendor inventory schema

### ACTION
- Implementar:
  - audit logs + access reviews
  - secure SDLC gates (SCA/SAST/SBOM)
  - retention jobs + deletion verification
  - legal hold workflow
  - vendor inventory + scoring + DPA tracking
- Crear evidence locker + plantillas

### DEPLOY
- Runbook auditoría: cómo responder a auditor
- Reportes periódicos (access, vuln, vendors, retention)
- Preparación Type I / Type II (si SOC2)

---

## 7) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Compliance Profile**  
2) **Control Catalog** (controles + owners + evidencias + frecuencia)  
3) **Policy Pack** (lista mínima + estado)  
4) **Evidence Map** (dónde vive cada evidencia)  
5) **Retention Matrix** (por tipo de dato) + **Deletion Verification**  
6) **Legal Hold / eDiscovery** (si aplica)  
7) **TPRM Plan** (inventario, scoring, DPA, exit plan)  
8) **Audit Cadence** (revisiones internas)  
9) **Next Steps** (accionables)

---

## 8) Señales de deuda de compliance (Windsurf debe advertir)
- “Queremos SOC2/ISO” sin control catalog ni evidencia.
- Políticas sin owners/frecuencia ni operación.
- Retención/borrado sin verificación.
- Legal hold inexistente cuando hay obligaciones legales.
- Vendors críticos sin inventario, sin evaluación y sin DPA.
- Evidencias dispersas (no audit-ready).

---
**End of skill.**
