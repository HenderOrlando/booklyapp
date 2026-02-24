import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

/**
 * Recurring Pattern DTO
 */
class RecurringPatternDto {
  @ApiProperty({
    description: "Frecuencia de recurrencia",
    enum: ["daily", "weekly", "monthly"],
    example: "weekly",
  })
  @IsEnum(["daily", "weekly", "monthly"])
  frequency: "daily" | "weekly" | "monthly";

  @ApiProperty({
    description: "Intervalo de recurrencia",
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  interval: number;

  @ApiPropertyOptional({
    description: "Fecha de fin de la recurrencia",
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: "Días de la semana (0-6, donde 0 es domingo)",
    type: [Number],
    example: [1, 3, 5],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  daysOfWeek?: number[];
}

/**
 * Participant DTO
 */
class ParticipantDto {
  @ApiProperty({
    description: "ID del participante",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Nombre del participante",
    example: "Juan Pérez",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Email del participante",
    example: "juan.perez@example.com",
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}

/**
 * Create Reservation DTO
 */
export class CreateReservationDto {
  @ApiProperty({
    description: "ID del recurso a reservar",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: "ID del usuario que realiza la reserva",
    example: "507f1f77bcf86cd799439012",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Fecha y hora de inicio",
    type: Date,
    example: "2025-01-10T08:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: "Fecha y hora de fin",
    type: Date,
    example: "2025-01-10T10:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: "Propósito de la reserva",
    example: "Reunión de equipo",
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiPropertyOptional({
    description: "Indica si es una reserva recurrente",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: "Patrón de recurrencia",
    type: RecurringPatternDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringPatternDto)
  recurringPattern?: RecurringPatternDto;

  @ApiPropertyOptional({
    description: "Lista de participantes",
    type: [ParticipantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];

  @ApiPropertyOptional({
    description: "Notas adicionales",
    example: "Traer laptop",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: "ID del calendario externo",
  })
  @IsOptional()
  @IsString()
  externalCalendarId?: string;

  @ApiPropertyOptional({
    description: "ID del evento en calendario externo",
  })
  @IsOptional()
  @IsString()
  externalCalendarEventId?: string;
}
