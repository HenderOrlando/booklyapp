# 📁 Estructura de Hooks con React Query - Bookly Frontend

**Fecha**: 21 de Noviembre 2025, 01:00  
**Estado**: ✅ Completado

---

## 🎯 Objetivo

Organizar todos los hooks de React Query por **dominio** siguiendo principios de Clean Architecture y Domain-Driven Design (DDD).

---

## 📂 Estructura Implementada

```
src/hooks/
├── mutations/                    # 🔄 Operaciones de escritura (CUD)
│   ├── index.ts                 # Exportación centralizada
│   ├── useReservationMutations.ts  # Dominio: Reservas
│   ├── useResourceMutations.ts     # Dominio: Recursos
│   ├── useCategoryMutations.ts     # Dominio: Categorías
│   ├── useProgramMutations.ts      # Dominio: Programas
│   └── useUserMutations.ts         # Dominio: Usuarios
│
├── useReservations.ts           # 📖 Queries: Reservas
├── useResources.ts              # 📖 Queries: Recursos
├── useAuth.ts                   # 🔐 Autenticación
├── usePermissions.ts            # 🔒 Autorización
├── useDataMode.ts               # ⚙️ Configuración mock/serve
├── useMockMode.ts               # ⚙️ Modo mock
└── useWebSocket.ts              # 🔌 WebSocket

Total: 12 hooks organizados por dominio
```

---

## 🏗️ Organización por Dominio

### 1. **Reservations Domain** 🎫

**Queries** (`useReservations.ts`):

- `useReservations()` - Listar reservas con filtros
- `useReservation(id)` - Detalle de reserva
- `useUserReservations()` - Reservas del usuario actual

**Mutations** (`mutations/useReservationMutations.ts`):

- `useCreateReservation()` - Crear reserva
- `useUpdateReservation()` - Actualizar reserva
- `useCancelReservation()` - Cancelar reserva
- `useDeleteReservation()` - Eliminar reserva

**Cache Keys**:

```typescript
reservationKeys = {
  all: ["reservations"],
  lists: () => ["reservations", "list"],
  list: (filters) => ["reservations", "list", { filters }],
  details: () => ["reservations", "detail"],
  detail: (id) => ["reservations", "detail", id],
};
```

---

### 2. **Resources Domain** 🏢

**Queries** (`useResources.ts`):

- `useResources()` - Listar recursos
- `useResource(id)` - Detalle de recurso
- `useResourceCategories()` - Categorías de recursos
- `useResourceAvailability(id, date)` - Disponibilidad

**Mutations** (`mutations/useResourceMutations.ts`):

- `useCreateResource()` - Crear recurso
- `useUpdateResource()` - Actualizar recurso
- `useDeleteResource()` - Eliminar recurso
- `useScheduleMaintenance()` - Programar mantenimiento
- `useImportResources()` - Importación masiva

**DTOs**:

```typescript
interface CreateResourceDto {
  name: string;
  type: string;
  capacity: number;
  location?: string;
  categoryId?: string;
  programIds?: string[];
}
```

---

### 3. **Categories Domain** 🏷️

**Mutations** (`mutations/useCategoryMutations.ts`):

- `useCreateCategory()` - Crear categoría
- `useUpdateCategory()` - Actualizar categoría
- `useDeleteCategory()` - Eliminar categoría

**DTOs**:

```typescript
interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}
```

---

### 4. **Programs Domain** 🎓

**Mutations** (`mutations/useProgramMutations.ts`):

- `useCreateProgram()` - Crear programa académico
- `useUpdateProgram()` - Actualizar programa
- `useDeleteProgram()` - Eliminar programa
- `useAssignResourcesToProgram()` - Asociar recursos

**DTOs**:

```typescript
interface CreateProgramDto {
  name: string;
  code: string;
  description?: string;
  facultyId?: string;
  coordinatorId?: string;
}
```

---

### 5. **Users Domain** 👤

**Mutations** (`mutations/useUserMutations.ts`):

- `useUpdateUserProfile()` - Actualizar perfil
- `useChangePassword()` - Cambiar contraseña
- `useUploadProfilePhoto()` - Subir foto
- `useUpdateUserPreferences()` - Actualizar preferencias

**DTOs**:

```typescript
interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
  preferences?: Record<string, any>;
}
```

---

## 🎯 Principios de Organización

### 1. **Separación Queries vs Mutations**

**Queries** (lectura):

- Archivos independientes: `use[Domain].ts`
- Ejemplo: `useResources.ts`, `useReservations.ts`
- Solo operaciones de lectura (GET)

**Mutations** (escritura):

- Carpeta dedicada: `mutations/`
- Ejemplo: `useResourceMutations.ts`
- Operaciones CUD (Create, Update, Delete)

### 2. **Un Archivo por Dominio**

Cada dominio tiene su archivo dedicado:

- ✅ `useReservationMutations.ts` - Solo reservas
- ✅ `useResourceMutations.ts` - Solo recursos
- ✅ `useCategoryMutations.ts` - Solo categorías

❌ NO mezclar dominios en un archivo

### 3. **Cache Keys Consistentes**

Cada dominio define sus propias keys:

```typescript
// Patrón estándar
export const [domain]Keys = {
  all: ["domain"] as const,
  lists: () => ["domain", "list"] as const,
  list: (filters) => ["domain", "list", { filters }] as const,
  details: () => ["domain", "detail"] as const,
  detail: (id) => ["domain", "detail", id] as const,
};
```

### 4. **Invalidación Automática**

Cada mutation invalida su propio cache:

```typescript
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await httpClient.post("/resources", data);
    },
    onSuccess: () => {
      // Invalidar listas de recursos
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}
```

---

## 📦 Importaciones

### Importación Individual (recomendado)

```typescript
// Desde queries
import { useResources, useResource } from "@/hooks/useResources";

// Desde mutations (index centralizado)
import { useCreateResource, useUpdateResource } from "@/hooks/mutations";
```

### Importación con Alias

```typescript
import {
  useCreateReservation as createReservation,
  useUpdateReservation as updateReservation,
} from "@/hooks/mutations";
```

---

## 🔄 Flujo Completo de Uso

### Ejemplo: Gestionar Recursos

```typescript
"use client";

import { useState } from "react";
import { useResources } from "@/hooks/useResources";
import {
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  type CreateResourceDto
} from "@/hooks/mutations";

export function ResourcesPage() {
  // Query: Obtener recursos
  const { data, isLoading } = useResources();

  // Mutations: Operaciones de escritura
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const handleCreate = (data: CreateResourceDto) => {
    createResource.mutate(data, {
      onSuccess: (resource) => {
        console.log("Recurso creado:", resource.id);
      },
    });
  };

  const handleUpdate = (id: string, data: any) => {
    updateResource.mutate({ id, data });
  };

  const handleDelete = (id: string) => {
    deleteResource.mutate(id);
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      {/* Lista de recursos */}
      {data?.items.map(resource => (
        <div key={resource.id}>
          <h3>{resource.name}</h3>
          <button onClick={() => handleUpdate(resource.id, {...})}>
            Editar
          </button>
          <button onClick={() => handleDelete(resource.id)}>
            Eliminar
          </button>
        </div>
      ))}

      {/* Botón crear */}
      <button onClick={() => handleCreate({...})}>
        Nuevo Recurso
      </button>
    </div>
  );
}
```

---

## 📊 Beneficios de esta Estructura

| Aspecto           | Antes                 | Ahora                  |
| ----------------- | --------------------- | ---------------------- |
| **Organización**  | ❌ Archivos dispersos | ✅ Por dominio         |
| **Escalabilidad** | ⚠️ Difícil agregar    | ✅ Fácil agregar       |
| **Mantenimiento** | ❌ Búsqueda compleja  | ✅ Ubicación clara     |
| **Imports**       | ⚠️ Rutas largas       | ✅ `@/hooks/mutations` |
| **Consistencia**  | ⚠️ Patrones mixtos    | ✅ Patrón único        |
| **Testing**       | ⚠️ Difícil mockear    | ✅ Fácil mockear       |

---

## 🚀 Próximos Dominios a Agregar

### Pendientes (cuando se necesiten)

1. **Waitlist Domain** ⏳:
   - `useWaitlistMutations.ts`
   - `useAddToWaitlist()`
   - `useRemoveFromWaitlist()`
   - `useNotifyWaitlist()`

2. **Approvals Domain** ✅:
   - `useApprovalMutations.ts`
   - `useApproveReservation()`
   - `useRejectReservation()`

3. **Reports Domain** 📊:
   - `useReportMutations.ts`
   - `useGenerateReport()`
   - `useExportReport()`

4. **Maintenance Domain** 🔧:
   - `useMaintenanceMutations.ts`
   - `useScheduleMaintenance()`
   - `useCompleteMaintenance()`

---

## ✅ Checklist de Implementación

- [x] Crear carpeta `hooks/mutations/`
- [x] Migrar `useReservationMutations.ts`
- [x] Crear `useResourceMutations.ts`
- [x] Crear `useCategoryMutations.ts`
- [x] Crear `useProgramMutations.ts`
- [x] Crear `useUserMutations.ts`
- [x] Crear `mutations/index.ts` (exportación centralizada)
- [x] Actualizar imports en `calendario/page.tsx`
- [x] Documentar estructura completa
- [ ] Migrar componentes existentes a nuevos hooks
- [ ] Agregar dominios adicionales según necesidad

---

## 📚 Convenciones

### Naming

- **Queries**: `use[Domain].ts` → `useResources.ts`
- **Mutations**: `use[Domain]Mutations.ts` → `useResourceMutations.ts`
- **Hooks individuales**: `use[Action][Domain]()` → `useCreateResource()`

### Estructura de Archivo

```typescript
/**
 * Documentación del dominio
 */

// 1. Imports
import { ... } from "...";

// 2. DTOs (si aplica)
export interface CreateXDto { ... }

// 3. Cache Keys
export const xKeys = { ... };

// 4. Hooks (mutations o queries)
export function useCreateX() { ... }
export function useUpdateX() { ... }
```

---

## 🎉 Resultado Final

**Estructura limpia y escalable**:

- ✅ 5 dominios organizados
- ✅ 15+ mutations implementadas
- ✅ Separación clara queries/mutations
- ✅ Cache keys consistentes
- ✅ Invalidación automática
- ✅ TypeScript completo
- ✅ Patrón replicable
- ✅ DDD aplicado

---

**🚀 Hooks React Query completamente organizados por dominio! Listo para escalar y mantener fácilmente. ✨📁**
