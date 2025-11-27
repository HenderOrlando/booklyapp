# 🔄 Resources Service - Event Bus

**Fecha**: Noviembre 6, 2025  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Eventos Publicados](#eventos-publicados)
- [Configuración](#configuración)

---

## 🎯 Visión General

El **Resources Service** publica eventos relacionados con la gestión de recursos físicos. Otros servicios escuchan estos eventos para mantener sincronización.

### Características

- **Event-Driven Architecture**: Comunicación asíncrona
- **RabbitMQ**: Message broker
- **Routing Keys**: `resources.*`

---

## 📤 Eventos Publicados

### 1. ResourceCreatedEvent

**Routing Key**: `resources.resource.created`

**Payload**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-06T20:00:00.000Z",
  "data": {
    "resourceId": "507f1f77bcf86cd799439011",
    "name": "Salón A-101",
    "code": "SAL-A101",
    "type": "ROOM",
    "categoryId": "507f1f77bcf86cd799439020",
    "capacity": 40,
    "location": "Edificio A",
    "createdBy": "507f1f77bcf86cd799439001"
  }
}
```

**Consumidores**:

- **Availability Service**: Crea calendario de disponibilidad
- **Reports Service**: Actualiza estadísticas

---

### 2. ResourceUpdatedEvent

**Routing Key**: `resources.resource.updated`

**Payload**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "timestamp": "2025-11-06T20:05:00.000Z",
  "data": {
    "resourceId": "507f1f77bcf86cd799439011",
    "changes": {
      "capacity": 45,
      "attributes": { "equipment": ["projector", "speakers"] }
    },
    "updatedBy": "507f1f77bcf86cd799439001"
  }
}
```

**Consumidores**:

- **Availability Service**: Actualiza información de recurso
- **Stockpile Service**: Actualiza validaciones

---

### 3. ResourceDeletedEvent

**Routing Key**: `resources.resource.deleted`

**Payload**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2025-11-06T20:10:00.000Z",
  "data": {
    "resourceId": "507f1f77bcf86cd799439011",
    "deletedBy": "507f1f77bcf86cd799439001"
  }
}
```

**Consumidores**:

- **Availability Service**: Cancela reservas futuras
- **Reports Service**: Actualiza estadísticas

---

### 4. ResourceMaintenanceScheduledEvent

**Routing Key**: `resources.maintenance.scheduled`

**Payload**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440003",
  "timestamp": "2025-11-06T20:15:00.000Z",
  "data": {
    "maintenanceId": "507f1f77bcf86cd799439030",
    "resourceId": "507f1f77bcf86cd799439011",
    "type": "PREVENTIVE",
    "scheduledDate": "2025-11-15T08:00:00Z"
  }
}
```

**Consumidores**:

- **Availability Service**: Bloquea horarios durante mantenimiento
- **Notification Service**: Notifica a usuarios afectados

---

### 5. CategoryCreatedEvent

**Routing Key**: `resources.category.created`

**Payload**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440004",
  "timestamp": "2025-11-06T20:20:00.000Z",
  "data": {
    "categoryId": "507f1f77bcf86cd799439021",
    "name": "Sala de Conferencias",
    "code": "CONFERENCE",
    "type": "RESOURCE_TYPE"
  }
}
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=bookly-events
RABBITMQ_QUEUE=resources-service-queue
```

---

### Publicación de Eventos

```typescript
@Injectable()
export class ResourceService {
  constructor(private readonly eventBus: EventBusService) {}

  async createResource(dto: CreateResourceDto): Promise<Resource> {
    const resource = await this.repository.create(dto);

    await this.eventBus.publish("resources.resource.created", {
      eventId: uuid(),
      timestamp: new Date(),
      data: {
        resourceId: resource.id,
        name: resource.name,
        code: resource.code,
        type: resource.type,
        categoryId: resource.categoryId,
        capacity: resource.capacity,
        location: resource.location,
        createdBy: dto.createdBy,
      },
    });

    return resource;
  }
}
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: Noviembre 6, 2025
