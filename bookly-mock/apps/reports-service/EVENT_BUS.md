# 🔄 Event Bus - Reports Service

## 📋 Información General

**Servicio**: `reports-service`  
**Responsabilidad**: Generación de reportes, dashboards, feedback y análisis  
**Versión**: 1.0.0

---

## 📤 Eventos Publicados (3 eventos)

### 1. REPORT_GENERATED
**Cuándo**: Al generar un reporte

**Payload**:
```typescript
interface ReportGeneratedPayload {
  reportId: string;
  reportType: 'usage' | 'user_activity' | 'demand' | 'feedback' | 'custom';
  title: string;
  generatedBy: string;
  fileUrl?: string;
  filters?: Record<string, any>;
  dateRange?: { startDate: Date; endDate: Date };
}
```

**Consumidores**: notificaciones, administradores

---

### 2. FEEDBACK_SUBMITTED
**Cuándo**: Al enviar feedback sobre un recurso o servicio

**Payload**:
```typescript
interface FeedbackSubmittedPayload {
  feedbackId: string;
  userId: string;
  resourceId?: string;
  reservationId?: string;
  rating: number;
  comment?: string;
  category: 'resource' | 'service' | 'platform' | 'other';
}
```

**Consumidores**: `resources-service` (actualizar calificación), administradores

---

### 3. DASHBOARD_UPDATED
**Cuándo**: Al actualizar métricas de un dashboard

**Payload**:
```typescript
interface DashboardUpdatedPayload {
  dashboardId: string;
  dashboardType: 'admin' | 'user' | 'resource' | 'analytics';
  metrics: Record<string, any>;
  updatedBy: string;
  lastRefresh: Date;
}
```

**Consumidores**: frontend (actualizar vista), cache

---

## 📥 Eventos Consumidos

Este servicio consume eventos de TODOS los demás servicios para generar reportes y análisis:

### De `auth-service`:
- **USER_REGISTERED**: Registrar nuevo usuario en analytics
- **USER_LOGGED_IN**: Tracking de actividad
- **ROLE_ASSIGNED**: Auditoría de permisos

### De `resources-service`:
- **RESOURCE_CREATED**: Tracking de inventario
- **RESOURCE_DELETED**: Análisis de recursos eliminados
- **MAINTENANCE_COMPLETED**: Reportes de mantenimiento

### De `availability-service`:
- **RESERVATION_CREATED**: Análisis de demanda
- **RESERVATION_CANCELLED**: Tasa de cancelación
- **WAITING_LIST_ADDED**: Demanda insatisfecha

### De `stockpile-service`:
- **APPROVAL_GRANTED/REJECTED**: Métricas de aprobación
- **CHECK_OUT_COMPLETED**: Condición de recursos

---

## 🔧 Configuración del Event Bus

**Exchange**: `bookly.events`  
**Prefijo de routing keys**: `reports.*`

**Suscripciones**: Este servicio se suscribe a TODOS los eventos con pattern `#` para análisis completo.

### Routing Keys Publicadas

| Evento | Routing Key |
|--------|-------------|
| REPORT_GENERATED | `reports.report.generated` |
| FEEDBACK_SUBMITTED | `reports.feedback.submitted` |
| DASHBOARD_UPDATED | `reports.dashboard.updated` |

---

## 📊 Métricas y Monitoreo

### Reportes Automáticos Programados
- **Diario**: Resumen de reservas y uso de recursos
- **Semanal**: Análisis de demanda y feedback
- **Mensual**: Reportes ejecutivos y tendencias

### Alertas Recomendadas
- ⚠️ `FEEDBACK_SUBMITTED` con rating < 2
- ⚠️ Caída en uso de recursos (comparado con promedio)

---

**Última actualización**: 1 de diciembre de 2024
