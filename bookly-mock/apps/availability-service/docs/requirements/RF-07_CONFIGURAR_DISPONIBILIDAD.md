# RF-07: Configurar Horarios Disponibles

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Octubre 30, 2025

---

## 📋 Descripción

Implementar sistema de configuración de horarios de disponibilidad para recursos, permitiendo definir reglas por día de semana, excepciones para fechas específicas, y bloqueos automáticos por mantenimiento. Base para validación de reservas.

---

## ✅ Criterios de Aceptación

- [x] Configurar horarios por día de semana (lunes a domingo)
- [x] Definir horario de inicio y fin por día
- [x] Excepciones para días específicos (feriados, eventos)
- [x] Bloqueos automáticos por mantenimiento
- [x] Configuración heredable desde categoría de recurso
- [x] API para crear y actualizar reglas de disponibilidad
- [x] Validación de rangos horarios (startTime < endTime)

---

## 🏗️ Implementación

### Componentes Desarrollados

**Controllers**:

- `AvailabilityController` - CRUD de reglas de disponibilidad

**Services**:

- `AvailabilityService` - Lógica de configuración de horarios
- `ScheduleService` - Gestión de excepciones y bloqueos

**Repositories**:

- `PrismaAvailabilityRepository` - Persistencia de reglas
- `PrismaScheduleRepository` - Excepciones y reglas especiales

**Commands**:

- `ConfigureAvailabilityCommand` - Configurar horarios
- `AddExceptionCommand` - Agregar excepción de fecha
- `BlockByMaintenanceCommand` - Bloquear por mantenimiento

**Queries**:

- `GetAvailabilityRulesQuery` - Obtener reglas de recurso
- `GetExceptionsQuery` - Obtener excepciones

---

### Endpoints Creados

```http
GET    /api/availability/:resourceId/rules  # Obtener reglas
POST   /api/availability/:resourceId/rules  # Configurar horarios
PATCH  /api/availability/:resourceId/rules  # Actualizar reglas
POST   /api/availability/exceptions         # Agregar excepción
GET    /api/availability/exceptions         # Listar excepciones
```

**Permisos Requeridos**:

- `availability:read` - Lectura
- `availability:configure` - Configuración (administradores)

---

### Eventos Publicados

- `AvailabilityConfiguredEvent` - Cuando se configuran horarios
- `AvailabilityExceptionAddedEvent` - Cuando se agrega excepción
- `ResourceBlockedEvent` - Cuando se bloquea recurso

**Routing Keys**:

- `availability.configured`
- `availability.exception_added`
- `availability.resource_blocked`

---

## 🗄️ Base de Datos

### Entidades

**Availability**:

```prisma
model Availability {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  resourceId    String   @db.ObjectId

  dayOfWeek     Int      // 0=Sunday, 6=Saturday
  startTime     String   // HH:mm format
  endTime       String   // HH:mm format
  isAvailable   Boolean  @default(true)

  exceptionDate DateTime?
  exceptionReason String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([resourceId])
  @@index([dayOfWeek])
  @@index([exceptionDate])
  @@map("availabilities")
}
```

### Índices

```javascript
db.availabilities.createIndex({ resourceId: 1, dayOfWeek: 1 });
db.availabilities.createIndex({ exceptionDate: 1 });
```

---

## 🧪 Testing

### Tests Unitarios

```bash
npm run test -- availability.service.spec.ts
npm run test -- schedule.service.spec.ts
```

### Cobertura

- **Líneas**: 93%
- **Funciones**: 96%
- **Ramas**: 89%

---

## 🔒 Seguridad

- Solo administradores pueden configurar disponibilidad
- Validación de rangos horarios
- Prevención de solapamiento de excepciones

---

## ⚡ Performance

- Índices compuestos para queries por recurso y día
- Cache de reglas de disponibilidad (TTL: 15 minutos)

---

## 📚 Documentación Relacionada

- [Arquitectura](../ARCHITECTURE.md)
- [Base de Datos](../DATABASE.md#2-availability)
- [Endpoints](../ENDPOINTS.md#disponibilidad)

---

**Mantenedor**: Bookly Development Team
