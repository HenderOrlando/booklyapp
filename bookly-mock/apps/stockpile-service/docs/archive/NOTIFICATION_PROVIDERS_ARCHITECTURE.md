# 📧 Arquitectura de Proveedores de Notificación - Agnóstica y Multi-Tenant

**Fecha**: 2025-01-06  
**Estado**: ✅ **IMPLEMENTADO**

---

## 🎯 Objetivo

Crear un sistema de notificaciones completamente **agnóstico al proveedor**, permitiendo que cada tenant/usuario configure su propio proveedor de mensajería (Email, SMS, WhatsApp) sin modificar código.

---

## 🏗️ Arquitectura

### Patrón Adapter

El sistema utiliza el **patrón Adapter** para abstraer las diferencias entre proveedores:

```
┌─────────────────────────────────────────────────────────┐
│              NotificationProviderService                │
│                   (Orquestador)                         │
└───────────────────┬─────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌────────┐    ┌─────────┐    ┌──────────────┐
│ Email  │    │   SMS   │    │   WhatsApp   │
│Provider│    │Provider │    │   Provider   │
└────┬───┘    └────┬────┘    └──────┬───────┘
     │             │                │
     │             │                │
     ▼             ▼                ▼
┌────────────────────────────────────────────┐
│         TenantNotificationConfig           │
│         (Configuración por Tenant)         │
└───────────────┬────────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐ ┌───────┐  ┌──────────┐
│Nodema  │ │Twilio │  │Meta Cloud│
│iler    │ │       │  │   API    │
│Adapter │ │Adapter│  │  Adapter │
└────────┘ └───────┘  └──────────┘
```

---

## 📂 Estructura de Archivos

```
notification-providers/
├── adapters/                        # Adapters por tipo de canal
│   ├── email/
│   │   ├── base-email.adapter.ts   # Interface base
│   │   ├── nodemailer.adapter.ts   # ✅ Implementado
│   │   ├── sendgrid.adapter.ts     # ✅ Implementado
│   │   ├── aws-ses.adapter.ts      # 🔜 TODO
│   │   ├── gmail.adapter.ts        # 🔜 TODO
│   │   └── outlook.adapter.ts      # 🔜 TODO
│   │
│   ├── sms/
│   │   ├── base-sms.adapter.ts     # Interface base
│   │   ├── twilio-sms.adapter.ts   # ✅ Implementado
│   │   ├── aws-sns.adapter.ts      # ✅ Implementado
│   │   ├── vonage.adapter.ts       # 🔜 TODO
│   │   └── messagebird.adapter.ts  # 🔜 TODO
│   │
│   └── whatsapp/
│       ├── base-whatsapp.adapter.ts      # Interface base
│       ├── twilio-whatsapp.adapter.ts    # ✅ Implementado
│       ├── meta-cloud-api.adapter.ts     # ✅ Implementado
│       ├── whatsapp-business-api.adapter.ts  # 🔜 TODO
│       └── vonage-whatsapp.adapter.ts    # 🔜 TODO
│
├── config/
│   └── tenant-notification.config.ts  # Configuraciones por tenant
│
├── factories/
│   └── adapter.factory.ts             # Factory para crear adapters
│
├── email-provider.service.ts          # ✅ Refactorizado
├── sms-provider.service.ts            # 🔜 Pendiente refactor
├── whatsapp-provider.service.ts       # 🔜 Pendiente refactor
├── notification-provider.service.ts   # Orquestador principal
├── notification-provider.interface.ts # Interfaces comunes
└── tenant-notification-config.service.ts  # Gestión de configs
```

---

## 🔧 Componentes Principales

### 1. **Base Adapters** (Interfaces)

Definen el contrato que todos los proveedores deben cumplir:

```typescript
// IEmailAdapter
export interface IEmailAdapter {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  validateRecipient(recipient: string): boolean;
  isAvailable(): Promise<boolean>;
  getProviderInfo(): {
    type: EmailProviderType;
    name: string;
    version?: string;
  };
}

// ISmsAdapter
export interface ISmsAdapter {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  validateRecipient(recipient: string): boolean;
  isAvailable(): Promise<boolean>;
  getProviderInfo(): { type: SmsProviderType; name: string; version?: string };
}

// IWhatsAppAdapter
export interface IWhatsAppAdapter {
  send(payload: NotificationPayload): Promise<NotificationResult>;
  validateRecipient(recipient: string): boolean;
  isAvailable(): Promise<boolean>;
  getProviderInfo(): {
    type: WhatsAppProviderType;
    name: string;
    version?: string;
  };
}
```

### 2. **Adapter Factory**

Crea instancias de adapters según configuración:

```typescript
@Injectable()
export class AdapterFactory {
  createEmailAdapter(config: EmailProviderConfig): IEmailAdapter {
    switch (config.provider) {
      case EmailProviderType.NODEMAILER:
        return new NodemailerAdapter(config.config);
      case EmailProviderType.SENDGRID:
        return new SendgridAdapter(config.config);
      // ... otros proveedores
    }
  }
}
```

### 3. **Tenant Configuration Service**

Gestiona configuraciones por tenant:

```typescript
@Injectable()
export class TenantNotificationConfigService {
  async getTenantConfig(tenantId: string): Promise<TenantNotificationConfig>;
  async setTenantConfig(
    tenantId: string,
    config: TenantNotificationConfig
  ): Promise<void>;
  async deleteTenantConfig(tenantId: string): Promise<void>;
  async listTenants(): Promise<string[]>;
}
```

### 4. **Provider Services** (Refactorizados)

Usan adapters dinámicamente:

```typescript
@Injectable()
export class EmailProviderService {
  private adapters: Map<string, IEmailAdapter> = new Map();

  constructor(
    private readonly configService: TenantNotificationConfigService,
    private readonly factory: AdapterFactory
  ) {}

  async send(
    payload: NotificationPayload,
    tenantId?: string
  ): Promise<NotificationResult> {
    const adapter = await this.getAdapter(tenantId);
    return await adapter.send(payload);
  }

  private async getAdapter(
    tenantId: string = "default"
  ): Promise<IEmailAdapter> {
    if (this.adapters.has(tenantId)) {
      return this.adapters.get(tenantId)!;
    }

    const config = await this.configService.getTenantConfig(tenantId);
    const adapter = this.factory.createEmailAdapter(config.email);
    this.adapters.set(tenantId, adapter);
    return adapter;
  }
}
```

---

## 🔌 Proveedores Soportados

### Email

| Proveedor      | Estado          | Configuración Requerida              |
| -------------- | --------------- | ------------------------------------ |
| **Nodemailer** | ✅ Implementado | host, port, auth (user, pass)        |
| **SendGrid**   | ✅ Implementado | apiKey                               |
| **AWS SES**    | 🔜 TODO         | region, accessKeyId, secretAccessKey |
| **Gmail**      | 🔜 TODO         | clientId, clientSecret, refreshToken |
| **Outlook**    | 🔜 TODO         | clientId, clientSecret, refreshToken |

### SMS

| Proveedor       | Estado          | Configuración Requerida                    |
| --------------- | --------------- | ------------------------------------------ |
| **Twilio**      | ✅ Implementado | accountSid, authToken, from                |
| **AWS SNS**     | ✅ Implementado | region, accessKeyId, secretAccessKey, from |
| **Vonage**      | 🔜 TODO         | apiKey, apiSecret, from                    |
| **MessageBird** | 🔜 TODO         | apiKey, from                               |

### WhatsApp

| Proveedor                 | Estado          | Configuración Requerida                       |
| ------------------------- | --------------- | --------------------------------------------- |
| **Twilio**                | ✅ Implementado | accountSid, authToken, from                   |
| **Meta Cloud API**        | ✅ Implementado | accessToken, phoneNumberId, businessAccountId |
| **WhatsApp Business API** | 🔜 TODO         | webhookUrl, apiKey                            |
| **Vonage**                | 🔜 TODO         | apiKey, apiSecret, from                       |

---

## 🚀 Uso

### Configuración por Tenant

```typescript
// Configurar proveedor de email para un tenant
const tenantConfig: TenantNotificationConfig = {
  tenantId: "ufps-cucuta",
  email: {
    provider: EmailProviderType.SENDGRID,
    from: "noreply@ufps.edu.co",
    config: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
  },
  sms: {
    provider: SmsProviderType.AWS_SNS,
    from: "+573001234567",
    config: {
      region: "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  whatsapp: {
    provider: WhatsAppProviderType.META_CLOUD_API,
    from: "+573001234567",
    config: {
      accessToken: process.env.META_ACCESS_TOKEN,
      phoneNumberId: process.env.META_PHONE_NUMBER_ID,
      businessAccountId: process.env.META_BUSINESS_ACCOUNT_ID,
    },
  },
};

await tenantConfigService.setTenantConfig("ufps-cucuta", tenantConfig);
```

### Enviar Notificación

```typescript
// Envío simple (usa configuración por defecto)
await emailProvider.send({
  to: "user@example.com",
  subject: "Bienvenido",
  message: "Gracias por registrarte",
});

// Envío con tenant específico
await emailProvider.send(
  {
    to: "user@ufps.edu.co",
    subject: "Aprobación completada",
    message: "Tu solicitud ha sido aprobada",
  },
  "ufps-cucuta"
);
```

### Cambiar Proveedor Dinámicamente

```typescript
// Cambiar de Nodemailer a SendGrid sin reiniciar
const newConfig = {
  ...currentConfig,
  email: {
    provider: EmailProviderType.SENDGRID,
    from: "noreply@example.com",
    config: { apiKey: "SG.xxxxxxx" },
  },
};

await tenantConfigService.setTenantConfig("ufps-cucuta", newConfig);
emailProvider.clearAdapters(); // Limpiar cache
```

---

## 🔐 Variables de Entorno

```bash
# Email - Nodemailer (default)
EMAIL_FROM=noreply@bookly.ufps.edu.co
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email - SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email - AWS SES
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SES_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# SMS - Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# SMS - AWS SNS
AWS_SNS_REGION=us-east-1
AWS_SNS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SNS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# WhatsApp - Twilio
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# WhatsApp - Meta Cloud API
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
META_PHONE_NUMBER_ID=123456789012345
META_BUSINESS_ACCOUNT_ID=123456789012345
```

---

## ✅ Beneficios

### 1. **Flexibilidad Total**

- Cambiar de proveedor sin modificar código
- Configuración por tenant/usuario
- Soporte multi-proveedor simultáneo

### 2. **Escalabilidad**

- Agregar nuevos proveedores fácilmente
- Cache de adapters por tenant
- Configuración en base de datos (futuro)

### 3. **Mantenibilidad**

- Código desacoplado
- Cada adapter es independiente
- Testing aislado por proveedor

### 4. **Seguridad**

- Credenciales por tenant
- Sin hardcoding de configuraciones
- Rotación de credenciales simple

---

## 🔜 Próximos Pasos

### Corto Plazo

- [ ] Refactorizar `SmsProviderService` y `WhatsAppProviderService`
- [ ] Implementar AWS SES adapter
- [ ] Implementar Gmail adapter
- [ ] Implementar Outlook adapter

### Mediano Plazo

- [ ] Persistir configuraciones en MongoDB
- [ ] API REST para gestión de configuraciones
- [ ] UI para configuración de proveedores
- [ ] Testing de adapters

### Largo Plazo

- [ ] Métricas por proveedor (tasa de éxito, latencia)
- [ ] Rotación automática de credenciales
- [ ] Fallback inteligente entre proveedores
- [ ] Rate limiting por proveedor

---

## 📝 Ejemplos de Implementación

### Agregar Nuevo Proveedor de Email

1. **Crear adapter**:

```typescript
// gmail.adapter.ts
export class GmailAdapter implements IEmailAdapter {
  constructor(private readonly config: Record<string, any>) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // Implementación con googleapis
  }
}
```

2. **Registrar en factory**:

```typescript
// adapter.factory.ts
createEmailAdapter(config: EmailProviderConfig): IEmailAdapter {
  switch (config.provider) {
    case EmailProviderType.GMAIL:
      return new GmailAdapter(config.config);
    // ... otros casos
  }
}
```

3. **Agregar a enum**:

```typescript
// base-email.adapter.ts
export enum EmailProviderType {
  GMAIL = "GMAIL",
  // ... otros
}
```

4. **¡Listo!** El nuevo proveedor está disponible para todos los tenants.

---

**Autor**: Cascade AI  
**Versión**: 1.0.0  
**Última actualización**: 2025-01-06
