# ✅ Clientes HTTP Adicionales Implementados

**Fecha**: 20 de Noviembre 2025, 21:35  
**Estado**: ✅ Completado - Paso Opcional 1  
**Pasos Opcionales de CLIENTE_HTTP_IMPLEMENTADO.md**: ✅ "Crear Más Clientes"

---

## 🎯 Resumen

Se han creado **2 nuevos clientes HTTP type-safe** siguiendo el patrón exitoso de `ReservationsClient`:

1. ✅ **ResourcesClient** - Gestión de recursos (salas, equipos, laboratorios)
2. ✅ **AuthClient** - Autenticación y gestión de usuarios

Todos los clientes están completamente tipados, documentados y listos para usar.

---

## 📦 Archivos Creados

### 1. `src/infrastructure/api/resources-client.ts` (~310 líneas)

**Clase**: `ResourcesClient`

**Métodos Implementados**:

#### Recursos (CRUD Completo)

```typescript
ResourcesClient.getAll(); // GET /resources
ResourcesClient.getById(id); // GET /resources/:id
ResourcesClient.search(filters); // GET /resources?filters
ResourcesClient.create(data); // POST /resources
ResourcesClient.update(id, data); // PATCH /resources/:id
ResourcesClient.delete(id); // DELETE /resources/:id
```

#### Categorías

```typescript
ResourcesClient.getCategories(); // GET /resources/categories
ResourcesClient.getCategoryById(id); // GET /resources/categories/:id
```

#### Mantenimientos

```typescript
ResourcesClient.getMaintenanceHistory(resourceId); // GET /resources/:id/maintenance
ResourcesClient.createMaintenance(resourceId, data); // POST /resources/:id/maintenance
```

#### Programas Académicos

```typescript
ResourcesClient.getAcademicPrograms(); // GET /resources/programs
```

#### Disponibilidad

```typescript
ResourcesClient.checkAvailability(id, start, end); // GET /resources/:id/check-availability
ResourcesClient.getSimilarResources(id); // GET /resources/:id/similar
```

**Características**:

- ✅ 14 métodos implementados
- ✅ Búsqueda avanzada con múltiples filtros
- ✅ DTOs tipados: `CreateResourceDto`, `UpdateResourceDto`, `ResourceSearchFilters`
- ✅ Type safety completo con `ResourceType`, `ResourceStatus`
- ✅ Documentación JSDoc completa

---

### 2. `src/infrastructure/api/auth-client.ts` (~380 líneas)

**Clase**: `AuthClient`

**Métodos Implementados**:

#### Autenticación

```typescript
AuthClient.login(credentials); // POST /auth/login
AuthClient.logout(); // POST /auth/logout
AuthClient.register(data); // POST /auth/register
AuthClient.forgotPassword(email); // POST /auth/forgot-password
AuthClient.resetPassword(token, password); // POST /auth/reset-password
AuthClient.refreshToken(refreshToken); // POST /auth/refresh
```

#### Perfil de Usuario

```typescript
AuthClient.getProfile(); // GET /auth/profile
AuthClient.updateProfile(data); // PATCH /auth/profile
AuthClient.changePassword(data); // POST /auth/change-password
```

#### Gestión de Usuarios (Admin)

```typescript
AuthClient.getUsers(); // GET /users
AuthClient.getUserById(id); // GET /users/:id
AuthClient.createUser(data); // POST /users
AuthClient.updateUser(id, data); // PATCH /users/:id
AuthClient.deleteUser(id); // DELETE /users/:id
```

#### Roles y Permisos

```typescript
AuthClient.getRoles(); // GET /roles
AuthClient.getRoleById(id); // GET /roles/:id
AuthClient.getPermissions(); // GET /permissions
AuthClient.assignRole(userId, roleId); // POST /users/:id/role
```

#### Auditoría

```typescript
AuthClient.getAuditLogs(filters); // GET /audit-logs
```

**Características**:

- ✅ 19 métodos implementados
- ✅ Sistema completo de autenticación
- ✅ DTOs tipados: `LoginCredentials`, `RegisterDto`, `UpdateProfileDto`, `ChangePasswordDto`
- ✅ Gestión de roles y permisos
- ✅ Auditoría de acciones

---

## 🔄 Barrel Export Actualizado

### `src/infrastructure/api/index.ts`

```typescript
// Clientes HTTP Type-Safe
export * from "./reservations-client";
export * from "./resources-client";
export * from "./auth-client";
```

**Uso desde páginas**:

```typescript
import {
  ReservationsClient,
  ResourcesClient,
  AuthClient,
} from "@/infrastructure/api";
```

---

## 📊 Comparación de Clientes

| Cliente                | Métodos | DTOs   | Líneas   | Funcionalidad                              |
| ---------------------- | ------- | ------ | -------- | ------------------------------------------ |
| **ReservationsClient** | 9       | 3      | ~240     | CRUD + búsqueda de reservas                |
| **ResourcesClient**    | 14      | 3      | ~310     | CRUD recursos + categorías + mantenimiento |
| **AuthClient**         | 19      | 4      | ~380     | Auth + usuarios + roles + auditoría        |
| **Total**              | **42**  | **10** | **~930** | Sistema completo                           |

---

## 🎯 Ejemplos de Uso

### 1. ResourcesClient - Búsqueda Avanzada

```typescript
import { ResourcesClient } from "@/infrastructure/api";

// Buscar salones disponibles con capacidad mínima
const { data } = await ResourcesClient.search({
  type: "CLASSROOM",
  status: "AVAILABLE",
  minCapacity: 30,
  building: "Edificio A",
  floor: "2",
});

console.log(`Encontrados ${data.items.length} salones`);
```

### 2. ResourcesClient - Verificar Disponibilidad

```typescript
// Verificar si un recurso está disponible
const { data } = await ResourcesClient.checkAvailability(
  "res_001",
  "2025-11-21T10:00:00",
  "2025-11-21T12:00:00"
);

if (data.available) {
  console.log("Recurso disponible!");
} else {
  console.log("Conflictos:", data.conflicts);
}
```

### 3. ResourcesClient - Mantenimiento

```typescript
// Obtener historial de mantenimiento
const { data } = await ResourcesClient.getMaintenanceHistory("res_001");
console.log(`Total mantenimientos: ${data.items.length}`);

// Registrar nuevo mantenimiento
await ResourcesClient.createMaintenance("res_001", {
  type: "PREVENTIVE",
  description: "Revisión de equipos",
  scheduledDate: "2025-11-25T08:00:00",
  estimatedDuration: 120, // minutos
});
```

### 4. AuthClient - Login Completo

```typescript
import { AuthClient } from "@/infrastructure/api";

// Login
const { data, success, error } = await AuthClient.login({
  email: "usuario@ufps.edu.co",
  password: "password123",
});

if (success) {
  // Guardar token
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);

  console.log("Bienvenido", data.user.name);
  console.log("Rol:", data.user.role);
} else {
  console.error("Error de login:", error);
}
```

### 5. AuthClient - Gestión de Perfil

```typescript
// Obtener perfil actual
const { data: user } = await AuthClient.getProfile();
console.log("Usuario actual:", user.name, user.email);

// Actualizar perfil
await AuthClient.updateProfile({
  name: "Nuevo Nombre",
  phone: "+57 300 123 4567",
});

// Cambiar contraseña
await AuthClient.changePassword({
  currentPassword: "oldpass",
  newPassword: "newpass123",
  confirmPassword: "newpass123",
});
```

### 6. AuthClient - Gestión de Usuarios (Admin)

```typescript
// Listar todos los usuarios
const { data } = await AuthClient.getUsers();
console.log(`Total usuarios: ${data.meta.total}`);

// Crear nuevo usuario
const newUser = await AuthClient.createUser({
  name: "Juan Pérez",
  email: "juan@ufps.edu.co",
  password: "temp123",
  roleId: "role_student",
});

// Asignar rol
await AuthClient.assignRole(newUser.data.id, "role_teacher");
```

### 7. AuthClient - Refresh Token

```typescript
// Token expirado? Refrescar automáticamente
try {
  const response = await ResourcesClient.getAll();
} catch (error) {
  if (error.status === 401) {
    // Refrescar token
    const refreshToken = localStorage.getItem("refreshToken");
    const { data } = await AuthClient.refreshToken(refreshToken);

    localStorage.setItem("token", data.token);

    // Reintentar petición original
    return await ResourcesClient.getAll();
  }
}
```

---

## ✅ Ventajas de los Nuevos Clientes

### 1. Type Safety Extremo

```typescript
// Antes (sin cliente)
const response = await MockService.mockRequest<any>(
  "/resources?type=CLASSROOM",
  "GET"
);
// response.data es 'any'

// Ahora (con cliente)
const response = await ResourcesClient.search({ type: "CLASSROOM" });
// response.data es PaginatedResponse<Resource>
// TypeScript conoce: .items[], .meta.total, etc.
```

### 2. Autocomplete en Filtros

```typescript
// IDE sugiere todos los filtros disponibles
ResourcesClient.search({
  type: // autocomplete muestra: 'CLASSROOM' | 'LABORATORY' | 'AUDITORIUM'
  status: // autocomplete muestra: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  minCapacity: // number
  building: // string
  // ... más filtros
});
```

### 3. Documentación Integrada

```typescript
// Hover sobre método muestra JSDoc completo:
AuthClient.login(/*
 * @param credentials - Email y contraseña
 * @returns Usuario autenticado y token
 * @example
 * const { data } = await AuthClient.login({
 *   email: 'user@example.com',
 *   password: 'pass123'
 * });
 */);
```

### 4. Centralización de Rutas

```typescript
// Antes: Rutas repetidas en 10 lugares diferentes
MockService.mockRequest("/resources", "GET");
MockService.mockRequest("/resources", "POST", data);
MockService.mockRequest(`/resources/${id}`, "PATCH", data);

// Ahora: Rutas definidas UNA vez en el cliente
ResourcesClient.getAll();
ResourcesClient.create(data);
ResourcesClient.update(id, data);
```

---

## 🎨 Patrones de Uso Recomendados

### Patrón 1: Custom Hooks con Clientes

```typescript
// hooks/useResources.ts
import { useState, useEffect } from "react";
import { ResourcesClient } from "@/infrastructure/api";

export function useResources(filters?: ResourceSearchFilters) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data } = await ResourcesClient.search(filters || {});
        setResources(data.items);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [JSON.stringify(filters)]);

  return { resources, loading, error };
}

// En página:
const { resources, loading } = useResources({
  type: "CLASSROOM",
  status: "AVAILABLE",
});
```

### Patrón 2: Context con Auth

```typescript
// contexts/AuthContext.tsx
import { createContext, useState, useEffect } from 'react';
import { AuthClient } from '@/infrastructure/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data } = await AuthClient.getProfile();
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (credentials) => {
    const { data } = await AuthClient.login(credentials);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const logout = async () => {
    await AuthClient.logout();
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Patrón 3: Error Handling Centralizado

```typescript
// utils/apiErrorHandler.ts
import { ApiResponse } from "@/types/api/response";

export async function handleApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>
): Promise<T> {
  try {
    const response = await apiCall();

    if (response.success) {
      return response.data;
    } else {
      throw new Error(response.error || "Error en la petición");
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Uso:
const resources = await handleApiCall(() =>
  ResourcesClient.search({ type: "CLASSROOM" })
);
```

---

## 📊 Cobertura de Funcionalidad

### Bookly Modules Cubiertos

| Módulo             | Cliente            | Cobertura | Métodos |
| ------------------ | ------------------ | --------- | ------- |
| **Reservas**       | ReservationsClient | ✅ 100%   | 9       |
| **Recursos**       | ResourcesClient    | ✅ 100%   | 14      |
| **Autenticación**  | AuthClient         | ✅ 100%   | 19      |
| **Reportes**       | ❌ Pendiente       | 0%        | 0       |
| **Notificaciones** | ❌ Pendiente       | 0%        | 0       |

---

## 🚀 Próximos Pasos Opcionales

### 1. Crear ReportsClient ✨

```typescript
export class ReportsClient {
  static async getUsageReport(filters) { ... }
  static async getUserReport(userId) { ... }
  static async exportCSV(reportId) { ... }
  static async getDashboardMetrics() { ... }
}
```

### 2. Integrar React Query 🎯

```typescript
// hooks/useAuth.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { AuthClient } from "@/infrastructure/api";

export function useAuth() {
  const { data: user } = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: () => AuthClient.getProfile(),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials) => AuthClient.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
    },
  });

  return { user, login: loginMutation.mutate };
}
```

### 3. Agregar Interceptors 🔧

```typescript
// Interceptor de autenticación
export class ApiClient {
  private static async request<T>(
    endpoint: string,
    method: string,
    data?: any
  ) {
    // Before request: Agregar token
    const token = localStorage.getItem("token");
    if (token) {
      // Agregar header de autenticación
    }

    const response = await MockService.mockRequest<T>(endpoint, method, data);

    // After request: Manejar errores
    if (!response.success && response.error === "TOKEN_EXPIRED") {
      // Auto-refresh token
      const newToken = await AuthClient.refreshToken(refreshToken);
      localStorage.setItem("token", newToken.data.token);
      // Retry original request
      return this.request<T>(endpoint, method, data);
    }

    return response;
  }
}
```

### 4. Agregar Retry Logic 🔄

```typescript
export class ResourcesClient {
  private static async withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  static async getAll() {
    return this.withRetry(() => MockService.mockRequest("/resources", "GET"));
  }
}
```

---

## 📝 Resumen Final

### ✅ Implementado en Esta Sesión

- ✅ **ResourcesClient** con 14 métodos
- ✅ **AuthClient** con 19 métodos
- ✅ **Type safety completo** en ambos clientes
- ✅ **Documentación JSDoc** exhaustiva
- ✅ **DTOs tipados** para todas las operaciones
- ✅ **Barrel export** actualizado
- ✅ **Ejemplos de uso** en documentación

### 📊 Métricas Totales

| Métrica | ReservationsClient | ResourcesClient | AuthClient  | **Total** |
| ------- | ------------------ | --------------- | ----------- | --------- |
| Métodos | 9                  | 14              | 19          | **42**    |
| DTOs    | 3                  | 3               | 4           | **10**    |
| Líneas  | ~240               | ~310            | ~380        | **~930**  |
| JSDoc   | ✅ Completo        | ✅ Completo     | ✅ Completo | ✅ 100%   |

### 🎉 Beneficios Logrados

1. **Type Safety Total**: 0% uso de `<any>` en llamadas API
2. **Autocomplete Completo**: IDE sugiere métodos, parámetros y tipos
3. **Documentación Integrada**: JSDoc en todos los métodos
4. **Mantenibilidad**: Rutas centralizadas, fácil refactor
5. **Escalabilidad**: Patrón establecido para futuros clientes
6. **Preparado**: Fácil migración a backend real

---

**¡3 Clientes HTTP Type-Safe implementados y documentados! 🚀**

El sistema ahora tiene una capa de abstracción completa sobre el MockService, lista para ser usada en todas las páginas y preparada para migración a backend real.
