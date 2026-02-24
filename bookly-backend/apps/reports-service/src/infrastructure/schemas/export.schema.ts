import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Export Schema
 * Schema de Mongoose para exportaciones de reportes
 */
@Schema({ collection: "exports", timestamps: true })
export class Export extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  reportType: string;

  @Prop({ required: true, index: true })
  format: string;

  @Prop({ required: true, index: true, default: "PENDING" })
  status: string;

  @Prop({ required: true, type: Object })
  filters: Record<string, any>;

  @Prop()
  filePath?: string;

  @Prop()
  fileSize?: number;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ required: true, type: Date, default: Date.now, index: true })
  requestedAt: Date;

  @Prop({ type: Date })
  completedAt?: Date;
}

export const ExportSchema = SchemaFactory.createForClass(Export);

// Índices compuestos para búsquedas eficientes
ExportSchema.index({ userId: 1, requestedAt: -1 });
ExportSchema.index({ status: 1, requestedAt: -1 });
ExportSchema.index({ reportType: 1, status: 1 });
