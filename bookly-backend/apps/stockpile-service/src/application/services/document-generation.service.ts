import { createLogger } from "@libs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import * as Handlebars from "handlebars";
import PDFDocument from "pdfkit";
import { QRCodeService } from "./qr-code.service";
import { DigitalSignatureService } from "./digital-signature.service";

const logger = createLogger("DocumentGenerationService");

/**
 * Tipos de documentos disponibles
 */
export enum DocumentType {
  APPROVAL_LETTER = "approval_letter",
  REJECTION_LETTER = "rejection_letter",
  CONFIRMATION = "confirmation",
  CHECK_OUT_RECEIPT = "check_out_receipt",
}

/**
 * Datos para generar documento de aprobación
 */
export interface ApprovalDocumentData {
  approvalRequestId: string;
  userName: string;
  userEmail: string;
  resourceName: string;
  resourceLocation: string;
  reservationDate: Date;
  reservationStartTime: string;
  reservationEndTime: string;
  approvedBy: string;
  approvedAt: Date;
  approvalComments?: string;
  qrCode?: string;
  institutionName?: string;
  institutionLogo?: string;
}

/**
 * Datos para generar documento de rechazo
 */
export interface RejectionDocumentData {
  approvalRequestId: string;
  userName: string;
  userEmail: string;
  resourceName: string;
  reservationDate: Date;
  rejectedBy: string;
  rejectedAt: Date;
  rejectionReason: string;
  alternativeSuggestions?: string[];
  institutionName?: string;
  institutionLogo?: string;
}

/**
 * Datos para generar confirmación de reserva
 */
export interface ConfirmationDocumentData {
  reservationId: string;
  userName: string;
  userEmail: string;
  resourceName: string;
  resourceLocation: string;
  reservationDate: Date;
  reservationStartTime: string;
  reservationEndTime: string;
  qrCode: string;
  instructions?: string[];
  institutionName?: string;
  institutionLogo?: string;
}

/**
 * Resultado de generación de documento
 */
export interface DocumentGenerationResult {
  documentId: string;
  documentType: DocumentType;
  fileName: string;
  buffer: Buffer;
  size: number;
  generatedAt: Date;
  metadata: Record<string, any>;
}

/**
 * Document Generation Service
 * Servicio para generación automática de documentos PDF con plantillas HTML
 */
@Injectable()
export class DocumentGenerationService {
  private templates: Map<DocumentType, HandlebarsTemplateDelegate>;

  constructor(
    private readonly qrCodeService: QRCodeService,
    private readonly digitalSignatureService: DigitalSignatureService
  ) {
    this.templates = new Map();
    this.initializeTemplates();
    
    logger.info("DocumentGenerationService initialized");
  }

  /**
   * Inicializar plantillas Handlebars
   */
  private initializeTemplates(): void {
    // Template de carta de aprobación
    const approvalTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; }
    .title { font-size: 24px; font-weight: bold; color: #2c3e50; }
    .content { margin: 20px 0; line-height: 1.6; }
    .info-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
    .footer { margin-top: 40px; font-size: 12px; color: #7f8c8d; text-align: center; }
    .signature { margin-top: 60px; }
  </style>
</head>
<body>
  <div class="header">
    {{#if institutionLogo}}
    <img src="{{institutionLogo}}" alt="Logo" class="logo">
    {{/if}}
    <h1 class="title">{{institutionName}}</h1>
    <h2>CARTA DE APROBACIÓN DE RESERVA</h2>
  </div>

  <div class="content">
    <p><strong>Fecha:</strong> {{formatDate approvedAt}}</p>
    
    <p>Estimado/a <strong>{{userName}}</strong>,</p>
    
    <p>Nos complace informarle que su solicitud de reserva ha sido <strong>APROBADA</strong>.</p>
    
    <div class="info-box">
      <h3>Detalles de la Reserva</h3>
      <p><strong>Recurso:</strong> {{resourceName}}</p>
      <p><strong>Ubicación:</strong> {{resourceLocation}}</p>
      <p><strong>Fecha:</strong> {{formatDate reservationDate}}</p>
      <p><strong>Horario:</strong> {{reservationStartTime}} - {{reservationEndTime}}</p>
      <p><strong>ID de Solicitud:</strong> {{approvalRequestId}}</p>
    </div>
    
    {{#if approvalComments}}
    <p><strong>Comentarios del Aprobador:</strong></p>
    <p>{{approvalComments}}</p>
    {{/if}}
    
    <p><strong>Instrucciones:</strong></p>
    <ul>
      <li>Presente este documento al personal de vigilancia el día de la reserva</li>
      <li>Llegue 10 minutos antes del horario programado</li>
      <li>Recuerde devolver el recurso en las mismas condiciones</li>
      <li>En caso de cancelación, notifique con al menos 24 horas de anticipación</li>
    </ul>
    
    {{#if qrCode}}
    <div style="text-align: center; margin: 30px 0;">
      <p><strong>Código QR de Verificación:</strong></p>
      <img src="{{qrCode}}" alt="QR Code" style="max-width: 200px;">
    </div>
    {{/if}}
  </div>
  
  <div class="signature">
    <p><strong>Aprobado por:</strong> {{approvedBy}}</p>
    <p><strong>Fecha de aprobación:</strong> {{formatDate approvedAt}}</p>
  </div>
  
  <div class="footer">
    <p>Este documento ha sido generado electrónicamente y tiene validez legal.</p>
    <p>{{institutionName}} - Sistema de Gestión de Reservas</p>
  </div>
</body>
</html>
    `;

    // Template de carta de rechazo
    const rejectionTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; }
    .title { font-size: 24px; font-weight: bold; color: #2c3e50; }
    .content { margin: 20px 0; line-height: 1.6; }
    .info-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0; }
    .alternatives { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
    .footer { margin-top: 40px; font-size: 12px; color: #7f8c8d; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    {{#if institutionLogo}}
    <img src="{{institutionLogo}}" alt="Logo" class="logo">
    {{/if}}
    <h1 class="title">{{institutionName}}</h1>
    <h2>NOTIFICACIÓN DE RECHAZO DE RESERVA</h2>
  </div>

  <div class="content">
    <p><strong>Fecha:</strong> {{formatDate rejectedAt}}</p>
    
    <p>Estimado/a <strong>{{userName}}</strong>,</p>
    
    <p>Lamentamos informarle que su solicitud de reserva ha sido <strong>RECHAZADA</strong>.</p>
    
    <div class="info-box">
      <h3>Detalles de la Solicitud</h3>
      <p><strong>Recurso Solicitado:</strong> {{resourceName}}</p>
      <p><strong>Fecha Solicitada:</strong> {{formatDate reservationDate}}</p>
      <p><strong>ID de Solicitud:</strong> {{approvalRequestId}}</p>
    </div>
    
    <p><strong>Motivo del Rechazo:</strong></p>
    <p>{{rejectionReason}}</p>
    
    {{#if alternativeSuggestions}}
    <div class="alternatives">
      <h3>Sugerencias Alternativas</h3>
      <ul>
        {{#each alternativeSuggestions}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
    </div>
    {{/if}}
    
    <p><strong>Próximos Pasos:</strong></p>
    <ul>
      <li>Puede realizar una nueva solicitud con las sugerencias proporcionadas</li>
      <li>Contacte al administrador para más información</li>
      <li>Consulte la disponibilidad de recursos alternativos en el sistema</li>
    </ul>
  </div>
  
  <div class="footer">
    <p>Este documento ha sido generado electrónicamente.</p>
    <p>{{institutionName}} - Sistema de Gestión de Reservas</p>
  </div>
</body>
</html>
    `;

    // Template de confirmación
    const confirmationTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { max-width: 150px; }
    .title { font-size: 24px; font-weight: bold; color: #2c3e50; }
    .content { margin: 20px 0; line-height: 1.6; }
    .info-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; }
    .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #f0f0f0; }
    .footer { margin-top: 40px; font-size: 12px; color: #7f8c8d; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    {{#if institutionLogo}}
    <img src="{{institutionLogo}}" alt="Logo" class="logo">
    {{/if}}
    <h1 class="title">{{institutionName}}</h1>
    <h2>CONFIRMACIÓN DE RESERVA</h2>
  </div>

  <div class="content">
    <p>Estimado/a <strong>{{userName}}</strong>,</p>
    
    <p>Su reserva ha sido confirmada exitosamente.</p>
    
    <div class="info-box">
      <h3>Detalles de la Reserva</h3>
      <p><strong>Recurso:</strong> {{resourceName}}</p>
      <p><strong>Ubicación:</strong> {{resourceLocation}}</p>
      <p><strong>Fecha:</strong> {{formatDate reservationDate}}</p>
      <p><strong>Horario:</strong> {{reservationStartTime}} - {{reservationEndTime}}</p>
      <p><strong>ID de Reserva:</strong> {{reservationId}}</p>
    </div>
    
    <div class="qr-section">
      <h3>Código QR para Check-in</h3>
      <img src="{{qrCode}}" alt="QR Code" style="max-width: 250px;">
      <p><small>Escanee este código al llegar al recurso</small></p>
    </div>
    
    {{#if instructions}}
    <p><strong>Instrucciones Importantes:</strong></p>
    <ul>
      {{#each instructions}}
      <li>{{this}}</li>
      {{/each}}
    </ul>
    {{/if}}
  </div>
  
  <div class="footer">
    <p>Este documento ha sido generado electrónicamente.</p>
    <p>{{institutionName}} - Sistema de Gestión de Reservas</p>
  </div>
</body>
</html>
    `;

    // Registrar helpers de Handlebars
    Handlebars.registerHelper("formatDate", (date: Date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    });

    // Compilar templates
    this.templates.set(
      DocumentType.APPROVAL_LETTER,
      Handlebars.compile(approvalTemplate)
    );
    this.templates.set(
      DocumentType.REJECTION_LETTER,
      Handlebars.compile(rejectionTemplate)
    );
    this.templates.set(
      DocumentType.CONFIRMATION,
      Handlebars.compile(confirmationTemplate)
    );

    logger.info("Document templates initialized successfully");
  }

  /**
   * Generar documento de aprobación
   */
  async generateApprovalLetter(
    data: ApprovalDocumentData
  ): Promise<DocumentGenerationResult> {
    logger.info("Generating approval letter", {
      approvalRequestId: data.approvalRequestId,
    });

    try {
      // Generar QR code si no se proporciona
      if (!data.qrCode) {
        const qrData = JSON.stringify({
          type: "approval",
          id: data.approvalRequestId,
          resource: data.resourceName,
          date: data.reservationDate,
        });
        data.qrCode = await this.qrCodeService.generateQRCode(qrData);
      }

      // Valores por defecto
      data.institutionName =
        data.institutionName ||
        "Universidad Francisco de Paula Santander";

      // Generar HTML desde template
      const template = this.templates.get(DocumentType.APPROVAL_LETTER);
      if (!template) {
        throw new Error("Approval letter template not found");
      }

      const html = template(data);

      // Convertir HTML a PDF
      const buffer = await this.htmlToPdf(html, {
        title: `Aprobación - ${data.resourceName}`,
        author: data.approvedBy,
      });

      const documentId = `approval-${data.approvalRequestId}-${Date.now()}`;
      const fileName = `carta_aprobacion_${data.approvalRequestId}.pdf`;

      logger.info("Approval letter generated successfully", {
        documentId,
        size: buffer.length,
      });

      return {
        documentId,
        documentType: DocumentType.APPROVAL_LETTER,
        fileName,
        buffer,
        size: buffer.length,
        generatedAt: new Date(),
        metadata: {
          approvalRequestId: data.approvalRequestId,
          userName: data.userName,
          resourceName: data.resourceName,
        },
      };
    } catch (error) {
      logger.error("Error generating approval letter", error as Error, {
        approvalRequestId: data.approvalRequestId,
      });
      throw error;
    }
  }

  /**
   * Generar documento de rechazo
   */
  async generateRejectionLetter(
    data: RejectionDocumentData
  ): Promise<DocumentGenerationResult> {
    logger.info("Generating rejection letter", {
      approvalRequestId: data.approvalRequestId,
    });

    try {
      // Valores por defecto
      data.institutionName =
        data.institutionName ||
        "Universidad Francisco de Paula Santander";

      // Generar HTML desde template
      const template = this.templates.get(DocumentType.REJECTION_LETTER);
      if (!template) {
        throw new Error("Rejection letter template not found");
      }

      const html = template(data);

      // Convertir HTML a PDF
      const buffer = await this.htmlToPdf(html, {
        title: `Rechazo - ${data.resourceName}`,
        author: data.rejectedBy,
      });

      const documentId = `rejection-${data.approvalRequestId}-${Date.now()}`;
      const fileName = `carta_rechazo_${data.approvalRequestId}.pdf`;

      logger.info("Rejection letter generated successfully", {
        documentId,
        size: buffer.length,
      });

      return {
        documentId,
        documentType: DocumentType.REJECTION_LETTER,
        fileName,
        buffer,
        size: buffer.length,
        generatedAt: new Date(),
        metadata: {
          approvalRequestId: data.approvalRequestId,
          userName: data.userName,
          resourceName: data.resourceName,
          rejectionReason: data.rejectionReason,
        },
      };
    } catch (error) {
      logger.error("Error generating rejection letter", error as Error, {
        approvalRequestId: data.approvalRequestId,
      });
      throw error;
    }
  }

  /**
   * Generar confirmación de reserva
   */
  async generateConfirmation(
    data: ConfirmationDocumentData
  ): Promise<DocumentGenerationResult> {
    logger.info("Generating confirmation document", {
      reservationId: data.reservationId,
    });

    try {
      // Valores por defecto
      data.institutionName =
        data.institutionName ||
        "Universidad Francisco de Paula Santander";

      data.instructions = data.instructions || [
        "Llegue 10 minutos antes del horario programado",
        "Presente este documento al personal de vigilancia",
        "Escanee el código QR para realizar el check-in",
        "Recuerde devolver el recurso en las mismas condiciones",
      ];

      // Generar HTML desde template
      const template = this.templates.get(DocumentType.CONFIRMATION);
      if (!template) {
        throw new Error("Confirmation template not found");
      }

      const html = template(data);

      // Convertir HTML a PDF
      const buffer = await this.htmlToPdf(html, {
        title: `Confirmación - ${data.resourceName}`,
      });

      const documentId = `confirmation-${data.reservationId}-${Date.now()}`;
      const fileName = `confirmacion_${data.reservationId}.pdf`;

      logger.info("Confirmation document generated successfully", {
        documentId,
        size: buffer.length,
      });

      return {
        documentId,
        documentType: DocumentType.CONFIRMATION,
        fileName,
        buffer,
        size: buffer.length,
        generatedAt: new Date(),
        metadata: {
          reservationId: data.reservationId,
          userName: data.userName,
          resourceName: data.resourceName,
        },
      };
    } catch (error) {
      logger.error("Error generating confirmation document", error as Error, {
        reservationId: data.reservationId,
      });
      throw error;
    }
  }

  /**
   * Convertir HTML a PDF usando PDFKit
   * Nota: Para producción, considerar usar Puppeteer para mejor renderizado HTML
   */
  private async htmlToPdf(
    html: string,
    options?: { title?: string; author?: string }
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 50,
          info: {
            Title: options?.title || "Documento",
            Author: options?.author || "Sistema Bookly",
            Subject: "Documento generado automáticamente",
            Creator: "Bookly Document Generation Service",
          },
        });

        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Nota: Este es un renderizado básico
        // Para producción, usar Puppeteer o similar para mejor soporte HTML/CSS
        this.renderSimpleHtml(doc, html);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Renderizado simple de HTML (básico)
   * TODO: Migrar a Puppeteer para mejor soporte HTML/CSS
   */
  private renderSimpleHtml(doc: PDFKit.PDFDocument, html: string): void {
    // Remover tags HTML básicos y renderizar texto
    const text = html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    doc.fontSize(12).font("Helvetica").text(text, {
      align: "left",
      width: 500,
    });

    // Nota: Este es un placeholder
    // En producción, implementar parser HTML completo o usar Puppeteer
    logger.warn(
      "Using basic HTML rendering. Consider implementing Puppeteer for production."
    );
  }
}
