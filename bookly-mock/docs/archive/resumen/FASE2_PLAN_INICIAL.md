# 📋 Fase 2: Eventos y Comunicación - Plan Inicial

**Fecha de inicio**: 1 de diciembre de 2024  
**Estado**: 🚀 INICIANDO  
**Prioridad**: Alta

---

## 🎯 Objetivo General

Implementar completamente la arquitectura Event-Driven (EDA) en bookly-mock, garantizando:
- Comunicación asíncrona entre microservicios mediante eventos
- Cache distribuido con Redis para optimizar consultas
- Documentación completa de eventos (AsyncAPI)
- Respuestas estandarizadas para eventos y WebSockets

---

## 📊 Estado Actual de la Infraestructura

### ✅ Componentes Implementados

#### 1. Event Bus Library (`libs/event-bus/`)
- ✅ Abstracción unificada para Kafka y RabbitMQ
- ✅ Event Store para persistencia de eventos
- ✅ Event Sourcing con snapshots
- ✅ Dead Letter Queue (DLQ)
- ✅ Retry mechanism
- ✅ Health checks
- ✅ Auto-connect en `onModuleInit`

**Estado**: 100% implementado y listo para usar

#### 2. Redis Library (`libs/redis/`)
- ✅ Redis client con reconexión automática
- ✅ Cache manager configurado
- ✅ TTL configurable
- ✅ Métricas de cache
- ✅ Métodos: `get()`, `set()`, `del()`, `delPattern()`

**Estado**: 100% implementado y listo para usar

#### 3. Notifications Library (`libs/notifications/`)
- ✅ Sistema de notificaciones multi-canal
- ✅ Soporte para email, SMS, push, WebSocket
- ✅ Templates de notificaciones
- ✅ Queue de notificaciones

**Estado**: Implementado

---

## 📋 Eventos Actuales por Servicio

### auth-service
**Eventos en `src/domain/events/`**:
- ✅ `two-factor-disabled.event.ts`
- ✅ `two-factor-enabled.event.ts`
- ✅ `two-factor-verification-failed.event.ts`

**Eventos faltantes**:
- ⚠️ `USER_REGISTERED`
- ⚠️ `USER_LOGGED_IN`
- ⚠️ `USER_LOGGED_OUT`
- ⚠️ `PASSWORD_CHANGED`
- ⚠️ `PASSWORD_RESET_REQUESTED`
- ⚠️ `ROLE_ASSIGNED`
- ⚠️ `PERMISSION_GRANTED`

### resources-service
**Eventos en `src/application/events/`** (⚠️ debería estar en `domain/events/`):
- ✅ `availability-rules-updated.event.ts`
- ✅ `resource-category-changed.event.ts`
- ✅ `resource-status-changed.event.ts`

**Eventos faltantes**:
- ⚠️ `RESOURCE_CREATED`
- ⚠️ `RESOURCE_UPDATED`
- ⚠️ `RESOURCE_DELETED`
- ⚠️ `RESOURCE_AVAILABILITY_CHANGED`
- ⚠️ `MAINTENANCE_SCHEDULED`
- ⚠️ `MAINTENANCE_COMPLETED`
- ⚠️ `CATEGORY_CREATED`
- ⚠️ `CATEGORY_UPDATED`

### availability-service
**Eventos en `src/application/events/`** (⚠️ debería estar en `domain/events/`):
- ✅ `availability-rules-updated.event.ts`

**Eventos faltantes**:
- ⚠️ `RESERVATION_CREATED`
- ⚠️ `RESERVATION_UPDATED`
- ⚠️ `RESERVATION_CANCELLED`
- ⚠️ `RESERVATION_CONFIRMED`
- ⚠️ `RESERVATION_REJECTED`
- ⚠️ `WAITING_LIST_ADDED`
- ⚠️ `WAITING_LIST_NOTIFIED`
- ⚠️ `SCHEDULE_CONFLICT_DETECTED`

### stockpile-service
**Eventos en `src/domain/events/`**:
- ⚠️ Carpeta creada pero vacía (solo README)

**Eventos faltantes**:
- ⚠️ `APPROVAL_REQUESTED`
- ⚠️ `APPROVAL_GRANTED`
- ⚠️ `APPROVAL_REJECTED`
- ⚠️ `DOCUMENT_GENERATED`
- ⚠️ `CHECK_IN_COMPLETED`
- ⚠️ `CHECK_OUT_COMPLETED`

### reports-service
**Eventos en `src/domain/events/`**:
- ⚠️ Carpeta creada pero vacía (solo README)

**Eventos faltantes**:
- ⚠️ `REPORT_GENERATED`
- ⚠️ `FEEDBACK_SUBMITTED`
- ⚠️ `DASHBOARD_UPDATED`

---

## 🎯 Tareas de la Fase 2

### Tarea 3.1: Documentar Eventos por Servicio
**Objetivo**: Crear `EVENT_BUS.md` en cada servicio documentando eventos publicados y consumidos

**Estructura del documento**:
```markdown
# Event Bus - [Servicio]

## Eventos Publicados
### EVENTO_NOMBRE
- **Descripción**: ...
- **Payload**: { ... }
- **Consumidores**: [servicios]

## Eventos Consumidos
### EVENTO_NOMBRE
- **Publicado por**: [servicio]
- **Handler**: [HandlerClass]
- **Acción**: ...
```

**Entregables**:
- [ ] `apps/auth-service/docs/EVENT_BUS.md`
- [ ] `apps/resources-service/docs/EVENT_BUS.md`
- [ ] `apps/availability-service/docs/EVENT_BUS.md`
- [ ] `apps/stockpile-service/docs/EVENT_BUS.md`
- [ ] `apps/reports-service/docs/EVENT_BUS.md`

**Esfuerzo estimado**: 4-6 horas

---

### Tarea 3.2: Implementar Eventos Faltantes
**Objetivo**: Crear clases de eventos para todas las operaciones críticas

**Patrón de implementación**:
```typescript
// apps/[service]/src/domain/events/[event-name].event.ts
import { EventPayload } from '@libs/common/interfaces';

export class ResourceCreatedEvent implements EventPayload<ResourceCreatedData> {
  eventId: string;
  eventType: string = 'RESOURCE_CREATED';
  service: string = 'resources-service';
  timestamp: Date;
  data: ResourceCreatedData;
  aggregateId: string;
  aggregateType: string = 'Resource';
  version: number;
}

export interface ResourceCreatedData {
  resourceId: string;
  name: string;
  categoryId: string;
  programId: string;
  createdBy: string;
}
```

**Eventos a implementar por servicio**:

#### auth-service (7 eventos)
- [ ] `USER_REGISTERED`
- [ ] `USER_LOGGED_IN`
- [ ] `USER_LOGGED_OUT`
- [ ] `PASSWORD_CHANGED`
- [ ] `PASSWORD_RESET_REQUESTED`
- [ ] `ROLE_ASSIGNED`
- [ ] `PERMISSION_GRANTED`

#### resources-service (8 eventos)
- [ ] `RESOURCE_CREATED`
- [ ] `RESOURCE_UPDATED`
- [ ] `RESOURCE_DELETED`
- [ ] `RESOURCE_AVAILABILITY_CHANGED`
- [ ] `MAINTENANCE_SCHEDULED`
- [ ] `MAINTENANCE_COMPLETED`
- [ ] `CATEGORY_CREATED`
- [ ] `CATEGORY_UPDATED`

#### availability-service (8 eventos)
- [ ] `RESERVATION_CREATED`
- [ ] `RESERVATION_UPDATED`
- [ ] `RESERVATION_CANCELLED`
- [ ] `RESERVATION_CONFIRMED`
- [ ] `RESERVATION_REJECTED`
- [ ] `WAITING_LIST_ADDED`
- [ ] `WAITING_LIST_NOTIFIED`
- [ ] `SCHEDULE_CONFLICT_DETECTED`

#### stockpile-service (6 eventos)
- [ ] `APPROVAL_REQUESTED`
- [ ] `APPROVAL_GRANTED`
- [ ] `APPROVAL_REJECTED`
- [ ] `DOCUMENT_GENERATED`
- [ ] `CHECK_IN_COMPLETED`
- [ ] `CHECK_OUT_COMPLETED`

#### reports-service (3 eventos)
- [ ] `REPORT_GENERATED`
- [ ] `FEEDBACK_SUBMITTED`
- [ ] `DASHBOARD_UPDATED`

**Total**: 32 eventos  
**Esfuerzo estimado**: 8-10 horas

---

### Tarea 3.3: Implementar Event Handlers
**Objetivo**: Crear handlers para consumir eventos de otros servicios

**Patrón de implementación**:
```typescript
// apps/[service]/src/application/event-handlers/[event-name].handler.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';

@Injectable()
export class ResourceCreatedHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESOURCE_CREATED,
      'availability-group',
      this.handle.bind(this)
    );
  }

  async handle(event: ResourceCreatedEvent) {
    await this.availabilityService.initializeAvailability({
      resourceId: event.data.resourceId,
      defaultSchedule: event.data.defaultSchedule,
    });
  }
}
```

**Handlers requeridos**:

| Servicio | Evento Consumido | Handler | Acción |
|----------|------------------|---------|--------|
| availability-service | RESOURCE_CREATED | ResourceCreatedHandler | Inicializar disponibilidad |
| availability-service | RESOURCE_DELETED | ResourceDeletedHandler | Eliminar disponibilidad |
| availability-service | MAINTENANCE_SCHEDULED | MaintenanceScheduledHandler | Bloquear horarios |
| stockpile-service | RESERVATION_CREATED | ReservationCreatedHandler | Crear solicitud de aprobación |
| stockpile-service | USER_CREATED | UserCreatedHandler | Inicializar perfil |
| reports-service | RESERVATION_CREATED | ReservationCreatedHandler | Registrar en analytics |
| reports-service | RESERVATION_CANCELLED | ReservationCancelledHandler | Actualizar métricas |
| reports-service | FEEDBACK_SUBMITTED | FeedbackSubmittedHandler | Agregar a reportes |

**Total**: 8 handlers críticos  
**Esfuerzo estimado**: 6-8 horas

---

### Tarea 3.4: Implementar Cache con Redis
**Objetivo**: Cachear datos frecuentemente consultados

**Patrón de implementación**:
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
    const cacheKey = `resource:${id}`;
    const cached = await this.redisService.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const resource = await this.repository.findById(id);
    
    if (resource) {
      await this.redisService.set(
        cacheKey,
        JSON.stringify(resource),
        3600 // 1 hora
      );
    }

    return resource;
  }
}
```

**Datos a cachear**:

| Servicio | Dato | TTL | Prioridad |
|----------|------|-----|-----------|
| auth-service | Roles y permisos | 1 hora | Alta |
| auth-service | Sesiones activas | 15 min | Alta |
| resources-service | Recursos por ID | 30 min | Alta |
| resources-service | Categorías | 1 hora | Media |
| availability-service | Disponibilidad | 5 min | Alta |
| availability-service | Reservas activas | 10 min | Alta |

**Esfuerzo estimado**: 6-8 horas

---

### Tarea 3.5: Implementar Invalidación de Cache
**Objetivo**: Invalidar cache cuando los datos cambian

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
@Injectable()
export class ResourceUpdatedHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESOURCE_UPDATED,
      'cache-invalidation-group',
      this.handle.bind(this)
    );
  }

  async handle(event: ResourceUpdatedEvent) {
    await this.redisService.del(`resource:${event.data.resourceId}`);
  }
}
```

**Esfuerzo estimado**: 4-6 horas

---

### Tarea 2.3: Implementar ResponseUtil.event()
**Objetivo**: Estandarizar respuestas de eventos

**Implementación en `libs/common/src/utils/response.util.ts`**:
```typescript
static event<T>(
  eventType: string,
  data: T,
  message?: string,
): ApiResponseBookly<T> {
  return {
    code: 'EVT-0000',
    message: message || `Event ${eventType} processed successfully`,
    data,
    type: 'event',
    timestamp: new Date().toISOString(),
    metadata: {
      eventType,
      processedAt: new Date().toISOString(),
    },
  };
}
```

**Esfuerzo estimado**: 2 horas

---

### Tarea 2.4: Implementar ResponseUtil.websocket()
**Objetivo**: Estandarizar respuestas de WebSocket

**Implementación en `libs/common/src/utils/response.util.ts`**:
```typescript
static websocket<T>(
  event: string,
  data: T,
  room?: string,
): ApiResponseBookly<T> {
  return {
    code: 'WS-0000',
    message: `WebSocket event: ${event}`,
    data,
    type: 'websocket',
    timestamp: new Date().toISOString(),
    metadata: {
      event,
      room,
      sentAt: new Date().toISOString(),
    },
  };
}
```

**Esfuerzo estimado**: 2 horas

---

### Tarea 3.7: Documentar AsyncAPI
**Objetivo**: Crear especificación AsyncAPI para cada servicio

**Estructura**:
```yaml
# apps/[service]/asyncapi.yml
asyncapi: '2.6.0'
info:
  title: [Service] Events
  version: '1.0.0'
  description: Events published and consumed by [Service]

channels:
  [event.name]:
    publish:
      message:
        name: EventName
        payload:
          type: object
          properties:
            field1:
              type: string
```

**Entregables**:
- [ ] `apps/auth-service/asyncapi.yml`
- [ ] `apps/resources-service/asyncapi.yml`
- [ ] `apps/availability-service/asyncapi.yml`
- [ ] `apps/stockpile-service/asyncapi.yml`
- [ ] `apps/reports-service/asyncapi.yml`

**Esfuerzo estimado**: 4-6 horas

---

## 📊 Resumen de Esfuerzo

| Tarea | Esfuerzo | Prioridad |
|-------|----------|-----------|
| 3.1: Documentar eventos | 4-6 horas | Alta |
| 3.2: Implementar eventos | 8-10 horas | Alta |
| 3.3: Implementar handlers | 6-8 horas | Alta |
| 3.4: Implementar cache | 6-8 horas | Alta |
| 3.5: Invalidación de cache | 4-6 horas | Media |
| 2.3: ResponseUtil.event() | 2 horas | Media |
| 2.4: ResponseUtil.websocket() | 2 horas | Media |
| 3.7: AsyncAPI | 4-6 horas | Media |
| **TOTAL** | **36-52 horas** | - |

**Estimación**: 5-7 días de trabajo (1 desarrollador)

---

## 🎯 Orden de Ejecución Recomendado

### Semana 1 (Días 1-3)
1. **Tarea 3.2**: Implementar eventos faltantes (prioridad crítica)
2. **Tarea 3.1**: Documentar eventos en EVENT_BUS.md

### Semana 2 (Días 4-5)
3. **Tarea 3.3**: Implementar event handlers
4. **Tarea 3.4**: Implementar cache con Redis

### Semana 3 (Días 6-7)
5. **Tarea 3.5**: Implementar invalidación de cache
6. **Tarea 2.3 y 2.4**: Implementar ResponseUtil para eventos y WebSocket
7. **Tarea 3.7**: Documentar AsyncAPI

---

## 📝 Criterios de Aceptación

### Para considerar la Fase 2 completada:

- [ ] Todos los eventos críticos están implementados (32 eventos)
- [ ] Cada servicio tiene su `EVENT_BUS.md` documentado
- [ ] Los 8 handlers críticos están implementados y funcionando
- [ ] Cache de Redis implementado en servicios críticos
- [ ] Invalidación de cache funciona correctamente
- [ ] `ResponseUtil.event()` y `ResponseUtil.websocket()` implementados
- [ ] Cada servicio tiene su `asyncapi.yml`
- [ ] Todos los servicios están migrados a `EventBusModule`
- [ ] Tests unitarios para handlers y eventos (cobertura >80%)

---

## 🔗 Referencias

- [03-EVENTOS-Y-MENSAJERIA.md](./03-EVENTOS-Y-MENSAJERIA.md) - Guía detallada
- [libs/event-bus/README.md](../libs/event-bus/README.md) - Documentación del Event Bus
- [libs/redis/](../libs/redis/) - Implementación de Redis
- [AsyncAPI Specification](https://www.asyncapi.com/)

---

**Creado**: 1 de diciembre de 2024  
**Última actualización**: 1 de diciembre de 2024  
**Responsable**: Equipo Bookly  
**Estado**: 🚀 Listo para iniciar
