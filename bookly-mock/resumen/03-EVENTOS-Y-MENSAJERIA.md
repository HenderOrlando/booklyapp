# 03 - Eventos y Mensajería (Event-Driven Architecture)

## 📋 Objetivo

Garantizar que todos los microservicios publiquen y consuman eventos de manera consistente usando el Event Bus (RabbitMQ/Kafka) y Redis para cache.

---

## ✅ Estado Actual en bookly-mock

### ✓ Implementado Correctamente

1. **Event Bus Library**
   - ✅ `libs/event-bus/` implementado
   - ✅ Soporte para Kafka y RabbitMQ
   - ✅ Event Store para persistencia
   - ✅ Dead Letter Queue (DLQ)
   - ✅ Retry mechanism

2. **Redis Cache**
   - ✅ `libs/redis/` implementado
   - ✅ Cache manager configurado
   - ✅ TTL configurable

3. **Eventos de Dominio**
   - ✅ Eventos definidos en `domain/events/`
   - ✅ Event handlers en `application/event-handlers/`

---

## 🎯 Tareas por Completar

### Tarea 3.1: Documentar Todos los Eventos por Servicio

**Objetivo**: Crear archivo `EVENT_BUS.md` en cada servicio con todos los eventos publicados y consumidos.

**Estructura del documento**:

```markdown
# Event Bus - [Nombre del Servicio]

## Eventos Publicados

### RESOURCE_CREATED
- **Descripción**: Se publica cuando se crea un nuevo recurso
- **Payload**:
  ```typescript
  {
    resourceId: string;
    name: string;
    categoryId: string;
    programId: string;
    createdBy: string;
    createdAt: Date;
  }
  ```
- **Consumidores**: availability-service, reports-service

## Eventos Consumidos

### USER_CREATED
- **Descripción**: Se consume cuando se crea un nuevo usuario
- **Publicado por**: auth-service
- **Handler**: `UserCreatedHandler`
- **Acción**: Inicializar preferencias de usuario
```

**Acción**: Crear/actualizar `EVENT_BUS.md` en:
- ✅ `apps/auth-service/docs/EVENT_BUS.md`
- ⚠️ `apps/resources-service/docs/EVENT_BUS.md`
- ⚠️ `apps/availability-service/docs/EVENT_BUS.md`
- ⚠️ `apps/stockpile-service/docs/EVENT_BUS.md`
- ⚠️ `apps/reports-service/docs/EVENT_BUS.md`

---

### Tarea 3.2: Implementar Eventos Faltantes

**Objetivo**: Asegurar que todas las operaciones críticas publiquen eventos.

**Eventos requeridos por servicio**:

#### auth-service
- ✅ `USER_REGISTERED`
- ✅ `USER_LOGGED_IN`
- ✅ `USER_LOGGED_OUT`
- ✅ `PASSWORD_CHANGED`
- ✅ `PASSWORD_RESET_REQUESTED`
- ✅ `2FA_ENABLED`
- ✅ `2FA_DISABLED`
- ✅ `ROLE_ASSIGNED`
- ✅ `PERMISSION_GRANTED`

#### resources-service
- ✅ `RESOURCE_CREATED`
- ✅ `RESOURCE_UPDATED`
- ✅ `RESOURCE_DELETED`
- ⚠️ `RESOURCE_AVAILABILITY_CHANGED`
- ⚠️ `MAINTENANCE_SCHEDULED`
- ⚠️ `MAINTENANCE_COMPLETED`
- ⚠️ `CATEGORY_CREATED`
- ⚠️ `CATEGORY_UPDATED`

#### availability-service
- ✅ `RESERVATION_CREATED`
- ✅ `RESERVATION_UPDATED`
- ✅ `RESERVATION_CANCELLED`
- ⚠️ `RESERVATION_CONFIRMED`
- ⚠️ `RESERVATION_REJECTED`
- ⚠️ `WAITING_LIST_ADDED`
- ⚠️ `WAITING_LIST_NOTIFIED`
- ⚠️ `SCHEDULE_CONFLICT_DETECTED`

#### stockpile-service
- ⚠️ `APPROVAL_REQUESTED`
- ⚠️ `APPROVAL_GRANTED`
- ⚠️ `APPROVAL_REJECTED`
- ⚠️ `DOCUMENT_GENERATED`
- ⚠️ `CHECK_IN_COMPLETED`
- ⚠️ `CHECK_OUT_COMPLETED`

#### reports-service
- ⚠️ `REPORT_GENERATED`
- ⚠️ `FEEDBACK_SUBMITTED`
- ⚠️ `DASHBOARD_UPDATED`

**Acción**: Implementar eventos faltantes (⚠️) en cada servicio.

---

### Tarea 3.3: Implementar Event Handlers

**Objetivo**: Crear handlers para consumir eventos de otros servicios.

**Patrón correcto**:

```typescript
// apps/availability-service/src/application/event-handlers/resource-created.handler.ts
import { Injectable } from '@nestjs/common';
import { EventHandler } from '@libs/event-bus';

@Injectable()
export class ResourceCreatedHandler {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @EventHandler('resources.created')
  async handle(event: ResourceCreatedEvent) {
    // Crear disponibilidad inicial para el recurso
    await this.availabilityService.initializeAvailability({
      resourceId: event.data.resourceId,
      defaultSchedule: event.data.defaultSchedule,
    });
  }
}
```

**Handlers requeridos**:

| Servicio | Evento Consumido | Handler | Estado |
|----------|------------------|---------|--------|
| availability-service | RESOURCE_CREATED | ResourceCreatedHandler | ⚠️ |
| availability-service | RESOURCE_DELETED | ResourceDeletedHandler | ⚠️ |
| availability-service | MAINTENANCE_SCHEDULED | MaintenanceScheduledHandler | ⚠️ |
| stockpile-service | RESERVATION_CREATED | ReservationCreatedHandler | ⚠️ |
| stockpile-service | USER_CREATED | UserCreatedHandler | ⚠️ |
| reports-service | RESERVATION_CREATED | ReservationCreatedHandler | ⚠️ |
| reports-service | RESERVATION_CANCELLED | ReservationCancelledHandler | ⚠️ |
| reports-service | FEEDBACK_SUBMITTED | FeedbackSubmittedHandler | ⚠️ |

**Acción**: Implementar handlers faltantes en cada servicio.

---

### Tarea 3.4: Implementar Cache con Redis

**Objetivo**: Usar Redis para cachear datos frecuentemente consultados.

**Patrón correcto**:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@libs/redis';

@Injectable()
export class ResourceService {
  constructor(
    private readonly redisService: RedisService,
    private readonly repository: ResourceRepository,
  ) {}

  async findById(id: string): Promise<Resource> {
    // Intentar obtener del cache
    const cacheKey = `resource:${id}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Si no está en cache, obtener de DB
    const resource = await this.repository.findById(id);
    
    if (resource) {
      // Guardar en cache por 1 hora
      await this.redisService.set(
        cacheKey,
        JSON.stringify(resource),
        3600
      );
    }

    return resource;
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.repository.update(id, dto);
    
    // Invalidar cache
    await this.redisService.del(`resource:${id}`);
    
    return resource;
  }
}
```

**Datos a cachear**:

| Servicio | Dato | TTL | Estado |
|----------|------|-----|--------|
| auth-service | Roles y permisos | 1 hora | ⚠️ |
| auth-service | Sesiones activas | 15 min | ✅ |
| resources-service | Recursos por ID | 30 min | ⚠️ |
| resources-service | Categorías | 1 hora | ⚠️ |
| availability-service | Disponibilidad | 5 min | ⚠️ |
| availability-service | Reservas activas | 10 min | ⚠️ |

**Acción**: Implementar cache en servicios críticos.

---

### Tarea 3.5: Implementar Invalidación de Cache

**Objetivo**: Invalidar cache cuando los datos cambian.

**Estrategias**:

1. **Invalidación directa** (después de update/delete):
```typescript
await this.redisService.del(`resource:${id}`);
```

2. **Invalidación por patrón** (para listas):
```typescript
await this.redisService.delPattern('resources:list:*');
```

3. **Invalidación por evento** (cross-service):
```typescript
@EventHandler('resources.updated')
async handle(event: ResourceUpdatedEvent) {
  await this.redisService.del(`resource:${event.data.resourceId}`);
}
```

**Acción**: Implementar invalidación en todos los métodos de actualización.

---

### Tarea 3.6: Implementar Event Sourcing (Opcional)

**Objetivo**: Persistir todos los eventos en Event Store para auditoría y replay.

**Patrón correcto**:

```typescript
import { EventStore } from '@libs/event-bus';

@Injectable()
export class ResourceService {
  constructor(private readonly eventStore: EventStore) {}

  async create(dto: CreateResourceDto) {
    const resource = await this.repository.save(dto);
    
    // Persistir evento
    await this.eventStore.append({
      aggregateId: resource.id,
      aggregateType: 'Resource',
      eventType: 'RESOURCE_CREATED',
      data: resource,
      metadata: {
        userId: dto.createdBy,
        timestamp: new Date(),
      },
    });

    return resource;
  }
}
```

**Acción**: Evaluar si implementar Event Sourcing completo o solo auditoría de eventos.

---

### Tarea 3.7: Documentar AsyncAPI

**Objetivo**: Crear especificación AsyncAPI para cada servicio.

**Estructura**:

```yaml
# apps/resources-service/asyncapi.yml
asyncapi: '2.6.0'
info:
  title: Resources Service Events
  version: '1.0.0'
  description: Events published and consumed by Resources Service

channels:
  resources.created:
    publish:
      message:
        name: ResourceCreated
        payload:
          type: object
          properties:
            resourceId:
              type: string
            name:
              type: string
            categoryId:
              type: string

  resources.updated:
    publish:
      message:
        name: ResourceUpdated
        payload:
          type: object
          properties:
            resourceId:
              type: string
            changes:
              type: object
```

**Acción**: Crear `asyncapi.yml` en cada servicio.

---

## 📊 Métricas de Cumplimiento

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| Documentación de eventos | 40% | Alta |
| Eventos implementados | 60% | Alta |
| Event handlers | 30% | Alta |
| Cache con Redis | 40% | Media |
| Invalidación de cache | 30% | Media |
| Event Sourcing | 0% | Baja |
| AsyncAPI documentation | 0% | Media |

---

## 🔗 Referencias

- `libs/event-bus/` - Implementación del Event Bus
- `libs/redis/` - Implementación de Redis
- [AsyncAPI Specification](https://www.asyncapi.com/)
- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)

---

**Última actualización**: 30 de noviembre de 2024  
**Responsable**: Equipo Bookly  
**Siguiente revisión**: Tarea 3.1
