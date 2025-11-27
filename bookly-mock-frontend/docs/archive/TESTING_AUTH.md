# 🧪 Testing de Autenticación - Bookly Frontend

**Fecha**: 23 de Noviembre de 2025  
**Estado**: ✅ Listo para Pruebas

---

## 📋 Checklist de Pruebas

### ✅ Fase 1: Verificación de Backend

- [x] **Auth Service activo**: http://localhost:3001/api/v1/health
- [x] **Endpoint de login funcional**: POST http://localhost:3001/api/v1/auth/login
- [x] **Respuesta correcta del backend**:
  ```json
  {
    "success": true,
    "data": {
      "requiresTwoFactor": false,
      "user": { ... },
      "tokens": {
        "accessToken": "eyJ...",
        "refreshToken": "eyJ..."
      }
    }
  }
  ```

### ✅ Fase 2: Verificación de Frontend

- [x] **Tipos actualizados**: `LoginResponse` coincide con backend
- [x] **AuthContext implementado**: Manejo de estado de autenticación
- [x] **Login page actualizada**: Usa `useAuth()` hook
- [x] **httpClient configurado**: Interceptor de tokens
- [x] **Middleware actualizado**: Protección de rutas

---

## 🚀 Pruebas Manuales

### 1. Login Exitoso

**Pasos**:

1. Abrir: http://localhost:4200/login
2. Ingresar credenciales válidas:
   - Email: `admin@ufps.edu.co`
   - Password: `123456`
3. Click en "Iniciar Sesión"

**Resultado Esperado**:

- ✅ Loading spinner mientras procesa
- ✅ Redirección automática a `/dashboard`
- ✅ Token guardado en `localStorage` (key: `accessToken`)
- ✅ Token guardado en `cookies` (key: `accessToken`)
- ✅ Datos de usuario en `AuthContext`

**Verificación en DevTools**:

```javascript
// Consola del navegador
localStorage.getItem("accessToken"); // Debe retornar el JWT

// Application → Cookies → localhost:4200
// Debe aparecer: accessToken = eyJ...

// Network → Headers de requests subsecuentes
// Debe incluir: Authorization: Bearer eyJ...
```

---

### 2. Login Fallido

**Pasos**:

1. Abrir: http://localhost:4200/login
2. Ingresar credenciales inválidas:
   - Email: `test@ufps.edu.co`
   - Password: `wrongpassword`
3. Click en "Iniciar Sesión"

**Resultado Esperado**:

- ✅ Loading spinner mientras procesa
- ✅ Alert de error con mensaje descriptivo
- ✅ NO redirección
- ✅ NO token guardado
- ✅ Formulario vuelve a estado normal

---

### 3. Protección de Rutas

**Pasos**:

1. **SIN estar autenticado**, intentar acceder:
   - http://localhost:4200/dashboard
   - http://localhost:4200/recursos
   - http://localhost:4200/reservas

**Resultado Esperado**:

- ✅ Redirección automática a `/login`
- ✅ Query param `callbackUrl` con la URL original
- ✅ Mensaje indicando que debe iniciar sesión

**Pasos (Autenticado)**:

1. Iniciar sesión
2. Acceder a las mismas rutas

**Resultado Esperado**:

- ✅ Acceso permitido
- ✅ Contenido de la página visible

---

### 4. Requests Autenticados

**Pasos**:

1. Iniciar sesión
2. Abrir DevTools → Network
3. Navegar a cualquier página que haga requests al backend
4. Inspeccionar headers de los requests

**Resultado Esperado**:

```http
GET http://localhost:3002/api/v1/resources/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept-Language: es-ES
Content-Type: application/json
```

---

### 5. Logout

**Pasos**:

1. Estar autenticado
2. Click en botón de "Cerrar Sesión"

**Resultado Esperado**:

- ✅ Request POST a `/api/v1/auth/logout`
- ✅ Token removido de `localStorage`
- ✅ Cookie removida
- ✅ Estado de usuario limpiado (`user = null`)
- ✅ Redirección a `/login`

**Verificación**:

```javascript
// Consola del navegador
localStorage.getItem("accessToken"); // Debe retornar null

// Intentar acceder a ruta protegida
// Debe redirigir a /login
```

---

### 6. Persistencia de Sesión

**Pasos**:

1. Iniciar sesión
2. Recargar la página (F5)

**Resultado Esperado**:

- ✅ **SIN logout automático**
- ✅ Usuario sigue autenticado
- ✅ Token sigue en `localStorage`
- ✅ `AuthContext` recupera usuario automáticamente
- ✅ Request GET a `/api/v1/auth/profile` para validar token

---

## 🐛 Debugging

### Ver Logs del Frontend

```bash
# En la consola del navegador (DevTools → Console)
# Los logs de AuthContext aparecen con emoji:
# 🌐 NextAuth: Usando modo SERVE - http://localhost:3001
# 📋 Configuración de la aplicación:
# 🔧 Servicios directos: ACTIVADO
```

### Ver Logs del Backend

```bash
cd ../bookly-mock
docker logs -f bookly-auth-service

# O si no está en Docker:
npm run start:auth
```

### Errores Comunes

| Error                           | Causa                                 | Solución                                             |
| ------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| `Cannot POST /api/auth/session` | Ruta de NextAuth no existe (correcto) | Ignorar - NextAuth fue removido                      |
| `401 Unauthorized`              | Token inválido o expirado             | Hacer logout y volver a iniciar sesión               |
| `Network Error`                 | Backend no está corriendo             | Verificar `curl http://localhost:3001/api/v1/health` |
| `CORS Error`                    | CORS no configurado en backend        | Verificar configuración CORS en auth-service         |
| `404 on /dashboard`             | Usuario no autenticado                | Middleware redirigiendo correctamente                |

---

## 🔍 Verificación Rápida con cURL

### 1. Backend Health Check

```bash
curl http://localhost:3001/api/v1/health
```

### 2. Login Directo

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ufps.edu.co","password":"123456"}'
```

### 3. Obtener Perfil (con token)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Tu token

curl http://localhost:3001/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Logout

```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Resultado de Pruebas

### Estado Actual: ✅ **TODAS LAS PRUEBAS PASADAS**

| Prueba         | Estado  | Notas                          |
| -------------- | ------- | ------------------------------ |
| Backend Health | ✅ PASS | Auth service respondiendo      |
| Login endpoint | ✅ PASS | Devuelve tokens correctamente  |
| Tipos frontend | ✅ PASS | `LoginResponse` actualizado    |
| AuthContext    | ✅ PASS | Manejo de estado correcto      |
| Login UI       | ✅ PASS | Formulario funcional           |
| Interceptores  | ✅ PASS | Token agregado automáticamente |
| Middleware     | ✅ PASS | Rutas protegidas               |
| Cookies        | ✅ PASS | Token en cookies para SSR      |
| localStorage   | ✅ PASS | Token en localStorage para CSR |

---

## 📸 Screenshots Esperados

### 1. Login Page

- Formulario limpio con campos email y password
- Botón "Iniciar Sesión"
- Link a "¿Olvidaste tu contraseña?"
- Link a "Registrarse"

### 2. DevTools - Application

```
Local Storage
  └─ http://localhost:4200
      └─ accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Cookies
  └─ localhost:4200
      └─ accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. DevTools - Network

```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  Accept-Language: es-ES
```

---

## 🎯 Próximos Pasos

### Mejoras Pendientes

1. **Refresh Token** 🔄
   - Implementar auto-refresh cuando accessToken expira
   - Usar refreshToken para obtener nuevo accessToken
   - Manejo transparente sin logout forzado

2. **Manejo de Errores** ❌
   - Toast notifications para errores
   - Retry automático en caso de fallos de red
   - Mensajes de error más descriptivos

3. **Loading States** ⏳
   - Skeleton loaders en páginas
   - Spinner global durante auth checks
   - Disable buttons durante requests

4. **Session Timeout** ⏰
   - Auto-logout después de X minutos de inactividad
   - Warning modal antes del timeout
   - Renovar sesión con actividad del usuario

5. **2FA Support** 🔐
   - UI para código 2FA
   - Backup codes
   - Recuperación de 2FA

---

## 📚 Referencias

- [AuthContext.tsx](/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock-frontend/src/contexts/AuthContext.tsx)
- [httpClient.ts](/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock-frontend/src/infrastructure/api/httpClient.ts)
- [auth-client.ts](/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock-frontend/src/infrastructure/api/auth-client.ts)
- [middleware.ts](/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock-frontend/src/middleware.ts)
- [AUTH_SIN_NEXTAUTH.md](/Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock-frontend/docs/AUTH_SIN_NEXTAUTH.md)

---

**Última actualización**: 2025-11-23  
**Estado**: ✅ Implementación completa y probada  
**Próximo**: Continuar con integración de otros módulos
