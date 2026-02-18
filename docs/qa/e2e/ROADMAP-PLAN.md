# Roadmap de Implementación E2E — Bookly Mock Frontend

> Plan de implementación por fases con tareas técnicas detalladas, criterios de aceptación y estimaciones.

**Última actualización:** 2026-02-17
**Total de fases:** 4 (Fase 0–3)
**Duración estimada total:** 5–6 semanas

---

## Resumen de fases

| Fase | Nombre               | Duración    | Tests     | Objetivo                                          |
| ---- | -------------------- | ----------- | --------- | ------------------------------------------------- |
| 0    | Fundación            | 3–5 días    | 0 (infra) | Config, fixtures, Page Objects base, storageState |
| 1    | Smoke críticos       | 1 semana    | ~23 P0    | Gate rápido de PR (<10 min)                       |
| 2    | Regression funcional | 2–3 semanas | ~59 P1    | Cobertura MUST+SHOULD + permisos + negativos      |
| 3    | Visual + hardening   | 1 semana    | ~24 P2    | Screenshots, serve mode, release evidence         |

---

## Fase 0 — Fundación (3–5 días)

### Objetivo

Establecer la infraestructura técnica de la suite E2E: configuración de Playwright, fixtures de autenticación, Page Objects base, helpers y estructura de carpetas.

### Tareas técnicas

#### F0-T01: Crear estructura de carpetas E2E

**Archivos a crear:**

```text
e2e/
  .auth/.gitignore
  fixtures/
    test-users.ts
    auth.fixture.ts
    data.fixture.ts
  helpers/
    navigation.helper.ts
    assertions.helper.ts
    wait.helper.ts
  pages/
    login.page.ts
    dashboard.page.ts
    sidebar.page.ts
  smoke/
    (vacío, se llena en Fase 1)
  regression/
    (vacío, se llena en Fase 2)
  visual/
    (vacío, se llena en Fase 3)
  global-setup.ts
  global-teardown.ts
```

**Criterio:** estructura creada y reconocida por Playwright config.

#### F0-T02: Crear `e2e/fixtures/test-users.ts`

Centralizar credenciales de usuarios mock:

```typescript
export const TEST_USERS = {
  admin: { email: "admin@ufps.edu.co", password: "admin123", id: "user_1" },
  coordinador: {
    email: "coordinador@ufps.edu.co",
    password: "coord123",
    id: "user_2",
  },
  profesor: {
    email: "profesor@ufps.edu.co",
    password: "prof123",
    id: "user_3",
  },
  estudiante: {
    email: "estudiante@ufps.edu.co",
    password: "est123",
    id: "user_4",
  },
  // vigilancia: ⚠️ MD-001 — pendiente de crear mock user
} as const;

export type TestRole = keyof typeof TEST_USERS;
```

**Criterio:** importable desde cualquier spec/fixture sin hardcode de credenciales.

#### F0-T03: Crear `e2e/global-setup.ts` con storageState por rol

Login programático para cada rol, guardando `storageState` en `e2e/.auth/`:

- Ejecuta login vía UI para admin, coordinador, profesor, estudiante
- Guarda cookies/localStorage en archivos JSON reutilizables
- Configura `.auth/.gitignore` para excluir los JSON

**Criterio:** `npx playwright test` no repite login en cada test; `storageState` funciona.

#### F0-T04: Crear `e2e/global-teardown.ts`

Cleanup básico (puede estar vacío inicialmente, se expande en serve mode).

#### F0-T05: Crear Page Objects base

**`login.page.ts`:**

- `goto()`, `login(email, password)`, `expectError()`, `expectDashboard()`
- Selectores por `data-testid` (requiere F0-T08)

**`dashboard.page.ts`:**

- `expectLoaded()`, `expectKPIs()`, `getUserName()`

**`sidebar.page.ts`:**

- `expectLink(name)`, `expectNoLink(name)`, `getVisibleLinks()`

**Criterio:** Page Objects importables y funcionales con los `data-testid` instrumentados.

#### F0-T06: Crear helpers

**`navigation.helper.ts`:**

- `gotoWithLocale(page, path, locale = 'es')` — prefija la ruta con `/{locale}`

**`assertions.helper.ts`:**

- `expectToast(page, type: 'success' | 'error')` — assert toast visible
- `expectRedirectTo(page, pattern)` — assert URL match después de redirect

**`wait.helper.ts`:**

- `waitForPageLoad(page)` — espera a que no haya spinners/skeletons

#### F0-T07: Actualizar `playwright.config.ts`

Cambios clave:

- Agregar `globalSetup` y `globalTeardown`
- Definir projects: `smoke`, `regression`, `visual`
- Agregar `video: 'on-first-retry'`
- Agregar `locale: 'es-CO'`, `timezoneId: 'America/Bogota'`
- Agregar reporters: `html`, `json`, `github` (CI)
- Subir `workers` a 2 en CI

#### F0-T08: Instrumentar `data-testid` en login form

Agregar atributos `data-testid` a:

- Input email: `login-email-input`
- Input password: `login-password-input`
- Botón submit: `login-submit-btn`
- Mensaje de error: `login-error-message`

**Archivo:** `src/app/[locale]/login/page.tsx`

#### F0-T09: Migrar auth.spec.ts existente a nueva estructura

- Mover tests existentes de `auth.spec.ts` a `e2e/smoke/auth.smoke.spec.ts`
- Refactorizar para usar `LoginPage` Page Object
- Corregir password de `Admin123!` a `admin123` (según mock data real)
- Verificar que pasan con la nueva config

### Criterios de aceptación Fase 0

- [ ] `npx playwright test e2e/smoke/ --project=smoke` ejecuta sin errores (puede ser 0 tests si los specs se crean en Fase 1)
- [ ] `storageState` funciona para admin (login una vez, reutiliza en tests)
- [ ] Estructura de carpetas E2E completa
- [ ] `data-testid` en login form instrumentado
- [ ] Auth spec migrado y pasando

### Dependencias

- Ninguna externa
- **Bloqueado parcialmente por:** MD-001 (vigilancia), MD-005 (password discrepancy — resolver verificando mock data)

---

## Fase 1 — Smoke críticos (1 semana)

### Objetivo

Crear la suite smoke (~23 tests P0) que sirva como gate de PR en CI. Tiempo máximo: 10 minutos.

### Tareas técnicas

#### F1-T01: Crear `e2e/smoke/auth.smoke.spec.ts`

Tests (E2E-AUTH-001 a E2E-AUTH-005):

1. Login admin → dashboard
2. Login inválido → error
3. Submit vacío → validación
4. Logout → redirect login
5. Acceso no autenticado → redirect login

#### F1-T02: Crear `e2e/smoke/navigation.smoke.spec.ts`

Tests (E2E-NAV-001 a E2E-NAV-003):

1. Dashboard carga con KPIs (admin)
2. Sidebar admin muestra todos los enlaces
3. Sidebar estudiante muestra solo enlaces permitidos

**Requiere:** Page Object `sidebar.page.ts` + `data-testid` en sidebar items

#### F1-T03: Instrumentar `data-testid` en sidebar

Agregar `data-testid` a cada item del sidebar:

- `sidebar-nav-recursos`
- `sidebar-nav-reservas`
- `sidebar-nav-calendario`
- `sidebar-nav-aprobaciones`
- `sidebar-nav-reportes`
- `sidebar-nav-admin-roles`
- etc.

**Archivo:** componente `AppSidebar` o equivalente

#### F1-T04: Crear Page Objects para Resources

**`resources-list.page.ts`:** `expectLoaded()`, `getResourceCount()`, `clickResource(index)`, `clickCreate()`

**`resource-form.page.ts`:** `fillName(v)`, `fillType(v)`, `fillLocation(v)`, `fillCapacity(v)`, `submit()`, `expectValidationErrors()`

#### F1-T05: Instrumentar `data-testid` en Resource form y list

- `resource-form-name-input`
- `resource-form-type-select`
- `resource-form-location-input`
- `resource-form-capacity-input`
- `resource-form-submit-btn`
- `resource-card` o `resource-table-row`
- `resource-create-btn`

#### F1-T06: Crear `e2e/smoke/resources.smoke.spec.ts`

Tests (E2E-RES-001 a E2E-RES-004):

1. Lista de recursos visible (admin)
2. Crear recurso → éxito
3. Ver detalle de recurso
4. Editar recurso → éxito

#### F1-T07: Crear Page Objects para Reservations

**`reservations-list.page.ts`:** `expectLoaded()`, `clickNew()`, `getReservationCount()`

**`reservation-form.page.ts`:** `selectResource(v)`, `selectDate(v)`, `selectTime(v)`, `submit()`

#### F1-T08: Instrumentar `data-testid` en Reservation form

- `reservation-form-resource-select`
- `reservation-form-date-input`
- `reservation-form-time-input`
- `reservation-form-submit-btn`

#### F1-T09: Crear `e2e/smoke/reservations.smoke.spec.ts`

Tests (E2E-AVL-001 a E2E-AVL-003):

1. Lista de reservas visible
2. Crear reserva → éxito
3. Calendario carga con eventos

#### F1-T10: Crear Page Objects para Approvals

**`approvals-list.page.ts`:** `expectLoaded()`, `clickApproval(index)`, `getStats()`

**`approval-detail.page.ts`:** `expectLoaded()`, `approve()`, `reject(reason)`, `expectStatus(s)`

#### F1-T11: Instrumentar `data-testid` en Approvals

- `approval-card-{id}`
- `approval-approve-btn`
- `approval-reject-btn`
- `approval-reject-reason-input`
- `approval-status-badge`

#### F1-T12: Crear `e2e/smoke/approvals.smoke.spec.ts`

Tests (E2E-STK-001 a E2E-STK-003):

1. Lista de aprobaciones visible (admin)
2. Detalle de solicitud visible
3. Aprobar solicitud → estado cambia

#### F1-T13: Crear `e2e/smoke/reports.smoke.spec.ts`

Tests (E2E-RPT-001, E2E-RPT-002, E2E-RPT-007):

1. Dashboard de reportes carga
2. Navegar a reporte de recursos
3. Botón exportar CSV presente

#### F1-T14: Crear workflow CI `.github/workflows/e2e-frontend.yml`

- Trigger: `pull_request` en paths `bookly-mock-frontend/**`
- Job: checkout → setup node → npm ci → install playwright → run smoke → upload artifact
- Cache: `~/.npm` + Playwright browsers

#### F1-T15: Medir y optimizar tiempo de suite

- Medir duración total de smoke
- Si > 10 min, optimizar: parallelism, storageState, selectores
- Meta: < 10 min total

### Criterios de aceptación Fase 1

- [ ] 23 smoke tests creados y pasando
- [ ] Suite smoke < 10 minutos
- [ ] CI workflow funcional en PR
- [ ] 100% pass rate en branch principal
- [ ] Page Objects para login, dashboard, sidebar, resources, reservations, approvals, reports
- [ ] `data-testid` instrumentado en: login, sidebar, resource form/list, reservation form, approval actions

### Dependencias

- **Fase 0 completada**
- **MD-005 resuelto** (password correcta verificada)

---

## Fase 2 — Regression funcional (2–3 semanas)

### Objetivo

Completar la cobertura de todos los flujos MUST + SHOULD con paths negativos y tests de permisos por rol. ~59 tests P1.

### Semana 1: Auth + Resources regression

#### F2-T01: `regression/auth/login.regression.spec.ts`

- E2E-AUTH-006 a E2E-AUTH-008: login por cada rol
- Verificar sidebar diferente por rol

#### F2-T02: `regression/auth/register.regression.spec.ts`

- E2E-AUTH-009 a E2E-AUTH-011: registro happy + validaciones
- ⚠️ E2E-AUTH-009 puede estar bloqueado por MD-009

#### F2-T03: `regression/auth/permissions.regression.spec.ts`

- E2E-AUTH-018 a E2E-AUTH-022: permission tests por ruta
- ⚠️ Depende de MD-015 (comportamiento ante ruta denegada)

#### F2-T04: `regression/auth/roles-admin.regression.spec.ts`

- E2E-AUTH-015 a E2E-AUTH-017: CRUD de roles
- Instrumentar `data-testid` en roles admin page

#### F2-T05: `regression/auth/audit.regression.spec.ts`

- E2E-AUTH-023 a E2E-AUTH-025: auditoría list, filter, export CSV

#### F2-T06: `regression/auth/two-factor.regression.spec.ts`

- E2E-AUTH-026: sección 2FA visible en perfil seguridad
- E2E-AUTH-029: perfil de usuario carga

#### F2-T07: `regression/resources/crud.regression.spec.ts`

- E2E-RES-005 a E2E-RES-008: eliminar recurso, validaciones negativas, atributos completos

#### F2-T08: `regression/resources/categories.regression.spec.ts`

- E2E-RES-011 a E2E-RES-016: CRUD categorías + acceso coordinador + permiso denegado estudiante

#### F2-T09: `regression/resources/programs.regression.spec.ts`

- E2E-RES-014: lista de programas

#### F2-T10: `regression/resources/history.regression.spec.ts`

- E2E-RES-021: historial de recurso

#### F2-T11: Instrumentar `data-testid` restantes para Auth y Resources

- Admin roles: form fields, table rows, delete button
- Admin users: search, table
- Admin audit: filter inputs, export button
- Categories: form, table
- Profile: info fields

### Semana 2: Availability + Stockpile regression

#### F2-T12: `regression/availability/reservations-crud.regression.spec.ts`

- E2E-AVL-004 a E2E-AVL-006: editar, cancelar, validaciones
- Instrumentar `data-testid` en reservation detail actions

#### F2-T13: `regression/availability/calendar.regression.spec.ts`

- E2E-AVL-008, E2E-AVL-009: cambio de vista, filtros de calendario

#### F2-T14: `regression/availability/waitlist.regression.spec.ts`

- E2E-AVL-015 a E2E-AVL-017: lista espera admin, coordinador, permiso estudiante

#### F2-T15: `regression/availability/reassignment.regression.spec.ts`

- E2E-AVL-018: interfaz de reasignación visible

#### F2-T16: `regression/stockpile/approvals-crud.regression.spec.ts`

- E2E-STK-004 to E2E-STK-006: rechazar con motivo, acceso coordinador, permiso estudiante

#### F2-T17: `regression/stockpile/approval-flows.regression.spec.ts`

- E2E-STK-012: lista de flujos de aprobación configurados

#### F2-T18: `regression/stockpile/check-in.regression.spec.ts`

- E2E-STK-017: interfaz check-in visible

#### F2-T19: `regression/stockpile/vigilancia.regression.spec.ts`

- E2E-STK-009, E2E-STK-010: panel vigilancia admin, permiso coordinador denegado
- ⚠️ E2E-STK-011 bloqueado por MD-001

#### F2-T20: `regression/stockpile/documents.regression.spec.ts`

- E2E-STK-007, E2E-STK-008: generar documento, notificación toast

#### F2-T21: Instrumentar `data-testid` para Availability + Stockpile

- Calendar: view switcher, date nav, resource filter
- Waitlist: table rows, position
- Approval detail: approve/reject buttons, reason input, document download
- Vigilancia: reservation cards, alert badges

### Semana 3: Reports regression + consolidación

#### F2-T22: `regression/reports/usage.regression.spec.ts`

- E2E-RPT-003: dashboard coordinador

#### F2-T23: `regression/reports/user-reports.regression.spec.ts`

- E2E-RPT-005, E2E-RPT-006: tabla usuarios, filtro por fecha

#### F2-T24: `regression/reports/export-csv.regression.spec.ts`

- E2E-RPT-008, E2E-RPT-009: descarga CSV desde recursos y usuarios

#### F2-T25: `regression/reports/evaluations.regression.spec.ts`

- E2E-RPT-011: lista de evaluaciones visible

#### F2-T26: `regression/reports/feedback.regression.spec.ts`

- E2E-RPT-004: permiso estudiante denegado en reportes

#### F2-T27: Agregar nightly CI job

Actualizar `.github/workflows/e2e-frontend.yml`:

- `schedule: cron '0 3 * * *'`
- Job `e2e-regression` corre project regression
- Upload traces + videos como artifacts
- Notificación en caso de fallo (Slack/email o GitHub issue)

#### F2-T28: Estabilización y flake fixing

- Revisar resultados de 3+ corridas nightly
- Corregir flakes (selectores, timing, datos)
- Meta: flaky rate < 2%

### Criterios de aceptación Fase 2

- [ ] 59 regression tests creados y pasando
- [ ] Cobertura ≥ 85% de flujos MUST + SHOULD
- [ ] Tests de permisos por rol para rutas restringidas
- [ ] Nightly CI corriendo y notificando
- [ ] Flaky rate < 2% en últimas 5 corridas
- [ ] `data-testid` instrumentado en todos los componentes necesarios

### Dependencias

- **Fase 1 completada**
- **MD-015 resuelto** (para tests de permisos)
- **MD-001 parcialmente** (para vigilancia tests)

---

## Fase 3 — Visual + hardening (1 semana)

### Objetivo

Agregar visual regression, reportes extendidos (COULD), optimizar para serve mode nightly, y generar evidencia de release.

### Tareas técnicas

#### F3-T01: Crear `e2e/visual/screenshots.visual.spec.ts`

Screenshots determinísticos de 7 pantallas:

1. Login page (público)
2. Dashboard (admin)
3. Recursos list (admin)
4. Recurso detail (admin)
5. Reservas list (admin)
6. Aprobaciones list (admin)
7. Reportes dashboard (admin)

Cada test: `await expect(page).toHaveScreenshot('nombre.png', { maxDiffPixelRatio: 0.001 });`

#### F3-T02: Generar baselines iniciales

- Correr `npx playwright test --project=visual --update-snapshots`
- Commit baselines en `e2e/visual/screenshots.visual.spec.ts-snapshots/`

#### F3-T03: Crear regression specs para COULD (extended)

Completar los ~24 tests P2 de COVERAGE_MATRIX:

- `regression/resources/maintenance.regression.spec.ts` (E2E-RES-018 a E2E-RES-020)
- `regression/resources/import-csv.regression.spec.ts` (E2E-RES-017, si UI disponible)
- `regression/availability/recurring.regression.spec.ts` (E2E-AVL-014)
- `regression/stockpile/notifications-config.regression.spec.ts` (E2E-STK-020, E2E-STK-021)
- `regression/reports/demand.regression.spec.ts` (E2E-RPT-015)
- `regression/reports/compliance.regression.spec.ts` (E2E-RPT-017)
- `regression/reports/conflicts.regression.spec.ts` (E2E-RPT-016)

#### F3-T04: Agregar visual CI job

Actualizar workflow para incluir project `visual` en nightly:

- Upload diffs como artifact
- Fail si diff > threshold

#### F3-T05: Performance smoke (opcional)

Agregar mediciones básicas de rendimiento:

- Dashboard load < 3s
- Recursos list load < 2s
- Calendar render < 2s

Implementar con `page.evaluate(() => performance.timing)` o Playwright `route` timing.

#### F3-T06: i18n subset (opcional)

Crear 3–5 tests en locale `en` para validar:

- Login page renderiza en inglés
- Error messages en inglés
- Dashboard en inglés

#### F3-T07: Release checklist

Crear `docs/qa/e2e/RELEASE-CHECKLIST.md`:

- [ ] Smoke green (latest PR)
- [ ] Regression green (nightly)
- [ ] Visual baselines updated
- [ ] COVERAGE_MATRIX actualizada
- [ ] MISSING_DEFINITIONS revisado (sin P0 abiertos)
- [ ] Artifacts descargados y archivados

#### F3-T08: Full regression run en serve mode (stretch goal)

- Configurar `PLAYWRIGHT_BASE_URL` para apuntar a backend real
- Agregar `globalSetup` para seed vía API
- Correr suite completa
- Documentar resultados

### Criterios de aceptación Fase 3

- [ ] 7 visual baselines establecidas y committeadas
- [ ] Visual CI job corriendo en nightly
- [ ] Tests P2 creados según disponibilidad de UI
- [ ] Release checklist documentado
- [ ] Suite total: ~116 tests (23 smoke + 59 regression + ~24 extended + ~10 visual/perf)
- [ ] Evidence bundle generado para al menos 1 corrida completa

### Dependencias

- **Fase 2 completada**
- **MD-006, MD-007, MD-008** pueden bloquear tests P2 específicos

---

## Cronograma estimado

```text
Semana 1  │ Fase 0: Fundación
          │ ├── F0-T01..T09: Config, fixtures, POs, data-testid login
          │
Semana 2  │ Fase 1: Smoke
          │ ├── F1-T01..T15: 23 smoke tests + CI workflow
          │
Semana 3  │ Fase 2 — S1: Auth + Resources regression
          │ ├── F2-T01..T11
          │
Semana 4  │ Fase 2 — S2: Availability + Stockpile regression
          │ ├── F2-T12..T21
          │
Semana 5  │ Fase 2 — S3: Reports + consolidación + nightly CI
          │ ├── F2-T22..T28
          │
Semana 6  │ Fase 3: Visual + hardening
          │ ├── F3-T01..T08
```

---

## Métricas de seguimiento

| Métrica                | Target Fase 1  | Target Fase 2                        | Target Fase 3           |
| ---------------------- | -------------- | ------------------------------------ | ----------------------- |
| Tests totales          | 23             | 82                                   | 116                     |
| Pass rate (main)       | 100%           | ≥ 98%                                | ≥ 98%                   |
| Flaky rate             | < 5%           | < 2%                                 | < 1%                    |
| Smoke duration         | < 10 min       | < 10 min                             | < 10 min                |
| Regression duration    | —              | < 30 min                             | < 30 min                |
| CI coverage            | PR smoke       | PR smoke + nightly regression        | PR smoke + nightly full |
| `data-testid` coverage | login, sidebar | + resources, reservations, approvals | + all remaining         |
