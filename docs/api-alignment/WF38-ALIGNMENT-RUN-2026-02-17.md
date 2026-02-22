# WF-38 Run — Verificacion de alineacion Frontend/Backend

**Fecha:** 2026-02-17  
**Scope:** `bookly-mock-frontend` + `bookly-mock`  
**Resultado final (Gate de release a produccion):** **NO APTO**

## 0) Auto-discovery

### Evidencia

- Rules disponibles en `.windsurf/rules/*`.
- Rutas resueltas:
  - FE: `bookly-mock-frontend/`
  - BE: `bookly-mock/`

### Gate 0

- **PASA**

---

## 1) MODEL — Contratos backend como source of truth

### Evidencia

- Swagger/OpenAPI configurado por servicio:
  - `bookly-mock/apps/auth-service/src/main.ts`
  - `bookly-mock/apps/resources-service/src/main.ts`
  - `bookly-mock/apps/availability-service/src/main.ts`
  - `bookly-mock/apps/stockpile-service/src/main.ts`
  - `bookly-mock/apps/reports-service/src/main.ts`
  - `bookly-mock/apps/api-gateway/src/main.ts`
- AsyncAPI presente por dominio (eventos):
  - `bookly-mock/apps/*/docs/*.asyncapi.yaml`
- API Gateway proxy alineado con prefijos de controladores:
  - `bookly-mock/apps/api-gateway/src/application/services/proxy.service.ts`

### Gate 1

- **PASA** (con evidencia de contratos y enrutamiento actualizado)

---

## 2) TRACE — Rule Traceability Matrix

### Evidencia

- Reglas de producto por RF/HU presentes en `.windsurf/rules/*`.
- Contrato FE↔BE validado con test de endpoints:
  - `bookly-mock-frontend/src/__tests__/contracts/endpoint-contract.test.ts`
  - Resultado: **35/35 passing**

### Gate 2

- **PASA CONDICIONAL**
- Observacion: existe mapeo tecnico rule->artefactos, pero no se genero RTM formal detallada por `rule_id` en este run.

---

## 3) ALIGN — FE ↔ BE (DTOs, errores, auth, estados)

### 3.1 DTOs/Endpoints

- Endpoints FE centralizados en:
  - `bookly-mock-frontend/src/infrastructure/api/endpoints.ts`
- Contract test FE↔BE ejecutado y en verde:
  - `bookly-mock-frontend/src/__tests__/contracts/endpoint-contract.test.ts`

### 3.2 Errores BE -> mapeo FE -> i18n

- Mapeo estructurado de errores:
  - `bookly-mock-frontend/src/infrastructure/http/errorMapper.ts`
  - `bookly-mock-frontend/src/infrastructure/http/errorMessageResolver.ts`
- Namespace `errors` cargado en i18n:
  - `bookly-mock-frontend/src/i18n/request.ts`
- Catologo i18n de errores:
  - `bookly-mock-frontend/src/i18n/translations/es/errors.json`
  - `bookly-mock-frontend/src/i18n/translations/en/errors.json`
- Uso en UX:
  - `bookly-mock-frontend/src/app/[locale]/login/page.tsx`
  - `bookly-mock-frontend/src/contexts/AuthContext.tsx`

### 3.3 AuthN/AuthZ + rate limiting

- Guards/decorators de seguridad presentes:
  - `bookly-mock/apps/auth-service/src/infrastructure/guards/*.ts`
  - `bookly-mock/apps/auth-service/src/infrastructure/decorators/*.ts`
- Enforcement en controladores (ejemplo):
  - `bookly-mock/apps/auth-service/src/infrastructure/controllers/users.controller.ts`
- Rate limiting server-side:
  - `bookly-mock/apps/api-gateway/src/application/services/rate-limiter-redis.service.ts`
  - Invocado en proxy:
    - `bookly-mock/apps/api-gateway/src/application/services/proxy.service.ts`

### Gate 3

- **PASA**

---

## 4) QA — Suites y gates

### Ejecutado en este run

- Contract tests:
  - `npx jest --runTestsByPath src/__tests__/contracts/endpoint-contract.test.ts --runInBand`
  - **PASS (35/35)**
- Integracion FE/BE basica:
  - `npm run integration:check`
  - **PASS** (backend connectivity + type-check)
- Type-check:
  - `npm run type-check`
  - **PASS**

### E2E smoke

- Intentado con Playwright, ejecucion cancelada en IDE (2 veces).
- Se alineo config de Playwright al puerto real del FE para evitar falso negativo de webServer:
  - `bookly-mock-frontend/playwright.config.ts`

### Gate 4

- **NO PASA (pendiente evidencia de smoke e2e en staging/entorno objetivo)**

---

## 5) OPS/SEC — Operabilidad y seguridad

### Evidencia

- CSP y cabeceras de seguridad en FE:
  - `bookly-mock-frontend/next.config.js`
- KPIs operacionales documentados:
  - `bookly-mock/docs/operations/KPIS.md`
- ADRs operacionales/arquitectura:
  - `bookly-mock/docs/adr/ADR-001-auth-service-sot.md`
  - `bookly-mock/docs/adr/ADR-002-event-store-outbox.md`
  - `bookly-mock/docs/adr/ADR-003-dlq-policy.md`

### Gate 5

- **PASA CONDICIONAL**
- Observacion: falta evidencia ejecutable en este run del camino completo alerta -> dashboard -> trace -> log.

---

## 6) RELEASE — Rollout/Rollback y sign-off

### Evidencia del run

- No se encontro runbook formal de rollback/release en `bookly-mock/docs/` para este gate.
- E2E smoke staging no quedó evidenciado en este run.

### Gate 6

- **NO PASA**

---

## Cambios aplicados durante este workflow run

1. **Alineacion de verificacion de conectividad FE/BE**
   - Archivo: `bookly-mock-frontend/scripts/verify-backend-connectivity.sh`
   - Cambios:
     - Endpoint de servicios de health del gateway corregido a `/health/services`.
     - Health checks de microservicios corregidos a endpoints directos `/api/v1/health` usando URLs por servicio (`3001-3005`).

2. **Alineacion de Playwright con puerto real del FE**
   - Archivo: `bookly-mock-frontend/playwright.config.ts`
   - Cambios:
     - `baseURL` por defecto: `http://localhost:4200`
     - `webServer.url`: `http://localhost:4200`

---

## Decision de release del workflow

**Estado:** **NO APTO para produccion**

### Bloqueantes

1. Gate 4: falta evidencia cerrada de smoke E2E en staging/entorno objetivo.
2. Gate 6: falta evidencia formal de rollout/rollback validado para este run.

### Condiciones para pasar a APTO

1. Ejecutar y adjuntar evidencia de smoke E2E (staging) en rutas criticas.
2. Adjuntar plan de rollout/rollback (dry-run o runbook operativo) y checklist de sign-off.
