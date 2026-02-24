import { ReservationStatus } from "@libs/common/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

/**
 * Query Reservation DTO
 * DTO para consultar reservas con filtros y paginación
 */
export class QueryReservationDto {
  @ApiPropertyOptional({
    description: "Número de página",
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: "Cantidad de resultados por página",
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: "Filtrar por ID de usuario",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por ID de recurso",
    example: "507f1f77bcf86cd799439012",
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por estado",
    enum: ReservationStatus,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: "Filtrar por fecha de inicio desde",
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Filtrar por fecha de fin hasta",
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: "Término de búsqueda (por título de reserva o nombre de recurso)",
    example: "Reunión de equipo",
  })
  @IsOptional()
  @IsString()
  search?: string;
}
