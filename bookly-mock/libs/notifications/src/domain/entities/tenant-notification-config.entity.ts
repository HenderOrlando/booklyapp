/**
 * Tenant Notification Configuration Entity
 * Entidad de dominio para configuraciones de notificación por tenant
 */
export class TenantNotificationConfigEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly emailProvider?: {
      provider: string;
      from: string;
      config: Record<string, any>;
    },
    public readonly smsProvider?: {
      provider: string;
      from: string;
      config: Record<string, any>;
    },
    public readonly whatsappProvider?: {
      provider: string;
      from: string;
      config: Record<string, any>;
    },
    public readonly isActive: boolean = true,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly createdBy?: string,
    public readonly updatedBy?: string
  ) {}

  /**
   * Activar configuración
   */
  activate(): TenantNotificationConfigEntity {
    return new TenantNotificationConfigEntity(
      this.id,
      this.tenantId,
      this.emailProvider,
      this.smsProvider,
      this.whatsappProvider,
      true,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.updatedBy
    );
  }

  /**
   * Desactivar configuración
   */
  deactivate(): TenantNotificationConfigEntity {
    return new TenantNotificationConfigEntity(
      this.id,
      this.tenantId,
      this.emailProvider,
      this.smsProvider,
      this.whatsappProvider,
      false,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.updatedBy
    );
  }

  /**
   * Actualizar configuración de email
   */
  updateEmailProvider(config: {
    provider: string;
    from: string;
    config: Record<string, any>;
  }): TenantNotificationConfigEntity {
    return new TenantNotificationConfigEntity(
      this.id,
      this.tenantId,
      config,
      this.smsProvider,
      this.whatsappProvider,
      this.isActive,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.updatedBy
    );
  }

  /**
   * Actualizar configuración de SMS
   */
  updateSmsProvider(config: {
    provider: string;
    from: string;
    config: Record<string, any>;
  }): TenantNotificationConfigEntity {
    return new TenantNotificationConfigEntity(
      this.id,
      this.tenantId,
      this.emailProvider,
      config,
      this.whatsappProvider,
      this.isActive,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.updatedBy
    );
  }

  /**
   * Actualizar configuración de WhatsApp
   */
  updateWhatsAppProvider(config: {
    provider: string;
    from: string;
    config: Record<string, any>;
  }): TenantNotificationConfigEntity {
    return new TenantNotificationConfigEntity(
      this.id,
      this.tenantId,
      this.emailProvider,
      this.smsProvider,
      config,
      this.isActive,
      this.createdAt,
      new Date(),
      this.createdBy,
      this.updatedBy
    );
  }

  /**
   * Verificar si tiene configuración de email
   */
  hasEmailProvider(): boolean {
    return !!this.emailProvider;
  }

  /**
   * Verificar si tiene configuración de SMS
   */
  hasSmsProvider(): boolean {
    return !!this.smsProvider;
  }

  /**
   * Verificar si tiene configuración de WhatsApp
   */
  hasWhatsAppProvider(): boolean {
    return !!this.whatsappProvider;
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      emailProvider: this.emailProvider,
      smsProvider: this.smsProvider,
      whatsappProvider: this.whatsappProvider,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };
  }
}
