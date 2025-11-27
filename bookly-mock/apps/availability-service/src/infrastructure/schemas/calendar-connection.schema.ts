import { OAuthProvider } from "@auth/modules/oauth";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CalendarConnectionDocument = CalendarConnection & Document;

/**
 * Schema para conexiones de calendario externo
 */
@Schema({
  collection: "calendar_connections",
  timestamps: true,
  versionKey: false,
})
export class CalendarConnection {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(OAuthProvider),
    required: true,
  })
  provider: OAuthProvider;

  @Prop({ type: String, required: true })
  externalUserId: string; // ID del usuario en el servicio externo

  @Prop({ type: String, required: true })
  externalEmail: string;

  @Prop({ type: String, required: true })
  accessToken: string; // Encriptado

  @Prop({ type: String, required: true })
  refreshToken: string; // Encriptado

  @Prop({ type: Date, required: true })
  tokenExpiresAt: Date;

  @Prop({ type: String })
  calendarId?: string; // ID del calendario primario

  @Prop({ type: Boolean, default: true })
  syncEnabled: boolean;

  @Prop({ type: Boolean, default: true })
  syncFromExternal: boolean; // Importar eventos externos a Bookly

  @Prop({ type: Boolean, default: true })
  syncToExternal: boolean; // Exportar reservas de Bookly al calendario

  @Prop({ type: Date })
  lastSyncAt?: Date;

  @Prop({ type: String })
  lastSyncStatus?: string;

  @Prop({ type: [String], default: [] })
  syncErrors: string[];

  @Prop({ type: Date })
  connectedAt: Date;

  @Prop({ type: Date })
  disconnectedAt?: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CalendarConnectionSchema =
  SchemaFactory.createForClass(CalendarConnection);

// Índices
CalendarConnectionSchema.index({ userId: 1, provider: 1 }, { unique: true });
CalendarConnectionSchema.index({ externalUserId: 1, provider: 1 });
CalendarConnectionSchema.index({ isActive: 1 });
CalendarConnectionSchema.index({ syncEnabled: 1 });
