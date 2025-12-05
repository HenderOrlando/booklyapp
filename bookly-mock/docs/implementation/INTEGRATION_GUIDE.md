# 📘 Guía de Integración - Sistema de Notificaciones Unificado

## 🎯 Objetivo

Esta guía explica cómo integrar el sistema de notificaciones unificado en todos los servicios de Bookly.

---

## 📦 Paso 1: Instalar la librería de notificaciones

### En cada servicio que necesite enviar notificaciones:

```bash
# Desde la raíz del monorepo
npm install
```

La librería `@libs/notifications` ya está disponible como dependencia interna.

---

## 🔧 Paso 2: Configurar el módulo en cada servicio

### Ejemplo: Auth Service

```typescript
// apps/auth-service/src/auth.module.ts
import { Module } from "@nestjs/common";
import { NotificationsModule } from "@libs/notifications";

@Module({
  imports: [
    // ... otros imports
    NotificationsModule.forRoot({
      rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queue: "notifications_queue",
      },
      metricsEnabled: true,
    }),
  ],
  // ... resto del módulo
})
export class AuthModule {}
```

---

## 📨 Paso 3: Usar el servicio en tu código

### Ejemplo 1: Enviar email de bienvenida

```typescript
import { Injectable } from "@nestjs/common";
import { NotificationService } from "@libs/notifications";
import { NotificationChannel } from "@libs/common/src/enums";

@Injectable()
export class UserRegistrationService {
  constructor(private readonly notificationService: NotificationService) {}

  async registerUser(userData: CreateUserDto) {
    // 1. Crear usuario
    const user = await this.userRepository.create(userData);

    // 2. Enviar email de bienvenida
    await this.notificationService.sendNotification(
      NotificationChannel.EMAIL,
      {
        to: user.email,
        subject: "¡Bienvenido a Bookly!",
        message: `
          <h1>Hola ${user.name}</h1>
          <p>Gracias por unirte a Bookly.</p>
          <p>Ahora puedes reservar espacios y recursos fácilmente.</p>
        `,
        template: "welcome",
      },
      user.tenantId,
      "high"
    );

    return user;
  }
}
```

### Ejemplo 2: Enviar SMS de verificación

```typescript
async sendVerificationCode(phoneNumber: string, code: string, tenantId: string) {
  await this.notificationService.sendNotification(
    NotificationChannel.SMS,
    {
      to: phoneNumber,
      message: `Tu código de verificación de Bookly es: ${code}`,
    },
    tenantId,
    "high"
  );
}
```

### Ejemplo 3: Enviar notificación WhatsApp

```typescript
async notifyReservationApproved(reservation: Reservation) {
  await this.notificationService.sendNotification(
    NotificationChannel.WHATSAPP,
    {
      to: reservation.user.phone,
      message: `✅ Tu reserva ha sido aprobada: ${reservation.resourceName} - ${reservation.date}`,
      data: {
        reservationId: reservation.id,
        type: "approval",
      },
    },
    reservation.tenantId,
    "normal"
  );
}
```

### Ejemplo 4: Enviar notificación Push

```typescript
async notifyResourceAvailable(userId: string, resource: Resource) {
  await this.notificationService.sendNotification(
    NotificationChannel.PUSH,
    {
      to: user.deviceToken,
      message: `El recurso ${resource.name} está disponible`,
      data: {
        resourceId: resource.id,
        type: "availability",
        action: "OPEN_RESOURCE",
      },
    },
    resource.tenantId,
    "normal"
  );
}
```

### Ejemplo 5: Enviar notificaciones en batch

```typescript
async notifyMultipleUsers(users: User[], message: string) {
  await this.notificationService.sendBatch(
    users.map((user) => ({
      channel: NotificationChannel.EMAIL,
      payload: {
        to: user.email,
        subject: "Notificación importante",
        message,
      },
      tenantId: user.tenantId,
      priority: "normal",
    }))
  );
}
```

---

## 🏭 Paso 4: Configurar Stockpile Service como Worker

El Stockpile Service actúa como worker que procesa las notificaciones.

```typescript
// apps/stockpile-service/src/stockpile.module.ts
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationsModule } from "@libs/notifications";

// Services
import { EmailProviderService } from "./infrastructure/services/notification-providers/email-provider.service";
import { SmsProviderService } from "./infrastructure/services/notification-providers/sms-provider.service";
import { WhatsAppProviderService } from "./infrastructure/services/notification-providers/whatsapp-provider.service";
import { TenantNotificationConfigService } from "./infrastructure/services/notification-providers/tenant-notification-config.service";

// Repositories
import { TenantNotificationConfigRepository } from "./infrastructure/repositories/tenant-notification-config.repository";

// Factories
import { AdapterFactory } from "./infrastructure/services/notification-providers/factories/adapter.factory";

// Schemas
import {
  TenantNotificationConfig,
  TenantNotificationConfigSchema,
} from "./infrastructure/schemas/tenant-notification-config.schema";

// Event Handlers
import { NotificationEventHandler } from "./infrastructure/handlers/notification-event.handler";

@Module({
  imports: [
    // RabbitMQ Client
    ClientsModule.register([
      {
        name: "RABBITMQ_CLIENT",
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || "amqp://localhost:5672"],
          queue: "notifications_queue",
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),

    // Notifications Module
    NotificationsModule.forRoot({
      rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queue: "notifications_queue",
      },
    }),

    // MongoDB Schemas
    MongooseModule.forFeature([
      {
        name: TenantNotificationConfig.name,
        schema: TenantNotificationConfigSchema,
      },
    ]),
  ],
  controllers: [
    // ... otros controllers
  ],
  providers: [
    // Event Handlers
    NotificationEventHandler,

    // Notification Services
    EmailProviderService,
    SmsProviderService,
    WhatsAppProviderService,
    TenantNotificationConfigService,

    // Repositories
    TenantNotificationConfigRepository,

    // Factories
    AdapterFactory,

    // ... otros providers
  ],
})
export class StockpileModule {}
```

---

## 🎧 Paso 5: Crear Event Handler en Stockpile

```typescript
// apps/stockpile-service/src/infrastructure/handlers/notification-event.handler.ts
import { Injectable } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";
import {
  NotificationEventType,
  SendNotificationEvent,
} from "@libs/notifications";
import { EmailProviderService } from "../services/notification-providers/email-provider.service";
import { SmsProviderService } from "../services/notification-providers/sms-provider.service";
import { WhatsAppProviderService } from "../services/notification-providers/whatsapp-provider.service";
import { createLogger } from "@libs/common/src/utils/logger.util";

const logger = createLogger("NotificationEventHandler");

@Injectable()
export class NotificationEventHandler {
  constructor(
    private readonly emailService: EmailProviderService,
    private readonly smsService: SmsProviderService,
    private readonly whatsappService: WhatsAppProviderService
  ) {}

  @EventPattern(NotificationEventType.SEND_EMAIL)
  async handleSendEmail(event: SendNotificationEvent) {
    logger.info(`Processing email notification: ${event.eventId}`);
    try {
      await this.emailService.send(event.payload, event.tenantId);
      logger.info(`Email sent successfully: ${event.eventId}`);
    } catch (error) {
      logger.error(`Error sending email: ${event.eventId}`, error);
      throw error;
    }
  }

  @EventPattern(NotificationEventType.SEND_SMS)
  async handleSendSms(event: SendNotificationEvent) {
    logger.info(`Processing SMS notification: ${event.eventId}`);
    try {
      await this.smsService.send(event.payload, event.tenantId);
      logger.info(`SMS sent successfully: ${event.eventId}`);
    } catch (error) {
      logger.error(`Error sending SMS: ${event.eventId}`, error);
      throw error;
    }
  }

  @EventPattern(NotificationEventType.SEND_WHATSAPP)
  async handleSendWhatsApp(event: SendNotificationEvent) {
    logger.info(`Processing WhatsApp notification: ${event.eventId}`);
    try {
      await this.whatsappService.send(event.payload, event.tenantId);
      logger.info(`WhatsApp sent successfully: ${event.eventId}`);
    } catch (error) {
      logger.error(`Error sending WhatsApp: ${event.eventId}`, error);
      throw error;
    }
  }
}
```

---

## 🌐 Paso 6: Configurar API Gateway

```typescript
// apps/api-gateway/src/api-gateway.module.ts
import { Module } from "@nestjs/common";
import { NotificationsModule } from "@libs/notifications";
import { NotificationSenderController } from "./infrastructure/controllers/notification-sender.controller";
import { MetricsDashboardController } from "./infrastructure/controllers/metrics-dashboard.controller";
import { MetricsDashboardService } from "./infrastructure/services/metrics-dashboard.service";

@Module({
  imports: [
    // ... otros imports
    NotificationsModule.forRoot({
      rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queue: "notifications_queue",
      },
      metricsEnabled: true,
    }),
  ],
  controllers: [
    // ... otros controllers
    NotificationSenderController,
    MetricsDashboardController,
  ],
  providers: [
    // ... otros providers
    MetricsDashboardService,
  ],
})
export class ApiGatewayModule {}
```

---

## 🔐 Paso 7: Configurar Variables de Entorno

```bash
# .env
RABBITMQ_URL=amqp://localhost:5672
MONGODB_URI=mongodb://localhost:27017/bookly

# Email Providers
SENDGRID_API_KEY=SG.xxxxx
AWS_SES_ACCESS_KEY=xxxxx
AWS_SES_SECRET_KEY=xxxxx
GMAIL_CLIENT_ID=xxxxx
GMAIL_CLIENT_SECRET=xxxxx

# SMS Providers
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp Providers
META_ACCESS_TOKEN=EAAxxxxx
META_PHONE_NUMBER_ID=123456789
```

---

## 📊 Paso 8: Acceder al Dashboard

Una vez configurado todo, puedes acceder al dashboard de métricas:

```
http://localhost:3000/metrics-dashboard
```

El dashboard muestra:
- Total de notificaciones enviadas
- Tasa de éxito
- Notificaciones por canal
- Notificaciones por proveedor
- Estado de todos los servicios
- Configuraciones activas

---

## ✅ Checklist de Integración

- [ ] Instalar dependencias
- [ ] Importar `NotificationsModule` en cada servicio
- [ ] Inyectar `NotificationService` donde se necesite
- [ ] Configurar Stockpile como worker con Event Handlers
- [ ] Configurar API Gateway con controllers de notificaciones
- [ ] Configurar variables de entorno
- [ ] Probar envío de notificaciones
- [ ] Verificar métricas en dashboard
- [ ] Configurar proveedores por tenant en MongoDB

---

## 🧪 Testing

### Probar envío desde API Gateway

```bash
curl -X POST http://localhost:3000/notification-sender/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "channel": "EMAIL",
    "to": "test@example.com",
    "subject": "Test",
    "message": "Hello from Bookly!",
    "tenantId": "default",
    "priority": "normal"
  }'
```

---

## 🆘 Troubleshooting

### Problema: Notificaciones no se envían

**Solución**:
1. Verificar que RabbitMQ esté corriendo
2. Verificar que Stockpile Service esté escuchando eventos
3. Revisar logs del Event Handler

### Problema: Dashboard no muestra métricas

**Solución**:
1. Verificar que `metricsEnabled: true` en la configuración
2. Enviar algunas notificaciones primero
3. Refrescar el dashboard

### Problema: Error de configuración de proveedor

**Solución**:
1. Verificar variables de entorno
2. Crear configuración de tenant en MongoDB
3. Revisar logs de adapters

---

**🎉 ¡Sistema Listo para Usar!**

Cualquier servicio de Bookly ahora puede enviar notificaciones multicanal de forma sencilla y desacoplada.
