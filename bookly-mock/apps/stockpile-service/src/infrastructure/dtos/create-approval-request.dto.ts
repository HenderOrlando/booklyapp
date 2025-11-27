import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

/**
 * Create Approval Request DTO
 * DTO para crear una nueva solicitud de aprobación
 */
export class CreateApprovalRequestDto {
  @ApiProperty({
    description: "ID de la reserva que requiere aprobación",
    example: "507f1f77bcf86cd799439011",
  })
  @IsNotEmpty()
  @IsString()
  reservationId: string;

  @ApiProperty({
    description: "ID del usuario que solicita la aprobación",
    example: "507f1f77bcf86cd799439012",
  })
  @IsNotEmpty()
  @IsString()
  requesterId: string;

  @ApiProperty({
    description: "ID del flujo de aprobación a seguir",
    example: "507f1f77bcf86cd799439013",
  })
  @IsNotEmpty()
  @IsString()
  approvalFlowId: string;

  @ApiPropertyOptional({
    description: "Metadata adicional de la solicitud",
    example: { priority: "high", department: "Engineering" },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
