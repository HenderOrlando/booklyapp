# 🎯 Plan de Refactorización Final - Audit & OAuth Event-Driven

## 📋 Resumen Ejecutivo

**Objetivo**: Resolver problemas ESM de `@libs/audit` y `@libs/oauth` mediante arquitectura Event-Driven, manteniendo la facilidad de uso con decoradores.

**Estrategia**:

1. Crear `@libs/audit-decorators` - lib ligera con solo decoradores e interceptores
2. Mover lógica de persistencia a servicios dedicados (reports-service, auth-service)
3. Comunicación desacoplada via eventos
4. Decoradores para HTTP, WebSocket y Domain Events

---

## 🎨 Decoradores Propuestos

### **@Audit()** - HTTP Endpoints ✅

Para auditar endpoints REST automáticamente.

**Uso**:

```typescript
@Audit({
  entityType: 'RESERVATION',
  action: AuditAction.CREATED,
  captureBeforeData: false,
  excludeFields: ['creditCard']
})
@Post()
async createReservation(@Body() dto: CreateReservationDto) {
  return this.commandBus.execute(new CreateReservationCommand(dto));
}
```

**Interceptor**: Captura contexto HTTP (user, ip, userAgent) y emite evento `audit.record.requested`

---

### **@AuditWebSocket()** - WebSocket Events 🆕

Para auditar eventos WebSocket/SocketIO.

**Uso**:

```typescript
@AuditWebSocket({
  entityType: 'NOTIFICATION',
  action: AuditAction.SENT,
  extractEntityId: (data) => data?.reservationId
})
@SubscribeMessage('reservation.notify')
async handleReservationNotification(
  @ConnectedSocket() client: Socket,
  @MessageBody() payload: NotifyReservationDto
) {
  // Lógica del handler
}
```

**Interceptor**: Captura contexto WebSocket (client.handshake.user, socket.id) y emite evento

---

### **@AuditEvent()** - Domain/Application Events 🆕

Para auditar eventos de dominio y aplicación (CQRS).

**Uso**:

```typescript
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
    // Lógica del handler
    // Auditoría se registra automáticamente
  }
}
```

**Interceptor**: Captura contexto del evento y emite `audit.record.requested`

---

## 📦 Arquitectura de Libs

### **libs/audit-decorators** 🆕

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
│   │   └── audit-config.interface.ts       # AuditConfig, AuditWebSocketConfig, etc.
│   ├── events/
│   │   └── audit-record-requested.event.ts # Evento emitido por interceptores
│   ├── module/
│   │   └── audit-decorators.module.ts      # Módulo exportable
│   └── index.ts
└── package.json
```

**Características**:

- ✅ **Sin dependencias de BD** - Solo emite eventos
- ✅ **Sin lógica de negocio** - Solo decoradores y metadata
- ✅ **Reutilizable** - Todos los microservicios pueden usarlo
- ✅ **Sin problemas ESM** - Solo tipos TypeScript y metadata

**Dependencias**:

- `@nestjs/common`
- `@nestjs/core`
- `rxjs`
- `@libs/event-bus` (para emitir eventos)

---

## 🏗️ Servicios Dedicados

### **reports-service/src/modules/audit**

```
apps/reports-service/src/modules/audit/
├── handlers/
│   ├── audit-record-requested.handler.ts   # Escucha eventos y guarda en BD
│   └── audit-history-requested.handler.ts  # Responde consultas de historial
├── repositories/
│   └── audit.repository.ts                 # MongoDB repository
├── schemas/
│   └── audit-record.schema.ts              # Mongoose schema
├── services/
│   └── audit.service.ts                    # Lógica de persistencia
└── audit.module.ts
```

**Responsabilidad**: Persistir y consultar registros de auditoría

**Eventos escuchados**:

- `audit.record.requested` → Guarda en BD

**Eventos emitidos**:

- `audit.record.created` → Confirmación
- `audit.history.response` → Respuesta a consultas

---

### **auth-service/src/modules/oauth**

```
apps/auth-service/src/modules/oauth/
├── handlers/
│   ├── oauth-authenticate-requested.handler.ts
│   ├── oauth-calendar-connect.handler.ts
│   └── oauth-calendar-event-create.handler.ts
├── providers/
│   ├── google-oauth.provider.ts
│   └── microsoft-oauth.provider.ts
├── services/
│   └── oauth.service.ts
└── oauth.module.ts
```

**Responsabilidad**: Gestionar OAuth2 (SSO y calendarios)

**Eventos escuchados**:

- `oauth.authenticate.requested`
- `oauth.calendar.connect.requested`
- `oauth.calendar.event.create.requested`

**Eventos emitidos**:

- `oauth.token.obtained`
- `oauth.calendar.connected`
- `oauth.calendar.event.created`

---

## 🔄 Flujos de Auditoría

### **Flujo 1: HTTP Endpoint**

```
1. Usuario hace POST /reservations
2. @Audit() decorador marca el método
3. AuditHttpInterceptor intercepta la ejecución
4. Extrae contexto HTTP (user, ip, method, url)
5. Emite evento: audit.record.requested
6. reports-service escucha el evento
7. AuditRecordRequestedHandler guarda en BD
8. Emite confirmación: audit.record.created
```

### **Flujo 2: WebSocket Event**

```
1. Cliente emite 'reservation.notify' via WebSocket
2. @AuditWebSocket() marca el handler
3. AuditWebSocketInterceptor intercepta
4. Extrae contexto WS (client.user, socket.id)
5. Emite evento: audit.record.requested
6. reports-service procesa y guarda
```

### **Flujo 3: Domain Event**

```
1. CommandHandler emite ReservationApprovedEvent
2. @AuditEvent() marca el EventHandler
3. AuditEventInterceptor intercepta
4. Extrae datos del evento
5. Emite evento: audit.record.requested
6. reports-service procesa y guarda
```

---

## ✅ Ventajas del Enfoque

| Aspecto              | Ventaja                                                           |
| -------------------- | ----------------------------------------------------------------- |
| **Facilidad de uso** | ✅ Decoradores simples @Audit(), @AuditWebSocket(), @AuditEvent() |
| **Sin acoplamiento** | ✅ Servicios no dependen de libs problemáticas                    |
| **Sin ESM issues**   | ✅ @libs/audit-decorators es solo tipos y metadata                |
| **Escalabilidad**    | ✅ reports-service puede escalar independientemente               |
| **Resiliencia**      | ✅ Event bus maneja retry y dead-letter queue                     |
| **Testing**          | ✅ Fácil mockear EventBus en tests                                |
| **Trazabilidad**     | ✅ Todos los eventos auditados pasan por event bus                |
| **Consistencia**     | ✅ Misma interfaz para HTTP, WS y Events                          |

---

## 🚀 Orden de Implementación

### **Fase 1: Crear @libs/audit-decorators** ⏱️ 2-3 horas

1. Crear estructura de carpetas
2. Migrar decoradores existentes de `libs/audit`
3. Crear @AuditWebSocket() decorador
4. Crear @AuditEvent() decorador
5. Refactorizar interceptores para emitir eventos
6. Crear AuditDecoratorsModule
7. Probar con ejemplo simple

### **Fase 2: Mover audit a reports-service** ⏱️ 2 horas

1. Crear `apps/reports-service/src/modules/audit/`
2. Copiar lógica de persistencia
3. Implementar AuditRecordRequestedHandler
4. Implementar AuditHistoryRequestedHandler
5. Registrar en reports.module.ts
6. Probar recepción de eventos

### **Fase 3: Mover oauth a auth-service** ⏱️ 2 horas

1. Crear `apps/auth-service/src/modules/oauth/`
2. Copiar providers de Google y Microsoft
3. Implementar event handlers para OAuth
4. Registrar en auth.module.ts
5. Probar flujos de OAuth

### **Fase 4: Actualizar availability-service** ⏱️ 2 horas

1. Eliminar `@libs/audit` y `@libs/oauth`
2. Importar `@libs/audit-decorators`
3. Aplicar @Audit() en endpoints REST
4. Aplicar @AuditWebSocket() en handlers de WebSocket
5. Aplicar @AuditEvent() en EventHandlers
6. Emitir eventos oauth.calendar.\* para calendarios
7. Probar funcionalidad completa

### **Fase 5: Actualizar otros servicios** ⏱️ 1-2 horas

1. auth-service: Aplicar @Audit() en login/logout
2. resources-service: Aplicar @Audit() en CRUD
3. stockpile-service: Aplicar @Audit() en aprobaciones
4. Probar auditoría en todos los servicios

### **Fase 6: Limpieza** ⏱️ 30 min

1. Eliminar `libs/audit` y `libs/oauth`
2. Actualizar tsconfig.json
3. Verificar que no hay imports rotos
4. Documentar cambios

---

## 📊 Estimación Total

**Tiempo estimado**: 9.5 - 11.5 horas
**Riesgo**: Bajo - Cambios incrementales y probables en cada fase

---

## 🎯 Resultado Esperado

✅ **Sin errores ESM** - No más `ERR_MODULE_NOT_FOUND`
✅ **Decoradores funcionando** - @Audit(), @AuditWebSocket(), @AuditEvent()
✅ **Servicios desacoplados** - Comunicación via eventos
✅ **Facilidad de uso** - Aplicar decoradores es trivial
✅ **Arquitectura profesional** - Event-Driven + CQRS
✅ **Hot-reload funcional** - Todos los servicios arrancan sin problemas

---

**¿Proceder con la implementación?**
