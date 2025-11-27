import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * Approve Step DTO
 * DTO para aprobar un paso del flujo de aprobación
 */
export class ApproveStepDto {
  @ApiProperty({
    description: "ID de la solicitud de aprobación",
    example: "507f1f77bcf86cd799439011",
  })
  @IsNotEmpty()
  @IsString()
  approvalRequestId: string;

  @ApiProperty({
    description: "ID del usuario que aprueba",
    example: "507f1f77bcf86cd799439012",
  })
  @IsNotEmpty()
  @IsString()
  approverId: string;

  @ApiProperty({
    description: "Nombre del paso que se está aprobando",
    example: "Aprobación de Coordinador",
  })
  @IsNotEmpty()
  @IsString()
  stepName: string;

  @ApiPropertyOptional({
    description: "Comentario del aprobador",
    example: "Aprobado sin observaciones",
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
