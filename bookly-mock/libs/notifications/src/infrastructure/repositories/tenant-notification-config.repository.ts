import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TenantNotificationConfigEntity } from "../../domain/entities/tenant-notification-config.entity";
import { TenantNotificationConfig } from "../schemas/tenant-notification-config.schema";

const logger = createLogger("TenantNotificationConfigRepository");

/**
 * Tenant Notification Config Repository
 * Repositorio para gestionar configuraciones de notificación por tenant
 */
@Injectable()
export class TenantNotificationConfigRepository {
  constructor(
    @InjectModel(TenantNotificationConfig.name)
    private readonly model: Model<TenantNotificationConfig>
  ) {}

  /**
   * Mapear documento de MongoDB a entidad de dominio
   */
  private toEntity(
    doc: TenantNotificationConfig & {
      _id: any;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): TenantNotificationConfigEntity {
    return new TenantNotificationConfigEntity(
      doc._id.toString(),
      doc.tenantId,
      doc.emailProvider
        ? {
            provider: doc.emailProvider.provider,
            from: doc.emailProvider.from,
            config: doc.emailProvider.config,
          }
        : undefined,
      doc.smsProvider
        ? {
            provider: doc.smsProvider.provider,
            from: doc.smsProvider.from,
            config: doc.smsProvider.config,
          }
        : undefined,
      doc.whatsappProvider
        ? {
            provider: doc.whatsappProvider.provider,
            from: doc.whatsappProvider.from,
            config: doc.whatsappProvider.config,
          }
        : undefined,
      doc.isActive,
      doc.createdAt,
      doc.updatedAt,
      doc.createdBy?.toString(),
      doc.updatedBy?.toString()
    );
  }

  /**
   * Buscar configuración por tenant ID
   */
  async findByTenantId(
    tenantId: string
  ): Promise<TenantNotificationConfigEntity | null> {
    try {
      const doc = await this.model.findOne({ tenantId, isActive: true }).exec();
      return doc ? this.toEntity(doc) : null;
    } catch (error) {
      logger.error(`Error finding config for tenant ${tenantId}`, error);
      return null;
    }
  }

  /**
   * Crear configuración
   */
  async create(
    entity: TenantNotificationConfigEntity
  ): Promise<TenantNotificationConfigEntity> {
    try {
      const doc = new this.model({
        tenantId: entity.tenantId,
        emailProvider: entity.emailProvider,
        smsProvider: entity.smsProvider,
        whatsappProvider: entity.whatsappProvider,
        isActive: entity.isActive,
        createdBy: entity.createdBy,
      });

      const saved = await doc.save();
      logger.info(`Config created for tenant ${entity.tenantId}`);
      return this.toEntity(saved);
    } catch (error) {
      logger.error(
        `Error creating config for tenant ${entity.tenantId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Actualizar configuración
   */
  async update(
    tenantId: string,
    entity: TenantNotificationConfigEntity
  ): Promise<TenantNotificationConfigEntity | null> {
    try {
      const doc = await this.model
        .findOneAndUpdate(
          { tenantId },
          {
            emailProvider: entity.emailProvider,
            smsProvider: entity.smsProvider,
            whatsappProvider: entity.whatsappProvider,
            isActive: entity.isActive,
            updatedBy: entity.updatedBy,
          },
          { new: true }
        )
        .exec();

      if (!doc) {
        return null;
      }

      logger.info(`Config updated for tenant ${tenantId}`);
      return this.toEntity(doc);
    } catch (error) {
      logger.error(`Error updating config for tenant ${tenantId}`, error);
      throw error;
    }
  }

  /**
   * Eliminar configuración
   */
  async delete(tenantId: string): Promise<boolean> {
    try {
      const result = await this.model.deleteOne({ tenantId }).exec();
      logger.info(`Config deleted for tenant ${tenantId}`);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting config for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Listar todos los tenants configurados
   */
  async findAll(
    activeOnly: boolean = true
  ): Promise<TenantNotificationConfigEntity[]> {
    try {
      const filter = activeOnly ? { isActive: true } : {};
      const docs = await this.model.find(filter).sort({ createdAt: -1 }).exec();
      return docs.map((doc) => this.toEntity(doc));
    } catch (error) {
      logger.error("Error listing all configs", error);
      return [];
    }
  }

  /**
   * Contar configuraciones
   */
  async count(activeOnly: boolean = true): Promise<number> {
    try {
      const filter = activeOnly ? { isActive: true } : {};
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      logger.error("Error counting configs", error);
      return 0;
    }
  }

  /**
   * Activar configuración
   */
  async activate(tenantId: string): Promise<boolean> {
    try {
      const result = await this.model
        .updateOne({ tenantId }, { isActive: true })
        .exec();
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error(`Error activating config for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Desactivar configuración
   */
  async deactivate(tenantId: string): Promise<boolean> {
    try {
      const result = await this.model
        .updateOne({ tenantId }, { isActive: false })
        .exec();
      return result.modifiedCount > 0;
    } catch (error) {
      logger.error(`Error deactivating config for tenant ${tenantId}`, error);
      return false;
    }
  }
}
