# Plan E2E — Bookly Mock Frontend

> Estrategia integral de pruebas end-to-end con Playwright para `bookly-mock-frontend`, cubriendo 45 RFs, 5 módulos, 5 roles, con ejecución local y CI.

**Última actualización:** 2026-02-17  
**Versión:** 1.0.0  
**Estado:** Aprobado para implementación

---

## 1) E2E Profile

| Campo                | Valor                                                                   |
| -------------------- | ----------------------------------------------------------------------- |
| **Criticality**      | C2 (alta) — sistema institucional con auditoría, aprobaciones, reportes |
| **Platforms**        | Web (desktop, 1280×720)                                                 |
| **Test levels**      | E2E funcional + E2E visual (screenshot) + E2E permission                |
| **Tooling**          | Playwright ^1.44 + HTML/JSON reporters + traces + videos                |
| **Environments**     | local mock (dev), CI mock (PR smoke), CI mock (nightly regression)      |
| **Release strategy** | PR smoke gate → nightly regression → manual release sign-off            |
| **Data correctness** | Reportes: conteos, filtros, exportaciones. No ledger/finanzas           |
| **Risk Tier**        | R1 (medio-alto: datos académicos, no PII financiero)                    |
| **Locale**           | `es-CO` principal. Subset `en` en P2                                    |
| **Timezone**         | `America/Bogota`                                                        |
| **Browser**          | Chromium (PR). Firefox/WebKit solo nightly opcional                     |

---

## 2) Estado actual (baseline)

### 2.1 Specs existentes

| Spec                   | Tests  | Cobertura real                                               |
| ---------------------- | ------ | ------------------------------------------------------------ |
| `auth.spec.ts`         | 5      | Login render, validation, mock login, redirect, register nav |
| `resources.spec.ts`    | 3      | List render, detail nav, create nav                          |
| `reservations.spec.ts` | 3      | List render, calendar render, new nav                        |
| `admin.spec.ts`        | 5      | Audit, roles, flows, integrations, evaluations (render only) |
| `reports.spec.ts`      | 4      | Dashboard, demand, compliance, conflicts (render only)       |
| **Total**              | **20** | **Solo render + navegación. Sin CRUD, negativos, roles.**    |

### 2.2 Gaps críticos

1. **No `data-testid`** — selectores por CSS/texto (frágil)
2. **No fixtures/sesiones reutilizables** — login repetido en cada `beforeEach`
3. **No Page Objects** — lógica duplicada
4. **Solo rol admin** — no se testean otros roles
5. **No paths negativos** — no se validan errores ni permisos
6. **No CI workflow** — E2E no corre en GitHub Actions
7. **No separación smoke/regression** — todo es una suite plana
8. **Discrepancia de password** — mock data usa `admin123`, specs usan `Admin123!`

### 2.3 Playwright config actual

```typescript
// playwright.config.ts
testDir: './e2e'
fullyParallel: true
reporter: 'html'
projects: [{ name: 'chromium' }]
webServer: { command: 'npm run dev', url: 'http://localhost:4200' }
trace: 'on-first-retry'
screenshot: 'only-on-failure'
```

---

## 3) Estrategia de datos de prueba

### 3.1 Usuarios mock

| Rol         | Email                     | Password | ID     | Estado                   |
| ----------- | ------------------------- | -------- | ------ | ------------------------ |
| admin       | `admin@ufps.edu.co`       | admin123 | user_1 | ✅ Existe                |
| coordinador | `coordinador@ufps.edu.co` | coord123 | user_2 | ✅ Existe                |
| profesor    | `profesor@ufps.edu.co`    | prof123  | user_3 | ✅ Existe                |
| estudiante  | `estudiante@ufps.edu.co`  | est123   | user_4 | ✅ Existe                |
| vigilancia  | —                         | —        | —      | ⚠️ **MD-001: No existe** |

> Fuente: `src/infrastructure/mock/mockData.ts` y `src/infrastructure/mock/data/auth-service.mock.ts`

### 3.2 Principios de determinismo

1. **Mock mode default** — MockService maneja datos in-memory, determinista por diseño
2. **Fixtures por rol** — Playwright `storageState` para cada rol (login una vez en `globalSetup`)
3. **Data builders** — funciones TypeScript para generar entidades con prefijo `E2E-`
4. **Aislamiento** — cada test crea sus datos vía UI o mock; no depende de orden de ejecución
5. **Timezone fijo** — `America/Bogota` en Playwright config
6. **Locale fijo** — `es-CO` para formateo de fechas/números
7. **IDs estables** — mock data tiene IDs fijos (`user_1`, `user_2`, etc.)

### 3.3 Serve mode (nightly futuro)

- Setup vía API calls en `globalSetup` (crear entidades mínimas)
- Teardown: borrar entidades con prefijo `E2E-`
- Requiere backend corriendo (docker-compose)
- **No implementado en Fase 0-1**; se activa en Fase 3

---

## 4) Estrategia de autenticación y permisos

### 4.1 Auth fixtures (`storageState`)

```text
e2e/.auth/
  admin.json          # storageState tras login admin
  coordinador.json    # storageState tras login coordinador
  profesor.json       # storageState tras login profesor
  estudiante.json     # storageState tras login estudiante
  vigilancia.json     # ⚠️ Bloqueado por MD-001
```

- `global-setup.ts` ejecuta login para cada rol y guarda `storageState`
- Cada spec usa `test.use({ storageState: '.auth/admin.json' })`
- Elimina login repetido en `beforeEach` (~30s ahorro por archivo de spec)

### 4.2 Matriz de permisos por ruta

| Ruta                          | Roles permitidos   | Roles denegados                   |
| ----------------------------- | ------------------ | --------------------------------- |
| `/admin/roles`                | admin              | coordinador, profesor, estudiante |
| `/admin/usuarios`             | admin              | coordinador, profesor, estudiante |
| `/admin/auditoria`            | admin              | coordinador, profesor, estudiante |
| `/admin/horarios`             | admin              | coordinador, profesor, estudiante |
| `/admin/integraciones`        | admin              | coordinador, profesor, estudiante |
| `/admin/evaluaciones`         | admin              | coordinador, profesor, estudiante |
| `/admin/flujos-aprobacion`    | admin              | coordinador, profesor, estudiante |
| `/admin/templates`            | admin              | coordinador, profesor, estudiante |
| `/admin/canales-notificacion` | admin              | coordinador, profesor, estudiante |
| `/categorias`                 | admin, coordinador | profesor, estudiante              |
| `/mantenimientos`             | admin, coordinador | profesor, estudiante              |
| `/programas`                  | admin, coordinador | profesor, estudiante              |
| `/lista-espera`               | admin, coordinador | profesor, estudiante              |
| `/aprobaciones`               | admin, coordinador | profesor, estudiante              |
| `/vigilancia`                 | admin, vigilancia  | coordinador, profesor, estudiante |
| `/reportes`                   | admin, coordinador | profesor, estudiante              |
| `/reportes/*`                 | admin, coordinador | profesor, estudiante              |
| `/reservas/reasignacion`      | admin, coordinador | profesor, estudiante              |

> **⚠️ MD-015**: Comportamiento ante ruta denegada no definido. ¿Redirect a `/dashboard` o página 403?

### 4.3 Tests de permisos

Patrón: login como rol denegado → navegar a ruta → assert redirect/forbidden.

```typescript
// Ejemplo de test de permiso
test("estudiante cannot access /admin/roles", async ({ page }) => {
  await page.goto("/es/admin/roles");
  // Expect redirect to dashboard or 403 page
  await expect(page).not.toHaveURL(/admin\/roles/);
});
```

---

## 5) Arquitectura de la suite E2E

### 5.1 Estructura de carpetas

```text
bookly-mock-frontend/
  e2e/
    .auth/                              # storageState (gitignored)
      .gitignore
    fixtures/
      test-users.ts                     # credenciales centralizadas
      auth.fixture.ts                   # helpers de login + role configs
      data.fixture.ts                   # test data builders por módulo
    helpers/
      navigation.helper.ts             # goto con prefijo locale
      assertions.helper.ts             # patrones de aserción comunes
      wait.helper.ts                   # waiters inteligentes
    pages/                              # Page Object Model
      login.page.ts
      dashboard.page.ts
      resources-list.page.ts
      resource-detail.page.ts
      resource-form.page.ts
      reservations-list.page.ts
      reservation-form.page.ts
      reservation-detail.page.ts
      calendar.page.ts
      approvals-list.page.ts
      approval-detail.page.ts
      reports-dashboard.page.ts
      admin-roles.page.ts
      admin-users.page.ts
      check-in.page.ts
      vigilancia.page.ts
      sidebar.page.ts
    smoke/                              # P0 — <10 min, gate de PR
      auth.smoke.spec.ts
      resources.smoke.spec.ts
      reservations.smoke.spec.ts
      approvals.smoke.spec.ts
      reports.smoke.spec.ts
      navigation.smoke.spec.ts
    regression/                         # P1 — nightly
      auth/
        login.regression.spec.ts
        register.regression.spec.ts
        permissions.regression.spec.ts
        roles-admin.regression.spec.ts
        audit.regression.spec.ts
        two-factor.regression.spec.ts
      resources/
        crud.regression.spec.ts
        categories.regression.spec.ts
        programs.regression.spec.ts
        maintenance.regression.spec.ts
        import-csv.regression.spec.ts
        history.regression.spec.ts
      availability/
        reservations-crud.regression.spec.ts
        calendar.regression.spec.ts
        waitlist.regression.spec.ts
        reassignment.regression.spec.ts
        recurring.regression.spec.ts
      stockpile/
        approvals-crud.regression.spec.ts
        approval-flows.regression.spec.ts
        check-in.regression.spec.ts
        vigilancia.regression.spec.ts
        documents.regression.spec.ts
        notifications-config.regression.spec.ts
      reports/
        usage.regression.spec.ts
        user-reports.regression.spec.ts
        export-csv.regression.spec.ts
        feedback.regression.spec.ts
        evaluations.regression.spec.ts
        demand.regression.spec.ts
        compliance.regression.spec.ts
        conflicts.regression.spec.ts
    visual/                             # P2 — semanal
      screenshots.visual.spec.ts
    global-setup.ts                     # Auth state setup para todos los roles
    global-teardown.ts                  # Cleanup
```

### 5.2 Naming conventions

| Elemento                | Convención                  | Ejemplo                              |
| ----------------------- | --------------------------- | ------------------------------------ |
| Spec files              | `{feature}.{suite}.spec.ts` | `auth.smoke.spec.ts`                 |
| Page Objects            | `{feature}.page.ts`         | `resources-list.page.ts`             |
| Fixtures                | `{domain}.fixture.ts`       | `auth.fixture.ts`                    |
| Test IDs (trazabilidad) | `E2E-{MODULE}-{NNN}`        | `E2E-AUTH-001`                       |
| `data-testid`           | `{component}-{element}`     | `resource-form-name`, `login-submit` |
| Helpers                 | `{domain}.helper.ts`        | `navigation.helper.ts`               |

### 5.3 Selectores: `data-testid` obligatorio

**Convención de nombrado `data-testid`:**

```text
{page/component}-{element}[-{qualifier}]
```

Ejemplos:

- `login-email-input`
- `login-password-input`
- `login-submit-btn`
- `resource-form-name-input`
- `resource-form-submit-btn`
- `sidebar-nav-recursos`
- `sidebar-nav-reservas`
- `approval-card-{id}`
- `approval-approve-btn`
- `approval-reject-btn`
- `report-export-csv-btn`
- `toast-success`
- `toast-error`

**Backlog de instrumentación** (componentes que necesitan `data-testid`):

1. Login form (email, password, submit, error message)
2. Resource form (todos los campos + submit)
3. Reservation form (todos los campos + submit)
4. Sidebar navigation items
5. Data tables (rows, action buttons)
6. Modal dialogs (confirm, cancel, form fields)
7. Toast notifications (success, error)
8. Filter/search inputs
9. Export buttons (CSV, PDF)
10. Approval action buttons (approve, reject, comment)

### 5.4 Page Object Model — patrón

```typescript
// Ejemplo: login.page.ts
import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("login-submit-btn");
    this.errorMessage = page.getByTestId("login-error-message");
  }

  async goto() {
    await this.page.goto("/es/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError() {
    await expect(this.errorMessage).toBeVisible();
  }
}
```

---

## 6) Playwright config propuesta

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "e2e-results.json" }],
    ...(process.env.CI ? [["github" as const]] : [["list" as const]]),
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    locale: "es-CO",
    timezoneId: "America/Bogota",
  },
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  projects: [
    {
      name: "smoke",
      testDir: "./e2e/smoke",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "regression",
      testDir: "./e2e/regression",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual",
      testDir: "./e2e/visual",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4200",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

---

## 7) E2E visual (screenshots)

### 7.1 Pantallas objetivo (P2)

| Pantalla       | Ruta                | Rol     | Viewport |
| -------------- | ------------------- | ------- | -------- |
| Login          | `/es/login`         | público | 1280×720 |
| Dashboard      | `/es/dashboard`     | admin   | 1280×720 |
| Recursos list  | `/es/recursos`      | admin   | 1280×720 |
| Recurso detail | `/es/recursos/[id]` | admin   | 1280×720 |
| Reservas list  | `/es/reservas`      | admin   | 1280×720 |
| Aprobaciones   | `/es/aprobaciones`  | admin   | 1280×720 |
| Reportes       | `/es/reportes`      | admin   | 1280×720 |

### 7.2 Estrategia

- Baselines en `e2e/visual/baselines/` (versionadas en git)
- `toHaveScreenshot()` con threshold 0.1%
- Solo desktop (1280×720)
- Solo light theme (dark theme fuera de alcance; ver MD-011)
- Actualizar baselines: `npx playwright test --project=visual --update-snapshots`
- CI: fail on diff > threshold, artifact con diff images

---

## 8) CI/CD — GitHub Actions

### 8.1 Workflow propuesto: `.github/workflows/e2e-frontend.yml`

**Triggers:**

- `pull_request` (paths: `bookly-mock-frontend/**`) → smoke
- `schedule: cron '0 3 * * *'` → regression nightly
- `workflow_dispatch` → manual (smoke / regression / visual / all)

**Jobs:**

- `e2e-smoke` (PR): instalar deps → instalar Playwright → run smoke → upload report
- `e2e-regression` (nightly): instalar deps → instalar Playwright → run regression → upload report+traces
- `e2e-visual` (nightly/manual): run visual → upload baselines+diffs

### 8.2 Gates

| Trigger | Suite                 | Bloquea merge | Tiempo max |
| ------- | --------------------- | ------------- | ---------- |
| PR      | smoke                 | **Sí**        | 10 min     |
| Nightly | regression            | No (notifica) | 30 min     |
| Release | smoke + P0 regression | **Sí**        | 15 min     |

### 8.3 Artifacts

- HTML report (siempre)
- Traces + videos (on failure)
- Screenshots diff (visual suite)
- JSON results (para tracking de métricas)

### 8.4 Flake management

- `retries: 2` en CI
- No ocultar flakes: reportar en JSON y trackear
- Flake > 3 ocurrencias consecutivas → crear issue automático
- Meta: flaky rate < 2% semanal

---

## 9) Trazabilidad

### 9.1 Convención de test ID

Cada test lleva un comentario con su ID de trazabilidad:

```typescript
// E2E-AUTH-001 | HU-35 | RF-43 | Login admin happy path
test('admin logs in successfully', async ({ page }) => { ... });
```

### 9.2 Documentos de referencia

| Documento                            | Propósito                                    |
| ------------------------------------ | -------------------------------------------- |
| `docs/qa/e2e/PLAN.md`                | Este documento — estrategia completa         |
| `docs/qa/e2e/COVERAGE_MATRIX.md`     | Tabla completa HU/RF → casos E2E             |
| `docs/qa/e2e/ROADMAP-PLAN.md`        | Fases con tareas y criterios                 |
| `docs/qa/e2e/SUITES.md`              | Definición de suites smoke/regression/visual |
| `docs/qa/e2e/MISSING_DEFINITIONS.md` | Items pendientes de definición               |

---

## 10) Riesgos y mitigaciones

| #   | Riesgo                                    | Impacto                                 | Mitigación                                     |
| --- | ----------------------------------------- | --------------------------------------- | ---------------------------------------------- |
| 1   | Selectores inestables (sin `data-testid`) | Flakiness alta                          | Instrumentar `data-testid` antes de cada fase  |
| 2   | Datos no deterministas                    | Tests fallan aleatoriamente             | Fixtures deterministas + mock mode             |
| 3   | Backend inestable en serve mode           | Nightly falla                           | Smoke en mock mode; serve mode es stretch goal |
| 4   | Suite lenta                               | Bloquea PRs                             | Sharding por suite + parallelism               |
| 5   | Falta usuario vigilancia                  | Tests de RF-23 bloqueados               | MD-001: crear mock user vigilancia             |
| 6   | PDFs no legibles                          | No se pueden extraer flujos adicionales | MD-012: pedir specs textuales                  |

---

## Apéndice A — Módulos y rutas cubiertas

### Auth (RF-41..45)

- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/profile`, `/profile/seguridad`
- `/admin/roles`, `/admin/usuarios`, `/admin/auditoria`

### Resources (RF-01..06)

- `/recursos`, `/recursos/nuevo`, `/recursos/[id]`, `/recursos/[id]/editar`, `/recursos/[id]/historial`
- `/categorias`, `/programas`, `/programas/[id]`
- `/mantenimientos`
- `/admin/horarios`

### Availability (RF-07..19)

- `/reservas`, `/reservas/nueva`, `/reservas/[id]`, `/reservas/reasignacion`
- `/calendario`
- `/lista-espera`
- `/admin/horarios`, `/admin/integraciones`

### Stockpile (RF-20..30)

- `/aprobaciones`, `/aprobaciones/[id]`
- `/historial-aprobaciones`
- `/vigilancia`, `/check-in`
- `/admin/flujos-aprobacion`, `/admin/templates`, `/admin/canales-notificacion`

### Reports (RF-31..40)

- `/reportes`, `/reportes/recursos`, `/reportes/usuarios`, `/reportes/avanzado`
- `/reportes/demanda-insatisfecha`, `/reportes/cumplimiento`, `/reportes/conflictos`
- `/admin/evaluaciones`
- `/dashboard`
