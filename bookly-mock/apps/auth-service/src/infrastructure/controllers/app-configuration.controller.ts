import {
  UpdateAppConfigCommand,
  UpdateStorageConfigCommand,
} from "@auth/application/commands/app-config.commands";
import {
  GetAppConfigQuery,
  GetPublicAppConfigQuery,
  GetStorageConfigQuery,
} from "@auth/application/queries/app-config.queries";
import { ResponseUtil } from "@libs/common";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

/**
 * AppConfiguration Controller
 * Controlador para la configuración global de Bookly.
 * Solo GENERAL_ADMIN puede modificar la configuración.
 * El endpoint /public es accesible sin autenticación.
 */
@ApiTags("App Configuration")
@Controller("app-config")
export class AppConfigurationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Obtener configuración pública (sin auth)
   * Retorna solo los campos necesarios para el frontend antes del login.
   */
  @Get("public")
  @ApiOperation({
    summary: "Obtener configuración pública",
    description:
      "Retorna configuración pública sin autenticación: theme, locale, registro habilitado, SSO habilitado",
  })
  @ApiResponse({ status: 200, description: "Configuración pública obtenida" })
  async getPublicConfig() {
    const config = await this.queryBus.execute(new GetPublicAppConfigQuery());
    return ResponseUtil.success(config, "Public configuration retrieved");
  }

  /**
   * Obtener configuración completa (GENERAL_ADMIN)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("GENERAL_ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obtener configuración completa",
    description: "Retorna toda la configuración de la aplicación (solo admin)",
  })
  @ApiResponse({ status: 200, description: "Configuración obtenida" })
  @ApiResponse({ status: 403, description: "No tiene permisos" })
  async getConfig() {
    const config = await this.queryBus.execute(new GetAppConfigQuery(false));
    return ResponseUtil.success(config, "Configuration retrieved");
  }

  /**
   * Actualizar configuración (GENERAL_ADMIN)
   */
  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("GENERAL_ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Actualizar configuración",
    description: "Actualiza la configuración de la aplicación (solo admin)",
  })
  @ApiResponse({ status: 200, description: "Configuración actualizada" })
  @ApiResponse({ status: 403, description: "No tiene permisos" })
  async updateConfig(
    @Body()
    dto: {
      registrationEnabled?: boolean;
      corporateAuthEnabled?: boolean;
      allowedDomains?: string[];
      autoRegisterOnSSO?: boolean;
      themeMode?: string;
      primaryColor?: string;
      secondaryColor?: string;
      defaultLocale?: string;
      supportedLocales?: string[];
      appName?: string;
      appLogoUrl?: string;
      maintenanceMode?: boolean;
    },
    @CurrentUser("sub") userId: string,
  ) {
    const command = new UpdateAppConfigCommand(userId, dto);
    const updated = await this.commandBus.execute(command);
    return ResponseUtil.success(updated, "Configuration updated successfully");
  }

  /**
   * Obtener configuración de storage (GENERAL_ADMIN)
   */
  @Get("storage")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("GENERAL_ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obtener configuración de storage",
    description: "Retorna provider y config de storage (secrets masked)",
  })
  @ApiResponse({ status: 200, description: "Storage config obtenida" })
  async getStorageConfig() {
    const config = await this.queryBus.execute(new GetStorageConfigQuery());
    return ResponseUtil.success(config, "Storage configuration retrieved");
  }

  /**
   * Actualizar configuración de storage (GENERAL_ADMIN)
   * Secrets are never logged. Fallback to local if config is incomplete.
   */
  @Put("storage")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("GENERAL_ADMIN")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Actualizar configuración de storage",
    description: "Configura provider de storage (local/s3/gcs). Solo admin.",
  })
  @ApiResponse({ status: 200, description: "Storage config actualizada" })
  async updateStorageConfig(
    @Body()
    dto: {
      storageProvider: "local" | "s3" | "gcs";
      storageS3Config?: {
        bucket?: string;
        region?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        endpoint?: string;
      };
      storageGcsConfig?: {
        bucket?: string;
        projectId?: string;
        keyFilePath?: string;
        clientEmail?: string;
        privateKey?: string;
      };
    },
    @CurrentUser("sub") userId: string,
  ) {
    const command = new UpdateStorageConfigCommand(
      userId,
      dto.storageProvider,
      dto.storageS3Config,
      dto.storageGcsConfig,
    );
    const updated = await this.commandBus.execute(command);
    return ResponseUtil.success(
      updated,
      "Storage configuration updated successfully",
    );
  }
}
