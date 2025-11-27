# RF-15: Reasignación Automática

**Estado**: ✅ Completado

**Prioridad**: Media

**Fecha de Implementación**: Noviembre 6, 2025

---

## 📋 Descripción

Sistema inteligente de sugerencias de recursos alternativos basado en algoritmo de similitud multicriterio cuando el recurso original no está disponible, con validación automática de disponibilidad.

---

## ✅ Criterios de Aceptación

- [x] Algoritmo de similitud basado en múltiples criterios
- [x] Sugerencias automáticas ordenadas por score
- [x] Filtros: capacidad, equipamiento, ubicación
- [x] Verificación de disponibilidad en tiempo real
- [x] Usuario puede aceptar o rechazar sugerencias
- [x] Historial de reasignaciones
- [x] Máximo 5 sugerencias por solicitud
- [x] Penalización por distancia de ubicación

---

## 🏗️ Implementación

### Componentes Desarrollados

**Services**:

- `ReassignmentService` - Lógica de reasignación
- `SimilarityScoreService` - Cálculo de similitud

**Commands**:

- `RequestReassignmentCommand` - Solicitar reasignación
- `AcceptReassignmentCommand` - Aceptar sugerencia
- `RejectReassignmentCommand` - Rechazar

**Queries**:

- `GetReassignmentSuggestionsQuery` - Obtener sugerencias

---

### Algoritmo de Similitud

```typescript
similarityScore =
  (capacityMatch * 0.3 + // Capacidad similar
    equipmentMatch * 0.25 + // Equipamiento coincide
    locationScore * 0.2 + // Ubicación cercana
    typeMatch * 0.15 + // Mismo tipo
    availabilityScore * 0.1) * // Alta disponibilidad
  100;
```

**Criterios**:

- Capacidad: ±20% del original
- Equipamiento: 80%+ de match
- Ubicación: Mismo edificio/piso preferido
- Tipo: Mismo tipo prioritario

---

### Endpoints Creados

```http
POST /api/reassignment/request        # Solicitar reasignación
GET  /api/reassignment/suggestions/:id # Ver sugerencias
POST /api/reassignment/:id/accept     # Aceptar
POST /api/reassignment/:id/reject     # Rechazar
```

---

## 🗄️ Base de Datos

```prisma
model ReassignmentRequest {
  id               String   @id @default(auto()) @map("_id") @db.ObjectId

  userId           String   @db.ObjectId
  originalResourceId String @db.ObjectId

  suggestions      Json[]   // Array de { resourceId, score, reason }

  status           String   @default("PENDING") // PENDING, ACCEPTED, REJECTED
  acceptedResourceId String? @db.ObjectId

  createdAt        DateTime @default(now())
  resolvedAt       DateTime?

  @@index([userId])
  @@map("reassignment_requests")
}
```

---

## ⚡ Performance

- Cache de recursos similares precalculados
- Búsqueda optimizada con índices geoespaciales
- Límite de 5 sugerencias para respuesta rápida

---

## 📚 Documentación Relacionada

- [Base de Datos](../DATABASE.md#5-reassignmentrequest)

---

**Mantenedor**: Bookly Development Team
