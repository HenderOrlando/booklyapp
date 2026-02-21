# 🏢 Resources Service - Plan de Frontend

**Microservicio**: Resources Service (Puerto 3002)  
**Requerimientos Funcionales**: RF-01 a RF-06  
**Endpoints Base**: `/api/v1/resources/*`, `/api/v1/categories/*`, `/api/v1/maintenance/*`

---

## 📋 Requerimientos Funcionales

### RF-01: CRUD de Recursos

- Crear, editar y eliminar recursos físicos
- Validaciones de datos obligatorios
- Registro de auditoría de cambios

### RF-02: Asociación de Recursos

- Asociar recursos a programas académicos
- Gestión de categorías de recursos
- Categorías mínimas no eliminables

### RF-03: Atributos Clave del Recurso

- Capacidad, ubicación, equipamiento
- Características de accesibilidad
- Especificaciones técnicas

### RF-04: Importación Masiva

- Importar recursos desde CSV
- Validación de datos en lote
- Reporte de errores por fila

### RF-05: Reglas de Disponibilidad

- Configurar horarios disponibles
- Definir excepciones y mantenimientos
- Restricciones por tipo de usuario

### RF-06: Gestión de Mantenimiento

- Programar mantenimientos preventivos/correctivos
- Reportar incidentes
- Historial de mantenimientos

---

## 🌐 Endpoints HTTP Disponibles

### Recursos

```typescript
GET    /api/v1/resources                    // Listar recursos (paginado + filtros)
POST   /api/v1/resources                    // Crear recurso
GET    /api/v1/resources/:id                // Obtener recurso por ID
PATCH  /api/v1/resources/:id                // Actualizar recurso
DELETE /api/v1/resources/:id                // Eliminar recurso
POST   /api/v1/resources/:id/restore        // Restaurar recurso eliminado

// Búsqueda avanzada
POST   /api/v1/resources/search             // Búsqueda avanzada con múltiples filtros

// Importación/Exportación
POST   /api/v1/resources/import             // Importar desde CSV
GET    /api/v1/resources/export             // Exportar a CSV
POST   /api/v1/resources/validate-import    // Validar CSV antes de importar

// Disponibilidad
GET    /api/v1/resources/:id/availability-rules  // Reglas de disponibilidad
POST   /api/v1/resources/:id/availability-rules  // Crear regla
PATCH  /api/v1/resources/:id/availability-rules/:ruleId  // Actualizar regla
DELETE /api/v1/resources/:id/availability-rules/:ruleId  // Eliminar regla

// Imágenes
POST   /api/v1/resources/:id/images         // Subir imagen
DELETE /api/v1/resources/:id/images/:imageId  // Eliminar imagen
```

### Categorías

```typescript
GET    /api/v1/categories                   // Listar categorías
POST   /api/v1/categories                   // Crear categoría
GET    /api/v1/categories/:id               // Obtener categoría
PATCH  /api/v1/categories/:id               // Actualizar categoría
DELETE /api/v1/categories/:id               // Eliminar categoría (solo no-default)
GET    /api/v1/categories/defaults          // Categorías por defecto
GET    /api/v1/categories/by-code/:code     // Buscar por código
```

### Mantenimiento

```typescript
GET    /api/v1/maintenance                  // Listar mantenimientos
POST   /api/v1/maintenance                  // Programar mantenimiento
GET    /api/v1/maintenance/:id              // Obtener mantenimiento
PATCH  /api/v1/maintenance/:id              // Actualizar mantenimiento
DELETE /api/v1/maintenance/:id              // Cancelar mantenimiento

// Reportar incidentes
POST   /api/v1/maintenance/incidents        // Reportar incidente
GET    /api/v1/maintenance/incidents        // Listar incidentes
PATCH  /api/v1/maintenance/incidents/:id/resolve  // Resolver incidente

// Historial
GET    /api/v1/maintenance/history/:resourceId    // Historial de un recurso
GET    /api/v1/maintenance/upcoming               // Próximos mantenimientos
GET    /api/v1/maintenance/overdue                // Mantenimientos vencidos
```

### Atributos de Recursos

```typescript
GET    /api/v1/resource-attributes          // Listar atributos disponibles
POST   /api/v1/resource-attributes          // Crear nuevo tipo de atributo
GET    /api/v1/resource-attributes/:id      // Obtener atributo
PATCH  /api/v1/resource-attributes/:id      // Actualizar atributo
DELETE /api/v1/resource-attributes/:id      // Eliminar atributo
```

---

## 📄 Páginas a Implementar

### 1. Lista de Recursos

#### `/dashboard/resources` - Vista Principal

```typescript
// app/(dashboard)/resources/page.tsx
"use client";

export default function ResourcesPage() {
  return (
    <DashboardTemplate>
      <PageHeader
        title="Gestión de Recursos"
        actions={
          <>
            <ImportButton />
            <ExportButton />
            <CreateResourceButton />
          </>
        }
      />
      <ResourcesFilter />
      <ResourcesGrid />
      <Pagination />
    </DashboardTemplate>
  );
}
```

**Funcionalidades**:

- Grid/Lista de recursos con tarjetas visuales
- Filtros por: tipo, categoría, programa, estado, capacidad
- Búsqueda por nombre/código
- Ordenamiento múltiple
- Selección múltiple para acciones en lote

### 2. Detalle de Recurso

#### `/dashboard/resources/[id]` - Vista Detallada

```typescript
// app/(dashboard)/resources/[id]/page.tsx
"use client";

export default function ResourceDetailPage({ params }) {
  return (
    <DashboardTemplate>
      <ResourceHeader />
      <Tabs>
        <TabPanel value="general">
          <ResourceInfoCard />
          <ResourceAttributes />
        </TabPanel>
        <TabPanel value="availability">
          <AvailabilityRulesManager />
          <AvailabilityCalendar />
        </TabPanel>
        <TabPanel value="maintenance">
          <MaintenanceHistory />
          <ScheduleMaintenanceButton />
        </TabPanel>
        <TabPanel value="reservations">
          <ResourceReservationsHistory />
        </TabPanel>
        <TabPanel value="gallery">
          <ResourceImageGallery />
          <UploadImageButton />
        </TabPanel>
      </Tabs>
    </DashboardTemplate>
  );
}
```

### 3. Crear/Editar Recurso

#### `/dashboard/resources/new` - Crear Recurso

```typescript
// app/(dashboard)/resources/new/page.tsx
"use client";

export default function NewResourcePage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Nuevo Recurso" />
      <ResourceFormWizard />
    </DashboardTemplate>
  );
}
```

**Wizard Steps**:

1. Información Básica (nombre, código, tipo, categoría)
2. Detalles (capacidad, ubicación, descripción)
3. Atributos Técnicos (equipamiento, accesibilidad)
4. Reglas de Disponibilidad
5. Imágenes
6. Revisión y Creación

#### `/dashboard/resources/[id]/edit` - Editar Recurso

```typescript
// app/(dashboard)/resources/[id]/edit/page.tsx
"use client";

export default function EditResourcePage({ params }) {
  return (
    <DashboardTemplate>
      <PageHeader title="Editar Recurso" />
      <ResourceForm resourceId={params.id} />
    </DashboardTemplate>
  );
}
```

### 4. Importación Masiva

#### `/dashboard/resources/import` - Importar CSV

```typescript
// app/(dashboard)/resources/import/page.tsx
"use client";

export default function ImportResourcesPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Importación Masiva" />
      <ImportWizard>
        <Step1_DownloadTemplate />
        <Step2_UploadCSV />
        <Step3_ValidateData />
        <Step4_ReviewErrors />
        <Step5_ConfirmImport />
      </ImportWizard>
    </DashboardTemplate>
  );
}
```

### 5. Categorías

#### `/dashboard/resources/categories` - Gestión de Categorías

```typescript
// app/(dashboard)/resources/categories/page.tsx
"use client";

export default function CategoriesPage() {
  return (
    <DashboardTemplate>
      <PageHeader
        title="Categorías de Recursos"
        actions={<CreateCategoryButton />}
      />
      <CategoriesGrid />
    </DashboardTemplate>
  );
}
```

### 6. Mantenimiento

#### `/dashboard/resources/maintenance` - Gestión de Mantenimiento

```typescript
// app/(dashboard)/resources/maintenance/page.tsx
"use client";

export default function MaintenancePage() {
  return (
    <DashboardTemplate>
      <PageHeader
        title="Gestión de Mantenimiento"
        actions={<ScheduleMaintenanceButton />}
      />
      <Tabs>
        <TabPanel value="scheduled">
          <UpcomingMaintenanceList />
        </TabPanel>
        <TabPanel value="history">
          <MaintenanceHistory />
        </TabPanel>
        <TabPanel value="incidents">
          <IncidentsList />
          <ReportIncidentButton />
        </TabPanel>
      </Tabs>
    </DashboardTemplate>
  );
}
```

---

## 🧩 Componentes Necesarios

### Atoms

```typescript
// components/atoms/ResourceTypeIcon/ResourceTypeIcon.tsx
interface ResourceTypeIconProps {
  type: "CLASSROOM" | "LABORATORY" | "AUDITORIUM" | "EQUIPMENT";
  size?: "sm" | "md" | "lg";
}

// components/atoms/StatusBadge/ResourceStatusBadge.tsx
interface ResourceStatusBadgeProps {
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "DISABLED";
}

// components/atoms/CapacityIndicator/CapacityIndicator.tsx
interface CapacityIndicatorProps {
  capacity: number;
  currentOccupancy?: number;
}
```

### Molecules

```typescript
// components/molecules/ResourceCard/ResourceCard.tsx
interface ResourceCardProps {
  resource: Resource;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
}

// components/molecules/ResourceFilter/ResourceFilter.tsx
interface ResourceFilterProps {
  filters: ResourceFilters;
  onChange: (filters: ResourceFilters) => void;
  categories: Category[];
  programs: Program[];
}

// components/molecules/AvailabilityRuleForm/AvailabilityRuleForm.tsx
interface AvailabilityRuleFormProps {
  resourceId: string;
  rule?: AvailabilityRule;
  onSave: (rule: AvailabilityRuleDto) => void;
  onCancel: () => void;
}

// components/molecules/MaintenanceCard/MaintenanceCard.tsx
interface MaintenanceCardProps {
  maintenance: Maintenance;
  onComplete?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
}
```

### Organisms

```typescript
// components/organisms/ResourcesGrid/ResourcesGrid.tsx
interface ResourcesGridProps {
  resources: Resource[];
  isLoading?: boolean;
  viewMode: "grid" | "list";
  onResourceClick: (resourceId: string) => void;
  selectedResources?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

// components/organisms/ResourceFormWizard/ResourceFormWizard.tsx
interface ResourceFormWizardProps {
  resource?: Resource;
  onComplete: (resource: CreateResourceDto) => void;
  onCancel: () => void;
}

// components/organisms/CSVImportWizard/CSVImportWizard.tsx
interface CSVImportWizardProps {
  onComplete: (results: ImportResults) => void;
  onCancel: () => void;
  templateUrl: string;
}

// components/organisms/AvailabilityCalendar/AvailabilityCalendar.tsx
interface AvailabilityCalendarProps {
  resourceId: string;
  rules: AvailabilityRule[];
  onAddRule: () => void;
  onEditRule: (ruleId: string) => void;
}
```

---

## 🗄️ Store y Estado

### Resources Slice

```typescript
// store/slices/resourcesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ResourcesState {
  resources: Resource[];
  selectedResource: Resource | null;
  filters: ResourceFilters;
  viewMode: "grid" | "list";
  isLoading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  resources: [],
  selectedResource: null,
  filters: {},
  viewMode: "grid",
  isLoading: false,
  error: null,
};

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    setResources: (state, action: PayloadAction<Resource[]>) => {
      state.resources = action.payload;
    },
    setSelectedResource: (state, action: PayloadAction<Resource | null>) => {
      state.selectedResource = action.payload;
    },
    setFilters: (state, action: PayloadAction<ResourceFilters>) => {
      state.filters = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setResources,
  setSelectedResource,
  setFilters,
  setViewMode,
  clearFilters,
} = resourcesSlice.actions;
export default resourcesSlice.reducer;
```

### RTK Query API

```typescript
// store/api/resourcesApi.ts
export const resourcesApi = createApi({
  reducerPath: "resourcesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL + "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Resource", "Category", "Maintenance"],
  endpoints: (builder) => ({
    // Resources
    getResources: builder.query<PaginatedResponse<Resource>, QueryResourcesDto>(
      {
        query: (params) => ({
          url: "/resources",
          params,
        }),
        providesTags: ["Resource"],
      }
    ),
    getResourceById: builder.query<Resource, string>({
      query: (id) => `/resources/${id}`,
      providesTags: (result, error, id) => [{ type: "Resource", id }],
    }),
    createResource: builder.mutation<Resource, CreateResourceDto>({
      query: (data) => ({
        url: "/resources",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Resource"],
    }),
    updateResource: builder.mutation<
      Resource,
      { id: string; data: UpdateResourceDto }
    >({
      query: ({ id, data }) => ({
        url: `/resources/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Resource", id },
        "Resource",
      ],
    }),
    deleteResource: builder.mutation<void, string>({
      query: (id) => ({
        url: `/resources/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resource"],
    }),

    // Import/Export
    importResources: builder.mutation<ImportResults, FormData>({
      query: (formData) => ({
        url: "/resources/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Resource"],
    }),
    validateImport: builder.mutation<ValidationResults, FormData>({
      query: (formData) => ({
        url: "/resources/validate-import",
        method: "POST",
        body: formData,
      }),
    }),

    // Categories
    getCategories: builder.query<Category[], void>({
      query: () => "/categories",
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<Category, CreateCategoryDto>({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    // Maintenance
    getMaintenanceSchedule: builder.query<Maintenance[], QueryMaintenanceDto>({
      query: (params) => ({
        url: "/maintenance",
        params,
      }),
      providesTags: ["Maintenance"],
    }),
    scheduleMaintenance: builder.mutation<Maintenance, CreateMaintenanceDto>({
      query: (data) => ({
        url: "/maintenance",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Maintenance", "Resource"],
    }),
    reportIncident: builder.mutation<Incident, ReportIncidentDto>({
      query: (data) => ({
        url: "/maintenance/incidents",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Maintenance"],
    }),
  }),
});

export const {
  useGetResourcesQuery,
  useGetResourceByIdQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
  useImportResourcesMutation,
  useValidateImportMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useGetMaintenanceScheduleQuery,
  useScheduleMaintenanceMutation,
  useReportIncidentMutation,
} = resourcesApi;
```

---

## 📐 Tipos TypeScript

```typescript
// types/api/resources.ts

export interface Resource {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: ResourceType;
  category: Category;
  programId?: string;
  capacity: number;
  location: string;
  floor?: string;
  building?: string;
  status: ResourceStatus;
  attributes: ResourceAttributes;
  images: ResourceImage[];
  availabilityRules: AvailabilityRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum ResourceType {
  CLASSROOM = "CLASSROOM",
  LABORATORY = "LABORATORY",
  AUDITORIUM = "AUDITORIUM",
  EQUIPMENT = "EQUIPMENT",
  SPORTS_FACILITY = "SPORTS_FACILITY",
  MEETING_ROOM = "MEETING_ROOM",
}

export enum ResourceStatus {
  AVAILABLE = "AVAILABLE",
  IN_USE = "IN_USE",
  MAINTENANCE = "MAINTENANCE",
  DISABLED = "DISABLED",
}

export interface ResourceAttributes {
  equipment?: string[]; // ["Proyector", "Computador", "Aire acondicionado"]
  accessibility?: string[]; // ["Rampa", "Baño adaptado"]
  specialConditions?: string[]; // ["Requiere autorización especial"]
  technicalSpecs?: Record<string, any>;
}

export interface Category {
  id: string;
  type: string;
  subtype?: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  isActive: boolean;
  isDefault: boolean;
  service: "RESOURCES" | "AVAILABILITY" | "AUTH";
}

export interface AvailabilityRule {
  id: string;
  resourceId: string;
  dayOfWeek: number; // 0-6 (Domingo-Sábado)
  startTime: string; // "08:00"
  endTime: string; // "18:00"
  isRecurring: boolean;
  exceptions?: Date[];
  allowedUserTypes?: string[];
  isActive: boolean;
}

export interface Maintenance {
  id: string;
  resourceId: string;
  type: "PREVENTIVE" | "CORRECTIVE" | "EMERGENCY" | "CLEANING";
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// DTOs
export interface CreateResourceDto {
  code: string;
  name: string;
  description?: string;
  type: ResourceType;
  categoryId: string;
  programId?: string;
  capacity: number;
  location: string;
  floor?: string;
  building?: string;
  attributes?: ResourceAttributes;
  availabilityRules?: CreateAvailabilityRuleDto[];
}

export interface ImportResults {
  success: number;
  failed: number;
  errors: ImportError[];
  imported: Resource[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}
```

---

## 🎯 Casos de Uso

### 1. Crear Recurso con Wizard

```typescript
// hooks/useCreateResourceWizard.ts
export const useCreateResourceWizard = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateResourceDto>>({});
  const [createResource] = useCreateResourceMutation();

  const updateStep = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      const result = await createResource(
        formData as CreateResourceDto
      ).unwrap();
      return { success: true, resource: result.data };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    step,
    formData,
    updateStep,
    handleSubmit,
    goBack: () => setStep((prev) => prev - 1),
  };
};
```

### 2. Importación CSV con Validación

```typescript
// hooks/useCSVImport.ts
export const useCSVImport = () => {
  const [validateImport] = useValidateImportMutation();
  const [importResources] = useImportResourcesMutation();

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Validar primero
      const validation = await validateImport(formData).unwrap();

      if (validation.data.errors.length > 0) {
        return {
          success: false,
          errors: validation.data.errors,
          canProceed: validation.data.warnings.length === 0,
        };
      }

      // 2. Importar si validación OK
      const results = await importResources(formData).unwrap();

      return {
        success: true,
        imported: results.data.success,
        failed: results.data.failed,
        errors: results.data.errors,
      };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { handleImport };
};
```

### 3. Programar Mantenimiento

```typescript
// hooks/useScheduleMaintenance.ts
export const useScheduleMaintenance = () => {
  const [scheduleMaintenance] = useScheduleMaintenanceMutation();

  const schedule = async (data: CreateMaintenanceDto) => {
    try {
      // Validar que no haya conflictos con reservas
      const hasConflicts = await checkReservationConflicts(
        data.resourceId,
        data.scheduledDate
      );

      if (hasConflicts) {
        return {
          success: false,
          error: "Existen reservas activas en esta fecha",
          conflicts: hasConflicts,
        };
      }

      const result = await scheduleMaintenance(data).unwrap();
      return { success: true, maintenance: result.data };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { schedule };
};
```

### 4. Búsqueda Avanzada

```typescript
// hooks/useResourceSearch.ts
export const useResourceSearch = () => {
  const [filters, setFilters] = useState<ResourceFilters>({});
  const { data, isLoading } = useGetResourcesQuery(filters);

  const updateFilters = (newFilters: Partial<ResourceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const applyQuickFilter = (
    preset: "available" | "maintenance" | "high-capacity"
  ) => {
    const presets = {
      available: { status: "AVAILABLE" },
      maintenance: { status: "MAINTENANCE" },
      "high-capacity": { minCapacity: 100 },
    };
    setFilters(presets[preset]);
  };

  return {
    resources: data?.data || [],
    total: data?.meta?.total || 0,
    filters,
    isLoading,
    updateFilters,
    clearFilters,
    applyQuickFilter,
  };
};
```

---

## ✅ Checklist de Implementación

### CRUD Recursos

- [ ] Lista de recursos con grid/list view
- [ ] Filtros avanzados y búsqueda
- [ ] Wizard de creación de recursos
- [ ] Edición de recursos existentes
- [ ] Eliminación con confirmación
- [ ] Restauración de eliminados
- [ ] Carga de imágenes

### Categorías

- [ ] Lista de categorías
- [ ] Crear categoría personalizada
- [ ] Editar categoría (solo no-default)
- [ ] Eliminar categoría sin recursos asociados
- [ ] Asignar color a categoría
- [ ] Filtrar recursos por categoría

### Importación/Exportación

- [ ] Descargar plantilla CSV
- [ ] Subir archivo CSV
- [ ] Validación de datos
- [ ] Preview de errores
- [ ] Importación con manejo de errores
- [ ] Exportación de recursos
- [ ] Reporte de resultados

### Mantenimiento

- [ ] Calendario de mantenimientos
- [ ] Programar mantenimiento preventivo
- [ ] Reportar incidente
- [ ] Completar mantenimiento
- [ ] Historial por recurso
- [ ] Alertas de mantenimientos pendientes
- [ ] Cancelar/reprogramar

### Reglas de Disponibilidad

- [ ] Crear regla de horario
- [ ] Editar regla existente
- [ ] Eliminar regla
- [ ] Definir excepciones
- [ ] Restricciones por tipo de usuario
- [ ] Vista de calendario con reglas
- [ ] Validación de conflictos

---

**Anterior**: [01_AUTH_SERVICE.md](./01_AUTH_SERVICE.md)  
**Próximo**: [03_AVAILABILITY_SERVICE.md](./03_AVAILABILITY_SERVICE.md)
