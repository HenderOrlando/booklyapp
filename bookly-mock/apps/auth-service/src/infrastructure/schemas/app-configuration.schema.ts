import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AppConfigurationDocument = AppConfiguration & Document;

/**
 * AppConfiguration MongoDB Schema
 * Configuración global de la aplicación Bookly.
 * Solo existe un documento en la colección (singleton).
 * Gestionado exclusivamente por GENERAL_ADMIN.
 */
@Schema({ timestamps: true, collection: "app_configuration" })
export class AppConfiguration {
  @Prop({ default: true })
  registrationEnabled: boolean;

  @Prop({ default: true })
  corporateAuthEnabled: boolean;

  @Prop({ type: [String], default: ["ufps.edu.co"] })
  allowedDomains: string[];

  @Prop({ default: true })
  autoRegisterOnSSO: boolean;

  @Prop({ type: String, default: "system" })
  themeMode: string;

  @Prop({ type: String, default: "#3B82F6" })
  primaryColor: string;

  @Prop({ type: String, default: "#8B5CF6" })
  secondaryColor: string;

  @Prop({ type: String, default: "es" })
  defaultLocale: string;

  @Prop({ type: [String], default: ["es", "en"] })
  supportedLocales: string[];

  @Prop({ type: String, default: "Bookly UFPS" })
  appName: string;

  @Prop({ type: String, default: "" })
  logoLightUrl: string;

  @Prop({ type: String, default: "" })
  logoDarkUrl: string;

  @Prop({ type: String, default: "" })
  faviconUrl: string;

  @Prop({ type: String, default: "America/Bogota" })
  timezone: string;

  @Prop({
    type: {
      enableNotifications: { type: Boolean, default: true },
      enableRealtime: { type: Boolean, default: true },
    },
    _id: false,
    default: {
      enableNotifications: true,
      enableRealtime: true,
    },
  })
  features?: {
    enableNotifications?: boolean;
    enableRealtime?: boolean;
  };

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop({ type: String, default: "local", enum: ["local", "s3", "gcs"] })
  storageProvider: string;

  @Prop({
    type: {
      bucket: String,
      region: String,
      accessKeyId: String,
      secretAccessKey: String,
      endpoint: String,
    },
    _id: false,
    default: {},
  })
  storageS3Config?: {
    bucket?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
  };

  @Prop({
    type: {
      bucket: String,
      projectId: String,
      keyFilePath: String,
      clientEmail: String,
      privateKey: String,
    },
    _id: false,
    default: {},
  })
  storageGcsConfig?: {
    bucket?: string;
    projectId?: string;
    keyFilePath?: string;
    clientEmail?: string;
    privateKey?: string;
  };

  @Prop({ type: String })
  updatedBy?: string;
}

export const AppConfigurationSchema =
  SchemaFactory.createForClass(AppConfiguration);
