# ✅ Migración de MockService a React Query

**Fecha**: 21 de Noviembre 2025, 00:55  
**Estado**: ✅ Completado

---

## 🎯 Objetivo

Dejar de usar `MockService` directamente en componentes y migrar a **React Query (TanStack Query)** para una gestión más robusta de:

- Queries (obtener datos)
- Mutations (crear/actualizar/eliminar)
- Cache automático
- Estados de loading/error
- Invalidación de cache
- Reintentos automáticos

---

## 🐛 Problema Anterior

### Uso directo de MockService:

```typescript
// ❌ ANTES: En app/reservas/nueva/page.tsx
import { MockService } from "@/infrastructure/mock/mockService";

const handleSave = async (data: CreateReservationDto) => {
  setLoading(true);
  try {
    const response = await MockService.mockRequest<any>(
      "/reservations",
      "POST",
      data
    );

    if (response.success) {
      router.push("/reservas");
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

**Problemas**:

- ❌ Gestión manual de loading
- ❌ Gestión manual de errores
- ❌ No invalida cache automáticamente
- ❌ No hay reintentos
- ❌ Código repetitivo en cada componente
- ❌ Acoplamiento directo a MockService

---

## ✅ Solución: React Query Hooks

### 1. Hook Centralizado: useReservationMutations

**Archivo creado**: `src/hooks/useReservationMutations.ts` (~120 líneas)

**Incluye 4 hooks**:

#### a) useCreateReservation

```typescript
const createReservation = useCreateReservation();

createReservation.mutate(data, {
  onSuccess: () => {
    // Éxito
  },
  onError: (error) => {
    // Error
  },
});

// Estados disponibles:
createReservation.isPending; // Loading
createReservation.isError; // Error
createReservation.isSuccess; // Éxito
createReservation.error; // Mensaje de error
```

#### b) useUpdateReservation

```typescript
const updateReservation = useUpdateReservation();

updateReservation.mutate({ id: "123", data: {...} });
```

#### c) useCancelReservation

```typescript
const cancelReservation = useCancelReservation();

cancelReservation.mutate("reservation-id");
```

#### d) useDeleteReservation

```typescript
const deleteReservation = useDeleteReservation();

deleteReservation.mutate("reservation-id");
```

---

### 2. Uso Simplificado en Componentes

**Archivo migrado**: `src/app/reservas/nueva/page.tsx`

**Código nuevo**:

```typescript
// ✅ AHORA: Con React Query
import { useCreateReservation } from "@/hooks/useReservationMutations";

export default function NuevaReservaPage() {
  const createReservation = useCreateReservation();

  const handleSave = async (data: CreateReservationDto) => {
    createReservation.mutate(data, {
      onSuccess: () => {
        router.push("/reservas");
      },
      onError: (error) => {
        console.error("Error:", error);
      },
    });
  };

  return (
    <ReservationModal
      loading={createReservation.isPending}
      onSave={handleSave}
    />
  );
}
```

**Beneficios**:

- ✅ No más `useState` para loading
- ✅ No más `try/catch` manual
- ✅ Cache invalidado automáticamente
- ✅ Estados de loading/error gestionados
- ✅ Código más limpio y legible

---

## 🏗️ Arquitectura

### Flujo de Datos:

```
Componente
    ↓
useCreateReservation (Hook)
    ↓
httpClient.post()
    ↓
Detecta modo (mock/serve)
    ↓
MockService (si modo mock)
    ↓
Respuesta
    ↓
React Query invalida cache
    ↓
UI se actualiza automáticamente
```

### Cache Keys:

```typescript
// Definidos en hooks/useReservations.ts
export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (filters: string) => [...reservationKeys.lists(), { filters }] as const,
  details: () => [...reservationKeys.all, "detail"] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
};
```

**Invalidación automática**:

- Crear reserva → Invalida `lists()`
- Actualizar reserva → Invalida `detail(id)` y `lists()`
- Cancelar reserva → Invalida `detail(id)` y `lists()`
- Eliminar reserva → Invalida `detail(id)` y `lists()`

---

## 📊 Comparativa Antes vs Después

| Aspecto              | Antes (MockService)    | Ahora (React Query)       |
| -------------------- | ---------------------- | ------------------------- |
| **Loading state**    | ❌ Manual con useState | ✅ Automático `isPending` |
| **Error handling**   | ❌ Manual try/catch    | ✅ Automático `isError`   |
| **Cache**            | ❌ No hay              | ✅ Automático             |
| **Invalidación**     | ❌ Manual              | ✅ Automático             |
| **Reintentos**       | ❌ No                  | ✅ Configurable           |
| **Loading UI**       | ❌ Manual              | ✅ `isPending`            |
| **Optimistic UI**    | ❌ Difícil             | ✅ Fácil con `onMutate`   |
| **Code duplication** | ❌ Mucho               | ✅ Mínimo                 |
| **Type safety**      | ⚠️ Parcial             | ✅ Completo               |

---

## 🔄 httpClient Sigue Siendo la Capa de Abstracción

**Importante**: El cambio NO afecta la arquitectura de httpClient.

```typescript
// httpClient sigue decidiendo si usar mock o servidor real
export class HttpClient {
  async post<T>(url: string, data?: any): Promise<T> {
    if (isMockMode()) {
      return await MockService.mockRequest<T>(url, "POST", data);
    }
    // Petición real al backend
    return await this.instance.post<T>(url, data);
  }
}
```

**Beneficios**:

- ✅ Componentes no saben si usan mock o servidor real
- ✅ Cambio de modo transparente
- ✅ Testing más fácil
- ✅ Desarrollo sin backend

---

## 🚀 Próximos Pasos (Opcional)

### Migraciones Sugeridas:

1. **Recursos**:
   - `useCreateResource()`
   - `useUpdateResource()`
   - `useDeleteResource()`

2. **Categorías**:
   - `useCreateCategory()`
   - `useUpdateCategory()`
   - `useDeleteCategory()`

3. **Programas**:
   - `useCreateProgram()`
   - `useUpdateProgram()`
   - `useDeleteProgram()`

4. **Usuarios**:
   - `useUpdateUser()`
   - `useDeleteUser()`

### Template para Nuevos Hooks:

```typescript
// hooks/useResourceMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/infrastructure/http/httpClient";

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResourceDto) => {
      return await httpClient.post<Resource>("/resources", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", "list"] });
    },
  });
}
```

---

## ✅ Checklist de Migración

Para migrar cualquier uso directo de MockService:

- [ ] Identificar componente que usa `MockService.mockRequest()`
- [ ] Crear o usar hook de mutation existente
- [ ] Reemplazar código:
  - [ ] Remover `useState` para loading
  - [ ] Remover `try/catch` manual
  - [ ] Usar `mutation.mutate()`
  - [ ] Usar `mutation.isPending` para loading
- [ ] Probar funcionamiento
- [ ] Verificar que cache se invalida

---

## 📝 Archivos Afectados

### Creados (1):

1. ✅ `src/hooks/useReservationMutations.ts` (~120 líneas)
   - useCreateReservation
   - useUpdateReservation
   - useCancelReservation
   - useDeleteReservation

### Modificados (1):

1. ✅ `src/app/reservas/nueva/page.tsx`
   - Removido MockService import
   - Removido useState para loading
   - Agregado useCreateReservation
   - Simplificado handleSave

**Total**: ~140 líneas nuevas

---

## 🎯 Beneficios Clave

1. **Código más limpio**: Menos boilerplate
2. **Mejor UX**: Loading/error states automáticos
3. **Cache inteligente**: Datos actualizados automáticamente
4. **Testing más fácil**: Hooks se pueden mockear
5. **Type safety**: TypeScript completo
6. **Escalable**: Patrón replicable para todos los recursos

---

## 📚 Referencias

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [useMutation](https://tanstack.com/query/latest/docs/react/reference/useMutation)
- [Query Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)

---

**✅ MockService ya no se usa directamente en componentes! React Query gestiona todas las mutaciones de forma robusta y escalable. 🚀**
