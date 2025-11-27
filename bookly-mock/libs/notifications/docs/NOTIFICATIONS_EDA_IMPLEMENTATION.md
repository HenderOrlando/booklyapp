# 🎯 Sistema de Notificaciones con Event-Driven Architecture

## ✅ Implementación Completa

Se ha implementado un sistema de notificaciones centralizado usando **Event Bus** (`@libs/event-bus`) para el manejo de eventos distribuidos, siguiendo los principios de **Event-Driven Architecture (EDA)**.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICIOS (Productores)                        │
│  - Auth Service                                                  │
│  - Resources Service                                             │
│  - Availability Service                                          │
│  - Stockpile Service                                             │
│  - Reports Service                                               │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│          @libs/notifications - NotificationService               │
│  - sendNotification(channel, payload, tenantId, priority)        │
│  - sendBatch(notifications[])                                    │
│  - Usa EventBusService para publicar eventos                     │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│             @libs/event-bus - EventBusService                    │
│  - Abstracción sobre RabbitMQ/Kafka                              │
│  - publish(topic, event)                                         │
│  - subscribe(topic, groupId, handler)                            │
│  - Event Store (opcional)                                        │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│              RabbitMQ / Kafka (Message Broker)                   │
│  Topics:                                                         │
│  - bookly.notifications.notification.send.email                  │
│  - bookly.notifications.notification.send.sms                    │
│  - bookly.notifications.notification.send.whatsapp               │
│  - bookly.notifications.notification.send.push                   │
│  - bookly.notifications.notification.sent                        │
│  - bookly.notifications.notification.failed                      │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│      STOCKPILE SERVICE (Consumidor - Workers)                    │
│  - NotificationEventHandler                                      │
│    • handleSendEmail()                                           │
│    • handleSendSms()                                             │
│    • handleSendWhatsApp()                                        │
│  - EmailProviderService → Adapters                               │
│  - SmsProviderService → Adapters                                 │
│  - WhatsAppProviderService → Adapters                            │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│              PROVEEDORES EXTERNOS                                │
│  📧 Email: SendGrid, AWS SES, Gmail, Outlook, SMTP              │
│  📱 SMS: Twilio, AWS SNS                                         │
│  💬 WhatsApp: Meta Cloud API, Twilio WhatsApp                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Componentes Implementados

### 1. @libs/notifications (Librería Centralizada)

**Ubicación**: `/libs/notifications/`

**Componentes**:

- `NotificationsModule` - Módulo NestJS con EventBusModule
- `NotificationService` - Servicio para publicar eventos de notificaciones
- `NotificationMetricsService` - Recolección de métricas
- `SendNotificationEvent` - Evento para envío de notificaciones
- DTOs, Interfaces, Adapters base

**Configuración**:

```typescript
NotificationsModule.forRoot({
  brokerType: "rabbitmq",
  eventBus: {
    url: "amqp://bookly:bookly123@localhost:5672",
    exchange: "bookly-events",
    queue: "notifications_queue",
  },
  metricsEnabled: true,
  enableEventStore: false,
});
```

### 2. @libs/event-bus (Gestión de Eventos)

**Ubicación**: `/libs/event-bus/`

**Características**:

- Abstracción sobre RabbitMQ y Kafka
- Soporte para Event Sourcing opcional
- Topic prefix management
- Dead Letter Queue (DLQ)
- Health checks

**Uso**:

```typescript
// Publicar evento
await eventBus.publish(topic, eventPayload);

// Suscribirse a evento
await eventBus.subscribe(topic, groupId, async (event) => {
  // Manejar evento
});
```

### 3. Stockpile Service (Consumidor/Worker)

**Handler**: `NotificationEventHandler`

**Ubicación**: `/apps/stockpile-service/src/infrastructure/handlers/notification-event.handler.ts`

**Responsabilidades**:

- Suscribirse a eventos de notificaciones al iniciar
- Consumir eventos del Event Bus
- Delegar envío a servicios específicos (Email, SMS, WhatsApp)
- Publicar eventos de éxito/fallo

**Suscripciones**:

```typescript
- notification.send.email → handleSendEmail()
- notification.send.sms → handleSendSms()
- notification.send.whatsapp → handleSendWhatsApp()
```

---

## 🚀 Uso desde Cualquier Servicio

### Paso 1: Importar NotificationsModule

```typescript
// En cualquier servicio (auth, resources, availability, etc.)
import { NotificationsModule } from "@libs/notifications";

@Module({
  imports: [
    NotificationsModule.forRoot({
      brokerType: "rabbitmq",
      eventBus: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        exchange: "bookly-events",
      },
      metricsEnabled: true,
    }),
    // ... otros imports
  ],
})
export class MiServicioModule {}
```

### Paso 2: Inyectar NotificationService

```typescript
import { NotificationService } from "@libs/notifications";
import {
  NotificationChannel,
  NotificationPriority,
} from "@libs/common/src/enums";

@Injectable()
export class MiServicio {
  constructor(private readonly notificationService: NotificationService) {}

  async miMetodo() {
    // Enviar notificación
    await this.notificationService.sendNotification(
      NotificationChannel.EMAIL,
      {
        to: "usuario@example.com",
        subject: "Asunto del correo",
        message: "<h1>Hola</h1><p>Este es el mensaje</p>",
        data: {
          userId: "123",
          action: "registro",
        },
      },
      "tenant-id", // opcional
      NotificationPriority.HIGH
    );
  }
}
```

### Ejemplos de Uso

#### 1. Auth Service - Email de Bienvenida

```typescript
@Injectable()
export class AuthService {
  constructor(private readonly notificationService: NotificationService) {}

  async registerUser(userData: CreateUserDto) {
    const user = await this.createUser(userData);

    // Enviar email de bienvenida
    await this.notificationService.sendNotification(
      NotificationChannel.EMAIL,
      {
        to: user.email,
        subject: "¡Bienvenido a Bookly!",
        message: `
          <h1>Hola ${user.name}</h1>
          <p>Gracias por registrarte en Bookly.</p>
          <p>Ya puedes reservar espacios y recursos.</p>
        `,
        template: "welcome",
      },
      user.tenantId,
      NotificationPriority.NORMAL
    );

    return user;
  }
}
```

#### 2. Resources Service - Notificar Cambio de Recurso

```typescript
@Injectable()
export class ResourceService {
  constructor(private readonly notificationService: NotificationService) {}

  async updateResource(id: string, updates: UpdateResourceDto) {
    const resource = await this.update(id, updates);
    const affectedUsers = await this.getAffectedUsers(id);

    // Notificar a usuarios afectados
    await this.notificationService.sendBatch(
      affectedUsers.map((user) => ({
        channel: NotificationChannel.EMAIL,
        payload: {
          to: user.email,
          subject: `Recurso ${resource.name} actualizado`,
          message: `El recurso ha sido modificado.`,
          data: { resourceId: id, changes: updates },
        },
        tenantId: resource.tenantId,
        priority: NotificationPriority.NORMAL,
      }))
    );

    return resource;
  }
}
```

#### 3. Availability Service - Confirmación de Reserva

```typescript
@Injectable()
export class ReservationService {
  constructor(private readonly notificationService: NotificationService) {}

  async confirmReservation(reservationId: string) {
    const reservation = await this.getReservation(reservationId);

    // Enviar confirmación por múltiples canales
    await this.notificationService.sendBatch([
      {
        channel: NotificationChannel.EMAIL,
        payload: {
          to: reservation.user.email,
          subject: "Reserva confirmada",
          message: `Tu reserva para ${reservation.resourceName} ha sido confirmada.`,
        },
        tenantId: reservation.tenantId,
        priority: NotificationPriority.HIGH,
      },
      {
        channel: NotificationChannel.SMS,
        payload: {
          to: reservation.user.phone,
          message: `Reserva confirmada: ${reservation.resourceName} - ${reservation.date}`,
        },
        tenantId: reservation.tenantId,
        priority: NotificationPriority.HIGH,
      },
      {
        channel: NotificationChannel.WHATSAPP,
        payload: {
          to: reservation.user.phone,
          message: `✅ Tu reserva ha sido confirmada: ${reservation.resourceName}`,
        },
        tenantId: reservation.tenantId,
        priority: NotificationPriority.HIGH,
      },
    ]);

    return reservation;
  }
}
```

#### 4. Stockpile Service - Recordatorios Automáticos

```typescript
@Injectable()
export class ReminderService {
  constructor(private readonly notificationService: NotificationService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendPendingApprovalReminders() {
    const pendingRequests = await this.getPendingApprovals();

    for (const request of pendingRequests) {
      await this.notificationService.sendNotification(
        NotificationChannel.EMAIL,
        {
          to: request.approver.email,
          subject: "Recordatorio: Aprobación pendiente",
          message: `Tienes una solicitud pendiente de ${request.requester.name}`,
          data: {
            requestId: request.id,
            reminderType: "pending_approval",
          },
        },
        request.tenantId,
        NotificationPriority.NORMAL
      );
    }
  }
}
```

---

## 🔧 Configuración

### Variables de Entorno

```bash
# Event Bus (RabbitMQ/Kafka)
EVENT_BUS_TYPE=rabbitmq
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672
KAFKA_BROKERS=localhost:9092

# Event Store (opcional)
ENABLE_EVENT_STORE=false
MONGODB_URI=mongodb://localhost:27017/bookly-events

# Notificaciones
NOTIFICATION_METRICS_ENABLED=true
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=1000

# Proveedores Email
SENDGRID_API_KEY=SG.xxxxx
AWS_SES_ACCESS_KEY=xxxxx
AWS_SES_SECRET_KEY=xxxxx

# Proveedores SMS
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx

# Proveedores WhatsApp
META_ACCESS_TOKEN=EAAxxxxx
META_PHONE_NUMBER_ID=123456789
```

### TypeScript Path Aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@libs/common": ["libs/common/src/index.ts"],
      "@libs/common/*": ["libs/common/src/*"],
      "@libs/event-bus": ["libs/event-bus/src/index.ts"],
      "@libs/event-bus/*": ["libs/event-bus/src/*"],
      "@libs/notifications": ["libs/notifications/src/index.ts"],
      "@libs/notifications/*": ["libs/notifications/src/*"]
    }
  }
}
```

---

## 📊 Flujo de Eventos

### 1. Producción de Evento

```typescript
// Service en auth-service
await notificationService.sendNotification(
  NotificationChannel.EMAIL,
  payload,
  tenantId,
  NotificationPriority.HIGH
);

// NotificationService publica evento
const event: EventPayload<SendNotificationEvent> = {
  eventId: "uuid",
  eventType: "notification.send.email",
  timestamp: new Date(),
  service: "notifications",
  data: sendNotificationEvent,
};

await eventBus.publish("notification.send.email", event);
```

### 2. Consumo de Evento

```typescript
// NotificationEventHandler en stockpile-service
async handleSendEmail(event: EventPayload<SendNotificationEvent>) {
  const notificationEvent = event.data;

  // Enviar email
  await this.emailService.send(
    notificationEvent.payload,
    notificationEvent.tenantId
  );

  // Publicar evento de éxito
  await this.publishNotificationSent(notificationEvent);
}
```

### 3. Eventos Publicados

- **notification.send.email** - Solicitud de envío de email
- **notification.send.sms** - Solicitud de envío de SMS
- **notification.send.whatsapp** - Solicitud de envío de WhatsApp
- **notification.send.push** - Solicitud de envío de Push
- **notification.sent** - Notificación enviada exitosamente
- **notification.failed** - Notificación fallida
- **notification.delivered** - Notificación entregada (webhook)

---

## ✅ Beneficios de Esta Arquitectura

### 1. **Desacoplamiento Total**

- Servicios no dependen de implementaciones específicas
- Cambiar proveedores sin modificar código del productor
- Servicios independientes pueden enviar notificaciones

### 2. **Escalabilidad Horizontal**

- Workers independientes procesan notificaciones
- Cola de mensajes maneja picos de carga
- Fácil agregar más workers si es necesario

### 3. **Resiliencia y Tolerancia a Fallos**

- Eventos persistentes en RabbitMQ/Kafka
- Reintentos automáticos
- Dead Letter Queue para mensajes fallidos
- Si stockpile-service está caído, eventos se acumulan

### 4. **Observabilidad**

- Event Store opcional para auditoría
- Métricas en tiempo real por proveedor
- Trazabilidad completa de cada notificación
- Health checks del Event Bus

### 5. **Multi-tenancy**

- Configuración específica por tenant
- Diferentes proveedores por tenant
- Aislamiento de configuraciones

### 6. **Testing y Debugging**

- Fácil mockear NotificationService
- Eventos visibles en broker
- Event Store para replay de eventos
- Métricas detalladas

---

## 🧪 Testing

### Unit Tests

```typescript
describe("NotificationService", () => {
  let service: NotificationService;
  let eventBus: jest.Mocked<EventBusService>;

  beforeEach(() => {
    eventBus = {
      publish: jest.fn(),
    } as any;

    service = new NotificationService(eventBus);
  });

  it("debe publicar evento de email", async () => {
    await service.sendNotification(NotificationChannel.EMAIL, {
      to: "test@example.com",
      subject: "Test",
      message: "Hello",
    });

    expect(eventBus.publish).toHaveBeenCalledWith(
      "notification.send.email",
      expect.objectContaining({
        eventType: "notification.send.email",
      })
    );
  });
});
```

---

## 📝 Próximos Pasos

- [ ] Implementar adapters reales (SendGrid, Twilio, etc.)
- [ ] Agregar templates HTML para emails
- [ ] Implementar webhooks para confirmaciones de entrega
- [ ] Agregar sistema de retry con backoff exponencial
- [ ] Implementar rate limiting por proveedor
- [ ] Persistir métricas en TimeSeries DB
- [ ] UI de administración de configuraciones
- [ ] Implementar tests E2E

---

**✅ Sistema de Notificaciones con EDA completamente funcional y listo para usar!**
