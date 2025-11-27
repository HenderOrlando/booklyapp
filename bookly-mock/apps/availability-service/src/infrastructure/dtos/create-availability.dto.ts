import { WeekDay } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from "class-validator";

/**
 * Create Availability DTO
 */
export class CreateAvailabilityDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: "Día de la semana",
    enum: WeekDay,
    example: WeekDay.MONDAY,
  })
  @IsEnum(WeekDay)
  dayOfWeek: WeekDay;

  @ApiProperty({
    description: "Hora de inicio (formato HH:mm)",
    example: "08:00",
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "startTime must be in HH:mm format",
  })
  startTime: string;

  @ApiProperty({
    description: "Hora de fin (formato HH:mm)",
    example: "18:00",
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "endTime must be in HH:mm format",
  })
  endTime: string;

  @ApiPropertyOptional({
    description: "Indica si está disponible",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: "Número máximo de reservas concurrentes",
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxConcurrentReservations?: number;

  @ApiPropertyOptional({
    description: "Fecha desde la cual es efectiva",
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveFrom?: Date;

  @ApiPropertyOptional({
    description: "Fecha hasta la cual es efectiva",
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveUntil?: Date;

  @ApiPropertyOptional({
    description: "Notas adicionales",
    example: "Disponible solo para docentes",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
