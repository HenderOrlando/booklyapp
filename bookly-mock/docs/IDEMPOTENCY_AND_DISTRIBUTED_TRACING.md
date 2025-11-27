# Idempotencia y Distributed Tracing en Bookly

## 📋 Introducción

En sistemas distribuidos como Bookly, la **idempotencia** y el **distributed tracing** son esenciales para garantizar:

1. **Idempotencia**: Operaciones seguras ante reintentos y duplicados
2. **Distributed Tracing**: Trazabilidad completa de requests a través de microservicios
3. **Reliability**: Manejo robusto de fallos y reintentos

## 🎯 Campos del ResponseContext

### Distributed Tracing

```typescript
interface ResponseContext {
  // Correlation & Tracing
  correlationId?: string; // ID que conecta todas las operaciones relacionadas
  messageId?: string; // ID único del mensaje/evento actual
  causationId?: string; // ID del mensaje que causó este mensaje

  // Idempotency
  idempotencyKey?: string; // Clave de idempotencia del cliente

  // Retry Logic
  retryCount?: number; // Número de intentos realizados
  maxRetries?: number; // Máximo de reintentos permitidos
  ttl?: number; // Time to live en milisegundos
  expiresAt?: Date | string; // Timestamp de expiración

  // Metadata
  version?: string; // Versión del mensaje para evolución
  priority?: "low" | "normal" | "high" | "urgent";
}
```

### ¿Qué es cada campo?

#### 1. **correlationId**

- **Propósito**: Rastrear una operación a través de múltiples servicios
- **Generación**: Cliente o primer servicio en la cadena
- **Propagación**: Se pasa en todos los eventos/requests relacionados
- **Ejemplo**: `corr-user-123-reservation-create-20250120`

#### 2. **messageId**

- **Propósito**: Identificar únicamente este mensaje/evento específico
- **Generación**: Cada servicio genera uno nuevo para cada mensaje
- **Unicidad**: Debe ser globalmente único (UUID v4)
- **Ejemplo**: `msg-550e8400-e29b-41d4-a716-446655440000`

#### 3. **causationId**

- **Propósito**: ID del mensaje que causó este mensaje (para event sourcing)
- **Uso**: Reconstruir la cadena causal de eventos
- **Ejemplo**: Si evento A causa evento B, el causationId de B es el messageId de A

#### 4. **idempotencyKey**

- **Propósito**: Prevenir duplicación de operaciones críticas
- **Generación**: Cliente provee la clave
- **Validación**: Servidor verifica si ya procesó esta clave
- **TTL**: Típicamente 24 horas
- **Ejemplo**: `idmp-user-123-resource-create-20250120`

#### 5. **retryCount & maxRetries**

- **Propósito**: Controlar lógica de reintentos
- **Uso**: Decidir si reintentar o enviar a DLQ
- **Pattern**: Exponential backoff

#### 6. **ttl & expiresAt**

- **Propósito**: Prevenir procesamiento de mensajes obsoletos
- **Uso**: Eventos sensibles al tiempo

---

## 📚 Ejemplos Prácticos

### 1. Event Publishing con Idempotencia

```typescript
import { Injectable } from "@nestjs/common";
import { EventBus } from "@libs/event-bus";
import { ResponseUtil } from "@libs/common";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ReservationEventPublisher {
  constructor(private eventBus: EventBus) {}

  /**
   * Publicar evento de reserva creada con soporte completo
   */
  async publishReservationCreated(
    reservation: Reservation,
    correlationId: string,
    causationId?: string
  ) {
    const messageId = uuidv4();
    const idempotencyKey = `reservation-created-${reservation.id}`;

    const eventData = ResponseUtil.event(
      {
        reservationId: reservation.id,
        resourceId: reservation.resourceId,
        userId: reservation.userId,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: "CONFIRMED",
      },
      "RESERVATION_CREATED",
      "availability-service",
      "Reservation created successfully",
      {
        // Distributed Tracing
        correlationId,
        messageId,
        causationId,

        // Idempotency
        idempotencyKey,

        // Reliability
        retryCount: 0,
        maxRetries: 3,
        ttl: 300000, // 5 minutos
        expiresAt: new Date(Date.now() + 300000),

        // Metadata
        version: "1.0",
        priority: "high",
      }
    );

    await this.eventBus.publish("reservations.created", eventData);

    // Guardar messageId para tracking
    await this.saveMessageTracking(
      messageId,
      correlationId,
      "RESERVATION_CREATED"
    );
  }

  private async saveMessageTracking(
    messageId: string,
    correlationId: string,
    eventType: string
  ) {
    // Guardar en base de datos o cache para deduplicación
    await this.redis.setex(
      `message:${messageId}`,
      86400, // 24 horas
      JSON.stringify({ correlationId, eventType, processedAt: new Date() })
    );
  }
}
```

**Evento publicado:**

```json
{
  "success": true,
  "data": {
    "reservationId": "res-123",
    "resourceId": "resource-456",
    "userId": "user-789",
    "startDate": "2025-01-20T10:00:00Z",
    "endDate": "2025-01-20T12:00:00Z",
    "status": "CONFIRMED"
  },
  "message": "Reservation created successfully",
  "timestamp": "2025-01-20T09:00:00.000Z",
  "context": {
    "type": "event",
    "timestamp": "2025-01-20T09:00:00.000Z",
    "eventType": "RESERVATION_CREATED",
    "service": "availability-service",
    "correlationId": "corr-user-789-res-20250120",
    "messageId": "msg-550e8400-e29b-41d4-a716-446655440000",
    "causationId": "msg-previous-event-id",
    "idempotencyKey": "reservation-created-res-123",
    "retryCount": 0,
    "maxRetries": 3,
    "ttl": 300000,
    "expiresAt": "2025-01-20T09:05:00.000Z",
    "version": "1.0",
    "priority": "high"
  }
}
```

### 2. Event Handler con Deduplicación

```typescript
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { RedisService } from "@libs/redis";
import { LoggingService } from "@libs/logging";

@EventsHandler(ReservationCreatedEvent)
export class ReservationCreatedHandler
  implements IEventHandler<ReservationCreatedEvent>
{
  constructor(
    private redis: RedisService,
    private logger: LoggingService,
    private notificationService: NotificationService
  ) {}

  async handle(event: ReservationCreatedEvent) {
    const { context, data } = event.payload;

    // 1. Verificar idempotencia
    if (context.idempotencyKey) {
      const alreadyProcessed = await this.checkIdempotency(
        context.idempotencyKey
      );

      if (alreadyProcessed) {
        this.logger.info("Event already processed (idempotent)", {
          idempotencyKey: context.idempotencyKey,
          messageId: context.messageId,
          correlationId: context.correlationId,
        });
        return; // Skip processing
      }
    }

    // 2. Verificar TTL
    if (context.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(context.expiresAt);

      if (now > expiresAt) {
        this.logger.warn("Event expired, skipping", {
          messageId: context.messageId,
          expiresAt: context.expiresAt,
          now: now.toISOString(),
        });
        return;
      }
    }

    // 3. Procesar evento
    try {
      await this.processReservationCreated(data, context);

      // 4. Marcar como procesado (idempotencia)
      if (context.idempotencyKey) {
        await this.markAsProcessed(context.idempotencyKey, context.messageId);
      }

      // 5. Log exitoso con contexto completo
      this.logger.info("Reservation created event processed", {
        correlationId: context.correlationId,
        messageId: context.messageId,
        reservationId: data.reservationId,
        causationId: context.causationId,
      });
    } catch (error) {
      // 6. Manejo de reintentos
      if (context.retryCount < context.maxRetries) {
        this.logger.warn("Event processing failed, will retry", {
          correlationId: context.correlationId,
          messageId: context.messageId,
          retryCount: context.retryCount,
          maxRetries: context.maxRetries,
          error: error.message,
        });

        // Reencolar para retry
        throw error;
      } else {
        // Enviar a Dead Letter Queue
        this.logger.error("Max retries exceeded, sending to DLQ", error, {
          correlationId: context.correlationId,
          messageId: context.messageId,
          retryCount: context.retryCount,
        });

        await this.sendToDLQ(event, context, error);
      }
    }
  }

  private async checkIdempotency(idempotencyKey: string): Promise<boolean> {
    const exists = await this.redis.exists(`idempotency:${idempotencyKey}`);
    return exists === 1;
  }

  private async markAsProcessed(
    idempotencyKey: string,
    messageId: string
  ): Promise<void> {
    // Guardar por 24 horas
    await this.redis.setex(
      `idempotency:${idempotencyKey}`,
      86400,
      JSON.stringify({
        messageId,
        processedAt: new Date(),
        status: "completed",
      })
    );
  }

  private async processReservationCreated(
    data: any,
    context: ResponseContext
  ): Promise<void> {
    // Enviar notificación al usuario
    await this.notificationService.send({
      userId: data.userId,
      type: "RESERVATION_CONFIRMED",
      message: `Your reservation for ${data.resourceId} has been confirmed`,
      metadata: {
        reservationId: data.reservationId,
        correlationId: context.correlationId,
      },
    });
  }

  private async sendToDLQ(
    event: any,
    context: ResponseContext,
    error: Error
  ): Promise<void> {
    await this.eventBus.publish("dlq.failed-events", {
      originalEvent: event,
      context,
      error: {
        message: error.message,
        stack: error.stack,
      },
      failedAt: new Date(),
    });
  }
}
```

### 3. RPC Handler con Idempotencia

```typescript
import { EventPattern } from "@nestjs/microservices";
import { ResponseUtil } from "@libs/common";

@Injectable()
export class ResourceAvailabilityRpcHandler {
  constructor(
    private redis: RedisService,
    private availabilityService: AvailabilityService,
    private logger: LoggingService
  ) {}

  @EventPattern("resources.rpc.check-availability")
  async handleCheckAvailability(request: {
    resourceId: string;
    startDate: Date;
    endDate: Date;
    correlationId: string;
    messageId?: string;
    idempotencyKey?: string;
  }) {
    const messageId = request.messageId || uuidv4();

    // 1. Verificar si ya respondimos (idempotencia)
    if (request.idempotencyKey) {
      const cachedResponse = await this.getCachedRpcResponse(
        request.idempotencyKey
      );

      if (cachedResponse) {
        this.logger.info("Returning cached RPC response", {
          idempotencyKey: request.idempotencyKey,
          correlationId: request.correlationId,
        });

        return cachedResponse;
      }
    }

    // 2. Procesar request
    try {
      const available = await this.availabilityService.checkAvailability(
        request.resourceId,
        request.startDate,
        request.endDate
      );

      // 3. Crear respuesta
      const response = ResponseUtil.rpc(
        {
          resourceId: request.resourceId,
          available,
          conflicts: available
            ? []
            : await this.getConflicts(request.resourceId),
        },
        request.correlationId,
        available ? "Resource is available" : "Resource is not available",
        {
          messageId,
          idempotencyKey: request.idempotencyKey,
          priority: "normal",
        }
      );

      // 4. Cachear respuesta (idempotencia)
      if (request.idempotencyKey) {
        await this.cacheRpcResponse(
          request.idempotencyKey,
          response,
          3600 // 1 hora
        );
      }

      // 5. Log con contexto completo
      this.logger.info("RPC check-availability processed", {
        correlationId: request.correlationId,
        messageId,
        resourceId: request.resourceId,
        available,
      });

      return response;
    } catch (error) {
      this.logger.error("RPC check-availability failed", error, {
        correlationId: request.correlationId,
        messageId,
        resourceId: request.resourceId,
      });

      return ResponseUtil.rpc(
        null,
        request.correlationId,
        `Error checking availability: ${error.message}`,
        {
          messageId,
          idempotencyKey: request.idempotencyKey,
          priority: "high",
        }
      );
    }
  }

  private async getCachedRpcResponse(
    idempotencyKey: string
  ): Promise<any | null> {
    const cached = await this.redis.get(`rpc:response:${idempotencyKey}`);
    return cached ? JSON.parse(cached) : null;
  }

  private async cacheRpcResponse(
    idempotencyKey: string,
    response: any,
    ttl: number
  ): Promise<void> {
    await this.redis.setex(
      `rpc:response:${idempotencyKey}`,
      ttl,
      JSON.stringify(response)
    );
  }
}
```

### 4. WebSocket con Message Deduplication

```typescript
import { WebSocketGateway, SubscribeMessage } from "@nestjs/websockets";
import { ResponseUtil } from "@libs/common";
import { Socket } from "socket.io";

@WebSocketGateway()
export class NotificationsGateway {
  constructor(
    private redis: RedisService,
    private logger: LoggingService
  ) {}

  /**
   * Enviar notificación con garantía de entrega única
   */
  async sendNotification(
    userId: string,
    notification: Notification,
    correlationId?: string
  ) {
    const messageId = uuidv4();
    const idempotencyKey = `notification:${userId}:${notification.id}`;

    // Verificar si ya enviamos esta notificación
    const alreadySent = await this.checkNotificationSent(idempotencyKey);

    if (alreadySent) {
      this.logger.info("Notification already sent", {
        userId,
        notificationId: notification.id,
        idempotencyKey,
      });
      return;
    }

    const response = ResponseUtil.websocket(
      notification,
      "New notification",
      "/ws/notifications",
      {
        messageId,
        correlationId,
        idempotencyKey,
        priority: notification.priority || "normal",
      }
    );

    // Enviar a cliente
    this.server.to(userId).emit("notification:created", response);

    // Marcar como enviado
    await this.markNotificationSent(idempotencyKey, messageId);

    // Solicitar ACK del cliente
    this.waitForAck(userId, messageId, idempotencyKey);
  }

  @SubscribeMessage("notification:ack")
  async handleNotificationAck(
    client: Socket,
    payload: { messageId: string; idempotencyKey: string }
  ) {
    this.logger.info("Notification ACK received", {
      userId: client.data.userId,
      messageId: payload.messageId,
      idempotencyKey: payload.idempotencyKey,
    });

    // Marcar como confirmado
    await this.markNotificationAcknowledged(payload.idempotencyKey);
  }

  private async checkNotificationSent(
    idempotencyKey: string
  ): Promise<boolean> {
    return (
      (await this.redis.exists(`notification:sent:${idempotencyKey}`)) === 1
    );
  }

  private async markNotificationSent(
    idempotencyKey: string,
    messageId: string
  ): Promise<void> {
    await this.redis.setex(
      `notification:sent:${idempotencyKey}`,
      86400, // 24 horas
      JSON.stringify({ messageId, sentAt: new Date(), status: "sent" })
    );
  }

  private async markNotificationAcknowledged(
    idempotencyKey: string
  ): Promise<void> {
    await this.redis.setex(
      `notification:sent:${idempotencyKey}`,
      86400,
      JSON.stringify({ acknowledgedAt: new Date(), status: "acknowledged" })
    );
  }

  private async waitForAck(
    userId: string,
    messageId: string,
    idempotencyKey: string
  ): Promise<void> {
    // Esperar 5 segundos por ACK, sino reintentar
    setTimeout(async () => {
      const acked = await this.checkAcknowledged(idempotencyKey);

      if (!acked) {
        this.logger.warn("Notification not acknowledged, retrying", {
          userId,
          messageId,
          idempotencyKey,
        });

        // Reenviar notificación (será deduplicada si el cliente ya la recibió)
        // ... lógica de reenvío
      }
    }, 5000);
  }
}
```

---

## 🔧 Patrones de Implementación

### Pattern 1: Idempotency Store

```typescript
interface IdempotencyRecord {
  key: string;
  messageId: string;
  correlationId: string;
  status: "processing" | "completed" | "failed";
  result?: any;
  error?: string;
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class IdempotencyService {
  constructor(private redis: RedisService) {}

  async startOperation(
    idempotencyKey: string,
    correlationId: string,
    messageId: string,
    ttl: number = 86400
  ): Promise<"new" | "duplicate"> {
    const key = `idempotency:${idempotencyKey}`;

    // Intentar crear registro (NX = only if not exists)
    const created = await this.redis.set(
      key,
      JSON.stringify({
        messageId,
        correlationId,
        status: "processing",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttl * 1000),
      }),
      "EX",
      ttl,
      "NX"
    );

    return created === "OK" ? "new" : "duplicate";
  }

  async completeOperation(idempotencyKey: string, result: any): Promise<void> {
    const key = `idempotency:${idempotencyKey}`;
    const record = await this.redis.get(key);

    if (record) {
      const parsed = JSON.parse(record);
      parsed.status = "completed";
      parsed.result = result;
      parsed.completedAt = new Date();

      await this.redis.setex(key, 86400, JSON.stringify(parsed));
    }
  }

  async getOperationResult(idempotencyKey: string): Promise<any | null> {
    const key = `idempotency:${idempotencyKey}`;
    const record = await this.redis.get(key);

    if (!record) return null;

    const parsed = JSON.parse(record);
    return parsed.status === "completed" ? parsed.result : null;
  }
}
```

### Pattern 2: Correlation Chain

```typescript
@Injectable()
export class CorrelationService {
  constructor(private redis: RedisService) {}

  /**
   * Guardar relación entre eventos en una cadena
   */
  async recordEventChain(
    correlationId: string,
    messageId: string,
    causationId: string | null,
    eventType: string,
    service: string
  ): Promise<void> {
    const chainKey = `correlation:${correlationId}:chain`;

    await this.redis.rpush(
      chainKey,
      JSON.stringify({
        messageId,
        causationId,
        eventType,
        service,
        timestamp: new Date(),
      })
    );

    // Expirar después de 7 días
    await this.redis.expire(chainKey, 604800);
  }

  /**
   * Obtener toda la cadena de eventos
   */
  async getEventChain(correlationId: string): Promise<any[]> {
    const chainKey = `correlation:${correlationId}:chain`;
    const chain = await this.redis.lrange(chainKey, 0, -1);

    return chain.map((item) => JSON.parse(item));
  }

  /**
   * Reconstruir el árbol causal
   */
  async buildCausalTree(correlationId: string): Promise<any> {
    const chain = await this.getEventChain(correlationId);

    // Construir árbol basado en causationId
    const tree = {};
    const nodes = new Map();

    chain.forEach((event) => {
      nodes.set(event.messageId, {
        ...event,
        children: [],
      });
    });

    chain.forEach((event) => {
      const node = nodes.get(event.messageId);

      if (event.causationId) {
        const parent = nodes.get(event.causationId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        // Evento raíz
        tree[event.messageId] = node;
      }
    });

    return tree;
  }
}
```

---

## ✅ Mejores Prácticas

### 1. **Siempre usar correlationId**

```typescript
// ✅ Correcto
const correlationId = request.headers["x-correlation-id"] || uuidv4();
const event = ResponseUtil.event(data, "EVENT_TYPE", "service", message, {
  correlationId,
  messageId: uuidv4(),
});
```

### 2. **Generar idempotencyKey del lado del cliente**

```typescript
// ✅ Cliente genera clave predecible
const idempotencyKey = `create-reservation-${userId}-${resourceId}-${date}`;

fetch("/api/v1/reservations", {
  method: "POST",
  headers: {
    "Idempotency-Key": idempotencyKey,
    "X-Correlation-Id": correlationId,
  },
  body: JSON.stringify(reservationData),
});
```

### 3. **Verificar TTL antes de procesar**

```typescript
// ✅ Validar expiración
if (context.expiresAt && new Date() > new Date(context.expiresAt)) {
  logger.warn("Message expired", { messageId: context.messageId });
  return;
}
```

### 4. **Usar causationId en event sourcing**

```typescript
// ✅ Cadena de eventos
const event1 = ResponseUtil.event(
  data1,
  "USER_REGISTERED",
  "auth-service",
  null,
  {
    messageId: "msg-001",
    correlationId: "corr-123",
  }
);

const event2 = ResponseUtil.event(
  data2,
  "WELCOME_EMAIL_SENT",
  "notifications",
  null,
  {
    messageId: "msg-002",
    correlationId: "corr-123",
    causationId: "msg-001", // ← Causado por USER_REGISTERED
  }
);
```

### 5. **Implementar retry con exponential backoff**

```typescript
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s
setTimeout(() => retry(), delay);
```

---

## 📊 Monitoreo y Debugging

### Queries útiles en Redis

```bash
# Ver todas las claves de idempotencia activas
KEYS idempotency:*

# Ver cadena de eventos de un correlationId
LRANGE correlation:corr-123:chain 0 -1

# Ver estado de un mensaje específico
GET message:msg-550e8400-e29b-41d4-a716-446655440000

# Ver respuesta RPC cacheada
GET rpc:response:idmp-check-availability-res-123
```

### Dashboard de Distributed Tracing

```typescript
// API para visualizar cadena de eventos
@Get('tracing/:correlationId')
async getEventChain(@Param('correlationId') correlationId: string) {
  const chain = await this.correlationService.getEventChain(correlationId);
  const tree = await this.correlationService.buildCausalTree(correlationId);

  return ResponseUtil.success({
    correlationId,
    totalEvents: chain.length,
    chain,
    causalTree: tree,
    timeline: this.buildTimeline(chain)
  }, 'Event chain retrieved');
}
```

---

## 🎓 Conclusión

Con estos patrones implementados, Bookly garantiza:

✅ **Idempotencia** - Operaciones seguras ante duplicados  
✅ **Trazabilidad** - Seguimiento completo de requests  
✅ **Reliability** - Manejo robusto de fallos  
✅ **Debugging** - Fácil identificación de problemas  
✅ **Auditabilidad** - Log completo de todas las operaciones
