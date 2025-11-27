# 📢 Sistema de Notificaciones Multi-Proveedor

## 📋 Índice

- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Proveedores Implementados](#proveedores-implementados)
- [Configuración](#configuración)
- [Uso](#uso)
- [Webhooks](#webhooks)
- [Métricas](#métricas)

---

## 🎯 Visión General

Sistema agnóstico de notificaciones que permite:

- ✅ **Cambiar de proveedor sin modificar código**
- ✅ **Configuración por tenant/usuario**
- ✅ **Múltiples proveedores simultáneos**
- ✅ **Fallback automático**
- ✅ **Webhooks para actualización de estado**
- ✅ **Métricas en tiempo real**

---

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────┐
│              NotificationService                     │
│  ┌────────────────────────────────────────────┐      │
│  │  getProvider(tenant, channel)              │      │
│  │    → NotificationConfigService             │      │
│  │    → AdapterRegistry                       │      │
│  │    → Execute Strategy                      │      │
│  └────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Email Provider│  │ SMS Provider │  │Push Provider │
├──────────────┤  ├──────────────┤  ├──────────────┤
│  SendGrid    │  │ Twilio SMS   │  │ Firebase FCM │
│  AWS SES     │  │              │  │  OneSignal   │
│  NodeMailer  │  │              │  │  Expo Push   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Flujo de Envío

```typescript
1. Cliente solicita envío de notificación
   ↓
2. NotificationService obtiene configuración del tenant
   ↓
3. Selecciona adapter según proveedor configurado
   ↓
4. Ejecuta envío con adapter
   ↓
5. Si falla, intenta con proveedor fallback
   ↓
6. Persiste resultado en MongoDB
   ↓
7. Publica evento en Event Bus
   ↓
8. Actualiza métricas
```

---

## 📦 Proveedores Implementados

### Email

#### 1. **SendGrid**

**Características**:

- Templates HTML
- Tracking de aperturas y clicks
- Webhooks nativos
- Deliverability alto

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

**Uso**:

```typescript
await notificationService.sendEmail({
  tenant: "UFPS",
  to: "user@example.com",
  subject: "Reserva Aprobada",
  body: "<h1>Tu reserva ha sido aprobada</h1>",
  metadata: { reservationId: "123" },
});
```

#### 2. **AWS SES**

**Características**:

- Bajo costo
- Alta escalabilidad
- Integración con AWS

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

#### 3. **NodeMailer (SMTP)**

**Características**:

- Servidor SMTP propio
- Control total
- Sin límites de envío

**Configuración**:

```typescript
{
  provider: "nodemailer",
  config: {
    host: "smtp.ufps.edu.co",
    port: 587,
    secure: false,
    auth: {
      user: "noreply@ufps.edu.co",
      pass: "xxx"
    }
  }
}
```

---

### SMS

#### 1. **Twilio SMS**

**Características**:

- Cobertura global
- Entrega rápida
- Webhooks de estado

**Configuración**:

```typescript
{
  provider: "twilio-sms",
  config: {
    accountSid: "ACxxx",
    authToken: "xxx",
    fromNumber: "+573001234567"
  }
}
```

**Uso**:

```typescript
await notificationService.sendSMS({
  tenant: "UFPS",
  to: "+573001234567",
  message: "Tu código de verificación es: 123456",
});
```

---

### WhatsApp

#### 1. **Twilio WhatsApp**

**Configuración**:

```typescript
{
  provider: "twilio-whatsapp",
  config: {
    accountSid: "ACxxx",
    authToken: "xxx",
    fromNumber: "whatsapp:+14155238886" // Twilio Sandbox
  }
}
```

#### 2. **WhatsApp Business API**

**Características**:

- Templates pre-aprobados
- Mensajes interactivos
- API oficial de Meta

**Configuración**:

```typescript
{
  provider: "whatsapp-business",
  config: {
    phoneNumberId: "xxx",
    accessToken: "EAA...",
    businessAccountId: "xxx"
  }
}
```

---

### Push Notifications

#### 1. **Firebase FCM**

**Características**:

- Gratuito
- Alta confiabilidad
- Android + iOS

**Configuración**:

```typescript
{
  provider: "firebase",
  config: {
    projectId: "bookly-ufps",
    privateKey: "-----BEGIN PRIVATE KEY-----\n...",
    clientEmail: "firebase-adminsdk@bookly-ufps.iam.gserviceaccount.com"
  }
}
```

**Uso**:

```typescript
await notificationService.sendPush({
  tenant: "UFPS",
  deviceTokens: ["fcm_token_xxx"],
  title: "Reserva Aprobada",
  body: "Tu reserva para el Auditorio Central ha sido aprobada",
  data: { reservationId: "123", action: "view_reservation" },
});
```

#### 2. **OneSignal**

**Características**:

- Dashboard completo
- Segmentación avanzada
- A/B testing

**Configuración**:

```typescript
{
  provider: "onesignal",
  config: {
    appId: "xxx",
    restApiKey: "xxx"
  }
}
```

#### 3. **Expo Push**

**Características**:

- Específico para Expo/React Native
- Fácil integración
- Sin configuración nativa

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

### In-App

#### 1. **MongoDB + WebSocket**

**Características**:

- Notificaciones en tiempo real
- Persistencia en BD
- Sin dependencias externas

**Configuración**:

```typescript
{
  provider: "in-app",
  config: {
    collection: "notifications",
    websocketNamespace: "/notifications"
  }
}
```

**Uso**:

```typescript
await notificationService.sendInApp({
  tenant: "UFPS",
  userId: "user-123",
  title: "Nueva Solicitud",
  body: "Tienes una nueva solicitud de aprobación",
  priority: NotificationPriority.HIGH,
  action: {
    type: "navigate",
    route: "/approvals/pending",
  },
});
```

---

## ⚙️ Configuración

### Configuración por Tenant

```typescript
// POST /api/notification-config
{
  tenant: "UFPS",
  channel: "EMAIL",
  provider: "sendgrid",
  config: {
    apiKey: "SG.xxx",
    fromEmail: "noreply@ufps.edu.co",
    fromName: "Bookly UFPS"
  },
  fallback: "aws-ses", // Proveedor alternativo
  isActive: true,
  priority: 1 // Mayor prioridad = se usa primero
}
```

### Configuración por Usuario

```typescript
// POST /api/notification-config/user
{
  tenant: "UFPS",
  userId: "user-123",
  channel: "SMS",
  provider: "twilio-sms",
  config: {
    phoneNumber: "+573001234567"
  },
  preferences: {
    approvalRequests: true,
    reminders: false,
    marketing: false
  }
}
```

### Obtener Configuración Activa

```typescript
// GET /api/notification-config/active?tenant=UFPS&channel=EMAIL
{
  provider: "sendgrid",
  config: { ... },
  fallback: "aws-ses"
}
```

---

## 📝 Uso

### API REST

#### Enviar Notificación

```typescript
POST /api/notifications/send
{
  tenant: "UFPS",
  channel: "EMAIL",
  to: "user@example.com",
  subject: "Reserva Aprobada",
  body: "Tu reserva ha sido aprobada",
  metadata: {
    reservationId: "123",
    approvalId: "456"
  }
}
```

#### Enviar a Múltiples Destinatarios

```typescript
POST /api/notifications/send-batch
{
  tenant: "UFPS",
  channel: "PUSH",
  recipients: [
    { deviceToken: "token1", userId: "user1" },
    { deviceToken: "token2", userId: "user2" }
  ],
  title: "Mantenimiento Programado",
  body: "El sistema estará en mantenimiento el sábado 10/11"
}
```

### Programático

```typescript
// Inyectar NotificationService
constructor(private readonly notificationService: NotificationService) {}

// Enviar notificación
async sendApprovalNotification(approval: ApprovalRequest) {
  await this.notificationService.send({
    tenant: approval.tenant,
    channel: NotificationChannel.EMAIL,
    to: approval.requester.email,
    subject: "Solicitud de Aprobación",
    body: `Tu solicitud ${approval.id} está pendiente de aprobación`,
    priority: NotificationPriority.HIGH,
    metadata: {
      approvalId: approval.id,
      reservationId: approval.reservationId
    }
  });
}
```

---

## 🔔 Webhooks

### SendGrid Webhook

**Endpoint**: `POST /api/webhooks/sendgrid`

**Headers**:

```
X-Twilio-Email-Event-Webhook-Signature: xxx
```

**Payload**:

```json
[
  {
    "email": "user@example.com",
    "event": "delivered",
    "sg_message_id": "xxx",
    "timestamp": 1699999999
  }
]
```

**Eventos Soportados**:

- `processed`
- `delivered`
- `open`
- `click`
- `bounce`
- `dropped`

### Twilio Webhook

**Endpoint**: `POST /api/webhooks/twilio`

**Payload**:

```json
{
  "MessageSid": "SMxxx",
  "MessageStatus": "delivered",
  "To": "+573001234567",
  "From": "+14155238886"
}
```

**Estados**:

- `queued`
- `sent`
- `delivered`
- `undelivered`
- `failed`

---

## 📊 Métricas

### Métricas Globales

```typescript
GET /api/notification-metrics

{
  total: 1250,
  byProvider: {
    "sendgrid": 800,
    "twilio-sms": 350,
    "firebase": 100
  },
  byChannel: {
    "EMAIL": 800,
    "SMS": 350,
    "PUSH": 100
  },
  byStatus: {
    "sent": 1200,
    "failed": 50
  }
}
```

### Métricas por Proveedor

```typescript
GET /api/notification-metrics/provider/sendgrid

{
  provider: "sendgrid",
  sent: 800,
  delivered: 750,
  opened: 400,
  clicked: 120,
  bounced: 30,
  avgLatency: 250 // ms
}
```

### Métricas por Canal

```typescript
GET /api/notification-metrics/channel/EMAIL

{
  channel: "EMAIL",
  byProvider: {
    "sendgrid": 800,
    "aws-ses": 200
  },
  totalSent: 1000,
  deliveryRate: 0.95
}
```

### Eventos Recientes

```typescript
GET /api/notification-metrics/events/recent?limit=10

[
  {
    provider: "sendgrid",
    channel: "EMAIL",
    status: "delivered",
    recipient: "user@example.com",
    timestamp: "2024-11-06T19:30:00Z",
    latency: 250
  }
]
```

---

## 🔧 Desarrollo

### Agregar Nuevo Proveedor

1. **Crear Adapter**:

```typescript
// infrastructure/adapters/my-provider.adapter.ts
export class MyProviderAdapter implements INotificationAdapter {
  constructor(private readonly config: any) {}

  async send(notification: Notification): Promise<NotificationResult> {
    // Implementar lógica de envío
    return {
      success: true,
      messageId: "xxx",
      timestamp: new Date(),
    };
  }

  async validateConfig(config: any): Promise<boolean> {
    // Validar configuración
    return true;
  }
}
```

2. **Registrar en NotificationModule**:

```typescript
providers: [
  {
    provide: "MY_PROVIDER_ADAPTER",
    useFactory: (config) => new MyProviderAdapter(config),
    inject: [ConfigService],
  },
];
```

3. **Agregar a Enum**:

```typescript
export enum NotificationProvider {
  SENDGRID = "sendgrid",
  MY_PROVIDER = "my-provider",
}
```

---

## 📚 Recursos

- [SendGrid API Docs](https://docs.sendgrid.com/api-reference)
- [Twilio SMS Docs](https://www.twilio.com/docs/sms)
- [Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging)
- [OneSignal API Docs](https://documentation.onesignal.com/reference)
- [Expo Push Docs](https://docs.expo.dev/push-notifications/overview/)

---

**Última actualización**: Noviembre 6, 2025
