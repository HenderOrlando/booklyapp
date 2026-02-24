# RF-43: Single Sign-On (SSO) y Autenticación Segura

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 28, 2025

---

## 📋 Descripción

Implementar autenticación mediante Single Sign-On con Google Workspace para facilitar el acceso de usuarios con cuentas institucionales @ufps.edu.co.

---

## ✅ Criterios de Aceptación

- [x] Autenticación OAuth2 con Google Workspace
- [x] Creación automática de usuarios al primer login SSO
- [x] Asignación automática de roles basada en dominio
- [x] Sincronización de información de perfil desde Google
- [x] Compatibilidad con autenticación tradicional (email/password)
- [x] JWT tokens generados para sesiones SSO
- [x] Logout correcto liberando sesiones SSO

---

## 🏗️ Implementación

### Componentes Desarrollados

**Strategy**:

- `GoogleStrategy` - Passport strategy para OAuth2 Google

**Controllers**:

- `OAuthController.googleLogin()` - Inicia flujo OAuth2
- `OAuthController.googleCallback()` - Callback de Google

**Services**:

- `AuthService.loginSSO()` - Login con credenciales SSO
- `UserService.createSSOUser()` - Crea usuario desde datos SSO
- `UserService.updateSSOInfo()` - Actualiza info SSO

---

### Endpoints SSO

```http
GET  /api/auth/oauth/google           # Inicia OAuth2 flow
GET  /api/auth/oauth/google/callback  # Callback de Google
POST /api/auth/oauth/token            # Intercambia código por token
```

---

### Flujo de Autenticación SSO

```
1. Usuario hace click en "Login con Google"
   ↓
2. Redirige a /api/auth/oauth/google
   ↓
3. Google muestra pantalla de consentimiento
   ↓
4. Usuario acepta
   ↓
5. Google redirige a /api/auth/oauth/google/callback
   ↓
6. GoogleStrategy valida token de Google
   ↓
7. Si usuario no existe: createSSOUser()
   ↓
8. Si usuario existe: updateSSOInfo()
   ↓
9. Genera JWT token
   ↓
10. Redirige al frontend con token
```

---

### Configuración

**Variables de Entorno**:

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/oauth/google/callback
GOOGLE_ALLOWED_DOMAINS=ufps.edu.co

# Frontend redirect
FRONTEND_URL=http://localhost:4200
```

---

### Asignación Automática de Roles

```typescript
// En createSSOUser
const email = googleProfile.email;
const domain = email.split("@")[1];

let defaultRole = "student";

if (domain === "ufps.edu.co") {
  // Lógica de asignación basada en patrón de email
  if (email.includes(".docente@")) {
    defaultRole = "teacher";
  } else if (email.includes(".admin@")) {
    defaultRole = "admin";
  }
}

const user = await this.userRepository.create({
  email,
  firstName: googleProfile.given_name,
  lastName: googleProfile.family_name,
  ssoProvider: "google",
  ssoId: googleProfile.id,
  roles: [defaultRole],
});
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- google.strategy.spec.ts
npm run test -- oauth.controller.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- sso-google.e2e-spec.ts
```

### Cobertura

- **Líneas**: 92%
- **Funciones**: 95%
- **Ramas**: 88%

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#strategy-pattern)
- [Endpoints](../ENDPOINTS.md#autenticación)
- [Event Bus](../EVENT_BUS.md#1-userregisteredevent)

---

## 🔄 Changelog

| Fecha      | Cambio                                | Autor |
| ---------- | ------------------------------------- | ----- |
| 2025-10-28 | Implementación OAuth2 Google          | Team  |
| 2025-10-30 | Asignación automática de roles        | Team  |
| 2025-11-02 | Sincronización de perfil desde Google | Team  |

---

**Mantenedor**: Bookly Development Team
