import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * Cancel Approval Request DTO
 * DTO para cancelar una solicitud de aprobación
 */
export class CancelApprovalRequestDto {
  @ApiProperty({
    description: "ID de la solicitud de aprobación a cancelar",
    example: "507f1f77bcf86cd799439011",
  })
  @IsNotEmpty()
  @IsString()
  approvalRequestId: string;

  @ApiProperty({
    description: "ID del usuario que cancela",
    example: "507f1f77bcf86cd799439012",
  })
  @IsNotEmpty()
  @IsString()
  cancelledBy: string;

  @ApiPropertyOptional({
    description: "Razón de la cancelación",
    example: "El solicitante ya no requiere el recurso",
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
