# RULE-AUTH-RF43 — Autenticación y SSO

> **Score: 3/5 — Funcional** | Domain: auth | Scope: bookly-mock-frontend

## Resumen

El frontend implementa autenticación con next-auth (credentials provider), login/register/forgot-password/reset-password pages, y normalización robusta de perfiles desde backend. SSO no está implementado como proveedor separado pero la arquitectura lo permite.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| Login page | `src/app/[locale]/login/` | Formulario email/password |
| Register page | `src/app/[locale]/register/` | Registro con campos completos |
| Forgot password | `src/app/[locale]/forgot-password/` | Recuperación de contraseña |
| Reset password | `src/app/[locale]/reset-password/` | Reset con token |
| useAuth hook | `src/hooks/useAuth.ts` | signIn/signOut vía next-auth |
| Auth client | `src/infrastructure/api/auth-client.ts` | AuthClient.login(), AuthClient.register(), mapeo de roles |
| Profile normalization | `src/infrastructure/api/auth-client.ts` | normalizeUser(), normalizeDetailedProfile() con BackendMyProfileResponse |
| Middleware | `src/middleware.ts` | Protección de rutas autenticadas |
| Auth context tests | `src/contexts/__tests__/AuthContext.redirect.test.tsx` | Test de redirección post-auth |
| Post-auth redirect test | `src/lib/auth/__tests__/post-auth-redirect.test.ts` | Test de post-auth redirect |
| E2E auth | `e2e/auth.spec.ts`, `e2e/smoke/auth.smoke.spec.ts` | Tests E2E de auth |
| i18n | `src/i18n/translations/{en,es}/auth.json` | Traducciones de auth |

## Gaps

- **Gap-1**: SSO (OAuth2/SAML/OpenID Connect) no implementado como proveedor en next-auth.
- **Gap-2**: No hay botón "SSO institucional" en login page (AC: "opción de autenticarse con SSO").
- **Gap-3**: No se evidencia "Cerrar sesión en todos los dispositivos".
- **Gap-4**: Expiración de sesión configurable no expuesta en UI de preferencias.

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Agregar proveedor SSO (OAuth2) en next-auth config | `seguridad-privacidad-compliance` |
| Alta | Agregar botón "Iniciar con cuenta institucional" en login page | `web-app` |
| Media | Implementar "Cerrar sesión en todos los dispositivos" en perfil | `web-app` |
| Media | UI de configuración de timeout de sesión en preferencias admin | `web-app` |
| Baja | Fallback a login manual si SSO falla | `web-app` |
