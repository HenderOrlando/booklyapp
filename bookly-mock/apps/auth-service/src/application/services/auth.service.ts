import { UserEntity } from "@auth/domain/entities/user.entity";
import { TwoFactorVerificationFailedEvent } from "@auth/domain/events/two-factor-verification-failed.event";
import { IUserRepository } from "@auth/domain/repositories/user.repository.interface";
import { createLogger } from "@libs/common";
import {
  JWT_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
  JWT_SECRET,
  REDIS_PREFIXES,
} from "@libs/common/constants";
import { RedisService } from "@libs/redis";
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  tempToken?: string;
  user?: UserEntity;
  tokens?: AuthTokens;
}

/**
 * Auth Service
 * Servicio de autenticación con JWT
 */
@Injectable()
export class AuthService {
  private readonly logger = createLogger("AuthService");
  private readonly SALT_ROUNDS = 10;

  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Autenticar usuario con email y contraseña
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.logger.warn("Login attempt with non-existent email", { email });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.canLogin()) {
      this.logger.warn("Login attempt with inactive/unverified account", {
        email,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      });
      throw new UnauthorizedException(
        "Account is inactive or email not verified",
      );
    }

    // Verificar si usuario tiene password (no SSO)
    if (!user.password) {
      this.logger.warn("Login attempt on SSO account with password", { email });
      throw new UnauthorizedException("This account uses SSO authentication");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn("Login attempt with invalid password", { email });
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verificar si tiene 2FA habilitado
    if (user.has2FAEnabled()) {
      // Generar token temporal con expiración de 5 minutos
      const tempToken = this.jwtService.sign(
        { sub: user.id, email: user.email, temp: true },
        { secret: JWT_SECRET, expiresIn: "5m" },
      );

      this.logger.info("Login pending 2FA verification", {
        userId: user.id,
        email: user.email,
      });

      return {
        requiresTwoFactor: true,
        tempToken,
      };
    }

    // Login normal sin 2FA
    await this.userRepository.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    this.logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
    });

    return {
      requiresTwoFactor: false,
      user,
      tokens,
    };
  }

  /**
   * Completar login con código 2FA
   */
  async loginWith2FA(tempToken: string, token: string): Promise<AuthTokens> {
    try {
      // Verificar token temporal
      const payload = this.jwtService.verify(tempToken, { secret: JWT_SECRET });

      if (!payload.temp) {
        throw new UnauthorizedException("Invalid temporary token");
      }

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (!user.has2FAEnabled() || !user.twoFactorSecret) {
        throw new BadRequestException("2FA is not enabled for this user");
      }

      // Verificar código TOTP
      const speakeasy = require("speakeasy");
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
        window: 2,
      });

      if (!isValid) {
        this.logger.warn("Invalid 2FA code during login", {
          userId: user.id,
          email: user.email,
        });
        throw new UnauthorizedException("Invalid 2FA code");
      }

      // Actualizar último login
      await this.userRepository.updateLastLogin(user.id);

      // Generar tokens finales
      const tokens = await this.generateTokens(user);

      this.logger.info("User logged in successfully with 2FA", {
        userId: user.id,
        email: user.email,
      });

      return tokens;
    } catch (error) {
      this.logger.error("Failed to complete 2FA login", error as Error);
      throw new UnauthorizedException("Invalid temporary token or 2FA code");
    }
  }

  /**
   * Completar login con código de backup
   */
  async loginWithBackupCode(
    tempToken: string,
    backupCode: string,
  ): Promise<AuthTokens> {
    try {
      // Verificar token temporal
      const payload = this.jwtService.verify(tempToken, { secret: JWT_SECRET });

      if (!payload.temp) {
        throw new UnauthorizedException("Invalid temporary token");
      }

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (!user.has2FAEnabled()) {
        throw new BadRequestException("2FA is not enabled for this user");
      }

      // Validar código de backup
      const isValid = user.useBackupCode(backupCode);

      if (!isValid) {
        this.logger.warn("Invalid backup code during login", {
          userId: user.id,
          email: user.email,
        });

        // Publicar evento de verificación fallida
        this.eventBus.publish(
          TwoFactorVerificationFailedEvent.create({
            userId: user.id,
            email: user.email,
            reason: "invalid_backup_code",
          }),
        );

        throw new UnauthorizedException("Invalid backup code");
      }

      // Actualizar códigos de backup en BD
      await this.userRepository.update(user.id, {
        twoFactorBackupCodes: user.twoFactorBackupCodes || [],
      });

      // Actualizar último login
      await this.userRepository.updateLastLogin(user.id);

      // Generar tokens finales
      const tokens = await this.generateTokens(user);

      this.logger.info("User logged in successfully with backup code", {
        userId: user.id,
        email: user.email,
        remainingCodes: user.twoFactorBackupCodes?.length || 0,
      });

      return tokens;
    } catch (error) {
      this.logger.error("Failed to login with backup code", error as Error);
      throw new UnauthorizedException("Invalid temporary token or backup code");
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    roles: string[],
    permissions: string[],
  ): Promise<UserEntity> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      this.logger.warn("Registration attempt with existing email", { email });
      throw new UnauthorizedException("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Crear usuario
    const user = new UserEntity(
      "", // ID será asignado por el repository
      email,
      hashedPassword,
      firstName,
      lastName,
      roles as any[],
      permissions,
      true, // isActive
      false, // isEmailVerified
      undefined, // ssoProvider
      undefined, // ssoProviderId
      undefined, // ssoEmail
      undefined, // ssoPhotoUrl
      false, // twoFactorEnabled
      undefined, // twoFactorSecret
      [], // twoFactorBackupCodes
      undefined, // lastLogin
      undefined, // passwordChangedAt
      {
        createdBy: "system",
      },
    );

    const createdUser = await this.userRepository.create(user);

    this.logger.info("User registered successfully", {
      userId: createdUser.id,
      email: createdUser.email,
    });

    return createdUser;
  }

  /**
   * Cambiar contraseña de usuario
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Verificar si usuario tiene password (no SSO)
    if (!user.password) {
      throw new BadRequestException("Cannot change password for SSO accounts");
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      this.logger.warn("Password change attempt with invalid old password", {
        userId,
      });
      throw new UnauthorizedException("Invalid old password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.userRepository.updatePassword(userId, hashedPassword);

    this.logger.info("Password changed successfully", { userId });
  }

  /**
   * Generar tokens JWT
   */
  private async generateTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: JWT_EXPIRATION }),
      this.jwtService.signAsync(payload, { expiresIn: JWT_REFRESH_EXPIRATION }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Validar y decodificar token
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      // Verificar si está en blacklist
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException("Token has been revoked");
      }

      return await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch (error) {
      this.logger.warn("Invalid token", { error: (error as Error).message });
      throw new UnauthorizedException("Invalid token");
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      // Validar refresh token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        { secret: JWT_SECRET },
      );

      // Verificar si está en blacklist
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new UnauthorizedException("Refresh token has been revoked");
      }

      // Obtener usuario actualizado
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.canLogin()) {
        throw new UnauthorizedException("User not found or inactive");
      }

      // Invalidar refresh token anterior (rotation)
      await this.blacklistToken(refreshToken);

      // Generar nuevos tokens
      const tokens = await this.generateTokens(user);

      this.logger.info("Tokens refreshed successfully", {
        userId: user.id,
      });

      return tokens;
    } catch (error) {
      this.logger.warn("Failed to refresh tokens", {
        error: (error as Error).message,
      });
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  /**
   * Cerrar sesión de usuario (invalidar tokens)
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    try {
      // Invalidar access token
      await this.blacklistToken(accessToken);

      this.logger.info("User logged out successfully", { userId });
    } catch (error) {
      this.logger.error("Failed to logout", error as Error);
      throw error;
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);

      // Por seguridad, siempre retornar éxito aunque el email no exista
      if (!user) {
        this.logger.warn("Password reset requested for non-existent email", {
          email,
        });
        return;
      }

      // Generar token de reset (válido por 15 minutos)
      const resetToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: "password-reset",
        },
        {
          secret: JWT_SECRET,
          expiresIn: "15m",
        },
      );

      // Guardar token en Redis con TTL de 15 minutos (900 segundos)
      const resetKey = `${REDIS_PREFIXES.PASSWORD_RESET}:${user.id}`;
      await this.redisService.setString(resetKey, resetToken, 900);

      // TODO: Enviar email con link de reset
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      this.logger.info("Password reset requested", {
        userId: user.id,
        email: user.email,
      });
    } catch (error) {
      this.logger.error("Failed to process forgot password", error as Error);
      // No lanzar error por seguridad
    }
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Validar token
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        type: string;
      }>(token, { secret: JWT_SECRET });

      if (payload.type !== "password-reset") {
        throw new BadRequestException("Invalid reset token");
      }

      // Verificar que el token existe en Redis
      const resetKey = `${REDIS_PREFIXES.PASSWORD_RESET}:${payload.sub}`;
      const storedToken = await this.redisService.get<string>(resetKey);

      if (!storedToken || storedToken !== token) {
        throw new BadRequestException("Reset token has expired or is invalid");
      }

      // Obtener usuario
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      // Hash nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

      // Actualizar contraseña
      await this.userRepository.updatePassword(user.id, hashedPassword);

      // Eliminar token de reset de Redis
      await this.redisService.del(resetKey);

      this.logger.info("Password reset successfully", {
        userId: user.id,
      });
    } catch (error) {
      this.logger.error("Failed to reset password", error as Error);
      throw new BadRequestException("Invalid or expired reset token");
    }
  }

  /**
   * Agregar token a blacklist
   */
  private async blacklistToken(token: string): Promise<void> {
    try {
      // Decodificar token para obtener TTL
      const payload = (await this.jwtService.decode(token)) as any;
      const exp = payload?.exp;

      if (!exp) {
        return;
      }

      // Calcular TTL (tiempo hasta expiración)
      const now = Math.floor(Date.now() / 1000);
      const ttl = exp - now;

      if (ttl > 0) {
        const blacklistKey = `${REDIS_PREFIXES.TOKEN_BLACKLIST}:${token}`;
        await this.redisService.setString(blacklistKey, "true", ttl);
      }
    } catch (error) {
      this.logger.error("Failed to blacklist token", error as Error);
    }
  }

  /**
   * Verificar si un token está en blacklist
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = `${REDIS_PREFIXES.TOKEN_BLACKLIST}:${token}`;
      const result = await this.redisService.getString(blacklistKey);
      return result === "true";
    } catch (error) {
      this.logger.error("Failed to check token blacklist", error as Error);
      return false;
    }
  }

  /**
   * Validar o crear usuario SSO (Google Workspace)
   */
  async validateOrCreateSSOUser(ssoData: {
    ssoProvider: string;
    ssoProviderId: string;
    email: string;
    firstName: string;
    lastName: string;
    ssoEmail: string;
    ssoPhotoUrl?: string;
  }): Promise<AuthTokens> {
    try {
      // Buscar usuario por SSO provider
      let user = await this.userRepository.findBySSOProvider(
        ssoData.ssoProvider,
        ssoData.ssoProviderId,
      );

      if (user) {
        // Usuario SSO existente - actualizar info y generar tokens
        user.updateSSOInfo(
          ssoData.ssoProvider,
          ssoData.ssoProviderId,
          ssoData.ssoEmail,
          ssoData.ssoPhotoUrl,
        );
        user.updateLastLogin();

        await this.userRepository.update(user.id, {
          ssoProvider: user.ssoProvider,
          ssoProviderId: user.ssoProviderId,
          ssoEmail: user.ssoEmail,
          ssoPhotoUrl: user.ssoPhotoUrl,
          lastLogin: user.lastLogin,
        });

        this.logger.info("SSO user logged in", {
          userId: user.id,
          email: user.email,
          provider: ssoData.ssoProvider,
        });

        return this.generateTokens(user);
      }

      // Buscar usuario por email (puede existir sin SSO)
      user = await this.userRepository.findByEmail(ssoData.email);

      if (user) {
        // Usuario existe sin SSO - vincular SSO
        user.updateSSOInfo(
          ssoData.ssoProvider,
          ssoData.ssoProviderId,
          ssoData.ssoEmail,
          ssoData.ssoPhotoUrl,
        );
        user.verifyEmail(); // Auto-verificar email con SSO
        user.updateLastLogin();

        await this.userRepository.update(user.id, {
          ssoProvider: user.ssoProvider,
          ssoProviderId: user.ssoProviderId,
          ssoEmail: user.ssoEmail,
          ssoPhotoUrl: user.ssoPhotoUrl,
          isEmailVerified: true,
          lastLogin: user.lastLogin,
        });

        this.logger.info("Linked SSO to existing user", {
          userId: user.id,
          email: user.email,
          provider: ssoData.ssoProvider,
        });

        return this.generateTokens(user);
      }

      // Usuario no existe - crear nuevo con SSO
      const roles = this.assignRolesByDomain(ssoData.email);

      const newUser = new UserEntity(
        "", // ID será asignado por MongoDB
        ssoData.email,
        undefined, // Sin password para usuarios SSO
        ssoData.firstName,
        ssoData.lastName,
        roles,
        [], // Sin permisos adicionales por defecto
        true, // Activo
        true, // Email verificado automáticamente con SSO
        ssoData.ssoProvider,
        ssoData.ssoProviderId,
        ssoData.ssoEmail,
        ssoData.ssoPhotoUrl,
        false, // twoFactorEnabled
        undefined, // twoFactorSecret
        [], // twoFactorBackupCodes
        new Date(), // lastLogin
        undefined, // passwordChangedAt
      );

      const createdUser = await this.userRepository.create(newUser);

      this.logger.info("Created new SSO user", {
        userId: createdUser.id,
        email: createdUser.email,
        provider: ssoData.ssoProvider,
        roles: createdUser.roles,
      });

      return this.generateTokens(createdUser);
    } catch (error) {
      this.logger.error(
        "Failed to validate or create SSO user",
        error as Error,
      );
      throw new BadRequestException("Failed to authenticate with SSO");
    }
  }

  /**
   * Asignar roles automáticamente basados en el dominio del email
   */
  private assignRolesByDomain(email: string): string[] {
    const domain = email.split("@")[1];
    const allowedDomains = process.env.GOOGLE_ALLOWED_DOMAINS?.split(",") || [
      "ufps.edu.co",
    ];

    // Verificar que el dominio esté permitido
    if (!allowedDomains.includes(domain)) {
      return ["STUDENT"]; // Por defecto estudiante si no está en dominio permitido
    }

    // Para @ufps.edu.co, asignar rol basado en patrones comunes
    // Por defecto, todos los usuarios de @ufps.edu.co son estudiantes
    // Los administradores deben ser asignados manualmente
    return ["STUDENT"];
  }
}
