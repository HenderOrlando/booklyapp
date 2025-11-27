# 🏗️ Reports Service - Arquitectura

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Capas de la Arquitectura](#capas-de-la-arquitectura)
- [Patrones Implementados](#patrones-implementados)
- [Event-Driven Architecture](#event-driven-architecture)
- [Comunicación con Otros Servicios](#comunicación-con-otros-servicios)
- [Seguridad](#seguridad)
- [Cache y Performance](#cache-y-performance)

---

## 🎯 Visión General

El **Reports Service** es responsable de generar reportes, dashboards y analíticas sobre el uso de recursos, reservas y usuarios en el sistema Bookly. Consume datos de otros servicios y genera visualizaciones y exportaciones.

### Responsabilidades

- Generar reportes de uso por recurso/programa/período
- Crear reportes por usuario/profesor
- Dashboards interactivos en tiempo real
- Exportación de datos (CSV, PDF, Excel)
- Registro de feedback de usuarios
- Evaluación de usuarios por el staff
- Análisis de demanda insatisfecha
- Estadísticas agregadas y métricas

### Diagrama de Arquitectura

```
┌───────────────────────────────────────────────────────────┐
│                  Reports Service                          │
├───────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │         Infrastructure Layer                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │ Controllers  │  │  HTTP/REST   │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Application Layer (CQRS)                   │   │
│  │  ┌───────────────────────────────────────────┐     │   │
│  │  │  Commands            │   Queries          │     │   │
│  │  │  - GenerateReport    │   - GetReport      │     │   │
│  │  │  - ExportData        │   - GetDashboard   │     │   │
│  │  │  - SubmitFeedback    │   - GetFeedback    │     │   │
│  │  └───────────────────────────────────────────┘     │   │
│  │  ┌───────────────────────────────────────────┐     │   │
│  │  │  Services                                 │     │   │
│  │  │  - ReportService     - ExportService      │     │   │
│  │  │  - DashboardService  - FeedbackService    │     │   │
│  │  └───────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────┘   │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Domain Layer                               │   │
│  │  ┌───────────────────────────────────────────┐     │   │
│  │  │  Entities                                 │     │   │
│  │  │  - UserFeedback    - UsageStatistic       │     │   │
│  │  │  - UserEvaluation  - UnsatisfiedDemand    │     │   │
│  │  └───────────────────────────────────────────┘     │   │
│  │  ┌───────────────────────────────────────────┐     │   │
│  │  │  Repositories                             │     │   │
│  │  │  - FeedbackRepository                     │     │   │
│  │  │  - StatisticRepository                    │     │   │
│  │  └───────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

### Puerto

**3005** (development)

---

## 📐 Capas de la Arquitectura

### 1. Domain Layer (Dominio)

**Entidades**:

- `ReportEntity` - Reporte generado
- `DashboardMetricEntity` - Métrica de dashboard
- `FeedbackEntity` - Feedback de usuario
- `ExportEntity` - Exportación de datos

**Value Objects**:

- `ReportFilter` - Filtros de reporte
- `DateRange` - Rango de fechas
- `ExportFormat` - Formato de exportación

### 2. Application Layer (Aplicación)

**Services**:

- `ReportGenerationService` - Generación de reportes
- `DashboardService` - Métricas de dashboard
- `ExportService` - Exportación de datos
- `FeedbackService` - Gestión de feedback

**CQRS Commands**:

- `GenerateReportCommand`
- `ExportDataCommand`
- `SubmitFeedbackCommand`

**CQRS Queries**:

- `GetReportQuery`
- `GetDashboardMetricsQuery`
- `GetFeedbackQuery`

### 3. Infrastructure Layer (Infraestructura)

**Repositories**:

- `PrismaReportRepository`
- `PrismaDashboardMetricRepository`
- `PrismaFeedbackRepository`

**External Services**:

- `ResourcesServiceClient` - Consumir datos de recursos
- `AvailabilityServiceClient` - Consumir datos de reservas
- `PDFGeneratorService` - Generación de PDFs
- `ExcelGeneratorService` - Generación de Excel

---

## 🔄 Patrones Implementados

### CQRS (Command Query Responsibility Segregation)

Separación de comandos (write) y queries (read).

```typescript
// Command
GenerateReportCommand → GenerateReportHandler → ReportGenerationService

// Query
GetReportQuery → GetReportHandler → ReportRepository
```

### Repository Pattern

Abstracción de acceso a datos.

### Strategy Pattern

Para diferentes estrategias de generación de reportes y exportación.

---

## 📡 Event-Driven Architecture

### Eventos Consumidos

1. **availability.reservation.created** - Actualizar métricas de uso
2. **availability.reservation.cancelled** - Actualizar métricas
3. **resources.resource.created** - Agregar recurso a reportes
4. **auth.user.registered** - Agregar usuario a estadísticas

### Eventos Publicados

1. **ReportGeneratedEvent** - Reporte generado exitosamente
2. **ExportCompletedEvent** - Exportación completada
3. **FeedbackSubmittedEvent** - Feedback registrado

---

## 🔗 Comunicación con Otros Servicios

### availability-service

**Propósito**: Consumir datos de reservas para estadísticas

**Comunicación**:

- Event-Driven: Consume eventos de reservas (created, completed, cancelled)
- Genera métricas agregadas de uso

**Eventos Consumidos**:

- `availability.reservation.created`
- `availability.reservation.completed`
- `availability.reservation.cancelled`

### resources-service

**Propósito**: Obtener información de recursos para reportes

**Comunicación**:

- Event-Driven: Consume eventos de recursos
- Datos para reportes de uso por recurso

**Eventos Consumidos**:

- `resources.resource.created`
- `resources.resource.updated`

### auth-service

**Propósito**: Información de usuarios para evaluaciones

**Comunicación**:

- Event-Driven: Consume eventos de usuarios
- Validación de permisos para acceso a reportes

**Eventos Consumidos**:

- `auth.user.registered`
- `auth.user.updated`

---

## 🔒 Seguridad

### Control de Acceso

- **Reportes Sensibles**: Solo accesibles por administradores
- **Feedback**: Los usuarios solo pueden ver su propio feedback
- **Exportaciones**: Limitadas por rol y cantidad

### Autenticación

- JWT tokens con validación en cada request
- Permisos granulares por tipo de reporte

### Protección de Datos

- Anonimización de datos personales en reportes agregados
- Encriptación de exportaciones sensibles
- TTL en exportaciones temporales

### Rate Limiting

- Limitación de generación de reportes: 10 por hora por usuario
- Exportaciones: 5 por día por usuario
- Dashboards: Cache para reducir carga

---

## ⚡ Cache y Performance

### Estrategias de Caching

**Redis Cache**:

- Métricas de dashboard (TTL: 5 minutos)
- Reportes generados (TTL: 1 hora)
- Estadísticas agregadas (TTL: 15 minutos)

**Cache Keys**:

```typescript
dashboard:metrics:{type}:{period}
report:{type}:{filters}:{hash}
statistics:usage:{resourceId}:{period}
```

### Agregaciones

- Pre-cálculo de métricas frecuentes ejecutado cada hora
- Agregaciones nocturnas de datos históricos (2AM)
- Índices compuestos optimizados en MongoDB
- Particionamiento por período (mensual)

### Procesamiento Asíncrono

**Bull Queue** para trabajos pesados:

- Generación de reportes grandes (>1000 registros)
- Exportaciones CSV/Excel de datos masivos
- Cálculo de estadísticas complejas

**Notificaciones**:

- Email cuando el reporte está listo
- WebSocket para actualización en tiempo real
- Historial de exportaciones en perfil de usuario

### Optimizaciones de Queries

```typescript
// Proyección de campos necesarios
db.feedback.find({}, { rating: 1, category: 1, createdAt: 1 })

// Agregaciones con pipeline
db.usageStatistics.aggregate([
  { $match: { period: "monthly", year: 2024 } },
  { $group: { _id: "$resourceId", total: { $sum: "$totalHours" } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
])

// Índices compuestos
{ metricType: 1, periodStart: -1 }
{ resourceId: 1, period: 1, year: 1 }
```

---

## 📚 Documentación Relacionada

- [Base de Datos](DATABASE.md)
- [Endpoints](ENDPOINTS.md)
- [Event Bus](EVENT_BUS.md)
- [Seeds](SEEDS.md)

---

**Mantenedor**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
