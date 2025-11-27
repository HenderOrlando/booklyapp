import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import PDFDocument from "pdfkit";
import { promisify } from "util";
import * as zlib from "zlib";

const logger = createLogger("DigitalSignatureService");
const gzipAsync = promisify(zlib.gzip);

/**
 * Firma Digital
 */
export interface DigitalSignature {
  signatureData: string; // Imagen de la firma en base64
  hash: string; // Hash de la firma para verificación
  timestamp: Date;
  userId: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
  };
}

/**
 * Documento para firmar
 */
export interface SignatureDocument {
  documentId: string;
  documentType: "check-out" | "damage-report" | "equipment-return";
  content: Record<string, any>;
  requiresSignature: boolean;
}

/**
 * Digital Signature Service
 * Servicio para gestión de firmas digitales en check-out
 */
@Injectable()
export class DigitalSignatureService {
  private readonly signatureCache = new Map<string, DigitalSignature>();

  /**
   * Registrar firma digital
   */
  async registerSignature(
    checkOutId: string,
    signatureData: string,
    userId: string,
    metadata?: Partial<DigitalSignature["metadata"]>
  ): Promise<DigitalSignature> {
    try {
      // Generar hash de la firma
      const hash = this.generateSignatureHash(signatureData, userId);

      const signature: DigitalSignature = {
        signatureData,
        hash,
        timestamp: new Date(),
        userId,
        metadata: {
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
          deviceInfo: metadata?.deviceInfo,
        },
      };

      // Almacenar firma
      this.signatureCache.set(checkOutId, signature);

      logger.info("Digital signature registered", {
        checkOutId,
        userId,
        hash: hash.substring(0, 16),
      });

      return signature;
    } catch (error) {
      logger.error("Error registering signature", error as Error, {
        checkOutId,
      });
      throw error;
    }
  }

  /**
   * Verificar firma digital
   */
  async verifySignature(
    checkOutId: string,
    signatureData: string
  ): Promise<{
    valid: boolean;
    signature?: DigitalSignature;
    reason?: string;
  }> {
    try {
      const storedSignature = this.signatureCache.get(checkOutId);

      if (!storedSignature) {
        return {
          valid: false,
          reason: "Firma no encontrada",
        };
      }

      // Verificar hash
      const calculatedHash = this.generateSignatureHash(
        signatureData,
        storedSignature.userId
      );

      if (calculatedHash !== storedSignature.hash) {
        return {
          valid: false,
          reason: "Firma no coincide",
        };
      }

      logger.info("Signature verified successfully", { checkOutId });

      return {
        valid: true,
        signature: storedSignature,
      };
    } catch (error) {
      logger.error("Error verifying signature", error as Error, { checkOutId });
      return {
        valid: false,
        reason: "Error en verificación",
      };
    }
  }

  /**
   * Obtener firma
   */
  async getSignature(checkOutId: string): Promise<DigitalSignature | null> {
    return this.signatureCache.get(checkOutId) || null;
  }

  /**
   * Generar hash de firma
   */
  private generateSignatureHash(signatureData: string, userId: string): string {
    const data = `${signatureData}-${userId}-${process.env.SIGNATURE_SECRET || "default-secret"}`;
    return crypto.createHash("sha512").update(data).digest("hex");
  }

  /**
   * Generar documento para firmar
   */
  async generateSignatureDocument(
    checkOutId: string,
    resourceId: string,
    userId: string,
    includeConditions: boolean = true
  ): Promise<SignatureDocument> {
    const document: SignatureDocument = {
      documentId: `doc-${checkOutId}`,
      documentType: "check-out",
      requiresSignature: true,
      content: {
        checkOutId,
        resourceId,
        userId,
        timestamp: new Date(),
        declaration: `Yo, ${userId}, declaro que he devuelto el recurso ${resourceId} en las condiciones acordadas.`,
      },
    };

    if (includeConditions) {
      document.content.conditions = [
        "El recurso ha sido devuelto en buen estado",
        "No hay daños ni faltantes reportados",
        "Se entrega en el mismo estado en que fue recibido",
        "Acepto responsabilidad por cualquier daño no reportado",
      ];
    }

    logger.info("Signature document generated", {
      documentId: document.documentId,
      checkOutId,
    });

    return document;
  }

  /**
   * Validar formato de firma
   */
  validateSignatureFormat(signatureData: string): {
    valid: boolean;
    reason?: string;
  } {
    // Validar que sea base64
    const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;

    if (!base64Regex.test(signatureData)) {
      return {
        valid: false,
        reason: "Formato de firma inválido (debe ser imagen base64)",
      };
    }

    // Validar tamaño (max 2MB)
    const sizeInBytes = (signatureData.length * 3) / 4;
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (sizeInBytes > maxSize) {
      return {
        valid: false,
        reason: `Firma demasiado grande (${(sizeInBytes / 1024 / 1024).toFixed(2)}MB > 2MB)`,
      };
    }

    return {
      valid: true,
    };
  }

  /**
   * Generar reporte de devolución con firma
   */
  async generateReturnReport(
    checkOutId: string,
    signature: DigitalSignature,
    resourceCondition: {
      condition: "excellent" | "good" | "fair" | "poor" | "damaged";
      notes?: string;
      photos?: string[];
    }
  ): Promise<{
    reportId: string;
    checkOutId: string;
    signature: DigitalSignature;
    resourceCondition: typeof resourceCondition;
    generatedAt: Date;
    verified: boolean;
  }> {
    const reportId = `report-${checkOutId}-${Date.now()}`;

    const report = {
      reportId,
      checkOutId,
      signature,
      resourceCondition,
      generatedAt: new Date(),
      verified: true,
    };

    logger.info("Return report generated", {
      reportId,
      checkOutId,
      condition: resourceCondition.condition,
    });

    return report;
  }

  /**
   * Exportar firma a PDF con PDFKit
   */
  async exportSignatureToPDF(
    checkOutId: string,
    signature: DigitalSignature,
    document: SignatureDocument
  ): Promise<Buffer> {
    logger.info("Generating signature PDF", { checkOutId });

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const chunks: Buffer[] = [];

        // Capturar datos del PDF
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(chunks);
          logger.info("PDF generated successfully", {
            checkOutId,
            size: pdfBuffer.length,
          });
          resolve(pdfBuffer);
        });
        doc.on("error", (error) => {
          logger.error("Error generating PDF", error);
          reject(error);
        });

        // === HEADER ===
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text("Documento de Devolución de Recurso", { align: "center" });
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Generado el: ${new Date().toLocaleString("es-CO")}`, {
            align: "center",
          });
        doc.moveDown(2);

        // === INFORMACIÓN DEL CHECK-OUT ===
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Información de Devolución");
        doc.moveDown(0.5);

        doc.fontSize(11).font("Helvetica");
        doc.text(`Check-out ID: ${checkOutId}`);
        doc.text(`Usuario ID: ${signature.userId}`);
        doc.text(
          `Fecha y Hora: ${signature.timestamp.toLocaleString("es-CO")}`
        );
        doc.text(`Tipo de Documento: ${document.documentType}`);
        doc.moveDown(1);

        // === DETALLES DEL DOCUMENTO ===
        if (document.content) {
          doc.fontSize(16).font("Helvetica-Bold").text("Detalles");
          doc.moveDown(0.5);
          doc.fontSize(11).font("Helvetica");

          Object.entries(document.content).forEach(([key, value]) => {
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            doc.text(`${label}: ${value}`);
          });
          doc.moveDown(1);
        }

        // === METADATA ===
        if (signature.metadata) {
          doc
            .fontSize(16)
            .font("Helvetica-Bold")
            .text("Información del Dispositivo");
          doc.moveDown(0.5);
          doc.fontSize(11).font("Helvetica");

          if (signature.metadata.ipAddress) {
            doc.text(`Dirección IP: ${signature.metadata.ipAddress}`);
          }
          if (signature.metadata.userAgent) {
            doc.text(`Navegador: ${signature.metadata.userAgent}`, {
              width: 500,
            });
          }
          if (signature.metadata.deviceInfo) {
            doc.text(`Dispositivo: ${signature.metadata.deviceInfo}`);
          }
          doc.moveDown(1);
        }

        // === FIRMA DIGITAL ===
        doc.fontSize(16).font("Helvetica-Bold").text("Firma Digital");
        doc.moveDown(0.5);

        // Verificar si la firma es una imagen base64
        if (
          signature.signatureData &&
          signature.signatureData.startsWith("data:image")
        ) {
          try {
            // Extraer datos de la imagen
            const base64Data = signature.signatureData.split(",")[1];
            const imageBuffer = Buffer.from(base64Data, "base64");

            // Insertar imagen de la firma
            doc.image(imageBuffer, {
              fit: [250, 100],
              align: "center",
            });
            doc.moveDown(0.5);
          } catch (error) {
            logger.warn("Could not insert signature image", error);
            doc
              .fontSize(10)
              .font("Helvetica")
              .text("[Firma digital capturada pero no visualizable en PDF]");
          }
        } else {
          doc.fontSize(10).font("Helvetica").text("[Firma digital registrada]");
        }

        doc.moveDown(1);
        doc
          .fontSize(9)
          .font("Helvetica")
          .text(`Hash de verificación: ${signature.hash}`, {
            width: 500,
            align: "left",
          });

        // === FOOTER ===
        doc.moveDown(3);
        const pageHeight = doc.page.height;
        const bottomY = pageHeight - 100;

        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            "Este documento ha sido generado electrónicamente y tiene validez legal.",
            50,
            bottomY,
            { align: "center", width: 500 }
          );
        doc.text(
          "Sistema de Gestión de Reservas - Universidad Francisco de Paula Santander",
          { align: "center", width: 500 }
        );

        // Finalizar documento
        doc.end();
      } catch (error) {
        logger.error("Error creating PDF document", error as Error);
        reject(error);
      }
    });
  }

  /**
   * Exportar firma a PDF comprimido con gzip
   */
  async exportSignatureToPDFCompressed(
    checkOutId: string,
    signature: DigitalSignature,
    document: SignatureDocument
  ): Promise<Buffer> {
    try {
      logger.info("Generating compressed PDF", { checkOutId });

      // Generar PDF normal
      const pdfBuffer = await this.exportSignatureToPDF(
        checkOutId,
        signature,
        document
      );

      // Comprimir con gzip
      const compressedBuffer = await gzipAsync(pdfBuffer);

      const compressionRatio =
        ((pdfBuffer.length - compressedBuffer.length) / pdfBuffer.length) * 100;

      logger.info("PDF compressed successfully", {
        checkOutId,
        originalSize: pdfBuffer.length,
        compressedSize: compressedBuffer.length,
        compressionRatio: compressionRatio.toFixed(2) + "%",
      });

      return compressedBuffer;
    } catch (error) {
      logger.error("Error compressing PDF", error as Error, { checkOutId });
      throw error;
    }
  }

  /**
   * Descomprimir PDF gzip para visualización
   */
  async decompressPDF(compressedBuffer: Buffer): Promise<Buffer> {
    try {
      const gunzipAsync = promisify(zlib.gunzip);
      const decompressedBuffer = await gunzipAsync(compressedBuffer);

      logger.debug("PDF decompressed successfully", {
        compressedSize: compressedBuffer.length,
        decompressedSize: decompressedBuffer.length,
      });

      return decompressedBuffer;
    } catch (error) {
      logger.error("Error decompressing PDF", error as Error);
      throw error;
    }
  }
}
