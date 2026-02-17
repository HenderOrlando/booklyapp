import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoleDocument = Role & Document;

/**
 * Role MongoDB Schema
 * Schema de Mongoose para la colección de roles
 */
@Schema({ timestamps: true, collection: "roles" })
export class Role {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ required: true, trim: true })
  displayName: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // Códigos de permisos (para compatibilidad)

  @Prop({ type: [String], default: [] })
  permissionIds: string[]; // ObjectIds de documentos Permission

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDefault: boolean;

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
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ isActive: 1 });
RoleSchema.index({ isDefault: 1 });
RoleSchema.index({ permissionIds: 1 });
