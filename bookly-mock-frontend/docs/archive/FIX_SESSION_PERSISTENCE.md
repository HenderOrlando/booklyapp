# 🔧 Fix: Persistencia de Sesión y Filtrado de Menú

**Fecha**: 23 de Noviembre de 2025  
**Estado**: ✅ Corregido

---

## 🐛 Problemas Reportados

### 1. Pérdida de Sesión al Recargar

**Síntoma**: Al recargar la página (F5), la sesión se perdía y el usuario debía hacer login nuevamente.

**Causa**: El método `checkAuth()` en `AuthContext` no intentaba refresh del token cuando el `accessToken` estaba expirado. Simplemente limpiaba la sesión.

### 2. Menú Completo Visible Durante Carga

**Síntoma**: Al recargar, el menú mostraba TODAS las opciones (incluyendo admin, coordinador, etc.) por un momento antes de filtrar por rol.

**Causa**: El filtro del `AppSidebar` tenía lógica incorrecta:

```typescript
// ❌ ANTES (Incorrecto)
if (!item.roles || !userRole) return true;
// Cuando userRole es null (cargando), mostraba TODO
```

### 3. Redirección a Login al Acceder a Perfil

**Síntoma**: Al intentar acceder a `/profile`, redirigía a `/login`.

**Causa**: El `accessToken` expiraba y `checkAuth()` limpiaba la sesión sin intentar refresh.

---

## ✅ Soluciones Implementadas

### 1. Auto-Refresh en checkAuth()

#### **Archivo**: `src/contexts/AuthContext.tsx`

Agregado helper `attemptTokenRefresh()` y modificado `checkAuth()` para intentar refresh antes de limpiar sesión:

```typescript
const checkAuth = async () => {
  const token = getToken();
  if (!token) {
    setIsLoading(false);
    return;
  }

  try {
    setIsLoading(true);
    const response = await AuthClient.getProfile();

    if (response.success && response.data) {
      setUser(response.data);
    } else {
      // ✅ NUEVO: Intentar refresh antes de limpiar
      const refreshSuccess = await attemptTokenRefresh();
      if (!refreshSuccess) {
        clearToken();
        clearRefreshToken();
        setUser(null);
      } else {
        // Reintentar con nuevo token
        const retryResponse = await AuthClient.getProfile();
        if (retryResponse.success && retryResponse.data) {
          setUser(retryResponse.data);
        }
      }
    }
  } catch (error: any) {
    // ✅ NUEVO: Si es 401, intentar refresh
    if (error?.response?.status === 401) {
      const refreshSuccess = await attemptTokenRefresh();
      if (refreshSuccess) {
        const retryResponse = await AuthClient.getProfile();
        if (retryResponse.success && retryResponse.data) {
          setUser(retryResponse.data);
          setIsLoading(false);
          return;
        }
      }
    }

    // Limpiar sesión solo si refresh falló
    clearToken();
    clearRefreshToken();
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};

// ✅ NUEVO: Helper para refresh silencioso
const attemptTokenRefresh = async (): Promise<boolean> => {
  try {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) return false;

    const response = await AuthClient.refreshToken(currentRefreshToken);

    if (response.success && response.data) {
      const newAccessToken = response.data.accessToken || response.data.token;
      const newRefreshToken = response.data.refreshToken;
      const rememberMe = isRememberMeEnabled();

      if (newAccessToken) setToken(newAccessToken, rememberMe);
      if (newRefreshToken) setRefreshToken(newRefreshToken, rememberMe);

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error en attemptTokenRefresh:", error);
    return false;
  }
};
```

**Beneficios**:

- ✅ Refresh automático al recargar si el accessToken expiró
- ✅ No se pierde la sesión innecesariamente
- ✅ Usuario puede seguir usando la app sin re-login
- ✅ Fallback: limpia sesión solo si refresh también falla

---

### 2. Filtrado Correcto en AppSidebar

#### **Archivo**: `src/components/organisms/AppSidebar/AppSidebar.tsx`

Corregida lógica de filtrado para no mostrar items con roles cuando aún no sabemos el rol del usuario:

```typescript
// ✅ AHORA (Correcto)
const visibleItems = navigationItems.filter((item) => {
  // Si el item no tiene roles definidos, siempre mostrarlo
  if (!item.roles) return true;

  // Si el item tiene roles pero aún no sabemos el rol del usuario, NO mostrarlo
  if (!userRole) return false;

  // Si el item tiene roles y sabemos el rol del usuario, verificar si coincide
  return item.roles.includes(userRole);
});
```

**Antes vs Después**:

| Condición                              | Antes              | Después              |
| -------------------------------------- | ------------------ | -------------------- |
| Item sin roles                         | ✅ Muestra         | ✅ Muestra           |
| Item con roles + userRole null         | ✅ Muestra (ERROR) | ❌ Oculta (CORRECTO) |
| Item con roles + userRole "estudiante" | ✅ Verifica        | ✅ Verifica          |

**Beneficios**:

- ✅ No muestra opciones restringidas durante la carga
- ✅ Filtrado consistente basado en rol real
- ✅ UX más limpia sin "flash" de opciones incorrectas

---

### 3. Agregado isLoading al AppSidebar

También agregado acceso a `isLoading` para futuras mejoras (ej: mostrar skeleton durante carga):

```typescript
const { user, isLoading } = useAuth();
```

---

## 🔄 Flujo Completo de Persistencia

```
1. Usuario hace login
   ↓
2. Tokens guardados en localStorage + cookies
   ↓
3. Usuario navega por la app
   ↓
4. Usuario recarga página (F5)
   ↓
5. AuthProvider monta → checkAuth() se ejecuta
   ↓
6. checkAuth() obtiene token de localStorage
   ↓
7. checkAuth() llama AuthClient.getProfile()
   ↓
8a. Si 200 OK → setUser(data) ✅ Sesión restaurada
    ↓
8b. Si 401 Unauthorized → attemptTokenRefresh()
    ↓
    - Si refresh OK → Reintentar getProfile() → setUser(data) ✅
    - Si refresh FAIL → Limpiar tokens → Redirigir a login ❌
   ↓
9. AppSidebar filtra menú según userRole
   ↓
10. Usuario ve solo las opciones permitidas
```

---

## 🧪 Testing

### Verificar Persistencia de Sesión

1. **Login con credenciales válidas**
2. **Verificar en DevTools**:
   - Application → Local Storage → `accessToken` y `refreshToken` presentes
   - Application → Cookies → `accessToken` y `refreshToken` presentes
3. **Recargar la página (F5)**
4. **Verificar**:
   - ✅ Sigue autenticado
   - ✅ Menú muestra solo opciones de su rol
   - ✅ No redirige a login

### Verificar Filtrado de Menú

1. **Login como estudiante**
2. **Observar al cargar**:
   - ❌ NO debe mostrar flash de todas las opciones
   - ✅ Debe mostrar solo: Dashboard, Perfil, Recursos, Reservas, Calendario, Check-in
3. **Recargar página**
4. **Verificar**:
   - ✅ Menú se mantiene filtrado correctamente
   - ✅ No ve opciones de admin/coordinador

### Verificar Acceso a Perfil

1. **Login con credenciales válidas**
2. **Navegar a `/profile`**
3. **Verificar**:
   - ✅ Muestra información del perfil
   - ✅ No redirige a login
4. **Recargar en `/profile`**
5. **Verificar**:
   - ✅ Perfil sigue visible
   - ✅ No redirige a login

---

## 📊 Comparativa: Antes vs Después

| Escenario                      | Antes               | Después                            |
| ------------------------------ | ------------------- | ---------------------------------- |
| **Recargar página**            | ❌ Logout forzado   | ✅ Sesión mantenida                |
| **Token expirado al recargar** | ❌ Logout forzado   | ✅ Auto-refresh + sesión mantenida |
| **Menú durante carga**         | ❌ Muestra todo     | ✅ Oculta opciones restringidas    |
| **Acceso a /profile**          | ❌ Redirige a login | ✅ Muestra perfil                  |
| **UX general**                 | ⚠️ Regular          | ✅ Excelente                       |

---

## 🔧 Archivos Modificados

1. **`src/contexts/AuthContext.tsx`**:
   - Agregado `attemptTokenRefresh()` helper
   - Modificado `checkAuth()` para intentar refresh antes de limpiar
   - Manejo mejorado de errores 401

2. **`src/components/organisms/AppSidebar/AppSidebar.tsx`**:
   - Agregado acceso a `isLoading`
   - Corregido filtro de items: no mostrar items con roles cuando `userRole` es null

---

## 🎯 Resultado

### ✅ Problema 1: Resuelto

La sesión se mantiene al recargar la página gracias al auto-refresh del token.

### ✅ Problema 2: Resuelto

El menú NO muestra opciones restringidas durante la carga inicial.

### ✅ Problema 3: Resuelto

Acceder a `/profile` funciona correctamente sin redirigir a login.

---

## 🚀 Mejoras Adicionales Sugeridas

### 1. Skeleton Loading para Sidebar

```typescript
if (isLoading) {
  return <SidebarSkeleton />;
}
```

### 2. Indicador Visual de Refresh

```typescript
const [isRefreshing, setIsRefreshing] = useState(false);

// Mostrar toast o spinner durante refresh
```

### 3. Caché de Usuario en SessionStorage

```typescript
// Guardar user en sessionStorage para cargas más rápidas
sessionStorage.setItem("user", JSON.stringify(user));
```

---

**Última actualización**: 2025-11-23  
**Estado**: ✅ Completamente resuelto  
**Archivos**: AuthContext.tsx, AppSidebar.tsx
