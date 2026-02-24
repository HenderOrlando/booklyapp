import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * Reject Step DTO
 * DTO para rechazar un paso del flujo de aprobación
 */
export class RejectStepDto {
  @ApiProperty({
    description: "ID de la solicitud de aprobación",
    example: "507f1f77bcf86cd799439011",
  })
  @IsNotEmpty()
  @IsString()
  approvalRequestId: string;

  @ApiProperty({
    description: "ID del usuario que rechaza",
    example: "507f1f77bcf86cd799439012",
  })
  @IsNotEmpty()
  @IsString()
  approverId: string;

  @ApiProperty({
    description: "Nombre del paso que se está rechazando",
    example: "Aprobación de Coordinador",
  })
  @IsNotEmpty()
  @IsString()
  stepName: string;

  @ApiPropertyOptional({
    description: "Razón del rechazo",
    example: "No cumple con los requisitos mínimos",
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
