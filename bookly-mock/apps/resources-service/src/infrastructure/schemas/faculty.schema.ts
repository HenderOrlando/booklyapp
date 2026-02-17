import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FacultyDocument = Faculty & Document;

/**
 * Faculty MongoDB Schema
 * Schema de Mongoose para la colección de facultades
 */
@Schema({ timestamps: true, collection: "faculties" })
export class Faculty {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

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

export const FacultySchema = SchemaFactory.createForClass(Faculty);

// Indexes
FacultySchema.index({ code: 1 }, { unique: true });
FacultySchema.index({ name: 1 });
FacultySchema.index({ ownerId: 1 });
FacultySchema.index({ isActive: 1 });
FacultySchema.index({ createdAt: -1 });
