# RF-09: Búsqueda Avanzada de Recursos

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 1, 2025

---

## 📋 Descripción

Sistema de búsqueda avanzada de recursos disponibles con múltiples filtros combinables (tipo, capacidad, ubicación, equipamiento) y sugerencias inteligentes de horarios disponibles basadas en patrones de uso.

---

## ✅ Criterios de Aceptación

- [x] Filtros múltiples: tipo, capacidad, ubicación, equipamiento
- [x] Búsqueda por rango de fechas y horarios
- [x] Ordenamiento por relevancia y disponibilidad
- [x] Sugerencias automáticas de slots disponibles
- [x] Búsqueda de texto libre en nombre y descripción
- [x] Filtros por atributos personalizados
- [x] Paginación de resultados
- [x] Cache de búsquedas frecuentes

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `SearchController` - Endpoint de búsqueda avanzada

**Services**:

- `AvailabilitySearchService` - Lógica de búsqueda y filtrado
- `RelevanceService` - Algoritmo de ordenamiento por relevancia
- `SlotSuggestionService` - Sugerencias de horarios

**Repositories**:

- `PrismaReservationRepository` - Query optimizada con índices
- `PrismaAvailabilityRepository` - Filtros de disponibilidad

**Queries**:

- `SearchAvailableResourcesQuery` - Búsqueda principal
- `GetSuggestedSlotsQuery` - Sugerencias de horarios
- `GetSimilarResourcesQuery` - Recursos similares

---

### Endpoints Creados

```http
POST /api/search/resources           # Búsqueda avanzada
GET  /api/search/suggestions/:resourceId  # Slots sugeridos
```

**Permisos Requeridos**:

- `availability:read` - Lectura

---

### Algoritmo de Relevancia

```typescript
// Scoring de relevancia
score =
  matchType * 10 + // Coincidencia exacta de tipo
  matchCapacity * 8 + // Capacidad adecuada
  matchLocation * 6 + // Ubicación preferida
  matchEquipment * 5 + // Equipamiento requerido
  availabilityScore * 3; // Disponibilidad alta
```

---

## 🗄️ Base de Datos

### Índices Optimizados

```javascript
db.reservations.createIndex({
  resourceId: 1,
  startDate: 1,
  endDate: 1,
  status: 1,
});

db.resources.createIndex({
  type: 1,
  capacity: 1,
  location: 1,
  isActive: 1,
});
```

---

## 🧪 Testing

- **Líneas**: 91%
- **Funciones**: 94%

---

## ⚡ Performance

- Índices compuestos para queries complejas
- Cache de búsquedas frecuentes (TTL: 10 minutos)
- Paginación para resultados grandes
- Query optimization con explain()

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md)
- [Endpoints](../ENDPOINTS.md)

---

**Mantenedor**: Bookly Development Team
