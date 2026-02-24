import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Audit Info
 */
export class AuditInfoSchema {
  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  updatedBy?: Types.ObjectId;
}

/**
 * Document Template Schema
 * Schema de MongoDB para plantillas de documentos (RF-21)
 */
@Schema({ collection: "document_templates", timestamps: true })
export class DocumentTemplate extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, index: true })
  type: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: String })
  template: string;

  @Prop({ type: [String], required: true })
  variables: string[];

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ type: String, default: "PDF" })
  format: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: AuditInfoSchema })
  audit?: AuditInfoSchema;
}

export const DocumentTemplateSchema =
  SchemaFactory.createForClass(DocumentTemplate);

// Indexes (name already has unique index from @Prop decorator)
DocumentTemplateSchema.index({ type: 1, isActive: 1 });
DocumentTemplateSchema.index({ isActive: 1 });
DocumentTemplateSchema.index({ createdAt: -1 });
