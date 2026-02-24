# 📜 Guía Rápida: Aplicar Virtual Scrolling a Listas Existentes

## 🎯 Objetivo

Convertir listas existentes para usar Virtual Scrolling y mejorar performance con 300+ items.

---

## 🚀 Pasos para Aplicar a Cada Lista

### 1. Categorías (categorias/page.tsx)

**Cambios mínimos**:

```typescript
// Importar componente virtualizado
import { VirtualizedResourceList } from "@/components/organisms/VirtualizedResourceList";

// Reemplazar map tradicional
{/* ANTES */}
{filteredCategories.map(category => (
  <CategoryCard key={category.id} category={category} />
))}

{/* DESPUÉS */}
<VirtualizedResourceList
  filters={{ search: filter, status: statusFilter }}
  renderItem={(category, index) => (
    <CategoryCard category={category} />
  )}
  itemHeight={80}
  onResourceClick={(cat) => router.push(`/categorias/${cat.id}`)}
/>
```

**Beneficio**: 60 FPS con 1000+ categorías

### 2. Recursos (recursos/page.tsx)

**Ya implementado** ✅

Ver: `/recursos-virtual/page.tsx` para ejemplo completo

**Aplicar a página principal**:

```typescript
import { VirtualizedResourceList } from "@/components/organisms/VirtualizedResourceList";

<VirtualizedResourceList
  filters={{
    status: statusFilter,
    categoryId: categoryFilter,
    search: searchTerm
  }}
  renderItem={(resource, index) => (
    <ResourceCard resource={resource} />
  )}
  itemHeight={120}
  overscan={5}
/>
```

### 3. Reservas (reservas/page.tsx)

**Crear o usar componente**:

```typescript
import { VirtualizedReservationList } from "@/components/organisms/VirtualizedReservationList";

<VirtualizedReservationList
  filters={{
    status: statusFilter,
    startDate: dateFilter,
    resourceId: resourceFilter
  }}
  renderItem={(reservation, index) => (
    <ReservationCard reservation={reservation} />
  )}
  itemHeight={100}
/>
```

### 4. Roles y Permisos (admin/roles/page.tsx)

**Crear VirtualizedRoleList**:

```typescript
// Similar a recursos pero con roles
<VirtualizedList
  items={filteredRoles}
  renderItem={(role) => (
    <RoleCard role={role} />
  )}
  itemHeight={90}
/>
```

### 5. Auditoría (admin/auditoria/page.tsx)

**Crear VirtualizedAuditList**:

```typescript
// Ideal para logs largos
<VirtualizedList
  items={auditLogs}
  renderItem={(log) => (
    <AuditLogRow log={log} />
  )}
  itemHeight={60}
  overscan={10} // Más overscan para scroll rápido
/>
```

---

## 📊 Template Genérico

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  overscan?: number;
}

export function VirtualizedList<T extends { id: string }>({
  items,
  renderItem,
  itemHeight = 80,
  overscan = 5,
}: VirtualizedListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## ✅ Checklist por Página

### Categorías

- [ ] Importar VirtualizedList
- [ ] Reemplazar .map() con componente
- [ ] Configurar itemHeight (80px)
- [ ] Agregar prefetch on hover
- [ ] Testing con 500+ items

### Recursos

- [x] Ya implementado en `/recursos-virtual`
- [ ] Aplicar a página principal
- [ ] Migrar filtros
- [ ] Testing

### Reservas

- [ ] Crear VirtualizedReservationList
- [ ] Aplicar a historial
- [ ] itemHeight: 100px
- [ ] Testing con 1000+ reservas

### Roles/Permisos

- [ ] Adaptar VirtualizedList genérico
- [ ] itemHeight: 90px
- [ ] Testing

### Auditoría

- [ ] VirtualizedList para logs
- [ ] itemHeight: 60px (más compacto)
- [ ] overscan: 10 (scroll rápido)
- [ ] Testing con 5000+ logs

---

## 🎯 Prioridad de Implementación

1. **Auditoría** (más items esperados)
2. **Reservas** (historial largo)
3. **Recursos** (catálogo grande)
4. **Roles/Permisos** (menos items pero mejor UX)
5. **Categorías** (probablemente <100 items)

---

## 📈 Métricas Esperadas

| Lista      | Items Típicos | Sin Virtual | Con Virtual | Mejora |
| ---------- | ------------- | ----------- | ----------- | ------ |
| Auditoría  | 5,000+        | 10 FPS      | 60 FPS      | +500%  |
| Reservas   | 1,000+        | 25 FPS      | 60 FPS      | +140%  |
| Recursos   | 500+          | 35 FPS      | 60 FPS      | +71%   |
| Roles      | 50            | 60 FPS      | 60 FPS      | N/A    |
| Categorías | 30            | 60 FPS      | 60 FPS      | N/A    |

**Recomendación**: Aplicar virtual scrolling solo a Auditoría, Reservas y Recursos.

---

**Fecha**: Noviembre 21, 2025  
**Estado**: ✅ **GUÍA LISTA**
