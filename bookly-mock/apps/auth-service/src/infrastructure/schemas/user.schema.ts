import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

/**
 * User MongoDB Schema
 * Schema de Mongoose para la colección de usuarios
 */
@Schema({ timestamps: true, collection: "users" })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  })
  username?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ type: [String], default: ["STUDENT"] })
  roles: string[];

  @Prop({ type: [String], default: [] })
  roleIds: string[]; // ObjectIds de documentos Role

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ required: true, default: "UFPS", trim: true })
  tenantId: string;

  // Document Information
  @Prop({ type: String, enum: ["CC", "TI", "CE", "PASSPORT"] })
  documentType?: string;

  @Prop({ type: String, trim: true })
  documentNumber?: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({
    type: {
      language: { type: String, default: "es" },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      timezone: { type: String, default: "America/Bogota" },
    },
    _id: false,
  })
  preferences?: {
    language: string;
    theme: "light" | "dark" | "system";
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    timezone?: string;
  };

  // Academic Program Relations
  @Prop({ type: String })
  programId?: string; // ObjectId del programa al que pertenece

  @Prop({ type: String })
  coordinatedProgramId?: string; // ObjectId del programa que coordina (solo coordinadores)

  // SSO Fields
  @Prop({ type: String, enum: ["google", "microsoft"], required: false })
  ssoProvider?: string;

  @Prop({ type: String, required: false })
  ssoProviderId?: string;

  @Prop({ type: String, required: false })
  ssoEmail?: string;

  @Prop({ type: String, required: false })
  ssoPhotoUrl?: string;

  // Two-Factor Authentication Fields
  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ type: String, required: false })
  twoFactorSecret?: string;

  @Prop({ type: [String], default: [] })
  twoFactorBackupCodes: string[];

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ type: Date })
  passwordChangedAt?: Date;

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

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes (email and username already have unique indexes from @Prop decorators)
UserSchema.index({ roles: 1 });
UserSchema.index({ roleIds: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ ssoProviderId: 1, ssoProvider: 1 }, { sparse: true });
UserSchema.index({ programId: 1 });
UserSchema.index({ coordinatedProgramId: 1 });
UserSchema.index(
  { documentType: 1, documentNumber: 1 },
  { sparse: true, unique: true },
);
