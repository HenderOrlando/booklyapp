# 📊 RF-15: Reasignación Automática de Recursos - Documentación Técnica

## 📝 Resumen

**RF-15: Reasignación Automática** implementa un sistema inteligente para sugerir recursos alternativos cuando un recurso reservado no está disponible, utilizando un algoritmo de similitud multi-criterio.

**Fecha de Implementación**: Noviembre 8, 2025  
**Estado**: ✅ **COMPLETADO**  
**Prioridad**: Media  
**Complejidad**: Alta

---

## ✨ Funcionalidades Implementadas

### ✅ Algoritmo de Similitud Multi-Criterio

**Criterios evaluados**:

- **Capacidad** (peso: 30%): Similitud de aforo del recurso
- **Características** (peso: 35%): Similitud de equipamiento (proyector, pizarra, etc.)
- **Ubicación** (peso: 20%): Proximidad física (mismo edificio, piso)
- **Disponibilidad** (peso: 15%): Disponibilidad en el horario requerido

**Algoritmos utilizados**:

- Jaccard Similarity Coefficient para características
- Levenshtein Distance para comparación de ubicaciones textuales
- Scoring ponderado configurable

### ✅ Sistema de Notificaciones

- Notificación automática a usuarios afectados
- Sugerencias de hasta 5 alternativas ordenadas por similitud
- Eventos publicados al Event Bus para integración

### ✅ Historial de Reasignaciones

- Registro completo de todas las reasignaciones sugeridas
- Tracking de aceptación/rechazo por parte del usuario
- Análisis de patrones (recursos más usados como alternativas)
- Feedback del usuario

---

## 🏗️ Arquitectura

### Schema MongoDB

#### ReassignmentHistory

```typescript
{
  originalReservationId: ObjectId;
  originalResourceId: ObjectId;
  originalResourceName: string;
  newResourceId: ObjectId;
  newResourceName: string;
  userId: ObjectId;
  reason: ReassignmentReason;
  similarityScore: number;
  scoreBreakdown: {
    capacity: number;
    features: number;
    location: number;
    availability: number;
    total: number;
  };
  alternativesConsidered: string[];
  accepted: boolean;
  userFeedback?: string;
  notificationSent: boolean;
  notifiedAt?: Date;
  respondedAt?: Date;
  processedBy?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices optimizados**:

- `originalReservationId`
- `userId`
- `originalResourceId`
- `newResourceId`
- `accepted`
- `createdAt` (descendente)
- `reason`

---

## 🔧 Componentes Técnicos

### Services

#### ResourceSimilarityService

Calcula la similitud entre recursos usando algoritmos especializados:

```typescript
calculateSimilarity(
  originalResource: ResourceForScoring,
  candidateResources: ResourceForScoring[],
  weights: SimilarityWeightsDto,
  availabilityMap: Map<string, boolean>
): SimilarityResult[]
```

**Algoritmos**:

- `calculateCapacityScore()`: Penaliza capacidades menores
- `calculateFeaturesScore()`: Jaccard similarity con bonus
- `calculateLocationScore()`: Mismo edificio/piso + proximidad
- `levenshteinDistance()`: Distancia de edición para strings

#### ReassignmentService

Orquesta el proceso completo de reasignación:

```typescript
requestReassignment(
  dto: RequestReassignmentDto,
  userId: string
): Promise<ReassignmentResponseDto>
```

**Flujo**:

1. Obtiene reserva original
2. Consulta información del recurso
3. Obtiene candidatos del mismo tipo
4. Verifica disponibilidad de cada candidato
5. Calcula similitud con pesos personalizados
6. Filtra por score mínimo (60%)
7. Retorna top 5 alternativas
8. Registra en historial
9. Publica evento para notificación

### Repositories

#### ReassignmentHistoryRepository

- `create()` - Crear registro
- `findById()` - Buscar por ID
- `findByFilters()` - Búsqueda avanzada
- `update()` - Actualizar respuesta
- `markNotificationSent()` - Marcar notificación enviada
- `getAcceptanceStats()` - Estadísticas de aceptación
- `getMostUsedAlternatives()` - Recursos más sugeridos

---

## 🌐 API REST

### POST `/reassignments/request`

Solicitar reasignación de recurso

**Permisos**: `availability:reassign`

**Request Body**:

```json
{
  "reservationId": "507f1f77bcf86cd799439011",
  "reason": "MAINTENANCE",
  "weights": {
    "capacity": 0.3,
    "features": 0.35,
    "location": 0.2,
    "availability": 0.15
  }
}
```

**Response** (201):

```json
{
  "originalReservationId": "507f1f77bcf86cd799439011",
  "originalResourceId": "507f1f77bcf86cd799439012",
  "originalResourceName": "Sala A-101",
  "alternatives": [
    {
      "resourceId": "507f1f77bcf86cd799439013",
      "resourceName": "Sala A-102",
      "resourceType": "CLASSROOM",
      "similarityScore": 92.5,
      "scoreBreakdown": {
        "capacity": 95,
        "features": 88,
        "location": 100,
        "availability": 87
      },
      "isAvailable": true,
      "capacity": 32,
      "features": ["PROJECTOR", "WHITEBOARD", "AC", "WIFI"],
      "location": "Edificio A, Piso 1"
    }
  ],
  "reason": "MAINTENANCE",
  "totalAlternatives": 3,
  "bestAlternative": {
    /* ... */
  }
}
```

### POST `/reassignments/respond`

Aceptar o rechazar reasignación

**Permisos**: `reservations:manage`

**Request Body**:

```json
{
  "reassignmentId": "507f1f77bcf86cd799439014",
  "accepted": true,
  "newResourceId": "507f1f77bcf86cd799439013",
  "feedback": "La alternativa es perfecta, gracias"
}
```

### GET `/reassignments/history`

Obtener historial con filtros

**Permisos**: `availability:read`

**Query Parameters**:

- `userId` (opcional)
- `reservationId` (opcional)
- `originalResourceId` (opcional)
- `newResourceId` (opcional)
- `accepted` (opcional)
- `startDate` (opcional)
- `endDate` (opcional)
- `reason` (opcional)

### GET `/reassignments/my-history`

Obtener historial propio

**Permisos**: `reservations:read`

---

## 🎯 CQRS Implementation

### Commands

- ✅ `RequestReassignmentCommand` - Solicitar reasignación
- ✅ `RespondReassignmentCommand` - Responder a reasignación

### Queries

- ✅ `GetReassignmentHistoryQuery` - Obtener historial

### Handlers

- ✅ `RequestReassignmentHandler` - Handler de solicitud
- ✅ `RespondReassignmentHandler` - Handler de respuesta
- ✅ `GetReassignmentHistoryHandler` - Handler de historial

---

## 🔐 Seguridad

### Permisos Requeridos

| Acción                 | Permiso                 |
| ---------------------- | ----------------------- |
| Solicitar reasignación | `availability:reassign` |
| Responder reasignación | `reservations:manage`   |
| Ver historial global   | `availability:read`     |
| Ver historial propio   | `reservations:read`     |

### Validaciones

- Usuario autenticado obligatorio
- Reserva debe existir
- Solo el usuario afectado puede responder
- Score mínimo de 60% para sugerencias

---

## 📊 Metadatos y Auditoría

### Tracking de Reasignaciones

- `userId` - Usuario afectado
- `reason` - Motivo de reasignación
- `similarityScore` - Score de similitud
- `scoreBreakdown` - Desglose detallado
- `alternativesConsidered` - Todas las opciones evaluadas
- `accepted` - Si aceptó o rechazó
- `userFeedback` - Comentarios del usuario
- `respondedAt` - Timestamp de respuesta

---

## 🧪 Casos de Uso Detallados

### Caso 1: Mantenimiento Urgente

```bash
# Solicitar reasignación por mantenimiento
POST /reassignments/request
{
  "reservationId": "507f1f77bcf86cd799439011",
  "reason": "MAINTENANCE"
}

# Sistema evalúa 15 recursos candidatos
# Retorna top 5 con scores: 92.5, 88.3, 81.7, 75.2, 65.8

# Usuario acepta mejor alternativa
POST /reassignments/respond
{
  "reassignmentId": "...",
  "accepted": true,
  "newResourceId": "507f1f77bcf86cd799439013"
}
```

### Caso 2: Solicitud del Usuario

```bash
# Usuario solicita cambio
POST /reassignments/request
{
  "reservationId": "507f1f77bcf86cd799439011",
  "reason": "USER_REQUEST",
  "weights": {
    "capacity": 0.2,
    "features": 0.2,
    "location": 0.5,  # Prioriza ubicación
    "availability": 0.1
  }
}
```

### Caso 3: Overbooking

```bash
# Detectado overbooking
POST /reassignments/request
{
  "reservationId": "507f1f77bcf86cd799439011",
  "reason": "OVERBOOKING"
}

# Usuario rechaza todas las alternativas
POST /reassignments/respond
{
  "reassignmentId": "...",
  "accepted": false,
  "feedback": "Ninguna alternativa cumple mis requisitos"
}
```

---

## 🔍 Algoritmo de Similitud - Detalles

### Score de Capacidad

```typescript
if (candidateCap === originalCap) return 100;
if (candidateCap > originalCap) return max(85, ratio * 100);
if (candidateCap < originalCap) return ratio * 75; // Penalización 25%
```

### Score de Características

```typescript
// Jaccard Similarity
jaccardScore = (intersección / unión) * 100;

// Bonus si tiene todas las características originales
bonus = hasAllOriginal ? 10 : 0;

finalScore = min(100, jaccardScore + bonus);
```

### Score de Ubicación

```typescript
// Mismo edificio: +60 puntos
// Mismo piso: +40 puntos adicionales
// Diferente piso: bonus - (floorDiff * 10)

// Fallback: Levenshtein distance entre strings de ubicación
```

---

## 📈 Estadísticas y Análisis

### Métricas Disponibles

```typescript
// Estadísticas de aceptación
getAcceptanceStats(filters: {
  startDate?: Date;
  endDate?: Date;
  reason?: string;
}): {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  acceptanceRate: number;
}

// Recursos más usados
getMostUsedAlternatives(limit: 10): Array<{
  resourceId: string;
  resourceName: string;
  count: number;
  averageScore: number;
}>
```

---

## 🚀 Eventos Publicados

### `reassignment.suggested`

Publicado cuando se sugieren alternativas

```json
{
  "type": "reassignment.suggested",
  "payload": {
    "reservationId": "...",
    "userId": "...",
    "originalResourceId": "...",
    "newResourceId": "...",
    "similarityScore": 92.5,
    "reason": "MAINTENANCE",
    "alternatives": [...]
  }
}
```

### `reassignment.accepted`

Publicado cuando el usuario acepta

```json
{
  "type": "reassignment.accepted",
  "payload": {
    "reassignmentId": "...",
    "reservationId": "...",
    "newResourceId": "...",
    "userId": "..."
  }
}
```

### `reassignment.rejected`

Publicado cuando el usuario rechaza

```json
{
  "type": "reassignment.rejected",
  "payload": {
    "reassignmentId": "...",
    "reservationId": "...",
    "userId": "...",
    "feedback": "..."
  }
}
```

---

## 🔧 Optimizaciones de Rendimiento

### Índices MongoDB

- Compuesto: `(userId, createdAt desc)` - Historial por usuario
- Simple: `originalResourceId` - Buscar por recurso original
- Simple: `newResourceId` - Buscar por recurso nuevo
- Simple: `accepted` - Filtrar por estado

### Caching

- Candidatos de recursos se pueden cachear por tipo
- Información de recursos se consulta del Resources Service

---

## 📚 Archivos Creados/Modificados

### Schemas (1 nuevo)

- `reassignment-history.schema.ts`

### DTOs (1 nuevo)

- `reassignment.dto.ts` (8 DTOs)

### Repositories (1 nuevo)

- `reassignment-history.repository.ts` (8 métodos)

### Services (2 nuevos)

- `resource-similarity.service.ts` - Algoritmos de similitud
- `reassignment.service.ts` - Orquestación del proceso

### Commands (2 nuevos)

- `request-reassignment.command.ts`
- `respond-reassignment.command.ts`

### Queries (1 nuevo)

- `get-reassignment-history.query.ts`

### Handlers (3 nuevos)

- `request-reassignment.handler.ts`
- `respond-reassignment.handler.ts`
- `get-reassignment-history.handler.ts`

### Controllers (1 nuevo)

- `reassignment.controller.ts` (4 endpoints)

### Module Integration

- `availability.module.ts` - Integración completa

**Total**: 12 archivos nuevos + 3 modificados

---

## ✅ Criterios de Aceptación

- [x] Algoritmo de similitud multi-criterio funcional
- [x] Pesos configurables por solicitud
- [x] Score mínimo de 60% para sugerencias
- [x] Top 5 alternativas ordenadas por score
- [x] Registro completo en historial
- [x] Notificaciones automáticas via eventos
- [x] API REST con seguridad
- [x] Tracking de aceptación/rechazo
- [x] Estadísticas de análisis
- [x] Documentación completa

---

## 🚀 Próximos Pasos Recomendados

### Opción 1: Integración con Resources Service

- Consulta real de recursos vía HTTP/gRPC
- Sincronización de metadatos
- Cache distribuido

### Opción 2: Machine Learning

- Aprendizaje de preferencias de usuario
- Ajuste dinámico de pesos
- Predicción de aceptación

### Opción 3: Notificaciones Avanzadas

- Email con comparativa visual
- WhatsApp/SMS para urgentes
- Push notifications en app móvil

---

## 📝 Notas de Implementación

### TODO para Producción

- [ ] Integrar con Resources Service (actualmente mock)
- [ ] Implementar cache Redis para candidatos
- [ ] Agregar tests unitarios para algoritmos
- [ ] Implementar rate limiting en endpoints
- [ ] Crear dashboard de métricas
- [ ] Documentar fórmulas de scoring en wiki

### Consideraciones

- El algoritmo de similitud es extensible
- Los pesos pueden ajustarse por tipo de recurso
- El score mínimo (60%) es configurable
- La integración con Resources Service es el siguiente paso crítico

---

**Documentación creada**: Noviembre 8, 2025  
**Versión**: 1.0  
**Mantenido por**: Availability Service Team
