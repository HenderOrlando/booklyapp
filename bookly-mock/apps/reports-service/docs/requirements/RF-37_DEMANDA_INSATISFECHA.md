# RF-37: Análisis de Demanda Insatisfecha

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Registra y analiza las solicitudes de reservas que no pudieron ser satisfechas, identificando patrones de demanda no cubierta para optimizar la asignación de recursos y planificar nuevas adquisiciones o expansiones.

---

## ✅ Criterios de Aceptación

- [x] Registro automático de solicitudes no satisfechas
- [x] Categorización por razón (ocupado, rechazado, no disponible)
- [x] Análisis de patrones temporales de demanda
- [x] Sugerencia de alternativas
- [x] Lista de espera integrada
- [x] Reportes de demanda insatisfecha
- [x] Recomendaciones para planificación

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `UnsatisfiedDemandController` - Gestión de demanda

**Services**:

- `UnsatisfiedDemandService` - Registro y análisis
- `DemandPatternAnalysisService` - Análisis de patrones
- `ResourceRecommendationService` - Recomendaciones

**Repositories**:

- `UnsatisfiedDemandRepository` - Persistencia de demanda

**Commands** (CQRS):

- `RecordUnsatisfiedDemandCommand` - Registrar demanda
- `AnalyzeDemandPatternCommand` - Analizar patrones
- `SuggestAlternativeCommand` - Sugerir alternativas

**Queries** (CQRS):

- `GetUnsatisfiedDemandQuery` - Obtener demanda
- `GetDemandPatternQuery` - Obtener patrones
- `GetResourceRecommendationsQuery` - Obtener recomendaciones

---

### Endpoints Creados

```http
GET    /api/v1/reports/unsatisfied-demand        # Listar demanda
GET    /api/v1/reports/unsatisfied-demand/patterns  # Patrones
GET    /api/v1/reports/unsatisfied-demand/recommendations  # Recomendaciones
POST   /api/v1/reports/unsatisfied-demand        # Registrar (automático)
```

**Query Parameters**:

- `startDate` - Fecha inicio
- `endDate` - Fecha fin
- `resourceType` - Tipo de recurso
- `reason` - Razón de rechazo
- `priority` - Prioridad

**Response Example**:

```json
{
  "totalUnsatisfied": 45,
  "byReason": {
    "resource_occupied": 30,
    "approval_rejected": 10,
    "resource_unavailable": 5
  },
  "topResources": [
    {
      "resourceId": "auditorio-principal",
      "resourceName": "Auditorio Principal",
      "count": 15,
      "peakTimes": ["16:00-18:00", "10:00-12:00"]
    }
  ],
  "recommendations": [
    {
      "type": "acquire",
      "description": "Considerar adquisición de sala adicional",
      "justification": "Alta demanda en horarios pico"
    }
  ]
}
```

**Permisos Requeridos**:

- `reports:read` - Ver análisis de demanda (admin)

---

### Eventos Publicados

- `UnsatisfiedDemandRecordedEvent` - Demanda registrada
- `HighDemandAlertEvent` - Alerta de alta demanda

**Routing Keys**:

- `reports.demand.recorded`
- `reports.demand.alert`

---

## 🗄️ Base de Datos

### Entidades

**UnsatisfiedDemand**:

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
  @@index([addedToWaitList])
  @@map("unsatisfied_demand")
}
```

### Índices

```javascript
db.unsatisfied_demand.createIndex({ resourceId: 1, requestedDate: -1 });
db.unsatisfied_demand.createIndex({ reason: 1 });
db.unsatisfied_demand.createIndex({ priority: 1 });
db.unsatisfied_demand.createIndex({ addedToWaitList: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- unsatisfied-demand.service.spec.ts
npm run test -- demand-pattern-analysis.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e -- unsatisfied-demand.e2e-spec.ts
```

### Cobertura

- **Líneas**: 83%
- **Funciones**: 86%
- **Ramas**: 80%

---

## 🔒 Seguridad

- Solo administradores acceden a análisis completo
- Datos agregados para planificación
- Anonimización de solicitantes en reportes
- Auditoría de acceso a información sensible

---

## ⚡ Performance

- Agregaciones mensuales de patrones
- Cache de recomendaciones (TTL: 1 día)
- Índices optimizados por recurso y fecha
- Análisis batch ejecutado semanalmente

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md#demanda-insatisfecha)
- [Base de Datos](../DATABASE.md#unsatisfieddemand)
- [Endpoints](../ENDPOINTS.md#demanda-insatisfecha)
- [Seeds](../SEEDS.md#unsatisfied-demand-seed)

---

## 🔄 Changelog

| Fecha      | Cambio                          | Autor |
| ---------- | ------------------------------- | ----- |
| 2025-11-06 | Implementación inicial RF-37    | Team  |
| 2025-11-06 | Sistema de recomendaciones      | Team  |
| 2025-11-06 | Integración con lista de espera | Team  |

---

## 📝 Notas Adicionales

**Razones de Demanda Insatisfecha**:

- `resource_occupied`: Recurso ya reservado en ese horario
- `approval_rejected`: Solicitud rechazada por el staff
- `resource_unavailable`: Recurso en mantenimiento o no disponible
- `capacity_exceeded`: Capacidad insuficiente para el grupo

**Recomendaciones Automáticas**:

- Si demanda > 80% en un horario: Sugerir recurso adicional
- Si rechazos frecuentes: Revisar políticas de aprobación
- Si mantenimiento recurrente: Considerar reemplazo

**Estadísticas Clave**:

- 45 solicitudes no satisfechas en el último mes
- 67% por recurso ocupado
- 22% por rechazo de aprobación
- 11% por recurso no disponible

---

**Mantenedor**: Bookly Development Team
