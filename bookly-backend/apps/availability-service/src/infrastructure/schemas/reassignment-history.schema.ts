import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ReassignmentHistoryDocument = ReassignmentHistory & Document;

/**
 * Reassignment History Schema
 * Historial de reasignaciones automáticas de recursos
 */
@Schema({
  collection: "reassignment_history",
  timestamps: true,
  versionKey: false,
})
export class ReassignmentHistory {
  @Prop({ type: Types.ObjectId, required: true })
  originalReservationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  originalResourceId: Types.ObjectId;

  @Prop({ type: String })
  originalResourceName?: string;

  @Prop({ type: Types.ObjectId, required: true })
  newResourceId: Types.ObjectId;

  @Prop({ type: String })
  newResourceName?: string;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId; // Usuario afectado

  @Prop({ type: String, required: true })
  reason: string; // MAINTENANCE, UNAVAILABLE, USER_REQUEST, etc.

  @Prop({ type: Number, required: true })
  similarityScore: number; // Score de similitud 0-100

  @Prop({
    type: {
      capacity: Number,
      features: Number,
      location: Number,
      availability: Number,
      total: Number,
    },
    required: true,
  })
  scoreBreakdown: {
    capacity: number; // Score de capacidad
    features: number; // Score de características
    location: number; // Score de ubicación
    availability: number; // Score de disponibilidad
    total: number; // Score total
  };

  @Prop({ type: [String], default: [] })
  alternativesConsidered: string[]; // IDs de otros recursos considerados

  @Prop({ type: Boolean, required: true })
  accepted: boolean; // Si el usuario aceptó o rechazó

  @Prop({ type: String })
  userFeedback?: string; // Comentarios del usuario

  @Prop({ type: Boolean, default: false })
  notificationSent: boolean;

  @Prop({ type: Date })
  notifiedAt?: Date;

  @Prop({ type: Date })
  respondedAt?: Date; // Cuándo respondió el usuario

  @Prop({ type: Types.ObjectId })
  processedBy?: Types.ObjectId; // Admin que procesó manualmente (si aplica)

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReassignmentHistorySchema =
  SchemaFactory.createForClass(ReassignmentHistory);

// Índices
ReassignmentHistorySchema.index({ originalReservationId: 1 });
ReassignmentHistorySchema.index({ userId: 1 });
ReassignmentHistorySchema.index({ originalResourceId: 1 });
ReassignmentHistorySchema.index({ newResourceId: 1 });
ReassignmentHistorySchema.index({ accepted: 1 });
ReassignmentHistorySchema.index({ createdAt: -1 });
ReassignmentHistorySchema.index({ reason: 1 });
