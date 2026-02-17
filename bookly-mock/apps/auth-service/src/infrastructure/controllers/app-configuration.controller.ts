import { ResponseUtil } from "@libs/common";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Model } from "mongoose";
import {
  AppConfiguration,
  AppConfigurationDocument,
} from "../schemas/app-configuration.schema";

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
    @InjectModel(AppConfiguration.name)
    private readonly configModel: Model<AppConfigurationDocument>,
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
    const config = await this.getOrCreateConfig();
    return ResponseUtil.success(
      {
        registrationEnabled: config.registrationEnabled,
        corporateAuthEnabled: config.corporateAuthEnabled,
        themeMode: config.themeMode,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        defaultLocale: config.defaultLocale,
        supportedLocales: config.supportedLocales,
        appName: config.appName,
        appLogoUrl: config.appLogoUrl,
        maintenanceMode: config.maintenanceMode,
      },
      "Public configuration retrieved",
    );
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
    const config = await this.getOrCreateConfig();
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
    const config = await this.getOrCreateConfig();
    const updateData: Record<string, any> = { updatedBy: userId };

    if (dto.registrationEnabled !== undefined)
      updateData.registrationEnabled = dto.registrationEnabled;
    if (dto.corporateAuthEnabled !== undefined)
      updateData.corporateAuthEnabled = dto.corporateAuthEnabled;
    if (dto.allowedDomains !== undefined)
      updateData.allowedDomains = dto.allowedDomains;
    if (dto.autoRegisterOnSSO !== undefined)
      updateData.autoRegisterOnSSO = dto.autoRegisterOnSSO;
    if (dto.themeMode !== undefined) updateData.themeMode = dto.themeMode;
    if (dto.primaryColor !== undefined)
      updateData.primaryColor = dto.primaryColor;
    if (dto.secondaryColor !== undefined)
      updateData.secondaryColor = dto.secondaryColor;
    if (dto.defaultLocale !== undefined)
      updateData.defaultLocale = dto.defaultLocale;
    if (dto.supportedLocales !== undefined)
      updateData.supportedLocales = dto.supportedLocales;
    if (dto.appName !== undefined) updateData.appName = dto.appName;
    if (dto.appLogoUrl !== undefined) updateData.appLogoUrl = dto.appLogoUrl;
    if (dto.maintenanceMode !== undefined)
      updateData.maintenanceMode = dto.maintenanceMode;

    const updated = await this.configModel
      .findByIdAndUpdate(config._id, { $set: updateData }, { new: true })
      .exec();

    return ResponseUtil.success(updated, "Configuration updated successfully");
  }

  /**
   * Obtener o crear configuración por defecto (singleton)
   */
  private async getOrCreateConfig(): Promise<AppConfigurationDocument> {
    let config = await this.configModel.findOne().exec();
    if (!config) {
      config = await new this.configModel({}).save();
    }
    return config;
  }
}
