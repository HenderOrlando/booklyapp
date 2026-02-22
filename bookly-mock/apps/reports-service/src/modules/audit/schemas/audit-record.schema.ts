import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Schema de MongoDB para registros de auditoría
 * Compatible con IAuditRecord de @reports/audit-decorators
 */
@Schema({
  collection: "audit_records",
  timestamps: true,
  versionKey: false,
})
export class AuditRecord extends Document {
  /**
   * ID del recurso auditado
   */
  @Prop({ required: true, index: true })
  entityId: string;

  /**
   * Tipo de entidad auditada
   */
  @Prop({ required: true, index: true })
  entityType: string;

  /**
   * Acción realizada
   */
  @Prop({ required: true, index: true })
  action: string;

  /**
   * Estado anterior del recurso
   */
  @Prop({ type: Object })
  beforeData?: Record<string, any>;

  /**
   * Estado nuevo del recurso
   */
  @Prop({ type: Object })
  afterData?: Record<string, any>;

  /**
   * ID del usuario que realizó la acción
   */
  @Prop({ required: true, index: true })
  userId: string;

  /**
   * IP del cliente
   */
  @Prop()
  ip?: string;

  /**
   * User-Agent del navegador
   */
  @Prop()
  userAgent?: string;

  /**
   * Geolocalización
   */
  @Prop()
  location?: string;

  /**
   * Timestamp de la acción
   */
  @Prop({ required: true, index: true })
  timestamp: Date;

  /**
   * Nombre del microservicio que emite el evento
   */
  @Prop({ required: true, index: true })
  serviceName: string;

  /**
   * Metadatos adicionales
   */
  @Prop({
    type: {
      source: {
        type: String,
        required: true,
      },
      method: { type: String },
      url: { type: String },
      eventName: { type: String },
      controller: { type: String },
      handler: { type: String },
    },
    required: true,
  })
  metadata: {
    source: string;
    method?: string;
    url?: string;
    eventName?: string;
    controller?: string;
    handler?: string;
    [key: string]: any;
  };
}

export const AuditRecordSchema = SchemaFactory.createForClass(AuditRecord);

// Índices compuestos para queries comunes
AuditRecordSchema.index({ entityType: 1, timestamp: -1 });
AuditRecordSchema.index({ userId: 1, timestamp: -1 });
AuditRecordSchema.index({ serviceName: 1, timestamp: -1 });
AuditRecordSchema.index({ "metadata.source": 1, timestamp: -1 });
