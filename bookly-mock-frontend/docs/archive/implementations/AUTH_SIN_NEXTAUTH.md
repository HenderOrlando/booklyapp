# 🔐 Autenticación sin NextAuth - Bookly Frontend

**Fecha**: 23 de Noviembre de 2025  
**Estado**: ✅ Implementado

---

## 📊 Resumen

Se ha implementado un sistema de autenticación personalizado **sin NextAuth**, utilizando directamente el `AuthClient` y el `httpClient` configurado para conectarse a los microservicios.

### ¿Por qué sin NextAuth?

1. **Incompatibilidad con Next.js 14 App Router**: NextAuth v4 no tiene soporte completo para App Router
2. **Mayor control**: Control total sobre el flujo de autenticación
3. **Menos dependencias**: Reducción de dependencias externas
4. **Más simple**: Implementación más directa y mantenible
5. **Integración directa**: Aprovecha la infraestructura HTTP ya configurada

---

## 🏗️ Arquitectura Implementada

```
┌─────────────────┐
│  LoginPage      │
│  (UI Component) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  useAuth()      │
│  (Context Hook) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  AuthContext    │
│  (State Mgmt)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  AuthClient     │
│  (API Calls)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  httpClient     │
│  (HTTP Layer)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Auth Service   │
│  (Backend:3001) │
└─────────────────┘
```

---

## 📁 Archivos Creados/Modificados

### 1. **AuthContext** (`src/contexts/AuthContext.tsx`) ✨ NUEVO

Context React que maneja todo el estado de autenticación:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

**Funcionalidades**:

- ✅ Manejo de estado de usuario
- ✅ Login con email/password
- ✅ Logout con limpieza de estado
- ✅ Verificación automática de sesión al montar
- ✅ Refresh de datos de usuario
- ✅ Storage en `localStorage` + `cookies`

### 2. **httpClient** (`src/infrastructure/api/httpClient.ts`) 🔧 MODIFICADO

- ❌ Removido: Dependencia de `next-auth/react`
- ✅ Agregado: Método `getToken()` que lee de `localStorage`
- ✅ Actualizado: Interceptor de requests para agregar token automáticamente

```typescript
private getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}
```

### 3. **AuthClient** (`src/infrastructure/api/auth-client.ts`) 🔧 MODIFICADO

- ✅ Importa tipos de `@/types/entities/auth`
- ✅ Reutiliza `LoginResponse`, `LoginDto`, `RegisterDto` del backend
- ❌ Eliminados: Tipos duplicados locales

### 4. **Providers** (`src/app/providers.tsx`) 🔧 MODIFICADO

- ❌ Removido: `<SessionProvider>` de NextAuth
- ✅ Agregado: `<AuthProvider>` personalizado

```typescript
<AuthProvider>
  <ReduxProvider store={store}>
    <QueryProvider>
      {/* ... otros providers */}
    </QueryProvider>
  </ReduxProvider>
</AuthProvider>
```

### 5. **LoginPage** (`src/app/[locale]/login/page.tsx`) 🔧 MODIFICADO

- ❌ Removido: Lógica manual de login con `httpClient`
- ✅ Agregado: Hook `useAuth()` del contexto
- ✅ Simplificado: Handler de submit más limpio

```typescript
const { login, isLoading } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await login(email, password);
    // Redirige automáticamente al dashboard
  } catch (error: any) {
    setError(error?.message);
  }
};
```

### 6. **Middleware** (`src/middleware.ts`) 🔧 MODIFICADO

- ✅ Verifica token en cookies (para SSR)
- ✅ Redirige a login si no hay token
- ✅ Mantiene locale en redirects

```typescript
const token = request.cookies.get("accessToken")?.value;
if (!token) {
  const loginUrl = new URL(`/${locale}/login`, request.url);
  return NextResponse.redirect(loginUrl);
}
```

### 7. **Tipos de Auth** (`src/types/entities/auth.ts`) 🔧 MODIFICADO

- ✅ Re-exporta `User` para facilitar imports

```typescript
export type { User };
```

---

## 🔐 Flujo de Autenticación

### 1. **Login**

```
Usuario → Form Submit → useAuth().login(email, password)
  ↓
AuthContext.login()
  ↓
AuthClient.login({ email, password })
  ↓
httpClient.post<LoginResponse>("/api/v1/auth/login", credentials)
  ↓
Auth Service (http://localhost:3001)
  ↓
Response { user, accessToken, refreshToken }
  ↓
setToken(accessToken) → localStorage + cookies
  ↓
setUser(user) → React State
  ↓
router.push("/dashboard")
```

### 2. **Requests Autenticados**

```
httpClient.get("/api/v1/resources/categories")
  ↓
Request Interceptor
  ↓
const token = this.getToken() // localStorage
  ↓
headers.Authorization = `Bearer ${token}`
  ↓
Request to Backend
```

### 3. **Logout**

```
useAuth().logout()
  ↓
AuthClient.logout() // Notifica al backend
  ↓
clearToken() → Limpia localStorage + cookies
  ↓
setUser(null) → Limpia estado
  ↓
router.push("/login")
```

### 4. **Verificación de Sesión (Auto)**

```
App Mount → AuthProvider useEffect
  ↓
checkAuth()
  ↓
const token = getToken()
  ↓
if (token) {
  AuthClient.getProfile()
    ↓
  setUser(userData)
}
```

---

## 🔑 Manejo de Tokens

### localStorage

```typescript
// Guardar
localStorage.setItem("accessToken", token);

// Leer
localStorage.getItem("accessToken");

// Limpiar
localStorage.removeItem("accessToken");
```

### Cookies (para Middleware)

```typescript
// Guardar
document.cookie = `accessToken=${token}; path=/; max-age=86400`;

// Limpiar
document.cookie = "accessToken=; path=/; max-age=0";
```

**¿Por qué ambos?**

- **localStorage**: Accesible desde JavaScript (cliente)
- **Cookies**: Accesible desde Middleware (servidor)

---

## 🛡️ Seguridad

### 1. **Tokens en httpOnly Cookies** (Recomendado para Producción)

Actualmente usamos cookies regulares. Para producción, considera:

```typescript
// Backend debe enviar Set-Cookie con httpOnly
Set-Cookie: accessToken=xxx; HttpOnly; Secure; SameSite=Strict
```

### 2. **Refresh Tokens**

Implementar refresh token para renovar sesión:

```typescript
// En AuthContext
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const response = await AuthClient.refreshToken({ refreshToken });
  setToken(response.data.accessToken);
};
```

### 3. **Expiración de Tokens**

El backend debería incluir `expiresIn` en la respuesta:

```typescript
if (Date.now() > expiresAt) {
  await refreshAccessToken();
}
```

---

## 🚀 Uso

### En Componentes

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <div>No autenticado</div>;

  return (
    <div>
      <h1>Hola, {user.firstName}!</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### Proteger Rutas

El middleware ya protege rutas automáticamente:

```typescript
// src/middleware.ts
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/recursos",
  "/reservas",
  // ...
];
```

### Hacer Requests Autenticados

```typescript
import { httpClient } from "@/infrastructure/api/httpClient";

// El token se agrega automáticamente
const response = await httpClient.get("/api/v1/resources/categories");
```

---

## ✅ Ventajas de esta Implementación

1. **✅ Sin dependencias de NextAuth**: No más problemas de compatibilidad
2. **✅ Control total**: Manejo completo del flujo de autenticación
3. **✅ Integración perfecta**: Usa la infraestructura HTTP existente
4. **✅ Type-safe**: TypeScript en toda la cadena
5. **✅ SSR-friendly**: Cookies para middleware
6. **✅ CSR-friendly**: localStorage para cliente
7. **✅ Simple y mantenible**: Menos complejidad
8. **✅ Testeable**: Fácil de testear con mocks

---

## 🧪 Testing

### Probar Login

1. Iniciar backend:

   ```bash
   cd ../bookly-mock
   npm run start:all
   ```

2. Iniciar frontend:

   ```bash
   npm run dev
   ```

3. Abrir: <http://localhost:4200/login>

4. Credenciales de prueba:
   - **Email**: `admin@ufps.edu.co`
   - **Password**: `123456`

5. Verificar en DevTools:
   - **Application** → **Local Storage** → `accessToken`
   - **Application** → **Cookies** → `accessToken`
   - **Network** → Request Headers → `Authorization: Bearer ...`

---

## 🔄 Próximos Pasos

### Fase 1: Testing ⏳

- [ ] Probar login con credenciales correctas
- [ ] Probar login con credenciales incorrectas
- [ ] Verificar redirección al dashboard
- [ ] Verificar protección de rutas
- [ ] Probar logout

### Fase 2: Mejoras 📋

- [ ] Implementar refresh token
- [ ] Agregar manejo de expiración
- [ ] Implementar "Remember Me"
- [ ] Agregar 2FA (opcional)
- [ ] Mejorar manejo de errores

### Fase 3: Seguridad 🔒

- [ ] Migrar a httpOnly cookies
- [ ] Implementar CSRF protection
- [ ] Agregar rate limiting
- [ ] Implementar session timeout
- [ ] Auditoría de seguridad

---

## 📚 Referencias

- [React Context API](https://react.dev/reference/react/useContext)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Última actualización**: 2025-11-23  
**Estado**: ✅ Implementado y listo para testing  
**Autor**: Cascade AI Assistant
