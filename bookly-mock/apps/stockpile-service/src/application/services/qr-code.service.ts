import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import * as QRCode from "qrcode";

const logger = createLogger("QRCodeService");

/**
 * QR Code Data
 */
export interface QRCodeData {
  qrCode: string; // Base64 encoded QR code image
  token: string; // Token único para validación
  expiresAt: Date;
  metadata: {
    reservationId: string;
    resourceId: string;
    userId: string;
    generatedAt: Date;
  };
}

/**
 * QR Code Service
 * Servicio para generación y validación de códigos QR para check-in automático
 */
@Injectable()
export class QRCodeService {
  private readonly tokenCache = new Map<
    string,
    { reservationId: string; expiresAt: Date }
  >();

  /**
   * Generar código QR para check-in
   */
  async generateCheckInQR(
    reservationId: string,
    resourceId: string,
    userId: string,
    expirationMinutes: number = 30
  ): Promise<QRCodeData> {
    try {
      // Generar token único
      const token = this.generateSecureToken(reservationId, userId);
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      // Almacenar en caché para validación
      this.tokenCache.set(token, {
        reservationId,
        expiresAt,
      });

      // Datos a codificar en el QR
      const qrData = {
        type: "check-in",
        token,
        reservationId,
        resourceId,
        userId,
        timestamp: new Date().toISOString(),
      };

      // Generar QR real usando qrcode library
      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: "H",
        type: "image/png",
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      logger.info("QR code generated for check-in", {
        reservationId,
        resourceId,
        userId,
        expiresAt,
      });

      return {
        qrCode: qrCodeImage,
        token,
        expiresAt,
        metadata: {
          reservationId,
          resourceId,
          userId,
          generatedAt: new Date(),
        },
      };
    } catch (error) {
      logger.error("Error generating QR code", error as Error, {
        reservationId,
      });
      throw error;
    }
  }

  /**
   * Validar token de QR code
   */
  async validateQRToken(token: string): Promise<{
    valid: boolean;
    reservationId?: string;
    reason?: string;
  }> {
    try {
      const cached = this.tokenCache.get(token);

      if (!cached) {
        return {
          valid: false,
          reason: "Token no encontrado o inválido",
        };
      }

      // Verificar expiración
      if (new Date() > cached.expiresAt) {
        this.tokenCache.delete(token);
        return {
          valid: false,
          reason: "Token expirado",
        };
      }

      logger.info("QR token validated successfully", {
        reservationId: cached.reservationId,
      });

      return {
        valid: true,
        reservationId: cached.reservationId,
      };
    } catch (error) {
      logger.error("Error validating QR token", error as Error);
      return {
        valid: false,
        reason: "Error en validación",
      };
    }
  }

  /**
   * Invalidar token después de uso
   */
  async invalidateToken(token: string): Promise<void> {
    this.tokenCache.delete(token);
    logger.info("QR token invalidated", { token: token.substring(0, 10) });
  }

  /**
   * Generar token seguro
   */
  private generateSecureToken(reservationId: string, userId: string): string {
    const data = `${reservationId}-${userId}-${Date.now()}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Limpiar tokens expirados (ejecutar periódicamente)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    let cleaned = 0;

    for (const [token, data] of this.tokenCache.entries()) {
      if (now > data.expiresAt) {
        this.tokenCache.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info("Cleaned up expired QR tokens", { count: cleaned });
    }
  }

  /**
   * Generar QR para check-out
   */
  async generateCheckOutQR(
    checkInId: string,
    resourceId: string,
    userId: string,
    expirationMinutes: number = 15
  ): Promise<QRCodeData> {
    const token = this.generateSecureToken(checkInId, userId);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    this.tokenCache.set(token, {
      reservationId: checkInId,
      expiresAt,
    });

    const qrData = {
      type: "check-out",
      token,
      checkInId,
      resourceId,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Generar QR real
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    logger.info("QR code generated for check-out", {
      checkInId,
      resourceId,
      userId,
      expiresAt,
    });

    return {
      qrCode: qrCodeImage,
      token,
      expiresAt,
      metadata: {
        reservationId: checkInId,
        resourceId,
        userId,
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Generar QR Code como Buffer (para archivos)
   */
  async generateCheckInQRBuffer(
    reservationId: string,
    resourceId: string,
    userId: string,
    expirationMinutes: number = 30
  ): Promise<{ qrBuffer: Buffer; token: string; expiresAt: Date }> {
    try {
      // Generar token único
      const token = this.generateSecureToken(reservationId, userId);
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      // Almacenar en caché
      this.tokenCache.set(token, { reservationId, expiresAt });

      const qrData = {
        type: "check-in",
        token,
        reservationId,
        resourceId,
        userId,
        timestamp: new Date().toISOString(),
      };

      // Generar QR como Buffer
      const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
        errorCorrectionLevel: "H",
        type: "png",
        width: 500,
        margin: 2,
      });

      logger.info("QR buffer generated for check-in", {
        reservationId,
        bufferSize: qrBuffer.length,
      });

      return { qrBuffer, token, expiresAt };
    } catch (error) {
      logger.error("Error generating QR buffer", error as Error);
      throw error;
    }
  }

  /**
   * Generar QR Code en formato SVG
   */
  async generateCheckInQRSVG(
    reservationId: string,
    resourceId: string,
    userId: string,
    expirationMinutes: number = 30
  ): Promise<{ qrSvg: string; token: string; expiresAt: Date }> {
    try {
      // Generar token único
      const token = this.generateSecureToken(reservationId, userId);
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

      // Almacenar en caché
      this.tokenCache.set(token, { reservationId, expiresAt });

      const qrData = {
        type: "check-in",
        token,
        reservationId,
        resourceId,
        userId,
        timestamp: new Date().toISOString(),
      };

      // Generar QR como SVG string
      const qrSvg = await QRCode.toString(JSON.stringify(qrData), {
        errorCorrectionLevel: "H",
        type: "svg",
        width: 400,
        margin: 2,
      });

      logger.info("QR SVG generated for check-in", { reservationId });

      return { qrSvg, token, expiresAt };
    } catch (error) {
      logger.error("Error generating QR SVG", error as Error);
      throw error;
    }
  }
}
