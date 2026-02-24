import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { RecurrencePatternDto } from "./recurring-reservation.dto";

/**
 * DTO para preview de serie recurrente (sin crear)
 */
export class PreviewRecurringReservationDto {
  @ApiProperty({
    description: "ID del recurso a reservar",
    example: "resource-123",
  })
  @IsNotEmpty()
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: "Fecha de inicio de la primera instancia (ISO 8601)",
    example: "2025-01-15T09:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: "Fecha de fin de la primera instancia (ISO 8601)",
    example: "2025-01-15T11:00:00.000Z",
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: "Patrón de recurrencia",
    type: RecurrencePatternDto,
  })
  @IsNotEmpty()
  @IsObject()
  recurrencePattern: RecurrencePatternDto;

  @ApiPropertyOptional({
    description: "Página a mostrar",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Cantidad de instancias por página",
    example: 50,
    default: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * DTO de respuesta para preview
 */
export class PreviewRecurringReservationResponseDto {
  @ApiProperty({
    description: "Fechas de ocurrencias generadas",
    type: [String],
    example: ["2025-01-15T09:00:00.000Z", "2025-01-22T09:00:00.000Z"],
  })
  occurrences: Array<{
    startDate: string;
    endDate: string;
    instanceNumber: number;
  }>;

  @ApiProperty({
    description: "Total de instancias que se generarían",
    example: 52,
  })
  totalInstances: number;

  @ApiProperty({
    description: "Página actual",
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: "Instancias por página",
    example: 50,
  })
  limit: number;

  @ApiProperty({
    description: "Indica si hay más páginas",
    example: true,
  })
  hasMore: boolean;

  @ApiProperty({
    description: "Total de páginas",
    example: 2,
  })
  totalPages: number;

  @ApiProperty({
    description: "Patrón de recurrencia usado",
    type: RecurrencePatternDto,
  })
  pattern: RecurrencePatternDto;
}
