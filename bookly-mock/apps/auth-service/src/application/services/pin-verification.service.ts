import { createLogger } from "@libs/common";
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RedisService } from "@libs/redis";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { IUserRepository } from "@auth/domain/repositories/user.repository.interface";

const logger = createLogger("PinVerificationService");

/**
 * Acciones críticas que requieren verificación PIN
 */
export enum CriticalAction {
  DELETE_RESOURCE = "delete_resource",
  CHANGE_PERMISSIONS = "change_permissions",
  DELETE_USER = "delete_user",
  MODIFY_APPROVAL_FLOW = "modify_approval_flow",
  EXPORT_SENSITIVE_DATA = "export_sensitive_data",
  BULK_CANCEL_RESERVATIONS = "bulk_cancel_reservations",
  CHANGE_SYSTEM_CONFIG = "change_system_config",
}

/**
 * Resultado de verificación PIN
 */
export interface PinVerificationResult {
  verified: boolean;
  verificationToken?: string;
  expiresAt?: Date;
  action: CriticalAction;
}

const PIN_HASH_PREFIX = "pin:hash:";
const PIN_VERIFY_TOKEN_PREFIX = "pin:verify:";
const PIN_ATTEMPTS_PREFIX = "pin:attempts:";
const PIN_LENGTH = 6;
const PIN_TOKEN_TTL_SECONDS = 300; // 5 minutos
const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_SECONDS = 900; // 15 minutos

/**
 * PIN Verification Service (RF-45)
 * Servicio para verificación de acciones críticas mediante PIN numérico
 *
 * Flujo:
 * 1. Usuario configura un PIN de 6 dígitos (POST /auth/pin/setup)
 * 2. Al realizar una acción crítica, el frontend solicita verificación
 * 3. Usuario ingresa su PIN (POST /auth/pin/verify)
 * 4. Backend retorna un verificationToken temporal (5 min)
 * 5. Frontend incluye el token en la request de la acción crítica
 * 6. Guard @RequirePinVerification valida el token
 */
@Injectable()
export class PinVerificationService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Configurar PIN para un usuario
   */
  async setupPin(userId: string, pin: string): Promise<{ success: boolean }> {
    this.validatePinFormat(pin);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const hashedPin = await bcrypt.hash(pin, this.SALT_ROUNDS);

    await this.redisService.set(
      `${PIN_HASH_PREFIX}${userId}`,
      hashedPin,
    );

    logger.info("PIN configured successfully", { userId });

    return { success: true };
  }

  /**
   * Cambiar PIN existente
   */
  async changePin(
    userId: string,
    currentPin: string,
    newPin: string,
  ): Promise<{ success: boolean }> {
    this.validatePinFormat(newPin);

    const isCurrentValid = await this.validatePin(userId, currentPin);
    if (!isCurrentValid) {
      throw new UnauthorizedException("Current PIN is incorrect");
    }

    const hashedPin = await bcrypt.hash(newPin, this.SALT_ROUNDS);

    await this.redisService.set(
      `${PIN_HASH_PREFIX}${userId}`,
      hashedPin,
    );

    logger.info("PIN changed successfully", { userId });

    return { success: true };
  }

  /**
   * Verificar PIN y emitir token temporal para acción crítica
   */
  async verifyPinForAction(
    userId: string,
    pin: string,
    action: CriticalAction,
  ): Promise<PinVerificationResult> {
    // Verificar lockout
    const isLockedOut = await this.isLockedOut(userId);
    if (isLockedOut) {
      throw new UnauthorizedException(
        "Account is temporarily locked due to too many failed PIN attempts. Try again in 15 minutes.",
      );
    }

    const isValid = await this.validatePin(userId, pin);

    if (!isValid) {
      await this.recordFailedAttempt(userId);
      throw new UnauthorizedException("Invalid PIN");
    }

    // Reset intentos fallidos
    await this.redisService.del(`${PIN_ATTEMPTS_PREFIX}${userId}`);

    // Generar token de verificación temporal
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + PIN_TOKEN_TTL_SECONDS * 1000);

    const verifyKey = `${PIN_VERIFY_TOKEN_PREFIX}${verificationToken}`;
    await this.redisService.set(
      verifyKey,
      JSON.stringify({ userId, action, expiresAt: expiresAt.toISOString() }),
      { key: verifyKey, ttl: PIN_TOKEN_TTL_SECONDS },
    );

    logger.info("PIN verified for critical action", { userId, action });

    return {
      verified: true,
      verificationToken,
      expiresAt,
      action,
    };
  }

  /**
   * Validar token de verificación (usado por el guard)
   */
  async validateVerificationToken(
    token: string,
    expectedAction: CriticalAction,
    expectedUserId: string,
  ): Promise<boolean> {
    const stored = await this.redisService.get(
      `${PIN_VERIFY_TOKEN_PREFIX}${token}`,
    );

    if (!stored) {
      return false;
    }

    const data = JSON.parse(stored);

    if (data.userId !== expectedUserId) {
      return false;
    }

    if (data.action !== expectedAction) {
      return false;
    }

    const expiresAt = new Date(data.expiresAt);
    if (expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Invalidar token después de uso (single-use)
   */
  async consumeVerificationToken(token: string): Promise<void> {
    await this.redisService.del(`${PIN_VERIFY_TOKEN_PREFIX}${token}`);
  }

  /**
   * Verificar si el usuario tiene PIN configurado
   */
  async hasPinConfigured(userId: string): Promise<boolean> {
    const exists = await this.redisService.get(`${PIN_HASH_PREFIX}${userId}`);
    return !!exists;
  }

  /**
   * Eliminar PIN del usuario
   */
  async removePin(userId: string, currentPin: string): Promise<void> {
    const isValid = await this.validatePin(userId, currentPin);
    if (!isValid) {
      throw new UnauthorizedException("Invalid PIN");
    }

    await this.redisService.del(`${PIN_HASH_PREFIX}${userId}`);
    logger.info("PIN removed", { userId });
  }

  private async validatePin(userId: string, pin: string): Promise<boolean> {
    const storedHash = await this.redisService.get(
      `${PIN_HASH_PREFIX}${userId}`,
    );

    if (!storedHash) {
      throw new BadRequestException(
        "PIN not configured. Please set up a PIN first.",
      );
    }

    return bcrypt.compare(pin, storedHash);
  }

  private validatePinFormat(pin: string): void {
    if (!pin || pin.length !== PIN_LENGTH) {
      throw new BadRequestException(
        `PIN must be exactly ${PIN_LENGTH} digits`,
      );
    }

    if (!/^\d+$/.test(pin)) {
      throw new BadRequestException("PIN must contain only digits");
    }

    // Reject sequential or repeated PINs
    if (/^(\d)\1+$/.test(pin)) {
      throw new BadRequestException(
        "PIN cannot be all the same digit",
      );
    }
  }

  private async isLockedOut(userId: string): Promise<boolean> {
    const attempts = await this.redisService.get(
      `${PIN_ATTEMPTS_PREFIX}${userId}`,
    );

    return attempts !== null && parseInt(attempts, 10) >= MAX_PIN_ATTEMPTS;
  }

  private async recordFailedAttempt(userId: string): Promise<void> {
    const key = `${PIN_ATTEMPTS_PREFIX}${userId}`;
    const current = await this.redisService.get(key);
    const attempts = current ? parseInt(current, 10) + 1 : 1;

    await this.redisService.set(
      key,
      attempts.toString(),
      { key, ttl: PIN_LOCKOUT_SECONDS },
    );

    logger.warn("Failed PIN attempt", {
      userId,
      attempts,
      maxAttempts: MAX_PIN_ATTEMPTS,
    });
  }
}
