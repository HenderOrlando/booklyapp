# 📋 Plan de Implementación: Idempotencia y Distributed Tracing

## 🎯 Objetivo

Implementar completamente el soporte de idempotencia y distributed tracing en todos los tipos de requests (HTTP, WebSocket, Events, RPC) en bookly-mock.

---

## ✅ Estado Actual

### Implementado ✅

- [x] Interface `ResponseContext` con todos los campos necesarios
- [x] Enum `ResponseContextPriority`
- [x] Enum `ResponseContextType`
- [x] Métodos de `ResponseUtil` con soporte de opciones
- [x] Documentación completa

### Falta Implementar ❌

- [ ] `IdempotencyService` - Servicio para gestión de idempotencia
- [ ] `CorrelationService` - Servicio para gestión de correlation chains
- [ ] `IdempotencyInterceptor` - Interceptor HTTP para idempotencia
- [ ] `CorrelationIdMiddleware` - Middleware para generar/propagar correlationId
- [ ] `EventIdempotencyHandler` - Handler base para eventos con idempotencia
- [ ] `RpcIdempotencyDecorator` - Decorador para RPC con idempotencia
- [ ] `WebSocketIdempotencyGuard` - Guard para WebSocket con deduplicación
- [ ] Módulos y exportaciones

---

## 📦 Estructura de Implementación

```
bookly-mock/
├── libs/
│   ├── idempotency/                         # 🆕 Nueva librería
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   ├── idempotency.service.ts   # ← Gestión de idempotencia
│   │   │   │   └── correlation.service.ts   # ← Gestión de correlation
│   │   │   ├── interceptors/
│   │   │   │   └── idempotency.interceptor.ts # ← HTTP interceptor
│   │   │   ├── middleware/
│   │   │   │   └── correlation-id.middleware.ts # ← Middleware
│   │   │   ├── decorators/
│   │   │   │   ├── idempotent.decorator.ts   # ← Decorador @Idempotent
│   │   │   │   └── correlation.decorator.ts  # ← Decorador @CorrelationId
│   │   │   ├── guards/
│   │   │   │   └── websocket-idempotency.guard.ts
│   │   │   ├── handlers/
│   │   │   │   └── event-idempotency.handler.ts # ← Base handler
│   │   │   ├── interfaces/
│   │   │   │   └── idempotency.interface.ts
│   │   │   ├── idempotency.module.ts
│   │   │   └── index.ts
│   │   └── package.json
│   └── common/                              # ✅ Ya existe
│       └── src/
│           └── interfaces/index.ts          # ✅ Ya tiene ResponseContext
```

---

## 🚀 Fases de Implementación

### **Fase 1: Servicios Core** (2-3 horas)

Implementar servicios fundamentales de idempotencia y correlation.

#### 1.1. IdempotencyService

**Archivo:** `libs/idempotency/src/services/idempotency.service.ts`

**Responsabilidades:**

- Verificar si una operación ya fue procesada
- Almacenar claves de idempotencia en Redis
- Cachear resultados de operaciones
- Manejar TTL y expiración

**Métodos:**

```typescript
- checkIdempotency(key: string): Promise<'new' | 'duplicate' | 'completed'>
- startOperation(key, correlationId, messageId, ttl): Promise<void>
- completeOperation(key, result): Promise<void>
- failOperation(key, error): Promise<void>
- getOperationResult(key): Promise<any | null>
- generateIdempotencyKey(...params): string
```

#### 1.2. CorrelationService

**Archivo:** `libs/idempotency/src/services/correlation.service.ts`

**Responsabilidades:**

- Generar correlationId únicos
- Rastrear cadenas de eventos
- Reconstruir árboles causales
- Almacenar metadata de tracing

**Métodos:**

```typescript
- generateCorrelationId(prefix?): string
- generateMessageId(): string
- recordEventChain(correlationId, messageId, causationId, eventType, service): Promise<void>
- getEventChain(correlationId): Promise<EventChainNode[]>
- buildCausalTree(correlationId): Promise<CausalTree>
- addMetadata(correlationId, metadata): Promise<void>
```

---

### **Fase 2: Middleware e Interceptors HTTP** (1-2 horas)

Implementar capas de middleware para requests HTTP.

#### 2.1. CorrelationIdMiddleware

**Archivo:** `libs/idempotency/src/middleware/correlation-id.middleware.ts`

**Responsabilidades:**

- Extraer `x-correlation-id` del header
- Generar nuevo correlationId si no existe
- Inyectar en request para uso en controllers
- Agregar a response headers

**Uso:**

```typescript
// En main.ts o app.module.ts
app.use(CorrelationIdMiddleware);
```

#### 2.2. IdempotencyInterceptor

**Archivo:** `libs/idempotency/src/interceptors/idempotency.interceptor.ts`

**Responsabilidades:**

- Extraer `Idempotency-Key` del header
- Verificar si ya fue procesada
- Retornar resultado cacheado si existe
- Cachear resultado después de procesamiento

**Uso:**

```typescript
@UseInterceptors(IdempotencyInterceptor)
@Post()
async create(@Body() dto: CreateDto) {
  // ...
}
```

---

### **Fase 3: Decoradores** (1 hora)

Crear decoradores para uso simple en controllers y handlers.

#### 3.1. @Idempotent Decorator

**Archivo:** `libs/idempotency/src/decorators/idempotent.decorator.ts`

**Uso:**

```typescript
@Idempotent({ ttl: 86400, keyGenerator: (req) => `custom-${req.userId}` })
@Post('reservations')
async createReservation(@Body() dto: CreateReservationDto) {
  // Automáticamente manejado con idempotencia
}
```

#### 3.2. @CorrelationId Decorator

**Archivo:** `libs/idempotency/src/decorators/correlation.decorator.ts`

**Uso:**

```typescript
@Post()
async create(
  @Body() dto: CreateDto,
  @CorrelationId() correlationId: string  // ← Inyectado automáticamente
) {
  await this.service.create(dto, correlationId);
}
```

---

### **Fase 4: Event Handlers Base** (2 horas)

Crear handler base para eventos con idempotencia automática.

#### 4.1. EventIdempotencyHandler (Base Class)

**Archivo:** `libs/idempotency/src/handlers/event-idempotency.handler.ts`

**Uso:**

```typescript
@EventsHandler(ReservationCreatedEvent)
export class ReservationCreatedHandler
  extends EventIdempotencyHandler<ReservationCreatedEvent> {

  constructor(
    idempotencyService: IdempotencyService,
    correlationService: CorrelationService,
    logger: LoggingService
  ) {
    super(idempotencyService, correlationService, logger);
  }

  // Solo implementar lógica de negocio
  protected async processEvent(
    event: ReservationCreatedEvent,
    context: ResponseContext
  ): Promise<void> {
    // Idempotencia ya manejada automáticamente
    await this.notificationService.send(...);
  }

  // Opcional: Sobrescribir generación de clave
  protected getIdempotencyKey(event: ReservationCreatedEvent): string {
    return `reservation-created-${event.data.reservationId}`;
  }
}
```

---

### **Fase 5: WebSocket Guards** (1-2 horas)

Implementar guards para WebSocket con deduplicación.

#### 5.1. WebSocketIdempotencyGuard

**Archivo:** `libs/idempotency/src/guards/websocket-idempotency.guard.ts`

**Uso:**

```typescript
@UseGuards(WebSocketIdempotencyGuard)
@SubscribeMessage('notification:send')
async sendNotification(
  @MessageBody() data: NotificationDto,
  @ConnectedSocket() client: Socket
) {
  // Automáticamente verifica duplicados
}
```

---

### **Fase 6: RPC Handlers** (1 hora)

Implementar soporte para RPC con idempotencia.

#### 6.1. @IdempotentRpc Decorator

**Archivo:** `libs/idempotency/src/decorators/idempotent-rpc.decorator.ts`

**Uso:**

```typescript
@IdempotentRpc({ ttl: 3600 })
@EventPattern('resources.rpc.check-availability')
async handleCheckAvailability(request: CheckAvailabilityRequest) {
  // Idempotencia automática con cache de respuesta
}
```

---

### **Fase 7: Módulo y Exportaciones** (30 min)

Crear módulo y exportar todo correctamente.

#### 7.1. IdempotencyModule

**Archivo:** `libs/idempotency/src/idempotency.module.ts`

```typescript
@Global()
@Module({
  imports: [RedisModule, LoggingModule],
  providers: [
    IdempotencyService,
    CorrelationService,
    CorrelationIdMiddleware,
    IdempotencyInterceptor,
    WebSocketIdempotencyGuard,
  ],
  exports: [
    IdempotencyService,
    CorrelationService,
    CorrelationIdMiddleware,
    IdempotencyInterceptor,
    WebSocketIdempotencyGuard,
  ],
})
export class IdempotencyModule {}
```

---

### **Fase 8: Integración en Microservicios** (2-3 horas por servicio)

Aplicar en cada microservicio.

#### 8.1. API Gateway

```typescript
// apps/api-gateway/src/main.ts
app.use(CorrelationIdMiddleware);

// apps/api-gateway/src/app.module.ts
@Module({
  imports: [
    IdempotencyModule,
    // ...
  ]
})
```

#### 8.2. Auth Service

```typescript
// apps/auth-service/src/infrastructure/controllers/auth.controller.ts
@Idempotent({ ttl: 86400 })
@Post('register')
async register(
  @Body() dto: RegisterDto,
  @CorrelationId() correlationId: string
) {
  return this.service.register(dto, correlationId);
}
```

#### 8.3. Availability Service

```typescript
// apps/availability-service/src/application/handlers/reservation-created.handler.ts
@EventsHandler(ReservationCreatedEvent)
export class ReservationCreatedHandler extends EventIdempotencyHandler<ReservationCreatedEvent> {
  protected async processEvent(event, context) {
    // Procesamiento con idempotencia automática
  }
}
```

#### 8.4. Resources Service

```typescript
// Aplicar @Idempotent en endpoints críticos
@Idempotent()
@Post('resources')
async createResource(@Body() dto: CreateResourceDto) { }
```

#### 8.5. Stockpile Service

```typescript
// Aplicar en approval flows
@Idempotent({ ttl: 172800 }) // 48 horas
@Post('approvals')
async createApproval(@Body() dto: CreateApprovalDto) { }
```

#### 8.6. Reports Service

```typescript
// No requiere idempotencia (solo lectura)
// Pero sí correlation para tracing
```

---

### **Fase 9: Testing** (2-3 horas)

Crear tests unitarios e integración.

#### 9.1. IdempotencyService Tests

```typescript
describe("IdempotencyService", () => {
  it("should detect duplicate operations");
  it("should cache operation results");
  it("should handle TTL expiration");
  it("should generate unique keys");
});
```

#### 9.2. Integration Tests

```typescript
describe("Idempotency E2E", () => {
  it("should return cached result on duplicate POST");
  it("should process events only once");
  it("should handle WebSocket message deduplication");
  it("should cache RPC responses");
});
```

---

### **Fase 10: Documentación de Uso** (1 hora)

Actualizar docs con ejemplos reales.

---

## 📊 Prioridades por Tipo de Request

### 🔴 **Prioridad ALTA** (Crítico)

1. **HTTP POST/PUT/DELETE** - Operaciones mutables
   - Register, Login, Create Reservation, Approve Request
   - Implementar: Fase 2 (Interceptor) + Fase 3 (Decorador)

2. **Events (EDA)** - Eventos distribuidos
   - RESERVATION_CREATED, APPROVAL_GRANTED, etc.
   - Implementar: Fase 1 (Services) + Fase 4 (Event Handler)

### 🟡 **Prioridad MEDIA**

3. **RPC** - Llamadas entre microservicios
   - Check availability, Get resource info
   - Implementar: Fase 1 (Services) + Fase 6 (RPC Decorator)

### 🟢 **Prioridad BAJA**

4. **WebSocket** - Notificaciones en tiempo real
   - Real-time notifications
   - Implementar: Fase 5 (WebSocket Guard)

5. **HTTP GET** - Operaciones idempotentes por naturaleza
   - Solo correlation para tracing

---

## 🎯 Milestone Timeline

| Fase    | Descripción                                | Estimación | Prioridad |
| ------- | ------------------------------------------ | ---------- | --------- |
| 1       | Servicios Core (Idempotency + Correlation) | 2-3h       | 🔴 ALTA   |
| 2       | Middleware e Interceptors HTTP             | 1-2h       | 🔴 ALTA   |
| 3       | Decoradores                                | 1h         | 🔴 ALTA   |
| 4       | Event Handlers Base                        | 2h         | 🔴 ALTA   |
| 8.1-8.5 | Integración en microservicios críticos     | 6-9h       | 🔴 ALTA   |
| 6       | RPC Handlers                               | 1h         | 🟡 MEDIA  |
| 5       | WebSocket Guards                           | 1-2h       | 🟢 BAJA   |
| 7       | Módulo y Exportaciones                     | 30min      | 🔴 ALTA   |
| 9       | Testing                                    | 2-3h       | 🟡 MEDIA  |
| 10      | Documentación                              | 1h         | 🟡 MEDIA  |

**TOTAL ESTIMADO:** 17-24 horas (2-3 días de desarrollo)

---

## ✅ Checklist de Implementación

### Fase 1: Core Services

- [ ] Crear librería `@libs/idempotency`
- [ ] Implementar `IdempotencyService`
  - [ ] `checkIdempotency()`
  - [ ] `startOperation()`
  - [ ] `completeOperation()`
  - [ ] `failOperation()`
  - [ ] `getOperationResult()`
  - [ ] `generateIdempotencyKey()`
- [ ] Implementar `CorrelationService`
  - [ ] `generateCorrelationId()`
  - [ ] `generateMessageId()`
  - [ ] `recordEventChain()`
  - [ ] `getEventChain()`
  - [ ] `buildCausalTree()`
- [ ] Tests unitarios de servicios

### Fase 2: HTTP Middleware

- [ ] Implementar `CorrelationIdMiddleware`
- [ ] Implementar `IdempotencyInterceptor`
- [ ] Integrar en API Gateway
- [ ] Tests de middleware

### Fase 3: Decoradores

- [ ] Implementar `@Idempotent()`
- [ ] Implementar `@CorrelationId()`
- [ ] Documentar uso
- [ ] Tests de decoradores

### Fase 4: Event Handlers

- [ ] Implementar `EventIdempotencyHandler` (base class)
- [ ] Migrar handlers existentes a extender base class
- [ ] Tests de handlers

### Fase 5: WebSocket

- [ ] Implementar `WebSocketIdempotencyGuard`
- [ ] Integrar en gateways
- [ ] Tests de WebSocket

### Fase 6: RPC

- [ ] Implementar `@IdempotentRpc()`
- [ ] Integrar en RPC handlers
- [ ] Tests de RPC

### Fase 7: Módulo

- [ ] Crear `IdempotencyModule`
- [ ] Exportar servicios y decoradores
- [ ] Agregar a exports de `@libs/common`

### Fase 8: Integración

- [ ] API Gateway
  - [ ] Middleware de correlationId
  - [ ] Interceptor de idempotencia global
- [ ] Auth Service
  - [ ] `POST /auth/register` - @Idempotent
  - [ ] `POST /auth/login` - Correlation only
  - [ ] Event handlers con base class
- [ ] Availability Service
  - [ ] `POST /reservations` - @Idempotent
  - [ ] Event handlers (RESERVATION_CREATED, etc.)
  - [ ] RPC handlers con @IdempotentRpc
- [ ] Resources Service
  - [ ] `POST /resources` - @Idempotent
  - [ ] Event handlers
- [ ] Stockpile Service
  - [ ] `POST /approvals` - @Idempotent
  - [ ] Event handlers de approval flows
- [ ] Reports Service
  - [ ] Correlation tracking en queries

### Fase 9: Testing

- [ ] Tests unitarios (80%+ coverage)
- [ ] Tests de integración E2E
- [ ] Tests de carga con duplicados
- [ ] Verificación de no-duplicación

### Fase 10: Documentación

- [ ] Actualizar `IDEMPOTENCY_AND_DISTRIBUTED_TRACING.md` con código real
- [ ] Crear `IDEMPOTENCY_USAGE_GUIDE.md` con ejemplos
- [ ] Documentar patrones de uso por tipo de request
- [ ] Agregar troubleshooting guide

---

## 🔧 Configuración Requerida

### Redis Configuration

```typescript
// .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
IDEMPOTENCY_TTL_SECONDS=86400  # 24 horas
CORRELATION_CHAIN_TTL_SECONDS=604800  # 7 días
```

### Module Configuration

```typescript
// apps/*/src/app.module.ts
@Module({
  imports: [
    IdempotencyModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT)
      },
      defaultTtl: 86400,
      keyPrefix: 'idempotency:',
      enableAutoCorrelation: true
    })
  ]
})
```

---

## 🚀 Próximos Pasos

### Inmediato (Hoy)

1. ✅ Crear estructura de librería `@libs/idempotency`
2. ✅ Implementar `IdempotencyService` básico
3. ✅ Implementar `CorrelationService` básico

### Sprint 1 (Esta semana)

4. Implementar middleware y decoradores
5. Integrar en API Gateway y Auth Service
6. Tests básicos

### Sprint 2 (Próxima semana)

7. Event handlers con base class
8. Integración en Availability y Resources
9. Tests E2E

### Sprint 3 (Semana 3)

10. RPC y WebSocket
11. Stockpile Service
12. Documentación final

---

## 📈 Métricas de Éxito

- [ ] 0 duplicaciones de operaciones críticas en producción
- [ ] 100% de eventos con correlationId
- [ ] < 5ms overhead de idempotency check
- [ ] 80%+ test coverage en libs/idempotency
- [ ] Documentación completa con ejemplos reales

---

## 🎓 Conclusión

Este plan proporciona una ruta clara para implementar completamente idempotencia y distributed tracing en Bookly. La implementación por fases permite:

✅ **Despliegue incremental** - Sin romper funcionalidad existente  
✅ **Testing continuo** - Validación en cada fase  
✅ **Priorización clara** - Enfoque en operaciones críticas primero  
✅ **Reutilización** - Componentes base reutilizables  
✅ **Observabilidad** - Tracing completo desde día 1
