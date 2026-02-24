import { CheckInOutStatus, CheckInOutType } from "@libs/common/enums";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

/**
 * Resource Condition Schema
 */
export class ResourceCondition {
  @Prop()
  beforeCheckIn?: string;

  @Prop()
  afterCheckOut?: string;

  @Prop({ default: false })
  damageReported: boolean;

  @Prop()
  damageDescription?: string;
}

/**
 * Check-in/Check-out Schema
 * Schema de MongoDB para registro de entrada/salida
 */
@Schema({ collection: "check_in_outs", timestamps: true })
export class CheckInOut extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  reservationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  resourceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    enum: CheckInOutStatus,
    default: CheckInOutStatus.CHECKED_IN,
    index: true,
  })
  status: CheckInOutStatus;

  // Check-in fields
  @Prop({ index: true })
  checkInTime?: Date;

  @Prop({ type: Types.ObjectId })
  checkInBy?: Types.ObjectId;

  @Prop({ enum: CheckInOutType })
  checkInType?: CheckInOutType;

  @Prop()
  checkInNotes?: string;

  // Check-out fields
  @Prop({ index: true })
  checkOutTime?: Date;

  @Prop({ type: Types.ObjectId })
  checkOutBy?: Types.ObjectId;

  @Prop({ enum: CheckInOutType })
  checkOutType?: CheckInOutType;

  @Prop()
  checkOutNotes?: string;

  // Time tracking
  @Prop({ index: true })
  expectedReturnTime?: Date;

  @Prop()
  actualReturnTime?: Date;

  // Resource condition
  @Prop({ type: ResourceCondition })
  resourceCondition?: ResourceCondition;

  // Metadata (incluye qrCode, rfidTag, location, deviceInfo, etc.)
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // Timestamps automáticos
  createdAt?: Date;
  updatedAt?: Date;
}

export const CheckInOutSchema = SchemaFactory.createForClass(CheckInOut);

// Indexes para optimización de consultas
CheckInOutSchema.index({ reservationId: 1 }, { unique: true });
CheckInOutSchema.index({ resourceId: 1, status: 1 });
CheckInOutSchema.index({ userId: 1, status: 1 });
CheckInOutSchema.index({ status: 1, expectedReturnTime: 1 });
CheckInOutSchema.index({ checkInTime: -1 });
CheckInOutSchema.index({ checkOutTime: -1 });
CheckInOutSchema.index({ "resourceCondition.damageReported": 1 });
CheckInOutSchema.index(
  { "metadata.qrCode": 1 },
  { unique: true, sparse: true }
);
CheckInOutSchema.index({ "metadata.rfidTag": 1 });
