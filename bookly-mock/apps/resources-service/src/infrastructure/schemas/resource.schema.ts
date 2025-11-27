import { ResourceStatus, ResourceType } from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ResourceDocument = Resource & Document;

/**
 * Resource MongoDB Schema
 * Schema de Mongoose para la colección de recursos
 */
@Schema({ timestamps: true, collection: "resources" })
export class Resource {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(ResourceType),
    required: true,
  })
  type: ResourceType;

  @Prop({ required: true, type: String })
  categoryId: string;

  @Prop({ required: true, type: Number, min: 1 })
  capacity: number;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ type: String, trim: true })
  floor?: string;

  @Prop({ type: String, trim: true })
  building?: string;

  @Prop({ type: Object, default: {} })
  attributes: Record<string, any>;

  @Prop({ type: [String], default: [] })
  programIds: string[];

  @Prop({
    type: String,
    enum: Object.values(ResourceStatus),
    default: ResourceStatus.AVAILABLE,
  })
  status: ResourceStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: {
      nextMaintenanceDate: Date,
      lastMaintenanceDate: Date,
      maintenanceFrequencyDays: Number,
    },
    _id: false,
  })
  maintenanceSchedule?: {
    nextMaintenanceDate?: Date;
    lastMaintenanceDate?: Date;
    maintenanceFrequencyDays?: number;
  };

  @Prop({
    type: {
      requiresApproval: { type: Boolean, default: false },
      maxAdvanceBookingDays: { type: Number, default: 30 },
      minBookingDurationMinutes: { type: Number, default: 30 },
      maxBookingDurationMinutes: { type: Number, default: 480 },
      allowRecurring: { type: Boolean, default: true },
    },
    _id: false,
  })
  availabilityRules?: {
    requiresApproval: boolean;
    maxAdvanceBookingDays: number;
    minBookingDurationMinutes: number;
    maxBookingDurationMinutes: number;
    allowRecurring: boolean;
  };

  @Prop({
    type: {
      createdBy: { type: String, required: true },
      updatedBy: String,
      deletedBy: String,
    },
    _id: false,
  })
  audit?: {
    createdBy: string;
    updatedBy?: string;
    deletedBy?: string;
  };

  @Prop({ type: Date, default: null })
  deletedAt?: Date;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

// Indexes
ResourceSchema.index({ code: 1 }, { unique: true });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ categoryId: 1 });
ResourceSchema.index({ programIds: 1 });
ResourceSchema.index({ status: 1 });
ResourceSchema.index({ isActive: 1 });
ResourceSchema.index({ location: 1 });
ResourceSchema.index({ building: 1 });
ResourceSchema.index({ createdAt: -1 });
