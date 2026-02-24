# RF-27: Integración con Sistemas de Mensajería

**Estado**: ✅ Completado

**Prioridad**: Alta

**Fecha de Implementación**: Noviembre 9, 2025

---

## 📋 Descripción

Sistema robusto y extensible de integración con múltiples proveedores de mensajería (email, SMS, WhatsApp, push notifications, in-app) que permite configuración por tenant, fallback automático entre proveedores, webhooks unificados para estados de entrega y métricas en tiempo real, implementado como librería compartida en `@libs/notifications`.

---

## ✅ Criterios de Aceptación

- [x] Múltiples canales: Email, SMS, WhatsApp, Push Notifications, In-App
- [x] 10 adapters de proveedores implementados
- [x] Configuración diferenciada por tenant (institución)
- [x] Fallback automático si un proveedor falla
- [x] Webhooks unificados para todos los proveedores
- [x] Métricas de entrega en tiempo real (tasa de éxito, latencia, errores)
- [x] Plantillas customizables por proveedor y canal
- [x] Rate limiting por proveedor y tenant
- [x] Retry automático con backoff exponencial
- [x] Persistencia de logs de envío en MongoDB
- [x] Eventos publicados vía Event Bus (EDA)
- [x] Seguridad: API keys encriptadas, validación de webhooks

---

## 🏗️ Implementación

### Ubicación: Librería Compartida

**Path**: `libs/notifications/`

Esta funcionalidad está implementada como **librería compartida** y puede ser usada por:

- ✅ `stockpile-service` - Notificaciones de aprobaciones y check-in/out
- ✅ `availability-service` - Confirmaciones de reservas
- ✅ `auth-service` - Reset de contraseñas, verificaciones
- ✅ `api-gateway` - Notificaciones centralizadas
- ✅ `reports-service` - Reportes programados por email

### Componentes Principales

**Services (`@libs/notifications`)**:

- `NotificationService` - Orquestador principal
- `EmailProviderService` - Servicio de emails
- `SMSProviderService` - Servicio de SMS
- `WhatsAppProviderService` - Servicio de WhatsApp
- `PushProviderService` - Servicio de push notifications
- `TenantNotificationConfigService` - Configuración por tenant
- `NotificationMetricsService` - Métricas en tiempo real
- `WebhookService` - Procesamiento de webhooks

**Adapters (Patrón Strategy)**:

📧 **Email** (3 adapters):

- `SendGridAdapter` - Email transaccional con templates
- `AwsSesAdapter` - Alto volumen, bajo costo
- `NodeMailerAdapter` - SMTP propio, desarrollo

📱 **SMS** (1 adapter):

- `TwilioSmsAdapter` - SMS internacional

💬 **WhatsApp** (2 adapters):

- `TwilioWhatsAppAdapter` - WhatsApp vía Twilio
- `MetaWhatsAppAdapter` - WhatsApp Business API directa

🔔 **Push Notifications** (3 adapters):

- `FirebaseFcmAdapter` - Android/iOS/Web
- `OneSignalAdapter` - Multiplataforma
- `ExpoPushAdapter` - React Native (Expo)

📬 **In-App** (1 adapter):

- `InAppNotificationAdapter` - MongoDB + WebSocket

**Factories**:

- `EmailAdapterFactory` - Factory para adapters de email
- `NotificationAdapterFactory` - Factory general

**Webhook Handlers**:

- `SendGridWebhookHandler` - Eventos de SendGrid
- `TwilioWebhookHandler` - Eventos de Twilio (SMS y WhatsApp)
- `MetaWhatsAppWebhookHandler` - Eventos de WhatsApp Business
- `FirebaseWebhookHandler` - Eventos de FCM
- `ChannelWebhookService` - Coordinador de webhooks

---

## 📦 Proveedores Implementados

### 1. Email Providers

#### SendGrid (Recomendado para Producción)

**Características**:

- Templates HTML con variables dinámicas
- Tracking de aperturas y clicks
- Webhooks nativos (delivered, opened, clicked, bounced)
- Deliverability alto (>98%)
- Supresión automática de bounces

**Configuración**:

```typescript
{
  provider: "sendgrid",
  config: {
    apiKey: "SG.xxx",
    fromEmail: "noreply@ufps.edu.co",
    fromName: "Bookly UFPS",
    templateId: "d-xxx" // Opcional
  }
}
```

**Uso desde Stockpile**:

```typescript
import { NotificationService } from "@libs/notifications";

await notificationService.sendEmail({
  tenant: "UFPS",
  to: "usuario@ufps.edu.co",
  subject: "Reserva Aprobada",
  body: "<h1>Tu reserva ha sido aprobada</h1>",
  metadata: { reservationId, approvalId },
});
```

#### AWS SES (Escalable y Económico)

**Características**:

- Bajo costo ($0.10 por 1,000 emails)
- Escalabilidad ilimitada
- Integración nativa con AWS

**Configuración**:

```typescript
{
  provider: "aws-ses",
  config: {
    region: "us-east-1",
    accessKeyId: "AKIA...",
    secretAccessKey: "xxx",
    fromEmail: "noreply@ufps.edu.co"
  }
}
```

#### NodeMailer / SMTP (Control Total)

**Características**:

- Servidor SMTP propio
- Sin límites de envío
- Ideal para desarrollo y testing

**Configuración**:

```typescript
{
  provider: "nodemailer",
  config: {
    host: "smtp.ufps.edu.co",
    port: 587,
    secure: false,
    auth: {
      user: "bookly@ufps.edu.co",
      pass: "xxx"
    }
  }
}
```

---

### 2. SMS Provider

#### Twilio SMS (Único)

**Características**:

- Cobertura en 180+ países
- Tracking de entrega
- Webhooks de estado
- Números locales

**Configuración**:

```typescript
{
  provider: "twilio-sms",
  config: {
    accountSid: "ACxxx",
    authToken: "xxx",
    fromNumber: "+57123456789"
  }
}
```

**Uso**:

```typescript
await notificationService.sendSMS({
  tenant: "UFPS",
  to: "+573001234567",
  body: "Tu reserva para el Auditorio Principal ha sido aprobada. Código: ABC123",
  metadata: { reservationId },
});
```

---

### 3. WhatsApp Providers

#### Twilio WhatsApp (Rápido Setup)

**Características**:

- Setup en minutos (sandbox)
- Templates pre-aprobados
- Webhooks de estado de lectura

**Configuración**:

```typescript
{
  provider: "twilio-whatsapp",
  config: {
    accountSid: "ACxxx",
    authToken: "xxx",
    fromNumber: "whatsapp:+14155238886" // Sandbox
  }
}
```

#### WhatsApp Business API (Producción)

**Características**:

- Templates customizados aprobados por WhatsApp
- Número propio de la institución
- Analytics avanzados
- Webhooks de conversaciones

**Configuración**:

```typescript
{
  provider: "meta-whatsapp",
  config: {
    phoneNumberId: "123456789",
    accessToken: "EAAxxxx",
    businessAccountId: "xxx",
    webhookVerifyToken: "bookly_webhook_secret"
  }
}
```

**Uso**:

```typescript
await notificationService.sendWhatsApp({
  tenant: "UFPS",
  to: "573001234567",
  template: "reservation_approved",
  variables: {
    userName: "Juan Pérez",
    resourceName: "Auditorio Principal",
    date: "2025-11-15",
    time: "14:00",
  },
  metadata: { reservationId },
});
```

---

### 4. Push Notification Providers

#### Firebase Cloud Messaging (Multiplataforma)

**Características**:

- Android, iOS, Web
- Notificaciones silenciosas (data-only)
- Topics y grupos
- Analytics integrado con Firebase

**Configuración**:

```typescript
{
  provider: "firebase-fcm",
  config: {
    projectId: "bookly-ufps",
    privateKey: "-----BEGIN PRIVATE KEY-----...",
    clientEmail: "firebase-adminsdk@bookly-ufps.iam.gserviceaccount.com"
  }
}
```

**Uso**:

```typescript
await notificationService.sendPushNotification({
  tenant: "UFPS",
  deviceTokens: ["fcm_token_1", "fcm_token_2"],
  title: "Reserva Aprobada",
  body: "Tu solicitud para el Auditorio Principal ha sido aprobada",
  data: { reservationId, type: "approval" },
  metadata: { userId },
});
```

#### OneSignal (Simplificado)

**Características**:

- Dashboard visual
- Segmentación de usuarios
- A/B testing de notificaciones
- Sin necesidad de backend

**Configuración**:

```typescript
{
  provider: "onesignal",
  config: {
    appId: "xxx-xxx-xxx",
    apiKey: "xxx"
  }
}
```

#### Expo Push (React Native)

**Características**:

- Integración nativa con Expo
- Sin configuración de certificados
- Ideal para apps Expo

**Configuración**:

```typescript
{
  provider: "expo-push",
  config: {
    accessToken: "xxx" // Opcional
  }
}
```

---

### 5. In-App Notifications

#### MongoDB + WebSocket (Custom)

**Características**:

- Notificaciones persistentes
- Tiempo real vía WebSocket
- Leído/No leído
- Historial completo

**Implementación**:

```typescript
await notificationService.sendInApp({
  tenant: "UFPS",
  userId: "user123",
  title: "Nueva Aprobación",
  body: "Tu solicitud ha sido procesada",
  icon: "check-circle",
  link: "/approvals/123",
  metadata: { approvalId },
});
```

**WebSocket Event**:

```typescript
// Cliente escucha
socket.on("notification:new", (notification) => {
  // Mostrar badge, toast, etc.
});
```

---

## 🔄 Fallback Automático

### Estrategia de Fallback

Si un proveedor falla, el sistema intenta con el fallback configurado:

```typescript
// Configuración de tenant
{
  email: {
    primary: "sendgrid",
    fallback: "aws-ses",
    fallbackOnError: true
  },
  whatsapp: {
    primary: "meta-whatsapp",
    fallback: "twilio-whatsapp",
    fallbackOnError: true
  }
}
```

### Flujo de Fallback

```
1. Intentar con proveedor primario (SendGrid)
   ↓
2. Si falla (timeout, 5xx, rate limit)
   ↓
3. Esperar backoff (1s, 2s, 4s exponencial)
   ↓
4. Intentar con proveedor fallback (AWS SES)
   ↓
5. Si ambos fallan, registrar en DLQ
   ↓
6. Publicar evento de fallo en Event Bus
```

---

## 🪝 Webhooks Unificados

### Arquitectura de Webhooks

Todos los proveedores publican eventos en formato unificado:

```typescript
// Endpoint de webhook
POST /api/v1/notifications/webhooks/:provider

// Payload unificado
{
  provider: "sendgrid" | "twilio-sms" | "twilio-whatsapp" | "meta-whatsapp" | "firebase-fcm",
  event: "delivered" | "opened" | "clicked" | "bounced" | "failed" | "read",
  notificationId: "notification_mongo_id",
  externalId: "provider_message_id",
  timestamp: "2025-11-12T10:00:00Z",
  metadata: {
    // Datos específicos del proveedor
  }
}
```

### Eventos Soportados

| Provider        | delivered | opened | clicked | bounced | failed | read |
| --------------- | --------- | ------ | ------- | ------- | ------ | ---- |
| SendGrid        | ✅        | ✅     | ✅      | ✅      | ✅     | -    |
| AWS SES         | ✅        | ✅     | -       | ✅      | ✅     | -    |
| Twilio SMS      | ✅        | -      | -       | -       | ✅     | -    |
| Twilio WhatsApp | ✅        | -      | -       | -       | ✅     | ✅   |
| Meta WhatsApp   | ✅        | -      | -       | -       | ✅     | ✅   |
| Firebase FCM    | ✅        | -      | -       | -       | ✅     | -    |

### Configuración de Webhooks

#### SendGrid

```bash
# URL del webhook
https://bookly-api.ufps.edu.co/api/v1/notifications/webhooks/sendgrid

# Eventos a suscribirse
- processed
- delivered
- open
- click
- bounce
- dropped
```

#### Twilio

```bash
# URL del webhook (SMS y WhatsApp)
https://bookly-api.ufps.edu.co/api/v1/notifications/webhooks/twilio

# Eventos automáticos
- sent
- delivered
- read (solo WhatsApp)
- failed
```

#### WhatsApp Business API

```bash
# URL del webhook
https://bookly-api.ufps.edu.co/api/v1/notifications/webhooks/meta-whatsapp

# Verificación
GET /api/v1/notifications/webhooks/meta-whatsapp?hub.mode=subscribe&hub.challenge=xxx&hub.verify_token=bookly_webhook_secret

# Eventos
- messages (received, read)
- message_status (sent, delivered, read, failed)
```

---

## 📊 Métricas en Tiempo Real

### NotificationMetricsService

**Métricas rastreadas**:

```typescript
{
  // Por canal
  byChannel: {
    EMAIL: { sent: 1500, delivered: 1450, opened: 800, failed: 50 },
    SMS: { sent: 500, delivered: 490, failed: 10 },
    WHATSAPP: { sent: 800, delivered: 785, read: 600, failed: 15 },
    PUSH: { sent: 2000, delivered: 1900, failed: 100 },
    IN_APP: { sent: 3000, read: 2500, unread: 500 }
  },

  // Por proveedor
  byProvider: {
    sendgrid: { sent: 1000, delivered: 980, failed: 20, deliveryRate: 98% },
    "aws-ses": { sent: 500, delivered: 470, failed: 30, deliveryRate: 94% },
    "twilio-sms": { sent: 500, delivered: 490, failed: 10, deliveryRate: 98% }
  },

  // Latencia promedio
  avgLatency: {
    EMAIL: "2.5s",
    SMS: "1.2s",
    WHATSAPP: "1.8s",
    PUSH: "0.5s"
  },

  // Errores comunes
  topErrors: [
    { error: "Invalid recipient", count: 15 },
    { error: "Rate limit exceeded", count: 8 },
    { error: "Timeout", count: 5 }
  ]
}
```

### Endpoints de Métricas

```http
GET /api/v1/notification-metrics/summary
GET /api/v1/notification-metrics/by-channel
GET /api/v1/notification-metrics/by-provider
GET /api/v1/notification-metrics/failures
GET /api/v1/notification-metrics/delivery-times
```

### Métricas Expuestas en API Gateway

**Endpoint agregado**:

```http
GET /api/metrics-dashboard/api/service/stockpile-service
```

**Response**:

```json
{
  "service": "stockpile-service",
  "notifications": {
    "totalSent": 5800,
    "successRate": 96.5,
    "channels": {
      "EMAIL": { "sent": 1500, "successRate": 96.67 },
      "SMS": { "sent": 500, "successRate": 98.0 },
      "WHATSAPP": { "sent": 800, "successRate": 98.13 },
      "PUSH": { "sent": 2000, "successRate": 95.0 },
      "IN_APP": { "sent": 3000, "successRate": 100.0 }
    }
  }
}
```

---

## 🔒 Seguridad

### Encriptación de API Keys

```typescript
// Al guardar configuración
const encrypted = await encryptService.encrypt(apiKey);

// Al usar
const decrypted = await encryptService.decrypt(encryptedApiKey);
```

### Validación de Webhooks

#### SendGrid

```typescript
// Verificar firma HMAC
const signature = req.headers["x-twilio-email-event-webhook-signature"];
const isValid = verifySignature(signature, body, webhookSecret);
```

#### Twilio

```typescript
// Verificar firma con Twilio SDK
const twilioSignature = req.headers["x-twilio-signature"];
const isValid = twilio.validateRequest(
  webhookSecret,
  twilioSignature,
  url,
  params
);
```

#### WhatsApp Business

```typescript
// Verificar token de verificación
if (req.query["hub.verify_token"] === process.env.WHATSAPP_VERIFY_TOKEN) {
  return res.send(req.query["hub.challenge"]);
}
```

### Rate Limiting por Proveedor

```typescript
// Configuración de límites
{
  sendgrid: { maxPerSecond: 100, maxPerDay: 50000 },
  "twilio-sms": { maxPerSecond: 10, maxPerDay: 10000 },
  "meta-whatsapp": { maxPerSecond: 80, maxPerDay: 100000 }
}
```

---

## 🎯 Casos de Uso en Stockpile Service

### 1. Notificación de Aprobación

```typescript
// En ApprovalRequestService
async approveRequest(requestId, actorId) {
  // ... lógica de aprobación ...

  // Notificar al solicitante
  await this.notificationService.sendMultiChannel({
    userId: request.userId,
    channels: ['EMAIL', 'WHATSAPP', 'PUSH'],
    template: 'reservation_approved',
    data: {
      userName: user.name,
      resourceName: resource.name,
      date: request.date,
      approver: actor.name
    }
  });
}
```

### 2. Recordatorio Programado

```typescript
// En ReminderService
async scheduleReminder(reservationId, sendAt) {
  const job = await this.queueService.schedule({
    name: 'send-reminder',
    data: { reservationId },
    runAt: sendAt
  });

  // Al ejecutarse
  await this.notificationService.sendEmail({
    to: user.email,
    template: 'reservation_reminder',
    data: { /* ... */ }
  });
}
```

### 3. Notificación por Proximidad

```typescript
// En ProximityNotificationService
async notifyProximity(userId, resourceId, distance) {
  if (distance < 20) {
    await this.notificationService.sendPushNotification({
      userId,
      title: "¡Has llegado!",
      body: `Estás cerca del ${resource.name}. Realiza check-in.`,
      data: { action: 'CHECK_IN', resourceId }
    });
  }
}
```

---

## 📚 Documentación Relacionada

- [RF-22: Notificaciones Automáticas](./RF-22_NOTIFICACIONES_AUTOMATICAS.md)
- [RF-28: Notificaciones de Cambios](./RF-28_NOTIFICACIONES_CAMBIOS.md)
- [NOTIFICATION_PROVIDERS](../NOTIFICATION_PROVIDERS.md) - Documentación técnica completa
- [Event Bus](../EVENT_BUS.md)
- [Libs/Notifications](../../../../libs/notifications/README.md)

---

## 🚀 Roadmap

### Corto Plazo

- [ ] Adapter para Telegram
- [ ] Adapter para Discord (para comunidades estudiantiles)
- [ ] Templates visuales editables sin código

### Mediano Plazo

- [ ] ML para optimal send time (mejor hora para cada usuario)
- [ ] A/B testing de mensajes
- [ ] Segmentación avanzada de usuarios

### Largo Plazo

- [ ] RCS (Rich Communication Services) para Android
- [ ] Apple Business Chat
- [ ] Chatbots integrados en WhatsApp

---

**Mantenedor**: Bookly Development Team  
**Última Actualización**: Noviembre 12, 2025
