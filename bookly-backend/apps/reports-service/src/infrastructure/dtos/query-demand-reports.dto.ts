import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

/**
 * Query Demand Reports DTO
 * DTO para consultar reportes de demanda con filtros
 */
export class QueryDemandReportsDto {
  @ApiPropertyOptional({
    description: "Número de página",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Cantidad de resultados por página",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Tipo de recurso",
    example: "ROOM",
  })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({
    description: "ID del programa académico",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiPropertyOptional({
    description: "Fecha de inicio",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
