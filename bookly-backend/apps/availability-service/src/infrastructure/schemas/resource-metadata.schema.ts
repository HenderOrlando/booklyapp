import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Resource Metadata Schema
 * Cache local de metadatos de recursos sincronizado via Kafka eventos
 */
@Schema({
  collection: "resource_metadata",
  timestamps: true,
})
export class ResourceMetadata {
  @Prop({ required: true, unique: true })
  resourceId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  type: string;

  @Prop({ required: true, default: 0 })
  capacity: number;

  @Prop({ index: true })
  location?: string;

  @Prop({ type: [String], default: [] })
  features: string[];

  @Prop({ index: true })
  program?: string;

  @Prop({ required: true, index: true })
  status: string;

  @Prop()
  categoryId?: string;

  @Prop()
  categoryCode?: string;

  @Prop()
  lastSyncedAt: Date;
}

export type ResourceMetadataDocument = ResourceMetadata & Document;
export const ResourceMetadataSchema =
  SchemaFactory.createForClass(ResourceMetadata);

// Índices compuestos para búsquedas avanzadas
ResourceMetadataSchema.index({ type: 1, status: 1 });
ResourceMetadataSchema.index({ capacity: 1, status: 1 });
ResourceMetadataSchema.index({ program: 1, status: 1 });
ResourceMetadataSchema.index({ location: 1, status: 1 });
