# RF-32: Reportes por Usuario/Profesor

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Genera reportes individualizados por usuario o profesor, mostrando su historial de reservas, recursos favoritos, estadísticas de uso y comportamiento. Permite evaluar patrones de uso y otorgar beneficios a usuarios destacados.

---

## ✅ Criterios de Aceptación

- [x] El sistema genera reportes individuales por usuario
- [x] Incluye historial completo de reservas
- [x] Muestra recursos más utilizados (favoritos)
- [x] Calcula estadísticas de cumplimiento
- [x] Identifica patrones de uso (horarios, días)
- [x] Los usuarios pueden ver su propio reporte
- [x] Los administradores pueden ver reportes de cualquier usuario

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `ReportController` - Maneja requests de reportes de usuario

**Services**:

- `UserReportService` - Generación de reportes de usuario
- `UsageStatisticService` - Estadísticas personalizadas

**Repositories**:

- `UsageStatisticRepository` - Datos de uso por usuario
- `UserEvaluationRepository` - Evaluaciones administrativas

**Queries** (CQRS):

- `GetUserReportQuery` - Reporte completo de usuario
- `GetUserStatisticsQuery` - Estadísticas de usuario
- `GetUserFavoriteResourcesQuery` - Recursos favoritos

---

### Endpoints Creados

```http
GET    /api/v1/reports/user/:userId        # Reporte de usuario
GET    /api/v1/reports/user/:userId/stats  # Estadísticas detalladas
GET    /api/v1/reports/user/me             # Reporte propio
```

**Query Parameters**:

- `startDate` (optional) - Fecha inicio del período
- `endDate` (optional) - Fecha fin del período
- `includeEvaluations` (optional) - Incluir evaluaciones administrativas
- `format` (optional) - Formato de exportación

**Permisos Requeridos**:

- `reports:read-own` - Ver reporte propio
- `reports:read-all` - Ver reportes de todos los usuarios (admin)

---

### Eventos Publicados

- `UserReportGeneratedEvent` - Reporte de usuario generado

**Routing Keys**:

- `reports.user.generated`

---

## 🗄️ Base de Datos

### Entidades

**UsageStatistic** (type=user):

```prisma
model UsageStatistic {
  id                      String   @id @default(auto()) @map("_id") @db.ObjectId

  type                    String   // "user"
  userId                  String   @db.ObjectId
  userName                String

  period                  String   // monthly, quarterly, yearly
  year                    Int
  month                   Int?

  totalReservations       Int
  confirmedReservations   Int
  cancelledReservations   Int
  totalHours              Float

  favoriteResources       Json     // string[]

  createdBy               String

  @@index([userId, period])
  @@map("usage_statistics")
}
```

### Índices

```javascript
db.usage_statistics.createIndex({ userId: 1, period: -1 });
db.usage_statistics.createIndex({ type: 1, userId: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- user-report.service.spec.ts
npm run test -- get-user-report.handler.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- reports-user.e2e-spec.ts
```

### Cobertura

- **Líneas**: 88%
- **Funciones**: 92%
- **Ramas**: 85%

---

## 🔒 Seguridad

- Los usuarios solo pueden ver sus propios reportes
- Los administradores pueden ver reportes de todos
- Datos sensibles anonimizados en reportes compartidos
- Validación JWT en todos los endpoints

---

## ⚡ Performance

- Cache de reportes frecuentes (TTL: 1 hora)
- Agregaciones pre-calculadas mensuales
- Paginación para historiales largos
- Índices optimizados por userId y período

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#reportes)
- [Base de Datos](../DATABASE.md#usagestatistic)
- [Endpoints](../ENDPOINTS.md#reportes-de-usuario)
- [Seeds](../SEEDS.md#usage-statistics-seed)

---

## 🔄 Changelog

| Fecha      | Cambio                       | Autor |
| ---------- | ---------------------------- | ----- |
| 2025-11-06 | Implementación inicial RF-32 | Team  |
| 2025-11-06 | Agregado recursos favoritos  | Team  |
| 2025-11-06 | Integración con evaluaciones | Team  |

---

## 📝 Notas Adicionales

- Los recursos favoritos se calculan por frecuencia de uso
- El reporte incluye comparativa con promedios generales
- Se muestra tendencia de uso (incremento/decremento)

---

**Mantenedor**: Bookly Development Team
