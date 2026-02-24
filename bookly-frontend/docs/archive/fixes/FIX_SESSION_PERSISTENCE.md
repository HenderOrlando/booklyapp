# ✅ Corrección de Persistencia de Sesión

> **Problema**: Al recargar la página se perdía el usuario y obligaba a loguearse nuevamente  
> **Estado**: ✅ Resuelto  
> **Fecha**: Nov 2025

---

## 🐛 Problemas Identificados

### Problema 1: Pérdida de Sesión al Recargar

Al recargar la página (`F5` o `Ctrl+R`), el usuario perdía su sesión y era redirigido al login, incluso habiendo iniciado sesión correctamente momentos antes.

### Problema 2: Desaparición del Menú (Actualización)

Al recargar la página con errores de red temporales, el menú lateral (`AppSidebar`) desaparecía completamente porque se hacía `setUser(null)`, dejando la UI sin navegación.

### Causa Raíz

El método `checkAuth()` en `AuthContext.tsx` era **demasiado agresivo** al limpiar la sesión:

```typescript
// ❌ ANTES - Limpiaba sesión en CUALQUIER error
try {
  const response = await AuthClient.getProfile();
  if (response.success) {
    setUser(response.data);
  }
} catch (error) {
  // Cualquier error → limpia sesión
  clearToken();
  clearRefreshToken();
  setUser(null);
}
```

**Escenarios problemáticos:**

1. **Backend apagado temporalmente** → Limpiaba sesión ❌
2. **Error de red temporal** → Limpiaba sesión ❌
3. **Timeout de request** → Limpiaba sesión ❌
4. **CORS error** → Limpiaba sesión ❌
5. **Token expirado** → Limpiaba sesión ✓ (correcto)

**Resultado**: Usuario tenía que loguearse en cada recarga si había cualquier problema de red.

---

## ✅ Solución Implementada

### 1. Discriminación de Errores

**Antes**: Todos los errores limpiaban la sesión  
**Ahora**: Solo errores de autenticación limpian la sesión

```typescript
// ✅ AHORA - Diferencia tipos de error
const isAuthError =
  error?.response?.status === 401 || error?.response?.status === 403;

const isNetworkError =
  !error?.response ||
  error?.message?.includes("network") ||
  error?.message?.includes("fetch") ||
  error?.code === "ECONNREFUSED";

if (isAuthError) {
  // Token inválido → intentar refresh, si falla → limpiar sesión
} else if (isNetworkError) {
  // Error de red → mantener tokens, reintentar automáticamente
} else {
  // Error desconocido → mantener tokens (ser conservador)
}
```

---

### 2. Retry Automático para Errores de Red

**Nueva funcionalidad**: Reintentos automáticos cuando el backend no responde

```typescript
// ✅ Retry automático en errores de red
if (isNetworkError) {
  if (retryCountRef.current < 3) {
    retryCountRef.current += 1;
    checkAuthRetryRef.current = setTimeout(() => {
      console.log(
        `🔄 Reintentando checkAuth (intento ${retryCountRef.current}/3)...`
      );
      checkAuth();
    }, 3000);
  }
}
```

**Beneficios:**

- ✅ Hasta 3 reintentos automáticos cada 3 segundos
- ✅ Usuario no pierde sesión por problemas temporales
- ✅ Reconexión automática cuando backend vuelve

---

### 3. Cache de Último Usuario Válido (Nuevo)

**Problema adicional detectado**: Al hacer `setUser(null)` en errores de red, el menú desaparecía porque `AppSidebar` depende de `user?.roles`.

**Solución**: Mantener cache del último usuario válido obtenido

```typescript
// ✅ Cache de usuario
const lastValidUserRef = useRef<User | null>(null);

// Guardar en cache cuando obtenemos usuario exitosamente
if (response.success && response.data) {
  setUser(response.data);
  lastValidUserRef.current = response.data; // 💾 Cache
}

// Restaurar desde cache en errores de red
if (isNetworkError && lastValidUserRef.current && !user) {
  console.log("💾 Restaurando último usuario válido desde cache");
  setUser(lastValidUserRef.current); // Mantener menú visible
}
```

**Beneficios:**

- ✅ Menú permanece visible durante reconexiones
- ✅ UI funcional incluso con backend temporalmente offline
- ✅ Mejor experiencia de usuario sin parpadeos

---

### 4. Reset de Contador al Éxito

```typescript
if (response.success && response.data) {
  setUser(response.data);
  // ✅ Resetear contador si auth exitoso
  retryCountRef.current = 0;
  if (checkAuthRetryRef.current) {
    clearTimeout(checkAuthRetryRef.current);
  }
}
```

---

## 🔄 Flujo Completo de Persistencia

### Caso 1: Recarga Normal (Backend Funcionando)

```
1. Usuario recarga página (F5)
   ↓
2. AuthContext.checkAuth() se ejecuta
   ↓
3. Obtiene token de localStorage ✓
   ↓
4. Llama AuthClient.getProfile()
   ↓
5. Backend responde con usuario ✓
   ↓
6. setUser(userData)
   ↓
7. Usuario sigue autenticado ✅
```

---

### Caso 2: Recarga con Backend Apagado

```
1. Usuario recarga página (F5)
   ↓
2. AuthContext.checkAuth() se ejecuta
   ↓
3. Obtiene token de localStorage ✓
   ↓
4. Llama AuthClient.getProfile()
   ↓
5. Error de red (ECONNREFUSED)
   ↓
6. Detecta isNetworkError = true
   ↓
7. NO limpia tokens ✓
   ↓
8. Programa retry en 3 segundos
   ↓
9. (Después de 3s) Reintenta checkAuth
   ↓
10. Si backend vuelve → Éxito ✅
11. Si sigue apagado → Retry 2/3, 3/3
```

---

### Caso 3: Token Realmente Expirado (401)

```
1. Usuario recarga página
   ↓
2. checkAuth() ejecuta
   ↓
3. AuthClient.getProfile() → 401 Unauthorized
   ↓
4. Detecta isAuthError = true
   ↓
5. Intenta refresh token
   ↓
   ┌─ Si refresh exitoso:
   │  ├─ Guarda nuevo token
   │  ├─ Reintenta getProfile()
   │  └─ Usuario sigue autenticado ✅
   │
   └─ Si refresh falla:
      ├─ clearToken()
      ├─ clearRefreshToken()
      └─ Redirige a login ✓
```

---

## 📊 Tipos de Errores y Respuesta

| Error                 | Status | Acción                | Resultado            |
| --------------------- | ------ | --------------------- | -------------------- |
| **Token expirado**    | 401    | Refresh token → Retry | Sesión restaurada ✅ |
| **Token inválido**    | 403    | Limpiar sesión        | Logout ✓             |
| **Backend apagado**   | -      | Retry 3x              | Sesión preservada ✅ |
| **Network error**     | -      | Retry 3x              | Sesión preservada ✅ |
| **Timeout**           | -      | Retry 3x              | Sesión preservada ✅ |
| **CORS error**        | -      | Mantener tokens       | Sesión preservada ✅ |
| **Error desconocido** | -      | Mantener tokens       | Sesión preservada ✅ |

---

## 🎯 Cambios Realizados

### Archivo: `src/contexts/AuthContext.tsx`

#### 1. Nuevas referencias para retry

```typescript
const checkAuthRetryRef = useRef<NodeJS.Timeout | null>(null);
const retryCountRef = useRef<number>(0);
```

#### 2. Lógica de discriminación de errores

```typescript
const isAuthError =
  error?.response?.status === 401 || error?.response?.status === 403;

const isNetworkError =
  !error?.response ||
  error?.message?.includes("network") ||
  error?.message?.includes("fetch") ||
  error?.code === "ECONNREFUSED";
```

#### 3. Manejo específico por tipo de error

```typescript
if (isAuthError) {
  // Intentar refresh, limpiar solo si falla
} else if (isNetworkError) {
  // Retry automático 3 veces
} else {
  // Mantener sesión, ser conservador
}
```

#### 4. Reset de contador al éxito

```typescript
if (response.success && response.data) {
  retryCountRef.current = 0;
  if (checkAuthRetryRef.current) {
    clearTimeout(checkAuthRetryRef.current);
  }
}
```

#### 5. Limpieza de timers

```typescript
const clearAllTimers = () => {
  // ... otros timers
  if (checkAuthRetryRef.current) {
    clearTimeout(checkAuthRetryRef.current);
  }
};
```

---

## 🧪 Cómo Verificar la Corrección

### Test 1: Recarga Normal

```bash
1. Login en la aplicación
2. Presionar F5
3. Verificar en console:
   ✅ "checkAuth - Token encontrado: true"
   ✅ "checkAuth - Usuario obtenido correctamente"
4. Usuario debe seguir autenticado
```

### Test 2: Recarga con Backend Apagado

```bash
1. Login en la aplicación
2. Detener el backend (docker stop o Ctrl+C)
3. Presionar F5
4. Verificar en console:
   ⚠️ "checkAuth - Error de red/backend, manteniendo sesión"
   🔄 "Reintentando checkAuth (intento 1/3)..."
5. Reiniciar backend
6. Después de 3s, debería ver:
   ✅ "checkAuth - Usuario obtenido correctamente"
7. Usuario recupera sesión automáticamente
```

### Test 3: Token Expirado

```bash
1. Login en la aplicación
2. Esperar que token expire (o modificar manualmente)
3. Presionar F5
4. Verificar en console:
   🔄 "checkAuth - Error de autenticación detectado, intentando refresh..."
   ✅ "checkAuth - Usuario obtenido después de refresh"
5. Usuario debe seguir autenticado (con nuevo token)
```

### Test 4: Refresh Token También Expirado

```bash
1. Login en la aplicación
2. Eliminar refreshToken de localStorage manualmente
3. Modificar token para que sea inválido
4. Presionar F5
5. Verificar en console:
   🧹 "checkAuth - Token inválido, limpiando sesión"
6. Usuario debe ser redirigido a login (correcto)
```

---

## 📈 Beneficios de la Solución

### Antes ❌

- ✗ Recarga → Pierde sesión siempre
- ✗ Backend apagado → Logout forzado
- ✗ Error de red temporal → Logout forzado
- ✗ Mala experiencia de usuario
- ✗ Frustración constante

### Ahora ✅

- ✅ Recarga → Mantiene sesión
- ✅ Backend apagado → Retry automático 3x
- ✅ Error de red → Sesión preservada
- ✅ Token expirado → Auto-refresh
- ✅ Excelente UX

---

## 🎓 Lecciones Aprendidas

### 1. No Limpiar Sesión Agresivamente

**Antes**: Cualquier error → logout  
**Ahora**: Solo errores de auth → logout

**Aprendizaje**: Ser conservador con la sesión del usuario. Es mejor mantenerla y mostrar un error temporal que obligar a re-login.

---

### 2. Diferenciar Tipos de Error

**Error de autenticación** (401, 403):

- Token inválido o expirado
- Acción: Intentar refresh, si falla → logout

**Error de red** (timeout, ECONNREFUSED):

- Problema temporal de conectividad
- Acción: Mantener sesión, reintentar

**Error desconocido**:

- No sabemos qué pasó
- Acción: Ser conservador, mantener sesión

---

### 3. Retry Automático

**Beneficio**: Recuperación automática de fallos temporales

**Implementación**:

- Máximo 3 reintentos
- Delay de 3 segundos entre reintentos
- Reset del contador al éxito

---

### 4. Logging Estructurado

```typescript
console.log("🔐 checkAuth - Token encontrado:", !!token);
console.log("📡 checkAuth - Llamando a AuthClient...");
console.log("✅ checkAuth - Usuario obtenido");
console.warn("⚠️ checkAuth - Error de red, reintentando...");
console.error("❌ checkAuth - Error crítico");
```

**Beneficio**: Fácil debugging en producción con emojis visuales

---

## 🚀 Próximas Mejoras Opcionales

### 1. Indicador Visual de Reconexión

```typescript
// TODO: Mostrar toast cuando está reintentando
if (isNetworkError && retryCountRef.current === 1) {
  showInfo("Verificando conexión...", "Reintentando conectar con el servidor");
}
```

### 2. Persistencia en IndexedDB

```typescript
// TODO: Usar IndexedDB además de localStorage
// Más robusto para sesiones largas
```

### 3. Service Worker para Offline

```typescript
// TODO: Implementar service worker
// Mantener app funcional offline
```

---

## 📝 Casos de Uso Cubiertos

### ✅ Cubiertos

- [x] Recarga normal de página
- [x] Backend temporalmente apagado
- [x] Error de red temporal
- [x] Token expirado (auto-refresh)
- [x] Refresh token expirado
- [x] Token inválido manualmente
- [x] Múltiples recargas rápidas
- [x] Logout manual

### 🔄 Pendientes (Opcionales)

- [ ] Modo offline completo
- [ ] Sincronización cuando vuelve online
- [ ] Persistencia en IndexedDB
- [ ] Service Worker

---

## ✅ Checklist de Validación

- [x] Recarga normal mantiene sesión
- [x] Backend apagado no fuerza logout
- [x] Retry automático funciona (3 intentos)
- [x] Token expirado se refresca automáticamente
- [x] Tokens inválidos fuerzan logout (correcto)
- [x] Contador de retry se resetea al éxito
- [x] Timers se limpian correctamente
- [x] Logging claro y útil
- [x] No memory leaks (timers limpiados)

---

## 🎉 Conclusión

**Estado**: ✅ **Problema Resuelto Completamente**

**Antes**: Usuario perdía sesión en cada recarga  
**Ahora**: Sesión persiste correctamente con retry automático

**Beneficio**: Experiencia de usuario mejorada dramáticamente

**Siguiente**: Considerar implementar modo offline completo (opcional)

---

**Documentado por**: AI Assistant  
**Fecha**: Nov 2025  
**Estado**: ✅ **Producción Ready**
