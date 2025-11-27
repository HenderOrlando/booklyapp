# 🏗️ Stockpile Service - Arquitectura

## 📋 Índice

- [Visión General](#visión-general)
- [Capas de la Arquitectura](#capas-de-la-arquitectura)
- [Patrones Implementados](#patrones-implementados)
- [Event-Driven Architecture](#event-driven-architecture)
- [Sistema de Notificaciones](#sistema-de-notificaciones)
- [Geolocalización en Tiempo Real](#geolocalización-en-tiempo-real)
- [Cache Distribuido](#cache-distribuido)
- [Base de Datos](#base-de-datos)

---

## 🎯 Visión General

El Stockpile Service implementa una **arquitectura hexagonal (Ports & Adapters)** con **CQRS** y **Event-Driven Architecture**.

```
┌───────────────────────────────────────────────────────────┐
│                    Stockpile Service                      │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────┐      │
│  │           Infrastructure Layer                  │      │
│  │  ┌─────────────┐  ┌──────────────┐              │      │
│  │  │ Controllers │  │   Gateways   │              │      │
│  │  │   (HTTP)    │  │ (WebSocket)  │              │      │
│  │  └─────────────┘  └──────────────┘              │      │
│  │                                                 │      │
│  │  ┌─────────────┐  ┌───────────────┐             │      │
│  │  │   Clients   │  │   Adapters    │             │      │
│  │  │(Event Bus)  │  │(Notifications)│             │      │
│  │  └─────────────┘  └───────────────┘             │      │
│  └─────────────────────────────────────────────────┘      │
│                         ▲                                 │
│                         │                                 │
│  ┌─────────────────────────────────────────────────┐      │
│  │            Application Layer                    │      │
│  │  ┌─────────────┐  ┌──────────────┐              │      │
│  │  │  Commands   │  │   Queries    │              │      │
│  │  │  Handlers   │  │   Handlers   │              │      │
│  │  └─────────────┘  └──────────────┘              │      │
│  │                                                 │      │
│  │  ┌─────────────────────────────────────────┐    │      │
│  │  │           Services                      │    │      │
│  │  │  • ApprovalService                      │    │      │
│  │  │  • CheckInOutService                    │    │      │
│  │  │  • NotificationService                  │    │      │
│  │  │  • GeolocationService                   │    │      │
│  │  │  • AnalyticsService                     │    │      │
│  │  └─────────────────────────────────────────┘    │      │
│  └─────────────────────────────────────────────────┘      │
│                         ▲                                 │
│                         │                                 │
│  ┌─────────────────────────────────────────────────┐      │
│  │              Domain Layer                       │      │
│  │  ┌─────────────┐  ┌──────────────┐              │      │
│  │  │  Entities   │  │  Interfaces  │              │      │
│  │  │    (Core)   │  │   (Ports)    │              │      │
│  │  └─────────────┘  └──────────────┘              │      │
│  └─────────────────────────────────────────────────┘      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 📦 Capas de la Arquitectura

### 1. Domain Layer (Núcleo del Negocio)

**Ubicación**: `src/domain/`

**Responsabilidad**: Lógica de negocio pura, sin dependencias externas.

**Componentes**:

- **Entities**: Modelos de dominio
  - `ApprovalRequestEntity`
  - `CheckInOutEntity`
  - `NotificationEntity`

- **Interfaces**: Contratos (Ports)
  - `IApprovalRequestRepository`
  - `ICheckInOutRepository`
  - `INotificationProvider`

**Ejemplo**:

```typescript
// domain/entities/approval-request.entity.ts
export class ApprovalRequestEntity {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly requesterId: string,
    public status: ApprovalStatus,
    public approvers: Approver[],
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  approve(approverId: string): void {
    // Lógica de negocio pura
    this.status = ApprovalStatus.APPROVED;
    this.updatedAt = new Date();
  }
}
```

---

### 2. Application Layer (Casos de Uso)

**Ubicación**: `src/application/`

**Responsabilidad**: Orquestación de casos de uso, CQRS.

**Componentes**:

#### **Commands & Handlers**

```typescript
// application/commands/create-approval-request.command.ts
export class CreateApprovalRequestCommand {
  constructor(
    public readonly reservationId: string,
    public readonly requesterId: string,
    public readonly resourceType: string
  ) {}
}

// application/handlers/create-approval-request.handler.ts
@CommandHandler(CreateApprovalRequestCommand)
export class CreateApprovalRequestHandler {
  async execute(command: CreateApprovalRequestCommand) {
    // 1. Crear entidad
    // 2. Persistir
    // 3. Publicar evento
  }
}
```

#### **Services**

- `ApprovalRequestService`: CRUD + lógica de aprobaciones
- `CheckInOutService`: Gestión de check-in/check-out
- `NotificationService`: Envío multi-canal
- `GeolocationService`: Cálculos de distancia
- `LocationAnalyticsService`: Reportes y analytics
- `ProximityNotificationService`: Alertas por proximidad
- `DigitalSignatureService`: Generación de PDFs
- `QRCodeService`: Generación de QR codes
- `ReminderService`: Recordatorios automáticos
- `CacheService`: Gestión de Redis

---

### 3. Infrastructure Layer (Adaptadores)

**Ubicación**: `src/infrastructure/`

**Responsabilidad**: Implementación de puertos, comunicación externa.

**Componentes**:

#### **Controllers (HTTP)**

```typescript
@Controller("approval-requests")
@ApiTags("Approval Requests")
export class ApprovalRequestController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() dto: CreateApprovalRequestDto) {
    return await this.commandBus.execute(
      new CreateApprovalRequestCommand(
        dto.reservationId,
        dto.requesterId,
        dto.resourceType
      )
    );
  }
}
```

#### **Gateways (WebSocket)**

```typescript
@WebSocketGateway({ namespace: "/geolocation" })
export class GeolocationDashboardGateway {
  @SubscribeMessage("user-location-update")
  handleLocationUpdate(@MessageBody() data: UserLocationUpdate) {
    // Broadcast a clientes conectados
  }
}
```

#### **Clients (Event Bus)**

- `AuthServiceClient`: Request-response con auth-service
- `AvailabilityServiceClient`: Request-response con availability-service

```typescript
export class AvailabilityServiceClient {
  async getReservationById(reservationId: string): Promise<ReservationData> {
    // 1. Generar requestId único
    // 2. Publicar evento de request
    // 3. Esperar respuesta con Promise (timeout 5s)
    // 4. Retornar datos
  }
}
```

#### **Repositories**

```typescript
export class ApprovalRequestRepository implements IApprovalRequestRepository {
  constructor(
    @InjectModel(ApprovalRequest.name) private model: Model<ApprovalRequest>
  ) {}

  async save(entity: ApprovalRequestEntity): Promise<ApprovalRequestEntity> {
    const doc = new this.model(entity);
    await doc.save();
    return ApprovalRequestEntity.fromObject(doc.toObject());
  }
}
```

#### **Schemas (MongoDB)**

```typescript
@Schema({ collection: "approvalrequests", timestamps: true })
export class ApprovalRequest {
  @Prop({ required: true })
  reservationId: string;

  @Prop({ required: true, enum: ApprovalStatus })
  status: ApprovalStatus;

  @Prop({ type: [ApproverSchema], required: true })
  approvers: Approver[];
}
```

---

## 🎨 Patrones Implementados

### 1. CQRS (Command Query Responsibility Segregation)

**Separación clara entre escritura (Commands) y lectura (Queries)**.

```typescript
// Command - Modifica estado
CreateApprovalRequestCommand;
ApproveRequestCommand;
RejectRequestCommand;

// Query - Solo lectura
GetApprovalRequestByIdQuery;
GetPendingRequestsQuery;
```

### 2. Event-Driven Architecture (EDA)

**Comunicación asíncrona vía Event Bus (RabbitMQ)**.

```typescript
// Publicar evento
await this.eventBus.publish("bookly.stockpile.approval-created", {
  eventId: uuid(),
  eventType: "approval.request.created",
  service: "stockpile-service",
  timestamp: new Date(),
  data: { approvalId, reservationId },
});

// Suscribirse a eventos
await this.eventBus.subscribe(
  "bookly.availability.reservation-created",
  "stockpile-service",
  async (event) => {
    // Manejar evento
  }
);
```

### 3. Repository Pattern

**Abstracción del acceso a datos**.

```typescript
// Port (Interface)
export interface IApprovalRequestRepository {
  save(entity: ApprovalRequestEntity): Promise<ApprovalRequestEntity>;
  findById(id: string): Promise<ApprovalRequestEntity | null>;
}

// Adapter (Implementation)
export class ApprovalRequestRepository implements IApprovalRequestRepository {
  // Implementación con MongoDB
}
```

### 4. Adapter Pattern

**Proveedores de notificaciones intercambiables**.

```typescript
// Port (Interface)
export interface INotificationAdapter {
  send(notification: Notification): Promise<NotificationResult>;
}

// Adapters (Implementations)
export class SendGridAdapter implements INotificationAdapter {}
export class TwilioSMSAdapter implements INotificationAdapter {}
export class FirebaseAdapter implements INotificationAdapter {}
```

### 5. Strategy Pattern

**Selección dinámica de proveedor por tenant**.

```typescript
async send(notification: NotificationDto): Promise<NotificationResult> {
  // Obtener configuración del tenant
  const config = await this.configService.getActiveConfig(
    notification.tenant,
    notification.channel
  );

  // Seleccionar adapter según configuración
  const adapter = this.adapters.get(config.provider);

  // Ejecutar estrategia
  return await adapter.send(notification);
}
```

---

## 🔄 Event-Driven Architecture

### Eventos Publicados por Stockpile

| Evento                    | Routing Key                           | Descripción                   |
| ------------------------- | ------------------------------------- | ----------------------------- |
| Approval Request Created  | `bookly.stockpile.approval-created`   | Nueva solicitud de aprobación |
| Approval Request Approved | `bookly.stockpile.approval-approved`  | Solicitud aprobada            |
| Approval Request Rejected | `bookly.stockpile.approval-rejected`  | Solicitud rechazada           |
| Check-in Completed        | `bookly.stockpile.checkin-completed`  | Check-in realizado            |
| Check-out Completed       | `bookly.stockpile.checkout-completed` | Check-out realizado           |
| Notification Sent         | `bookly.stockpile.notification-sent`  | Notificación enviada          |

### Eventos Escuchados por Stockpile

| Evento                 | Routing Key                               | Acción                        |
| ---------------------- | ----------------------------------------- | ----------------------------- |
| Reservation Created    | `bookly.availability.reservation-created` | Crear solicitud de aprobación |
| Reservation Updated    | `bookly.availability.reservation-updated` | Actualizar estado interno     |
| User Data Response     | `bookly.stockpile.user-data-response`     | Caché de datos de usuario     |
| Resource Data Response | `bookly.stockpile.resource-data-response` | Caché de datos de recurso     |

### Flujo de Comunicación Request-Response

```
┌────────────┐                                     ┌─────────────────┐
│ Stockpile  │                                     │  Availability   │
│  Service   │                                     │    Service      │
└────────────┘                                     └─────────────────┘
      │                                                    │
      │  1. Publish: reservation.data.requested            │
      │───────────────────────────────────────────────────>│
      │     { reservationId, requestId, replyTo }          │
      │                                                    │
      │                                         2. Process request
      │                                                    │
      │  3. Publish: reservation.data.response             │
      │<───────────────────────────────────────────────────│
      │     { requestId, reservation }                     │
      │                                                    │
      │  4. Resolve Promise                                │
      │     (timeout 5s)                                   │
      │                                                    │
```

**Implementación**:

```typescript
async getReservationById(reservationId: string): Promise<ReservationData | null> {
  const requestId = `get-reservation-${reservationId}-${Date.now()}`;

  // Crear Promise con timeout
  const responsePromise = new Promise<ReservationData | null>((resolve) => {
    this.pendingRequests.set(requestId, resolve);
    setTimeout(() => {
      if (this.pendingRequests.has(requestId)) {
        this.pendingRequests.delete(requestId);
        resolve(null); // Timeout
      }
    }, 5000);
  });

  // Publicar request
  await this.eventBus.publish('bookly.availability.reservation-data-request', {
    eventId: requestId,
    eventType: 'reservation.data.requested',
    service: 'stockpile-service',
    timestamp: new Date(),
    data: { reservationId, requestId, replyTo: 'bookly.stockpile.reservation-data-response' }
  });

  return await responsePromise;
}
```

---

## 📢 Sistema de Notificaciones

### Arquitectura Multi-Proveedor

```
┌────────────────────────────────────────────────┐
│         Notification Service                   │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────┐      │
│  │  EmailProviderService                │      │
│  │  ├─ SendGrid Adapter                 │      │
│  │  ├─ AWS SES Adapter                  │      │
│  │  └─ NodeMailer Adapter               │      │
│  └──────────────────────────────────────┘      │
│                                                │
│  ┌──────────────────────────────────────┐      │
│  │  SMSProviderService                  │      │
│  │  └─ Twilio SMS Adapter               │      │
│  └──────────────────────────────────────┘      │
│                                                │
│  ┌──────────────────────────────────────┐      │
│  │  WhatsAppProviderService             │      │
│  │  ├─ Twilio WhatsApp Adapter          │      │
│  │  └─ WhatsApp Business API Adapter    │      │
│  └──────────────────────────────────────┘      │
│                                                │
│  ┌──────────────────────────────────────┐      │
│  │  PushProviderService                 │      │
│  │  ├─ Firebase FCM Adapter             │      │
│  │  ├─ OneSignal Adapter                │      │
│  │  └─ Expo Push Adapter                │      │
│  └──────────────────────────────────────┘      │
│                                                │
│  ┌──────────────────────────────────────┐      │
│  │  InAppProviderService                │      │
│  │  └─ MongoDB + WebSocket Adapter      │      │
│  └──────────────────────────────────────┘      │
│                                                │
└────────────────────────────────────────────────┘
```

### Configuración por Tenant

```typescript
{
  tenant: "UFPS",
  channel: "EMAIL",
  provider: "sendgrid",
  config: {
    apiKey: "SG.xxx",
    fromEmail: "noreply@ufps.edu.co",
    fromName: "Bookly UFPS"
  },
  fallback: "aws-ses",
  isActive: true
}
```

---

## 🌍 Geolocalización en Tiempo Real

### Componentes

1. **GeolocationService**: Cálculos de distancia (Haversine)
2. **GeolocationDashboardGateway**: WebSocket para tracking
3. **ProximityNotificationService**: Alertas por proximidad
4. **LocationAnalyticsService**: Reportes de uso

### Thresholds de Proximidad

```typescript
enum ProximityThreshold {
  FAR = 200, // > 200m
  APPROACHING = 100, // 100-200m
  NEAR = 50, // 50-100m
  ARRIVED = 20, // < 20m
}
```

### Flujo de Tracking

```
┌─────────┐           ┌───────────┐           ┌──────────────┐
│ Cliente │           │ Gateway   │           │   Services   │
│  (App)  │           │(WebSocket)│           │              │
└─────────┘           └───────────┘           └──────────────┘
     │                     │                        │
     │  Connect            │                        │
     │────────────────────>│                        │
     │                     │                        │
     │  location-update    │                        │
     │────────────────────>│  checkProximity()      │
     │                     │───────────────────────>│
     │                     │                        │
     │                     │  proximity-alert       │
     │<────────────────────│<───────────────────────│
     │                     │                        │
     │                     │  broadcast             │
     │<────────────────────│  (active-users)        │
     │                     │                        │
```

---

## 💾 Cache Distribuido

### Redis Cache Strategy

```typescript
export class CacheService {
  private readonly userTTL = 3600; // 1 hora
  private readonly resourceTTL = 1800; // 30 minutos

  async cacheUser(userId: string, userData: UserData) {
    await this.redis.set(`stockpile:user:${userId}`, userData, {
      ttl: this.userTTL,
    });
  }

  async getCachedUser(userId: string): Promise<UserData | null> {
    return await this.redis.get(`stockpile:user:${userId}`);
  }
}
```

### Cache Hierarchy

```
┌─────────────────────────────────┐
│     Application Memory          │ (Maps, Sets)
├─────────────────────────────────┤
│     Redis Distributed Cache     │ (1-30 min TTL)
├─────────────────────────────────┤
│     MongoDB Database            │ (Persistent)
└─────────────────────────────────┘
```

---

## 🗄️ Base de Datos

### MongoDB Collections

1. **approvalrequests**: Solicitudes de aprobación
2. **checkinouts**: Registros de check-in/check-out
3. **notificationconfigs**: Configuraciones de notificaciones
4. **digitalsignatures**: Firmas digitales (con TTL 365 días)

### Índices Optimizados

```typescript
// Check-ins por fecha (Analytics)
{ checkInTime: 1, checkOutTime: 1 }

// Búsqueda por recurso
{ resourceId: 1, checkInTime: 1 }

// Búsqueda por usuario
{ userId: 1, checkInTime: -1 }

// Reservas únicas
{ reservationId: 1 } (unique)

// Check-ins activos
{ status: 1, checkInTime: -1 }

// TTL para firmas digitales
{ timestamp: 1 } (expireAfterSeconds: 31536000)
```

---

## 📊 Performance

### Métricas Objetivo

| Métrica                     | Objetivo |
| --------------------------- | -------- |
| Redis Hit Rate              | > 90%    |
| MongoDB Query Time          | < 100ms  |
| Event Bus Latency           | < 50ms   |
| WebSocket Ping              | < 100ms  |
| API Response Time (p95)     | < 500ms  |
| Usuarios WebSocket concurr. | 1000+    |
| Mensajes/segundo (WS)       | 5000+    |

---

**Última actualización**: Noviembre 6, 2025
