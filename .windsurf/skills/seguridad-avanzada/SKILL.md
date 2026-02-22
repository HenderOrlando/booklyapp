---
name: seguridad-avanzada
description: Eleva la seguridad a nivel "fintech-grade" con IAM y sesiones avanzadas, detección de anomalías, device binding, KMS con rotación y cifrado de campos, AppSec automatizado (SAST/DAST/SBOM), hardening, y privacidad por diseño con consentimiento granular y DSRs automatizados para export y borrado de datos.
---

# 🛡️ Windsurf Skill — Seguridad Avanzada (más allá de “básico”)
**Skill ID:** SK-SEC-ADV-001  
**Aplica a:** Todos los verticals; recomendado en R2+ y **obligatorio** en R3 (pagos, open banking, PHI, datos legales sensibles, B2B con auditoría)  
**Objetivo:** elevar seguridad a nivel “fintech-grade”: IAM/sesiones avanzadas, detección de anomalías, device binding, KMS/rotación y cifrado de campos, AppSec automatizado (SAST/DAST/SBOM), hardening, y privacidad por diseño con consentimiento granular y DSRs automatizados (export/borrado).

---

## 0) Advanced Security Profile (output obligatorio)
Antes de diseñar/codificar, Windsurf debe fijar:

- **Risk Tier:** R0–R3 (siempre explícito)
- **Threat posture:** low | medium | high | hostile environment
- **Auth stack:** OIDC provider + MFA policy (step-up triggers)
- **Session model:** stateless JWT | opaque tokens | server-side sessions
- **Device strategy:** none | device fingerprint | device binding (recommended R2+)
- **Anomaly detection:** none | rules | ML (solo si hay data)
- **Key management:** KMS/Vault/SM + rotation policy
- **Field encryption:** none | selective | pervasive (según data classes)
- **AppSec pipeline:** SCA + SAST + DAST + SBOM + secrets scan (seleccionar)
- **Privacy:** consent granularity + export/delete automation (sí/no) + retention
- **Compliance drivers:** GDPR/local/PCI-like/otros

> Gate: sin Advanced Security Profile explícito, Windsurf **no avanza**; declara supuestos “Hard” + impacto.

---

## 1) Principios (no negociables)
1. **Attack surface minimization:** menos endpoints, menos permisos, menos datos.
2. **Continuous verification:** sesiones y dispositivos se re-validan (no “login y ya”).
3. **Cryptography pragmática:** KMS y rotación reales, no “cifrado casero”.
4. **Security automation:** AppSec en CI + políticas de bloqueo por severidad.
5. **Privacy is product:** consent, export y delete son flujos de UX + backend, no documentos.
6. **Measurable controls:** métricas y alertas para IAM y abuso.

---

## 2) Gestión de identidad y sesiones avanzada
### 2.1 Control de sesiones activas (obligatorio R2+)
Windsurf debe implementar o especificar:
- Registro de sesiones:
  - `session_id`, `user_id`, `tenant_id`
  - `issued_at`, `expires_at`, `last_seen_at`
  - `device_id`, `ip`, `geo` (si permitido), `user_agent`
  - estado: active/revoked/expired/suspicious
- UX de “Sesiones activas”:
  - listar dispositivos
  - cerrar sesión remota
  - “cerrar todas” (con re-auth)

### 2.2 Rotación y revocación
- Refresh token rotation (one-time use) + reuse detection
- Revocación inmediata (server-side) para:
  - password change
  - device lost
  - anomalía detectada
  - user requested logout all

### 2.3 Step-up MFA (política)
**Triggers típicos:**
- nuevo dispositivo
- cambio de email/teléfono
- exportación de datos
- cambios de billing/plan
- acciones financieras sensibles
- ubicaciones/IPs anómalas

**Gate sesiones/IAM (bloquea):**
- No existe lista de sesiones activas en R2+.
- Refresh tokens sin rotación o sin detección de reuse.
- No hay mecanismo de revocación inmediata.

---

## 3) Detección de anomalías y device binding
### 3.1 Device identity (niveles)
- **L0:** nada
- **L1:** fingerprint “soft” (cookies + signals) + riesgo
- **L2:** device binding (clave/attestation) + token bound

### 3.2 Señales de riesgo (rules-first)
Windsurf debe definir un **Risk Score** (0–100) basado en:
- IP reputation / ASN
- geovelocity (viaje imposible)
- número de intentos fallidos
- cambio de device_id
- cambio de patrón horario
- acciones sensibles en secuencia (export + change creds)
- comportamiento de sesión (burst requests)

### 3.3 Respuestas (actions)
- step-up MFA
- captcha
- rate limit más agresivo
- bloqueo temporal
- requerir re-auth
- alerta al usuario

**Gate anomalías (bloquea en R2+):**
- No hay señales definidas ni respuestas.
- No se mide ni registra risk_score por sesión/acción.

---

## 4) Gestión de llaves y criptografía práctica
### 4.1 KMS + rotación (obligatorio)
- Claves gestionadas en KMS/Vault (no claves en env vars planas)
- Rotación programada:
  - master keys (KMS) según política
  - data keys (envelope encryption)
- Separación por entorno/tenant (cuando aplique)

### 4.2 Cifrado de campos sensibles (field-level)
**Aplicar a:**
- tokens bancarios / refresh tokens
- identificadores sensibles (documentos, PHI)
- secretos de integraciones
- datos que no deben indexarse en claro

**Patrón recomendado:** envelope encryption
- KMS protege DEK/KEK
- datos cifrados con DEK, DEK cifrada con KMS

### 4.3 Rotación sin perder acceso
- Versionado de claves (`key_version`)
- Re-encryption jobs (background) para migrar gradualmente
- Lectura compatible con versiones anteriores

**Gate crypto (bloquea):**
- Cifrado “artesanal” sin KMS.
- No hay plan de rotación ni versionado de keys.
- Tokens guardados en claro.

---

## 5) Pentesting / AppSec (CI/CD)
### 5.1 Controles en pipeline (mínimos R2+)
- **SCA:** dependencias (CVE) + policy (bloqueo por severidad)
- **Secrets scanning:** pre-commit + CI
- **SAST:** análisis estático (reglas OWASP)
- **DAST:** escaneo básico sobre staging
- **SBOM:** generación y almacenamiento por release
- **Container/IaC scanning:** si aplica

### 5.2 Hardening (runtime)
- Headers y CSP (web)
- CORS restrictivo
- TLS strong ciphers
- WAF/rate limiting
- DB no pública + network segmentation
- Least privilege IAM

### 5.3 Pentest operativo
- Checklist trimestral (R2) / mensual (R3) o por release mayor
- Gestión de findings:
  - severidad, owner, SLA de remediación
  - verificación de fix (retest)

**Gate AppSec (bloquea en R2+):**
- No hay SCA + secrets scan + SAST mínimo.
- Findings críticos sin SLA ni owner.
- Sin SBOM en releases (R3 recomendado/obligatorio según compliance).

---

## 6) Privacidad por diseño (operacional)
### 6.1 Minimización aplicada
- Data inventory: qué se recolecta y por qué
- Reducir propiedades en eventos/logs
- Pseudonimización donde se pueda
- Masking en UI/exports según rol

### 6.2 Consentimiento granular
- Consent por propósito:
  - analítica
  - marketing
  - open banking sync
  - comunicaciones lifecycle
- Registro de consent:
  - `consent_version`, `granted_at`, `revoked_at`, scope
- Revocación efectiva (detiene sync/mensajes)

### 6.3 DSRs automatizados (export/borrado)
- **Export:** formato estándar (JSON/CSV), job async, link temporal
- **Delete:** borrado lógico/físico según policy y legal hold
- Retención y legal hold:
  - bloquea borrado si hay obligación legal (regtech/legaltech)

**Gate privacidad (bloquea):**
- No existe flujo real de export/delete (solo “documentado”).
- Consent sin revocación efectiva.
- Retención no definida o no implementada.

---

## 7) Observabilidad de seguridad (operacional)
Métricas mínimas:
- login_success/failure rate
- mfa_challenge_rate + pass/fail
- session_revocations
- anomaly_triggers (por tipo)
- blocked requests (rate limit/WAF)
- key_rotation events + failures
- DSR requests (export/delete) + tiempos

Alertas:
- spikes de auth failures
- reuse de refresh tokens
- geovelocity sospechosa
- DSR backlog creciendo
- detección de secrets en CI (hard fail)

**Gate sec observability (bloquea en R2+):**
- No hay métricas/alertas mínimas de auth y anomalías.

---

## 8) Test Strategy (obligatorio)
- Unit: risk scoring rules, consent logic, encryption wrappers
- Integration: token rotation/reuse detection, session revocation, DSR flows
- Security tests: authz matrix (roles/tenants), rate limit behavior
- Pipeline verification: CVEs bloquean, secrets scan bloquea, SBOM generado

**Gate QA security (bloquea):**
- Cambios IAM/crypto sin tests de regresión.
- Release sin evidencias de pipeline AppSec.

---

## 9) Outputs obligatorios (por fase BMAD)
### BRIEF
- Advanced Security Profile + posture + supuestos + riesgos

### MODEL
- Session model + device strategy + anomaly rules
- Key management + encryption plan (field-level)
- AppSec pipeline design + hardening checklist
- Privacy design (consent + DSR + retention)

### ACTION
- Implementación (session store, token rotation, risk scoring)
- Implementación crypto (KMS + envelope + rotation)
- Implementación AppSec (SCA/SAST/DAST/SBOM)
- Implementación privacy ops (consent registry + export/delete jobs)
- Métricas y alertas

### DEPLOY
- Runbooks (auth spikes, key rotation incident, DSR backlog)
- Evidencia de AppSec gates en CI
- Auditoría de controles habilitados

---

## 10) Formato obligatorio de salida (cuando se active este skill)
Windsurf debe responder con:

1) **Advanced Security Profile**  
2) **IAM & Sessions Plan** (active sessions, revocation, MFA triggers)  
3) **Device & Anomaly Plan** (signals, scoring, responses)  
4) **KMS/Crypto Plan** (field encryption, envelope, rotation/versioning)  
5) **AppSec Pipeline** (SCA/SAST/DAST/SBOM + gating)  
6) **Privacy-by-Design Plan** (minimization, consent, export/delete automation)  
7) **Security Observability** (metrics/alerts)  
8) **Test Plan** (security regression)  
9) **Next Steps** (accionables)

---

## 11) Señales de deuda de seguridad avanzada (Windsurf debe advertir)
- Refresh tokens sin rotación/reuse detection.
- No hay revocación inmediata ni control de sesiones activas.
- Tokens/PII sensibles en claro o cifrado “casero”.
- Sin KMS y sin plan de rotación/versionado de keys.
- Pipeline sin SCA/SAST/secrets scan (y DAST en R2+).
- Consent sin revocación efectiva y DSRs manuales.
- Sin métricas/alertas de IAM y anomalías.

---
**End of skill.**
