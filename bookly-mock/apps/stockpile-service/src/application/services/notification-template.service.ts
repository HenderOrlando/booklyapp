import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import * as Handlebars from "handlebars";

const logger = createLogger("NotificationTemplateService");

/**
 * Tipos de plantillas de notificación
 */
export enum NotificationTemplateType {
  APPROVAL_APPROVED = "approval_approved",
  APPROVAL_REJECTED = "approval_rejected",
  APPROVAL_PENDING = "approval_pending",
  RESERVATION_CONFIRMED = "reservation_confirmed",
  RESERVATION_CANCELLED = "reservation_cancelled",
  RESERVATION_REMINDER = "reservation_reminder",
  CHECK_IN_REMINDER = "check_in_reminder",
  CHECK_OUT_REMINDER = "check_out_reminder",
  DOCUMENT_READY = "document_ready",
}

/**
 * Canales de notificación
 */
export enum TemplateChannel {
  EMAIL = "email",
  SMS = "sms",
  WHATSAPP = "whatsapp",
  PUSH = "push",
}

/**
 * Plantilla compilada
 */
export interface CompiledTemplate {
  subject?: string;
  body: string;
  channel: TemplateChannel;
}

/**
 * Datos para renderizar plantilla
 */
export interface TemplateData {
  userName: string;
  userEmail?: string;
  resourceName: string;
  resourceLocation?: string;
  reservationDate?: Date;
  reservationStartTime?: string;
  reservationEndTime?: string;
  approvalRequestId?: string;
  status?: string;
  comment?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  documentUrl?: string;
  qrCode?: string;
  institutionName?: string;
  [key: string]: any;
}

/**
 * Notification Template Service
 * Servicio para gestión de plantillas de notificación multi-canal
 */
@Injectable()
export class NotificationTemplateService {
  private templates: Map<
    string,
    Map<TemplateChannel, HandlebarsTemplateDelegate>
  >;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * Inicializar plantillas predefinidas
   */
  private initializeTemplates(): void {
    // Registrar helpers de Handlebars
    this.registerHelpers();

    // Plantillas de Aprobación Aprobada
    this.registerTemplate(
      NotificationTemplateType.APPROVAL_APPROVED,
      TemplateChannel.EMAIL,
      this.getApprovalApprovedEmailTemplate()
    );
    this.registerTemplate(
      NotificationTemplateType.APPROVAL_APPROVED,
      TemplateChannel.WHATSAPP,
      this.getApprovalApprovedWhatsAppTemplate()
    );
    this.registerTemplate(
      NotificationTemplateType.APPROVAL_APPROVED,
      TemplateChannel.SMS,
      this.getApprovalApprovedSMSTemplate()
    );

    // Plantillas de Aprobación Rechazada
    this.registerTemplate(
      NotificationTemplateType.APPROVAL_REJECTED,
      TemplateChannel.EMAIL,
      this.getApprovalRejectedEmailTemplate()
    );
    this.registerTemplate(
      NotificationTemplateType.APPROVAL_REJECTED,
      TemplateChannel.WHATSAPP,
      this.getApprovalRejectedWhatsAppTemplate()
    );
    this.registerTemplate(
      NotificationTemplateType.APPROVAL_REJECTED,
      TemplateChannel.SMS,
      this.getApprovalRejectedSMSTemplate()
    );

    // Plantillas de Confirmación de Reserva
    this.registerTemplate(
      NotificationTemplateType.RESERVATION_CONFIRMED,
      TemplateChannel.EMAIL,
      this.getReservationConfirmedEmailTemplate()
    );
    this.registerTemplate(
      NotificationTemplateType.RESERVATION_CONFIRMED,
      TemplateChannel.WHATSAPP,
      this.getReservationConfirmedWhatsAppTemplate()
    );

    // Plantillas de Recordatorio
    this.registerTemplate(
      NotificationTemplateType.RESERVATION_REMINDER,
      TemplateChannel.EMAIL,
      this.getReservationReminderEmailTemplate()
    );
    this.registerTemplate(
      NotificationTemplateType.RESERVATION_REMINDER,
      TemplateChannel.WHATSAPP,
      this.getReservationReminderWhatsAppTemplate()
    );
    this.registerTemplate(
      NotificationTemplateType.RESERVATION_REMINDER,
      TemplateChannel.SMS,
      this.getReservationReminderSMSTemplate()
    );

    // Plantilla de Documento Listo
    this.registerTemplate(
      NotificationTemplateType.DOCUMENT_READY,
      TemplateChannel.EMAIL,
      this.getDocumentReadyEmailTemplate()
    );

    logger.info("Notification templates initialized successfully");
  }

  /**
   * Registrar helpers de Handlebars
   */
  private registerHelpers(): void {
    Handlebars.registerHelper("formatDate", (date: Date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    Handlebars.registerHelper("formatTime", (time: string) => {
      if (!time) return "";
      return time;
    });

    Handlebars.registerHelper("uppercase", (str: string) => {
      return str ? str.toUpperCase() : "";
    });

    Handlebars.registerHelper("eq", (a: any, b: any) => {
      return a === b;
    });
  }

  /**
   * Registrar plantilla
   */
  private registerTemplate(
    type: NotificationTemplateType,
    channel: TemplateChannel,
    template: string
  ): void {
    if (!this.templates.has(type)) {
      this.templates.set(type, new Map());
    }

    const channelTemplates = this.templates.get(type)!;
    channelTemplates.set(channel, Handlebars.compile(template));
  }

  /**
   * Renderizar plantilla
   */
  async render(
    type: NotificationTemplateType,
    channel: TemplateChannel,
    data: TemplateData
  ): Promise<CompiledTemplate> {
    const channelTemplates = this.templates.get(type);

    if (!channelTemplates) {
      throw new Error(`Template type not found: ${type}`);
    }

    const template = channelTemplates.get(channel);

    if (!template) {
      throw new Error(`Template not found for channel: ${channel}`);
    }

    // Agregar valores por defecto
    const enrichedData = {
      ...data,
      institutionName:
        data.institutionName || "Universidad Francisco de Paula Santander",
      currentYear: new Date().getFullYear(),
    };

    const rendered = template(enrichedData);

    // Extraer subject si es email
    let subject: string | undefined;
    let body = rendered;

    if (channel === TemplateChannel.EMAIL) {
      const subjectMatch = rendered.match(/SUBJECT:(.*?)\n/);
      if (subjectMatch) {
        subject = subjectMatch[1].trim();
        body = rendered.replace(/SUBJECT:.*?\n/, "").trim();
      }
    }

    logger.info(`Template rendered: ${type} - ${channel}`);

    return {
      subject,
      body,
      channel,
    };
  }

  // ==================== PLANTILLAS EMAIL ====================

  private getApprovalApprovedEmailTemplate(): string {
    return `SUBJECT:✅ Solicitud Aprobada - {{resourceName}}

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .info-box { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Solicitud Aprobada</h1>
    </div>
    <div class="content">
      <p>Hola <strong>{{userName}}</strong>,</p>
      
      <p>¡Excelentes noticias! Tu solicitud de reserva ha sido <strong>aprobada</strong>.</p>
      
      <div class="info-box">
        <h3>Detalles de la Reserva:</h3>
        <p><strong>Recurso:</strong> {{resourceName}}</p>
        {{#if resourceLocation}}
        <p><strong>Ubicación:</strong> {{resourceLocation}}</p>
        {{/if}}
        {{#if reservationDate}}
        <p><strong>Fecha:</strong> {{formatDate reservationDate}}</p>
        {{/if}}
        {{#if reservationStartTime}}
        <p><strong>Hora:</strong> {{reservationStartTime}} - {{reservationEndTime}}</p>
        {{/if}}
        {{#if approvedBy}}
        <p><strong>Aprobado por:</strong> {{approvedBy}}</p>
        {{/if}}
        {{#if comment}}
        <p><strong>Comentarios:</strong> {{comment}}</p>
        {{/if}}
      </div>

      {{#if documentUrl}}
      <p style="text-align: center;">
        <a href="{{documentUrl}}" class="button">📄 Descargar Carta de Aprobación</a>
      </p>
      {{/if}}

      <p><strong>Próximos pasos:</strong></p>
      <ul>
        <li>Descarga tu carta de aprobación (si está disponible)</li>
        <li>Presenta el documento en vigilancia el día de tu reserva</li>
        <li>Llega 10 minutos antes de tu hora programada</li>
      </ul>

      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      
      <p>Saludos,<br><strong>{{institutionName}}</strong></p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{institutionName}}. Todos los derechos reservados.</p>
      <p>Este es un correo automático, por favor no responder.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getApprovalRejectedEmailTemplate(): string {
    return `SUBJECT:❌ Solicitud Rechazada - {{resourceName}}

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .info-box { background: white; padding: 15px; margin: 20px 0; border-left: 4px solid #dc3545; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Solicitud Rechazada</h1>
    </div>
    <div class="content">
      <p>Hola <strong>{{userName}}</strong>,</p>
      
      <p>Lamentamos informarte que tu solicitud de reserva ha sido <strong>rechazada</strong>.</p>
      
      <div class="info-box">
        <h3>Detalles:</h3>
        <p><strong>Recurso:</strong> {{resourceName}}</p>
        {{#if reservationDate}}
        <p><strong>Fecha solicitada:</strong> {{formatDate reservationDate}}</p>
        {{/if}}
        {{#if rejectedBy}}
        <p><strong>Rechazado por:</strong> {{rejectedBy}}</p>
        {{/if}}
        {{#if rejectionReason}}
        <p><strong>Motivo:</strong> {{rejectionReason}}</p>
        {{/if}}
      </div>

      <p><strong>¿Qué puedes hacer?</strong></p>
      <ul>
        <li>Revisa el motivo del rechazo</li>
        <li>Solicita otra fecha u horario</li>
        <li>Contacta con el administrador para más información</li>
      </ul>

      <p>Saludos,<br><strong>{{institutionName}}</strong></p>
    </div>
    <div class="footer">
      <p>© {{currentYear}} {{institutionName}}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
  }

  private getReservationConfirmedEmailTemplate(): string {
    return `SUBJECT:✅ Reserva Confirmada - {{resourceName}}

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #007bff; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .qr-box { text-align: center; padding: 20px; background: white; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Reserva Confirmada</h1>
    </div>
    <div class="content">
      <p>Hola <strong>{{userName}}</strong>,</p>
      <p>Tu reserva ha sido confirmada exitosamente.</p>
      
      <p><strong>Recurso:</strong> {{resourceName}}</p>
      <p><strong>Fecha:</strong> {{formatDate reservationDate}}</p>
      <p><strong>Hora:</strong> {{reservationStartTime}} - {{reservationEndTime}}</p>

      {{#if qrCode}}
      <div class="qr-box">
        <h3>Código QR para Check-in</h3>
        <img src="{{qrCode}}" alt="QR Code" style="max-width: 200px;" />
        <p>Presenta este código en vigilancia</p>
      </div>
      {{/if}}

      <p>Saludos,<br><strong>{{institutionName}}</strong></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getReservationReminderEmailTemplate(): string {
    return `SUBJECT:⏰ Recordatorio de Reserva - {{resourceName}}

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Recordatorio de Reserva</h1>
    </div>
    <div class="content">
      <p>Hola <strong>{{userName}}</strong>,</p>
      <p>Te recordamos que tienes una reserva próxima:</p>
      
      <p><strong>Recurso:</strong> {{resourceName}}</p>
      <p><strong>Fecha:</strong> {{formatDate reservationDate}}</p>
      <p><strong>Hora:</strong> {{reservationStartTime}} - {{reservationEndTime}}</p>
      <p><strong>Ubicación:</strong> {{resourceLocation}}</p>

      <p>No olvides llegar 10 minutos antes.</p>
      
      <p>Saludos,<br><strong>{{institutionName}}</strong></p>
    </div>
  </div>
</body>
</html>`;
  }

  private getDocumentReadyEmailTemplate(): string {
    return `SUBJECT:📄 Documento Disponible - {{resourceName}}

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .button { display: inline-block; padding: 12px 30px; background: #17a2b8; color: white; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 Documento Disponible</h1>
    </div>
    <div class="content">
      <p>Hola <strong>{{userName}}</strong>,</p>
      <p>Tu documento está listo para descargar.</p>
      
      <p><strong>Recurso:</strong> {{resourceName}}</p>
      {{#if status}}
      <p><strong>Estado:</strong> {{status}}</p>
      {{/if}}

      {{#if documentUrl}}
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{documentUrl}}" class="button">📥 Descargar Documento</a>
      </p>
      {{/if}}

      <p>El documento estará disponible por 48 horas.</p>
      
      <p>Saludos,<br><strong>{{institutionName}}</strong></p>
    </div>
  </div>
</body>
</html>`;
  }

  // ==================== PLANTILLAS WHATSAPP ====================

  private getApprovalApprovedWhatsAppTemplate(): string {
    return `✅ *Solicitud Aprobada*

Hola *{{userName}}*,

¡Tu solicitud ha sido aprobada! 🎉

📋 *Detalles:*
• Recurso: {{resourceName}}
{{#if reservationDate}}• Fecha: {{formatDate reservationDate}}{{/if}}
{{#if reservationStartTime}}• Hora: {{reservationStartTime}} - {{reservationEndTime}}{{/if}}
{{#if approvedBy}}• Aprobado por: {{approvedBy}}{{/if}}

{{#if documentUrl}}
📄 Descarga tu carta: {{documentUrl}}
{{/if}}

Recuerda llegar 10 minutos antes.

_{{institutionName}}_`;
  }

  private getApprovalRejectedWhatsAppTemplate(): string {
    return `❌ *Solicitud Rechazada*

Hola *{{userName}}*,

Lamentamos informarte que tu solicitud fue rechazada.

📋 *Detalles:*
• Recurso: {{resourceName}}
{{#if rejectionReason}}• Motivo: {{rejectionReason}}{{/if}}

Puedes solicitar otra fecha u horario.

_{{institutionName}}_`;
  }

  private getReservationConfirmedWhatsAppTemplate(): string {
    return `✅ *Reserva Confirmada*

Hola *{{userName}}*,

Tu reserva está confirmada:

• Recurso: {{resourceName}}
• Fecha: {{formatDate reservationDate}}
• Hora: {{reservationStartTime}} - {{reservationEndTime}}
• Ubicación: {{resourceLocation}}

{{#if qrCode}}
Presenta tu código QR en vigilancia.
{{/if}}

_{{institutionName}}_`;
  }

  private getReservationReminderWhatsAppTemplate(): string {
    return `⏰ *Recordatorio de Reserva*

Hola *{{userName}}*,

Tienes una reserva próxima:

• Recurso: {{resourceName}}
• Fecha: {{formatDate reservationDate}}
• Hora: {{reservationStartTime}}
• Ubicación: {{resourceLocation}}

No olvides llegar 10 minutos antes.

_{{institutionName}}_`;
  }

  // ==================== PLANTILLAS SMS ====================

  private getApprovalApprovedSMSTemplate(): string {
    return `✅ Solicitud APROBADA - {{resourceName}}. Fecha: {{formatDate reservationDate}} {{reservationStartTime}}. {{institutionName}}`;
  }

  private getApprovalRejectedSMSTemplate(): string {
    return `❌ Solicitud RECHAZADA - {{resourceName}}. {{#if rejectionReason}}Motivo: {{rejectionReason}}.{{/if}} {{institutionName}}`;
  }

  private getReservationReminderSMSTemplate(): string {
    return `⏰ RECORDATORIO: Reserva {{resourceName}} - {{formatDate reservationDate}} {{reservationStartTime}}. Ubicación: {{resourceLocation}}. {{institutionName}}`;
  }
}
