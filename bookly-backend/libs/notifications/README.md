# 📦 @libs/notifications

Sistema centralizado de notificaciones multi-canal y multi-proveedor para Bookly.

## 🎯 Características

- **Multi-canal**: Email, SMS, WhatsApp, Push
- **Multi-proveedor**: Soporte para múltiples proveedores por canal
- **Multi-tenant**: Configuración específica por tenant
- **Event-Driven**: Basado en Event Bus (RabbitMQ/Kafka)
- **Extensible**: Fácil agregar nuevos providers y adapters
- **Observable**: Métricas en tiempo real
- **Escalable**: Workers independientes

## 📂 Estructura

```
libs/notifications/
├── src/
│   ├── adapters/
│   │   └── base/                      # Interfaces base para adapters
│   │       ├── email-adapter.interface.ts
│   │       ├── sms-adapter.interface.ts
│   │       ├── whatsapp-adapter.interface.ts
│   │       └── push-adapter.interface.ts
│   ├── config/
│   │   └── notification.config.ts     # Configuración del módulo
│   ├── dto/
│   │   └── notification.dto.ts        # DTOs para envío de notificaciones
│   ├── enums/
│   │   └── notification-channel.enum.ts
│   ├── events/
│   │   └── notification.events.ts     # Eventos de notificaciones
│   ├── interfaces/
│   │   └── notification.interface.ts  # Interfaces principales
│   ├── providers/                     # ⭐ PROVIDERS MOVIDOS DESDE STOCKPILE
│   │   ├── adapters/
│   │   │   ├── email/                # Adapters de Email
│   │   │   │   ├── aws-ses.adapter.ts
│   │   │   │   ├── gmail.adapter.ts
│   │   │   │   ├── nodemailer.adapter.ts
│   │   │   │   ├── outlook.adapter.ts
│   │   │   │   ├── sendgrid.adapter.ts
│   │   │   │   └── base-email.adapter.ts
│   │   │   ├── sms/                  # Adapters de SMS
│   │   │   │   ├── aws-sns.adapter.ts
│   │   │   │   ├── twilio-sms.adapter.ts
│   │   │   │   └── base-sms.adapter.ts
│   │   │   └── whatsapp/             # Adapters de WhatsApp
│   │   │       ├── meta-cloud-api.adapter.ts
│   │   │       ├── twilio-whatsapp.adapter.ts
│   │   │       └── base-whatsapp.adapter.ts
│   │   ├── factories/
│   │   │   └── adapter.factory.ts    # Factory para crear adapters
│   │   ├── email-provider.service.ts # Provider agnóstico de Email
│   │   ├── sms-provider.service.ts   # Provider agnóstico de SMS
│   │   ├── whatsapp-provider.service.ts # Provider agnóstico de WhatsApp
│   │   └── tenant-notification-config.service.ts # Configuración por tenant
│   ├── services/
│   │   ├── notification.service.ts   # Servicio principal (EDA)
│   │   └── notification-metrics.service.ts # Métricas
│   ├── notifications.module.ts       # Módulo principal
│   └── index.ts                      # Exports públicos
└── README.md                         # Esta documentación
```

## 🚀 Uso

### 1. Importar en tu Microservicio

```typescript
import { NotificationsModule } from "@libs/notifications";

@Module({
  imports: [
    NotificationsModule.forRoot({
      brokerType: "rabbitmq",
      eventBus: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        exchange: "bookly-events",
        queue: "notifications_queue",
      },
      metricsEnabled: true,
      enableEventStore: false,
    }),
    // ... otros imports
  ],
})
export class MiServicioModule {}
```

### 2. Usar NotificationService (Recomendado - EDA)

**Patrón Event-Driven** - Los eventos son procesados asíncronamente por workers

```typescript
import { NotificationService } from "@libs/notifications";
import {
  NotificationChannel,
  NotificationPriority,
} from "@libs/common/src/enums";

@Injectable()
export class MiServicio {
  constructor(private readonly notificationService: NotificationService) {}

  async enviarBienvenida(email: string, nombre: string) {
    // Publica evento - procesado asíncronamente
    await this.notificationService.sendNotification(
      NotificationChannel.EMAIL,
      {
        to: email,
        subject: "¡Bienvenido a Bookly!",
        message: `<h1>Hola ${nombre}</h1><p>Gracias por registrarte.</p>`,
        template: "welcome",
        data: { name: nombre },
      },
      "tenant-id", // opcional
      NotificationPriority.HIGH
    );
  }
}
```

### 3. Usar Providers Directamente (Solo si es necesario)

**Patrón Directo** - Envío síncrono sin Event Bus

```typescript
import { EmailProviderService } from "@libs/notifications";

@Injectable()
export class MiServicio {
  constructor(private readonly emailProvider: EmailProviderService) {}

  async enviarEmail(to: string, subject: string, message: string) {
    // Envío directo - síncrono
    const result = await this.emailProvider.send(
      {
        to,
        subject,
        message,
      },
      "tenant-id" // opcional
    );

    if (result.success) {
      console.log("Email enviado:", result.messageId);
    } else {
      console.error("Error:", result.error);
    }
  }
}
```

## 📊 Flujo Event-Driven

```
┌─────────────────┐
│   Microservicio │
│  (auth, etc)    │
└────────┬────────┘
         │
         ▼
┌────────────────────────────┐
│  NotificationService       │
│  - sendNotification()      │
│  - Publica evento          │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│     Event Bus              │
│  RabbitMQ / Kafka          │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│ NotificationEventHandler   │
│ (en stockpile o worker)    │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│  EmailProviderService      │
│  SmsProviderService        │
│  WhatsAppProviderService   │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│      Adapters              │
│  SendGrid, Twilio, etc     │
└────────────────────────────┘
```

## 🔧 Configuración por Tenant

Los providers se configuran automáticamente por tenant usando `TenantNotificationConfigService`:

```typescript
{
  "tenantId": "universidad-ufps",
  "email": {
    "provider": "sendgrid",
    "from": "no-reply@ufps.edu.co",
    "config": {
      "apiKey": "SG.xxx"
    }
  },
  "sms": {
    "provider": "twilio",
    "from": "+573001234567",
    "config": {
      "accountSid": "ACxxx",
      "authToken": "xxx"
    }
  },
  "whatsapp": {
    "provider": "meta",
    "from": "123456789",
    "config": {
      "accessToken": "EAAxx",
      "phoneNumberId": "123"
    }
  }
}
```

## 🔌 Adapters Disponibles

### Email

- ✅ **Nodemailer** - SMTP genérico
- ✅ **SendGrid** - API de SendGrid
- 🚧 **AWS SES** - Amazon Simple Email Service
- 🚧 **Gmail** - Gmail API
- 🚧 **Outlook** - Microsoft Graph API

### SMS

- ✅ **Twilio** - Twilio API
- 🚧 **AWS SNS** - Amazon Simple Notification Service

### WhatsApp

- ✅ **Meta Cloud API** - WhatsApp Business Platform
- ✅ **Twilio WhatsApp** - Twilio WhatsApp API

### Push

- 🚧 **Firebase** - Firebase Cloud Messaging
- 🚧 **OneSignal** - OneSignal API

> 🚧 = En desarrollo | ✅ = Disponible

## 📈 Métricas

```typescript
import { NotificationMetricsService } from "@libs/notifications";

@Injectable()
export class MiServicio {
  constructor(private readonly metrics: NotificationMetricsService) {}

  async obtenerMetricas() {
    const metricas = await this.metrics.getMetrics();
    console.log("Total enviados:", metricas.totalSent);
    console.log("Total fallidos:", metricas.totalFailed);
    console.log("Tasa de éxito:", metricas.successRate);
  }
}
```

## 🏗️ Migración desde Stockpile

### ❌ Antes (en stockpile-service)

```typescript
import { EmailProviderService } from "./infrastructure/services/notification-providers/email-provider.service";
```

### ✅ Ahora (desde @libs/notifications)

```typescript
import { EmailProviderService } from "@libs/notifications";
```

### Cambios Realizados

1. ✅ Movidos todos los providers a `libs/notifications/src/providers/`
2. ✅ Movidos todos los adapters a `libs/notifications/src/providers/adapters/`
3. ✅ Movidas las factories a `libs/notifications/src/providers/factories/`
4. ✅ Actualizado `NotificationsModule` para exportar providers
5. ✅ Actualizado `NotificationEventHandler` para usar providers desde @libs
6. ✅ Actualizado `stockpile.module.ts` para no duplicar providers
7. ✅ Interfaces unificadas en `libs/notifications/src/interfaces/`

## 🧪 Testing

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

## 📚 Documentación Adicional

- [NOTIFICATIONS_EDA_IMPLEMENTATION.md](../../NOTIFICATIONS_EDA_IMPLEMENTATION.md) - Implementación completa del sistema EDA
- [INTEGRATION_GUIDE.md](../../INTEGRATION_GUIDE.md) - Guía de integración detallada

## 🚀 Próximos Pasos

- [ ] Implementar adapters reales (AWS SES, Gmail, Outlook)
- [ ] Agregar templates HTML para emails
- [ ] Implementar webhooks para confirmaciones de entrega
- [ ] Agregar sistema de retry con backoff exponencial
- [ ] Implementar rate limiting por proveedor
- [ ] Persistir métricas en TimeSeries DB
- [ ] UI de administración de configuraciones
- [ ] Implementar tests E2E

## 📝 Notas Importantes

1. **NotificationService** usa Event Bus - es asíncrono
2. **Providers directos** son síncronos - úsalos solo si lo necesitas
3. Los **workers** (NotificationEventHandler) deben estar corriendo para procesar eventos
4. Configuración por tenant se carga automáticamente
5. Los providers son **thread-safe** y reutilizables

---

**✅ Sistema de notificaciones completamente centralizado y listo para usar!**
