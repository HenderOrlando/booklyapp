---
name: seguridad-privacidad-compliance
description: Skill para garantizar seguridad, privacidad y cumplimiento normativo en el desarrollo de aplicaciones, incluyendo threat modeling, controles OWASP, gestión de secretos, protección de datos sensibles y prevención de fraude.
---

# 🔐 Windsurf Skill — Seguridad, Privacidad & Compliance
**Skill ID:** SK-SEC-COMP-001  
**Aplica a:** Fintech, Legaltech, Edtech, Healthtech, Retailtech, Proptech, Foodtech, Medtech, Regtech  
**Objetivo:** asegurar que todo diseño e implementación cumpla un baseline **security-by-design**, **privacy-by-design** y **compliance-aware**, con threat modeling, controles OWASP, manejo de secretos, protección de PII/PHI/finanzas, y mitigaciones de fraude/abuso cuando aplique.

---

## 0) Security & Compliance Profile (output obligatorio)
Antes de diseñar/codificar, Windsurf debe fijar:

- **Jurisdicción(s):** país/estado + si hay usuarios EU
- **Data classes:** PII | PHI | financieros | biometría | menores | legal privilege | pagos
- **Risk Tier:** R0–R3 (según regla base)
- **Auth model:** OIDC/OAuth2 + MFA (sí/no y cuándo)
- **Secrets mgmt:** Vault/KMS/SSM/Secrets Manager/otro
- **Encryption:** in-transit + at-rest (y client-side si aplica)
- **Retention/Deletion:** política (días/meses/años) + legal hold (si aplica)
- **Payments scope:** none | tokenized only | handles PAN (alto riesgo)
- **Compliance targets:** GDPR + leyes locales + “PCI-like” (si pagos) + otros (según vertical)
- **Abuse/Fraud:** required? (sí/no) + escenarios

> Gate: sin Security & Compliance Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Secure-by-default:** denegar por defecto, permitir explícitamente.
2. **Least privilege:** mínimo acceso en runtime, DB, colas, storage.
3. **Defense in depth:** múltiples capas (authz, rate limit, WAF, validación, auditoría).
4. **Privacy-by-design:** minimización, propósito, retención y borrado.
5. **Auditable systems:** acciones sensibles deben dejar rastro (actor, tenant, recurso, resultado).
6. **Shift-left:** controles de seguridad en CI y PRs (no “después”).

---

## 2) OWASP baseline (aplicado)
### 2.1 Controles mínimos (API/Web/Mobile)
- Validación de entrada (schema + límites) y sanitización donde aplique.
- Autenticación robusta (OIDC) + rotación de refresh tokens.
- Autorización consistente (RBAC/ABAC) en cada endpoint/acción.
- Protección contra:
  - Broken Access Control
  - Injection
  - Security Misconfiguration
  - Sensitive Data Exposure
  - SSRF (si hay fetch/URL inputs)
  - Insecure Deserialization (si aplica)
- Headers y políticas web (CSP, HSTS, etc.) si aplica.
- Logging seguro (sin secrets/PII en logs).

### 2.2 Gate OWASP (bloquea)
- Endpoints sin authz/tenant scope.
- Inputs sin validación o límites.
- Logs con PII/secrets.
- Configuración insegura (debug, CORS abierto) en prod.

---

## 3) Threat Modeling (obligatorio para R2+)
### 3.1 Modelo mínimo
Windsurf debe producir:
- **Assets:** qué protegemos (PII, tokens, dinero, evidencia, PHI, etc.)
- **Actors:** user, admin, attacker, integraciones
- **Trust boundaries:** app, API, DB, queue, terceros
- **Threats (STRIDE):** Spoofing, Tampering, Repudiation, Info Disclosure, DoS, Elevation
- **Mitigations:** controles concretos por amenaza
- **Abuse cases:** 3–5 escenarios

**Gate Threat Model (bloquea en R2+):**
- No hay boundaries ni assets definidos.
- Mitigaciones no son implementables (solo “genéricas”).

---

## 4) Secrets Management (manejo de secretos)
### 4.1 Reglas duras
- **Nunca** secrets en repo, logs, analytics.
- Secrets inyectados por runtime (KMS/Vault/SM).
- Rotación periódica (o al menos capacidad de rotar sin downtime).
- Separación de entornos (dev/staging/prod) con credenciales distintas.
- Principio de mínimo privilegio (IAM) para servicios.

### 4.2 Gate Secrets (bloquea)
- API keys en código o .env commiteado.
- Un mismo secreto para múltiples entornos.
- No existe plan de rotación.

---

## 5) Rate limiting, DoS y abuso
### 5.1 Controles mínimos
- Rate limit por:
  - IP
  - userId
  - tenantId (plan-based)
- Protección de endpoints sensibles:
  - login, signup, password reset, OTP, export, webhooks
- Backoff y lockouts para intentos de autenticación
- WAF/CDN (si aplica) + bot detection (según producto)

### 5.2 Gate Abuse/DoS (bloquea)
- Login sin rate limit.
- Endpoints costosos sin protección (export/reporting).
- Sin límites por tenant/plan en B2B.

---

## 6) Protección de datos (PII/PHI/finanzas)
### 6.1 Cifrado
- **In transit:** TLS siempre
- **At rest:** DB/storage cifrado (KMS)
- **Field-level encryption** para datos altamente sensibles (según vertical/riesgo)
- **Client-side encryption** si el riesgo lo requiere (mobile/offline)

### 6.2 Minimización y propósito
- Capturar solo lo necesario
- Separar identificadores de atributos sensibles (tokenization/pseudonymization)
- Redacción/masking en logs y exports

### 6.3 Retención, borrado y legal hold
- Política de retención por tipo de dato
- “Right to delete” cuando aplique (GDPR/leyes locales)
- Legal hold para legaltech/regtech cuando aplique (bloquea borrado)

**Gate PII (bloquea):**
- No hay clasificación de datos.
- Se recolecta PII sin propósito definido.
- No existe política de retención/borrado.
- Exportaciones incluyen PII sin controles.

---

## 7) Compliance (GDPR + locales + PCI-like)
### 7.1 GDPR (si hay EU o se decide cumplir)
- Base legal (consent/contract/legitimate interest) por flujo
- Derechos: acceso, portabilidad, rectificación, borrado
- DPA con proveedores relevantes (cuando aplique)
- Registro de actividades (mínimo en R3)

### 7.2 Leyes locales
- Windsurf debe pedir jurisdicción o declarar supuesto hard.
- Ajustar retención y tratamiento de datos según país.

### 7.3 Pagos / PCI-like
- Si **no** manejas PAN: preferir tokenización y proveedores.
- Si manejas PAN: tratarlo como **R3**:
  - segmentación, controles estrictos, logging restringido, escaneo, auditoría, mínimos PCI.

**Gate Compliance (bloquea):**
- Se procesan pagos sensibles sin “PCI-like” controls.
- No existe definición de base legal y retención (si GDPR aplica).

---

## 8) Auditoría y trazabilidad (acciones sensibles)
**Obligatorio mínimo:**
- `who` (actor), `what` (acción), `where` (tenant/resource), `when`, `outcome`
- Inmutabilidad lógica (append-only) en `R3` o dominios regulados
- Export de auditoría (para regtech/legaltech) si aplica

**Gate audit (bloquea):**
- Acciones críticas sin audit log.
- Audit logs contienen PII innecesaria.

---

## 9) Fraude/abuso (cuando hay pagos o integraciones bancarias)
### 9.1 Antifraude básico (baseline)
- Detección de anomalías simples:
  - múltiples intentos fallidos
  - cambios frecuentes de dispositivo/IP
  - transacciones repetidas con patrones sospechosos
- “Velocity checks” (por user/tenant)
- Reglas por riesgo:
  - step-up auth (MFA) para acciones críticas
  - hold/review manual (si aplica)
- Listas de bloqueo (IP/device/email) + captchas (cuando aplica)

### 9.2 Gate antifraude (bloquea cuando aplica)
- Flujos de dinero sin idempotencia + auditoría + velocity checks.
- Integraciones bancarias sin controles de abuso/rate limit.

---

## 10) Security testing y SDLC (shift-left)
### 10.1 En CI/CD (mínimos)
- Dependabot / SCA
- Lint + tests
- Secret scanning
- SAST (si disponible)
- Infra scanning (si IaC existe)

### 10.2 En runtime (mínimos)
- Alertas por auth failures y spikes
- Detección de anomalías (básico)
- Monitoreo de WAF/rate limit (si aplica)

**Gate SDLC (bloquea):**
- No hay scanning básico (secrets/deps).
- No hay alertas mínimas para auth/abuso.

---

## 11) Outputs obligatorios (por fase BMAD)
### BRIEF
- Security & Compliance Profile + riesgos + supuestos hard

### MODEL
- Threat model (R2+) + data classification + trust boundaries
- Controles seleccionados (OWASP, rate limiting, audit)

### ACTION
- Plan de implementación de controles (authz, secrets, encryption, logs)
- Plan de pruebas (security + abuse)
- Política de retención/borrado implementable

### DEPLOY
- Checklist de hardening (configs, headers, WAF/rate limit)
- Runbook de incidentes (auth spike, breach sospecha, key rotation)

---

## 12) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Security & Compliance Profile**  
2) **Threat Model** (si R2+) + mitigaciones  
3) **OWASP Controls** seleccionados + gaps  
4) **Secrets Plan** (gestión + rotación)  
5) **PII/PHI Protection Plan** (cifrado, minimización, retención/borrado)  
6) **Compliance Notes** (GDPR/local/PCI-like)  
7) **Abuse/Fraud Controls** (si aplica)  
8) **Security Testing Plan** (CI + runtime)  
9) **Next Steps** (accionables)

---

## 13) Señales de deuda de seguridad (Windsurf debe advertir)
- “Permitir por defecto” o authz inconsistente.
- PII en logs/analytics.
- Secrets en repo o sin rotación.
- Sin rate limit en auth y endpoints costosos.
- Retención/borrado no definidos.
- Pagos sensibles sin PCI-like controls.
- Ausencia de threat modeling en R2+.

---
**End of skill.**
