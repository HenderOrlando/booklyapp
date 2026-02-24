# 📖 Ejemplos de Uso - @libs/audit-decorators

## 🎯 Configuración Inicial

### 1. Importar en tu microservicio

```typescript
// En app.module.ts o módulo principal
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AuditDecoratorsModule } from "@libs/audit-decorators";

@Module({
  imports: [
    CqrsModule, // Requerido para EventBus
    AuditDecoratorsModule, // Activa interceptores globales
    // otros módulos
  ],
})
export class AppModule {}
```

### 2. Configurar variable de entorno

```bash
# .env
SERVICE_NAME=availability-service
```

---

## 🌐 Ejemplo 1: Auditar HTTP Endpoint

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { Audit, AuditAction } from "@libs/audit-decorators";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { CreateReservationCommand } from "./commands/create-reservation.command";

@Controller("reservations")
export class ReservationsController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Audita automáticamente la creación de reservas
   * - Captura: user, ip, userAgent, method, url
   * - Emite: AuditRecordRequestedEvent
   * - reports-service escucha y persiste
   */
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.CREATED,
    captureBeforeData: false,
    extractEntityId: (args) => args[0]?.id || "UNKNOWN",
  })
  @Post()
  async create(@Body() dto: CreateReservationDto) {
    return this.commandBus.execute(new CreateReservationCommand(dto));
  }

  /**
   * Auditar cancelación con captura de datos sensibles
   */
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.CANCELLED,
    captureBeforeData: true,
    excludeFields: ["creditCard", "paymentToken"], // No guardar datos sensibles
  })
  @Delete(":id")
  async cancel(@Param("id") id: string) {
    return this.commandBus.execute(new CancelReservationCommand(id));
  }
}
```

---

## 🔌 Ejemplo 2: Auditar WebSocket Events

```typescript
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { AuditWebSocket, AuditAction } from "@libs/audit-decorators";

@WebSocketGateway()
export class NotificationsGateway {
  /**
   * Audita notificaciones enviadas por WebSocket
   * - Captura: user (desde socket.handshake), socketId, ip
   * - Emite: AuditRecordRequestedEvent con source: 'websocket'
   */
  @AuditWebSocket({
    entityType: "NOTIFICATION",
    action: AuditAction.SENT,
    extractEntityId: (payload) => payload?.reservationId || "UNKNOWN",
    captureSocketInfo: true,
  })
  @SubscribeMessage("reservation.notify")
  async handleReservationNotification(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: NotifyReservationDto
  ) {
    // Lógica de negocio
    await this.notificationService.send(payload);
    return { success: true };
  }
}
```

---

## 🎭 Ejemplo 3: Auditar Domain Events

```typescript
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AuditEvent, AuditAction } from "@libs/audit-decorators";
import { ReservationApprovedEvent } from "../events/reservation-approved.event";

/**
 * Audita automáticamente cuando se procesa un evento de dominio
 * - Captura: datos del evento, handler name
 * - Emite: AuditRecordRequestedEvent con source: 'event'
 */
@AuditEvent({
  entityType: "RESERVATION",
  action: AuditAction.APPROVED,
  extractEntityId: (event) => event.reservationId,
  includeFullEvent: true, // Incluir payload completo en afterData
})
@EventsHandler(ReservationApprovedEvent)
export class ReservationApprovedHandler
  implements IEventHandler<ReservationApprovedEvent>
{
  async handle(event: ReservationApprovedEvent) {
    // La auditoría se registra automáticamente
    console.log(`Reservation ${event.reservationId} approved`);
    // ... lógica adicional
  }
}
```

---

## 🔄 Flujo Completo

### 1. Controller emite comando con @Audit()

```typescript
@Audit({ entityType: 'RESERVATION', action: AuditAction.CREATED })
@Post()
async create(@Body() dto: CreateReservationDto) {
  return this.commandBus.execute(new CreateReservationCommand(dto));
}
```

### 2. Interceptor captura y emite evento

```typescript
// AuditHttpInterceptor automáticamente:
const event = new AuditRecordRequestedEvent(
  "res-123", // entityId
  "RESERVATION", // entityType
  AuditAction.CREATED, // action
  "user-456", // userId
  "availability-service", // serviceName
  {
    source: AuditMetadataSource.HTTP,
    method: "POST",
    url: "/reservations",
    controller: "ReservationsController",
    handler: "create",
  },
  new Date(),
  undefined, // beforeData
  { id: "res-123", status: "CONFIRMED" }, // afterData
  "190.85.X.X", // ip
  "Mozilla/5.0..." // userAgent
);

this.eventBus.publish(event);
```

### 3. reports-service escucha y persiste

```typescript
@EventsHandler(AuditRecordRequestedEvent)
export class AuditRecordRequestedHandler {
  async handle(event: AuditRecordRequestedEvent) {
    await this.auditRepository.save({
      entityId: event.entityId,
      entityType: event.entityType,
      action: event.action,
      userId: event.userId,
      serviceName: event.serviceName,
      metadata: event.metadata,
      timestamp: event.timestamp,
      afterData: event.afterData,
      ip: event.ip,
      userAgent: event.userAgent,
    });
  }
}
```

---

## 🎨 Opciones Avanzadas

### Extraer entityId customizado

```typescript
@Audit({
  entityType: 'RESOURCE',
  action: AuditAction.UPDATED,
  extractEntityId: (args) => {
    // args[0] es @Param('id')
    // args[1] es @Body()
    return args[0]; // ID desde URL param
  },
})
@Put(':id')
async update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
  // ...
}
```

### Excluir múltiples campos sensibles

```typescript
@Audit({
  entityType: 'USER',
  action: AuditAction.UPDATED,
  excludeFields: [
    'password',
    'creditCard',
    'ssn',
    'apiKey',
    'refreshToken',
  ],
})
@Patch(':id')
async updateProfile(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
  // ...
}
```

---

## ✅ Beneficios

1. **Sin lógica manual** - Solo decorar métodos
2. **Consistencia** - Misma estructura para HTTP, WS y Events
3. **Desacoplado** - Emite eventos, no llama servicios directamente
4. **No bloquea** - Eventos emitidos async
5. **Seguro** - Sanitiza campos sensibles automáticamente
6. **Trazable** - Todo pasa por EventBus

---

## 🚀 Próximos Pasos

1. Implementar event handler en reports-service (Fase 2)
2. Probar en availability-service (Fase 4)
3. Aplicar en todos los microservicios (Fase 5)
