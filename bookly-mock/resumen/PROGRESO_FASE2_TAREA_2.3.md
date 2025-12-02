# 📊 Progreso Tarea 2.3: Implementar ResponseUtil.event()

**Fecha**: 1 de diciembre de 2024  
**Estado**: ✅ COMPLETADO  
**Prioridad**: Media

---

## 🎯 Objetivo

Implementar el método `ResponseUtil.event()` para estandarizar las respuestas de eventos en la arquitectura Event-Driven, proporcionando metadatos adicionales como correlationId, idempotencyKey, retry logic, y TTL.

---

## ✅ Estado Actual

### Método Ya Implementado ✅

El método `ResponseUtil.event()` ya existe en:
```
libs/common/src/utils/response.util.ts
```

**Firma del método**:
```typescript
static event<T>(
  data: T,
  eventType: string,
  service: string,
  message?: string,
  options?: {
    correlationId?: string;
    messageId?: string;
    causationId?: string;
    idempotencyKey?: string;
    retryCount?: number;
    maxRetries?: number;
    ttl?: number;
    expiresAt?: Date | string;
    version?: string;
    priority?: ResponseContextPriority;
  }
): ApiResponseBookly<T>
```

---

## 📋 Características del Método

### 1. Estructura de Respuesta

```typescript
{
  success: true,
  data: T,
  message?: string,
  timestamp: string,
  context: {
    type: 'EVENT',
    timestamp: string,
    eventType: string,
    service: string,
    correlationId?: string,
    messageId?: string,
    causationId?: string,
    idempotencyKey?: string,
    retryCount?: number,
    maxRetries?: number,
    ttl?: number,
    expiresAt?: Date | string,
    version?: string,
    priority?: 'low' | 'normal' | 'high' | 'critical'
  }
}
```

### 2. Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `data` | `T` | ✅ | Payload del evento |
| `eventType` | `string` | ✅ | Tipo de evento (ej: 'RESOURCE_CREATED') |
| `service` | `string` | ✅ | Servicio que emite el evento |
| `message` | `string` | ❌ | Mensaje descriptivo |
| `options` | `object` | ❌ | Opciones adicionales |

### 3. Opciones Disponibles

#### Trazabilidad
- **correlationId**: ID para rastrear flujos completos
- **messageId**: ID único del mensaje
- **causationId**: ID del evento que causó este evento

#### Idempotencia
- **idempotencyKey**: Clave para evitar procesamiento duplicado

#### Retry Logic
- **retryCount**: Número de reintentos realizados
- **maxRetries**: Máximo de reintentos permitidos

#### Expiración
- **ttl**: Tiempo de vida en segundos
- **expiresAt**: Fecha/hora de expiración

#### Versionado
- **version**: Versión del esquema del evento

#### Prioridad
- **priority**: Prioridad del evento (low, normal, high, critical)

---

## 📝 Guía de Uso

### Caso 1: Evento Simple

```typescript
import { ResponseUtil } from '@libs/common';
import { EventType } from '@libs/common/enums';

// Publicar evento simple
const response = ResponseUtil.event(
  { resourceId: '123', name: 'Sala A' },
  EventType.RESOURCE_CREATED,
  'resources-service',
  'Resource created successfully'
);

await eventBus.publish(EventType.RESOURCE_CREATED, response);
```

**Resultado**:
```json
{
  "success": true,
  "data": {
    "resourceId": "123",
    "name": "Sala A"
  },
  "message": "Resource created successfully",
  "timestamp": "2024-12-01T22:00:00.000Z",
  "context": {
    "type": "EVENT",
    "timestamp": "2024-12-01T22:00:00.000Z",
    "eventType": "resource.created",
    "service": "resources-service"
  }
}
```

---

### Caso 2: Evento con Trazabilidad

```typescript
// Evento que responde a otro evento
const response = ResponseUtil.event(
  { reservationId: '456', status: 'confirmed' },
  EventType.RESERVATION_CONFIRMED,
  'availability-service',
  'Reservation confirmed after approval',
  {
    correlationId: originalEvent.metadata.correlationId,
    causationId: originalEvent.metadata.messageId,
    messageId: generateUUID(),
  }
);
```

**Resultado**:
```json
{
  "success": true,
  "data": {
    "reservationId": "456",
    "status": "confirmed"
  },
  "message": "Reservation confirmed after approval",
  "timestamp": "2024-12-01T22:00:00.000Z",
  "context": {
    "type": "EVENT",
    "timestamp": "2024-12-01T22:00:00.000Z",
    "eventType": "reservation.confirmed",
    "service": "availability-service",
    "correlationId": "corr-123",
    "causationId": "msg-456",
    "messageId": "msg-789"
  }
}
```

---

### Caso 3: Evento con Idempotencia

```typescript
// Evento crítico que no debe procesarse dos veces
const response = ResponseUtil.event(
  { approvalId: '789', reservationId: '456', status: 'approved' },
  EventType.APPROVAL_GRANTED,
  'stockpile-service',
  'Approval granted',
  {
    idempotencyKey: `approval-${approvalId}-${Date.now()}`,
    messageId: generateUUID(),
  }
);
```

**Uso en el consumidor**:
```typescript
async handle(event: EventPayload<any>): Promise<void> {
  const idempotencyKey = event.context?.idempotencyKey;
  
  if (idempotencyKey) {
    // Verificar si ya procesamos este evento
    const processed = await redis.get(`idempotency:${idempotencyKey}`);
    if (processed) {
      this.logger.warn(`Event already processed: ${idempotencyKey}`);
      return;
    }
    
    // Marcar como procesado
    await redis.set(`idempotency:${idempotencyKey}`, 'true', 'EX', 86400);
  }
  
  // Procesar evento...
}
```

---

### Caso 4: Evento con Retry Logic

```typescript
// Evento con lógica de reintentos
const response = ResponseUtil.event(
  { notificationId: '999', userId: '123' },
  EventType.NOTIFICATION_SENT,
  'notification-service',
  'Notification sent',
  {
    retryCount: 2,
    maxRetries: 5,
    ttl: 3600, // 1 hora
  }
);
```

**Uso en el consumidor**:
```typescript
async handle(event: EventPayload<any>): Promise<void> {
  try {
    // Procesar evento...
  } catch (error) {
    const retryCount = event.context?.retryCount || 0;
    const maxRetries = event.context?.maxRetries || 3;
    
    if (retryCount < maxRetries) {
      // Republicar con retry incrementado
      const retryEvent = ResponseUtil.event(
        event.data,
        event.metadata.eventType,
        event.metadata.service,
        event.message,
        {
          ...event.context,
          retryCount: retryCount + 1,
        }
      );
      
      await eventBus.publish(event.metadata.eventType, retryEvent);
      this.logger.warn(`Event retry ${retryCount + 1}/${maxRetries}`);
    } else {
      this.logger.error(`Max retries reached for event`);
      // Enviar a Dead Letter Queue
    }
  }
}
```

---

### Caso 5: Evento con Prioridad

```typescript
// Evento crítico de mantenimiento
const response = ResponseUtil.event(
  { maintenanceId: '111', resourceId: '222', priority: 'critical' },
  EventType.MAINTENANCE_SCHEDULED,
  'resources-service',
  'Critical maintenance scheduled',
  {
    priority: ResponseContextPriority.CRITICAL,
    ttl: 7200, // 2 horas
  }
);
```

---

## 🔗 Integración con Event Handlers

### Ejemplo: ApprovalGrantedHandler

**Antes** (sin ResponseUtil.event):
```typescript
async handle(event: EventPayload<any>): Promise<void> {
  const { reservationId } = event.data;
  
  // Actualizar reserva...
  
  // Publicar evento sin estructura estándar
  await this.eventBus.publish(EventType.RESERVATION_CONFIRMED, {
    reservationId,
    status: 'confirmed'
  });
}
```

**Después** (con ResponseUtil.event):
```typescript
import { ResponseUtil } from '@libs/common';
import { v4 as uuidv4 } from 'uuid';

async handle(event: EventPayload<any>): Promise<void> {
  const { approvalId, reservationId, resourceId, approvedBy } = event.data;
  
  try {
    // Actualizar reserva...
    await this.cacheService.invalidateReservation(reservationId);
    
    // Publicar evento con estructura estándar
    const response = ResponseUtil.event(
      {
        reservationId,
        resourceId,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        confirmedBy: approvedBy,
      },
      EventType.RESERVATION_CONFIRMED,
      'availability-service',
      'Reservation confirmed after approval',
      {
        correlationId: event.metadata?.correlationId,
        causationId: event.metadata?.messageId,
        messageId: uuidv4(),
        idempotencyKey: `reservation-confirmed-${reservationId}`,
      }
    );
    
    await this.eventBus.publish(EventType.RESERVATION_CONFIRMED, response);
    
    this.logger.log(
      `Published RESERVATION_CONFIRMED for ${reservationId}`
    );
  } catch (error) {
    this.logger.error(`Error handling APPROVAL_GRANTED: ${error.message}`);
  }
}
```

---

## 📊 Beneficios de Usar ResponseUtil.event()

### 1. Estandarización ✅
- Todos los eventos siguen la misma estructura
- Facilita el procesamiento en consumidores
- Compatible con herramientas de monitoreo

### 2. Trazabilidad ✅
- `correlationId` para rastrear flujos completos
- `causationId` para entender la cadena de eventos
- `messageId` único para cada evento

### 3. Idempotencia ✅
- `idempotencyKey` evita procesamiento duplicado
- Crítico para operaciones financieras o de aprobación
- Protege contra reintentos accidentales

### 4. Retry Logic ✅
- `retryCount` y `maxRetries` para manejo de fallos
- `ttl` para expiración automática
- Integración con Dead Letter Queues

### 5. Priorización ✅
- `priority` para eventos críticos
- Permite routing basado en prioridad
- Mejora SLA de eventos importantes

### 6. Versionado ✅
- `version` para evolución de esquemas
- Permite migración gradual
- Compatibilidad hacia atrás

---

## 🎯 Casos de Uso por Servicio

### auth-service
```typescript
// Usuario registrado
ResponseUtil.event(
  { userId, email, role },
  EventType.USER_REGISTERED,
  'auth-service',
  'User registered successfully',
  { idempotencyKey: `user-reg-${userId}` }
);

// Rol asignado
ResponseUtil.event(
  { userId, roleId, roleName },
  EventType.ROLE_ASSIGNED,
  'auth-service',
  'Role assigned to user',
  { 
    correlationId: requestId,
    priority: ResponseContextPriority.HIGH 
  }
);
```

### resources-service
```typescript
// Recurso creado
ResponseUtil.event(
  { resourceId, name, type },
  EventType.RESOURCE_CREATED,
  'resources-service',
  'Resource created',
  { idempotencyKey: `res-create-${resourceId}` }
);

// Mantenimiento programado
ResponseUtil.event(
  { maintenanceId, resourceId, scheduledDate },
  EventType.MAINTENANCE_SCHEDULED,
  'resources-service',
  'Maintenance scheduled',
  { 
    priority: ResponseContextPriority.CRITICAL,
    ttl: 7200 
  }
);
```

### availability-service
```typescript
// Reserva creada
ResponseUtil.event(
  { reservationId, resourceId, userId, startTime, endTime },
  EventType.RESERVATION_CREATED,
  'availability-service',
  'Reservation created',
  { 
    idempotencyKey: `res-${reservationId}`,
    correlationId: requestId 
  }
);

// Reserva confirmada
ResponseUtil.event(
  { reservationId, status: 'confirmed' },
  EventType.RESERVATION_CONFIRMED,
  'availability-service',
  'Reservation confirmed',
  {
    correlationId: originalEvent.correlationId,
    causationId: originalEvent.messageId,
  }
);
```

### stockpile-service
```typescript
// Aprobación otorgada
ResponseUtil.event(
  { approvalId, reservationId, approvedBy },
  EventType.APPROVAL_GRANTED,
  'stockpile-service',
  'Approval granted',
  { 
    idempotencyKey: `approval-${approvalId}`,
    priority: ResponseContextPriority.HIGH 
  }
);

// Check-in completado
ResponseUtil.event(
  { checkInId, reservationId, resourceId },
  EventType.CHECK_IN_COMPLETED,
  'stockpile-service',
  'Check-in completed',
  { correlationId: reservationId }
);
```

---

## ✅ Criterios de Aceptación

- [x] Método `ResponseUtil.event()` implementado
- [x] Soporte para todos los parámetros opcionales
- [x] Estructura de respuesta estandarizada
- [x] Documentación completa con ejemplos
- [x] Guía de integración con event handlers
- [x] Casos de uso por servicio
- [x] Ejemplos de idempotencia
- [x] Ejemplos de retry logic
- [x] Ejemplos de trazabilidad

---

## 🔄 Próximos Pasos

1. ✅ **Tarea 2.3 completada** - ResponseUtil.event() documentado
2. 🔄 **Tarea 2.4** - Implementar ResponseUtil.websocket()
3. 🔄 **Actualizar handlers** - Integrar ResponseUtil.event() en handlers existentes
4. 🔄 **Testing** - Crear tests para validar estructura de eventos
5. 🔄 **Monitoreo** - Implementar métricas de eventos publicados

---

## 📝 Notas Técnicas

### Cuándo Usar ResponseUtil.event()

✅ **SÍ usar cuando**:
- Publicas eventos desde un handler
- Necesitas trazabilidad entre eventos
- Requieres idempotencia
- Implementas retry logic
- Eventos críticos con prioridad

❌ **NO usar cuando**:
- Solo consumes eventos (no publicas)
- Respuestas HTTP directas (usar ResponseUtil.success)
- WebSocket messages (usar ResponseUtil.websocket)
- RPC calls (usar ResponseUtil.rpc)

### Mejores Prácticas

1. **Siempre incluir correlationId** en flujos multi-evento
2. **Usar idempotencyKey** para operaciones críticas
3. **Definir maxRetries** apropiado por tipo de evento
4. **Establecer ttl** para eventos con expiración
5. **Asignar priority** según criticidad del negocio
6. **Generar messageId único** con UUID v4
7. **Propagar causationId** para cadenas de eventos

### Integración con Observabilidad

```typescript
// Logging estructurado
this.logger.log({
  message: 'Event published',
  eventType: EventType.RESOURCE_CREATED,
  messageId: response.context.messageId,
  correlationId: response.context.correlationId,
  service: 'resources-service',
});

// Métricas
metrics.increment('events.published', {
  eventType: EventType.RESOURCE_CREATED,
  service: 'resources-service',
  priority: response.context.priority,
});

// Tracing (OpenTelemetry)
span.setAttributes({
  'event.type': EventType.RESOURCE_CREATED,
  'event.messageId': response.context.messageId,
  'event.correlationId': response.context.correlationId,
});
```

---

**Tiempo invertido**: ~1 hora  
**Método implementado**: ✅ Ya existente  
**Documentación creada**: ✅ Completa  
**Ejemplos de uso**: ✅ 15+ casos  
**Estado**: ✅ COMPLETADO CON ÉXITO
