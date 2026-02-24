# 🔄 [Service Name] - Event Bus

**Fecha**: [Fecha]  
**Versión**: 1.0

---

## 📋 Índice

- [Visión General](#visión-general)
- [Eventos Publicados](#eventos-publicados)
- [Eventos Consumidos](#eventos-consumidos)
- [Configuración](#configuración)
- [Patrones de Implementación](#patrones-de-implementación)

---

## 🎯 Visión General

El **[Service Name]** [publica/consume] eventos para [propósito].

### Características

- **Event-Driven Architecture**: Publicación/consumo asíncrono
- **RabbitMQ**: Message broker
- **Desacoplamiento**: Comunicación sin dependencias directas
- **Auditoría**: Registro de eventos

---

## 📤 Eventos Publicados

### 1. [EventName1]

**Routing Key**: `[service].[resource].[action]`

**Descripción**: Se publica cuando [descripción del trigger].

**Payload**:

```typescript
interface EventName1 {
  eventId: string;
  timestamp: Date;
  data: {
    field1: string;
    field2: number;
    field3: boolean;
  };
  metadata: {
    userId?: string;
    correlationId: string;
    ip?: string;
  };
}
```

**Ejemplo**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-06T20:00:00.000Z",
  "data": {
    "field1": "value1",
    "field2": 123,
    "field3": true
  },
  "metadata": {
    "userId": "507f1f77bcf86cd799439011",
    "correlationId": "req-123456",
    "ip": "192.168.1.100"
  }
}
```

**Servicios que Escuchan**:

- **[Service 1]**: [Acción que realiza]
- **[Service 2]**: [Acción que realiza]

---

### 2. [EventName2]

**Routing Key**: `[service].[resource].[action]`

**Descripción**: [Descripción del evento]

**Payload**:

```typescript
interface EventName2 {
  eventId: string;
  timestamp: Date;
  data: {
    // ... campos
  };
}
```

**Servicios que Escuchan**:

- **[Service]**: [Acción]

---

## 📥 Eventos Consumidos

### 1. [ExternalEventName1]

**Routing Key**: `[external-service].[resource].[action]`

**Descripción**: Evento consumido de [servicio externo].

**Handler**: `ExternalEventName1Handler`

**Payload Esperado**:

```typescript
interface ExternalEventName1 {
  eventId: string;
  timestamp: Date;
  data: {
    field1: string;
    field2: number;
  };
}
```

**Acción al Recibir**:

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]

**Ejemplo de Handler**:

```typescript
@Injectable()
export class ExternalEventName1Handler {
  async handle(event: ExternalEventName1): Promise<void> {
    // Lógica de procesamiento
    this.logger.log(`Processing event: ${event.eventId}`);

    // Realizar acción
    await this.service.doSomething(event.data);
  }
}
```

---

### 2. [ExternalEventName2]

**Routing Key**: `[external-service].[resource].[action]`

**Handler**: `ExternalEventName2Handler`

**Acción**: [Descripción de la acción]

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=bookly-events
RABBITMQ_QUEUE=[service-name]-queue

# Retry Policy
EVENT_RETRY_ATTEMPTS=3
EVENT_RETRY_DELAY=1000
```

---

### Configuración en NestJS

```typescript
// [service].module.ts
import { EventBusModule } from "@bookly/event-bus";

@Module({
  imports: [
    EventBusModule.forRoot({
      exchange: "bookly-events",
      exchangeType: "topic",
      connectionOptions: {
        url: process.env.RABBITMQ_URL,
      },
    }),
  ],
})
export class ServiceModule {}
```

---

## 🎨 Patrones de Implementación

### Publicación de Eventos

```typescript
import { Injectable } from "@nestjs/common";
import { EventBusService } from "@bookly/event-bus";
import { v4 as uuid } from "uuid";

@Injectable()
export class Service1 {
  constructor(private readonly eventBus: EventBusService) {}

  async performAction(dto: ActionDto): Promise<Result> {
    // 1. Realizar acción
    const result = await this.repository.action(dto);

    // 2. Publicar evento
    const event: EventName1 = {
      eventId: uuid(),
      timestamp: new Date(),
      data: {
        field1: result.field1,
        field2: result.field2,
        field3: result.field3,
      },
      metadata: {
        userId: this.requestContext.getUserId(),
        correlationId: this.requestContext.getCorrelationId(),
        ip: this.requestContext.getIp(),
      },
    };

    await this.eventBus.publish("[service].[resource].[action]", event);

    // 3. Registrar en auditoría (opcional)
    await this.auditService.log({
      action: "action_performed",
      resourceId: result.id,
      success: true,
    });

    return result;
  }
}
```

---

### Consumo de Eventos

```typescript
import { Injectable } from "@nestjs/common";
import { EventHandler } from "@bookly/event-bus";

@Injectable()
@EventHandler("external-service.resource.action")
export class ExternalEventHandler {
  constructor(private readonly service: SomeService) {}

  async handle(event: ExternalEvent): Promise<void> {
    try {
      this.logger.log(`Received event: ${event.eventId}`);

      // Procesar evento
      await this.service.processEvent(event.data);

      this.logger.log(`Event processed successfully: ${event.eventId}`);
    } catch (error) {
      this.logger.error(`Error processing event: ${event.eventId}`, error);
      throw error; // Re-throw para retry automático
    }
  }
}
```

---

### Manejo de Errores en Publicación

```typescript
async publishEvent(routingKey: string, event: any): Promise<void> {
  try {
    await this.eventBus.publish(routingKey, event);
    this.logger.log(`Event published: ${routingKey}`, {
      eventId: event.eventId
    });
  } catch (error) {
    this.logger.error(`Failed to publish event: ${routingKey}`, {
      eventId: event.eventId,
      error: error.message,
    });

    // Guardar en DLQ o cola de reintentos
    await this.saveToRetryQueue(routingKey, event);
  }
}
```

---

### Event Metadata Estándar

Todos los eventos incluyen metadata común:

```typescript
interface EventMetadata {
  userId?: string;
  correlationId: string;
  timestamp: Date;
  service: "[service-name]";
  version: "1.0";
  ip?: string;
  userAgent?: string;
}
```

---

## 📊 Métricas de Eventos

### Prometheus Metrics

```typescript
// Eventos publicados
[service]_events_published_total{event_type="event_name"} 150

// Eventos consumidos
[service]_events_consumed_total{event_type="event_name"} 145

// Latencia de publicación
[service]_event_publish_duration_seconds{event_type="event_name"} 0.015
```

---

## 🔍 Debugging

### Ver Eventos en RabbitMQ

```bash
# Management UI
http://localhost:15672

# CLI
rabbitmqadmin get queue=[service]-queue count=10
```

### Logs de Eventos

```typescript
[EventBus] Event published: [service].[resource].[action]
  eventId: 550e8400-e29b-41d4-a716-446655440000
  timestamp: 2025-11-06T20:00:00.000Z
```

---

## 📚 Referencias

- [Arquitectura](ARCHITECTURE.md)
- [Endpoints](ENDPOINTS.md)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

---

**Mantenedores**: Bookly Development Team  
**Última actualización**: [Fecha]
