# 📋 Plan Completo React Query - Bookly Frontend

## 🎯 Objetivo

Completar la migración total a React Query y optimizar el manejo de datos del frontend.

---

## ✅ Fase 1: Páginas Ya Migradas (COMPLETADO)

| #   | Página                  | Estado | Queries | Mutations |
| --- | ----------------------- | ------ | ------- | --------- |
| 1   | categorias/page.tsx     | ✅     | 1       | 3         |
| 2   | profile/page.tsx        | ✅     | 1       | 2         |
| 3   | recursos/page.tsx       | ✅     | 2       | 1         |
| 4   | reservas/page.tsx       | ✅     | 1       | 3         |
| 5   | lista-espera/page.tsx   | ✅     | 1       | 3         |
| 6   | programas/page.tsx      | ✅     | 1       | 2         |
| 7   | mantenimientos/page.tsx | ✅     | 2       | 3         |

**Total Fase 1**: 7 páginas, 9 queries, 17 mutations

---

## 🚀 Fase 2: Páginas Prioritarias (EN PROGRESO)

### 2.1 Admin & Dashboard (Alta Prioridad)

| #   | Página                       | Prioridad | Complejidad | Queries Necesarias                               | Mutations Necesarias                       |
| --- | ---------------------------- | --------- | ----------- | ------------------------------------------------ | ------------------------------------------ |
| 8   | **admin/roles/page.tsx**     | 🔴 Alta   | Media       | 3 (roles, users, permissions)                    | 5 (create, update, delete, assign, revoke) |
| 9   | **admin/auditoria/page.tsx** | 🟡 Media  | Media       | 1 (audit logs)                                   | 0 (solo lectura)                           |
| 10  | **dashboard/page.tsx**       | 🔴 Alta   | Alta        | Nuevo: `useUserStats()`, `useDashboardMetrics()` | 0                                          |

### 2.2 Páginas de Detalle (Requieren Queries por ID)

| #   | Página                            | Prioridad | Queries Nuevas Necesarias |
| --- | --------------------------------- | --------- | ------------------------- |
| 11  | **recursos/[id]/page.tsx**        | 🔴 Alta   | `useResource(id)`         |
| 12  | **recursos/[id]/editar/page.tsx** | 🔴 Alta   | `useResource(id)`         |
| 13  | **reservas/[id]/page.tsx**        | 🔴 Alta   | `useReservation(id)`      |
| 14  | **programas/[id]/page.tsx**       | 🟡 Media  | `useProgram(id)`          |

### 2.3 Páginas de Creación

| #   | Página                      | Prioridad | Requiere                         |
| --- | --------------------------- | --------- | -------------------------------- |
| 15  | **recursos/nuevo/page.tsx** | 🟡 Media  | useCreateResource (ya existe)    |
| 16  | **reservas/nueva/page.tsx** | 🟡 Media  | useCreateReservation (ya existe) |

### 2.4 Otras Páginas

| #   | Página                     | Prioridad | Notas                                    |
| --- | -------------------------- | --------- | ---------------------------------------- |
| 17  | **calendario/page.tsx**    | 🟢 Baja   | Ya usa useCreateReservation parcialmente |
| 18  | **page.tsx** (home)        | 🟢 Baja   | Landing page                             |
| 19  | **design-system/page.tsx** | ⚪ N/A    | Documentación UI                         |

### 2.5 Páginas de Auth (Baja Prioridad)

| #   | Página                     | Estado       | Notas                            |
| --- | -------------------------- | ------------ | -------------------------------- |
| 20  | login/page.tsx             | ⚪ Pendiente | Lógica de autenticación especial |
| 21  | (auth)/auth/login/page.tsx | ⚪ Pendiente | Duplicado?                       |
| 22  | register/page.tsx          | ⚪ Pendiente |                                  |
| 23  | forgot-password/page.tsx   | ⚪ Pendiente |                                  |
| 24  | reset-password/page.tsx    | ⚪ Pendiente |                                  |

**Total Fase 2**: 17 páginas adicionales

---

## 🔧 Fase 3: Crear Queries Adicionales

### 3.1 Queries por ID (Detalle)

```typescript
// src/hooks/useResources.ts
export function useResource(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: async () => {
      const response = await httpClient.get(`resources/${id}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
```

**Queries a crear**:

- ✅ `useResource(id)` - Detalle de recurso
- ✅ `useReservation(id)` - Detalle de reserva
- ✅ `useProgram(id)` - Detalle de programa
- ✅ `useCategory(id)` - Detalle de categoría
- ✅ `useMaintenance(id)` - Detalle de mantenimiento
- ✅ `useRole(id)` - Detalle de rol

### 3.2 Queries de Estadísticas

```typescript
// src/hooks/useDashboard.ts
export function useUserStats() {
  return useQuery({
    queryKey: ["dashboard", "user-stats"],
    queryFn: async () => {
      const response = await httpClient.get("/dashboard/user-stats");
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos (datos dinámicos)
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () => {
      const response = await httpClient.get("/dashboard/metrics");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

**Queries a crear**:

- ✅ `useUserStats()` - Estadísticas del usuario
- ✅ `useDashboardMetrics()` - Métricas del dashboard
- ✅ `useResourceStats()` - Estadísticas de recursos
- ✅ `useReservationStats()` - Estadísticas de reservas

### 3.3 Queries de Búsqueda

```typescript
export function useSearchResources(query: string) {
  return useQuery({
    queryKey: ["resources", "search", query],
    queryFn: async () => {
      const response = await httpClient.get(`resources/search?q=${query}`);
      return response.data?.items || [];
    },
    enabled: query.length > 2, // Solo buscar con 3+ caracteres
    staleTime: 1000 * 60 * 1, // Cache corto para búsquedas
  });
}
```

---

## ⚡ Fase 4: Implementar Infinite Queries

### 4.1 Paginación Infinita en Listados

```typescript
// src/hooks/useInfiniteResources.ts
import { useInfiniteQuery } from "@tanstack/react-query";

export function useInfiniteResources(filters?: any) {
  return useInfiniteQuery({
    queryKey: ["resources", "infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await httpClient.get("resources", {
        params: { page: pageParam, limit: 20, ...filters },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

**Implementar en**:

- ✅ Recursos (lista principal)
- ✅ Reservas (lista principal)
- ✅ Programas (lista principal)
- ✅ Mantenimientos (lista principal)
- ✅ Auditoría (logs infinitos)

### 4.2 Virtual Scrolling

```typescript
// Usar react-virtual con infinite queries
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: data?.pages.flatMap((p) => p.items).length ?? 0,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

---

## 🎯 Fase 5: Prefetching Inteligente

### 5.1 Prefetch en Hover

```typescript
// Prefetch al hacer hover en un botón de detalle
const queryClient = useQueryClient();

const handleMouseEnter = (resourceId: string) => {
  queryClient.prefetchQuery({
    queryKey: resourceKeys.detail(resourceId),
    queryFn: async () => {
      const response = await httpClient.get(`resources/${resourceId}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
```

**Implementar en**:

- ✅ Tablas de recursos (hover en fila)
- ✅ Tablas de reservas (hover en botón "Ver")
- ✅ Cards de dashboard (hover en KPI)

### 5.2 Prefetch de Página Siguiente

```typescript
// Prefetch automático de página siguiente en paginación
const { data: currentPage } = useQuery({...});

useEffect(() => {
  if (currentPage?.hasNextPage) {
    queryClient.prefetchQuery({
      queryKey: resourceKeys.list({ page: currentPage.page + 1 }),
      queryFn: () => fetchResources(currentPage.page + 1),
    });
  }
}, [currentPage]);
```

### 5.3 Predictive Prefetching

```typescript
// Basado en navegación del usuario
const router = useRouter();

useEffect(() => {
  // Si el usuario está en /recursos, prefetch de /recursos/nuevo
  if (router.pathname === "/recursos") {
    queryClient.prefetchQuery({
      queryKey: categoryKeys.lists(),
      queryFn: fetchCategories,
    });
  }
}, [router.pathname]);
```

---

## 🔄 Fase 6: Optimizar Cache

### 6.1 Ajustar staleTime por Dominio

```typescript
// Datos estáticos (cambian raramente)
staleTime: 1000 * 60 * 30 // 30 minutos
- Categorías
- Programas académicos
- Permisos del sistema
- Configuración

// Datos semi-estáticos
staleTime: 1000 * 60 * 10 // 10 minutos
- Recursos
- Usuarios
- Roles

// Datos dinámicos
staleTime: 1000 * 60 * 5 // 5 minutos
- Listado de reservas
- Mantenimientos

// Datos muy dinámicos
staleTime: 1000 * 60 * 2 // 2 minutos
- Disponibilidad en tiempo real
- Lista de espera
- Dashboard KPIs
```

### 6.2 Implementar gcTime (Garbage Collection)

```typescript
// Limpiar cache de datos temporales
gcTime: 1000 * 60 * 10; // 10 minutos sin uso = eliminar

// Para datos de detalle (visitas únicas)
gcTime: 1000 * 60 * 5; // 5 minutos

// Para listas (se reutilizan)
gcTime: 1000 * 60 * 30; // 30 minutos
```

### 6.3 Monitoreo de Cache

```typescript
// Agregar React Query DevTools en desarrollo
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Métricas a monitorear**:

- Hit rate del cache
- Queries duplicadas
- Tiempo de respuesta
- Invalidaciones innecesarias

---

## 🎨 Fase 7: Optimistic UI

### 7.1 Implementar en Operaciones Críticas

```typescript
// Ejemplo: Toggle de estado de recurso
const updateResource = useUpdateResource();

const handleToggle = (resource: Resource) => {
  // Optimistic update
  queryClient.setQueryData(resourceKeys.lists(), (old: Resource[] = []) =>
    old.map((r) => (r.id === resource.id ? { ...r, isActive: !r.isActive } : r))
  );

  updateResource.mutate(
    { id: resource.id, data: { isActive: !resource.isActive } },
    {
      onError: () => {
        // Revertir en caso de error
        queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      },
    }
  );
};
```

**Implementar en**:

- ✅ Toggle de estados (activo/inactivo)
- ✅ Crear/editar recursos (feedback instantáneo)
- ✅ Cancelar reservas (actualización inmediata)
- ✅ Asignar roles (cambio visual inmediato)

---

## 🔀 Fase 8: Migración de Redux a React Query

### 8.1 Análisis de Estado Actual

**Redux Store actual**:

```
- authSlice: user, token, isAuthenticated
- uiSlice: theme, sidebarOpen, modals
- filtersSlice: searchTerms, selectedFilters
```

### 8.2 Clasificación

**Mantener en Redux** (Client State):

- ✅ `theme` - Preferencias UI
- ✅ `sidebarOpen` - Estado UI temporal
- ✅ `modals` - Control de modals
- ✅ `selectedFilters` - Filtros UI temporales

**Migrar a React Query** (Server State):

- ✅ `user` → `useCurrentUser()`
- ✅ `isAuthenticated` → derivado de `useCurrentUser()`
- ❌ `token` → Mantener en Redux (seguridad)

### 8.3 Implementación

```typescript
// src/hooks/useAuth.ts
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: async () => {
      const response = await httpClient.get("/auth/me");
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
    retry: false, // No reintentar si no autenticado
  });
}

export function useAuth() {
  const { data: user, isLoading } = useCurrentUser();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}
```

---

## 📊 Resumen de Tareas

### Migraciones Pendientes

- [ ] 9 páginas CRUD principales
- [ ] 4 páginas de detalle
- [ ] 2 páginas de creación
- [ ] 5 páginas de autenticación (opcional)

### Queries a Crear

- [ ] 6 queries por ID (detalle)
- [ ] 4 queries de estadísticas
- [ ] N queries de búsqueda

### Features Avanzadas

- [ ] 5 infinite queries
- [ ] Virtual scrolling en 3+ páginas
- [ ] Prefetching en 10+ componentes
- [ ] Optimistic UI en 5+ operaciones

### Optimizaciones

- [ ] Ajustar staleTime en 60+ queries
- [ ] Implementar gcTime
- [ ] Configurar DevTools
- [ ] Migrar user state a React Query

---

## 🎯 Priorización de Ejecución

### Sprint 1 (Ahora)

1. ✅ Migrar admin/roles/page.tsx
2. ✅ Migrar dashboard/page.tsx
3. ✅ Crear useUserStats() y useDashboardMetrics()
4. ✅ Migrar recursos/[id]/page.tsx
5. ✅ Crear useResource(id)

### Sprint 2

6. ✅ Migrar reservas/[id]/page.tsx
7. ✅ Crear useReservation(id)
8. ✅ Implementar infinite query en recursos
9. ✅ Implementar prefetch en tablas

### Sprint 3

10. ✅ Optimistic UI en toggles
11. ✅ Ajustar cache global
12. ✅ Migrar user state
13. ✅ Configurar DevTools

---

**Estado**: 🚀 EN EJECUCIÓN - Sprint 1
**Última actualización**: Noviembre 21, 2025
