# 📊 FASE 6 - Reports Service - INICIO

**Fecha de inicio**: 21 de Noviembre, 2025, 8:45 PM  
**Estado**: 🟡 EN PROGRESO (15%)  
**Prioridad**: Media-Alta

---

## 🎯 Objetivos de Fase 6

Implementar el sistema completo de reportes y análisis para la plataforma Bookly, incluyendo:

1. **Reportes de Uso**: Por recurso, usuario, programa académico y período
2. **Gráficos Interactivos**: Visualizaciones dinámicas de estadísticas
3. **Exportación**: Múltiples formatos (CSV, Excel, PDF)
4. **Dashboards**: Paneles de control en tiempo real
5. **Análisis Avanzado**: Tendencias, predicciones y métricas clave

---

## 📋 Requisitos Funcionales (RF)

Según `bookly-base.md` y `bookly-modules.md`:

### RF-31: Reporte de uso por recurso/programa/período

- Generar reportes detallados de uso
- Filtrar por recurso, programa académico y rango de fechas
- Métricas: total de reservas, horas de uso, tasa de ocupación

### RF-32: Reporte por usuario/profesor

- Ver actividad individual
- Historial de reservas por usuario
- Estadísticas de uso personal

### RF-33: Exportación en CSV/Excel/PDF

- Exportar reportes en múltiples formatos
- Mantener formato y estructura
- Incluir metadatos y filtros aplicados

### RF-34: Registro de feedback de usuarios

- Capturar opiniones y calificaciones
- Comentarios por reserva
- Análisis de satisfacción

### RF-35: Evaluación de usuarios por el staff

- Calificación de comportamiento
- Historial de incidentes
- Notas administrativas

### RF-36: Dashboards interactivos

- Visualización en tiempo real
- Gráficos dinámicos y responsivos
- Filtros y drill-down

### RF-37: Reporte de demanda insatisfecha

- Identificar recursos más solicitados
- Analizar rechazos y cancelaciones
- Proyecciones de demanda

---

## 📦 Componentes a Implementar

### 1. Atoms (4 componentes)

#### ChartTooltip

```typescript
interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any) => string;
}
```

#### StatCard

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // Cambio porcentual
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  loading?: boolean;
}
```

#### ExportButton

```typescript
interface ExportButtonProps {
  format: "csv" | "excel" | "pdf";
  onExport: (format: string) => void;
  loading?: boolean;
  disabled?: boolean;
}
```

#### FilterTag

```typescript
interface FilterTagProps {
  label: string;
  value: string;
  onRemove?: () => void;
  color?: string;
}
```

### 2. Molecules (6 componentes)

#### LineChart

```typescript
interface LineChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
  color?: string;
  height?: number;
}
```

#### BarChart

```typescript
interface BarChartProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  title?: string;
  horizontal?: boolean;
  stacked?: boolean;
}
```

#### PieChart

```typescript
interface PieChartProps {
  data: ChartDataPoint[];
  dataKey: string;
  nameKey: string;
  title?: string;
  colors?: string[];
}
```

#### ReportCard

```typescript
interface ReportCardProps {
  title: string;
  description?: string;
  metrics: ReportMetric[];
  actions?: ReportAction[];
  lastUpdated?: string;
}
```

#### DateRangePicker

```typescript
interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  presets?: DateRangePreset[];
  maxRange?: number; // días
}
```

#### ExportPanel

```typescript
interface ExportPanelProps {
  formats: ExportFormat[];
  onExport: (format: string, options: ExportOptions) => void;
  loading?: boolean;
}
```

### 3. Organisms (5 componentes)

#### ReportsGrid

```typescript
interface ReportsGridProps {
  reports: Report[];
  onSelectReport: (reportId: string) => void;
  onGenerateReport: (config: ReportConfig) => void;
  loading?: boolean;
}
```

#### UsageChart

```typescript
interface UsageChartProps {
  type: "resource" | "user" | "program";
  timeRange: DateRange;
  groupBy: "day" | "week" | "month";
  data: UsageData[];
}
```

#### UserReportsTable

```typescript
interface UserReportsTableProps {
  users: UserReport[];
  filters: UserReportFilters;
  onFilterChange: (filters: UserReportFilters) => void;
  onExport: () => void;
}
```

#### ResourceUtilizationChart

```typescript
interface ResourceUtilizationChartProps {
  resources: ResourceUtilization[];
  period: DateRange;
  metrics: ("occupancy" | "requests" | "rejections")[];
}
```

#### ExportModal

```typescript
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: any;
  availableFormats: ExportFormat[];
  onExport: (format: string, options: ExportOptions) => void;
}
```

### 4. Páginas (3 páginas)

#### /reportes (Principal)

- Dashboard general con KPIs
- Acceso rápido a reportes frecuentes
- Gráficos resumen

#### /reportes/recursos

- Reportes detallados por recurso
- Gráficos de utilización
- Exportación de datos

#### /reportes/usuarios

- Reportes por usuario/profesor
- Estadísticas de actividad
- Evaluaciones y feedback

---

## 🔌 Endpoints del Backend

Según `04_REPORTS_SERVICE.md` (a verificar en bookly-backend):

### Reportes Generales

- `GET /api/v1/reports/usage` - Reporte de uso general
- `GET /api/v1/reports/summary` - Resumen ejecutivo
- `GET /api/v1/reports/trends` - Análisis de tendencias

### Reportes por Entidad

- `GET /api/v1/reports/resources/:id` - Por recurso específico
- `GET /api/v1/reports/users/:id` - Por usuario específico
- `GET /api/v1/reports/programs/:id` - Por programa académico

### Exportación

- `POST /api/v1/reports/export` - Exportar reporte
- `GET /api/v1/reports/download/:id` - Descargar archivo

### Feedback

- `POST /api/v1/reports/feedback` - Enviar feedback
- `GET /api/v1/reports/feedback/:reservationId` - Ver feedback

---

## 📊 Tipos TypeScript

### Tipos Base

```typescript
export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  generatedAt: string;
  generatedBy: string;
  period: DateRange;
  filters: ReportFilters;
  data: any;
  format?: "json" | "csv" | "excel" | "pdf";
  fileUrl?: string;
  status: "generating" | "ready" | "error";
}

export type ReportType =
  | "usage"
  | "user"
  | "resource"
  | "program"
  | "feedback"
  | "demand"
  | "custom";

export interface ReportFilters {
  resourceIds?: string[];
  userIds?: string[];
  programIds?: string[];
  categories?: string[];
  startDate?: string;
  endDate?: string;
  status?: string[];
}

export interface UsageData {
  date: string;
  resourceId: string;
  resourceName: string;
  totalReservations: number;
  totalHours: number;
  occupancyRate: number;
  peakHours: number[];
}

export interface UserReport {
  userId: string;
  userName: string;
  userEmail: string;
  totalReservations: number;
  totalHours: number;
  averageRating: number;
  lastReservation: string;
  topResources: Array<{
    resourceId: string;
    resourceName: string;
    count: number;
  }>;
}

export interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  totalCapacity: number; // Horas disponibles
  usedCapacity: number; // Horas utilizadas
  occupancyRate: number; // Porcentaje
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  peakUsageTime: string; // "morning" | "afternoon" | "evening"
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  includeCharts?: boolean;
  includeMetadata?: boolean;
  filename?: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}
```

---

## 🛠️ Servicios HTTP

### reportsClient.ts

```typescript
class ReportsClient {
  // Obtener reporte de uso
  async getUsageReport(filters: ReportFilters): Promise<Report>;

  // Obtener reporte por recurso
  async getResourceReport(
    resourceId: string,
    period: DateRange
  ): Promise<ResourceUtilization>;

  // Obtener reporte por usuario
  async getUserReport(userId: string, period: DateRange): Promise<UserReport>;

  // Generar reporte personalizado
  async generateReport(config: ReportConfig): Promise<Report>;

  // Exportar reporte
  async exportReport(reportId: string, options: ExportOptions): Promise<Blob>;

  // Descargar reporte
  async downloadReport(reportId: string): Promise<Blob>;

  // Enviar feedback
  async submitFeedback(feedback: FeedbackSubmission): Promise<void>;

  // Obtener feedback
  async getFeedback(reservationId: string): Promise<Feedback[]>;
}
```

---

## 🔄 Hooks Personalizados

### useReports

```typescript
function useReports(filters?: ReportFilters) {
  // React Query hook para obtener reportes
  const { data, isLoading, error } = useQuery(...);

  return { reports, isLoading, error };
}
```

### useReportExport

```typescript
function useReportExport() {
  // Mutation para exportar reportes
  const exportMutation = useMutation(...);

  return {
    export: exportMutation.mutate,
    isExporting: exportMutation.isLoading,
    downloadUrl: exportMutation.data?.url,
  };
}
```

### useChartData

```typescript
function useChartData(type: ReportType, filters: ReportFilters) {
  // Transform data for charts
  const { data, isLoading } = useQuery(...);

  const chartData = React.useMemo(() => transformToChartData(data), [data]);

  return { chartData, isLoading };
}
```

---

## 📚 Librerías a Usar

### Visualización

- **Recharts** (recomendado) - Gráficos React responsivos

  ```bash
  npm install recharts
  ```

- Alternativa: Chart.js + react-chartjs-2

### Exportación

- **xlsx** - Para Excel

  ```bash
  npm install xlsx
  ```

- **jsPDF** - Para PDF

  ```bash
  npm install jspdf
  npm install @types/jspdf
  ```

- **file-saver** - Para descargar archivos

  ```bash
  npm install file-saver
  npm install @types/file-saver
  ```

### Utilidades

- **date-fns** (ya instalado) - Manejo de fechas
- **lodash** - Transformación de datos

  ```bash
  npm install lodash
  npm install @types/lodash
  ```

---

## 📝 Plan de Implementación

### Semana 1 (22-26 Nov)

#### Día 1-2: Setup y Tipos

- [x] Crear archivo `FASE_6_INICIO.md` ✅
- [x] Definir tipos TypeScript (`report.ts`, `chart.ts`) ✅ (por completar)
- [x] Instalar dependencias necesarias
- [ ] Crear estructura de carpetas
- [ ] Configurar Recharts

#### Día 3-4: Atoms y Molecules

- [ ] Implementar atoms (4)
- [ ] Implementar molecules (6)
- [ ] Crear Storybook stories

#### Día 5: Organisms

- [ ] Implementar organisms (5)
- [ ] Integrar con React Query

### Semana 2 (27 Nov - 1 Dic)

#### Día 1-2: Páginas

- [ ] Crear página `/reportes`
- [ ] Crear página `/reportes/recursos`
- [ ] Crear página `/reportes/usuarios`

#### Día 3: Servicios y Hooks

- [ ] Implementar `reportsClient.ts`
- [ ] Crear hooks personalizados

#### Día 4: Testing y Refinamiento

- [ ] Tests unitarios
- [ ] Integración completa
- [ ] Optimización de performance

#### Día 5: Documentación y Cierre

- [ ] Actualizar documentación
- [ ] Video demo
- [ ] PR y revisión

---

## ✅ Checklist de Completitud

### Componentes

- [ ] 4 Atoms implementados
- [ ] 6 Molecules implementados
- [ ] 5 Organisms implementados
- [ ] 3 Páginas funcionales

### Funcionalidad

- [ ] Reportes de uso funcionando
- [ ] Gráficos interactivos renderizando
- [ ] Exportación CSV funcional
- [ ] Exportación Excel funcional
- [ ] Exportación PDF funcional
- [ ] Filtros aplicándose correctamente

### Calidad

- [ ] TypeScript sin errores
- [ ] Tests unitarios >80% cobertura
- [ ] Responsive design
- [ ] Dark mode support
- [ ] Accessibility (WCAG 2.1)

### Documentación

- [ ] JSDoc en todos los componentes
- [ ] README actualizado
- [ ] Storybook stories
- [ ] Guía de uso

---

## 🚀 Estado Actual

**Completado**:

- ✅ ResponseUtil estandarizado (backend/frontend)
- ✅ Dashboard básico con KPIs (Fase 4)
- ✅ Infraestructura de mocks preparada

**En Progreso**:

- 🟡 Definición de tipos TypeScript (50%)

**Pendiente**:

- ⚪ Instalación de dependencias
- ⚪ Implementación de componentes
- ⚪ Integración con backend

---

**Última actualización**: 21 de Noviembre, 2025, 8:45 PM  
**Próximo hito**: Completar tipos TypeScript e instalar dependencias
