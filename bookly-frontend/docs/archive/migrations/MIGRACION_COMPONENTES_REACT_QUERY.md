# 🔄 Migración de Componentes a React Query - Guía Práctica

**Fecha**: 21 de Noviembre 2025, 01:12  
**Estado**: ✅ Guía Completa

---

## 🎯 Objetivo

Migrar componentes existentes que usan:

- ❌ `useState` manual para loading/error
- ❌ `httpClient` directo
- ❌ Manejo manual de cache
- ❌ `useEffect` para fetch

A usar:

- ✅ Hooks de React Query
- ✅ Estados automáticos
- ✅ Cache inteligente
- ✅ Invalidación automática

---

## 📋 Componentes Identificados para Migración

### Alto Impacto (Migrar primero):

1. ✅ `/app/categorias/page.tsx` - Gestión de categorías
2. ⏳ `/app/profile/page.tsx` - Perfil de usuario
3. ⏳ `/app/mantenimientos/page.tsx` - Gestión de mantenimientos
4. ⏳ `/app/reservas/nueva/page.tsx` - Ya migrada ✅
5. ⏳ `/app/calendario/page.tsx` - Ya migrada ✅

### Medio Impacto:

6. `/components/organisms/CategoryModal` - Usar hooks internamente
7. `/components/organisms/MaintenanceModal` - Usar hooks internamente
8. `/app/recursos/page.tsx` - Lista de recursos
9. `/app/programas/page.tsx` - Lista de programas

---

## 🎯 Ejemplo 1: Migración de /app/categorias/page.tsx

### ❌ ANTES (Con httpClient directo)

```typescript
export default function CategoriasPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  // ❌ useEffect manual
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await httpClient.get("categories");
        if (response.success && response.data) {
          setCategories(response.data.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ❌ Crear con httpClient directo
  const handleSave = async (categoryData: Partial<Category>) => {
    try {
      if (modalMode === "create") {
        const response = await httpClient.post("categories", categoryData);
        if (response.success) {
          setCategories([...categories, response.data]);
        }
      } else {
        const response = await httpClient.put(`categories/${selectedCategory.id}`, categoryData);
        if (response.success) {
          setCategories(categories.map(c => c.id === selectedCategory.id ? response.data : c));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ Loading manual
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {categories.map(cat => <div key={cat.id}>{cat.name}</div>)}
    </div>
  );
}
```

### ✅ DESPUÉS (Con React Query)

```typescript
import { useQuery } from "@tanstack/react-query";
import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoryKeys
} from "@/hooks/mutations";
import { httpClient } from "@/infrastructure/http/httpClient";

export default function CategoriasPage() {
  // ✅ Query automático con cache
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get("categories");
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // ✅ Mutations con React Query
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // ✅ Crear - Sin manejo manual de estado
  const handleSave = (categoryData: Partial<Category>) => {
    if (modalMode === "create") {
      createCategory.mutate(categoryData, {
        onSuccess: () => {
          setShowModal(false);
          // Cache se invalida automáticamente
        }
      });
    } else {
      updateCategory.mutate({
        id: selectedCategory.id,
        data: categoryData
      }, {
        onSuccess: () => {
          setShowModal(false);
          // Cache se invalida automáticamente
        }
      });
    }
  };

  // ✅ Eliminar - Sin manejo manual
  const handleDelete = () => {
    if (!categoryToDelete) return;

    deleteCategory.mutate(categoryToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      }
    });
  };

  // ✅ Loading automático
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // ✅ Error handling automático
  if (error) {
    return <ErrorState message="Error al cargar categorías" onRetry={refetch} />;
  }

  return (
    <div>
      {data?.map(cat => <div key={cat.id}>{cat.name}</div>)}

      {/* Loading states en botones */}
      <Button
        onClick={() => handleSave(formData)}
        disabled={createCategory.isPending || updateCategory.isPending}
      >
        {createCategory.isPending || updateCategory.isPending ? "Guardando..." : "Guardar"}
      </Button>
    </div>
  );
}
```

**Beneficios**:

- ✅ -30 líneas de código
- ✅ Sin `useState` para loading/data
- ✅ Cache automático
- ✅ Actualización automática tras crear/editar/eliminar
- ✅ Error handling robusto
- ✅ Reintentos automáticos

---

## 🎯 Ejemplo 2: Migración de /app/profile/page.tsx

### ❌ ANTES

```typescript
export default function ProfilePage() {
  const [user, setUser] = React.useState(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  const handleUpdateProfile = async (data) => {
    setProfileLoading(true);
    try {
      const response = await httpClient.put("auth/profile", data);
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (data) => {
    setPasswordLoading(true);
    try {
      await httpClient.put("auth/change-password", data);
    } catch (error) {
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };
}
```

### ✅ DESPUÉS

```typescript
import { useQuery } from "@tanstack/react-query";
import {
  useUpdateUserProfile,
  useChangePassword,
  userKeys
} from "@/hooks/mutations";

export default function ProfilePage() {
  // ✅ Query del perfil
  const { data: user, isLoading } = useQuery({
    queryKey: userKeys.profile,
    queryFn: async () => {
      const response = await httpClient.get("auth/me");
      return response.data;
    }
  });

  // ✅ Mutations
  const updateProfile = useUpdateUserProfile();
  const changePassword = useChangePassword();

  const handleUpdateProfile = (data: UpdateUserProfileDto) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        toast.success("Perfil actualizado");
      },
      onError: (error) => {
        toast.error("Error al actualizar perfil");
      }
    });
  };

  const handleChangePassword = (data: ChangePasswordDto) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        toast.success("Contraseña actualizada");
        // Limpiar formulario
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    });
  };

  return (
    <div>
      {/* Loading states automáticos */}
      <Button
        onClick={() => handleUpdateProfile(profileData)}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? "Actualizando..." : "Actualizar Perfil"}
      </Button>

      <Button
        onClick={() => handleChangePassword(passwordData)}
        disabled={changePassword.isPending}
      >
        {changePassword.isPending ? "Cambiando..." : "Cambiar Contraseña"}
      </Button>
    </div>
  );
}
```

---

## 📊 Comparativa Antes vs Después

| Aspecto            | Antes (Manual)   | Después (React Query)    |
| ------------------ | ---------------- | ------------------------ |
| **Código**         | ~150 líneas      | ~80 líneas (-47%)        |
| **Loading states** | 3 useState       | 0 (automático)           |
| **Error handling** | try/catch manual | Automático con `isError` |
| **Cache**          | No existe        | Automático 5min          |
| **Invalidación**   | Manual refresh   | Automática               |
| **Reintentos**     | No               | 2 automáticos            |
| **Optimistic UI**  | Difícil          | Fácil con `onMutate`     |

---

## ✅ Checklist de Migración

Para cada componente:

### 1. Identificar Patterns a Migrar

- [ ] `useState` para data/loading/error
- [ ] `useEffect` con httpClient
- [ ] Manejo manual de cache (arrays)
- [ ] try/catch para errores

### 2. Imports Necesarios

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCreateX, useUpdateX, useDeleteX } from "@/hooks/mutations";
```

### 3. Reemplazar Queries (GET)

```typescript
// ❌ ANTES
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);

// ✅ DESPUÉS
const { data, isLoading } = useQuery({
  queryKey: ["resource"],
  queryFn: fetchData,
});
```

### 4. Reemplazar Mutations (POST/PUT/DELETE)

```typescript
// ❌ ANTES
const handleCreate = async (data) => {
  setLoading(true);
  try {
    await httpClient.post(...);
  } finally {
    setLoading(false);
  }
};

// ✅ DESPUÉS
const create = useCreateX();

const handleCreate = (data) => {
  create.mutate(data);
};
```

### 5. Actualizar UI Loading States

```typescript
// ✅ En botones
<Button disabled={mutation.isPending}>
  {mutation.isPending ? "Guardando..." : "Guardar"}
</Button>

// ✅ En pantalla completa
if (isLoading) return <LoadingSpinner />;
```

### 6. Error Handling

```typescript
// ✅ Global
if (error) return <ErrorState onRetry={refetch} />;

// ✅ Por mutación
mutation.mutate(data, {
  onError: (error) => {
    toast.error(error.message);
  }
});
```

---

## 🚀 Pasos de Migración por Componente

### Paso 1: Backup

```bash
cp src/app/categorias/page.tsx src/app/categorias/page.tsx.backup
```

### Paso 2: Agregar Imports

```typescript
import { useQuery } from "@tanstack/react-query";
import { useCreateCategory, ... } from "@/hooks/mutations";
```

### Paso 3: Reemplazar useState + useEffect

```typescript
// REMOVER
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => { ... }, []);

// AGREGAR
const { data, isLoading } = useQuery({ ... });
```

### Paso 4: Reemplazar Mutations

```typescript
// REMOVER
const handleCreate = async () => {
  setLoading(true);
  try {
    await httpClient.post(...);
    setData([...data, newItem]);
  } finally {
    setLoading(false);
  }
};

// AGREGAR
const create = useCreateX();

const handleCreate = (data) => {
  create.mutate(data);
};
```

### Paso 5: Actualizar JSX

```typescript
// Actualizar loading checks
if (isLoading) return <LoadingSpinner />;

// Actualizar botones
<Button disabled={mutation.isPending}>
  {mutation.isPending ? "Loading..." : "Action"}
</Button>
```

### Paso 6: Probar

- ✅ Cargar datos
- ✅ Crear registro
- ✅ Editar registro
- ✅ Eliminar registro
- ✅ Cache se invalida correctamente

---

## 📈 Progreso de Migración

### Completados (2):

- ✅ `/app/calendario/page.tsx`
- ✅ `/app/reservas/nueva/page.tsx`

### En Progreso (3):

- ⏳ `/app/categorias/page.tsx` - Ejemplo documentado
- ⏳ `/app/profile/page.tsx` - Ejemplo documentado
- ⏳ `/app/mantenimientos/page.tsx` - Pendiente

### Pendientes (15+):

- `/app/recursos/page.tsx`
- `/app/programas/page.tsx`
- `/app/admin/roles/page.tsx`
- ...y más

---

## 🎯 Resumen de Beneficios

### Por Componente:

- ✅ -40% a -60% líneas de código
- ✅ -100% useState para loading/error
- ✅ -100% useEffect para fetch
- ✅ +Cache automático
- ✅ +Reintentos automáticos
- ✅ +Error handling robusto

### Global:

- ✅ Consistencia en toda la app
- ✅ Menos bugs por estado desincronizado
- ✅ Mejor performance (cache)
- ✅ Código más fácil de mantener
- ✅ Testing más simple

---

**🔄 Migración a React Query: Menos código, más features, mejor DX! ✨**
