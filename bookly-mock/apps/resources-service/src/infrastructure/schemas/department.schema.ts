import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type DepartmentDocument = Department & Document;

/**
 * Department MongoDB Schema
 * Schema de Mongoose para la colección de departamentos
 */
@Schema({ timestamps: true, collection: "departments" })
export class Department {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: String, required: true })
  facultyId: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, trim: true })
  ownerName?: string;

  @Prop({ type: String, trim: true })
  ownerEmail?: string;

  @Prop({ default: true })
  isActive: boolean;

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

export const DepartmentSchema = SchemaFactory.createForClass(Department);

// Indexes
DepartmentSchema.index({ code: 1 }, { unique: true });
DepartmentSchema.index({ name: 1 });
DepartmentSchema.index({ facultyId: 1 });
DepartmentSchema.index({ ownerId: 1 });
DepartmentSchema.index({ isActive: 1 });
DepartmentSchema.index({ createdAt: -1 });
