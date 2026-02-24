import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { TenantNotificationConfigEntity } from "../domain/entities/tenant-notification-config.entity";
import { TenantNotificationConfigRepository } from "../infrastructure/repositories/tenant-notification-config.repository";
import {
  DEFAULT_NOTIFICATION_CONFIG,
  TenantNotificationConfig,
} from "./config/tenant-notification.config";

const logger = createLogger("TenantNotificationConfigService");

/**
 * Tenant Notification Configuration Service
 * Servicio para gestionar configuraciones de notificación por tenant con persistencia MongoDB
 */
@Injectable()
export class TenantNotificationConfigService {
  private tenantConfigs: Map<string, TenantNotificationConfig> = new Map();

  constructor(private readonly repository: TenantNotificationConfigRepository) {
    // Cargar configuración por defecto
    this.tenantConfigs.set("default", DEFAULT_NOTIFICATION_CONFIG);
    logger.info("Tenant notification configuration service initialized");
    this.loadConfigurations();
  }

  /**
   * Obtener configuración de un tenant
   */
  async getTenantConfig(tenantId: string): Promise<TenantNotificationConfig> {
    // Primero revisar cache
    const cached = this.tenantConfigs.get(tenantId);
    if (cached) {
      return cached;
    }

    // Buscar en base de datos
    const entity = await this.repository.findByTenantId(tenantId);
    if (entity) {
      const config = this.entityToConfig(entity);
      this.tenantConfigs.set(tenantId, config);
      return config;
    }

    // Si no existe configuración específica, usar la por defecto
    logger.warn(`No config found for tenant ${tenantId}, using default`);
    return DEFAULT_NOTIFICATION_CONFIG;
  }

  /**
   * Convertir entidad a configuración
   */
  private entityToConfig(
    entity: TenantNotificationConfigEntity
  ): TenantNotificationConfig {
    return {
      tenantId: entity.tenantId,
      email: entity.emailProvider as any,
      sms: entity.smsProvider as any,
      whatsapp: entity.whatsappProvider as any,
    };
  }

  /**
   * Configurar un tenant
   */
  async setTenantConfig(
    tenantId: string,
    config: TenantNotificationConfig
  ): Promise<void> {
    // Actualizar cache
    this.tenantConfigs.set(tenantId, config);

    // Persistir en base de datos
    const entity = new TenantNotificationConfigEntity(
      undefined as any,
      tenantId,
      config.email,
      config.sms,
      config.whatsapp
    );

    const existing = await this.repository.findByTenantId(tenantId);
    if (existing) {
      await this.repository.update(tenantId, entity);
    } else {
      await this.repository.create(entity);
    }

    logger.info(`Tenant config persisted for ${tenantId}`);
  }

  /**
   * Eliminar configuración de un tenant
   */
  async deleteTenantConfig(tenantId: string): Promise<void> {
    this.tenantConfigs.delete(tenantId);
    await this.repository.delete(tenantId);
    logger.info(`Tenant config deleted from DB for ${tenantId}`);
  }

  /**
   * Listar todos los tenants configurados
   */
  async listTenants(): Promise<string[]> {
    return Array.from(this.tenantConfigs.keys());
  }

  /**
   * Verificar si un tenant tiene configuración
   */
  async hasTenantConfig(tenantId: string): Promise<boolean> {
    return this.tenantConfigs.has(tenantId);
  }

  /**
   * Obtener configuración por defecto
   */
  getDefaultConfig(): TenantNotificationConfig {
    return DEFAULT_NOTIFICATION_CONFIG;
  }

  /**
   * Cargar configuraciones desde base de datos
   */
  async loadConfigurations(): Promise<void> {
    try {
      logger.info("Loading tenant configurations from database...");

      const entities = await this.repository.findAll(true);
      entities.forEach((entity) => {
        const config = this.entityToConfig(entity);
        this.tenantConfigs.set(entity.tenantId, config);
      });

      logger.info(
        `Loaded ${entities.length} tenant configurations from MongoDB`
      );
    } catch (error) {
      logger.error("Error loading configurations from database", error);
    }
  }

  /**
   * Guardar configuración en base de datos
   * TODO: Implementar persistencia en MongoDB
   */
  async saveConfiguration(config: TenantNotificationConfig): Promise<void> {
    logger.info(`Saving configuration for tenant ${config.tenantId}`);

    // TODO: Implementar guardado en base de datos
    // await this.configRepository.save(config);

    this.tenantConfigs.set(config.tenantId, config);
  }
}
