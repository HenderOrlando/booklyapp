# 🔄 Refactorización Event-Driven: libs/audit y libs/oauth

## 📋 Problema Actual

Los módulos `@libs/audit` y `@libs/oauth` causan errores `ERR_MODULE_NOT_FOUND` en modo watch debido a incompatibilidades ESM con Node.js v20/v22 y ts-node.

## ✅ Solución Propuesta: Event-Driven Architecture

Convertir las librerías problemáticas en **servicios dedicados** que exponen funcionalidad mediante **eventos** usando el `EventBusModule` existente.

---

## 🎯 Arquitectura Objetivo

### **1. AuditService → reports-service**

**Ubicación**: `apps/reports-service/src/modules/audit/`

**Responsabilidad**: Centralizar toda la auditoría y generar reportes de actividad.

**Eventos emitidos**:

- `audit.record.created` - Cuando se registra una acción auditable

**Eventos escuchados**:

- `audit.record.requested` - Solicitud para registrar auditoría
- `audit.history.requested` - Solicitud de historial de auditoría

**Consumidores**:

- ✅ `availability-service` - Historial de reservas
- ✅ `auth-service` - Auditoría de login/logout
- ✅ `resources-service` - Auditoría de cambios en recursos
- ✅ `stockpile-service` - Auditoría de aprobaciones

---

### **2. OAuthService → auth-service**

**Ubicación**: `apps/auth-service/src/modules/oauth/`

**Responsabilidad**: Gestionar OAuth2 para SSO y calendarios.

**Eventos emitidos**:

- `oauth.token.obtained` - Token OAuth obtenido exitosamente
- `oauth.token.refreshed` - Token refrescado
- `oauth.token.revoked` - Token revocado

**Eventos escuchados**:

- `oauth.authenticate.requested` - Solicitud de autenticación OAuth
- `oauth.calendar.connect.requested` - Conectar calendario
- `oauth.calendar.event.create.requested` - Crear evento en calendario
- `oauth.calendar.event.delete.requested` - Eliminar evento de calendario

**Consumidores**:

- ✅ `auth-service` - SSO con Google/Microsoft
- ✅ `availability-service` - Integración con calendarios

---

## 🎨 Decoradores de Auditoría

Los decoradores facilitan la auditoría sin acoplar servicios. Se aplicarán según el tipo de comunicación:

### **1. @Audit() - Para HTTP Endpoints** ✅ (Ya existe)

```typescript
@Audit({
  entityType: 'RESERVATION',
  action: AuditAction.CREATED,
  captureBeforeData: false,
  excludeFields: ['password']
})
async createReservation(dto: CreateReservationDto) {
  // Lógica del handler
}
```

### **2. @AuditWebSocket() - Para WebSocket Events** 🆕

```typescript
@AuditWebSocket({
  entityType: 'NOTIFICATION',
  action: AuditAction.SENT,
  extractEntityId: (args) => args[0]?.reservationId
})
@SubscribeMessage('reservation.notify')
async handleReservationNotification(client: Socket, payload: any) {
  // Lógica del handler
}
```

### **3. @AuditEvent() - Para Domain/Application Events** 🆕

```typescript
@AuditEvent({
  entityType: "RESERVATION",
  action: AuditAction.APPROVED,
  extractEntityId: (event) => event.reservationId,
})
@EventsHandler(ReservationApprovedEvent)
export class ReservationApprovedHandler {
  async handle(event: ReservationApprovedEvent) {
    // Lógica del handler
  }
}
```

---

## 📦 Estructura de Eventos

### **AuditRecordRequestedEvent**

```typescript
export class AuditRecordRequestedEvent {
  entityId: string;
  entityType: string;
  action: AuditAction;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  userId: string;
  ip?: string;
  userAgent?: string;
  location?: string;
  timestamp: Date;
  serviceName: string; // Microservicio que emite
  metadata: {
    source: "http" | "websocket" | "event";
    method?: string; // GET, POST, etc. (solo HTTP)
    url?: string; // (solo HTTP)
    eventName?: string; // (solo WebSocket/Event)
    controller?: string;
    handler?: string;
  };
}
```

### **AuditHistoryRequestedEvent**

```typescript
export class AuditHistoryRequestedEvent {
  filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  };
  pagination: {
    page: number;
    limit: number;
  };
  replyTo: string; // Canal para respuesta
}
```

### **OAuthAuthenticateRequestedEvent**

```typescript
export class OAuthAuthenticateRequestedEvent {
  provider: "google" | "microsoft";
  purpose: "sso" | "calendar";
  code: string; // Authorization code
  redirectUri: string;
  replyTo: string;
}
```

### **OAuthCalendarEventCreateRequestedEvent**

```typescript
export class OAuthCalendarEventCreateRequestedEvent {
  userId: string;
  provider: "google" | "microsoft";
  event: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    location?: string;
  };
  replyTo: string;
}
```

---

## 🔧 Plan de Implementación

### **Fase 1: Crear decoradores e interceptores comunes** ✅

#### **1.1. Crear @libs/audit-decorators** (lib compartida ligera)

```
libs/audit-decorators/
├── src/
│   ├── decorators/
│   │   ├── audit.decorator.ts           (HTTP - ya existe)
│   │   ├── audit-websocket.decorator.ts (🆕 WebSocket)
│   │   └── audit-event.decorator.ts     (🆕 Events)
│   ├── interceptors/
│   │   ├── audit-http.interceptor.ts    (emite eventos)
│   │   ├── audit-websocket.interceptor.ts (🆕)
│   │   └── audit-event.interceptor.ts   (🆕)
│   ├── interfaces/
│   │   └── audit-record.interface.ts    (tipos compartidos)
│   └── index.ts
└── package.json
```

**Características**:

- ✅ Solo decoradores, interceptores e interfaces
- ✅ NO tiene dependencias de BD (solo emite eventos)
- ✅ Sin problemas ESM (solo tipos y metadata)
- ✅ Reutilizable en todos los microservicios

#### **1.2. Implementar interceptores que emiten eventos**

**AuditHttpInterceptor** (refactorizado):

```typescript
@Injectable()
export class AuditHttpInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventBus: EventBusService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const auditConfig = this.reflector.get<AuditConfig>(
      AUDIT_METADATA_KEY,
      context.getHandler()
    );

    if (!auditConfig) return next.handle();

    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(async (result) => {
        // ✅ Emitir evento en lugar de guardar directamente
        await this.eventBus.emit("audit.record.requested", {
          entityId: this.extractEntityId(auditConfig, args, result),
          entityType: auditConfig.entityType,
          action: auditConfig.action,
          userId: request.user?.id || "SYSTEM",
          ip: request.ip,
          metadata: {
            source: "http",
            method: request.method,
            url: request.url,
            controller: context.getClass().name,
            handler: context.getHandler().name,
          },
          serviceName: process.env.SERVICE_NAME,
          timestamp: new Date(),
        });
      })
    );
  }
}
```

**AuditWebSocketInterceptor** (nuevo):

```typescript
@Injectable()
export class AuditWebSocketInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventBus: EventBusService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const auditConfig = this.reflector.get<AuditWebSocketConfig>(
      AUDIT_WEBSOCKET_METADATA_KEY,
      context.getHandler()
    );

    if (!auditConfig) return next.handle();

    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    return next.handle().pipe(
      tap(async (result) => {
        await this.eventBus.emit("audit.record.requested", {
          entityId: auditConfig.extractEntityId?.(data) || "UNKNOWN",
          entityType: auditConfig.entityType,
          action: auditConfig.action,
          userId: client.handshake?.user?.id || "SYSTEM",
          metadata: {
            source: "websocket",
            eventName: data?.event || "unknown",
          },
          serviceName: process.env.SERVICE_NAME,
          timestamp: new Date(),
        });
      })
    );
  }
}
```

---

### **Fase 2: Mover libs/audit a reports-service** ✅

1. Crear `apps/reports-service/src/modules/audit/`
2. Copiar lógica de persistencia de `libs/audit/src/services/audit.service.ts`
3. Implementar event handlers:
   - `AuditRecordRequestedHandler` - Escucha eventos y guarda en BD
   - `AuditHistoryRequestedHandler` - Responde consultas de historial
4. Registrar módulo en `reports.module.ts`

**AuditRecordRequestedHandler**:

```typescript
@EventsHandler(AuditRecordRequestedEvent)
export class AuditRecordRequestedHandler {
  constructor(private readonly auditRepository: AuditRepository) {}

  async handle(event: AuditRecordRequestedEvent) {
    // Guardar en base de datos
    await this.auditRepository.create({
      ...event,
      _id: new ObjectId(),
      createdAt: new Date(),
    });

    // Opcional: emitir confirmación
    this.eventBus.emit("audit.record.created", { id: record._id });
  }
}
```

### **Fase 2: Mover libs/oauth a auth-service** ✅

1. Crear `apps/auth-service/src/modules/oauth/`
2. Copiar contenido de `libs/oauth/src/` a este módulo
3. Implementar event handlers:
   - `OAuthAuthenticateRequestedHandler`
   - `OAuthCalendarConnectRequestedHandler`
   - `OAuthCalendarEventCreateRequestedHandler`
4. Registrar módulo en `auth.module.ts`

### **Fase 3: Actualizar consumidores** ✅

#### **availability-service**

- ❌ Eliminar `import { AuditModule } from "@libs/audit"`
- ❌ Eliminar `import { OAuthModule } from "@libs/oauth"`
- ✅ Importar `import { AuditDecoratorsModule } from "@libs/audit-decorators"`
- ✅ Aplicar decoradores en endpoints y handlers:

```typescript
// HTTP Endpoint
@Audit({
  entityType: 'RESERVATION',
  action: AuditAction.CREATED
})
@Post()
async createReservation(@Body() dto: CreateReservationDto) {
  return this.commandBus.execute(new CreateReservationCommand(dto));
}

// WebSocket Event
@AuditWebSocket({
  entityType: 'NOTIFICATION',
  action: AuditAction.SENT
})
@SubscribeMessage('reservation.updated')
async handleReservationUpdate(client: Socket, payload: any) {
  // Lógica
}

// Domain Event Handler
@AuditEvent({
  entityType: 'RESERVATION',
  action: AuditAction.MODIFIED,
  extractEntityId: (event) => event.reservationId
})
@EventsHandler(ReservationModifiedEvent)
export class ReservationModifiedHandler {
  async handle(event: ReservationModifiedEvent) {
    // Lógica
  }
}
```

- ✅ Para calendarios, emitir eventos directamente:

```typescript
// Conectar calendario
await this.eventBus.emit("oauth.calendar.connect.requested", {
  userId: user.id,
  provider: "google",
  code: authCode,
  replyTo: "availability.calendar.connected",
});

// Crear evento en calendario
await this.eventBus.emit("oauth.calendar.event.create.requested", {
  userId: user.id,
  provider: "google",
  event: {
    summary: reservation.title,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
  },
  replyTo: "availability.calendar.event.created",
});
```

#### **auth-service**

- ❌ Eliminar referencias a `@libs/oauth` como lib externa
- ✅ Usar módulo interno `./modules/oauth`
- ✅ Exponer handlers de OAuth via eventos
- ✅ Aplicar decoradores @Audit en endpoints de autenticación:

```typescript
@Audit({
  entityType: 'USER',
  action: AuditAction.LOGIN
})
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

#### **resources-service, stockpile-service, reports-service**

- ✅ Importar `@libs/audit-decorators`
- ✅ Aplicar decoradores @Audit en endpoints críticos:

```typescript
// resources-service
@Audit({
  entityType: 'RESOURCE',
  action: AuditAction.UPDATED,
  captureBeforeData: true
})
@Put(':id')
async updateResource(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
  return this.commandBus.execute(new UpdateResourceCommand(id, dto));
}

// stockpile-service
@Audit({
  entityType: 'RESERVATION',
  action: AuditAction.APPROVED
})
@Post(':id/approve')
async approveReservation(@Param('id') id: string) {
  return this.commandBus.execute(new ApproveReservationCommand(id));
}
```

### **Fase 4: Eliminar libs obsoletas** ✅

```bash
rm -rf libs/audit libs/oauth
```

Actualizar `tsconfig.json` para remover paths:

```json
"paths": {
  // ELIMINAR estas líneas:
  // "@libs/audit": ["libs/audit/src"],
  // "@libs/oauth": ["libs/oauth/src"]
}
```

---

## ✅ Ventajas de esta Arquitectura

| Aspecto           | Antes (Libs)             | Después (Event-Driven)           |
| ----------------- | ------------------------ | -------------------------------- |
| **Acoplamiento**  | Alto (import directo)    | Bajo (eventos async)             |
| **ESM Issues**    | ❌ Problemas con ts-node | ✅ Sin problemas                 |
| **Escalabilidad** | Limitada                 | ✅ Cada servicio independiente   |
| **Resiliencia**   | Sin retry                | ✅ Event bus con retry           |
| **Trazabilidad**  | Parcial                  | ✅ Todos los eventos registrados |
| **Testing**       | Complejo                 | ✅ Fácil mockear eventos         |

---

## 🚀 Orden de Ejecución

1. ✅ Mover `libs/audit` → `reports-service/src/modules/audit`
2. ✅ Mover `libs/oauth` → `auth-service/src/modules/oauth`
3. ✅ Implementar event handlers en ambos servicios
4. ✅ Actualizar `availability-service` para emitir eventos
5. ✅ Actualizar otros servicios para emitir eventos de auditoría
6. ✅ Probar flujos completos
7. ✅ Eliminar `libs/audit` y `libs/oauth`

---

## 📊 Casos de Uso

### **Caso 1: Usuario crea una reserva**

```
1. availability-service ejecuta CreateReservationHandler
2. availability-service emite: audit.record.requested
3. reports-service escucha el evento
4. reports-service guarda registro en BD
5. reports-service emite: audit.record.created
```

### **Caso 2: Usuario conecta su calendario de Google**

```
1. availability-service recibe request de usuario
2. availability-service emite: oauth.calendar.connect.requested
3. auth-service escucha el evento
4. auth-service ejecuta GoogleOAuthProvider
5. auth-service emite: oauth.token.obtained
6. availability-service escucha respuesta y guarda token
```

---

## 🎯 Resultado Esperado

- ✅ **Sin errores ESM** - No hay imports problemáticos
- ✅ **Servicios desacoplados** - Comunicación via eventos
- ✅ **Escalable** - Fácil agregar nuevos consumidores
- ✅ **Resiliente** - Event bus maneja reintentos
- ✅ **Auditable** - Todos los eventos registrados
- ✅ **Testeable** - Fácil mockear event bus

---

**Decisión**: ¿Proceder con esta refactorización?
