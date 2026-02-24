import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ReferenceDataDocument = ReferenceData & Document;

/**
 * ReferenceData MongoDB Schema
 * Schema reutilizable para datos de referencia dinámicos (tipos, estados, categorías).
 * Cada microservicio registra esta colección en su propia base de datos.
 */
@Schema({ timestamps: true, collection: "reference_data" })
export class ReferenceData {
  @Prop({ required: true, trim: true, lowercase: true })
  group: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: String, trim: true })
  color?: string;

  @Prop({ type: String, trim: true })
  icon?: string;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({
    type: {
      createdBy: { type: String, required: true },
      updatedBy: String,
    },
    _id: false,
  })
  audit?: {
    createdBy: string;
    updatedBy?: string;
  };
}

export const ReferenceDataSchema = SchemaFactory.createForClass(ReferenceData);

// Indexes
ReferenceDataSchema.index({ group: 1, code: 1 }, { unique: true });
ReferenceDataSchema.index({ group: 1 });
ReferenceDataSchema.index({ isActive: 1 });
ReferenceDataSchema.index({ group: 1, order: 1 });
