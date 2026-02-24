import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ReservationDocument = Reservation & Document;

/**
 * Reservation Schema
 * Schema de MongoDB para reservas
 */
@Schema({
  collection: "reservations",
  timestamps: true,
  versionKey: false,
})
export class Reservation {
  @Prop({ type: String, required: true, index: true })
  tenantId: string;

  @Prop({ type: Types.ObjectId, required: true })
  resourceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  programId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  approvalRequestId?: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ required: true })
  purpose: string;

  @Prop({ type: String, default: "PENDING" })
  status: string;

  @Prop({ type: Boolean, default: false })
  isRecurring: boolean;

  @Prop({ type: String })
  seriesId?: string;

  @Prop({ type: Types.ObjectId })
  parentReservationId?: Types.ObjectId;

  @Prop({ type: Number })
  instanceNumber?: number;

  @Prop({
    type: {
      frequency: { type: String },
      interval: Number,
      endDate: Date,
      occurrences: Number,
      daysOfWeek: [Number],
      monthDay: Number,
    },
    required: false,
  })
  recurringPattern?: {
    frequency: string;
    interval: number;
    endDate?: Date;
    occurrences?: number;
    daysOfWeek?: number[];
    monthDay?: number;
  };

  @Prop({
    type: [
      {
        date: Date,
        reason: String,
        modifiedTo: Date,
      },
    ],
    default: [],
  })
  exceptions?: {
    date: Date;
    reason: string;
    modifiedTo?: Date;
  }[];

  @Prop({
    type: [
      {
        userId: Types.ObjectId,
        name: String,
        email: String,
      },
    ],
    default: [],
  })
  participants: {
    userId: string;
    name: string;
    email: string;
  }[];

  @Prop()
  notes?: string;

  @Prop({ type: Date })
  checkInTime?: Date;

  @Prop({ type: Date })
  checkOutTime?: Date;

  @Prop()
  externalCalendarId?: string;

  @Prop()
  externalCalendarEventId?: string;

  @Prop({ type: String })
  resourceName?: string;

  @Prop({ type: String })
  userName?: string;

  @Prop({ type: String })
  userEmail?: string;

  @Prop({
    type: {
      createdBy: Types.ObjectId,
      updatedBy: Types.ObjectId,
      cancelledBy: Types.ObjectId,
      cancelledAt: Date,
      cancellationReason: String,
    },
    required: true,
  })
  audit: {
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    cancelledBy?: Types.ObjectId;
    cancelledAt?: Date;
    cancellationReason?: string;
  };

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

// Índices para mejorar performance (Multi-tenant awareness)
ReservationSchema.index({ tenantId: 1, resourceId: 1, startDate: 1, endDate: 1 });
ReservationSchema.index({ tenantId: 1, userId: 1, status: 1 });
ReservationSchema.index({ tenantId: 1, status: 1 });
ReservationSchema.index({ tenantId: 1, startDate: 1, endDate: 1 });
ReservationSchema.index({ tenantId: 1, externalCalendarId: 1, externalCalendarEventId: 1 });
ReservationSchema.index({ tenantId: 1, seriesId: 1 });
ReservationSchema.index({ tenantId: 1, isRecurring: 1 });
ReservationSchema.index({ tenantId: 1, programId: 1 });
ReservationSchema.index({ tenantId: 1, approvalRequestId: 1 });
