import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Provider Configuration Schema
 * Esquema para configuración de un proveedor de notificación
 */
@Schema({ _id: false })
export class ProviderConfig {
  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  from: string;

  @Prop({ type: Object, required: true })
  config: Record<string, any>;
}

const ProviderConfigSchema = SchemaFactory.createForClass(ProviderConfig);

/**
 * Tenant Notification Config Schema
 * Esquema MongoDB para configuraciones de notificación por tenant
 */
@Schema({ collection: "tenant_notification_configs", timestamps: true })
export class TenantNotificationConfig extends Document {
  @Prop({ required: true, unique: true, index: true })
  tenantId: string;

  @Prop({ type: ProviderConfigSchema })
  emailProvider?: ProviderConfig;

  @Prop({ type: ProviderConfigSchema })
  smsProvider?: ProviderConfig;

  @Prop({ type: ProviderConfigSchema })
  whatsappProvider?: ProviderConfig;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

export const TenantNotificationConfigSchema = SchemaFactory.createForClass(
  TenantNotificationConfig
);

// Índices
TenantNotificationConfigSchema.index({ tenantId: 1 }, { unique: true });
TenantNotificationConfigSchema.index({ isActive: 1 });
TenantNotificationConfigSchema.index({ createdAt: -1 });
