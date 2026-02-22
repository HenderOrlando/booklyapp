import { ChangePasswordCommand } from "@auth/application/commands/change-password.command";
import { Disable2FACommand } from "@auth/application/commands/disable-2fa.command";
import { Enable2FACommand } from "@auth/application/commands/enable-2fa.command";
import { ForgotPasswordCommand } from "@auth/application/commands/forgot-password.command";
import { LoginUserCommand } from "@auth/application/commands/login-user.command";
import { LogoutCommand } from "@auth/application/commands/logout.command";
import { RefreshTokenCommand } from "@auth/application/commands/refresh-token.command";
import { RegenerateBackupCodesCommand } from "@auth/application/commands/regenerate-backup-codes.command";
import { RegisterUserCommand } from "@auth/application/commands/register-user.command";
import { ResetPasswordCommand } from "@auth/application/commands/reset-password.command";
import { Setup2FACommand } from "@auth/application/commands/setup-2fa.command";
import { EvaluatePermissionsQuery } from "@auth/application/queries/evaluate-permissions.query";
import { IntrospectTokenQuery } from "@auth/application/queries/introspect-token.query";
import { ValidateTokenQuery } from "@auth/application/queries/validate-token.query";
import { AppConfigurationService } from "@auth/application/services/app-configuration.service";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Audit, AuditAction } from "@reports/audit-decorators";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { EvaluatePermissionsDto } from "../dto/evaluate-permissions.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { IntrospectTokenDto } from "../dto/introspect-token.dto";
import { LoginDto } from "../dto/login.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { RegisterDto } from "../dto/register.dto";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import {
  Enable2FADto,
  LoginWith2FADto,
  UseBackupCodeDto,
} from "../dto/two-factor.dto";
import { ValidateTokenDto } from "../dto/validate-token.dto";

/**
 * Auth Controller
 * Controlador para endpoints de autenticación
 */
@ApiTags("Autenticación")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly appConfigService: AppConfigurationService,
  ) {}

  /**
   * Registrar nuevo usuario
   */
  @Post("register")
  @Audit({
    entityType: "USER",
    action: AuditAction.CREATED,
    excludeFields: ["password"],
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Registrar nuevo usuario",
    description:
      "Crea una nueva cuenta de usuario en el sistema con los datos proporcionados",
  })
  @ApiResponse({
    status: 201,
    description: "Usuario registrado exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          id: "507f1f77bcf86cd799439011",
          email: "user@ufps.edu.co",
          firstName: "Juan",
          lastName: "Pérez",
          roles: ["STUDENT"],
          isActive: true,
          isEmailVerified: false,
        },
        message: "Usuario registrado exitosamente",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos",
  })
  @ApiResponse({
    status: 403,
    description: "El registro de usuarios está deshabilitado",
  })
  @ApiResponse({
    status: 409,
    description: "El email ya está registrado",
  })
  async register(@Body() dto: RegisterDto) {
    const registrationEnabled =
      await this.appConfigService.isRegistrationEnabled();
    if (!registrationEnabled) {
      throw new ForbiddenException(
        "User registration is currently disabled. Contact your administrator.",
      );
    }

    const command = new RegisterUserCommand(
      {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: dto.roles,
        permissions: dto.permissions,
        username: dto.username,
        phone: dto.phone,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        tenantId: dto.tenantId,
        programId: dto.programId,
        coordinatedProgramId: dto.coordinatedProgramId,
      },
      "system",
    );

    const user = await this.commandBus.execute(command);

    return ResponseUtil.success(user, "Usuario registrado exitosamente");
  }

  /**
   * Iniciar sesión
   */
  @Post("login")
  @Audit({
    entityType: "USER",
    action: AuditAction.LOGIN,
    excludeFields: ["password", "accessToken", "refreshToken"],
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Iniciar sesión",
    description: "Autentica un usuario y retorna tokens JWT",
  })
  @ApiResponse({
    status: 200,
    description: "Inicio de sesión exitoso",
    schema: {
      example: {
        success: true,
        data: {
          user: {
            id: "507f1f77bcf86cd799439011",
            email: "user@ufps.edu.co",
            firstName: "Juan",
            lastName: "Pérez",
            roles: ["STUDENT"],
            permissions: [],
          },
          tokens: {
            accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
        message: "Inicio de sesión exitoso",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Credenciales inválidas o cuenta inactiva",
  })
  async login(@Body() dto: LoginDto) {
    const command = new LoginUserCommand(dto.email, dto.password);

    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(result, "Inicio de sesión exitoso");
  }

  /**
   * Cambiar contraseña
   */
  @Post("change-password")
  @Audit({
    entityType: "USER",
    action: AuditAction.UPDATED,
    excludeFields: ["currentPassword", "newPassword"],
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cambiar contraseña",
    description: "Permite a un usuario autenticado cambiar su contraseña",
  })
  @ApiResponse({
    status: 200,
    description: "Contraseña cambiada exitosamente",
    schema: {
      example: {
        success: true,
        message: "Contraseña cambiada exitosamente",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado o contraseña actual incorrecta",
  })
  async changePassword(
    @CurrentUser("sub") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const command = new ChangePasswordCommand(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );

    await this.commandBus.execute(command);

    return ResponseUtil.success(undefined, "Contraseña cambiada exitosamente");
  }

  /**
   * Renovar access token
   */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renovar access token",
    description:
      "Genera nuevos tokens usando un refresh token válido. Implementa token rotation por seguridad.",
  })
  @ApiResponse({
    status: 200,
    description: "Tokens renovados exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        message: "Tokens renovados exitosamente",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token inválido o expirado",
  })
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const command = new RefreshTokenCommand(dto.refreshToken);

    const tokens = await this.commandBus.execute(command);

    return ResponseUtil.success(tokens, "Tokens renovados exitosamente");
  }

  /**
   * Cerrar sesión
   */
  @Post("logout")
  @Audit({
    entityType: "USER",
    action: AuditAction.LOGOUT,
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cerrar sesión",
    description:
      "Invalida el access token del usuario agregándolo a la blacklist",
  })
  @ApiResponse({
    status: 200,
    description: "Sesión cerrada exitosamente",
    schema: {
      example: {
        success: true,
        message: "Sesión cerrada exitosamente",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado",
  })
  async logout(
    @CurrentUser("sub") userId: string,
    @Headers("authorization") authorization: string,
  ) {
    // Extraer token del header "Bearer <token>"
    const accessToken = authorization?.replace("Bearer ", "") || "";

    const command = new LogoutCommand(userId, accessToken);

    await this.commandBus.execute(command);

    return ResponseUtil.success(undefined, "Sesión cerrada exitosamente");
  }

  /**
   * Solicitar recuperación de contraseña
   */
  @Post("forgot-password")
  @Audit({
    entityType: "USER",
    action: AuditAction.ACCESSED,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Solicitar recuperación de contraseña",
    description:
      "Genera un token de recuperación y lo envía al email del usuario (si existe)",
  })
  @ApiResponse({
    status: 200,
    description: "Email de recuperación enviado (si el usuario existe)",
    schema: {
      example: {
        success: true,
        message:
          "Si el email existe, recibirás instrucciones para restablecer tu contraseña",
      },
    },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const command = new ForgotPasswordCommand(dto.email);

    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(undefined, result.message);
  }

  /**
   * Restablecer contraseña
   */
  @Post("reset-password")
  @Audit({
    entityType: "USER",
    action: AuditAction.PASSWORD_RESET,
    excludeFields: ["newPassword"],
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Restablecer contraseña",
    description: "Restablece la contraseña usando el token de recuperación",
  })
  @ApiResponse({
    status: 200,
    description: "Contraseña restablecida exitosamente",
    schema: {
      example: {
        success: true,
        message: "Contraseña restablecida exitosamente",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Token de reset inválido o expirado",
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const command = new ResetPasswordCommand(dto.token, dto.newPassword);

    await this.commandBus.execute(command);

    return ResponseUtil.success(
      undefined,
      "Contraseña restablecida exitosamente",
    );
  }

  /**
   * Validar token JWT
   */
  @Get("validate-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Validar token JWT",
    description:
      "Verifica si un token JWT es válido y retorna el payload decodificado",
  })
  @ApiResponse({
    status: 200,
    description: "Token válido",
    schema: {
      example: {
        success: true,
        data: {
          sub: "507f1f77bcf86cd799439011",
          email: "user@ufps.edu.co",
          roles: ["STUDENT"],
          permissions: [],
        },
        message: "Token válido",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Token inválido o expirado",
  })
  async validateToken(@Body() dto: ValidateTokenDto) {
    const query = new ValidateTokenQuery(dto.token);

    const payload = await this.queryBus.execute(query);

    return ResponseUtil.success(payload, "Token válido");
  }

  // ==================== Internal Contract (inter-service) ====================

  /**
   * Introspect token — resolves full user identity from DB (not just JWT claims).
   * Used by other microservices to validate tokens and get authoritative user data.
   */
  @Post("introspect")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Introspect JWT token",
    description:
      "Validates a JWT token and returns the full user identity resolved from the database. " +
      "Used by other microservices for authoritative identity resolution.",
  })
  @ApiResponse({
    status: 200,
    description: "Token introspection result",
    schema: {
      example: {
        success: true,
        data: {
          active: true,
          sub: "507f1f77bcf86cd799439011",
          email: "admin@ufps.edu.co",
          firstName: "Admin",
          lastName: "User",
          roles: ["GENERAL_ADMIN"],
          permissions: ["*:*"],
          isActive: true,
          is2FAEnabled: false,
        },
        message: "Token introspected successfully",
      },
    },
  })
  async introspectToken(@Body() dto: IntrospectTokenDto) {
    const query = new IntrospectTokenQuery(dto.token);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, "Token introspected successfully");
  }

  /**
   * Evaluate permissions — checks if a user has a specific permission.
   * Used by other microservices for fine-grained RBAC checks against auth-service as SoT.
   */
  @Post("evaluate-permissions")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Evaluate user permissions",
    description:
      "Checks if a user has permission to perform a specific action on a resource. " +
      "Resolves from DB (authoritative), supports wildcards (*:*).",
  })
  @ApiResponse({
    status: 200,
    description: "Permission evaluation result",
    schema: {
      example: {
        success: true,
        data: {
          allowed: true,
          userId: "507f1f77bcf86cd799439011",
          resource: "reservation",
          action: "create",
          matchedRoles: ["GENERAL_ADMIN"],
          matchedPermissions: ["*:*"],
          policyVersion: "1.0.0",
        },
        message: "Permission evaluated",
      },
    },
  })
  async evaluatePermissions(@Body() dto: EvaluatePermissionsDto) {
    const query = new EvaluatePermissionsQuery(
      dto.userId,
      dto.resource,
      dto.action,
      dto.context,
    );
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, "Permission evaluated");
  }

  // ==================== Two-Factor Authentication ====================

  /**
   * Generar configuración 2FA (Setup)
   */
  @Post("2fa/setup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Generar configuración 2FA",
    description:
      "Genera secret TOTP, QR code y códigos de backup para habilitar 2FA",
  })
  @ApiResponse({
    status: 200,
    description: "Configuración 2FA generada exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          secret: "JBSWY3DPEHPK3PXP",
          qrCode: "data:image/png;base64,iVBORw0KGgoAAAANS...",
          backupCodes: [
            "A1B2C3D4",
            "E5F6G7H8",
            "I9J0K1L2",
            "M3N4O5P6",
            "Q7R8S9T0",
            "U1V2W3X4",
            "Y5Z6A7B8",
            "C9D0E1F2",
            "G3H4I5J6",
            "K7L8M9N0",
          ],
        },
        message: "Escanea el código QR con tu aplicación de autenticación",
      },
    },
  })
  async setup2FA(@CurrentUser("sub") userId: string) {
    const command = new Setup2FACommand(userId);
    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      result,
      "Escanea el código QR con tu aplicación de autenticación",
    );
  }

  /**
   * Verificar código TOTP y habilitar 2FA
   */
  @Post("2fa/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Habilitar 2FA",
    description:
      "Verifica el código TOTP y habilita 2FA permanentemente para el usuario",
  })
  @ApiResponse({
    status: 200,
    description: "2FA habilitado exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          backupCodes: [
            "A1B2C3D4",
            "E5F6G7H8",
            "I9J0K1L2",
            "M3N4O5P6",
            "Q7R8S9T0",
            "U1V2W3X4",
            "Y5Z6A7B8",
            "C9D0E1F2",
            "G3H4I5J6",
            "K7L8M9N0",
          ],
        },
        message:
          "2FA habilitado exitosamente. Guarda los códigos de backup en un lugar seguro",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Código de verificación inválido",
  })
  async enable2FA(
    @CurrentUser("sub") userId: string,
    @Body() dto: Enable2FADto,
  ) {
    const command = new Enable2FACommand(userId, dto.token, dto.secret);
    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      result,
      "2FA habilitado exitosamente. Guarda los códigos de backup en un lugar seguro",
    );
  }

  /**
   * Deshabilitar 2FA
   */
  @Post("2fa/disable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Deshabilitar 2FA",
    description: "Deshabilita la autenticación de dos factores para el usuario",
  })
  @ApiResponse({
    status: 200,
    description: "2FA deshabilitado exitosamente",
    schema: {
      example: {
        success: true,
        message: "2FA deshabilitado exitosamente",
      },
    },
  })
  async disable2FA(@CurrentUser("sub") userId: string) {
    const command = new Disable2FACommand(userId);
    await this.commandBus.execute(command);

    return ResponseUtil.success(undefined, "2FA deshabilitado exitosamente");
  }

  /**
   * Completar login con código 2FA
   */
  @Post("login/2fa")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Completar login con 2FA",
    description:
      "Completa el proceso de login verificando el código TOTP de 6 dígitos",
  })
  @ApiResponse({
    status: 200,
    description: "Login exitoso con 2FA",
    schema: {
      example: {
        success: true,
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        message: "Autenticación 2FA exitosa",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Código 2FA inválido o token temporal expirado",
  })
  async loginWith2FA(@Body() dto: LoginWith2FADto) {
    // Llamar directamente al servicio ya que no hay un command específico
    // O puedes crear un LoginWith2FACommand si prefieres mantener CQRS puro
    const authService = this.commandBus["moduleRef"].get("AuthService", {
      strict: false,
    });
    const tokens = await authService.loginWith2FA(dto.tempToken, dto.token);

    return ResponseUtil.success(tokens, "Autenticación 2FA exitosa");
  }

  /**
   * Completar login con código de backup
   */
  @Post("login/backup-code")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Completar login con código de backup",
    description:
      "Completa el proceso de login usando un código de backup de 8 caracteres",
  })
  @ApiResponse({
    status: 200,
    description: "Login exitoso con código de backup",
    schema: {
      example: {
        success: true,
        data: {
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
        message: "Autenticación con código de backup exitosa",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Código de backup inválido o token temporal expirado",
  })
  async loginWithBackupCode(@Body() dto: UseBackupCodeDto) {
    const authService = this.commandBus["moduleRef"].get("AuthService", {
      strict: false,
    });
    const tokens = await authService.loginWithBackupCode(
      dto.tempToken,
      dto.backupCode,
    );

    return ResponseUtil.success(
      tokens,
      "Autenticación con código de backup exitosa",
    );
  }

  /**
   * Regenerar códigos de backup
   */
  @Post("2fa/regenerate-backup-codes")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Regenerar códigos de backup",
    description: "Genera nuevos códigos de backup reemplazando los anteriores",
  })
  @ApiResponse({
    status: 200,
    description: "Códigos de backup regenerados exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          backupCodes: [
            "A1B2C3D4",
            "E5F6G7H8",
            "I9J0K1L2",
            "M3N4O5P6",
            "Q7R8S9T0",
            "U1V2W3X4",
            "Y5Z6A7B8",
            "C9D0E1F2",
            "G3H4I5J6",
            "K7L8M9N0",
          ],
        },
        message: "Códigos de backup regenerados exitosamente",
      },
    },
  })
  async regenerateBackupCodes(@CurrentUser("sub") userId: string) {
    const command = new RegenerateBackupCodesCommand(userId);
    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      result,
      "Códigos de backup regenerados exitosamente",
    );
  }
}
