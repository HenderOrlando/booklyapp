# LOGIN UI Worklog (Incremental)

Fecha: 2026-02-18
Scope: `bookly-mock-frontend`

## 1) Análisis inicial

### Hallazgos

1. La detección de modo MOCK/SERVER ya existe vía `useDataMode` y `dataConfigStore` con override en `localStorage`.
2. El login mostraba credenciales mock siempre, sin condicionar por modo.
3. El theme global ya está habilitado con `next-themes` (`ThemeProvider` en `src/app/providers.tsx`, `defaultTheme="system"`, persistencia en storage del browser).
4. El botón principal de login (`ButtonWithLoading`) usaba clases tipo `bg-primary-600`/`bg-secondary-600` que no están mapeadas al token design-system semántico en esta app, afectando visibilidad/consistencia en Light.

### Archivos impactados (análisis)

- `src/app/[locale]/login/page.tsx`
- `src/components/molecules/ButtonWithLoading.tsx`
- `src/components/atoms/ThemeToggle.tsx`
- `src/i18n/translations/es/auth.json`
- `src/i18n/translations/en/auth.json`
- `src/app/[locale]/login/__tests__/page.test.tsx` (nuevo)
- `e2e/smoke/login-ui.smoke.spec.ts` (nuevo)

### Decisiones

1. **MODE source of truth:** `useDataMode().isMock` (runtime, consistente con override/store).
2. **Theme toggle en login:** reutilizar `ThemeToggle` (no acoplar a usuario autenticado).
3. **Persistencia theme:** mantener `next-themes` (storage del browser) y validar en pruebas.
4. **Visibilidad botón Light:** migrar `ButtonWithLoading` a clases basadas en tokens semánticos (`--color-action-*`, `--color-text-*`, `--color-border-focus`).

## 2) Implementación aplicada

### 2.1 Login modo-aware + toggle de tema

- Se agregó toggle Light/Dark en login (pre-auth).
- Se condicionó bloque de credenciales mock:
  - MOCK: visible (`data-testid="login-mock-credentials"`).
  - SERVER: oculto + hint neutro (`data-testid="login-server-credentials-hint"`).

- Se mejoró a11y básica de formulario (labels con `htmlFor`, ids, `autoComplete`).

### 2.2 Contraste del botón principal en Light

- `ButtonWithLoading` ahora usa tokens semánticos en variantes y estados:
  - default, hover, disabled
  - `focus-visible` ring explícito con token de focus

- Se eliminó dependencia de clases de paleta no alineadas (`bg-primary-*`, `bg-secondary-*`).

### 2.3 i18n

- Nuevas claves agregadas en `auth.json` (es/en):
  - `theme_toggle_label`
  - `mock_mode_disclaimer`
  - `server_credentials_hint`

## 3) Pruebas agregadas

### Jest

- `src/app/[locale]/login/__tests__/page.test.tsx`
  - MOCK muestra credenciales.
  - SERVER oculta credenciales mock.
  - Toggle theme cambia Light↔Dark y persiste preferencia.
  - Botón principal contiene clases/tokens de contraste/focus esperados.

### Playwright

- `e2e/smoke/login-ui.smoke.spec.ts`
  - Login submit visible/clickable en Light.
  - Toggle theme Light→Dark→Light + persistencia.
  - Credenciales mock visibles solo en MOCK.
  - Credenciales mock ocultas en SERVER.

## 4) Ejecución de pruebas

### Jest (unit/component)

- Comando:
  - `npm run test -- --runInBand --runTestsByPath "/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock-frontend/src/app/[locale]/login/__tests__/page.test.tsx"`

- Resultado:
  - `PASS`
  - 1 suite / 4 tests en verde

### Playwright (E2E smoke)

- Comando:
  - `npm run e2e -- --project=smoke e2e/smoke/login-ui.smoke.spec.ts`

- Resultado:
  - `PASS`
  - 4 tests en verde

### Observaciones

- Se observaron warnings de Next.js sobre `metadata.viewport` y `metadata.themeColor` (no bloqueantes para este alcance).
- Primer intento E2E falló en la prueba de persistencia de theme porque `addInitScript` forzaba `theme=light` en cada reload.
- Fix aplicado: sembrar `localStorage` una sola vez con `page.evaluate(...)` antes del primer `reload`.
- No se tocaron archivos fuera del alcance del login; el worktree ya contenía cambios previos en otros módulos.

## 5) Resultado final (DoD)

- [x] En `MODE=MOCK`, se ve el bloque de credenciales mock claramente.
- [x] En `MODE=SERVER`, no se muestra información mock.
- [x] Existe toggle Light/Dark en Login y funciona sin autenticación.
- [x] La preferencia de theme persiste al recargar.
- [x] En Light, el botón “Iniciar Sesión” se ve bien (contraste + estados hover/focus).
- [x] Jest y Playwright pasan.
- [x] Informe `docs/worklogs/LOGIN_UI_WORKLOG.md` actualizado.
