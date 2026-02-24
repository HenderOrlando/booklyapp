import { ImportJobStatus, ImportResourceMode } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

/**
 * DTO para validación previa de CSV (dry-run)
 */
export class ValidateImportDto {
  @ApiProperty({
    description: "Contenido del CSV a validar",
    type: String,
  })
  csvContent: string;

  @ApiProperty({
    description: "Modo de importación a simular",
    enum: ImportResourceMode,
    default: ImportResourceMode.CREATE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ImportResourceMode)
  mode?: ImportResourceMode;
}

/**
 * DTO de respuesta para validación
 */
export class ValidationResultDto {
  @ApiProperty({ description: "¿Es válido el CSV?" })
  isValid: boolean;

  @ApiProperty({ description: "Total de filas en el CSV" })
  totalRows: number;

  @ApiProperty({ description: "Filas válidas" })
  validRows: number;

  @ApiProperty({ description: "Filas con errores" })
  invalidRows: number;

  @ApiProperty({ description: "Lista de errores por fila", type: [String] })
  errors: string[];

  @ApiProperty({ description: "Advertencias", type: [String] })
  warnings: string[];
}

/**
 * DTO para iniciar importación asíncrona con archivo
 */
export class StartAsyncImportDto {
  @ApiProperty({
    description: "Modo de importación",
    enum: ImportResourceMode,
    default: ImportResourceMode.CREATE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ImportResourceMode)
  mode?: ImportResourceMode;

  @ApiProperty({
    description: "Continuar aunque haya errores",
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  skipErrors?: boolean;

  @ApiProperty({
    description: "Notificar por email cuando termine",
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnComplete?: boolean;
}

/**
 * DTO de respuesta para job asíncrono
 */
export class ImportJobDto {
  @ApiProperty({ description: "ID del job" })
  id: string;

  @ApiProperty({ description: "ID del usuario" })
  userId: string;

  @ApiProperty({ description: "Nombre del archivo" })
  fileName: string;

  @ApiProperty({ description: "Tamaño del archivo en bytes" })
  fileSize: number;

  @ApiProperty({ description: "Total de filas a procesar" })
  totalRows: number;

  @ApiProperty({ description: "Filas procesadas" })
  processedRows: number;

  @ApiProperty({ description: "Filas exitosas" })
  successCount: number;

  @ApiProperty({ description: "Filas con error" })
  errorCount: number;

  @ApiProperty({ description: "Estado del job", enum: ImportJobStatus })
  status: ImportJobStatus;

  @ApiProperty({ description: "Modo de importación" })
  mode: string;

  @ApiProperty({ description: "Progreso en porcentaje (0-100)" })
  progress: number;

  @ApiProperty({ description: "Errores encontrados", type: [String] })
  errors: string[];

  @ApiProperty({ description: "IDs de recursos creados", type: [String] })
  resourceIds: string[];

  @ApiProperty({ description: "Fecha de inicio", required: false })
  startedAt?: Date;

  @ApiProperty({ description: "Fecha de finalización", required: false })
  completedAt?: Date;

  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;
}

/**
 * DTO para rollback de importación
 */
export class RollbackImportDto {
  @ApiProperty({
    description: "ID del job a revertir",
  })
  jobId: string;

  @ApiProperty({
    description: "Razón del rollback",
    required: false,
  })
  @IsOptional()
  reason?: string;
}

/**
 * DTO de respuesta para rollback
 */
export class RollbackResultDto {
  @ApiProperty({ description: "ID del job revertido" })
  jobId: string;

  @ApiProperty({ description: "Recursos eliminados" })
  deletedCount: number;

  @ApiProperty({ description: "IDs de recursos eliminados", type: [String] })
  deletedResourceIds: string[];

  @ApiProperty({ description: "¿Rollback exitoso?" })
  success: boolean;
}

/**
 * DTO para generar template CSV
 */
export class GenerateTemplateDto {
  @ApiProperty({
    description: "Incluir ejemplos en el template",
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeExamples?: boolean;

  @ApiProperty({
    description: "Código de categoría para generar template específico",
    required: false,
  })
  @IsOptional()
  categoryCode?: string;
}
