import { ImportResourceMode, ResourceType } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from "class-validator";

/**
 * DTO para importación de horarios desde CSV institucional
 * Soporta el formato de horarios UFPS con recursos, reservas recurrentes y docentes
 */
export class ImportScheduleFromCSVDto {
  @ApiProperty({
    description: "Contenido del archivo CSV como texto",
    type: "string",
    example:
      'recurso,edificio,capacidad,dia,hora,programa,materia,docente,estudiantes,title_original\nSA401,SA,25,Martes,06:00-07:00,...',
  })
  @IsNotEmpty({ message: "El contenido CSV es requerido" })
  @IsString()
  csvContent: string;

  @ApiProperty({
    description: "Tipo de recurso a asignar a todos los recursos importados",
    enum: ResourceType,
    example: ResourceType.LABORATORY,
  })
  @IsEnum(ResourceType)
  @IsNotEmpty({ message: "El tipo de recurso es requerido" })
  resourceType: ResourceType;

  @ApiPropertyOptional({
    description:
      "Códigos de categorías a asociar (separados por coma en el CSV o definidos aquí como default)",
    type: [String],
    example: ["SALA-COMPUTO"],
  })
  @IsArray()
  @IsOptional()
  defaultCategoryCodes?: string[];

  @ApiProperty({
    description:
      "Fecha de inicio del rango para reservas recurrentes (ISO 8601). Requerido si el CSV tiene día+hora.",
    example: "2026-02-23T00:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty({
    message:
      "La fecha de inicio de recurrencia es requerida para horarios con día+hora",
  })
  recurrenceStartDate: string;

  @ApiProperty({
    description:
      "Fecha de fin del rango para reservas recurrentes (ISO 8601). Requerido si el CSV tiene día+hora.",
    example: "2026-06-30T23:59:59Z",
  })
  @IsDateString()
  @IsNotEmpty({
    message:
      "La fecha de fin de recurrencia es requerida para horarios con día+hora",
  })
  recurrenceEndDate: string;

  @ApiPropertyOptional({
    description:
      "Modo de importación para recursos: CREATE, UPDATE o UPSERT",
    enum: ImportResourceMode,
    default: ImportResourceMode.UPSERT,
  })
  @IsOptional()
  @IsEnum(ImportResourceMode)
  mode?: ImportResourceMode;

  @ApiPropertyOptional({
    description:
      "Continuar importación aunque haya errores en algunos registros",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  skipErrors?: boolean;

  @ApiPropertyOptional({
    description:
      "Rol por defecto a asignar a los docentes creados automáticamente",
    default: "TEACHER",
  })
  @IsOptional()
  @IsString()
  defaultTeacherRole?: string;

  @ApiPropertyOptional({
    description:
      "Dominio de email institucional para generar emails de docentes (ej: ufps.edu.co)",
    example: "ufps.edu.co",
  })
  @IsOptional()
  @IsString()
  institutionalEmailDomain?: string;
}

/**
 * Resultado de importación de un recurso individual
 */
export class ScheduleImportResourceResultDto {
  @ApiProperty({ description: "Código del recurso" })
  code: string;

  @ApiProperty({ description: "ID del recurso creado/actualizado" })
  resourceId: string;

  @ApiProperty({ description: "Si fue creado (true) o actualizado (false)" })
  created: boolean;
}

/**
 * Resultado de importación de una reserva
 */
export class ScheduleImportReservationResultDto {
  @ApiProperty({ description: "Código del recurso asociado" })
  resourceCode: string;

  @ApiProperty({ description: "Día o fecha de la reserva" })
  schedule: string;

  @ApiProperty({ description: "Propósito/materia" })
  purpose: string;

  @ApiProperty({ description: "Nombre del docente (owner)" })
  teacherName: string;

  @ApiProperty({ description: "Si es recurrente" })
  isRecurring: boolean;

  @ApiPropertyOptional({ description: "ID de la serie recurrente" })
  seriesId?: string;

  @ApiPropertyOptional({ description: "ID de la reserva individual" })
  reservationId?: string;
}

/**
 * Resultado de creación de un docente
 */
export class ScheduleImportTeacherResultDto {
  @ApiProperty({ description: "Nombre completo del docente" })
  fullName: string;

  @ApiProperty({ description: "Email generado/encontrado" })
  email: string;

  @ApiProperty({ description: "ID del usuario" })
  userId: string;

  @ApiProperty({ description: "Si fue creado (true) o encontrado (false)" })
  created: boolean;
}

/**
 * Respuesta completa de importación de horarios
 */
export class ImportScheduleResponseDto {
  @ApiProperty({ description: "Total de filas procesadas del CSV" })
  totalRows: number;

  @ApiProperty({ description: "Recursos procesados" })
  resourcesCreated: number;

  @ApiProperty({ description: "Recursos actualizados" })
  resourcesUpdated: number;

  @ApiProperty({ description: "Reservas creadas" })
  reservationsCreated: number;

  @ApiProperty({ description: "Docentes creados" })
  teachersCreated: number;

  @ApiProperty({ description: "Docentes encontrados existentes" })
  teachersFound: number;

  @ApiProperty({ description: "Programas resueltos" })
  programsResolved: number;

  @ApiProperty({ description: "Errores encontrados" })
  errorCount: number;

  @ApiProperty({
    description: "Lista de errores detallados",
    type: [Object],
  })
  errors: Array<{
    row: number;
    resourceCode?: string;
    error: string;
  }>;

  @ApiProperty({
    description: "Advertencias (ej: docente no especificado)",
    type: [Object],
  })
  warnings: Array<{
    row: number;
    resourceCode?: string;
    warning: string;
  }>;

  @ApiProperty({ description: "Resumen de recursos importados", type: [Object] })
  resources: ScheduleImportResourceResultDto[];

  @ApiProperty({ description: "Resumen de reservas creadas", type: [Object] })
  reservations: ScheduleImportReservationResultDto[];

  @ApiProperty({ description: "Resumen de docentes procesados", type: [Object] })
  teachers: ScheduleImportTeacherResultDto[];

  @ApiProperty({ description: "Tiempo de procesamiento en milisegundos" })
  processingTime: number;
}
