# RULE-AUTH-RF45 — Verificación 2FA en solicitudes críticas

> **Score: 1/5 — Esqueleto** | Domain: auth | Scope: bookly-mock-frontend

## Resumen

El frontend tiene el campo `twoFactorEnabled` en el tipo User y lo muestra en el perfil, pero no implementa el flujo de 2FA: no hay modal de ingreso de código, no hay integración con apps de autenticación, y no se interceptan acciones críticas para solicitar verificación adicional.

## Evidencia en Scope

| Artefacto | Path | Observación |
| --- | --- | --- |
| User type | `src/types/entities/user.ts` | Campo `twoFactorEnabled: boolean` |
| Auth client | `src/infrastructure/api/auth-client.ts` | `twoFactorEnabled` en normalizeUser/normalizeDetailedProfile |
| Profile page | `src/app/[locale]/profile/` | Posiblemente muestra estado 2FA |

## Gaps (Bloqueantes)

- **Gap-1 (BLOQUEANTE)**: No existe modal/componente de ingreso de código 2FA.
- **Gap-2 (BLOQUEANTE)**: No se interceptan acciones críticas (eliminar reserva, cambiar permisos, etc.) para solicitar 2FA.
- **Gap-3**: No hay UI para activar/desactivar 2FA en perfil.
- **Gap-4**: No hay UI para vincular app de autenticación (Google/Microsoft Authenticator).
- **Gap-5**: No hay flujo de fallback cuando usuario no puede acceder a su método 2FA.

## Gate Check

- Score <=2 y es core de seguridad → **BLOQUEANTE** para production-grade.

## Plan de Mejora

| Prioridad | Tarea | Skill |
| --- | --- | --- |
| Alta | Crear `TwoFactorModal` componente con input de código + countdown | `web-app` |
| Alta | Crear hook `useTwoFactorChallenge` que intercepte acciones críticas | `web-app` + `seguridad-privacidad-compliance` |
| Alta | Agregar UI de activación/vinculación de 2FA en perfil | `web-app` |
| Alta | Integrar con endpoint backend de verificación de código | `web-app` |
| Media | UI de fallback: solicitar soporte a admin cuando 2FA no accesible | `ux-ui` |
| Media | Tests E2E del flujo completo de 2FA | `qa-calidad` |
