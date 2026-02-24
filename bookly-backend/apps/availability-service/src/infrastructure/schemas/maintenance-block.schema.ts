import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MaintenanceBlockDocument = MaintenanceBlock & Document;

/**
 * Maintenance Block Schema
 * Schema de MongoDB para bloqueos por mantenimiento de recursos
 * Permite programar y gestionar períodos de mantenimiento
 */
@Schema({
  collection: "maintenance_blocks",
  timestamps: true,
  versionKey: false,
})
export class MaintenanceBlock {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ type: String })
  resourceName?: string; // Nombre del recurso (desnormalizado para facilitar queries)

  @Prop({ type: String, required: true })
  title: string; // Título descriptivo del mantenimiento

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: String, default: "SCHEDULED" })
  status: string;

  @Prop({ type: Boolean, default: false })
  notifyUsers: boolean; // Si notificar a usuarios con reservas afectadas

  @Prop({ type: [String], default: [] })
  affectedReservations: string[]; // IDs de reservas afectadas

  @Prop({ type: String })
  notes?: string;

  @Prop({
    type: {
      createdBy: { type: Types.ObjectId, required: true },
      updatedBy: Types.ObjectId,
      completedBy: Types.ObjectId,
      cancelledBy: Types.ObjectId,
    },
    required: true,
  })
  audit: {
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    completedBy?: Types.ObjectId;
    cancelledBy?: Types.ObjectId;
  };

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Date })
  cancelledAt?: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const MaintenanceBlockSchema =
  SchemaFactory.createForClass(MaintenanceBlock);

// Índices para búsquedas eficientes
MaintenanceBlockSchema.index({ resourceId: 1, startDate: 1, endDate: 1 });
MaintenanceBlockSchema.index({ status: 1 });
MaintenanceBlockSchema.index({ startDate: 1, endDate: 1 });
MaintenanceBlockSchema.index({ "audit.createdBy": 1 });
