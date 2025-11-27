import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type PermissionDocument = Permission & Document;

/**
 * Permission MongoDB Schema
 * Schema de Mongoose para la colección de permisos
 */
@Schema({ timestamps: true, collection: "permissions" })
export class Permission {
  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  resource: string;

  @Prop({ required: true, trim: true })
  action: string;

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
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Indexes
PermissionSchema.index({ code: 1 }, { unique: true });
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ isActive: 1 });
