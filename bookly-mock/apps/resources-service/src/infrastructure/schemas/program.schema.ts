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
  coordinatorId?: string; // User ID del coordinador

  @Prop({ type: String, trim: true })
  coordinatorName?: string; // Nombre del coordinador (cache)

  @Prop({ type: String, trim: true })
  coordinatorEmail?: string; // Email del coordinador (cache)

  @Prop({ type: String, trim: true })
  faculty?: string; // Facultad a la que pertenece

  @Prop({ type: String, trim: true })
  department?: string; // Departamento

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
ProgramSchema.index({ coordinatorId: 1 });
ProgramSchema.index({ faculty: 1 });
ProgramSchema.index({ department: 1 });
ProgramSchema.index({ isActive: 1 });
ProgramSchema.index({ createdAt: -1 });
