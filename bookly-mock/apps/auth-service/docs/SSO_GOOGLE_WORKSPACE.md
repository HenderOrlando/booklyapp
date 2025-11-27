# 🔐 SSO con Google Workspace - Bookly Auth Service

**Estado**: ✅ Implementado  
**Versión**: 1.0.0  
**Fecha**: 2025-01-08

---

## 📋 Resumen

El Auth Service de Bookly ahora soporta autenticación SSO (Single Sign-On) con Google Workspace para usuarios con dominio institucional `@ufps.edu.co`. Esta implementación permite que estudiantes, docentes y personal administrativo puedan autenticarse usando sus cuentas de Google institucionales.

---

## 🎯 Características Implementadas

- ✅ **Autenticación OAuth2 con Google**
- ✅ **Verificación automática de dominio** (@ufps.edu.co)
- ✅ **Creación automática de usuarios** en primera autenticación
- ✅ **Vinculación de cuentas existentes** con SSO
- ✅ **Asignación automática de roles** basada en dominio
- ✅ **Sincronización de perfil** (nombre, email, foto)
- ✅ **Generación de JWT tokens** después de SSO
- ✅ **Redirección automática al frontend**
- ✅ **Sin contraseña requerida** para usuarios SSO

---

## 🏗️ Arquitectura

```
Usuario (@ufps.edu.co)
       │
       ▼
  [Bookly Frontend]
       │
       │ GET /api/auth/oauth/google
       ▼
  [Auth Service]
       │
       │ Redirect OAuth2
       ▼
[Google Workspace]
       │
       │ Callback
       ▼
  [GoogleStrategy]
       │
       ├── Validar dominio
       ├── Buscar usuario SSO
       ├── Vincular/Crear usuario
       ├── Generar JWT tokens
       │
       ▼
  [Frontend Callback]
    accessToken + refreshToken
```

---

## 🔌 Endpoints

### 1. Iniciar Autenticación con Google

```http
GET /api/auth/oauth/google
```

**Descripción**: Inicia el flujo de autenticación OAuth2 con Google Workspace.

**Respuesta**: Redirección (302) a Google OAuth2.

**Ejemplo**:

```html
<a href="http://localhost:3001/api/auth/oauth/google">
  Iniciar sesión con Google
</a>
```

---

### 2. Callback de Google OAuth2

```http
GET /api/auth/oauth/google/callback
```

**Descripción**: Endpoint de callback después de autenticación exitosa con Google.

**Parámetros automáticos de Google**:

- `code` - Código de autorización
- `state` - Estado de seguridad

**Respuesta**: Redirección al frontend con tokens en query params.

**Ejemplo de redirección**:

```
http://localhost:3000/auth/callback?accessToken=eyJ...&refreshToken=eyJ...
```

---

## ⚙️ Configuración

### 1. Variables de Entorno

Copiar `.env.sso.example` a `.env` y configurar:

```bash
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/oauth/google/callback
GOOGLE_ALLOWED_DOMAINS=ufps.edu.co

# Frontend URL (para redirección después de SSO)
FRONTEND_URL=http://localhost:3000
```

### 2. Configurar Google Cloud Console

#### Paso 1: Crear Proyecto

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto: "Bookly Auth"

#### Paso 2: Habilitar Google+ API

1. Ir a **APIs & Services** > **Library**
2. Buscar "Google+ API"
3. Click en **Enable**

#### Paso 3: Crear Credenciales OAuth2

1. Ir a **APIs & Services** > **Credentials**
2. Click en **Create Credentials** > **OAuth client ID**
3. Tipo de aplicación: **Web application**
4. Nombre: "Bookly Auth Service"
5. **Authorized redirect URIs**:
   ```
   http://localhost:3001/api/auth/oauth/google/callback
   https://bookly.ufps.edu.co/api/auth/oauth/google/callback
   ```
6. Copiar **Client ID** y **Client Secret**

#### Paso 4: Configurar Pantalla de Consentimiento

1. Ir a **OAuth consent screen**
2. Tipo de usuario: **Internal** (solo usuarios @ufps.edu.co)
3. Nombre de aplicación: "Bookly - Sistema de Reservas UFPS"
4. Email de soporte: soporte@ufps.edu.co
5. Scopes requeridos:
   - `openid`
   - `email`
   - `profile`

---

## 🔄 Flujo de Autenticación

### 1. Usuario hace click en "Iniciar sesión con Google"

```typescript
// Frontend
const handleGoogleLogin = () => {
  window.location.href = "http://localhost:3001/api/auth/oauth/google";
};
```

### 2. Google Strategy valida el usuario

```typescript
// GoogleStrategy internamente:
// 1. Redirige a Google OAuth2
// 2. Usuario autoriza en Google
// 3. Google devuelve código
// 4. Strategy intercambia código por access token
// 5. Strategy obtiene perfil de usuario
// 6. Valida dominio @ufps.edu.co
```

### 3. Auth Service procesa el usuario

```typescript
// AuthService.validateOrCreateSSOUser():
// Caso 1: Usuario SSO existente → Actualizar y generar tokens
// Caso 2: Usuario email existente → Vincular SSO y generar tokens
// Caso 3: Usuario nuevo → Crear con SSO y generar tokens
```

### 4. Redirección al frontend con tokens

```
http://localhost:3000/auth/callback?accessToken=eyJ...&refreshToken=eyJ...
```

### 5. Frontend procesa los tokens

```typescript
// Frontend
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");

  if (accessToken && refreshToken) {
    // Guardar tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    // Redirigir a dashboard
    router.push("/dashboard");
  }
}, []);
```

---

## 👤 Gestión de Usuarios SSO

### Campos SSO en User Entity

```typescript
{
  ssoProvider: "google",           // Proveedor SSO
  ssoProviderId: "1234567890",     // ID único de Google
  ssoEmail: "user@ufps.edu.co",    // Email de Google
  ssoPhotoUrl: "https://...",      // URL de foto de perfil
  password: undefined,              // Sin contraseña para SSO
  isEmailVerified: true            // Auto-verificado con SSO
}
```

### Asignación de Roles

Por defecto, todos los usuarios SSO reciben el rol `STUDENT`. Los administradores deben asignar roles manualmente:

```typescript
// Roles disponibles:
-STUDENT - // Estudiantes
  TEACHER - // Docentes
  PROGRAM_ADMIN - // Administrador de programa
  GENERAL_ADMIN - // Administrador general
  SECURITY - // Personal de vigilancia
  ADMINISTRATIVE_STAFF; // Personal administrativo
```

### Vinculación de Cuentas

Si un usuario ya tiene cuenta con email/contraseña y luego usa SSO:

1. **Se vincula automáticamente** usando el email
2. **Se mantiene el password existente** (puede seguir usando ambos métodos)
3. **Se actualiza con información SSO** (provider, providerId, foto)
4. **Email se verifica automáticamente**

---

## 🔒 Seguridad

### Validaciones Implementadas

1. **Dominio permitido**: Solo `@ufps.edu.co`
2. **Verificación de provider**: Solo Google autorizado
3. **Token blacklist**: Tokens pueden ser invalidados
4. **Sin contraseña**: Usuarios SSO no pueden usar login tradicional
5. **Cambio de contraseña bloqueado**: Usuarios SSO no pueden cambiar password

### Restricciones

```typescript
// Login tradicional con cuenta SSO: ❌
POST /api/auth/login
{
  "email": "user@ufps.edu.co",  // Cuenta SSO
  "password": "123456"            // No permitido
}
// Error: "This account uses SSO authentication"

// Cambiar contraseña de cuenta SSO: ❌
POST /api/auth/change-password  // Requiere JWT
{
  "currentPassword": "123",
  "newPassword": "456"
}
// Error: "Cannot change password for SSO accounts"
```

---

## 🧪 Testing

### Prueba Manual

1. **Iniciar servicios**:

   ```bash
   # MongoDB
   docker-compose up -d mongodb

   # Redis
   docker-compose up -d redis

   # Auth Service
   npm run start:dev
   ```

2. **Abrir en navegador**:

   ```
   http://localhost:3001/api/auth/oauth/google
   ```

3. **Iniciar sesión con cuenta UFPS**:
   - Email: `usuario@ufps.edu.co`
   - Autorizar aplicación

4. **Verificar redirección**:
   - Debe redirigir a frontend con tokens

### Prueba con cURL

```bash
# 1. Obtener URL de autorización
curl -X GET http://localhost:3001/api/auth/oauth/google

# 2. Validar token recibido
curl -X GET http://localhost:3001/api/auth/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJ..."}'
```

---

## 📊 Logging y Auditoría

Todas las operaciones SSO son auditadas:

```typescript
// Login SSO exitoso
logger.info("SSO user logged in", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
  provider: "google",
});

// Cuenta vinculada
logger.info("Linked SSO to existing user", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
  provider: "google",
});

// Usuario nuevo creado
logger.info("Created new SSO user", {
  userId: "507f1f77bcf86cd799439011",
  email: "user@ufps.edu.co",
  provider: "google",
  roles: ["STUDENT"],
});
```

---

## 🚀 Próximos Pasos

1. ✅ **SSO con Google Workspace** - Implementado
2. ⏳ **2FA con TOTP** - Pendiente
3. ⏳ **Microsoft SSO** - Futuro
4. ⏳ **Sincronización automática de roles** desde Google Workspace
5. ⏳ **Integración con Google Calendar**

---

## 🐛 Troubleshooting

### Error: "Domain not allowed"

**Causa**: El email no pertenece a `@ufps.edu.co`

**Solución**: Verificar `GOOGLE_ALLOWED_DOMAINS` en `.env`

---

### Error: "Redirect URI mismatch"

**Causa**: La URL de callback no coincide con Google Console

**Solución**:

1. Verificar `GOOGLE_CALLBACK_URL` en `.env`
2. Agregar URI exacta en Google Console

---

### Error: "Access blocked: This app's request is invalid"

**Causa**: Scopes no configurados correctamente

**Solución**: En Google Console, verificar OAuth consent screen scopes:

- `openid`
- `email`
- `profile`

---

## 📚 Referencias

- [Passport Google OAuth20 Strategy](https://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NestJS Passport Integration](https://docs.nestjs.com/security/authentication)
- [Bookly Auth Service Architecture](./ARCHITECTURE.md)
