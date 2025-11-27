import { ImportResourceMode } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

/**
 * DTO para importación masiva de recursos desde CSV
 */
export class ImportResourcesDto {
  @ApiProperty({
    description: "Contenido del archivo CSV como texto",
    type: "string",
    example: "code,name,type,category...",
  })
  @IsNotEmpty({ message: "El contenido CSV es requerido" })
  csvContent: string;

  @ApiProperty({
    description:
      "Modo de importación: 'create' solo crea, 'update' actualiza existentes, 'upsert' crea o actualiza",
    enum: ImportResourceMode,
    default: ImportResourceMode.CREATE,
    required: false,
  })
  mode?: ImportResourceMode;

  @ApiProperty({
    description:
      "Continuar importación aunque haya errores en algunos registros",
    default: false,
    required: false,
  })
  skipErrors?: boolean;
}

/**
 * DTO de respuesta para importación CSV
 */
export class ImportResourcesResponseDto {
  @ApiProperty({
    description: "Número total de filas procesadas",
    example: 150,
  })
  totalRows: number;

  @ApiProperty({
    description: "Número de recursos creados exitosamente",
    example: 140,
  })
  successCount: number;

  @ApiProperty({
    description: "Número de recursos actualizados",
    example: 8,
  })
  updatedCount: number;

  @ApiProperty({
    description: "Número de filas con errores",
    example: 2,
  })
  errorCount: number;

  @ApiProperty({
    description: "Lista de errores detallados",
    type: [Object],
    example: [
      {
        row: 5,
        code: "LAB-005",
        error: "Category not found: INVALID_CAT",
      },
    ],
  })
  errors: Array<{
    row: number;
    code?: string;
    error: string;
  }>;

  @ApiProperty({
    description: "Tiempo de procesamiento en milisegundos",
    example: 1523,
  })
  processingTime: number;
}
