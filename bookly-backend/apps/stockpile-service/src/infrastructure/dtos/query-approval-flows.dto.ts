import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

/**
 * Query Approval Flows DTO
 * DTO para consultar flujos de aprobación con filtros
 */
export class QueryApprovalFlowsDto {
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
    description: "Filtrar por estado activo/inactivo",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filtrar por tipo de recurso",
    example: "ROOM",
  })
  @IsOptional()
  @IsString()
  resourceType?: string;
}
