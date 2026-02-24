# @reports/audit-decorators

Decoradores e interceptores ligeros para auditoría event-driven en Bookly.

> **📍 Nueva Ubicación:** Esta librería ha sido migrada desde `libs/audit-decorators` a `apps/reports-service/src/libs/audit-decorators/`  
> **📦 Nuevo Import:** `@reports/audit-decorators` (antes `@libs/audit-decorators`)  
> **👥 Owner:** Reports Service Team

## ✅ Estado de Implementación

### **✅ FASE 1 COMPLETADA:**

- ✅ Estructura de carpetas creada
- ✅ Interfaces y tipos (`IAuditRecord`, `AuditAction`, configs)
- ✅ Decorador `@Audit()` para HTTP endpoints
- ✅ Decorador `@AuditWebSocket()` para WebSocket handlers
- ✅ Decorador `@AuditEvent()` para Event handlers
- ✅ Interceptores que emiten eventos (HTTP, WebSocket, Event)
- ✅ Evento `AuditRecordRequestedEvent`
- ✅ `AuditDecoratorsModule` para importar en servicios
- ✅ package.json y tsconfig.json configurados
- ✅ Compilación exitosa sin errores TypeScript
- ✅ Integración con `AuditMetadataSource` de @libs/common
- ✅ Tipos genéricos correctos con `IEvent`
- ✅ Path aliases configurados en tsconfig principal

## 📦 Estructura

```
libs/audit-decorators/
├── src/
│   ├── decorators/
│   │   ├── audit.decorator.ts              # @Audit() para HTTP
│   │   ├── audit-websocket.decorator.ts    # @AuditWebSocket()
│   │   └── audit-event.decorator.ts        # @AuditEvent()
│   ├── interceptors/
│   │   ├── audit-http.interceptor.ts       # Intercepta HTTP y emite evento
│   │   ├── audit-websocket.interceptor.ts  # Intercepta WS y emite evento
│   │   └── audit-event.interceptor.ts      # Intercepta Events y emite evento
│   ├── interfaces/
│   │   ├── audit-record.interface.ts       # IAuditRecord, AuditAction
│   │   └── audit-config.interface.ts       # Configuraciones
│   ├── events/
│   │   └── audit-record-requested.event.ts # Evento principal
│   ├── module/
│   │   └── audit-decorators.module.ts      # Módulo exportable
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Uso

### Importar en un microservicio

```typescript
import { Module } from "@nestjs/common";
import { AuditDecoratorsModule } from "@reports/audit-decorators";

@Module({
  imports: [
    AuditDecoratorsModule,
    // otros módulos
  ],
})
export class AppModule {}
```

### Usar @Audit() en HTTP endpoints

```typescript
import { Audit, AuditAction } from "@reports/audit-decorators";

@Controller("reservations")
export class ReservationsController {
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.CREATED,
  })
  @Post()
  async create(@Body() dto: CreateReservationDto) {
    return this.service.create(dto);
  }
}
```

### Usar @AuditWebSocket() en WebSocket handlers

```typescript
import { AuditWebSocket, AuditAction } from "@reports/audit-decorators";

@WebSocketGateway()
export class NotificationsGateway {
  @AuditWebSocket({
    entityType: "NOTIFICATION",
    action: AuditAction.SENT,
    extractEntityId: (data) => data?.reservationId,
  })
  @SubscribeMessage("notify")
  handleNotify(@MessageBody() data: any) {
    // Lógica
  }
}
```

### Usar @AuditEvent() en Event handlers

```typescript
import { AuditEvent, AuditAction } from "@reports/audit-decorators";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";

@AuditEvent({
  entityType: "RESERVATION",
  action: AuditAction.APPROVED,
  extractEntityId: (event) => event.reservationId,
})
@EventsHandler(ReservationApprovedEvent)
export class ReservationApprovedHandler
  implements IEventHandler<ReservationApprovedEvent>
{
  async handle(event: ReservationApprovedEvent) {
    // Lógica - se audita automáticamente
  }
}
```

## 🔄 Flujo de Eventos

1. Decorador marca el método/clase
2. Interceptor captura contexto y resultado
3. Interceptor emite `AuditRecordRequestedEvent` via EventBus
4. `reports-service` escucha el evento
5. `reports-service` persiste en MongoDB

## 🎨 Características

- ✅ Sin lógica de persistencia (solo emite eventos)
- ✅ Sin dependencias de BD
- ✅ Reutilizable en todos los microservicios
- ✅ Sanitiza datos sensibles automáticamente
- ✅ Soporta HTTP, WebSocket y Domain Events
- ✅ No bloquea el flujo principal (async)

## 🚧 Próximos Pasos

1. Corregir errores de tipos
2. Probar en un servicio real
3. Documentar configuraciones avanzadas
4. Agregar tests unitarios
