# 📊 Dashboard de Auditoría - Especificación Técnica

**Fecha**: 19 de noviembre de 2025  
**Estado**: 📋 Especificación completa  
**Versión**: 1.0

---

## 🎯 Objetivo

Crear un dashboard web interactivo para consultar, visualizar y exportar registros de auditoría del sistema Bookly.

---

## 🏗️ Arquitectura

### **Stack Tecnológico Recomendado**

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Componentes**: shadcn/ui + Radix UI
- **Estilos**: TailwindCSS
- **Estado**: Zustand o Redux Toolkit
- **Data Fetching**: SWR o React Query
- **Tablas**: TanStack Table (React Table v8)
- **Gráficos**: Recharts o Chart.js
- **Fechas**: date-fns
- **Iconos**: Lucide React
- **Formularios**: React Hook Form + Zod

---

## 📡 API Endpoints (reports-service)

### **1. GET /api/v1/reports/audit**

Obtener registros de auditoría con filtros y paginación.

**Query Parameters**:

```typescript
interface AuditQueryParams {
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  serviceName?: string; // "auth-service" | "resources-service" | etc.
  action?: AuditAction; // "CREATED" | "UPDATED" | "DELETED" | etc.
  entityType?: string; // "USER" | "RESOURCE" | "RESERVATION"
  userId?: string;
  entityId?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  ip?: string;
  sortBy?: string; // default: "timestamp"
  sortOrder?: "asc" | "desc"; // default: "desc"
}
```

**Response**:

```typescript
interface AuditRecordsResponse {
  success: boolean;
  data: {
    records: IAuditRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

interface IAuditRecord {
  _id: string;
  entityId: string;
  entityType: string;
  action: AuditAction;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  userId: string;
  ip: string;
  userAgent: string;
  location?: string;
  timestamp: Date;
  serviceName: string;
  metadata?: Record<string, any>;
}
```

### **2. GET /api/v1/reports/audit/stats**

Obtener estadísticas de auditoría.

**Query Parameters**:

```typescript
interface AuditStatsParams {
  startDate?: string;
  endDate?: string;
  groupBy?: "service" | "action" | "user" | "date";
}
```

**Response**:

```typescript
interface AuditStatsResponse {
  success: boolean;
  data: {
    totalRecords: number;
    byService: Record<string, number>;
    byAction: Record<string, number>;
    byDay: Array<{ date: string; count: number }>;
    topUsers: Array<{ userId: string; count: number }>;
  };
}
```

### **3. GET /api/v1/reports/audit/:id**

Obtener detalle de un registro específico.

**Response**:

```typescript
interface AuditRecordDetailResponse {
  success: boolean;
  data: IAuditRecord;
}
```

### **4. POST /api/v1/reports/audit/export**

Exportar registros a CSV/Excel.

**Body**:

```typescript
interface ExportRequest {
  filters: AuditQueryParams;
  format: "csv" | "excel" | "json";
  fields?: string[]; // Campos específicos a exportar
}
```

**Response**: File download

---

## 🎨 Componentes del Dashboard

### **1. AuditDashboard** (Página Principal)

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Auditoría del Sistema                    [Usuario]  🔔  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Total Registros │  │ Hoy             │  │ Esta Semana  │ │
│  │                 │  │                 │  │              │ │
│  │   12,543  ↑15%  │  │    245    ↑8%   │  │  1,823  ↑12% │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [Filtros Avanzados ▼]                                  ││
│  │                                                         ││
│  │  Servicio: [Todos ▼]  Acción: [Todas ▼]  Usuario: [...] ││
│  │  Desde: [📅]  Hasta: [📅]  IP: [...]                    ││
│  │                                                         ││
│  │  [🔍 Buscar]  [🔄 Limpiar]  [📥 Exportar]               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Gráfico de Actividad (Últimos 7 días)                  ││
│  │  ┌─────────────────────────────────────────────────┐    ││
│  │  │     ▃                                           │    ││
│  │  │   ▃ █ ▅   ▃                                     │    ││
│  │  │ ▂ █ █ █ ▅ █ ▃                                   │    ││
│  │  │ █ █ █ █ █ █ █                                   │    ││
│  │  └─────────────────────────────────────────────────┘    ││
│  │    L  M  M  J  V  S  D                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Tabla de Registros        [10 ▼] por página   1 de 125 ││
│  ├──────┬─────────┬──────────┬────────┬─────────┬──────────┤│
│  │Fecha │Servicio │Acción    │Entidad │Usuario  │IP        ││
│  ├──────┼─────────┼──────────┼────────┼─────────┼──────────┤│
│  │14:32 │auth     │LOGIN     │USER    │juan@... │192.168.. ││
│  │14:30 │resources│CREATED   │RESOURCE│admin@.. │10.0.0... ││
│  │14:28 │stockpile│APPROVED  │RESERVA.│maria@.. │172.16... ││
│  │...   │...      │...       │...     │...      │...       ││
│  └──────┴─────────┴──────────┴────────┴─────────┴──────────┘│
│                                                             │
│  [← Anterior]  [1] [2] [3] ... [125]  [Siguiente →]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **2. AuditFilters** (Componente de Filtros)

```typescript
interface AuditFiltersProps {
  filters: AuditQueryParams;
  onChange: (filters: AuditQueryParams) => void;
  onReset: () => void;
}

const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  // Implementación con React Hook Form
  // Campos: serviceName, action, entityType, userId, date range, IP
};
```

### **3. AuditTable** (Tabla de Registros)

```typescript
interface AuditTableProps {
  records: IAuditRecord[];
  loading: boolean;
  onRowClick: (record: IAuditRecord) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
}

const AuditTable: React.FC<AuditTableProps> = ({
  records,
  loading,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}) => {
  // Usar TanStack Table para:
  // - Sorting
  // - Paginación
  // - Columnas configurables
  // - Row selection
};
```

**Columnas**:

- Timestamp (fecha + hora)
- Servicio (badge con color)
- Acción (badge con color según tipo)
- Tipo de Entidad
- Usuario (con avatar)
- IP
- Acciones (Ver detalle, Comparar)

### **4. AuditRecordDetail** (Modal de Detalle)

```
┌─────────────────────────────────────────────────┐
│  Detalle de Registro de Auditoría          [X]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  📝 Información General                         │
│  ─────────────────────────────────────────      │
│  ID: 507f1f77bcf86cd799439011                   │
│  Fecha: 19/11/2025 14:32:45                     │
│  Servicio: auth-service                         │
│  Acción: LOGIN                                  │
│                                                 │
│  👤 Usuario                                     │
│  ─────────────────────────────────────────      │
│  ID: 507f1f77bcf86cd799439012                   │
│  Email: juan@ufps.edu.co                        │
│  IP: 192.168.1.100                              │
│  User-Agent: Mozilla/5.0...                     │
│  Ubicación: Cúcuta, Colombia                    │
│                                                 │
│  🔄 Cambios (Diff View)                         │
│  ─────────────────────────────────────────      │
│  ┌─────────────────┬────────────────────────┐   │
│  │ Antes           │ Después                │   │
│  ├─────────────────┼────────────────────────┤   │
│  │ {               │ {                      │   │
│  │   status: "inac"│   status: "active" ✓   │   │
│  │   lastLogin: nul│   lastLogin: "2025..." │   │
│  │ }               │ }                      │   │
│  └─────────────────┴────────────────────────┘   │
│                                                 │
│  📊 Metadata                                    │
│  ─────────────────────────────────────────      │
│  { "isProxy": true, "latency": "45ms" }         │
│                                                 │
│  [📥 Exportar JSON]  [📋 Copiar ID]  [Cerrar]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

```typescript
interface AuditRecordDetailProps {
  recordId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AuditRecordDetail: React.FC<AuditRecordDetailProps> = ({
  recordId,
  isOpen,
  onClose,
}) => {
  // Fetch detail
  // Show diff of beforeData vs afterData
  // Display metadata
  // Export options
};
```

### **5. AuditStats** (Estadísticas)

```typescript
interface AuditStatsProps {
  startDate: Date;
  endDate: Date;
}

const AuditStats: React.FC<AuditStatsProps> = ({ startDate, endDate }) => {
  // Cards con métricas
  // Gráficos de barras/líneas
  // Top usuarios
  // Distribución por servicio
};
```

### **6. AuditExport** (Exportación)

```typescript
interface AuditExportProps {
  filters: AuditQueryParams;
  onExport: (format: "csv" | "excel" | "json") => void;
}

const AuditExport: React.FC<AuditExportProps> = ({ filters, onExport }) => {
  // Selector de formato
  // Selector de campos
  // Botón de descarga
};
```

---

## 🎨 Código de Ejemplo

### **Servicio de API**

```typescript
// services/auditService.ts
import { apiClient } from "./apiClient";

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  serviceName?: string;
  action?: string;
  entityType?: string;
  userId?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  ip?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const auditService = {
  async getRecords(params: AuditQueryParams) {
    const response = await apiClient.get("/reports/audit", { params });
    return response.data;
  },

  async getRecordById(id: string) {
    const response = await apiClient.get(`/reports/audit/${id}`);
    return response.data;
  },

  async getStats(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }) {
    const response = await apiClient.get("/reports/audit/stats", { params });
    return response.data;
  },

  async exportRecords(
    filters: AuditQueryParams,
    format: "csv" | "excel" | "json"
  ) {
    const response = await apiClient.post(
      "/reports/audit/export",
      { filters, format },
      { responseType: "blob" }
    );

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-records-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
```

### **Hook Personalizado**

```typescript
// hooks/useAuditRecords.ts
import { useState, useEffect } from "react";
import useSWR from "swr";
import { auditService, AuditQueryParams } from "../services/auditService";

export function useAuditRecords(initialFilters: AuditQueryParams = {}) {
  const [filters, setFilters] = useState<AuditQueryParams>(initialFilters);

  const { data, error, isLoading, mutate } = useSWR(
    ["/audit/records", filters],
    () => auditService.getRecords(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 segundos
    }
  );

  const updateFilters = (newFilters: Partial<AuditQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    records: data?.data?.records || [],
    total: data?.data?.total || 0,
    page: data?.data?.page || 1,
    totalPages: data?.data?.totalPages || 1,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    error,
    refresh: mutate,
  };
}
```

### **Página Principal**

```typescript
// app/audit/page.tsx
"use client";

import { useState } from "react";
import { AuditFilters } from "@/components/audit/AuditFilters";
import { AuditTable } from "@/components/audit/AuditTable";
import { AuditStats } from "@/components/audit/AuditStats";
import { AuditRecordDetail } from "@/components/audit/AuditRecordDetail";
import { useAuditRecords } from "@/hooks/useAuditRecords";

export default function AuditDashboardPage() {
  const {
    records,
    total,
    page,
    totalPages,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    refresh,
  } = useAuditRecords({ page: 1, limit: 20, sortOrder: "desc" });

  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleRowClick = (record: IAuditRecord) => {
    setSelectedRecordId(record._id);
    setDetailOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage });
  };

  const handleSort = (column: string) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === "asc"
      ? "desc"
      : "asc";
    updateFilters({ sortBy: column, sortOrder: newOrder });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">📊 Auditoría del Sistema</h1>

      <AuditStats startDate={filters.startDate} endDate={filters.endDate} />

      <AuditFilters
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      <AuditTable
        records={records}
        loading={isLoading}
        onRowClick={handleRowClick}
        sortBy={filters.sortBy || "timestamp"}
        sortOrder={filters.sortOrder || "desc"}
        onSort={handleSort}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {selectedRecordId && (
        <AuditRecordDetail
          recordId={selectedRecordId}
          isOpen={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setSelectedRecordId(null);
          }}
        />
      )}
    </div>
  );
}
```

---

## 🎨 Estilos y UX

### **Colores por Tipo de Acción**

```typescript
export const actionColors: Record<AuditAction, string> = {
  CREATED: "bg-green-100 text-green-800",
  UPDATED: "bg-blue-100 text-blue-800",
  DELETED: "bg-red-100 text-red-800",
  LOGIN: "bg-purple-100 text-purple-800",
  LOGOUT: "bg-gray-100 text-gray-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-orange-100 text-orange-800",
  ACCESSED: "bg-indigo-100 text-indigo-800",
  IMPORTED: "bg-cyan-100 text-cyan-800",
  EXPORTED: "bg-teal-100 text-teal-800",
};
```

### **Íconos por Tipo de Acción**

```typescript
import {
  Plus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Check,
  X,
  Ban,
  Eye,
  Download,
  Upload,
} from "lucide-react";

export const actionIcons: Record<AuditAction, typeof Plus> = {
  CREATED: Plus,
  UPDATED: Edit,
  DELETED: Trash2,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  APPROVED: Check,
  REJECTED: X,
  CANCELLED: Ban,
  ACCESSED: Eye,
  IMPORTED: Upload,
  EXPORTED: Download,
};
```

---

## 🔐 Seguridad

1. **Autenticación**: Solo usuarios con rol `GENERAL_ADMIN` o `REPORTS_VIEWER` pueden acceder
2. **Autorización**: Filtrar registros según permisos del usuario
3. **Rate Limiting**: Limitar requests a la API
4. **Sanitización**: Escapar HTML en campos de texto
5. **Encriptación**: HTTPS obligatorio

---

## 📊 Métricas de Rendimiento

- **Tiempo de carga inicial**: < 2 segundos
- **Tiempo de filtrado**: < 500ms
- **Paginación**: Lazy loading con scroll infinito opcional
- **Exportación**: Máximo 10,000 registros por export
- **Cache**: 30 segundos para datos no críticos

---

## 🚀 Funcionalidades Adicionales (Futuro)

1. **Real-time Updates**: WebSocket para ver registros en tiempo real
2. **Alertas**: Configurar alertas por patrones sospechosos
3. **Machine Learning**: Detección de anomalías
4. **Gráficos Avanzados**: Heatmaps, mapas geográficos
5. **Comparación**: Comparar múltiples registros
6. **Timeline**: Vista de línea de tiempo por usuario/entidad
7. **Favoritos**: Guardar filtros frecuentes
8. **Notas**: Agregar comentarios a registros

---

## 📚 Referencias

- [TanStack Table](https://tanstack.com/table/v8)
- [shadcn/ui](https://ui.shadcn.com/)
- [SWR](https://swr.vercel.app/)
- [Recharts](https://recharts.org/)
- [React Hook Form](https://react-hook-form.com/)

---

**Última actualización**: 19 de noviembre de 2025  
**Estado**: ✅ **Especificación completa lista para implementación**
