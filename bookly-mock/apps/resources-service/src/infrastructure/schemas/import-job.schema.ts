import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ImportJobDocument = ImportJob & Document;

@Schema({ timestamps: true })
export class ImportJob {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true })
  totalRows: number;

  @Prop({ default: 0 })
  processedRows: number;

  @Prop({ default: 0 })
  successCount: number;

  @Prop({ default: 0 })
  errorCount: number;

  @Prop({ type: String, default: "PENDING" })
  status: string;

  @Prop({ required: true })
  mode: string;

  @Prop({ type: [String], default: [] })
  errors: string[];

  @Prop({ type: [String], default: [] })
  resourceIds: string[];

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: Object })
  audit?: any;
}

export const ImportJobSchema = SchemaFactory.createForClass(ImportJob);

// Indexes
ImportJobSchema.index({ userId: 1, status: 1 });
ImportJobSchema.index({ createdAt: -1 });
