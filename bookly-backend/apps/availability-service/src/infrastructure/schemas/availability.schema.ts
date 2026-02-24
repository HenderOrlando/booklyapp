import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AvailabilityDocument = Availability & Document;

/**
 * Availability Schema
 * Schema de MongoDB para disponibilidad de recursos
 */
@Schema({
  collection: "availabilities",
  timestamps: true,
  versionKey: false,
})
export class Availability {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ type: String, required: true })
  dayOfWeek: string;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ type: Boolean, default: true })
  isAvailable: boolean;

  @Prop({ type: Number, default: 1 })
  maxConcurrentReservations: number;

  @Prop({ type: Date })
  effectiveFrom?: Date;

  @Prop({ type: Date })
  effectiveUntil?: Date;

  @Prop()
  notes?: string;

  @Prop({
    type: {
      createdBy: String,
      updatedBy: String,
    },
    required: true,
  })
  audit: {
    createdBy: string;
    updatedBy?: string;
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

// Índices para mejorar performance
AvailabilitySchema.index({ resourceId: 1, dayOfWeek: 1 });
AvailabilitySchema.index({ resourceId: 1, isAvailable: 1 });
AvailabilitySchema.index({ effectiveFrom: 1, effectiveUntil: 1 });
