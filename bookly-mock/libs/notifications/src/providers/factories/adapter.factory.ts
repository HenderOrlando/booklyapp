import { Injectable } from "@nestjs/common";
import {
  EmailProviderType,
  PushProviderType,
  SmsProviderType,
  WhatsAppProviderType,
} from "../../enums/notification.enum";
import { AwsSesAdapter } from "../adapters/email/aws-ses.adapter";
import { IEmailAdapter } from "../adapters/email/base-email.adapter";
import { GmailAdapter } from "../adapters/email/gmail.adapter";
import { NodemailerAdapter } from "../adapters/email/nodemailer.adapter";
import { OutlookAdapter } from "../adapters/email/outlook.adapter";
import { SendgridAdapter } from "../adapters/email/sendgrid.adapter";
import { ApnsAdapter } from "../adapters/push/apns.adapter";
import { AwsSnsPushAdapter } from "../adapters/push/aws-sns-push.adapter";
import { IPushAdapter } from "../adapters/push/base-push.adapter";
import { ExpoPushAdapter } from "../adapters/push/expo.adapter";
import { FirebasePushAdapter } from "../adapters/push/firebase.adapter";
import { OneSignalAdapter } from "../adapters/push/onesignal.adapter";
import { AwsSnsAdapter } from "../adapters/sms/aws-sns.adapter";
import { ISmsAdapter } from "../adapters/sms/base-sms.adapter";
import { TwilioSmsAdapter } from "../adapters/sms/twilio-sms.adapter";
import { IWhatsAppAdapter } from "../adapters/whatsapp/base-whatsapp.adapter";
import { MetaCloudApiAdapter } from "../adapters/whatsapp/meta-cloud-api.adapter";
import { TwilioWhatsAppAdapter } from "../adapters/whatsapp/twilio-whatsapp.adapter";
import {
  EmailProviderConfig,
  PushProviderConfig,
  SmsProviderConfig,
  WhatsAppProviderConfig,
} from "../config/tenant-notification.config";

/**
 * Adapter Factory
 * Factory para crear instancias de adapters según configuración
 */
@Injectable()
export class AdapterFactory {
  /**
   * Crear adapter de Email según configuración
   */
  createEmailAdapter(config: EmailProviderConfig): IEmailAdapter {
    switch (config.provider) {
      case EmailProviderType.NODEMAILER:
        return new NodemailerAdapter(config.config);

      case EmailProviderType.SENDGRID:
        return new SendgridAdapter(config.config);

      case EmailProviderType.AWS_SES:
        return new AwsSesAdapter(config.config);

      case EmailProviderType.GMAIL:
        return new GmailAdapter(config.config);

      case EmailProviderType.OUTLOOK:
        return new OutlookAdapter(config.config);

      default:
        throw new Error(`Unknown email provider: ${config.provider}`);
    }
  }

  /**
   * Crear adapter de SMS según configuración
   */
  createSmsAdapter(config: SmsProviderConfig): ISmsAdapter {
    switch (config.provider) {
      case SmsProviderType.TWILIO:
        return new TwilioSmsAdapter(config.config);

      case SmsProviderType.AWS_SNS:
        return new AwsSnsAdapter(config.config);

      // TODO: Implementar otros proveedores
      case SmsProviderType.VONAGE:
      case SmsProviderType.MESSAGEBIRD:
        throw new Error(`SMS provider ${config.provider} not implemented yet`);

      default:
        throw new Error(`Unknown SMS provider: ${config.provider}`);
    }
  }

  /**
   * Crear adapter de WhatsApp según configuración
   */
  createWhatsAppAdapter(config: WhatsAppProviderConfig): IWhatsAppAdapter {
    switch (config.provider) {
      case WhatsAppProviderType.TWILIO:
        return new TwilioWhatsAppAdapter(config.config);

      case WhatsAppProviderType.META_CLOUD_API:
        return new MetaCloudApiAdapter(config.config);

      default:
        throw new Error(`Unknown WhatsApp provider: ${config.provider}`);
    }
  }

  /**
   * Crear adapter de Push según configuración
   */
  createPushAdapter(config: PushProviderConfig): IPushAdapter {
    switch (config.provider) {
      case PushProviderType.FIREBASE:
      case PushProviderType.FCM:
        return new FirebasePushAdapter(config.config);

      case PushProviderType.ONESIGNAL:
        return new OneSignalAdapter(config.config);

      case PushProviderType.EXPO:
        return new ExpoPushAdapter(config.config);

      case PushProviderType.APNS:
        return new ApnsAdapter(config.config);

      case PushProviderType.AWS_SNS:
        return new AwsSnsPushAdapter(config.config);

      default:
        throw new Error(`Unknown push provider: ${config.provider}`);
    }
  }
}
