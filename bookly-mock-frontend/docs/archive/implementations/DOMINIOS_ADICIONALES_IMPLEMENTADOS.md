# ✅ Dominios Adicionales Implementados - React Query

**Fecha**: 21 de Noviembre 2025, 01:08  
**Estado**: ✅ Completado

---

## 🎯 Objetivo

Completar la implementación de los 4 dominios adicionales que quedaron pendientes en la estructura de hooks React Query, manteniendo el patrón establecido y la organización por dominio.

---

## 📦 Dominios Implementados

### 6. **Waitlist Domain** ⏳ (Lista de Espera)

**Archivo**: `hooks/mutations/useWaitlistMutations.ts`

**Hooks (5)**:

- ✅ `useAddToWaitlist()` - Agregar usuario a lista de espera
- ✅ `useRemoveFromWaitlist()` - Remover de lista de espera
- ✅ `useNotifyWaitlist()` - Notificar disponibilidad
- ✅ `useUpdateWaitlistPriority()` - Actualizar prioridad
- ✅ `useAcceptWaitlistOffer()` - Aceptar oferta

**DTOs**:

```typescript
interface AddToWaitlistDto {
  resourceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  notifyMethod?: "EMAIL" | "SMS" | "WHATSAPP" | "ALL";
}
```

**Casos de Uso**:

- Recurso no disponible → Usuario se une a lista de espera
- Recurso se libera → Sistema notifica automáticamente
- Usuario acepta oferta → Se crea reserva automáticamente
- Coordinador ajusta prioridades según necesidad

**Cache Keys**:

```typescript
waitlistKeys = {
  all: ["waitlist"],
  lists: () => ["waitlist", "list"],
  byResource: (resourceId) => ["waitlist", "resource", resourceId],
  byUser: (userId) => ["waitlist", "user", userId],
};
```

---

### 7. **Approvals Domain** ✅ (Aprobaciones)

**Archivo**: `hooks/mutations/useApprovalMutations.ts`

**Hooks (5)**:

- ✅ `useApproveReservation()` - Aprobar reserva
- ✅ `useRejectReservation()` - Rechazar reserva
- ✅ `useRequestAdditionalInfo()` - Solicitar más información
- ✅ `useReassignApproval()` - Reasignar aprobador
- ✅ `useBatchApprove()` - Aprobación masiva

**DTOs**:

```typescript
interface ApproveReservationDto {
  reservationId: string;
  approvedBy: string;
  comments?: string;
  conditions?: string[];
  generateDocument?: boolean; // Carta de aprobación PDF
}

interface RejectReservationDto {
  reservationId: string;
  rejectedBy: string;
  reason: string;
  suggestAlternative?: {
    resourceId?: string;
    startDate?: string;
    endDate?: string;
  };
}
```

**Casos de Uso**:

- Coordinador revisa solicitudes pendientes
- Aprueba con condiciones específicas
- Rechaza sugiriendo recurso alternativo
- Solicita información adicional antes de decidir
- Aprobación masiva para eventos institucionales
- Delega aprobación a otro coordinador

**Integración**:

- Invalida cache de `reservationKeys` al aprobar/rechazar
- Actualiza historial de aprobaciones
- Puede generar documento PDF automáticamente

---

### 8. **Reports Domain** 📊 (Reportes)

**Archivo**: `hooks/mutations/useReportMutations.ts`

**Hooks (7)**:

- ✅ `useGenerateReport()` - Generar reporte
- ✅ `useExportReport()` - Exportar en formato específico
- ✅ `useDeleteReport()` - Eliminar reporte
- ✅ `useScheduleReport()` - Programar reporte automático
- ✅ `useUpdateScheduledReport()` - Actualizar programación
- ✅ `useDeleteScheduledReport()` - Eliminar programación
- ✅ `useShareReport()` - Compartir por email

**DTOs**:

```typescript
interface GenerateReportDto {
  type: "USAGE" | "USERS" | "RESOURCES" | "DEMAND" | "FEEDBACK" | "CUSTOM";
  startDate: string;
  endDate: string;
  filters?: {
    resourceIds?: string[];
    userIds?: string[];
    programIds?: string[];
    status?: string[];
  };
  groupBy?: "DAY" | "WEEK" | "MONTH" | "RESOURCE" | "USER" | "PROGRAM";
  includeCharts?: boolean;
  includeRawData?: boolean;
}

interface ScheduleReportDto {
  name: string;
  reportConfig: GenerateReportDto;
  schedule: {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
  recipients: string[];
  format: "PDF" | "EXCEL";
}
```

**Casos de Uso**:

- Generar reporte de uso mensual
- Exportar en PDF/CSV/Excel
- Programar reportes automáticos (ej: cada lunes a las 8am)
- Compartir reporte con administradores por email
- Analizar demanda insatisfecha
- Reportes de feedback de usuarios

**Formatos Soportados**:

- PDF (con gráficos)
- CSV (datos crudos)
- Excel (tablas formateadas)
- JSON (para integración)

---

### 9. **Maintenance Domain** 🔧 (Mantenimiento)

**Archivo**: `hooks/mutations/useMaintenanceMutations.ts`

**Hooks (7)**:

- ✅ `useCreateMaintenance()` - Crear/programar mantenimiento
- ✅ `useUpdateMaintenance()` - Actualizar mantenimiento
- ✅ `useCompleteMaintenance()` - Completar mantenimiento
- ✅ `useCancelMaintenance()` - Cancelar mantenimiento
- ✅ `useRescheduleMaintenance()` - Reprogramar mantenimiento
- ✅ `useAssignTechnician()` - Asignar técnico
- ✅ `useReportMaintenanceIncident()` - Reportar incidencia

**DTOs**:

```typescript
interface CreateMaintenanceDto {
  resourceId: string;
  type: "PREVENTIVO" | "CORRECTIVO" | "EMERGENCIA" | "LIMPIEZA";
  startDate: string;
  endDate: string;
  estimatedDuration?: number; // Minutos
  description: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  assignedTo?: string; // ID del técnico
  requiredParts?: string[];
  cost?: number;
}

interface CompleteMaintenanceDto {
  maintenanceId: string;
  completedBy: string;
  completionDate: string;
  actualDuration: number;
  actualCost?: number;
  partsUsed?: string[];
  workPerformed: string;
  resourceCondition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  followUpRequired: boolean;
  followUpDate?: string;
}
```

**Casos de Uso**:

- Programar mantenimiento preventivo trimestral
- Registrar mantenimiento correctivo urgente
- Completar mantenimiento con detalles (piezas, costos)
- Reprogramar por conflicto de agenda
- Asignar técnico especializado
- Reportar incidencia encontrada durante mantenimiento
- Marcar recurso como "Requiere seguimiento"

**Tipos de Mantenimiento**:

- **PREVENTIVO**: Revisión programada regular
- **CORRECTIVO**: Reparación de falla detectada
- **EMERGENCIA**: Atención inmediata urgente
- **LIMPIEZA**: Mantenimiento de higiene

**Integración**:

- Invalida `resourceKeys` al crear/completar
- Actualiza disponibilidad del recurso
- Registra historial completo

---

## 📊 Estadísticas Totales

### Archivos Creados (4):

1. ✅ `hooks/mutations/useWaitlistMutations.ts` (~250 líneas)
2. ✅ `hooks/mutations/useApprovalMutations.ts` (~300 líneas)
3. ✅ `hooks/mutations/useReportMutations.ts` (~290 líneas)
4. ✅ `hooks/mutations/useMaintenanceMutations.ts` (~330 líneas)

**Total Nuevo**: ~1,170 líneas de código

### Archivos Modificados (1):

5. ✅ `hooks/mutations/index.ts` - Agregadas exportaciones

### Hooks Totales por Dominio:

| Dominio         | Queries | Mutations | Total  |
| --------------- | ------- | --------- | ------ |
| Reservations    | 3       | 4         | 7      |
| Resources       | 4       | 5         | 9      |
| Categories      | 0       | 3         | 3      |
| Programs        | 0       | 4         | 4      |
| Users           | 0       | 4         | 4      |
| **Waitlist**    | **0**   | **5**     | **5**  |
| **Approvals**   | **0**   | **5**     | **5**  |
| **Reports**     | **0**   | **7**     | **7**  |
| **Maintenance** | **0**   | **7**     | **7**  |
| **TOTAL**       | **7**   | **44**    | **51** |

---

## 🎯 Estructura Final Completa

```
src/hooks/
├── mutations/                           # 44 MUTATIONS
│   ├── index.ts                        # ← Exportación centralizada
│   ├── useReservationMutations.ts      # 4 hooks
│   ├── useResourceMutations.ts         # 5 hooks
│   ├── useCategoryMutations.ts         # 3 hooks
│   ├── useProgramMutations.ts          # 4 hooks
│   ├── useUserMutations.ts             # 4 hooks
│   ├── useWaitlistMutations.ts         # 5 hooks ⭐ NUEVO
│   ├── useApprovalMutations.ts         # 5 hooks ⭐ NUEVO
│   ├── useReportMutations.ts           # 7 hooks ⭐ NUEVO
│   └── useMaintenanceMutations.ts      # 7 hooks ⭐ NUEVO
│
├── useReservations.ts                  # 3 queries
├── useResources.ts                     # 4 queries
├── useAuth.ts
├── usePermissions.ts
└── ... (otros hooks)

Total: 9 dominios, 51 hooks
```

---

## 🚀 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Lista de Espera

```typescript
"use client";

import {
  useAddToWaitlist,
  useAcceptWaitlistOffer
} from "@/hooks/mutations";

export function WaitlistFlow() {
  const addToWaitlist = useAddToWaitlist();
  const acceptOffer = useAcceptWaitlistOffer();

  // Usuario intenta reservar recurso ocupado
  const handleResourceNotAvailable = (resourceId: string) => {
    addToWaitlist.mutate({
      resourceId,
      userId: "current-user",
      startDate: "2025-12-01T09:00",
      endDate: "2025-12-01T11:00",
      priority: "HIGH",
      notifyMethod: "EMAIL"
    }, {
      onSuccess: () => {
        console.log("Agregado a lista de espera");
      }
    });
  };

  // Usuario recibe notificación y acepta
  const handleAcceptOffer = (waitlistId: string) => {
    acceptOffer.mutate(waitlistId, {
      onSuccess: () => {
        // Reserva creada automáticamente
        console.log("Reserva confirmada");
      }
    });
  };

  return <div>{/* UI */}</div>;
}
```

### Ejemplo 2: Flujo de Aprobación

```typescript
import {
  useApproveReservation,
  useRejectReservation
} from "@/hooks/mutations";

export function ApprovalDashboard() {
  const approve = useApproveReservation();
  const reject = useRejectReservation();

  const handleApprove = (reservationId: string) => {
    approve.mutate({
      reservationId,
      approvedBy: "coord-123",
      comments: "Aprobada para evento académico",
      generateDocument: true // Genera PDF
    });
  };

  const handleReject = (reservationId: string) => {
    reject.mutate({
      reservationId,
      rejectedBy: "coord-123",
      reason: "Conflicto con evento institucional",
      suggestAlternative: {
        resourceId: "resource-456",
        startDate: "2025-12-02T09:00"
      }
    });
  };

  return <div>{/* Lista de aprobaciones */}</div>;
}
```

### Ejemplo 3: Generación de Reportes

```typescript
import {
  useGenerateReport,
  useExportReport
} from "@/hooks/mutations";

export function ReportsPage() {
  const generate = useGenerateReport();
  const exportReport = useExportReport();

  const handleGenerateMonthlyReport = () => {
    generate.mutate({
      type: "USAGE",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      groupBy: "DAY",
      includeCharts: true
    }, {
      onSuccess: (report) => {
        // Exportar automáticamente
        exportReport.mutate({
          reportId: report.id,
          format: "PDF",
          language: "es"
        });
      }
    });
  };

  return <div>{/* UI */}</div>;
}
```

### Ejemplo 4: Gestión de Mantenimiento

```typescript
import {
  useCreateMaintenance,
  useCompleteMaintenance
} from "@/hooks/mutations";

export function MaintenancePage() {
  const create = useCreateMaintenance();
  const complete = useCompleteMaintenance();

  const handleScheduleMaintenance = () => {
    create.mutate({
      resourceId: "resource-123",
      type: "PREVENTIVO",
      startDate: "2025-12-01T08:00",
      endDate: "2025-12-01T12:00",
      description: "Revisión trimestral",
      priority: "MEDIUM",
      assignedTo: "tech-456"
    });
  };

  const handleComplete = (maintenanceId: string) => {
    complete.mutate({
      maintenanceId,
      completedBy: "tech-456",
      completionDate: "2025-12-01T11:30",
      actualDuration: 210, // 3.5 horas
      workPerformed: "Limpieza completa, cambio de filtros",
      resourceCondition: "EXCELLENT",
      followUpRequired: false
    });
  };

  return <div>{/* UI */}</div>;
}
```

---

## ✅ Beneficios de los Nuevos Dominios

### Waitlist

- ✅ Gestión automática de lista de espera
- ✅ Notificaciones inteligentes
- ✅ Priorización flexible
- ✅ Conversión automática a reserva

### Approvals

- ✅ Flujo de aprobación estructurado
- ✅ Trazabilidad completa
- ✅ Generación automática de documentos
- ✅ Sugerencias de alternativas
- ✅ Aprobación masiva

### Reports

- ✅ Reportes personalizables
- ✅ Múltiples formatos de exportación
- ✅ Programación automática
- ✅ Compartición por email
- ✅ Análisis de demanda

### Maintenance

- ✅ Programación preventiva
- ✅ Gestión de emergencias
- ✅ Seguimiento de costos
- ✅ Historial completo
- ✅ Asignación de técnicos
- ✅ Reportes de incidencias

---

## 🎉 Resultado Final

**9 dominios completamente implementados**:

- ✅ Reservations (4 mutations)
- ✅ Resources (5 mutations)
- ✅ Categories (3 mutations)
- ✅ Programs (4 mutations)
- ✅ Users (4 mutations)
- ✅ Waitlist (5 mutations) ⭐
- ✅ Approvals (5 mutations) ⭐
- ✅ Reports (7 mutations) ⭐
- ✅ Maintenance (7 mutations) ⭐

**44 hooks de mutations** listos para usar  
**7 hooks de queries** existentes  
**~2,300 líneas** de código React Query  
**TypeScript completo** con DTOs  
**Cache inteligente** con invalidación automática  
**Patrón consistente** y escalable  
**DDD aplicado** correctamente

---

**🚀 Sistema completo de hooks React Query por dominio! Listo para implementar cualquier funcionalidad de Bookly. ✨📁🎯**
