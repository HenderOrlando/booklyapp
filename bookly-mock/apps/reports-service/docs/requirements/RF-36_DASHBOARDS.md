# RF-36: Dashboards Interactivos en Tiempo Real

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Proporciona dashboards interactivos con métricas en tiempo real sobre uso de recursos, ocupación, tendencias y KPIs del sistema. Permite a los administradores tomar decisiones informadas basadas en datos actualizados.

---

## ✅ Criterios de Aceptación

- [x] Dashboard general con KPIs principales
- [x] Gráficos de ocupación en tiempo real
- [x] Tendencias de uso por período
- [x] Comparativas entre recursos y programas
- [x] Actualización automática de métricas
- [x] Filtros interactivos por fecha, recurso, programa
- [x] Exportación de gráficos
- [x] Dashboards responsivos

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `DashboardController` - Endpoints de dashboard

**Services**:

- `DashboardService` - Generación de métricas
- `MetricsAggregationService` - Agregación de datos
- `TrendAnalysisService` - Análisis de tendencias

**Repositories**:

- `DashboardMetricRepository` - Métricas persistidas
- `UsageStatisticRepository` - Datos de uso

**Queries** (CQRS):

- `GetDashboardOverviewQuery` - Vista general
- `GetOccupancyMetricsQuery` - Métricas de ocupación
- `GetTrendAnalysisQuery` - Análisis de tendencias
- `GetResourceComparisonQuery` - Comparativa de recursos

---

### Endpoints Creados

```http
GET    /api/v1/dashboard/overview            # Vista general
GET    /api/v1/dashboard/occupancy           # Ocupación
GET    /api/v1/dashboard/trends              # Tendencias
GET    /api/v1/dashboard/comparison          # Comparativas
GET    /api/v1/dashboard/kpis                # KPIs principales
```

**Query Parameters**:

- `period` - Período (today, week, month, quarter, year)
- `resourceType` - Filtrar por tipo de recurso
- `program` - Filtrar por programa
- `refresh` - Forzar actualización

**Response Example** (GET /overview):

```json
{
  "kpis": {
    "totalReservations": 1250,
    "activeUsers": 320,
    "averageOccupancy": 75.5,
    "satisfactionRate": 4.4
  },
  "occupancyTrend": [
    { "date": "2024-01-01", "rate": 72 },
    { "date": "2024-01-02", "rate": 78 }
  ],
  "topResources": [
    { "name": "Lab Sistemas 1", "usage": 90 },
    { "name": "Auditorio Principal", "usage": 85 }
  ],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

**Permisos Requeridos**:

- `dashboard:view` - Ver dashboards (admin, program_admin)

---

### Eventos Publicados

- `DashboardRefreshedEvent` - Dashboard actualizado

**Routing Keys**:

- `reports.dashboard.refreshed`

---

## 🗄️ Base de Datos

### Entidades

**DashboardMetric**:

```prisma
model DashboardMetric {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId

  metricType    String   // total_reservations, active_users, occupancy_rate
  value         Float
  metadata      Json?

  period        String   // hourly, daily, weekly, monthly
  periodStart   DateTime
  periodEnd     DateTime

  createdAt     DateTime @default(now())

  @@index([metricType, periodStart])
  @@map("dashboard_metrics")
}
```

### Índices

```javascript
db.dashboard_metrics.createIndex({ metricType: 1, periodStart: -1 });
db.dashboard_metrics.createIndex({ period: 1, createdAt: -1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- dashboard.service.spec.ts
npm run test -- metrics-aggregation.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- dashboard.e2e-spec.ts
```

### Cobertura

- **Líneas**: 85%
- **Funciones**: 88%
- **Ramas**: 82%

---

## 🔒 Seguridad

- Solo administradores pueden acceder a dashboards
- Program admins ven solo su programa
- Rate limiting para prevenir sobrecarga
- Datos agregados (sin información personal)

---

## ⚡ Performance

- **Cache Redis** de métricas (TTL: 5 minutos)
- Pre-cálculo de métricas cada hora
- Agregaciones optimizadas con índices
- WebSocket para actualizaciones en tiempo real
- Lazy loading de gráficos pesados

**Estrategia de Cache**:

```typescript
// Cache por tipo de métrica y período
const cacheKey = `dashboard:${metricType}:${period}`;
const ttl = 300; // 5 minutos
```

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#dashboards)
- [Base de Datos](../DATABASE.md#dashboardmetric)
- [Endpoints](../ENDPOINTS.md#dashboards)

---

## 🔄 Changelog

| Fecha      | Cambio                              | Autor |
| ---------- | ----------------------------------- | ----- |
| 2025-11-06 | Implementación inicial RF-36        | Team  |
| 2025-11-06 | Agregado WebSocket para tiempo real | Team  |
| 2025-11-06 | Optimización con Redis cache        | Team  |

---

## 📝 Notas Adicionales

**KPIs Principales**:

- Total de reservas (actual vs período anterior)
- Usuarios activos
- Tasa de ocupación promedio
- Rating de satisfacción
- Tasa de cancelación
- Recursos más utilizados

**Gráficos Disponibles**:

- Línea: Tendencias temporales
- Barra: Comparativas entre recursos
- Donut: Distribución por categoría
- Heatmap: Ocupación por horario

---

**Mantenedor**: Bookly Development Team
