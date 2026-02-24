import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

/**
 * Participant DTO
 */
class ParticipantDto {
  @ApiPropertyOptional({
    description: "ID del participante",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: "Nombre del participante",
    example: "Juan Pérez",
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "Email del participante",
    example: "juan.perez@example.com",
  })
  @IsString()
  email: string;
}

/**
 * Update Reservation DTO
 */
export class UpdateReservationDto {
  @ApiPropertyOptional({
    description: "Nueva fecha y hora de inicio",
    type: Date,
    example: "2025-01-10T09:00:00Z",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Nueva fecha y hora de fin",
    type: Date,
    example: "2025-01-10T11:00:00Z",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: "Nuevo propósito de la reserva",
    example: "Reunión de proyecto actualizada",
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({
    description: "Nueva lista de participantes",
    type: [ParticipantDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants?: ParticipantDto[];

  @ApiPropertyOptional({
    description: "Nuevas notas",
    example: "Actualización de agenda",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
