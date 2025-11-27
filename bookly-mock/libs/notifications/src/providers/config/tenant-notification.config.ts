/**
 * Tenant Notification Configuration
 * Configuración de notificaciones por tenant
 */

import {
  EmailProviderType,
  PushProviderType,
  SmsProviderType,
  WhatsAppProviderType,
} from "../../enums/notification.enum";

export interface EmailProviderConfig {
  provider: EmailProviderType;
  from: string;
  config: Record<string, any>;
}

export interface SmsProviderConfig {
  provider: SmsProviderType;
  from: string;
  config: Record<string, any>;
}

export interface WhatsAppProviderConfig {
  provider: WhatsAppProviderType;
  from: string;
  config: Record<string, any>;
}

export interface PushProviderConfig {
  provider: PushProviderType;
  config: Record<string, any>;
}

export interface TenantNotificationConfig {
  tenantId: string;
  email?: EmailProviderConfig;
  sms?: SmsProviderConfig;
  whatsapp?: WhatsAppProviderConfig;
  push?: PushProviderConfig;
}

/**
 * Default Notification Configuration
 */
export const DEFAULT_NOTIFICATION_CONFIG: TenantNotificationConfig = {
  tenantId: "default",
  email: {
    provider: EmailProviderType.NODEMAILER,
    from: "no-reply@bookly.com",
    config: {
      host: process.env.SMTP_HOST || "smtp.mailtrap.io",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    },
  },
};
