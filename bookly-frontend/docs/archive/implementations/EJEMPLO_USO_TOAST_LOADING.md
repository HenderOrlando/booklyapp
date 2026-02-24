# 📘 GUÍA DE USO - SISTEMA DE TOAST Y LOADING

**Versión**: 2.0.0  
**Fecha**: 22 de Noviembre, 2025  
**Para**: Desarrolladores Frontend de Bookly

---

## 🎯 Resumen

Esta guía muestra cómo usar el sistema de Toast y Loading States en componentes y páginas de Bookly.

---

## 📦 Imports Disponibles

### Componentes

```typescript
import {
  LoadingSpinner,
  LoadingState,
  ButtonWithLoading,
  ToastContainer,
} from "@/components";
```

### Hooks

```typescript
import { useToast } from "@/hooks/useToast";
```

### Mutations (con Toast integrado)

```typescript
// Recursos
import {
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from "@/hooks/mutations/useResourceMutations";

// Reservas
import {
  useCreateReservation,
  useUpdateReservation,
  useCancelReservation,
} from "@/hooks/mutations/useReservationMutations";

// Aprobaciones
import {
  useApproveReservation,
  useRejectReservation,
} from "@/hooks/mutations/useApprovalMutations";
```

---

## 🎨 Casos de Uso

### 1. Formulario Simple con Mutación

```typescript
"use client";

import { useState } from "react";
import { useCreateResource } from "@/hooks/mutations/useResourceMutations";
import { ButtonWithLoading } from "@/components";

export function NuevoRecursoPage() {
  const createResource = useCreateResource();
  const [formData, setFormData] = useState({ name: "", capacity: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mutation con toast automático
    createResource.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      {/* Botón con loading automático */}
      <ButtonWithLoading
        type="submit"
        isLoading={createResource.isPending}
        loadingText="Creando..."
        variant="primary"
      >
        Crear Recurso
      </ButtonWithLoading>
    </form>
  );
}
```

**Resultado**:

- ✅ Botón muestra spinner durante creación
- ✅ Toast automático: "Recurso Creado" o "Error al Crear"
- ✅ Formulario se deshabilita automáticamente

---

### 2. Acción con Confirmación

```typescript
"use client";

import { useDeleteResource } from "@/hooks/mutations/useResourceMutations";
import { useToast } from "@/hooks/useToast";
import { ButtonWithLoading } from "@/components";

export function EliminarRecursoButton({ resourceId }: { resourceId: string }) {
  const deleteResource = useDeleteResource();
  const { showWarning } = useToast();

  const handleDelete = () => {
    // Confirmación manual
    if (!confirm("¿Estás seguro de eliminar este recurso?")) {
      return;
    }

    deleteResource.mutate(resourceId);
    // Toast automático de "Recurso Eliminado" o error
  };

  return (
    <ButtonWithLoading
      onClick={handleDelete}
      isLoading={deleteResource.isPending}
      loadingText="Eliminando..."
      variant="danger"
    >
      Eliminar
    </ButtonWithLoading>
  );
}
```

---

### 3. Página con Loading State Completo

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components";
import { httpClient } from "@/infrastructure/http/httpClient";

export function RecursosPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["resources"],
    queryFn: () => httpClient.get("/resources")
  });

  // Loading completo
  if (isLoading) {
    return <LoadingState message="Cargando recursos..." size="lg" />;
  }

  // Error (opcional, también se puede usar toast)
  if (error) {
    return <div>Error al cargar recursos</div>;
  }

  return (
    <div>
      {data?.data?.map((resource) => (
        <div key={resource.id}>{resource.name}</div>
      ))}
    </div>
  );
}
```

---

### 4. Modal con Loading Overlay

```typescript
"use client";

import { useState } from "react";
import { useApproveReservation } from "@/hooks/mutations/useApprovalMutations";
import { LoadingState, ButtonWithLoading } from "@/components";

export function ApprovalModal({ reservation }: { reservation: any }) {
  const [comments, setComments] = useState("");
  const approveReservation = useApproveReservation();

  const handleApprove = () => {
    approveReservation.mutate({
      reservationId: reservation.id,
      approvedBy: "current-user-id",
      comments
    });
  };

  return (
    <div className="relative">
      {/* Overlay de loading durante aprobación */}
      {approveReservation.isPending && (
        <LoadingState
          message="Aprobando reserva..."
          fullScreen
        />
      )}

      <h2>Aprobar Reserva</h2>
      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Comentarios opcionales"
      />

      <ButtonWithLoading
        onClick={handleApprove}
        isLoading={approveReservation.isPending}
        loadingText="Aprobando..."
        variant="primary"
      >
        Aprobar
      </ButtonWithLoading>
    </div>
  );
}
```

---

### 5. Toast Manual (sin mutation)

```typescript
"use client";

import { useToast } from "@/hooks/useToast";
import { ButtonWithLoading } from "@/components";

export function ManualToastExample() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleCustomAction = async () => {
    try {
      // Operación manual
      await someCustomOperation();

      // Toast manual de éxito
      showSuccess(
        "Operación Exitosa",
        "La acción se completó correctamente"
      );
    } catch (error) {
      // Toast manual de error
      showError(
        "Error",
        "Hubo un problema al ejecutar la acción"
      );
    }
  };

  return (
    <div className="space-y-2">
      <button onClick={() => showSuccess("Éxito", "Todo bien!")}>
        Mostrar Success
      </button>

      <button onClick={() => showError("Error", "Algo salió mal")}>
        Mostrar Error
      </button>

      <button onClick={() => showWarning("Advertencia", "Ten cuidado")}>
        Mostrar Warning
      </button>

      <button onClick={() => showInfo("Información", "Dato importante")}>
        Mostrar Info
      </button>
    </div>
  );
}
```

---

### 6. Aprobación en Lote

```typescript
"use client";

import { useState } from "react";
import { useBatchApprove } from "@/hooks/mutations/useApprovalMutations";
import { ButtonWithLoading } from "@/components";

export function BatchApprovalPanel({ reservations }: { reservations: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const batchApprove = useBatchApprove();

  const handleBatchApprove = () => {
    batchApprove.mutate({
      reservationIds: selectedIds,
      approvedBy: "current-user-id",
      comments: "Aprobación masiva"
    });
    // Toast automático: "Se aprobaron X reservas correctamente"
  };

  return (
    <div>
      {/* Selección de reservas */}
      {reservations.map((res) => (
        <div key={res.id}>
          <input
            type="checkbox"
            checked={selectedIds.includes(res.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds([...selectedIds, res.id]);
              } else {
                setSelectedIds(selectedIds.filter(id => id !== res.id));
              }
            }}
          />
          {res.name}
        </div>
      ))}

      {/* Botón de aprobación masiva */}
      <ButtonWithLoading
        onClick={handleBatchApprove}
        isLoading={batchApprove.isPending}
        loadingText={`Aprobando ${selectedIds.length} reservas...`}
        variant="primary"
        disabled={selectedIds.length === 0}
      >
        Aprobar Seleccionadas ({selectedIds.length})
      </ButtonWithLoading>
    </div>
  );
}
```

---

### 7. Importación de Archivo con Progreso

```typescript
"use client";

import { useState } from "react";
import { useImportResources } from "@/hooks/mutations/useResourceMutations";
import { ButtonWithLoading } from "@/components";

export function ImportarRecursosPanel() {
  const [file, setFile] = useState<File | null>(null);
  const importResources = useImportResources();

  const handleImport = () => {
    if (!file) return;

    importResources.mutate({ file });
    // Toast automático: "Se importaron X recursos correctamente"
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <ButtonWithLoading
        onClick={handleImport}
        isLoading={importResources.isPending}
        loadingText="Importando..."
        variant="primary"
        disabled={!file}
      >
        Importar Recursos
      </ButtonWithLoading>
    </div>
  );
}
```

---

## 🎨 Variantes de ButtonWithLoading

```typescript
// Botón primario (default)
<ButtonWithLoading variant="primary">
  Guardar
</ButtonWithLoading>

// Botón secundario
<ButtonWithLoading variant="secondary">
  Cancelar
</ButtonWithLoading>

// Botón outline
<ButtonWithLoading variant="outline">
  Ver Detalles
</ButtonWithLoading>

// Botón peligroso
<ButtonWithLoading variant="danger">
  Eliminar
</ButtonWithLoading>

// Tamaños
<ButtonWithLoading size="sm">Pequeño</ButtonWithLoading>
<ButtonWithLoading size="md">Mediano (default)</ButtonWithLoading>
<ButtonWithLoading size="lg">Grande</ButtonWithLoading>
```

---

## 🎯 Tamaños de LoadingSpinner

```typescript
<LoadingSpinner size="sm" />  // 16px
<LoadingSpinner size="md" />  // 24px (default)
<LoadingSpinner size="lg" />  // 32px
<LoadingSpinner size="xl" />  // 48px
```

---

## ⚙️ Opciones Avanzadas de Toast

```typescript
const { show, dismiss } = useToast();

// Toast con duración personalizada
const id = show("success", "Título", "Mensaje", {
  duration: 10000, // 10 segundos
});

// Toast que no se cierra automáticamente
const persistentId = show("info", "Importante", "Esto no se cierra solo", {
  duration: 0, // Sin auto-dismiss
});

// Cerrar manualmente después
setTimeout(() => {
  dismiss(persistentId);
}, 15000);
```

---

## 📋 Checklist de Implementación

Al crear un nuevo componente con mutations:

- [ ] Importar el hook de mutation correspondiente
- [ ] Usar `ButtonWithLoading` en lugar de `<button>`
- [ ] Pasar `isPending` como prop `isLoading`
- [ ] Opcional: `loadingText` para texto durante carga
- [ ] El toast se mostrará automáticamente en success/error
- [ ] Invalidaciones de queries ya configuradas en el hook
- [ ] Para operaciones sin mutation, usar `useToast` manualmente

---

## 🚀 Mejores Prácticas

### ✅ Hacer

- Usar hooks de mutations (tienen toast integrado)
- Usar `ButtonWithLoading` para acciones asíncronas
- Usar `LoadingState` para carga de páginas completas
- Mensajes de toast descriptivos y concisos
- Auto-dismiss para éxitos, más duración para errores

### ❌ Evitar

- `console.log()` para feedback al usuario
- `alert()` para notificaciones
- Botones `<button>` sin estado de loading
- Mensajes de toast genéricos ("Error", "Éxito")
- Toast sin auto-dismiss para operaciones normales

---

## 📚 Referencia Rápida

| Componente          | Uso               | Props Principales                                             |
| ------------------- | ----------------- | ------------------------------------------------------------- |
| `LoadingSpinner`    | Spinner básico    | `size`, `className`                                           |
| `LoadingState`      | Loading completo  | `message`, `size`, `fullScreen`                               |
| `ButtonWithLoading` | Botón con loading | `isLoading`, `loadingText`, `variant`, `size`                 |
| `useToast`          | Toast manual      | `showSuccess()`, `showError()`, `showWarning()`, `showInfo()` |

---

## 🎉 Conclusión

El sistema de Toast y Loading proporciona:

- ✅ Feedback visual automático
- ✅ Código limpio y mantenible
- ✅ UX profesional
- ✅ Fácil de usar
- ✅ Totalmente tipado con TypeScript

Para más ejemplos, revisar los hooks en `src/hooks/mutations/`.

---

**Última actualización**: 22 de Noviembre, 2025  
**Versión**: 2.0.0
