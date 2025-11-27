import {
  DocumentTemplateFormat,
  DocumentTemplateType,
} from "@libs/common/enums";
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
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop({
    required: true,
    enum: Object.values(DocumentTemplateType),
    index: true,
  })
  type: DocumentTemplateType;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: String })
  template: string;

  @Prop({ type: [String], required: true })
  variables: string[];

  @Prop({ required: true, default: true, index: true })
  isActive: boolean;

  @Prop({
    enum: Object.values(DocumentTemplateFormat),
    default: DocumentTemplateFormat.PDF,
  })
  format: DocumentTemplateFormat;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: AuditInfoSchema })
  audit?: AuditInfoSchema;
}

export const DocumentTemplateSchema =
  SchemaFactory.createForClass(DocumentTemplate);

// Indexes
DocumentTemplateSchema.index({ name: 1 }, { unique: true });
DocumentTemplateSchema.index({ type: 1, isActive: 1 });
DocumentTemplateSchema.index({ isActive: 1 });
DocumentTemplateSchema.index({ createdAt: -1 });
