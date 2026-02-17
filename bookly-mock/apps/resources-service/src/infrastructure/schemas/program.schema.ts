import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProgramDocument = Program & Document;

/**
 * Academic Program MongoDB Schema
 * Schema de Mongoose para programas académicos
 */
@Schema({ timestamps: true, collection: "programs" })
export class Program {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: String })
  ownerId?: string; // User ID del responsable/coordinador del programa

  @Prop({ type: String, trim: true })
  ownerName?: string; // Nombre del responsable (cache)

  @Prop({ type: String, trim: true })
  ownerEmail?: string; // Email del responsable (cache)

  @Prop({ type: String })
  coordinatorId?: string; // Alias legacy — usar ownerId

  @Prop({ type: String, trim: true })
  coordinatorName?: string; // Alias legacy (cache)

  @Prop({ type: String, trim: true })
  coordinatorEmail?: string; // Alias legacy (cache)

  @Prop({ type: String })
  facultyId?: string; // Referencia a Faculty._id

  @Prop({ type: String })
  departmentId?: string; // Referencia a Department._id

  @Prop({ type: String, trim: true })
  faculty?: string; // Legacy — nombre de facultad (cache)

  @Prop({ type: String, trim: true })
  department?: string; // Legacy — nombre de departamento (cache)

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>; // Metadatos adicionales

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

export const ProgramSchema = SchemaFactory.createForClass(Program);

// Indexes
ProgramSchema.index({ code: 1 }, { unique: true });
ProgramSchema.index({ name: 1 });
ProgramSchema.index({ ownerId: 1 });
ProgramSchema.index({ coordinatorId: 1 });
ProgramSchema.index({ facultyId: 1 });
ProgramSchema.index({ departmentId: 1 });
ProgramSchema.index({ faculty: 1 });
ProgramSchema.index({ department: 1 });
ProgramSchema.index({ isActive: 1 });
ProgramSchema.index({ createdAt: -1 });
