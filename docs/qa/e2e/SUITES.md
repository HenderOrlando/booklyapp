# Definición de Suites E2E — Bookly Mock Frontend

> Definición formal de las suites de prueba E2E (smoke, regression, visual), tiempos objetivo, gates, tags y configuración de ejecución.

**Última actualización:** 2026-02-17

---

## 1. Visión general de suites

| Suite          | Proyecto Playwright | Directorio        | Prioridad | Trigger         | Gate                  | Tiempo max               | Tests aprox |
| -------------- | ------------------- | ----------------- | --------- | --------------- | --------------------- | ------------------------ | ----------- |
| **Smoke**      | `smoke`             | `e2e/smoke/`      | P0        | PR, manual      | **Bloquea merge**     | 10 min                   | 23          |
| **Regression** | `regression`        | `e2e/regression/` | P1        | Nightly, manual | Notifica (no bloquea) | 30 min                   | 59          |
| **Extended**   | `regression`        | `e2e/regression/` | P2        | Nightly, manual | Notifica              | (incluido en regression) | 24          |
| **Visual**     | `visual`            | `e2e/visual/`     | P2        | Nightly, manual | Notifica              | 5 min                    | 7           |

---

## 2. Suite: Smoke (P0)

### Propósito

Gate rápido de PR. Valida que los flujos críticos de cada módulo funcionan después de un cambio. Cualquier fallo **bloquea el merge**.

### Specs

| Spec file                          | Tests     | Módulo       | IDs de cobertura              |
| ---------------------------------- | --------- | ------------ | ----------------------------- |
| `smoke/auth.smoke.spec.ts`         | 5         | Auth         | E2E-AUTH-001..005             |
| `smoke/navigation.smoke.spec.ts`   | 3         | Transversal  | E2E-NAV-001..003              |
| `smoke/resources.smoke.spec.ts`    | 4         | Resources    | E2E-RES-001..004              |
| `smoke/reservations.smoke.spec.ts` | 4         | Availability | E2E-AVL-001..003, E2E-AVL-007 |
| `smoke/approvals.smoke.spec.ts`    | 3         | Stockpile    | E2E-STK-001..003              |
| `smoke/reports.smoke.spec.ts`      | 3         | Reports      | E2E-RPT-001, 002, 007         |
| **Total**                          | **22–23** |              |                               |

### Características

- **Rol principal:** admin (con `storageState`)
- **Rol secundario:** estudiante (para verificar sidebar restringido)
- **Modo:** mock (determinista, sin backend)
- **Paralelismo:** `fullyParallel: true`
- **Reintentos:** 0 en local, 2 en CI
- **Reporter:** `list` (local), `html` + `github` (CI)

### Criterios de pase

- 100% tests green
- Duración total < 10 minutos
- Sin flakes en las últimas 3 corridas

### Ejecución

```bash
# Local
npx playwright test --project=smoke

# CI (automático en PR)
# Trigger: pull_request en paths bookly-mock-frontend/**
```

---

## 3. Suite: Regression (P1)

### Propósito

Cobertura amplia de todos los flujos MUST + SHOULD. Incluye happy paths completos, paths negativos (validaciones, errores) y tests de permisos por rol. Corre en **nightly** y bajo demanda.

### Specs por módulo

#### Auth regression

| Spec file                                        | Tests  | IDs de cobertura  |
| ------------------------------------------------ | ------ | ----------------- |
| `regression/auth/login.regression.spec.ts`       | 3      | E2E-AUTH-006..008 |
| `regression/auth/register.regression.spec.ts`    | 3      | E2E-AUTH-009..011 |
| `regression/auth/permissions.regression.spec.ts` | 5      | E2E-AUTH-018..022 |
| `regression/auth/roles-admin.regression.spec.ts` | 3      | E2E-AUTH-015..017 |
| `regression/auth/audit.regression.spec.ts`       | 3      | E2E-AUTH-023..025 |
| `regression/auth/two-factor.regression.spec.ts`  | 2      | E2E-AUTH-026, 029 |
| **Subtotal**                                     | **19** |                   |

#### Resources regression

| Spec file                                             | Tests  | IDs de cobertura            |
| ----------------------------------------------------- | ------ | --------------------------- |
| `regression/resources/crud.regression.spec.ts`        | 4      | E2E-RES-005..008            |
| `regression/resources/categories.regression.spec.ts`  | 6      | E2E-RES-011..016            |
| `regression/resources/programs.regression.spec.ts`    | 1      | E2E-RES-014                 |
| `regression/resources/history.regression.spec.ts`     | 1      | E2E-RES-021                 |
| `regression/resources/maintenance.regression.spec.ts` | 3      | E2E-RES-018..020 (P2)       |
| `regression/resources/import-csv.regression.spec.ts`  | 1      | E2E-RES-017 (P2, ⚠️ MD-006) |
| **Subtotal**                                          | **16** |                             |

#### Availability regression

| Spec file                                                      | Tests  | IDs de cobertura      |
| -------------------------------------------------------------- | ------ | --------------------- |
| `regression/availability/reservations-crud.regression.spec.ts` | 3      | E2E-AVL-004..006      |
| `regression/availability/calendar.regression.spec.ts`          | 2      | E2E-AVL-008..009      |
| `regression/availability/waitlist.regression.spec.ts`          | 3      | E2E-AVL-015..017      |
| `regression/availability/reassignment.regression.spec.ts`      | 2      | E2E-AVL-018..019 (P2) |
| `regression/availability/recurring.regression.spec.ts`         | 1      | E2E-AVL-014 (P2)      |
| **Subtotal**                                                   | **11** |                       |

#### Stockpile regression

| Spec file                                                      | Tests  | IDs de cobertura      |
| -------------------------------------------------------------- | ------ | --------------------- |
| `regression/stockpile/approvals-crud.regression.spec.ts`       | 3      | E2E-STK-004..006      |
| `regression/stockpile/approval-flows.regression.spec.ts`       | 2      | E2E-STK-012..013 (P2) |
| `regression/stockpile/check-in.regression.spec.ts`             | 3      | E2E-STK-017..019      |
| `regression/stockpile/vigilancia.regression.spec.ts`           | 2      | E2E-STK-009..010      |
| `regression/stockpile/documents.regression.spec.ts`            | 2      | E2E-STK-007..008      |
| `regression/stockpile/notifications-config.regression.spec.ts` | 2      | E2E-STK-020..021 (P2) |
| **Subtotal**                                                   | **14** |                       |

#### Reports regression

| Spec file                                            | Tests  | IDs de cobertura |
| ---------------------------------------------------- | ------ | ---------------- |
| `regression/reports/usage.regression.spec.ts`        | 1      | E2E-RPT-003      |
| `regression/reports/user-reports.regression.spec.ts` | 2      | E2E-RPT-005..006 |
| `regression/reports/export-csv.regression.spec.ts`   | 2      | E2E-RPT-008..009 |
| `regression/reports/feedback.regression.spec.ts`     | 1      | E2E-RPT-004      |
| `regression/reports/evaluations.regression.spec.ts`  | 3      | E2E-RPT-011..013 |
| `regression/reports/demand.regression.spec.ts`       | 1      | E2E-RPT-015 (P2) |
| `regression/reports/compliance.regression.spec.ts`   | 1      | E2E-RPT-017 (P2) |
| `regression/reports/conflicts.regression.spec.ts`    | 1      | E2E-RPT-016 (P2) |
| **Subtotal**                                         | **12** |                  |

### Características

- **Roles testeados:** admin, coordinador, profesor, estudiante (vigilancia bloqueado por MD-001)
- **Modo:** mock (nightly)
- **Paralelismo:** `fullyParallel: true`, workers: 2 (CI)
- **Reintentos:** 2 en CI
- **Reporter:** `html` + `json` + `github`
- **Artifacts:** HTML report, traces (on failure), videos (on first retry)

### Criterios de pase

- Pass rate ≥ 98%
- Flaky rate < 2%
- Duración total < 30 minutos

### Ejecución

```bash
# Local
npx playwright test --project=regression

# CI (nightly cron + manual dispatch)
# Schedule: 0 3 * * * (3 AM UTC)
```

---

## 4. Suite: Visual (P2)

### Propósito

Detectar regresiones visuales en pantallas clave mediante comparación de screenshots. Corre en nightly o bajo demanda.

### Specs

| Spec file                           | Tests | Pantallas                                                                    |
| ----------------------------------- | ----- | ---------------------------------------------------------------------------- |
| `visual/screenshots.visual.spec.ts` | 7     | Login, Dashboard, Recursos, Recurso detail, Reservas, Aprobaciones, Reportes |

### Características

- **Rol:** admin (con `storageState`)
- **Viewport:** 1280×720 (Desktop Chrome)
- **Theme:** light only (dark theme fuera de alcance)
- **Threshold:** `maxDiffPixelRatio: 0.001` (0.1%)
- **Baselines:** committeadas en `e2e/visual/screenshots.visual.spec.ts-snapshots/`

### Actualización de baselines

```bash
# Regenerar baselines después de cambio intencional de UI
npx playwright test --project=visual --update-snapshots
```

### Criterios de pase

- 0 diffs que excedan threshold
- Si diff es intencional: actualizar baseline y documentar en PR

### Ejecución

```bash
# Local
npx playwright test --project=visual

# CI (nightly, junto con regression)
```

---

## 5. Configuración de Playwright por suite

### Proyectos en `playwright.config.ts`

```typescript
projects: [
  {
    name: 'smoke',
    testDir: './e2e/smoke',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'regression',
    testDir: './e2e/regression',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'visual',
    testDir: './e2e/visual',
    use: { ...devices['Desktop Chrome'] },
  },
],
```

### Configuración compartida

```typescript
use: {
  baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4200',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'on-first-retry',
  locale: 'es-CO',
  timezoneId: 'America/Bogota',
},
```

---

## 6. CI/CD — Workflows

### 6.1 PR Gate (smoke)

```yaml
# .github/workflows/e2e-frontend.yml (extracto)
e2e-smoke:
  if: github.event_name == 'pull_request'
  runs-on: ubuntu-latest
  timeout-minutes: 15
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
    - name: Cache npm
      uses: actions/cache@v4
      with:
        path: ~/.npm
        key: npm-${{ hashFiles('bookly-mock-frontend/package-lock.json') }}
    - run: npm ci
      working-directory: bookly-mock-frontend
    - run: npx playwright install --with-deps chromium
      working-directory: bookly-mock-frontend
    - run: npx playwright test --project=smoke
      working-directory: bookly-mock-frontend
      env:
        NEXT_PUBLIC_DATA_MODE: mock
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: e2e-smoke-report
        path: bookly-mock-frontend/playwright-report/
        retention-days: 7
```

### 6.2 Nightly (regression + visual)

```yaml
e2e-nightly:
  if: github.event_name == 'schedule' || github.event_name == 'workflow_dispatch'
  runs-on: ubuntu-latest
  timeout-minutes: 45
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
    - run: npm ci
      working-directory: bookly-mock-frontend
    - run: npx playwright install --with-deps chromium
      working-directory: bookly-mock-frontend
    - run: npx playwright test --project=regression --project=visual
      working-directory: bookly-mock-frontend
      env:
        NEXT_PUBLIC_DATA_MODE: mock
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: e2e-nightly-report
        path: |
          bookly-mock-frontend/playwright-report/
          bookly-mock-frontend/test-results/
        retention-days: 30
```

---

## 7. Gestión de flakes

### Política

1. **Reintentos controlados:** max 2 en CI (no ocultar flakes, solo mitigar ruido)
2. **Tracking:** resultados JSON archivados por corrida para análisis de tendencias
3. **Umbral:** flaky rate < 2% semanal
4. **Escalamiento:** flake > 3 ocurrencias consecutivas → crear issue con label `e2e-flake`
5. **Root cause:** cada flake resuelto debe documentar la causa (timing, selector, datos, race condition)

### Señales de alerta

- Test que pasa en retry pero falla en primera ejecución consistentemente
- Tests que fallan solo en CI pero no en local (timing, recursos)
- Tests que fallan en horarios específicos (datos dependientes de tiempo)

### Herramientas de diagnóstico

- **Traces:** habilitados en first retry; descargables como artifact
- **Videos:** habilitados en first retry; descargables como artifact
- **Screenshots:** capturadas on failure
- **Console logs:** Playwright captura console por defecto

---

## 8. Artifacts y reportes

### Por corrida

| Artifact             | Suite               | Retención | Contenido                                   |
| -------------------- | ------------------- | --------- | ------------------------------------------- |
| `e2e-smoke-report`   | smoke               | 7 días    | HTML report                                 |
| `e2e-nightly-report` | regression + visual | 30 días   | HTML report + traces + videos + screenshots |
| `e2e-results.json`   | todas               | 30 días   | Resultados JSON para métricas               |

### Estructura del reporte HTML

- Lista de tests: pass/fail/skip/flaky
- Traces embebidos (clickeables para reproducir)
- Videos de test fallidos
- Screenshots de comparación visual (diffs)

---

## 9. Ejecución local — Cheat sheet

```bash
# Correr toda la suite smoke
npx playwright test --project=smoke

# Correr regression de un módulo específico
npx playwright test --project=regression e2e/regression/auth/

# Correr un spec específico
npx playwright test --project=regression e2e/regression/auth/login.regression.spec.ts

# Correr con UI interactiva
npx playwright test --project=smoke --ui

# Correr con headed browser (ver navegador)
npx playwright test --project=smoke --headed

# Ver reporte HTML de última corrida
npx playwright show-report

# Actualizar visual baselines
npx playwright test --project=visual --update-snapshots

# Debug un test específico
npx playwright test --project=smoke --debug e2e/smoke/auth.smoke.spec.ts
```

---

## 10. Expansión futura

### Cross-browser (post Fase 3)

Agregar Firefox y WebKit como projects opcionales en nightly:

```typescript
{ name: 'firefox-regression', testDir: './e2e/regression', use: { ...devices['Desktop Firefox'] } },
{ name: 'webkit-regression', testDir: './e2e/regression', use: { ...devices['Desktop Safari'] } },
```

### Mobile viewport (post Fase 3)

```typescript
{ name: 'mobile-smoke', testDir: './e2e/smoke', use: { ...devices['iPhone 14'] } },
```

### Serve mode (post Fase 3)

- Agregar `globalSetup` con API seeding
- Configurar `PLAYWRIGHT_BASE_URL` para backend real
- Agregar jobs CI con docker-compose para backend
