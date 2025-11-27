import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

/**
 * Cancel Reservation DTO
 */
export class CancelReservationDto {
  @ApiPropertyOptional({
    description: "Razón de la cancelación",
    example: "Conflicto de horario",
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
