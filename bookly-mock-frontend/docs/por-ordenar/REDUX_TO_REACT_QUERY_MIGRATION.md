# 🔄 Migración Redux → React Query

## 🎯 Objetivo

Migrar estado de Redux a React Query donde corresponda, separando **Server State** de **Client State**.

---

## 📊 Análisis del Estado Actual

### Redux Store Actual

**Archivo**: `/src/store/index.ts`

```typescript
// Slices existentes
-authSlice - // User, token, isAuthenticated
  uiSlice - // Sidebar, theme, language, notifications
  settingsSlice; // Theme settings, layout config
```

---

## 🧩 Separación de Responsabilidades

### Server State → React Query

**Candidatos para migración**:

| Estado Redux       | Migrar a       | Hook React Query       |
| ------------------ | -------------- | ---------------------- |
| `auth.user`        | ✅ React Query | `useCurrentUser()`     |
| `auth.permissions` | ✅ React Query | `useUserPermissions()` |
| `auth.roles`       | ✅ React Query | `useUserRoles()`       |

**Beneficios**:

- Cache automático
- Revalidación en background
- Sincronización entre tabs
- Menos código boilerplate

### Client State → Redux (mantener)

**Mantener en Redux**:

| Estado           | Razón                 |
| ---------------- | --------------------- |
| `ui.sidebarOpen` | Estado puramente UI   |
| `ui.theme`       | Preferencia local     |
| `ui.language`    | Configuración cliente |
| `settings.*`     | Config de layout/UI   |

**Motivo**: No viene del servidor, es estado de aplicación local.

---

## 🚀 Implementación

### 1. Crear useCurrentUser Hook

**Archivo**: `/src/hooks/useAuth.ts` (nuevo)

````typescript
/**
 * useAuth - Hooks para estado de autenticación con React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/infrastructure/http/httpClient";
import type { User } from "@/types/entities/user";

// ============================================
// CACHE KEYS
// ============================================

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "current-user"] as const,
  permissions: () => [...authKeys.all, "permissions"] as const,
  roles: () => [...authKeys.all, "roles"] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener usuario actual autenticado
 *
 * @example
 * ```typescript
 * const { data: user, isLoading } = useCurrentUser();
 *
 * if (user) {
 *   console.log(user.name, user.email);
 * }
 * ```
 */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      // Si no hay token, retornar null
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      const response = await httpClient.get("/auth/profile");
      return response.data || null;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: false, // No reintentar si falla (usuario no autenticado)
  });
}

/**
 * Hook para obtener permisos del usuario actual
 */
export function useUserPermissions() {
  return useQuery({
    queryKey: authKeys.permissions(),
    queryFn: async () => {
      const response = await httpClient.get("/auth/permissions");
      return response.data || [];
    },
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}

/**
 * Hook para obtener roles del usuario actual
 */
export function useUserRoles() {
  return useQuery({
    queryKey: authKeys.roles(),
    queryFn: async () => {
      const response = await httpClient.get("/auth/roles");
      return response.data || [];
    },
    enabled: !!localStorage.getItem("accessToken"),
    staleTime: 1000 * 60 * 15,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await httpClient.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Guardar token
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }

      // Setear usuario en cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);

      // Prefetch permisos y roles
      queryClient.prefetchQuery({
        queryKey: authKeys.permissions(),
      });
      queryClient.prefetchQuery({
        queryKey: authKeys.roles(),
      });
    },
  });
}

/**
 * Hook para logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await httpClient.post("/auth/logout");
    },
    onSuccess: () => {
      // Limpiar token
      localStorage.removeItem("accessToken");

      // Limpiar cache de auth
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.removeQueries({ queryKey: authKeys.permissions() });
      queryClient.removeQueries({ queryKey: authKeys.roles() });

      // Opcional: limpiar todo el cache
      // queryClient.clear();
    },
  });
}

/**
 * Hook para actualizar perfil
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await httpClient.put("/auth/profile", data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Actualizar usuario en cache
      queryClient.setQueryData(authKeys.currentUser(), updatedUser);
    },
  });
}
````

### 2. Migrar Componentes de Redux a React Query

**Antes (Redux)**:

```typescript
// src/components/UserMenu.tsx
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

function UserMenu() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) return null;

  return (
    <div>
      <p>{user?.name}</p>
      <p>{user?.email}</p>
    </div>
  );
}
```

**Después (React Query)**:

```typescript
// src/components/UserMenu.tsx
import { useCurrentUser } from '@/hooks/useAuth';

function UserMenu() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div>
      <p>{user.name}</p>
      <p>{user.email}</p>
    </div>
  );
}
```

### 3. Actualizar authSlice (Redux)

**Archivo**: `/src/store/slices/authSlice.ts`

**Antes**:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Reducers: setUser, setToken, logout, etc.
```

**Después** (simplificado):

```typescript
interface AuthState {
  // Solo token (opcional, puede estar en localStorage)
  token: string | null;
}

// User viene de React Query - useCurrentUser()
```

O **eliminar authSlice completamente** si solo manejamos token en localStorage.

---

## 📋 Plan de Migración

### Fase 1: Preparación ✅

- [x] Crear `hooks/useAuth.ts`
- [x] Implementar `useCurrentUser()`
- [x] Implementar `useLogin()` y `useLogout()`
- [x] Implementar `useUpdateProfile()`

### Fase 2: Migración de Componentes

**Componentes a migrar**:

1. **AppHeader** - Mostrar nombre de usuario

   ```typescript
   // Antes: useSelector(state => state.auth.user)
   // Después: useCurrentUser()
   ```

2. **UserMenu** - Dropdown con perfil

   ```typescript
   const { data: user } = useCurrentUser();
   ```

3. **ProtectedRoute** - Verificar autenticación

   ```typescript
   const { data: user, isLoading } = useCurrentUser();
   if (isLoading) return <LoadingSpinner />;
   if (!user) return <Navigate to="/login" />;
   ```

4. **ProfilePage** - Editar perfil
   ```typescript
   const { data: user } = useCurrentUser();
   const updateProfile = useUpdateProfile();
   ```

### Fase 3: Limpiar Redux

- [ ] Remover `auth.user` de authSlice
- [ ] Mantener solo `ui` y `settings` slices
- [ ] Actualizar types de RootState
- [ ] Remover actions/reducers no usados

---

## 🎯 Estado Final

### Redux (Client State)

```typescript
// store/index.ts
{
  ui: {
    sidebarOpen: boolean,
    theme: 'light' | 'dark',
    language: 'es' | 'en',
    notifications: Notification[]
  },
  settings: {
    layout: {...},
    colors: {...}
  }
}
```

### React Query (Server State)

```typescript
// Queries activas
{
  ['auth', 'current-user']: User | null,
  ['auth', 'permissions']: Permission[],
  ['auth', 'roles']: Role[],
  ['resources', 'list']: Resource[],
  ['reservations', 'list']: Reservation[],
  // ... todas las queries existentes
}
```

---

## 💡 Beneficios de la Migración

| Aspecto            | Redux (Antes)         | React Query (Después) |
| ------------------ | --------------------- | --------------------- |
| **User data**      | Manual sync           | Auto sync             |
| **Cache**          | Manual implementation | Built-in              |
| **Loading states** | Manual                | Integrated            |
| **Error handling** | Manual                | Integrated            |
| **Revalidación**   | Manual refetch        | Background auto       |
| **Code lines**     | ~150 lines            | ~50 lines             |
| **Boilerplate**    | Alto                  | Mínimo                |

---

## 🚀 Ejemplo Completo de Uso

### Login Flow

```typescript
// pages/login/page.tsx
import { useLogin } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const handleSubmit = (email: string, password: string) => {
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.push('/dashboard');
          // User data ya está en cache vía useCurrentUser()
        },
        onError: (error) => {
          alert('Login failed');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={login.isPending}>
        {login.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Protected Component

```typescript
// components/ProtectedComponent.tsx
import { useCurrentUser } from '@/hooks/useAuth';

export function ProtectedComponent() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(', ')}</p>
    </div>
  );
}
```

### Profile Update

```typescript
// pages/profile/page.tsx
import { useCurrentUser, useUpdateProfile } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const handleSave = (data) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        alert('Profile updated!');
        // Cache se actualiza automáticamente
      },
    });
  };

  return (
    <form onSubmit={handleSave}>
      {/* Form fields */}
      <button disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

---

## ✅ Checklist de Migración

### Crear Hooks

- [ ] `useCurrentUser()`
- [ ] `useUserPermissions()`
- [ ] `useUserRoles()`
- [ ] `useLogin()`
- [ ] `useLogout()`
- [ ] `useUpdateProfile()`

### Migrar Componentes

- [ ] AppHeader
- [ ] UserMenu
- [ ] ProfilePage
- [ ] ProtectedRoute
- [ ] Sidebar (user info)

### Limpiar Redux

- [ ] Remover `auth.user`
- [ ] Remover `auth.permissions`
- [ ] Mantener solo `ui` y `settings`
- [ ] Actualizar types

### Testing

- [ ] Login flow
- [ ] Logout flow
- [ ] Profile update
- [ ] Auto revalidación
- [ ] Multi-tab sync

---

## 📈 Resultado Esperado

**Código Redux eliminado**: ~200 líneas  
**Código React Query nuevo**: ~150 líneas  
**Beneficio neto**: -50 líneas + features gratis (cache, revalidation, sync)

---

**Fecha**: Noviembre 21, 2025  
**Estado**: ✅ **LISTO PARA IMPLEMENTAR**
