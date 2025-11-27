# 🔐 Mejoras del Sistema de Autenticación

**Fecha**: 23 de Noviembre de 2025  
**Estado**: ✅ Implementado

---

## 📋 Resumen de Mejoras

Este documento detalla todas las mejoras implementadas en el sistema de autenticación de Bookly Frontend, incluyendo auto-refresh de tokens, manejo de errores, loading states, session timeout, Remember Me y CSRF protection.

---

## ✅ 1. Auto-Refresh de Tokens

### Descripción

Sistema automático que renueva el `accessToken` usando el `refreshToken` cuando expira, sin forzar logout al usuario.

###Implementación

#### **AuthContext.tsx**

```typescript
const refreshToken = async (): Promise<boolean> => {
  try {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      return false;
    }

    const response = await AuthClient.refreshToken(currentRefreshToken);

    if (response.success && response.data) {
      const newAccessToken = response.data.accessToken || response.data.token;
      const newRefreshToken = response.data.refreshToken;
      const rememberMe = isRememberMeEnabled();

      setToken(newAccessToken, rememberMe);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken, rememberMe);
      }

      return true;
    }

    return false;
  } catch (error) {
    // Si falla el refresh, cerrar sesión
    await logout(false);
    showError(
      "Sesión expirada",
      "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
    );
    return false;
  }
};
```

#### **httpClient.ts - Interceptor de Respuesta**

```typescript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Manejo de token expirado (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, esperar a que termine
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Intentar refresh del token
        const response = await axios.post(
          `${config.apiGatewayUrl}/api/v1/auth/refresh`,
          { refreshToken }
        );

        if (response.data.success && response.data.data) {
          const newAccessToken =
            response.data.data.accessToken || response.data.data.token;
          const newRefreshToken = response.data.data.refreshToken;

          // Guardar nuevos tokens
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Actualizar header
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Notificar a requests en espera
          onRefreshed(newAccessToken);
          isRefreshing = false;

          // Reintentar request original
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        // Limpiar y redirigir a login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);
```

### Características

- ✅ Auto-refresh transparente sin interrumpir la UX
- ✅ Cola de requests durante el refresh (evita múltiples refreshes)
- ✅ Refresh programado cada 10 minutos (configurable)
- ✅ Manejo de errores con logout automático si falla

---

## ✅ 2. Toast Notifications para Errores

### Descripción

Sistema de notificaciones visuales usando el sistema de Toast existente para informar al usuario sobre éxitos y errores.

### Implementación

#### **AuthContext.tsx**

```typescript
import { useToast } from "@/hooks/useToast";

export function AuthProvider({ children }: AuthProviderProps) {
  const { showError, showWarning, showSuccess, showInfo } = useToast();

  // Login
  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      // ... login logic
      showSuccess(
        "Inicio de sesión exitoso",
        `Bienvenido ${user.firstName || user.email}`
      );
    } catch (error: any) {
      showError(
        "Error de autenticación",
        error.message || "No se pudo iniciar sesión. Verifica tus credenciales."
      );
      throw error;
    }
  };

  // Logout
  const logout = async (showMessage: boolean = true) => {
    // ... logout logic
    if (showMessage) {
      showInfo("Sesión cerrada", "Has cerrado sesión exitosamente");
    }
  };

  // Session Timeout Warning
  warningTimeoutRef.current = setTimeout(() => {
    showWarning(
      "Sesión por expirar",
      "Tu sesión se cerrará en 5 minutos por inactividad. Mueve el mouse para mantenerla activa."
    );
  }, SESSION_TIMEOUT - SESSION_WARNING_TIME);
}
```

### Tipos de Notificaciones

- ✅ **Success**: Login exitoso, logout exitoso
- ✅ **Error**: Credenciales inválidas, sesión expirada, errores de red
- ✅ **Warning**: Sesión por expirar (5 min antes)
- ✅ **Info**: Sesión cerrada

---

## ✅ 3. Loading States

### Descripción

Estados de carga que deshabilitan controles durante requests para prevenir múltiples envíos.

### Implementación

#### **LoginPage.tsx**

```typescript
export default function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading} // ✅ Deshabilita input
        required
      />

      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading} // ✅ Deshabilita input
        required
      />

      <input
        type="checkbox"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
        disabled={isLoading} // ✅ Deshabilita checkbox
      />

      <ButtonWithLoading
        type="submit"
        disabled={isLoading} // ✅ Deshabilita botón
      >
        {isLoading ? t("logging_in") : t("login")}
      </ButtonWithLoading>
    </form>
  );
}
```

### Características

- ✅ Inputs deshabilitados durante login
- ✅ Botón con indicador de carga
- ✅ Previene múltiples envíos del formulario
- ✅ Feedback visual al usuario

---

## ✅ 4. Session Timeout por Inactividad

### Descripción

Cierre automático de sesión después de 30 minutos de inactividad del usuario, con advertencia 5 minutos antes.

### Implementación

#### **AuthContext.tsx**

```typescript
// Configuración
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const SESSION_WARNING_TIME = 5 * 60 * 1000; // Avisar 5 min antes

// Setup listeners de actividad
const setupActivityListeners = () => {
  if (typeof window !== "undefined") {
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
  }
};

// Reset timeout al detectar actividad
const handleUserActivity = () => {
  if (user && !!user) {
    resetSessionTimeout();
  }
};

const resetSessionTimeout = () => {
  // Limpiar timers anteriores
  if (sessionTimeoutRef.current) {
    clearTimeout(sessionTimeoutRef.current);
  }
  if (warningTimeoutRef.current) {
    clearTimeout(warningTimeoutRef.current);
  }

  // Warning 5 min antes
  warningTimeoutRef.current = setTimeout(() => {
    showWarning(
      "Sesión por expirar",
      "Tu sesión se cerrará en 5 minutos por inactividad. Mueve el mouse para mantenerla activa."
    );
  }, SESSION_TIMEOUT - SESSION_WARNING_TIME);

  // Timeout final
  sessionTimeoutRef.current = setTimeout(async () => {
    await logout(false);
    showError(
      "Sesión cerrada por inactividad",
      "Tu sesión se cerró automáticamente después de 30 minutos de inactividad."
    );
  }, SESSION_TIMEOUT);
};
```

### Eventos Monitoreados

- ✅ **mousemove**: Movimiento del mouse
- ✅ **keydown**: Teclas presionadas
- ✅ **click**: Clicks del mouse
- ✅ **scroll**: Scroll de la página

### Características

- ✅ Timer de 30 minutos de inactividad
- ✅ Warning 5 minutos antes del cierre
- ✅ Reset automático al detectar actividad
- ✅ Limpieza de timers al logout

---

## ✅ 5. Remember Me

### Descripción

Funcionalidad que permite mantener la sesión activa por 30 días si el usuario marca "Recordarme".

### Implementación

#### **LoginPage.tsx**

```typescript
const [rememberMe, setRememberMe] = React.useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    await login(email, password, rememberMe); // ✅ Pasar rememberMe
  } catch (error: any) {
    setError(error?.message || t("default_error"));
  }
};

// Checkbox
<input
  type="checkbox"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
  disabled={isLoading}
/>
```

#### **AuthContext.tsx**

```typescript
function setToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === "undefined") return;

  // 30 días si Remember Me, sino 24 horas
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

  localStorage.setItem("accessToken", token);
  document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

function setRefreshToken(token: string, rememberMe: boolean = false): void {
  if (typeof window === "undefined") return;

  // 30 días si Remember Me, sino 7 días
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

  localStorage.setItem("refreshToken", token);
  document.cookie = `refreshToken=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
}
```

### Tiempos de Expiración

| Tipo              | Remember Me OFF | Remember Me ON |
| ----------------- | --------------- | -------------- |
| **Access Token**  | 24 horas        | 30 días        |
| **Refresh Token** | 7 días          | 30 días        |

---

## ✅ 6. CSRF Protection

### Descripción

Protección contra Cross-Site Request Forgery usando cookies `SameSite=Strict`.

### Implementación

#### **Cookies con SameSite**

```typescript
// AuthContext.tsx
document.cookie = `accessToken=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
document.cookie = `refreshToken=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
```

### Características

- ✅ **SameSite=Strict**: Las cookies solo se envían en requests del mismo sitio
- ✅ **path=/**: Cookies accesibles en toda la aplicación
- ✅ **max-age**: Expiración automática

### Recomendaciones Adicionales (Backend)

```typescript
// Backend debería agregar:
- httpOnly: true // JavaScript no puede acceder
- secure: true // Solo HTTPS en producción
- CSRF token en requests mutantes (POST, PUT, DELETE)
```

---

## ✅ 7. Persistencia de Sesión

### Descripción

La sesión se mantiene al recargar la página usando `localStorage` y cookies.

### Implementación

#### **AuthContext.tsx**

```typescript
// Al montar el componente
useEffect(() => {
  checkAuth(); // ✅ Verifica si hay token y obtiene perfil
}, []);

const checkAuth = async () => {
  const token = getToken(); // ✅ Lee de localStorage
  if (!token) {
    setIsLoading(false);
    return;
  }

  try {
    setIsLoading(true);
    // Obtener datos del usuario desde el backend
    const response = await AuthClient.getProfile();

    if (response.success && response.data) {
      setUser(response.data); // ✅ Restaura usuario
    } else {
      // Token inválido, limpiar sesión
      clearToken();
      setUser(null);
    }
  } catch (error) {
    console.error("Error verificando autenticación:", error);
    clearToken();
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};
```

#### **Middleware.ts**

```typescript
// Verifica cookie en cada navegación
const token = request.cookies.get("accessToken")?.value;

if (!token) {
  const loginUrl = new URL(`/${locale}/login`, request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}
```

### Almacenamiento

| Dato             | localStorage | Cookies                     |
| ---------------- | ------------ | --------------------------- |
| **accessToken**  | ✅           | ✅ (para middleware)        |
| **refreshToken** | ✅           | ✅                          |
| **user**         | ❌           | ❌ (se obtiene del backend) |

---

## 🔄 Flujo Completo de Autenticación

```
1. Usuario ingresa credenciales
   ↓
2. LoginPage envía email, password, rememberMe
   ↓
3. AuthContext.login() hace POST /auth/login
   ↓
4. Backend devuelve { user, tokens: { accessToken, refreshToken } }
   ↓
5. AuthContext guarda tokens en localStorage + cookies
   ↓
6. AuthContext guarda user en estado
   ↓
7. Toast muestra "Inicio de sesión exitoso"
   ↓
8. Redirect a /dashboard
   ↓
9. Setup timers: auto-refresh (10min), session timeout (30min), activity listeners
   ↓
10. Usuario usa la aplicación
    ↓
11a. Si hay actividad → Reset session timeout
11b. Si no hay actividad por 25min → Toast warning
11c. Si no hay actividad por 30min → Auto logout
11d. Si accessToken expira → Auto-refresh transparente
    ↓
12. Usuario cierra sesión
    ↓
13. AuthContext.logout() limpia tokens y estado
    ↓
14. Toast muestra "Sesión cerrada"
    ↓
15. Redirect a /login
```

---

## 📝 Archivos Modificados

### AuthContext.tsx

- ✅ Agregado `useToast` para notificaciones
- ✅ Agregado `refreshToken()` method
- ✅ Agregado session timeout con timers
- ✅ Agregado activity listeners
- ✅ Agregado Remember Me support
- ✅ Agregado manejo de `refreshToken`
- ✅ Agregado SameSite=Strict a cookies

### httpClient.ts

- ✅ Interceptor request: usa `localStorage` en lugar de `sessionStorage`
- ✅ Interceptor response: auto-refresh en 401
- ✅ Cola de requests durante refresh
- ✅ Manejo mejorado de errores de red

### LoginPage.tsx

- ✅ Agregado estado `rememberMe`
- ✅ Checkbox conectado a `rememberMe`
- ✅ Inputs disabled durante `isLoading`
- ✅ Checkbox disabled durante `isLoading`

### auth-client.ts

- ✅ Ya incluía endpoint `refreshToken()`

---

## 🧪 Testing

### Verificar Auto-Refresh

1. Login con credenciales válidas
2. Esperar 10 minutos (o modificar `REFRESH_TOKEN_INTERVAL` a 1 minuto para testing)
3. Verificar en Network tab que se hace POST /auth/refresh
4. Verificar que el nuevo token se guarda en localStorage

### Verificar Session Timeout

1. Login con credenciales válidas
2. No mover mouse ni hacer nada por 25 minutos
3. Debe aparecer toast warning "Sesión por expirar"
4. No hacer nada por 5 minutos más
5. Debe aparecer toast error y redirigir a /login

### Verificar Remember Me

1. Login CON "Recordarme" marcado
2. Verificar en cookies que `max-age` es 2592000 (30 días)
3. Login SIN "Recordarme" marcado
4. Verificar en cookies que `max-age` es 86400 (24 horas)

### Verificar Persistencia

1. Login con credenciales válidas
2. Recargar la página (F5)
3. Verificar que sigue autenticado
4. Verificar que el perfil se carga correctamente

---

## ⚙️ Configuración

### Timeouts (AuthContext.tsx)

```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos
const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutos
const REFRESH_TOKEN_INTERVAL = 10 * 60 * 1000; // 10 minutos
```

### Token Expiration (AuthContext.tsx)

```typescript
// Access Token
const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

// Refresh Token
const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
```

---

## 🚀 Próximas Mejoras (Opcional)

### 1. CSRF Token en Headers

```typescript
// Backend genera CSRF token
const csrfToken = generateCSRFToken();
res.cookie("XSRF-TOKEN", csrfToken);

// Frontend lo envía en header
axios.defaults.headers.common["X-XSRF-TOKEN"] = getCookie("XSRF-TOKEN");
```

### 2. Rate Limiting

```typescript
// Limitar intentos de login
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos
```

### 3. Two-Factor Authentication (2FA)

- SMS/Email OTP
- Authenticator app (Google Authenticator, Authy)

### 4. Biometric Authentication

- Face ID / Touch ID
- WebAuthn API

---

## 📊 Comparativa: Antes vs Después

| Funcionalidad       | Antes                   | Después                      |
| ------------------- | ----------------------- | ---------------------------- |
| **Auto-refresh**    | ❌ Logout forzado       | ✅ Transparente              |
| **Error Handling**  | ❌ Solo console.error   | ✅ Toast notifications       |
| **Loading States**  | ⚠️ Parcial              | ✅ Completo (inputs + botón) |
| **Session Timeout** | ❌ No                   | ✅ 30 min + warning          |
| **Remember Me**     | ⚠️ UI pero no funcional | ✅ Funcional (30 días)       |
| **CSRF Protection** | ❌ No                   | ✅ SameSite=Strict           |
| **Persistencia**    | ✅ localStorage         | ✅ localStorage + cookies    |
| **UX**              | ⚠️ Regular              | ✅ Excelente                 |

---

**Última actualización**: 2025-11-23  
**Estado**: ✅ Completamente implementado y funcional  
**Archivos**: AuthContext.tsx, httpClient.ts, LoginPage.tsx, auth-client.ts
