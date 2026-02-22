import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const logger = createLogger("WhatsAppProvider");

/**
 * Estado de configuración de WhatsApp
 */
export interface WhatsAppConfig {
  enabled: boolean;
  apiUrl: string;
  apiToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

/**
 * Resultado de envío de mensaje
 */
export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: "whatsapp";
  timestamp: Date;
}

/**
 * WhatsApp Provider (RF-27 — Minimal Stub)
 *
 * Stub de integración mínima con WhatsApp Business API.
 * Implementa la interfaz de envío pero NO conecta con la API real.
 * Los mensajes se loguean localmente para desarrollo.
 *
 * Para habilitar la integración real:
 * 1. Configurar WHATSAPP_API_TOKEN en .env
 * 2. Configurar WHATSAPP_PHONE_NUMBER_ID en .env
 * 3. Configurar WHATSAPP_BUSINESS_ACCOUNT_ID en .env
 * 4. Implementar los métodos reales en este archivo
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */
@Injectable()
export class WhatsAppProvider {
  private readonly config: WhatsAppConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      enabled:
        this.configService.get<string>("WHATSAPP_ENABLED", "false") === "true",
      apiUrl: this.configService.get<string>(
        "WHATSAPP_API_URL",
        "https://graph.facebook.com/v18.0",
      ),
      apiToken: this.configService.get<string>("WHATSAPP_API_TOKEN", ""),
      phoneNumberId: this.configService.get<string>(
        "WHATSAPP_PHONE_NUMBER_ID",
        "",
      ),
      businessAccountId: this.configService.get<string>(
        "WHATSAPP_BUSINESS_ACCOUNT_ID",
        "",
      ),
      webhookVerifyToken: this.configService.get<string>(
        "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
        "bookly-whatsapp-verify",
      ),
    };

    logger.info("WhatsAppProvider initialized", {
      enabled: this.config.enabled,
      configured: this.isConfigured(),
    });
  }

  /**
   * Verificar si el provider está configurado con credenciales reales
   */
  isConfigured(): boolean {
    return !!(
      this.config.apiToken &&
      this.config.phoneNumberId &&
      this.config.businessAccountId
    );
  }

  /**
   * Verificar si el provider está habilitado
   */
  isEnabled(): boolean {
    return this.config.enabled && this.isConfigured();
  }

  /**
   * Enviar mensaje de texto vía WhatsApp
   * STUB: En desarrollo, solo loguea el mensaje
   */
  async sendTextMessage(
    to: string,
    message: string,
  ): Promise<WhatsAppSendResult> {
    if (!this.isEnabled()) {
      logger.info("[STUB] WhatsApp message (not sent - disabled)", {
        to,
        messagePreview: message.substring(0, 100),
      });

      return {
        success: true,
        messageId: `stub-${Date.now()}`,
        provider: "whatsapp",
        timestamp: new Date(),
      };
    }

    // TODO: Implementar envío real cuando se integre WhatsApp Business API
    // const url = `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`;
    // const response = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${this.config.apiToken}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     messaging_product: "whatsapp",
    //     to,
    //     type: "text",
    //     text: { body: message },
    //   }),
    // });

    logger.info("[STUB] WhatsApp message logged", {
      to,
      messagePreview: message.substring(0, 100),
    });

    return {
      success: true,
      messageId: `stub-${Date.now()}`,
      provider: "whatsapp",
      timestamp: new Date(),
    };
  }

  /**
   * Enviar mensaje con plantilla (template message)
   * STUB: En desarrollo, solo loguea el mensaje
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: Array<{
      type: "body" | "header" | "button";
      parameters: Array<{ type: string; text?: string }>;
    }>,
  ): Promise<WhatsAppSendResult> {
    if (!this.isEnabled()) {
      logger.info("[STUB] WhatsApp template message (not sent - disabled)", {
        to,
        templateName,
        languageCode,
      });

      return {
        success: true,
        messageId: `stub-template-${Date.now()}`,
        provider: "whatsapp",
        timestamp: new Date(),
      };
    }

    // TODO: Implementar envío real de template messages
    logger.info("[STUB] WhatsApp template message logged", {
      to,
      templateName,
      languageCode,
      componentsCount: components?.length || 0,
    });

    return {
      success: true,
      messageId: `stub-template-${Date.now()}`,
      provider: "whatsapp",
      timestamp: new Date(),
    };
  }

  /**
   * Enviar notificación de reserva
   */
  async sendReservationNotification(
    phoneNumber: string,
    data: {
      type: "confirmation" | "cancellation" | "modification" | "reminder";
      reservationId: string;
      resourceName: string;
      date: string;
      time: string;
      userName?: string;
    },
  ): Promise<WhatsAppSendResult> {
    const messages: Record<string, string> = {
      confirmation: `✅ *Reserva Confirmada*\n\nHola ${data.userName || ""},\nTu reserva de *${data.resourceName}* ha sido confirmada.\n📅 ${data.date}\n🕐 ${data.time}\n\nID: ${data.reservationId}`,
      cancellation: `❌ *Reserva Cancelada*\n\nHola ${data.userName || ""},\nTu reserva de *${data.resourceName}* ha sido cancelada.\n📅 ${data.date}\n\nID: ${data.reservationId}`,
      modification: `✏️ *Reserva Modificada*\n\nHola ${data.userName || ""},\nTu reserva de *${data.resourceName}* ha sido modificada.\n📅 ${data.date}\n🕐 ${data.time}\n\nID: ${data.reservationId}`,
      reminder: `⏰ *Recordatorio de Reserva*\n\nHola ${data.userName || ""},\nRecuerda tu reserva de *${data.resourceName}*.\n📅 ${data.date}\n🕐 ${data.time}\n\nID: ${data.reservationId}`,
    };

    const message = messages[data.type] || messages.confirmation;

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Enviar notificación de aprobación/rechazo
   */
  async sendApprovalNotification(
    phoneNumber: string,
    data: {
      type: "approved" | "rejected";
      requestId: string;
      resourceName: string;
      approverName: string;
      reason?: string;
    },
  ): Promise<WhatsAppSendResult> {
    const message =
      data.type === "approved"
        ? `✅ *Solicitud Aprobada*\n\nTu solicitud para *${data.resourceName}* ha sido aprobada por ${data.approverName}.\n\nID: ${data.requestId}`
        : `❌ *Solicitud Rechazada*\n\nTu solicitud para *${data.resourceName}* ha sido rechazada por ${data.approverName}.${data.reason ? `\n\nMotivo: ${data.reason}` : ""}\n\nID: ${data.requestId}`;

    return this.sendTextMessage(phoneNumber, message);
  }

  /**
   * Verificar webhook (para configuración futura de WhatsApp Business API)
   */
  verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
  ): string | null {
    if (
      mode === "subscribe" &&
      token === this.config.webhookVerifyToken
    ) {
      logger.info("WhatsApp webhook verified");
      return challenge;
    }

    logger.warn("WhatsApp webhook verification failed", { mode });
    return null;
  }

  /**
   * Obtener estado de la configuración
   */
  getStatus(): {
    enabled: boolean;
    configured: boolean;
    provider: string;
    apiUrl: string;
  } {
    return {
      enabled: this.config.enabled,
      configured: this.isConfigured(),
      provider: "whatsapp-business-api",
      apiUrl: this.config.apiUrl,
    };
  }
}
