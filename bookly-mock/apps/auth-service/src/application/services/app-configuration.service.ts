import { createLogger } from "@libs/common";
import {
  AppConfiguration,
  AppConfigurationDocument,
} from "@auth/infrastructure/schemas/app-configuration.schema";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

/**
 * AppConfigurationService
 * Servicio para acceder a la configuración global de Bookly.
 * Implementa un patrón singleton: si no existe configuración, crea una con valores por defecto.
 */
@Injectable()
export class AppConfigurationService {
  private readonly logger = createLogger("AppConfigurationService");

  constructor(
    @InjectModel(AppConfiguration.name)
    private readonly configModel: Model<AppConfigurationDocument>,
  ) {}

  /**
   * Obtener la configuración actual (o crear si no existe)
   */
  async getConfig(): Promise<AppConfigurationDocument> {
    let config = await this.configModel.findOne().exec();
    if (!config) {
      config = await new this.configModel({}).save();
      this.logger.info("Default AppConfiguration created");
    }
    return config;
  }

  /**
   * Verifica si el registro manual está habilitado
   */
  async isRegistrationEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    return config.registrationEnabled;
  }

  /**
   * Verifica si la autenticación corporativa (SSO) está habilitada
   */
  async isCorporateAuthEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    return config.corporateAuthEnabled;
  }

  /**
   * Verifica si el auto-registro por SSO está habilitado
   */
  async isAutoRegisterOnSSOEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    return config.autoRegisterOnSSO;
  }

  /**
   * Obtener los dominios permitidos para SSO.
   * Fallback a variable de entorno si la configuración no tiene dominios.
   */
  async getAllowedDomains(): Promise<string[]> {
    const config = await this.getConfig();
    if (config.allowedDomains && config.allowedDomains.length > 0) {
      return config.allowedDomains;
    }
    return process.env.GOOGLE_ALLOWED_DOMAINS?.split(",") || ["ufps.edu.co"];
  }
}
