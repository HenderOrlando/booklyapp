# RF-31: Reportes de Uso por Recurso/Programa/Período

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Genera reportes detallados de uso de recursos, programas académicos y períodos de tiempo. Permite a los administradores analizar patrones de uso, ocupación y optimizar la asignación de recursos.

---

## ✅ Criterios de Aceptación

- [x] El sistema genera reportes por recurso individual
- [x] El sistema genera reportes por programa académico
- [x] El sistema permite seleccionar períodos personalizados
- [x] Los reportes incluyen métricas de ocupación y cancelaciones
- [x] Los datos se presentan con gráficos visuales
- [x] Los reportes son exportables en múltiples formatos

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `ReportController` - Maneja requests de generación de reportes

**Services**:

- `ReportGenerationService` - Lógica de generación de reportes
- `UsageStatisticService` - Cálculo de estadísticas de uso

**Repositories**:

- `UsageStatisticRepository` - Acceso a datos de estadísticas

**Queries** (CQRS):

- `GetUsageReportQuery` - Consulta de reportes de uso
- `GetResourceUsageQuery` - Estadísticas por recurso
- `GetProgramUsageQuery` - Estadísticas por programa

---

### Endpoints Creados

```http
GET    /api/v1/reports/usage              # Reporte general de uso
GET    /api/v1/reports/usage/resource/:id # Uso por recurso
GET    /api/v1/reports/usage/program/:id  # Uso por programa
```

**Query Parameters**:

- `startDate` (required) - Fecha inicio del período
- `endDate` (required) - Fecha fin del período
- `resourceType` (optional) - Filtrar por tipo de recurso
- `program` (optional) - Filtrar por programa
- `format` (optional) - Formato de exportación (json, csv, pdf)

**Permisos Requeridos**:

- `reports:read` - Lectura de reportes
- `reports:generate` - Generación de reportes

---

### Eventos Publicados

- `ReportGeneratedEvent` - Se dispara cuando un reporte es generado exitosamente

**Routing Keys**:

- `reports.usage.generated`

---

## 🗄️ Base de Datos

### Entidades

**UsageStatistic**:

```prisma
model UsageStatistic {
  id                      String   @id @default(auto()) @map("_id") @db.ObjectId

  type                    String   // resource, program, user
  resourceId              String?  @db.ObjectId
  resourceName            String?
  program                 String?

  period                  String   // monthly, quarterly, yearly
  year                    Int
  month                   Int?

  totalReservations       Int
  confirmedReservations   Int
  cancelledReservations   Int
  totalHours              Float

  occupancyRate           Float?   // 0-100
  averageAttendees        Int?
  peakUsageHours          Json?    // string[]

  createdBy               String

  @@index([type, year, month])
  @@index([resourceId, period])
  @@map("usage_statistics")
}
```

### Índices

```javascript
db.usage_statistics.createIndex({ type: 1, year: -1, month: -1 });
db.usage_statistics.createIndex({ resourceId: 1, period: 1 });
db.usage_statistics.createIndex({ program: 1, period: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- usage-statistic.service.spec.ts
npm run test -- get-usage-report.handler.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- reports-usage.e2e-spec.ts
```

### Cobertura

- **Líneas**: 85%
- **Funciones**: 90%
- **Ramas**: 80%

---

## 🔒 Seguridad

- Solo usuarios con rol `admin` o `program_admin` pueden generar reportes
- Los datos personales son anonimizados en reportes agregados
- Rate limiting: 10 reportes por hora por usuario

---

## ⚡ Performance

- Cache Redis de estadísticas agregadas (TTL: 15 minutos)
- Índices compuestos para queries rápidas por período
- Pre-cálculo de métricas frecuentes cada hora
- Paginación para reportes grandes (>1000 registros)

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#reportes)
- [Base de Datos](../DATABASE.md#usagestatistic)
- [Endpoints](../ENDPOINTS.md#reportes-de-uso)
- [Seeds](../SEEDS.md#usage-statistics-seed)

---

## 🔄 Changelog

| Fecha      | Cambio                                | Autor |
| ---------- | ------------------------------------- | ----- |
| 2025-11-06 | Implementación inicial RF-31          | Team  |
| 2025-11-06 | Agregado cache Redis para performance | Team  |

---

## 📝 Notas Adicionales

- Las estadísticas se calculan de forma asíncrona cada hora
- Los reportes históricos se mantienen por 5 años
- La ocupación se calcula como: (horas usadas / horas disponibles) × 100

---

**Mantenedor**: Bookly Development Team
