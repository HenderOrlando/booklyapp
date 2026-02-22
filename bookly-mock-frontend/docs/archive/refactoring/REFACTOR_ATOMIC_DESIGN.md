# Refactorización Atomic Design - Bookly Frontend

## 📋 Análisis de Código Actual

### Estado Actual

El proyecto tiene una estructura básica de Atomic Design pero presenta código duplicado y componentes que deben extraerse de las páginas.

### Componentes Existentes

- **Atoms**: Alert, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Dialog, DropdownMenu, Input, Popover, Select
- **Molecules**: DataTable, DatePicker, LogoutButton, DataModeIndicator, MockModeIndicator
- **Organisms**: AppHeader, AppSidebar, AdvancedSearchModal, CategoryModal, MaintenanceModal
- **Templates**: MainLayout, DetailLayout, DashboardLayout

---

## 🔍 Componentes Identificados para Extraer

### 1. **ATOMS** (Elementos básicos reutilizables)

#### 1.1 StatusBadge

**Ubicación actual**: Lógica duplicada en múltiples páginas
**Archivos afectados**:

- `recursos/[id]/page.tsx` (líneas 185-198)
- `recursos/page.tsx` (líneas 193-203)
- `categorias/page.tsx` (líneas 184-190)
- `mantenimientos/page.tsx` (líneas 159-185)

**Propuesta**: Crear `StatusBadge.tsx` que mapee estados a variantes de Badge

```typescript
// Casos de uso:
<StatusBadge status="AVAILABLE" /> // → Badge verde "Disponible"
<StatusBadge type="resource" status="MAINTENANCE" /> // → Badge amarillo "Mantenimiento"
<StatusBadge type="maintenance" status="COMPLETED" /> // → Badge verde "Completado"
```

#### 1.2 LoadingSpinner

**Ubicación actual**: Código duplicado en páginas
**Archivos afectados**:

- `recursos/[id]/page.tsx` (líneas 263-276)

**Propuesta**: Crear `LoadingSpinner.tsx` con variantes

```typescript
<LoadingSpinner size="sm" | "md" | "lg" text="Cargando..." />
```

#### 1.3 EmptyState

**Ubicación actual**: Código inline en páginas
**Uso**: Cuando no hay datos para mostrar

**Propuesta**: Crear `EmptyState.tsx`

```typescript
<EmptyState
  icon="📦"
  title="No hay recursos"
  description="Crea tu primer recurso"
  action={<Button>Crear Recurso</Button>}
/>
```

#### 1.4 ColorSwatch

**Ubicación actual**: `categorias/page.tsx` (líneas 199-206)
**Propuesta**: Crear `ColorSwatch.tsx`

```typescript
<ColorSwatch color="#FF5733" size="sm" | "md" | "lg" />
```

---

### 2. **MOLECULES** (Combinación de átomos)

#### 2.1 InfoField

**Ubicación actual**: Código duplicado en DetailLayout
**Archivos afectados**:

- `recursos/[id]/page.tsx` (líneas 346-415)

**Propuesta**: Crear `InfoField.tsx`

```typescript
<InfoField
  label="Capacidad"
  value="30 personas"
  variant="default" | "inline" | "card"
/>
```

#### 2.2 ConfirmDialog / DeleteModal

**Ubicación actual**: Código duplicado en múltiples páginas
**Archivos afectados**:

- `recursos/[id]/page.tsx` (líneas 296-325)
- `recursos/page.tsx` (código similar)
- `categorias/page.tsx` (código similar)

**Propuesta**: Crear `ConfirmDialog.tsx`

```typescript
<ConfirmDialog
  open={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  title="Confirmar Eliminación"
  description="¿Estás seguro que deseas eliminar este recurso?"
  confirmText="Eliminar"
  cancelText="Cancelar"
  variant="danger"
>
  <ResourcePreview resource={resource} />
</ConfirmDialog>
```

#### 2.3 SearchBar

**Ubicación actual**: Input + lógica de búsqueda duplicada
**Archivos afectados**:

- `recursos/page.tsx` (líneas 12, 37, etc.)
- `categorias/page.tsx` (líneas 12, 38, etc.)
- `mantenimientos/page.tsx` (líneas 12, 34, etc.)

**Propuesta**: Crear `SearchBar.tsx`

```typescript
<SearchBar
  placeholder="Buscar recursos..."
  value={filter}
  onChange={setFilter}
  onClear={() => setFilter("")}
  showAdvancedSearch
  onAdvancedSearch={() => setShowAdvancedSearch(true)}
/>
```

#### 2.4 FilterChips

**Ubicación actual**: Lógica de filtros activos dispersa
**Propuesta**: Crear `FilterChips.tsx`

```typescript
<FilterChips
  filters={[
    { key: "status", label: "Disponible", onRemove: () => {} },
    { key: "type", label: "Laboratorio", onRemove: () => {} }
  ]}
  onClearAll={handleClearFilters}
/>
```

#### 2.5 TimeSlotPicker

**Ubicación actual**: `recursos/[id]/page.tsx` (líneas 493-514)
**Propuesta**: Crear `TimeSlotPicker.tsx`

```typescript
<TimeSlotPicker
  slots={[
    { start: "07:00", end: "09:00", available: true },
    { start: "09:00", end: "11:00", available: false }
  ]}
  onSelect={(slot) => handleReserve(slot)}
/>
```

#### 2.6 StatsCard / MetricCard

**Ubicación actual**: `dashboard/page.tsx` (usa KPICard)
**Propuesta**: Mejorar/extraer para reutilización

```typescript
<StatsCard
  label="Recursos Disponibles"
  value="32"
  total="40"
  icon={<Icon />}
  trend={{ value: 5, isPositive: true }}
/>
```

#### 2.7 AttributeItem / FeatureItem

**Ubicación actual**: `recursos/[id]/page.tsx` (líneas 533-581)
**Propuesta**: Crear `FeatureItem.tsx`

```typescript
<FeatureItem
  icon="💻"
  label="Computadores"
  available={true}
  description="20 equipos disponibles"
/>
```

---

### 3. **ORGANISMS** (Secciones complejas de UI)

#### 3.1 ResourceInfoCard

**Ubicación actual**: `recursos/[id]/page.tsx` (líneas 200-260)
**Propuesta**: Crear `ResourceInfoCard.tsx`

```typescript
<ResourceInfoCard
  resource={resource}
  showQuickActions
  onReserve={(date) => {}}
/>
```

#### 3.2 ResourceHistoryList

**Ubicación actual**: `recursos/[id]/page.tsx` (líneas 423-469)
**Propuesta**: Crear `ResourceHistoryList.tsx`

```typescript
<ResourceHistoryList
  resourceId={resourceId}
  limit={10}
/>
```

#### 3.3 AvailabilityCalendar

**Ubicación actual**: `recursos/[id]/page.tsx` (líneas 474-518)
**Propuesta**: Crear `AvailabilityCalendar.tsx`

```typescript
<AvailabilityCalendar
  resourceId={resourceId}
  selectedDate={date}
  onDateSelect={setDate}
  onSlotReserve={(slot) => {}}
/>
```

#### 3.4 ResourceAttributesGrid

**Ubicación actual**: `recursos/[id]/page.tsx` (líneas 523-591)
**Propuesta**: Crear `ResourceAttributesGrid.tsx`

```typescript
<ResourceAttributesGrid
  attributes={resource.attributes}
  editable={false}
  onChange={(attrs) => {}}
/>
```

#### 3.5 ProgramResourceManager

**Ubicación actual**: `recursos/[id]/page.tsx` (líneas 119-180)
**Propuesta**: Crear `ProgramResourceManager.tsx`

```typescript
<ProgramResourceManager
  resourceId={resourceId}
  selectedProgramIds={selectedProgramIds}
  onSave={handleSavePrograms}
/>
```

#### 3.6 ResourceUsageChart

**Ubicación actual**: `dashboard/page.tsx` (líneas 179-212)
**Propuesta**: Crear `ResourceUsageChart.tsx`

```typescript
<ResourceUsageChart
  data={topResources}
  variant="bar" | "list"
/>
```

#### 3.7 ReservationList / RecentReservations

**Ubicación actual**: `dashboard/page.tsx` (líneas 133-169)
**Propuesta**: Crear `ReservationList.tsx`

```typescript
<ReservationList
  reservations={recentReservations}
  variant="compact" | "detailed"
  limit={5}
/>
```

---

### 4. **TEMPLATES** (Layouts especializados)

#### 4.1 ListPageTemplate

**Patrón común en**:

- `recursos/page.tsx`
- `categorias/page.tsx`
- `mantenimientos/page.tsx`

**Propuesta**: Crear `ListPageTemplate.tsx`

```typescript
<ListPageTemplate
  title="Recursos"
  breadcrumbs={[...]}
  searchBar={<SearchBar />}
  filters={<FilterBar />}
  actions={<Button>Nuevo Recurso</Button>}
  table={<DataTable />}
  pagination={<Pagination />}
/>
```

---

## 🎯 Priorización de Implementación

### Fase 1: Componentes Críticos (Alta prioridad)

1. ✅ **StatusBadge** - Usado en 4+ archivos
2. ✅ **LoadingSpinner** - Usado en múltiples páginas
3. ✅ **ConfirmDialog** - Duplicado en 3+ archivos
4. ✅ **SearchBar** - Duplicado en 3+ archivos
5. ✅ **InfoField** - Código repetitivo en detalle

### Fase 2: Mejoras de UX (Media prioridad)

6. ⏳ **EmptyState** - Mejora experiencia sin datos
7. ⏳ **FilterChips** - Visualización de filtros activos
8. ⏳ **TimeSlotPicker** - Componente complejo de reserva
9. ⏳ **FeatureItem** - Muestra atributos de recursos
10. ⏳ **ColorSwatch** - Para categorías

### Fase 3: Organismos Especializados (Media prioridad)

11. ⏳ **ResourceInfoCard** - Sidebar de información
12. ⏳ **AvailabilityCalendar** - Visualización de disponibilidad
13. ⏳ **ResourceAttributesGrid** - Grid de características
14. ⏳ **ProgramResourceManager** - Gestión de asociaciones

### Fase 4: Templates y Optimización (Baja prioridad)

15. ⏳ **ListPageTemplate** - Plantilla reutilizable
16. ⏳ **ResourceUsageChart** - Gráficos de uso
17. ⏳ **ReservationList** - Lista de reservas

---

## 📦 Estructura Propuesta de Archivos

```
src/components/
├── atoms/
│   ├── StatusBadge/
│   │   ├── StatusBadge.tsx
│   │   ├── StatusBadge.stories.tsx (opcional)
│   │   └── index.ts
│   ├── LoadingSpinner/
│   ├── EmptyState/
│   ├── ColorSwatch/
│   └── ...
├── molecules/
│   ├── InfoField/
│   ├── ConfirmDialog/
│   ├── SearchBar/
│   ├── FilterChips/
│   ├── TimeSlotPicker/
│   ├── FeatureItem/
│   └── ...
├── organisms/
│   ├── ResourceInfoCard/
│   ├── ResourceHistoryList/
│   ├── AvailabilityCalendar/
│   ├── ResourceAttributesGrid/
│   ├── ProgramResourceManager/
│   └── ...
└── templates/
    ├── ListPageTemplate/
    └── ...
```

---

## ✅ Beneficios de la Refactorización

1. **Reducción de Código Duplicado**: ~30-40% menos código
2. **Mantenibilidad**: Cambios en un solo lugar
3. **Consistencia**: UI uniforme en toda la app
4. **Testabilidad**: Componentes aislados más fáciles de probar
5. **Reutilización**: Componentes disponibles para nuevas features
6. **Documentación**: Cada componente con propósito claro

---

## 🚀 Plan de Ejecución

### Paso 1: Crear Componentes Base (Atoms)

- StatusBadge
- LoadingSpinner
- EmptyState
- ColorSwatch

### Paso 2: Crear Moleculas Comunes

- InfoField
- ConfirmDialog
- SearchBar
- FilterChips

### Paso 3: Refactorizar Páginas Existentes

- Actualizar imports
- Reemplazar código inline con componentes
- Eliminar código duplicado

### Paso 4: Crear Organismos Especializados

- ResourceInfoCard
- AvailabilityCalendar
- ResourceAttributesGrid

### Paso 5: Optimización Final

- Revisar performance
- Agregar tests
- Documentar uso de componentes

---

## 📝 Notas de Implementación

- Mantener compatibilidad con tema (dark/light mode)
- Usar variables CSS del design system
- Seguir convenciones de nombres establecidas
- Agregar PropTypes/TypeScript para validación
- Documentar props y casos de uso
- Considerar accesibilidad (a11y)
