# ✅ FIX: Profile Auth - Problema Resuelto

**Fecha**: Noviembre 21, 2025, 3:45 AM  
**Estado**: ✅ **CORREGIDO**

---

## 🐛 Problema Reportado

**Síntoma**: La página de perfil (`/profile`) no carga y pide volver a iniciar sesión aunque el usuario acaba de iniciar sesión.

**Causa Raíz**: Inconsistencia en el nombre del token en localStorage.

---

## 🔍 Diagnóstico

### Problema Identificado

El hook `useCurrentUser` estaba buscando el token con un nombre incorrecto:

**Incorrecto** (useCurrentUser):

```typescript
const token = localStorage.getItem("accessToken"); // ❌ INCORRECTO
```

**Correcto** (base-client.ts):

```typescript
const token = localStorage.getItem("token"); // ✅ CORRECTO
```

### Archivos Afectados

1. `/src/hooks/useCurrentUser.ts` - 3 ubicaciones:
   - Línea 47: `useCurrentUser()` query function
   - Línea 123: `useLogin()` onSuccess
   - Línea 150: `useLogout()` onSuccess

---

## ✅ Solución Aplicada

### Cambios Realizados

#### 1. useCurrentUser() - Lectura del Token

**Antes**:

```typescript
const token = localStorage.getItem("accessToken");
if (!token) return null;
```

**Después**:

```typescript
// Verificar si hay token (nombre correcto: "token")
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;
if (!token) {
  console.log("[useCurrentUser] No token found");
  return null;
}
```

**Mejoras**:

- ✅ Nombre correcto del token: `"token"`
- ✅ Verificación de `window` para SSR
- ✅ Logging para debugging

#### 2. useLogin() - Guardar Token

**Antes**:

```typescript
if (data.token) {
  localStorage.setItem("accessToken", data.token);
}
```

**Después**:

```typescript
// Guardar token (nombre correcto: "token")
if (data.token) {
  localStorage.setItem("token", data.token);
}
```

#### 3. useLogout() - Limpiar Token

**Antes**:

```typescript
localStorage.removeItem("accessToken");
```

**Después**:

```typescript
// Limpiar token (nombre correcto: "token")
localStorage.removeItem("token");
```

#### 4. useCurrentUser() - Configuración de Query

**Cambio Adicional**:

```typescript
refetchOnMount: true, // ✅ Ahora refetch en mount para validar sesión
```

**Beneficio**: Valida automáticamente la sesión al entrar a la página.

---

## 🎯 Resultado

### Antes (❌ No funcionaba)

1. Usuario inicia sesión → Token guardado como `"accessToken"`
2. Usuario va a `/profile` → Hook busca `"token"`
3. ❌ No encuentra token
4. ❌ Retorna `user = null`
5. ❌ Página pide volver a iniciar sesión

### Después (✅ Funciona)

1. Usuario inicia sesión → Token guardado como `"token"` ✅
2. Usuario va a `/profile` → Hook busca `"token"` ✅
3. ✅ Encuentra token
4. ✅ Fetch de usuario exitoso
5. ✅ Página carga correctamente

---

## 🧪 Cómo Verificar el Fix

### Prueba 1: Login + Profile

1. Abrir navegador en modo incógnito
2. Ir a `/login`
3. Iniciar sesión con credenciales válidas
4. Navegar a `/profile`
5. **Resultado esperado**: Página carga con información del usuario

### Prueba 2: Verificar Token en localStorage

1. Abrir DevTools (F12)
2. Ir a pestaña "Application" (Chrome) o "Storage" (Firefox)
3. Expandir "Local Storage"
4. **Verificar**: Debe existir clave `"token"` con valor JWT

### Prueba 3: Verificar Cache de React Query

1. Con React Query DevTools abierto
2. Navegar a `/profile`
3. **Verificar**: Query `["current-user", "profile"]` debe tener `status: "success"`
4. **Verificar**: Data del usuario debe estar visible

---

## 📊 Archivos Modificados

| Archivo                        | Cambios        | Líneas       |
| ------------------------------ | -------------- | ------------ |
| `/src/hooks/useCurrentUser.ts` | 3 correcciones | 47, 123, 150 |

**Total**: 1 archivo, 3 ubicaciones corregidas

---

## 🔧 Detalles Técnicos

### Token Storage Standard

**Nombre oficial del token**: `"token"`

**Ubicación**: `localStorage`

**Usado en**:

- ✅ `/src/infrastructure/api/base-client.ts` (authInterceptor)
- ✅ `/src/hooks/useCurrentUser.ts` (todos los hooks)
- ✅ `/src/components/molecules/LogoutButton` (indirectamente)

### Flujo de Autenticación Correcto

```
1. Login
   ↓
   POST /auth/login
   ↓
   Response: { user, token }
   ↓
   localStorage.setItem("token", token) ✅
   ↓
   queryClient.setQueryData(currentUserKeys.user(), user)

2. Profile Page
   ↓
   useCurrentUser() called
   ↓
   const token = localStorage.getItem("token") ✅
   ↓
   GET /auth/profile (con token en headers)
   ↓
   Response: { user }
   ↓
   Cache actualizado

3. Logout
   ↓
   POST /auth/logout
   ↓
   localStorage.removeItem("token") ✅
   ↓
   queryClient.clear()
```

---

## ✅ Estado Final

**Problema**: ✅ **RESUELTO**

**Testing**: ⏳ **Pendiente de verificación por usuario**

**Recomendación**: Probar el flujo completo de login → profile → logout para confirmar que todo funciona correctamente.

---

## 📝 Notas Adicionales

### Prevención de Futuros Errores

Para evitar este tipo de inconsistencias en el futuro:

1. **Documentar** el nombre estándar del token en un lugar central
2. **Crear constantes** para nombres de keys:
   ```typescript
   export const AUTH_TOKEN_KEY = "token";
   ```
3. **Usar la constante** en todos los lugares:
   ```typescript
   localStorage.getItem(AUTH_TOKEN_KEY);
   ```

### Mejora Futura Sugerida

Crear un módulo de storage centralizado:

```typescript
// src/utils/storage.ts
export const storage = {
  setToken: (token: string) => localStorage.setItem("token", token),
  getToken: () => localStorage.getItem("token"),
  removeToken: () => localStorage.removeItem("token"),
};
```

---

**FIX APLICADO Y LISTO** ✅
