import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

/**
 * Add To Waiting List DTO
 */
export class AddToWaitingListDto {
  @ApiProperty({
    description: "ID del recurso solicitado",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: "ID del usuario solicitante",
    example: "507f1f77bcf86cd799439012",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Fecha y hora de inicio solicitada",
    type: Date,
    example: "2025-01-15T08:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  requestedStartDate: Date;

  @ApiProperty({
    description: "Fecha y hora de fin solicitada",
    type: Date,
    example: "2025-01-15T10:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  requestedEndDate: Date;

  @ApiPropertyOptional({
    description: "Prioridad de la solicitud",
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({
    description: "Propósito de la solicitud",
    example: "Clase de programación",
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({
    description: "Fecha de expiración de la solicitud",
    type: Date,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
