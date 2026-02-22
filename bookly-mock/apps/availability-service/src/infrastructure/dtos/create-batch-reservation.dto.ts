import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Item individual de una reserva batch
 */
class BatchReservationItemDto {
  @ApiProperty({
    description: "ID del recurso a reservar",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: "Fecha y hora de inicio",
    example: "2026-03-01T08:00:00.000Z",
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    description: "Fecha y hora de fin",
    example: "2026-03-01T10:00:00.000Z",
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({
    description: "Propósito de la reserva",
    example: "Clase de matemáticas",
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    description: "Notas adicionales",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO para crear reservas múltiples en una solicitud (RF-19)
 */
export class CreateBatchReservationDto {
  @ApiProperty({
    description: "Lista de reservas a crear",
    type: [BatchReservationItemDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchReservationItemDto)
  reservations: BatchReservationItemDto[];

  @ApiProperty({
    description:
      "Si es true, falla atómicamente (rollback) cuando hay conflicto. Si es false, continúa con las demás reservas.",
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  failOnConflict?: boolean;
}
