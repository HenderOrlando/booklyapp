# 🗄️ Reports Service - Base de Datos

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Esquema de Datos](#esquema-de-datos)
- [Entidades Principales](#entidades-principales)
- [Relaciones](#relaciones)
- [Índices](#índices)
- [Migraciones](#migraciones)
- [Seeds](#seeds)
- [Optimizaciones](#optimizaciones)

---

## 📊 Esquema de Datos

### Vista General

El Reports Service gestiona **4 colecciones principales** en MongoDB:

1. **UserFeedback** - Feedback de usuarios sobre recursos y reservas
2. **UserEvaluation** - Evaluaciones administrativas de comportamiento de usuarios
3. **UsageStatistic** - Estadísticas agregadas de uso por recurso/programa/usuario
4. **UnsatisfiedDemand** - Análisis de demanda no satisfecha para planificación

---

## 🔷 Entidades Principales

### 1. UserFeedback

**Descripción**: Almacena feedback de usuarios sobre recursos utilizados.

```prisma
model UserFeedback {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId

  userId              String   @db.ObjectId
  userName            String
  reservationId       String   @db.ObjectId
  resourceId          String   @db.ObjectId
  resourceName        String

  rating              Int      // 1-5 estrellas
  comment             String?
  category            String   // facilities, equipment, service, process, overall

  wasIssueReported    Boolean  @default(false)
  issueDescription    String?

  createdAt           DateTime @default(now())
  createdBy           String

  @@index([userId, createdAt])
  @@index([resourceId, rating])
  @@index([category])
  @@map("user_feedback")
}
```

### 2. UserEvaluation

**Descripción**: Evaluaciones administrativas del comportamiento de usuarios.

```prisma
model UserEvaluation {
  id                          String   @id @default(auto()) @map("_id") @db.ObjectId

  evaluatedUserId             String   @db.ObjectId
  evaluatedUserName           String
  evaluatorId                 String   @db.ObjectId
  evaluatorName               String

  period                      String   // Q1-2024, Q2-2024

  totalReservations           Int
  completedReservations       Int
  cancelledReservations       Int
  noShowCount                 Int
  averageCheckInDelay         Int      // minutos

  complianceScore             Int      // 0-100
  rating                      Int      // 1-5
  comments                    String?

  strengths                   Json     // string[]
  areasForImprovement         Json     // string[]
  recommendForPriorityAccess  Boolean

  evaluatedAt                 DateTime
  createdBy                   String

  @@index([evaluatedUserId, period])
  @@index([complianceScore])
  @@map("user_evaluations")
}
```

### 3. UsageStatistic

**Descripción**: Estadísticas agregadas de uso por recurso, programa o usuario.

```prisma
model UsageStatistic {
  id                      String   @id @default(auto()) @map("_id") @db.ObjectId

  type                    String   // resource, program, user

  // Para type=resource
  resourceId              String?  @db.ObjectId
  resourceName            String?

  // Para type=program
  program                 String?

  // Para type=user
  userId                  String?  @db.ObjectId
  userName                String?

  period                  String   // monthly, quarterly, yearly
  year                    Int
  month                   Int?

  totalReservations       Int
  confirmedReservations   Int
  cancelledReservations   Int
  totalHours              Float

  // Solo para type=resource
  occupancyRate           Float?   // 0-100
  averageAttendees        Int?
  peakUsageHours          Json?    // string[]

  // Solo para type=program
  mostUsedResources       Json?    // string[]

  // Solo para type=user
  favoriteResources       Json?    // string[]

  createdBy               String

  @@index([type, year, month])
  @@index([resourceId, period])
  @@index([userId, period])
  @@map("usage_statistics")
}
```

### 4. UnsatisfiedDemand

**Descripción**: Análisis de demanda no satisfecha para planificación de recursos.

```prisma
model UnsatisfiedDemand {
  id                   String   @id @default(auto()) @map("_id") @db.ObjectId

  resourceId           String   @db.ObjectId
  resourceName         String
  resourceType         String   // auditorio, equipo, laboratorio

  requestedDate        DateTime
  requestedStartTime   String
  requestedEndTime     String

  requesterId          String   @db.ObjectId
  requesterName        String

  reason               String   // resource_occupied, approval_rejected, resource_unavailable

  alternativeSuggested String?
  alternativeAccepted  Boolean  @default(false)

  addedToWaitList      Boolean  @default(false)
  priority             String   // low, medium, high

  createdAt            DateTime @default(now())
  createdBy            String

  @@index([resourceId, requestedDate])
  @@index([reason])
  @@index([priority])
  @@map("unsatisfied_demand")
}
```

---

## 🔗 Relaciones

### UserFeedback

- **userId** → `auth-service.User` (vía eventos)
- **reservationId** → `availability-service.Reservation` (vía eventos)
- **resourceId** → `resources-service.Resource` (vía eventos)

### UserEvaluation

- **evaluatedUserId** → `auth-service.User`
- **evaluatorId** → `auth-service.User`

### UsageStatistic

- **resourceId** → `resources-service.Resource` (para type=resource)
- **userId** → `auth-service.User` (para type=user)

### UnsatisfiedDemand

- **resourceId** → `resources-service.Resource`
- **requesterId** → `auth-service.User`

> **Nota**: Reports Service consume datos de otros servicios mediante Event-Driven Architecture, no tiene relaciones directas en base de datos.

---

## 🔍 Índices

### Índices Compuestos

```javascript
// UserFeedback
db.user_feedback.createIndex({ userId: 1, createdAt: -1 });
db.user_feedback.createIndex({ resourceId: 1, rating: -1 });
db.user_feedback.createIndex({ category: 1 });

// UserEvaluation
db.user_evaluations.createIndex({ evaluatedUserId: 1, period: -1 });
db.user_evaluations.createIndex({ complianceScore: -1 });
db.user_evaluations.createIndex({ recommendForPriorityAccess: 1 });

// UsageStatistic
db.usage_statistics.createIndex({ type: 1, year: -1, month: -1 });
db.usage_statistics.createIndex({ resourceId: 1, period: 1 });
db.usage_statistics.createIndex({ userId: 1, period: 1 });
db.usage_statistics.createIndex({ program: 1, period: 1 });

// UnsatisfiedDemand
db.unsatisfied_demand.createIndex({ resourceId: 1, requestedDate: -1 });
db.unsatisfied_demand.createIndex({ reason: 1 });
db.unsatisfied_demand.createIndex({ priority: 1 });
db.unsatisfied_demand.createIndex({ addedToWaitList: 1 });
```

### Performance

- Índices compuestos para queries frecuentes
- TTL indexes para limpieza automática de datos antiguos
- Índices sparse para campos opcionales

---

## 📦 Migraciones

### Historial de Migraciones

| Versión | Fecha      | Descripción                                  |
| ------- | ---------- | -------------------------------------------- |
| 1.0     | 2025-11-06 | Schema inicial con 4 entidades principales   |
| 1.1     | TBD        | Agregar índices adicionales para dashboards  |
| 1.2     | TBD        | Agregar TTL indexes para limpieza automática |

### Ejecutar Migraciones

```bash
# Generar migración
npx prisma migrate dev --name add_reports_schema

# Aplicar en producción
npx prisma migrate deploy
```

### Validar Schema

```bash
# Validar schema
npx prisma validate

# Ver estado de migraciones
npx prisma migrate status
```

---

## 🌱 Seeds

El Reports Service utiliza seeds para datos de prueba y análisis.

### Ejecutar Seeds

```bash
# Ejecutar seeds
npm run seed

# Ver documentación completa
```

Ver [SEEDS.md](SEEDS.md) para detalles completos de:

- 5 registros de feedback con ratings variados
- 3 evaluaciones de usuarios con compliance scores
- 4 estadísticas de uso por tipo
- 3 registros de demanda insatisfecha

---

## 🚀 Optimizaciones

### Particionamiento

**Por Período**:

- Particionamiento mensual de UsageStatistic
- Facilita queries por período
- Mejora performance de agregaciones

```javascript
// Colecciones por período
usage_statistics_2024_01;
usage_statistics_2024_02;
// ...
```

### Agregaciones Pre-calculadas

**Métricas Frecuentes**:

```javascript
// Pre-cálculo cada hora
db.usage_statistics.aggregate([
  {
    $group: {
      _id: "$resourceId",
      totalReservations: { $sum: "$totalReservations" },
      avgOccupancy: { $avg: "$occupancyRate" },
    },
  },
  { $out: "resource_metrics_cache" },
]);
```

### TTL Indexes

**Limpieza Automática**:

```javascript
// Eliminar feedback antiguo (2 años)
db.user_feedback.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 63072000 }
);

// Eliminar estadísticas antiguas (5 años)
db.usage_statistics.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 157680000 }
);
```

### Cache de Queries

**Redis Cache**:

- Métricas de dashboard: 5 minutos
- Estadísticas agregadas: 15 minutos
- Reportes generados: 1 hora

```typescript
const cacheKey = `stats:${type}:${period}:${year}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const stats = await db.find(...);
await redis.setex(cacheKey, 900, JSON.stringify(stats)); // 15 min
```

---

## 📚 Documentación Relacionada

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)
- [Event Bus](EVENT_BUS.md)
- [Seeds](SEEDS.md)

---

**Mantenedor**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
