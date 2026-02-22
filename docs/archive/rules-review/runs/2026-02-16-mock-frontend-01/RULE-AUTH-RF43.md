# RULE-AUTH-RF43 — Autenticación segura y SSO

> **Run ID:** `2026-02-16-mock-frontend-01` | **Scope:** `bookly-mock-frontend` | **Score: 3/5**

---

## Evidencia

| Archivo                                            | Qué implementa                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `src/app/[locale]/login/page.tsx`                  | Página de login                                                    |
| `src/app/[locale]/(auth)/auth/login/page.tsx`      | Login alternativo (route group)                                    |
| `src/app/[locale]/register/page.tsx`               | Registro de usuario                                                |
| `src/app/[locale]/forgot-password/page.tsx`        | Recuperar contraseña                                               |
| `src/app/[locale]/reset-password/page.tsx`         | Restablecer contraseña                                             |
| `src/app/[locale]/profile/page.tsx`                | Perfil de usuario                                                  |
| `src/contexts/AuthContext.tsx`                     | Contexto de autenticación                                          |
| `src/hooks/useAuth.ts`                             | Hook de autenticación                                              |
| `src/store/slices/authSlice.ts`                    | Redux slice para auth state                                        |
| `src/infrastructure/api/auth-client.ts`            | Cliente HTTP para auth                                             |
| `src/infrastructure/api/base-client.ts` (L179–303) | Interceptors: auth, refresh token                                  |
| `src/types/entities/auth.ts`                       | LoginDto, RegisterDto, GoogleAuthDto, LoginResponse                |
| `src/infrastructure/api/endpoints.ts` (L13–47)     | AUTH_ENDPOINTS: LOGIN, REGISTER, GOOGLE_LOGIN, REFRESH_TOKEN, etc. |
| `src/i18n/translations/es/auth.json`               | Traducciones auth                                                  |
| `package.json`                                     | next-auth@4.24.0                                                   |

## ACs cubiertos

- ✅ Login con email/password
- ✅ Registro de nuevos usuarios
- ✅ Recuperación de contraseña (forgot + reset)
- ✅ Google OAuth (endpoint GOOGLE_LOGIN + GoogleAuthDto)
- ✅ Refresh token automático (interceptor implementado)
- ✅ Sesión persistida (localStorage + Redux)
- ⚠️ SSO institucional: endpoint existe pero integración SSO real no implementada en frontend
- ⚠️ next-auth configurado pero integración no verificada completamente

## Gaps

1. Sin tests para flujos de autenticación
2. SSO institucional parcialmente implementado (endpoint existe, UI no completa)
3. Protección contra brute force es responsabilidad del backend; frontend no muestra rate limit feedback

## Score: **3/5** — Funcional con múltiples flujos de auth. Sin tests → gate max 3.
