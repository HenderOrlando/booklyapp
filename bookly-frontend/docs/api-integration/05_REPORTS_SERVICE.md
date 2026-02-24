# 📊 Reports Service - Plan de Frontend

**Microservicio**: Reports Service (Puerto 3005)  
**Requerimientos Funcionales**: RF-31 a RF-37  
**Endpoints Base**: `/api/v1/usage-reports/*`, `/api/v1/dashboard/*`, `/api/v1/audit/*`, `/api/v1/feedback/*`

---

## 📋 Requerimientos Funcionales

### RF-31 a RF-37: Reportes y Análisis

- **RF-31**: Reporte de uso por recurso/programa/período
- **RF-32**: Reporte por usuario/profesor
- **RF-33**: Exportación en CSV/Excel
- **RF-34**: Registro de feedback de usuarios
- **RF-35**: Evaluación de usuarios por el staff
- **RF-36**: Dashboards interactivos en tiempo real
- **RF-37**: Reporte de demanda insatisfecha

---

## 🌐 Endpoints HTTP Disponibles

### Reportes de Uso

```typescript
GET    /api/v1/usage-reports                    // Listar reportes
POST   /api/v1/usage-reports/generate           // Generar reporte
GET    /api/v1/usage-reports/:id                // Obtener reporte
DELETE /api/v1/usage-reports/:id                // Eliminar reporte
GET    /api/v1/usage-reports/:id/download       // Descargar reporte

// Reportes por tipo
POST   /api/v1/usage-reports/by-resource        // Por recurso
POST   /api/v1/usage-reports/by-program         // Por programa académico
POST   /api/v1/usage-reports/by-period          // Por período
POST   /api/v1/usage-reports/occupancy          // Tasa de ocupación
```

### Reportes de Demanda

```typescript
GET / api / v1 / demand - reports; // Listar reportes
POST / api / v1 / demand - reports / generate; // Generar reporte
GET / api / v1 / demand - reports / unmet; // Demanda insatisfecha
GET / api / v1 / demand - reports / peak - hours; // Horas pico
GET / api / v1 / demand - reports / trends; // Tendencias
```

### Reportes de Usuarios

```typescript
GET    /api/v1/user-reports                     // Reportes de usuarios
POST   /api/v1/user-reports/generate            // Generar reporte
GET    /api/v1/user-reports/by-user/:userId     // Por usuario específico
GET    /api/v1/user-reports/top-users           // Usuarios más activos
GET    /api/v1/user-reports/no-shows            // Usuarios con no-shows
```

### Dashboard

```typescript
GET / api / v1 / dashboard / overview; // Vista general
GET / api / v1 / dashboard / occupancy; // Ocupación actual
GET / api / v1 / dashboard / upcoming; // Próximas reservas
GET / api / v1 / dashboard / statistics; // Estadísticas clave
GET / api / v1 / dashboard / charts / usage; // Gráfico de uso
GET / api / v1 / dashboard / charts / trends; // Gráfico de tendencias
GET / api / v1 / dashboard / alerts; // Alertas del sistema
```

### Auditoría (Dashboard)

```typescript
GET / api / v1 / audit - dashboard / statistics; // Estadísticas generales
GET / api / v1 / audit - dashboard / time - series; // Series temporales
GET / api / v1 / audit - dashboard / unauthorized - attempts; // Intentos no autorizados
GET / api / v1 / audit - dashboard / user - activity; // Actividad de usuario
GET / api / v1 / audit - dashboard / suspicious - patterns; // Patrones sospechosos
GET / api / v1 / audit - dashboard / alerts; // Alertas de seguridad
GET / api / v1 / audit - dashboard / alerts / statistics; // Métricas de alertas
POST / api / v1 / audit - dashboard / monitor; // Ejecutar monitoreo
```

### Auditoría (Registros)

```typescript
GET    /api/v1/audit                             // Listar logs
GET    /api/v1/audit/:id                         // Obtener log específico
GET    /api/v1/audit/user/:userId                // Logs de usuario
GET    /api/v1/audit/resource/:resourceId        // Logs de recurso
GET    /api/v1/audit/export/csv                  // Exportar CSV
GET    /api/v1/audit/export/json                 // Exportar JSON
POST   /api/v1/audit/search                      // Búsqueda avanzada
```

### Feedback y Evaluaciones

```typescript
GET    /api/v1/feedback                          // Listar feedback
POST   /api/v1/feedback                          // Enviar feedback
GET    /api/v1/feedback/:id                      // Obtener feedback
PATCH  /api/v1/feedback/:id                      // Actualizar feedback
DELETE /api/v1/feedback/:id                      // Eliminar feedback
GET    /api/v1/feedback/stats                    // Estadísticas de feedback
GET    /api/v1/feedback/by-resource/:resourceId  // Feedback por recurso

GET    /api/v1/evaluations                       // Listar evaluaciones
POST   /api/v1/evaluations                       // Crear evaluación
GET    /api/v1/evaluations/:id                   // Obtener evaluación
PATCH  /api/v1/evaluations/:id                   // Actualizar evaluación
GET    /api/v1/evaluations/by-user/:userId       // Evaluaciones de usuario
GET    /api/v1/evaluations/stats                 // Estadísticas
```

### Exportaciones

```typescript
POST   /api/v1/reports/export                    // Exportar reporte
GET    /api/v1/reports/export/:id                // Estado de exportación
GET    /api/v1/reports/export/:id/download       // Descargar archivo
DELETE /api/v1/reports/export/:id                // Eliminar exportación
GET    /api/v1/reports/templates                 // Plantillas disponibles
```

---

## 📄 Páginas a Implementar

### 1. Dashboard Principal

#### `/dashboard` - Vista General

```typescript
// app/(dashboard)/page.tsx
"use client";

export default function DashboardPage() {
  return (
    <DashboardTemplate>
      <WelcomeSection />
      <QuickStats />
      <Grid cols={2}>
        <OccupancyChart />
        <UpcomingReservationsWidget />
      </Grid>
      <RecentActivity />
      <SystemAlerts />
    </DashboardTemplate>
  );
}
```

**Widgets**:

- Estadísticas rápidas (reservas hoy, ocupación, recursos disponibles)
- Gráfico de ocupación semanal
- Próximas reservas del usuario
- Alertas del sistema
- Actividad reciente

### 2. Reportes

#### `/dashboard/reports` - Centro de Reportes

```typescript
// app/(dashboard)/reports/page.tsx
"use client";

export default function ReportsPage() {
  return (
    <DashboardTemplate>
      <PageHeader
        title="Centro de Reportes"
        actions={<GenerateReportButton />}
      />
      <Tabs>
        <TabPanel value="usage">
          <UsageReportsSection />
        </TabPanel>
        <TabPanel value="demand">
          <DemandReportsSection />
        </TabPanel>
        <TabPanel value="users">
          <UserReportsSection />
        </TabPanel>
        <TabPanel value="custom">
          <CustomReportsSection />
        </TabPanel>
      </Tabs>
    </DashboardTemplate>
  );
}
```

#### `/dashboard/reports/generate` - Generar Reporte

```typescript
// app/(dashboard)/reports/generate/page.tsx
"use client";

export default function GenerateReportPage() {
  return (
    <DashboardTemplate>
      <ReportGeneratorWizard>
        <Step1_SelectReportType />
        <Step2_ConfigureFilters />
        <Step3_SelectMetrics />
        <Step4_ChooseVisualization />
        <Step5_ExportOptions />
      </ReportGeneratorWizard>
    </DashboardTemplate>
  );
}
```

### 3. Análisis y Dashboards

#### `/dashboard/analytics` - Análisis Avanzado

```typescript
// app/(dashboard)/analytics/page.tsx
"use client";

export default function AnalyticsPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Análisis y Tendencias" />
      <DateRangeSelector />
      <Grid cols={2}>
        <UsageTrendsChart />
        <OccupancyHeatmap />
      </Grid>
      <Grid cols={3}>
        <TopResourcesCard />
        <PeakHoursCard />
        <DemandForecastCard />
      </Grid>
      <UnmetDemandTable />
    </DashboardTemplate>
  );
}
```

**Visualizaciones**:

- Línea de tiempo de uso
- Mapa de calor de ocupación
- Recursos más utilizados
- Horas pico de demanda
- Proyección de demanda futura
- Tabla de demanda insatisfecha

### 4. Auditoría

#### `/dashboard/audit` - Dashboard de Auditoría

```typescript
// app/(dashboard)/audit/page.tsx
"use client";

export default function AuditDashboardPage() {
  return (
    <DashboardTemplate>
      <PageHeader title="Dashboard de Auditoría" />
      <AuditStats />
      <Grid cols={2}>
        <TimeSeriesChart />
        <UnauthorizedAttemptsChart />
      </Grid>
      <SuspiciousPatternsAlert />
      <AuditLogsTable />
      <ExportAuditButton />
    </DashboardTemplate>
  );
}
```

### 5. Feedback

#### `/dashboard/feedback` - Sistema de Feedback

```typescript
// app/(dashboard)/feedback/page.tsx
"use client";

export default function FeedbackPage() {
  return (
    <DashboardTemplate>
      <Tabs>
        <TabPanel value="send">
          <FeedbackForm />
        </TabPanel>
        <TabPanel value="view">
          <MyFeedbackList />
        </TabPanel>
        <TabPanel value="stats">
          <FeedbackStatistics />
        </TabPanel>
      </Tabs>
    </DashboardTemplate>
  );
}
```

### 6. Evaluaciones (Staff)

#### `/dashboard/admin/evaluations` - Evaluar Usuarios

```typescript
// app/(dashboard)/admin/evaluations/page.tsx
"use client";

export default function EvaluationsPage() {
  return (
    <DashboardTemplate>
      <PageHeader
        title="Evaluaciones de Usuarios"
        actions={<CreateEvaluationButton />}
      />
      <EvaluationsFilter />
      <EvaluationsTable />
    </DashboardTemplate>
  );
}
```

---

## 🧩 Componentes Clave

### Atoms & Molecules

```typescript
// components/atoms/StatCard/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}

// components/molecules/DateRangeSelector/DateRangeSelector.tsx
interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
}

// components/molecules/ChartCard/ChartCard.tsx
interface ChartCardProps {
  title: string;
  type: "line" | "bar" | "pie" | "area" | "heatmap";
  data: ChartData;
  isLoading?: boolean;
}
```

### Organisms

```typescript
// components/organisms/ReportGenerator/ReportGenerator.tsx
interface ReportGeneratorProps {
  reportType: ReportType;
  onGenerate: (config: ReportConfig) => void;
  onCancel: () => void;
}

// components/organisms/UsageTrendsChart/UsageTrendsChart.tsx
interface UsageTrendsChartProps {
  dateRange: DateRange;
  groupBy: "day" | "week" | "month";
  resourceTypes?: string[];
}

// components/organisms/OccupancyHeatmap/OccupancyHeatmap.tsx
interface OccupancyHeatmapProps {
  data: OccupancyData[];
  view: "daily" | "weekly";
}

// components/organisms/FeedbackForm/FeedbackForm.tsx
interface FeedbackFormProps {
  reservationId?: string;
  resourceId?: string;
  onSubmit: (feedback: CreateFeedbackDto) => void;
}

// components/organisms/AuditLogsTable/AuditLogsTable.tsx
interface AuditLogsTableProps {
  logs: AuditLog[];
  filters?: AuditFilters;
  onFilterChange: (filters: AuditFilters) => void;
  onExport: () => void;
}
```

---

## 🗄️ Store y Estado

### Reports Slice

```typescript
// store/slices/reportsSlice.ts
interface ReportsState {
  generatedReports: Report[];
  activeFilters: ReportFilters;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    setDashboardData: (state, action) => {
      state.dashboardData = action.payload;
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = action.payload;
    },
    addGeneratedReport: (state, action) => {
      state.generatedReports.push(action.payload);
    },
  },
});
```

### RTK Query API

```typescript
// store/api/reportsApi.ts
export const reportsApi = createApi({
  reducerPath: "reportsApi",
  endpoints: (builder) => ({
    getDashboardOverview: builder.query<DashboardData, void>({
      query: () => "/dashboard/overview",
    }),
    generateUsageReport: builder.mutation<Report, GenerateReportDto>({
      query: (data) => ({
        url: "/usage-reports/generate",
        method: "POST",
        body: data,
      }),
    }),
    exportReport: builder.mutation<ExportJob, ExportReportDto>({
      query: (data) => ({
        url: "/reports/export",
        method: "POST",
        body: data,
      }),
    }),
    getFeedback: builder.query<PaginatedResponse<Feedback>, QueryFeedbackDto>({
      query: (params) => ({
        url: "/feedback",
        params,
      }),
      providesTags: ["Feedback"],
    }),
    submitFeedback: builder.mutation<Feedback, CreateFeedbackDto>({
      query: (data) => ({
        url: "/feedback",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Feedback"],
    }),
    getAuditLogs: builder.query<PaginatedResponse<AuditLog>, AuditFilters>({
      query: (params) => ({
        url: "/audit",
        params,
      }),
      providesTags: ["Audit"],
    }),
    exportAuditLogs: builder.mutation<Blob, AuditExportDto>({
      query: (params) => ({
        url: "/audit/export/csv",
        method: "GET",
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGenerateUsageReportMutation,
  useExportReportMutation,
  useGetFeedbackQuery,
  useSubmitFeedbackMutation,
  useGetAuditLogsQuery,
  useExportAuditLogsMutation,
} = reportsApi;
```

---

## 📐 Tipos TypeScript

```typescript
// types/api/reports.ts

export interface DashboardData {
  overview: {
    totalReservations: number;
    activeReservations: number;
    occupancyRate: number;
    availableResources: number;
  };
  charts: {
    usage: ChartData;
    occupancy: ChartData;
    trends: ChartData;
  };
  upcomingReservations: Reservation[];
  alerts: SystemAlert[];
  recentActivity: Activity[];
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  description?: string;
  filters: ReportFilters;
  metrics: ReportMetric[];
  generatedAt: string;
  generatedBy: string;
  format: "PDF" | "CSV" | "EXCEL" | "JSON";
  url?: string;
  status: "GENERATING" | "COMPLETED" | "FAILED";
}

export enum ReportType {
  USAGE_BY_RESOURCE = "USAGE_BY_RESOURCE",
  USAGE_BY_PROGRAM = "USAGE_BY_PROGRAM",
  USAGE_BY_PERIOD = "USAGE_BY_PERIOD",
  USER_ACTIVITY = "USER_ACTIVITY",
  OCCUPANCY = "OCCUPANCY",
  DEMAND_UNMET = "DEMAND_UNMET",
  CUSTOM = "CUSTOM",
}

export interface ReportFilters {
  dateRange: DateRange;
  resourceIds?: string[];
  programIds?: string[];
  userIds?: string[];
  resourceTypes?: string[];
  statuses?: string[];
}

export interface Feedback {
  id: string;
  reservationId?: string;
  resourceId?: string;
  userId: string;
  rating: number;
  category: FeedbackCategory;
  comment?: string;
  isAnonymous: boolean;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
}

export enum FeedbackCategory {
  RESOURCE_QUALITY = "RESOURCE_QUALITY",
  SERVICE = "SERVICE",
  TECHNICAL_ISSUE = "TECHNICAL_ISSUE",
  SUGGESTION = "SUGGESTION",
  COMPLAINT = "COMPLAINT",
  OTHER = "OTHER",
}

export interface Evaluation {
  id: string;
  userId: string;
  evaluatedBy: string;
  rating: number;
  metrics: EvaluationMetric[];
  comments?: string;
  evaluatedAt: string;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
}
```

---

## 🎯 Casos de Uso Principales

### 1. Generar Reporte de Uso

```typescript
export const useReportGeneration = () => {
  const [generateReport] = useGenerateUsageReportMutation();

  const generate = async (config: GenerateReportDto) => {
    try {
      const report = await generateReport(config).unwrap();

      // Poll status si es reporte pesado
      if (report.data.status === "GENERATING") {
        await pollReportStatus(report.data.id);
      }

      return { success: true, report: report.data };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { generate };
};
```

### 2. Dashboard en Tiempo Real

```typescript
export const useLiveDashboard = () => {
  const { data, refetch } = useGetDashboardOverviewQuery(undefined, {
    pollingInterval: 30000, // Actualizar cada 30 segundos
  });

  useEffect(() => {
    // Suscribirse a WebSocket para actualizaciones en tiempo real
    const socket = useWebSocket();
    socket.on("dashboard:update", () => {
      refetch();
    });

    return () => socket.off("dashboard:update");
  }, [refetch]);

  return {
    overview: data?.data.overview,
    charts: data?.data.charts,
    alerts: data?.data.alerts,
    recentActivity: data?.data.recentActivity,
  };
};
```

### 3. Exportar Reporte

```typescript
export const useReportExport = () => {
  const [exportReport] = useExportReportMutation();

  const exportToFile = async (
    reportId: string,
    format: "CSV" | "EXCEL" | "PDF"
  ) => {
    try {
      const job = await exportReport({ reportId, format }).unwrap();

      // Poll hasta completar
      const result = await pollExportJob(job.data.id);

      // Descargar archivo
      const blob = await downloadFile(result.downloadUrl);
      saveAs(blob, `report-${reportId}.${format.toLowerCase()}`);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { exportToFile };
};
```

### 4. Enviar Feedback

```typescript
export const useFeedbackSubmission = () => {
  const [submitFeedback] = useSubmitFeedbackMutation();

  const submit = async (data: CreateFeedbackDto) => {
    try {
      const result = await submitFeedback(data).unwrap();

      // Mostrar confirmación
      toast.success("¡Gracias por tu feedback!");

      return { success: true, feedback: result.data };
    } catch (error) {
      toast.error("Error al enviar feedback");
      return { success: false, error };
    }
  };

  return { submit };
};
```

---

## 📊 Visualizaciones con Chart.js / Recharts

### Configuración de Gráficos

```typescript
// lib/charts/config.ts
import { ChartOptions } from "chart.js";

export const lineChartOptions: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Uso de Recursos",
    },
  },
};

export const heatmapOptions = {
  // Configuración para mapa de calor de ocupación
};
```

---

## ✅ Checklist de Implementación

### Dashboard

- [ ] Vista general con estadísticas
- [ ] Gráficos de uso y ocupación
- [ ] Widget de próximas reservas
- [ ] Alertas del sistema
- [ ] Actividad reciente
- [ ] Actualización en tiempo real

### Reportes

- [ ] Generador de reportes con wizard
- [ ] Reportes de uso por recurso
- [ ] Reportes por programa
- [ ] Reportes por período
- [ ] Reportes de usuarios
- [ ] Demanda insatisfecha
- [ ] Exportación CSV/Excel/PDF
- [ ] Programar reportes recurrentes

### Análisis

- [ ] Gráfico de tendencias
- [ ] Mapa de calor de ocupación
- [ ] Top recursos más usados
- [ ] Horas pico
- [ ] Proyección de demanda
- [ ] Análisis comparativo

### Feedback

- [ ] Formulario de feedback
- [ ] Rating de recursos
- [ ] Categorización de feedback
- [ ] Ver mi feedback enviado
- [ ] Estadísticas de feedback
- [ ] Panel de administración

### Evaluaciones

- [ ] Evaluar usuarios
- [ ] Ver evaluaciones recibidas
- [ ] Métricas de evaluación
- [ ] Historial de evaluaciones
- [ ] Reportes de evaluaciones

### Exportaciones

- [ ] Exportar a CSV
- [ ] Exportar a Excel
- [ ] Exportar a PDF
- [ ] Exportar a JSON
- [ ] Estado de exportación
- [ ] Cola de exportaciones

---

**Anterior**: [04_STOCKPILE_SERVICE.md](./04_STOCKPILE_SERVICE.md)  
**Próximo**: [06_API_GATEWAY.md](./06_API_GATEWAY.md)
