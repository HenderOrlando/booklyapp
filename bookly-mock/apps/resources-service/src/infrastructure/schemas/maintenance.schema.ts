import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MaintenanceDocument = Maintenance & Document;

/**
 * Maintenance MongoDB Schema
 * Schema de Mongoose para la colección de mantenimientos
 */
@Schema({ timestamps: true, collection: "maintenances" })
export class Maintenance {
  @Prop({ required: true, type: String })
  resourceId: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, type: Date })
  scheduledStartDate: Date;

  @Prop({ required: true, type: Date })
  scheduledEndDate: Date;

  @Prop({ type: Date })
  actualStartDate?: Date;

  @Prop({ type: Date })
  actualEndDate?: Date;

  @Prop({ type: String, default: "SCHEDULED" })
  status: string;

  @Prop({ type: String, trim: true })
  performedBy?: string;

  @Prop({ type: Number, min: 0 })
  cost?: number;

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({ default: true })
  affectsAvailability: boolean;

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
}

export const MaintenanceSchema = SchemaFactory.createForClass(Maintenance);

// Indexes
MaintenanceSchema.index({ resourceId: 1 });
MaintenanceSchema.index({ type: 1 });
MaintenanceSchema.index({ status: 1 });
MaintenanceSchema.index({ scheduledStartDate: 1 });
MaintenanceSchema.index({ scheduledEndDate: 1 });
MaintenanceSchema.index({ createdAt: -1 });
