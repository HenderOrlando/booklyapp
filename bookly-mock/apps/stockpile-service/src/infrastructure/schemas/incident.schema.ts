import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { IncidentSeverity, IncidentStatus } from "@stockpile/domain/entities/incident.entity";

/**
 * Schema de MongoDB para Incidencias
 */
@Schema({
  collection: 'incidents',
  timestamps: true,
  versionKey: false,
})
export class Incident extends Document {
  @Prop({ type: String, required: false })
  checkInOutId?: string;

  @Prop({ type: String, required: true, index: true })
  resourceId: string;

  @Prop({ type: String, required: true })
  reportedBy: string;

  @Prop({
    type: String,
    enum: Object.values(IncidentSeverity),
    required: true,
    index: true,
  })
  severity: IncidentSeverity;

  @Prop({
    type: String,
    enum: Object.values(IncidentStatus),
    required: true,
    default: IncidentStatus.PENDING,
    index: true,
  })
  status: IncidentStatus;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Date, required: true, default: Date.now, index: true })
  reportedAt: Date;

  @Prop({ type: Date, required: false })
  resolvedAt?: Date;

  @Prop({ type: String, required: false })
  resolvedBy?: string;

  @Prop({ type: String, required: false })
  resolution?: string;

  @Prop({ type: String, required: false })
  location?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, any>;
}

export const IncidentSchema = SchemaFactory.createForClass(Incident);

// Índices compuestos
IncidentSchema.index({ resourceId: 1, status: 1 });
IncidentSchema.index({ status: 1, severity: 1 });
IncidentSchema.index({ reportedAt: 1, status: 1 });
IncidentSchema.index({ checkInOutId: 1 }, { sparse: true });
