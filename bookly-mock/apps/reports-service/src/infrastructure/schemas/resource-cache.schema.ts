import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

/**
 * Resource Cache Schema
 * Cache local de recursos desde events del resources-service
 */
@Schema({ collection: "resource_cache", timestamps: true })
export class ResourceCache extends Document {
  @Prop({ required: true, unique: true })
  resourceId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  description?: string;

  @Prop()
  capacity?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Estadísticas agregadas en tiempo real
  @Prop({ default: 0 })
  totalReservations: number;

  @Prop({ default: 0 })
  confirmedReservations: number;

  @Prop({ default: 0 })
  completedReservations: number;

  @Prop({ default: 0 })
  cancelledReservations: number;

  @Prop({ default: 0 })
  noShowReservations: number;

  @Prop({ default: 0 })
  totalHoursReserved: number;

  @Prop({ default: 0 })
  totalHoursUsed: number;

  @Prop({ default: 0 })
  occupancyRate: number;

  @Prop({ default: 0 })
  averageSessionDuration: number;

  @Prop({ type: [String], default: [] })
  peakUsageHours: string[];

  @Prop({ type: Object, default: {} })
  programsBreakdown: Record<string, number>;

  @Prop({ type: Date })
  lastReservationDate?: Date;
}

export const ResourceCacheSchema = SchemaFactory.createForClass(ResourceCache);

// Índices (resourceId already has unique index from @Prop decorator)
ResourceCacheSchema.index({ type: 1 });
ResourceCacheSchema.index({ isActive: 1 });
ResourceCacheSchema.index({ updatedAt: -1 });
