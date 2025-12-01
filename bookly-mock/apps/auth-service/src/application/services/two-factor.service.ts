import { createLogger } from "@libs/common";
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as crypto from "crypto";
import * as QRCode from "qrcode";
import * as speakeasy from "speakeasy";
import { IUserRepository } from '@auth/domain/repositories/user.repository.interface";

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * TwoFactor Service
 * Servicio para gestión de autenticación de dos factores (2FA) con TOTP
 */
@Injectable()
export class TwoFactorService {
  private readonly logger = createLogger("TwoFactorService");
  private readonly APP_NAME = "Bookly";

  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Generar configuración 2FA para un usuario
   */
  async setup2FA(userId: string): Promise<TwoFactorSetup> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (user.has2FAEnabled()) {
        throw new BadRequestException("2FA is already enabled for this user");
      }

      // Generar secret TOTP
      const secret = speakeasy.generateSecret({
        name: `${this.APP_NAME} (${user.email})`,
        issuer: this.APP_NAME,
        length: 32,
      });

      // Generar QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url || "");

      // Generar códigos de backup
      const backupCodes = this.generateBackupCodes(10);

      this.logger.info("2FA setup generated", {
        userId: user.id,
        email: user.email,
      });

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      this.logger.error("Failed to setup 2FA", error as Error);
      throw error;
    }
  }

  /**
   * Verificar código TOTP y habilitar 2FA
   */
  async enable2FA(
    userId: string,
    token: string,
    secret: string
  ): Promise<{ backupCodes: string[] }> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (user.has2FAEnabled()) {
        throw new BadRequestException("2FA is already enabled");
      }

      // Verificar el código TOTP
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 2, // Permitir 2 ventanas de tiempo (60 segundos antes/después)
      });

      if (!isValid) {
        this.logger.warn("Invalid 2FA token during setup", {
          userId: user.id,
          email: user.email,
        });
        throw new UnauthorizedException("Invalid verification code");
      }

      // Generar códigos de backup
      const backupCodes = this.generateBackupCodes(10);

      // Habilitar 2FA en la entidad
      user.enable2FA(secret, backupCodes);

      // Actualizar en BD
      await this.userRepository.update(userId, {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
      });

      this.logger.info("2FA enabled successfully", {
        userId: user.id,
        email: user.email,
      });

      return { backupCodes };
    } catch (error) {
      this.logger.error("Failed to enable 2FA", error as Error);
      throw error;
    }
  }

  /**
   * Verificar código TOTP
   */
  async verify2FA(userId: string, token: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (!user.has2FAEnabled() || !user.twoFactorSecret) {
        throw new BadRequestException("2FA is not enabled for this user");
      }

      // Verificar el código TOTP
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 2,
      });

      if (isValid) {
        this.logger.info("2FA token verified successfully", {
          userId: user.id,
          email: user.email,
        });
      } else {
        this.logger.warn("Invalid 2FA token", {
          userId: user.id,
          email: user.email,
        });
      }

      return isValid;
    } catch (error) {
      this.logger.error("Failed to verify 2FA", error as Error);
      throw error;
    }
  }

  /**
   * Deshabilitar 2FA (requiere contraseña)
   */
  async disable2FA(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (!user.has2FAEnabled()) {
        throw new BadRequestException("2FA is not enabled");
      }

      // Deshabilitar 2FA en la entidad
      user.disable2FA();

      // Actualizar en BD
      await this.userRepository.update(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
        twoFactorBackupCodes: [],
      });

      this.logger.info("2FA disabled successfully", {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      this.logger.error("Failed to disable 2FA", error as Error);
      throw error;
    }
  }

  /**
   * Validar código de backup
   */
  async validateBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (!user.has2FAEnabled()) {
        throw new BadRequestException("2FA is not enabled");
      }

      // Intentar usar el código de backup
      const isValid = user.useBackupCode(code);

      if (isValid) {
        // Actualizar códigos de backup en BD
        await this.userRepository.update(userId, {
          twoFactorBackupCodes: user.twoFactorBackupCodes || [],
        });

        this.logger.info("Backup code used successfully", {
          userId: user.id,
          email: user.email,
          remainingCodes: user.twoFactorBackupCodes?.length || 0,
        });
      } else {
        this.logger.warn("Invalid backup code", {
          userId: user.id,
          email: user.email,
        });
      }

      return isValid;
    } catch (error) {
      this.logger.error("Failed to validate backup code", error as Error);
      throw error;
    }
  }

  /**
   * Regenerar códigos de backup
   */
  async regenerateBackupCodes(
    userId: string
  ): Promise<{ backupCodes: string[] }> {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new BadRequestException("User not found");
      }

      if (!user.has2FAEnabled()) {
        throw new BadRequestException("2FA is not enabled");
      }

      // Generar nuevos códigos
      const newBackupCodes = this.generateBackupCodes(10);

      // Actualizar en la entidad
      user.regenerateBackupCodes(newBackupCodes);

      // Actualizar en BD
      await this.userRepository.update(userId, {
        twoFactorBackupCodes: newBackupCodes,
      });

      this.logger.info("Backup codes regenerated", {
        userId: user.id,
        email: user.email,
      });

      return { backupCodes: newBackupCodes };
    } catch (error) {
      this.logger.error("Failed to regenerate backup codes", error as Error);
      throw error;
    }
  }

  /**
   * Generar códigos de backup aleatorios
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generar código de 8 dígitos
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);
    }

    return codes;
  }
}
