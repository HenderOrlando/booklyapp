# 📊 Progreso Tarea 2.4: Implementar ResponseUtil.websocket()

**Fecha**: 1 de diciembre de 2024  
**Estado**: ✅ COMPLETADO  
**Prioridad**: Media

---

## 🎯 Objetivo

Implementar el método `ResponseUtil.websocket()` para estandarizar las respuestas de WebSocket en notificaciones en tiempo real, proporcionando metadatos como messageId, correlationId, idempotencyKey, y priority.

---

## ✅ Estado Actual

### Método Ya Implementado ✅

El método `ResponseUtil.websocket()` ya existe en:
```
libs/common/src/utils/response.util.ts
```

**Firma del método**:
```typescript
static websocket<T>(
  data: T,
  message?: string,
  path?: string,
  options?: {
    messageId?: string;
    correlationId?: string;
    idempotencyKey?: string;
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
    type: 'WEBSOCKET',
    timestamp: string,
    path?: string,
    messageId?: string,
    correlationId?: string,
    idempotencyKey?: string,
    priority?: 'low' | 'normal' | 'high' | 'critical'
  }
}
```

### 2. Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `data` | `T` | ✅ | Payload del mensaje |
| `message` | `string` | ❌ | Mensaje descriptivo |
| `path` | `string` | ❌ | Ruta del WebSocket (ej: '/notifications') |
| `options` | `object` | ❌ | Opciones adicionales |

### 3. Opciones Disponibles

#### Identificación
- **messageId**: ID único del mensaje WebSocket
- **correlationId**: ID para rastrear flujos relacionados

#### Idempotencia
- **idempotencyKey**: Clave para evitar procesamiento duplicado en el cliente

#### Prioridad
- **priority**: Prioridad del mensaje (low, normal, high, critical)

---

## 📝 Guía de Uso

### Caso 1: Notificación Simple

```typescript
import { ResponseUtil } from '@libs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(userId: string, notification: any) {
    const response = ResponseUtil.websocket(
      notification,
      'New notification received',
      '/notifications'
    );

    this.server.to(userId).emit('notification', response);
  }
}
```

**Mensaje enviado**:
```json
{
  "success": true,
  "data": {
    "notificationId": "123",
    "title": "Reservation Approved",
    "body": "Your reservation has been approved"
  },
  "message": "New notification received",
  "timestamp": "2024-12-01T22:00:00.000Z",
  "context": {
    "type": "WEBSOCKET",
    "timestamp": "2024-12-01T22:00:00.000Z",
    "path": "/notifications"
  }
}
```

---

### Caso 2: Notificación con Trazabilidad

```typescript
import { v4 as uuidv4 } from 'uuid';

sendReservationUpdate(userId: string, reservationId: string, status: string) {
  const response = ResponseUtil.websocket(
    {
      reservationId,
      status,
      updatedAt: new Date().toISOString(),
    },
    'Reservation status updated',
    '/reservations',
    {
      messageId: uuidv4(),
      correlationId: reservationId,
    }
  );

  this.server.to(userId).emit('reservation:update', response);
}
```

**Mensaje enviado**:
```json
{
  "success": true,
  "data": {
    "reservationId": "456",
    "status": "confirmed",
    "updatedAt": "2024-12-01T22:00:00.000Z"
  },
  "message": "Reservation status updated",
  "timestamp": "2024-12-01T22:00:00.000Z",
  "context": {
    "type": "WEBSOCKET",
    "timestamp": "2024-12-01T22:00:00.000Z",
    "path": "/reservations",
    "messageId": "msg-789",
    "correlationId": "456"
  }
}
```

---

### Caso 3: Notificación con Idempotencia

```typescript
sendCriticalAlert(userId: string, alert: any) {
  const idempotencyKey = `alert-${alert.alertId}-${userId}`;
  
  const response = ResponseUtil.websocket(
    alert,
    'Critical alert',
    '/alerts',
    {
      messageId: uuidv4(),
      idempotencyKey,
      priority: ResponseContextPriority.CRITICAL,
    }
  );

  this.server.to(userId).emit('alert:critical', response);
}
```

**Cliente puede verificar idempotencia**:
```typescript
// Cliente WebSocket
const processedAlerts = new Set<string>();

socket.on('alert:critical', (response) => {
  const idempotencyKey = response.context?.idempotencyKey;
  
  if (idempotencyKey && processedAlerts.has(idempotencyKey)) {
    console.log('Alert already processed, skipping');
    return;
  }
  
  // Procesar alerta
  processAlert(response.data);
  
  if (idempotencyKey) {
    processedAlerts.add(idempotencyKey);
  }
});
```

---

### Caso 4: Notificación con Prioridad

```typescript
sendNotificationByPriority(
  userId: string,
  notification: any,
  priority: ResponseContextPriority
) {
  const response = ResponseUtil.websocket(
    notification,
    `${priority} priority notification`,
    '/notifications',
    {
      messageId: uuidv4(),
      priority,
    }
  );

  // Enviar a diferentes canales según prioridad
  const channel = priority === ResponseContextPriority.CRITICAL 
    ? 'notification:critical'
    : 'notification:normal';

  this.server.to(userId).emit(channel, response);
}
```

---

### Caso 5: Broadcast a Múltiples Usuarios

```typescript
broadcastResourceUpdate(resourceId: string, update: any) {
  const response = ResponseUtil.websocket(
    {
      resourceId,
      ...update,
    },
    'Resource updated',
    '/resources',
    {
      messageId: uuidv4(),
      correlationId: resourceId,
    }
  );

  // Broadcast a todos los usuarios suscritos al recurso
  this.server.to(`resource:${resourceId}`).emit('resource:update', response);
}
```

---

## 🔗 Integración con Event Handlers

### Ejemplo: Notificar cuando se aprueba una reserva

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload, ResponseUtil } from '@libs/common';
import { NotificationsGateway } from '../websocket/notifications.gateway';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ApprovalGrantedHandler implements OnModuleInit {
  private readonly logger = new Logger(ApprovalGrantedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.APPROVAL_GRANTED,
      'notifications-service-approvals-group',
      this.handle.bind(this),
    );
  }

  async handle(event: EventPayload<any>): Promise<void> {
    const { approvalId, reservationId, userId, approvedBy } = event.data;

    try {
      // Crear notificación WebSocket
      const notification = ResponseUtil.websocket(
        {
          type: 'APPROVAL_GRANTED',
          reservationId,
          approvalId,
          approvedBy,
          timestamp: new Date().toISOString(),
        },
        'Your reservation has been approved',
        '/notifications',
        {
          messageId: uuidv4(),
          correlationId: event.metadata?.correlationId || reservationId,
          priority: ResponseContextPriority.HIGH,
        }
      );

      // Enviar notificación al usuario
      this.notificationsGateway.sendToUser(userId, 'approval:granted', notification);

      this.logger.log(
        `WebSocket notification sent to user ${userId} for reservation ${reservationId}`
      );
    } catch (error) {
      this.logger.error(
        `Error sending WebSocket notification: ${error.message}`,
        error.stack
      );
    }
  }
}
```

---

## 🏗️ Arquitectura de WebSocket Gateway

### NotificationsGateway

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ResponseUtil, ResponseContextPriority } from '@libs/common';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      
      client.join(userId); // Join room with userId
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Enviar mensaje de bienvenida
      const welcome = ResponseUtil.websocket(
        { connected: true, userId },
        'Connected to notifications service',
        '/notifications',
        { messageId: uuidv4() }
      );
      
      client.emit('connection:success', welcome);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.extractUserId(client);
    
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);
      
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
    
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:resource')
  handleSubscribeResource(client: Socket, resourceId: string) {
    client.join(`resource:${resourceId}`);
    
    const response = ResponseUtil.websocket(
      { resourceId, subscribed: true },
      'Subscribed to resource updates',
      '/notifications',
      { messageId: uuidv4() }
    );
    
    client.emit('subscription:success', response);
  }

  @SubscribeMessage('unsubscribe:resource')
  handleUnsubscribeResource(client: Socket, resourceId: string) {
    client.leave(`resource:${resourceId}`);
    
    const response = ResponseUtil.websocket(
      { resourceId, unsubscribed: true },
      'Unsubscribed from resource updates',
      '/notifications',
      { messageId: uuidv4() }
    );
    
    client.emit('unsubscription:success', response);
  }

  // Métodos públicos para enviar notificaciones

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(userId).emit(event, data);
  }

  sendToResource(resourceId: string, event: string, data: any) {
    this.server.to(`resource:${resourceId}`).emit(event, data);
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  private extractUserId(client: Socket): string | null {
    // Extraer userId del token JWT o query params
    return client.handshake.query.userId as string || null;
  }
}
```

---

## 🎯 Casos de Uso por Tipo de Notificación

### 1. Notificaciones de Reserva

```typescript
// Reserva creada
sendReservationCreated(userId: string, reservation: any) {
  const response = ResponseUtil.websocket(
    {
      type: 'RESERVATION_CREATED',
      reservation,
    },
    'Reservation created successfully',
    '/reservations',
    {
      messageId: uuidv4(),
      correlationId: reservation.id,
      priority: ResponseContextPriority.NORMAL,
    }
  );

  this.server.to(userId).emit('reservation:created', response);
}

// Reserva confirmada
sendReservationConfirmed(userId: string, reservationId: string) {
  const response = ResponseUtil.websocket(
    {
      type: 'RESERVATION_CONFIRMED',
      reservationId,
      confirmedAt: new Date().toISOString(),
    },
    'Your reservation has been confirmed',
    '/reservations',
    {
      messageId: uuidv4(),
      correlationId: reservationId,
      priority: ResponseContextPriority.HIGH,
    }
  );

  this.server.to(userId).emit('reservation:confirmed', response);
}

// Reserva rechazada
sendReservationRejected(userId: string, reservationId: string, reason: string) {
  const response = ResponseUtil.websocket(
    {
      type: 'RESERVATION_REJECTED',
      reservationId,
      reason,
      rejectedAt: new Date().toISOString(),
    },
    'Your reservation has been rejected',
    '/reservations',
    {
      messageId: uuidv4(),
      correlationId: reservationId,
      priority: ResponseContextPriority.HIGH,
    }
  );

  this.server.to(userId).emit('reservation:rejected', response);
}
```

---

### 2. Notificaciones de Recursos

```typescript
// Recurso actualizado
sendResourceUpdated(resourceId: string, update: any) {
  const response = ResponseUtil.websocket(
    {
      type: 'RESOURCE_UPDATED',
      resourceId,
      update,
    },
    'Resource has been updated',
    '/resources',
    {
      messageId: uuidv4(),
      correlationId: resourceId,
    }
  );

  this.server.to(`resource:${resourceId}`).emit('resource:updated', response);
}

// Recurso no disponible
sendResourceUnavailable(resourceId: string, reason: string) {
  const response = ResponseUtil.websocket(
    {
      type: 'RESOURCE_UNAVAILABLE',
      resourceId,
      reason,
    },
    'Resource is now unavailable',
    '/resources',
    {
      messageId: uuidv4(),
      correlationId: resourceId,
      priority: ResponseContextPriority.HIGH,
    }
  );

  this.server.to(`resource:${resourceId}`).emit('resource:unavailable', response);
}
```

---

### 3. Notificaciones de Mantenimiento

```typescript
// Mantenimiento programado
sendMaintenanceScheduled(resourceId: string, maintenance: any) {
  const response = ResponseUtil.websocket(
    {
      type: 'MAINTENANCE_SCHEDULED',
      resourceId,
      maintenance,
    },
    'Maintenance has been scheduled for this resource',
    '/maintenance',
    {
      messageId: uuidv4(),
      correlationId: resourceId,
      priority: ResponseContextPriority.HIGH,
    }
  );

  this.server.to(`resource:${resourceId}`).emit('maintenance:scheduled', response);
}
```

---

### 4. Alertas Críticas

```typescript
// Alerta de sistema
sendSystemAlert(alert: any) {
  const response = ResponseUtil.websocket(
    {
      type: 'SYSTEM_ALERT',
      alert,
    },
    'System alert',
    '/alerts',
    {
      messageId: uuidv4(),
      idempotencyKey: `alert-${alert.id}`,
      priority: ResponseContextPriority.CRITICAL,
    }
  );

  this.server.emit('alert:system', response);
}
```

---

### 5. Notificaciones de Lista de Espera

```typescript
// Slot disponible en lista de espera
sendWaitingListSlotAvailable(userId: string, resourceId: string, slot: any) {
  const response = ResponseUtil.websocket(
    {
      type: 'WAITING_LIST_SLOT_AVAILABLE',
      resourceId,
      slot,
    },
    'A slot is now available for your waiting list request',
    '/waiting-list',
    {
      messageId: uuidv4(),
      correlationId: resourceId,
      priority: ResponseContextPriority.HIGH,
      idempotencyKey: `waitlist-${resourceId}-${userId}-${slot.id}`,
    }
  );

  this.server.to(userId).emit('waitinglist:available', response);
}
```

---

## 📊 Cliente WebSocket (Frontend)

### Conexión y Manejo de Eventos

```typescript
import { io, Socket } from 'socket.io-client';

class NotificationService {
  private socket: Socket;
  private processedMessages = new Set<string>();

  connect(userId: string, token: string) {
    this.socket = io('http://localhost:3000/notifications', {
      query: { userId },
      auth: { token },
    });

    this.setupListeners();
  }

  private setupListeners() {
    // Conexión exitosa
    this.socket.on('connection:success', (response) => {
      console.log('Connected:', response.data);
    });

    // Reserva confirmada
    this.socket.on('reservation:confirmed', (response) => {
      this.handleMessage(response, () => {
        this.showNotification(
          'Reservation Confirmed',
          response.message,
          'success'
        );
      });
    });

    // Reserva rechazada
    this.socket.on('reservation:rejected', (response) => {
      this.handleMessage(response, () => {
        this.showNotification(
          'Reservation Rejected',
          response.message,
          'error'
        );
      });
    });

    // Recurso actualizado
    this.socket.on('resource:updated', (response) => {
      this.handleMessage(response, () => {
        this.updateResourceInUI(response.data);
      });
    });

    // Alerta crítica
    this.socket.on('alert:critical', (response) => {
      this.handleMessage(response, () => {
        this.showCriticalAlert(response.data);
      });
    });

    // Slot disponible en lista de espera
    this.socket.on('waitinglist:available', (response) => {
      this.handleMessage(response, () => {
        this.showWaitingListNotification(response.data);
      });
    });
  }

  private handleMessage(response: any, callback: () => void) {
    const idempotencyKey = response.context?.idempotencyKey;

    // Verificar idempotencia
    if (idempotencyKey && this.processedMessages.has(idempotencyKey)) {
      console.log('Message already processed, skipping');
      return;
    }

    // Procesar mensaje
    callback();

    // Marcar como procesado
    if (idempotencyKey) {
      this.processedMessages.add(idempotencyKey);
    }
  }

  subscribeToResource(resourceId: string) {
    this.socket.emit('subscribe:resource', resourceId);
  }

  unsubscribeFromResource(resourceId: string) {
    this.socket.emit('unsubscribe:resource', resourceId);
  }

  disconnect() {
    this.socket.disconnect();
  }

  private showNotification(title: string, message: string, type: string) {
    // Implementar lógica de notificación en UI
  }

  private updateResourceInUI(resource: any) {
    // Actualizar recurso en la UI
  }

  private showCriticalAlert(alert: any) {
    // Mostrar alerta crítica
  }

  private showWaitingListNotification(data: any) {
    // Mostrar notificación de lista de espera
  }
}
```

---

## ✅ Criterios de Aceptación

- [x] Método `ResponseUtil.websocket()` implementado
- [x] Soporte para todos los parámetros opcionales
- [x] Estructura de respuesta estandarizada
- [x] Documentación completa con ejemplos
- [x] Guía de integración con WebSocket Gateway
- [x] Casos de uso por tipo de notificación
- [x] Ejemplo de cliente WebSocket
- [x] Manejo de idempotencia en cliente
- [x] Ejemplos de priorización de mensajes

---

## 🔄 Próximos Pasos

1. ✅ **Tarea 2.4 completada** - ResponseUtil.websocket() documentado
2. 🔄 **Implementar NotificationsGateway** - Gateway real en cada servicio
3. 🔄 **Integrar con Event Handlers** - Enviar notificaciones desde handlers
4. 🔄 **Testing** - Crear tests para WebSocket
5. 🔄 **Cliente Frontend** - Implementar servicio de notificaciones
6. 🔄 **Autenticación** - Implementar auth en WebSocket
7. 🔄 **Monitoreo** - Métricas de conexiones y mensajes

---

## 📝 Notas Técnicas

### Cuándo Usar ResponseUtil.websocket()

✅ **SÍ usar cuando**:
- Notificaciones en tiempo real a usuarios
- Updates de estado de recursos
- Alertas críticas del sistema
- Notificaciones de lista de espera
- Actualizaciones de reservas

❌ **NO usar cuando**:
- Respuestas HTTP (usar ResponseUtil.success)
- Eventos entre servicios (usar ResponseUtil.event)
- RPC calls (usar ResponseUtil.rpc)

### Mejores Prácticas

1. **Siempre incluir messageId** para trazabilidad
2. **Usar idempotencyKey** para mensajes críticos
3. **Establecer priority** según importancia
4. **Incluir correlationId** para relacionar mensajes
5. **Manejar reconexiones** en el cliente
6. **Implementar heartbeat** para detectar desconexiones
7. **Limitar rate** de mensajes por usuario

### Seguridad

```typescript
// Autenticación en WebSocket
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  namespace: '/notifications',
})
export class NotificationsGateway {
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.authService.verifyToken(token);
      
      if (!user) {
        client.disconnect();
        return;
      }
      
      client.data.userId = user.id;
      client.join(user.id);
      
      this.logger.log(`User ${user.id} connected`);
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      client.disconnect();
    }
  }
}
```

---

**Tiempo invertido**: ~1 hora  
**Método implementado**: ✅ Ya existente  
**Documentación creada**: ✅ Completa  
**Ejemplos de uso**: ✅ 20+ casos  
**Estado**: ✅ COMPLETADO CON ÉXITO
