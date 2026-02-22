# Fix Auth Redirect: callback -> destino, sin callback -> dashboard

Fecha: 2026-02-18
Scope principal: `bookly-mock-frontend`
Scope revisado (backend/gateway): `bookly-mock`

## 1) Análisis del ajuste requerido (rules + flujo real)

### Rules revisadas

- `.windsurf/rules/bookly-flujos-auth.md`
- `.windsurf/rules/bookly-base.md`
- `.windsurf/rules/bookly-modules.md`
- `.windsurf/rules/bookly-auth-rf41-gestion-de-roles.md`
- `.windsurf/rules/must-auth-hu-33-rf41.md`

### Flujo real detectado

- Login principal activo: `/{locale}/login`.
- Protección de rutas: `src/middleware.ts`.
- Navegación post-auth: `src/contexts/AuthContext.tsx`.
- No existía una ruta frontend dedicada para `/{locale}/auth/callback`.

### Decisiones de diseño (source of truth aplicado)

1. Nombres de callback aceptados oficialmente:
   - `callback`
   - `callbackUrl`
   - `redirectTo`
2. Orden de resolución de destino post-auth:
   1. query params (`callback`, `callbackUrl`, `redirectTo`)
   2. `state` OIDC (si viene en query o explícito)
   3. `sessionStorage` (`postAuthRedirect`)
3. Fallback por defecto:
   - `/{locale}/dashboard` (locale-aware)
4. Seguridad anti open-redirect:
   - Solo se aceptan paths internos relativos del mismo origin.
   - Se rechazan URLs absolutas externas (`https://...`).
5. Prevención de loops:
   - Se bloquea redirect a rutas de entrada auth (`/login`, `/auth/callback`).
6. Política de backend como fuente de verdad:
   - El backend no define navegación final para login por credenciales; el frontend resuelve destino de forma segura.

## 2) Archivos analizados y diagnóstico de causa raíz

### Frontend

- `src/app/[locale]/login/page.tsx`
- `src/contexts/AuthContext.tsx`
- `src/middleware.ts`
- `src/app/[locale]/(auth)/auth/login/page.tsx` (ruta legacy)
- `src/components/auth/ProtectedRoute.tsx` (no usado en app router actual)

### Backend/gateway revisado

- `bookly-mock/apps/auth-service/src/infrastructure/controllers/oauth.controller.ts`
- `bookly-mock/apps/auth-service/src/application/services/google-oauth.service.ts`

### Root cause identificado

1. `AuthContext` resolvía solo `callbackUrl` (ignoraba `callback` y `redirectTo`).
2. El middleware no preservaba querystring del destino protegido (`pathname` sin `search`).
3. No había resolver único compartido para login/callback/storage/state.
4. Existía riesgo de doble navegación post-login (redirect desde `login()` + effect reactivo por `user`).
5. Faltaban pruebas explícitas de callback + fallback + anti open-redirect.

## 3) Implementación del fix

### 3.1 Resolver único de callback

Se creó:

- `src/lib/auth/post-auth-redirect.ts`

Incluye:

- `resolvePostAuthRedirect()`
- `resolveDashboardFallbackPath()`
- `isAuthEntryRoute()`
- helpers de storage:
  - `persistPostAuthRedirect()`
  - `consumePostAuthRedirect()`
  - `clearPostAuthRedirect()`
  - `capturePostAuthRedirectFromLocation()`

Comportamiento:

- Lee callback desde query/state/storage en orden definido.
- Sanitiza destino y bloquea redirect externo.
- Evita loops hacia `/login` y `/auth/callback`.

### 3.2 Guard/middleware

Archivo:

- `src/middleware.ts`

Cambio:

- Al redirigir no autenticado a login, ahora guarda:
  - `callback=<pathname+search>`
  - `callbackUrl=<pathname+search>`

Con esto se preserva ruta + query original.

### 3.3 Post-auth redirect una sola vez + limpieza

Archivo:

- `src/contexts/AuthContext.tsx`

Cambios:

- Se eliminó resolver local duplicado.
- Se usa `navigateToPostAuthDestination()` centralizado (con util shared).
- Se agregó `postAuthRedirectHandledRef` para ejecutar redirect una sola vez.
- Se limpia `postAuthRedirect` tras resolver destino.
- Se aplica tanto para login exitoso como para sesión ya activa en login/callback.

### 3.4 Captura temprana del callback para flujos multipágina

Archivo:

- `src/app/[locale]/login/page.tsx`

Cambio:

- En mount, captura callback/state desde URL y lo guarda en `sessionStorage` para soportar flujos que salten entre páginas.

### 3.5 Ruta legacy ajustada

Archivo:

- `src/app/[locale]/(auth)/auth/login/page.tsx`

Cambio:

- Se reemplazó redirect hardcodeado por resolución segura con el mismo resolver shared + fallback dashboard locale-aware.

## 4) Tests (Jest)

### Nuevos tests unitarios del resolver

Archivo:

- `src/lib/auth/__tests__/post-auth-redirect.test.ts`

Cobertura:

1. `callback=/es/recursos` -> retorna destino interno.
2. `callback=https://evil.com` -> retorna `null` (bloqueo open redirect).
3. Sin callback -> `null` y fallback vía `resolveDashboardFallbackPath`.
4. Usa storage cuando no hay query/state.
5. Consume y limpia storage.
6. Bloquea loops (`/login`, `/auth/callback`).

### Nuevos tests de componente/contexto

Archivo:

- `src/contexts/__tests__/AuthContext.redirect.test.tsx`

Cobertura:

1. Login con callback -> `router.replace(callback)`.
2. Login sin callback -> `router.replace('/{locale}/dashboard')`.

### Regresión existente validada

Archivo:

- `src/app/[locale]/login/__tests__/page.test.tsx`

Se validó que el ajuste no rompe login UI/UX reciente.

## 5) Tests (Playwright)

Archivo actualizado:

- `e2e/smoke/auth.smoke.spec.ts`

Nuevos casos:

1. Ruta protegida -> login -> auth OK -> vuelve a ruta original con query.
2. Login directo -> auth OK -> dashboard.

## 6) Ejecución y evidencia

### Lint (targeted)

Comando:

- `npm run lint -- --file 'src/contexts/AuthContext.tsx' --file 'src/lib/auth/post-auth-redirect.ts' --file 'src/app/[locale]/login/page.tsx' --file 'src/middleware.ts' --file 'src/app/[locale]/(auth)/auth/login/page.tsx' --file 'src/contexts/__tests__/AuthContext.redirect.test.tsx' --file 'src/lib/auth/__tests__/post-auth-redirect.test.ts'`

Resultado:

- OK (sin errores, warnings react-hooks preexistentes en `AuthContext.tsx`).

### Jest

Comando:

- `npm run test -- --runInBand --runTestsByPath '<abs>/src/lib/auth/__tests__/post-auth-redirect.test.ts' '<abs>/src/contexts/__tests__/AuthContext.redirect.test.tsx' '<abs>/src/app/[locale]/login/__tests__/page.test.tsx'`

Resultado:

- PASS (3 suites, 12 tests).

### Playwright

Comando:

- `npm run e2e -- --project=smoke e2e/smoke/auth.smoke.spec.ts`

Resultado:

- PASS (7 tests).

## 7) Criterios de aceptación vs estado

- [x] Con callback (query/state/storage) redirige al destino interno.
- [x] Sin callback redirige a dashboard por defecto.
- [x] No hay open redirect a URLs externas.
- [x] No hay loops login/callback.
- [x] Jest y Playwright en verde (targeted).

## Archivos modificados

- `src/lib/auth/post-auth-redirect.ts` (nuevo)
- `src/contexts/AuthContext.tsx`
- `src/middleware.ts`
- `src/app/[locale]/login/page.tsx`
- `src/app/[locale]/(auth)/auth/login/page.tsx`
- `src/lib/auth/__tests__/post-auth-redirect.test.ts` (nuevo)
- `src/contexts/__tests__/AuthContext.redirect.test.tsx` (nuevo)
- `e2e/smoke/auth.smoke.spec.ts`
