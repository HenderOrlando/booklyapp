import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ReservationHistoryDocument = ReservationHistory & Document;

/**
 * Reservation History Schema
 * Registro completo de auditoría para reservas
 */
@Schema({
  collection: "reservation_history",
  timestamps: false, // Usamos nuestro propio timestamp
  versionKey: false,
})
export class ReservationHistory {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  reservationId: Types.ObjectId;

  @Prop({ required: true, index: true })
  action: string; // CREATED, UPDATED, CANCELLED, CHECKED_IN, CHECKED_OUT, NO_SHOW

  @Prop({ type: Object })
  beforeData?: Record<string, any>;

  @Prop({ type: Object, required: true })
  afterData: Record<string, any>;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop()
  location?: string;

  @Prop({ type: Date, required: true, index: true })
  timestamp: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ReservationHistorySchema =
  SchemaFactory.createForClass(ReservationHistory);

// Índices compuestos para queries comunes
ReservationHistorySchema.index({ reservationId: 1, timestamp: -1 });
ReservationHistorySchema.index({ userId: 1, timestamp: -1 });
ReservationHistorySchema.index({ action: 1, timestamp: -1 });
