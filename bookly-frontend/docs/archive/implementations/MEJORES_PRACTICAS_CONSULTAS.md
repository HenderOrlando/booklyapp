# 📚 Mejores Prácticas para Consulta de Datos en Bookly Frontend

**Fecha**: 24 de Noviembre de 2025  
**Estado**: ✅ Estándar del proyecto

---

## 🎯 Principios Fundamentales

### 1. **Separación de Responsabilidades**

- ❌ **NUNCA** llamar `httpClient` directamente desde componentes
- ✅ **SIEMPRE** usar hooks personalizados para consultas
- ✅ **SIEMPRE** usar mutations para operaciones de escritura

### 2. **Reutilización de Código**

- ✅ Los hooks encapsulan la lógica de fetching
- ✅ Cache keys centralizados
- ✅ Configuración de staleTime unificada

### 3. **Testabilidad**

- ✅ Hooks son fáciles de mockear en tests
- ✅ Separación clara entre UI y lógica de datos

---

## ❌ ANTI-PATRÓN: Llamadas Directas en Componentes

```typescript
// ❌ MAL - No hacer esto
export default function ProgramasPage() {
  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["academic-programs"],
    queryFn: async () => {
      const response = await httpClient.get("academic-programs");
      return response.data?.items || [];
    },
  });

  // ...
}
```

### ⚠️ Problemas de este enfoque:

1. **Duplicación**: Si necesitas programas en otro componente, copias el código
2. **Mantenimiento**: Cambiar el endpoint requiere actualizar TODOS los componentes
3. **Testing**: Difícil de mockear en pruebas unitarias
4. **Inconsistencia**: Cache keys pueden variar entre componentes
5. **Acoplamiento**: Componente fuertemente acoplado a la implementación HTTP

---

## ✅ PATRÓN CORRECTO: Hooks Personalizados

### 1. Crear Hook en `/src/hooks/usePrograms.ts`

```typescript
import { httpClient } from "@/infrastructure/http/httpClient";
import type { AcademicProgram } from "@/types/entities/resource";
import { useQuery } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================
export const programKeys = {
  all: ["academic-programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (filters?: any) => [...programKeys.lists(), filters] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
};

// ============================================
// TYPES
// ============================================
export interface ProgramFilters {
  faculty?: string;
  isActive?: boolean;
  search?: string;
}

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener todos los programas académicos
 */
export function usePrograms(filters?: ProgramFilters) {
  return useQuery({
    queryKey: programKeys.list(filters),
    queryFn: async () => {
      const response = await httpClient.get("/academic-programs", {
        params: filters,
      });
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener un programa por ID
 */
export function useProgram(id: string) {
  return useQuery<AcademicProgram>({
    queryKey: programKeys.detail(id),
    queryFn: async () => {
      const response = await httpClient.get(`/academic-programs/${id}`);
      if (!response.data) {
        throw new Error("Programa no encontrado");
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}
```

### 2. Usar Hook en Componente

```typescript
// ✅ BIEN - Hacer esto
import { usePrograms } from "@/hooks/usePrograms";

export default function ProgramasPage() {
  // Una línea, limpia y reutilizable
  const { data: programs = [], isLoading } = usePrograms();

  // ...
}
```

### ✅ Beneficios de este enfoque:

1. **Reutilizable**: Mismo hook en múltiples componentes
2. **Mantenible**: Un solo lugar para actualizar endpoints
3. **Testeable**: Fácil de mockear `usePrograms()`
4. **Consistente**: Cache keys unificados
5. **Desacoplado**: Componente no conoce detalles HTTP

---

## 📁 Estructura de Hooks en Bookly

```
src/hooks/
├── useCurrentUser.ts        ✅ Usuario autenticado
├── useDashboard.ts          ✅ Estadísticas del dashboard
├── usePrograms.ts           ✅ Programas académicos
├── useResources.ts          ✅ Recursos (salas, equipos)
├── useReservations.ts       ✅ Reservas
├── useReports.ts            ✅ Reportes y análisis
└── mutations/
    ├── useProgramMutations.ts    ✅ Crear, editar, eliminar programas
    ├── useResourceMutations.ts   ✅ Crear, editar, eliminar recursos
    └── useReservationMutations.ts ✅ Crear, cancelar reservas
```

---

## 🔍 Tipos de Hooks

### 1. **Hooks de Consulta (Queries)**

Para **LEER** datos del servidor:

```typescript
// useResources.ts
export function useResources(filters?: ResourceFilters) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: async () => {
      const response = await httpClient.get("/resources", { params: filters });
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useResource(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: async () => {
      const response = await httpClient.get(`/resources/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
```

**Uso en componente:**

```typescript
const { data: resources, isLoading, error } = useResources();
const { data: resource } = useResource(resourceId);
```

### 2. **Hooks de Mutación (Mutations)**

Para **ESCRIBIR** datos al servidor (crear, editar, eliminar):

```typescript
// mutations/useResourceMutations.ts
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResourceDto) => {
      return await ResourcesClient.create(data);
    },
    onSuccess: () => {
      // Invalidar cache para refrescar lista
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateResourceDto;
    }) => {
      return await ResourcesClient.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}
```

**Uso en componente:**

```typescript
const createResource = useCreateResource();
const updateResource = useUpdateResource();

const handleCreate = () => {
  createResource.mutate(formData, {
    onSuccess: () => {
      toast.success("Recurso creado");
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
```

### 3. **Hooks Infinitos (Infinite Queries)**

Para paginación infinita:

```typescript
// useInfiniteResources.ts
export function useInfiniteResources(filters?: ResourceFilters) {
  return useInfiniteQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await httpClient.get("/resources", {
        params: { ...filters, page: pageParam, limit: 20 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => lastPage.meta.nextPage,
    initialPageParam: 1,
  });
}
```

---

## 🎨 Patrones de Uso

### Patrón 1: Lista Simple

```typescript
export default function ResourcesPage() {
  const { data: resources = [], isLoading } = useResources();

  if (isLoading) return <LoadingSpinner />;

  return <DataTable data={resources} />;
}
```

### Patrón 2: Lista con Filtros

```typescript
export default function ResourcesPage() {
  const [filters, setFilters] = useState<ResourceFilters>({});
  const { data: resources = [], isLoading } = useResources(filters);

  return (
    <>
      <FilterBar onChange={setFilters} />
      <DataTable data={resources} />
    </>
  );
}
```

### Patrón 3: Detalle con ID Dinámico

```typescript
export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  const { data: resource, isLoading } = useResource(params.id);

  if (isLoading) return <LoadingSkeleton />;
  if (!resource) return <NotFound />;

  return <ResourceDetail resource={resource} />;
}
```

### Patrón 4: CRUD Completo

```typescript
export default function ResourcesPage() {
  const { data: resources = [] } = useResources();
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const handleCreate = (data) => {
    createResource.mutate(data, {
      onSuccess: () => toast.success("Creado"),
    });
  };

  const handleUpdate = (id, data) => {
    updateResource.mutate({ id, data }, {
      onSuccess: () => toast.success("Actualizado"),
    });
  };

  return <ResourceTable data={resources} onCreate={handleCreate} onUpdate={handleUpdate} />;
}
```

---

## 🔑 Cache Keys: Mejores Prácticas

### Estructura Jerárquica

```typescript
export const resourceKeys = {
  all: ["resources"] as const, // ['resources']
  lists: () => [...resourceKeys.all, "list"], // ['resources', 'list']
  list: (filters) => [...resourceKeys.lists(), filters], // ['resources', 'list', {...}]
  details: () => [...resourceKeys.all, "detail"], // ['resources', 'detail']
  detail: (id) => [...resourceKeys.details(), id], // ['resources', 'detail', 'res_001']
};
```

### Invalidación de Cache

```typescript
// Invalidar todo de recursos
queryClient.invalidateQueries({ queryKey: resourceKeys.all });

// Invalidar solo listas
queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });

// Invalidar un detalle específico
queryClient.invalidateQueries({ queryKey: resourceKeys.detail("res_001") });
```

---

## ⚙️ Configuración de Stale Time

### Recomendaciones por Tipo de Dato

```typescript
// Datos que CASI NUNCA cambian (10-15 minutos)
staleTime: 1000 * 60 * 10; // Programas académicos, categorías

// Datos que cambian OCASIONALMENTE (5 minutos)
staleTime: 1000 * 60 * 5; // Recursos, usuarios

// Datos que cambian FRECUENTEMENTE (2-3 minutos)
staleTime: 1000 * 60 * 2; // Reservas, disponibilidad

// Datos en TIEMPO REAL (30 segundos - 1 minuto)
staleTime: 1000 * 30; // Dashboard, estadísticas
```

---

## 📊 Ejemplos de Hooks Existentes

### useCurrentUser

```typescript
import { useCurrentUser } from "@/hooks/useCurrentUser";

const { data: user, isLoading } = useCurrentUser();
```

### useDashboard

```typescript
import { useUserStats, useKPIs } from "@/hooks/useDashboard";

const { data: stats } = useUserStats();
const { data: kpis } = useKPIs();
```

### useResources

```typescript
import { useResources, useResource } from "@/hooks/useResources";

const { data: resources } = useResources({ type: "sala" });
const { data: resource } = useResource("res_001");
```

### useReservations

```typescript
import { useReservations, useReservation } from "@/hooks/useReservations";

const { data: reservations } = useReservations({ status: "active" });
const { data: reservation } = useReservation("rsv_001");
```

---

## ✅ Checklist para Nuevas Funcionalidades

Antes de implementar una nueva consulta de datos:

- [ ] ¿Existe un hook para este recurso? Revisar `/src/hooks/`
- [ ] Si NO existe, crear hook en `/src/hooks/use[Recurso].ts`
- [ ] Definir cache keys jerárquicos
- [ ] Definir tipos de filtros (si aplica)
- [ ] Implementar query principal (lista)
- [ ] Implementar query de detalle (por ID)
- [ ] Configurar `staleTime` apropiado
- [ ] Documentar con JSDoc y ejemplos
- [ ] Exportar desde `/src/hooks/index.ts`
- [ ] Usar hook en componente (NO `httpClient` directamente)

---

## 🚫 Errores Comunes y Soluciones

### Error 1: Duplicación de `ApiResponse`

```typescript
// ❌ MAL
return httpClient.get<ApiResponse<User>>(...); // ApiResponse<ApiResponse<User>>

// ✅ BIEN
return httpClient.get<User>(...); // ApiResponse<User>
```

### Error 2: Cache keys inconsistentes

```typescript
// ❌ MAL
queryKey: ["programs"]; // En un componente
queryKey: ["academic-programs"]; // En otro componente

// ✅ BIEN
queryKey: programKeys.lists(); // Siempre el mismo
```

### Error 3: No invalidar cache después de mutación

```typescript
// ❌ MAL
const createProgram = useMutation({
  mutationFn: async (data) => {...},
  // No invalida cache, UI no se actualiza
});

// ✅ BIEN
const createProgram = useMutation({
  mutationFn: async (data) => {...},
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: programKeys.lists() });
  },
});
```

---

## 📖 Recursos Adicionales

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

---

## 🎯 Resumen

### ✅ HACER

- Usar hooks personalizados para todas las consultas
- Centralizar cache keys
- Invalidar cache después de mutaciones
- Configurar `staleTime` apropiado
- Documentar hooks con JSDoc

### ❌ NO HACER

- Llamar `httpClient` directamente en componentes
- Duplicar lógica de fetching
- Usar cache keys inconsistentes
- Olvidar invalidar cache
- Dejar componentes fuertemente acoplados a HTTP

---

**Última actualización**: 2025-11-24  
**Mantenedor**: Equipo Bookly Frontend  
**Estándar**: Obligatorio para todo el proyecto
