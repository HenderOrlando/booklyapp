import { ExceptionReason } from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AvailabilityExceptionDocument = AvailabilityException & Document;

/**
 * Availability Exception Schema
 * Schema de MongoDB para excepciones de disponibilidad de recursos
 * Permite bloquear o habilitar recursos en fechas específicas
 */
@Schema({
  collection: "availability_exceptions",
  timestamps: true,
  versionKey: false,
})
export class AvailabilityException {
  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  exceptionDate: Date;

  @Prop({
    type: String,
    enum: Object.values(ExceptionReason),
    required: true,
  })
  reason: ExceptionReason;

  @Prop({ type: String })
  customReason?: string; // Razón personalizada si reason === CUSTOM

  @Prop({ type: Boolean, default: false })
  isAvailable: boolean; // false = bloqueado, true = disponible excepcionalmente

  @Prop({ type: String })
  startTime?: string; // HH:mm - Opcional para bloqueos parciales

  @Prop({ type: String })
  endTime?: string; // HH:mm - Opcional para bloqueos parciales

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Types.ObjectId, required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const AvailabilityExceptionSchema = SchemaFactory.createForClass(
  AvailabilityException
);

// Índices compuestos para búsquedas eficientes
AvailabilityExceptionSchema.index(
  { resourceId: 1, exceptionDate: 1 },
  { unique: true }
);
AvailabilityExceptionSchema.index({ exceptionDate: 1 });
AvailabilityExceptionSchema.index({ reason: 1 });
AvailabilityExceptionSchema.index({ isAvailable: 1 });
