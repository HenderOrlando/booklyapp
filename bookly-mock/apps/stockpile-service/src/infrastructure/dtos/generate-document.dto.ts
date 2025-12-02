import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsObject, IsString } from "class-validator";

/**
 * Generate Document DTO
 * DTO para solicitar generación de documento
 */
export class GenerateDocumentDto {
  @ApiProperty({
    description: "Tipo de documento a generar",
    enum: ["approval_letter", "rejection_letter", "confirmation"],
    example: "approval_letter",
  })
  @IsEnum(["approval_letter", "rejection_letter", "confirmation"])
  @IsNotEmpty()
  documentType: string;

  @ApiProperty({
    description: "Datos para generar el documento",
    example: {
      approvalRequestId: "507f1f77bcf86cd799439011",
      userName: "Juan Pérez",
      userEmail: "juan.perez@ufps.edu.co",
      resourceName: "Sala de Conferencias A",
      resourceLocation: "Edificio Principal, Piso 2",
      reservationDate: "2024-12-15T00:00:00.000Z",
      reservationStartTime: "14:00",
      reservationEndTime: "16:00",
      approvedBy: "María González",
      approvedAt: "2024-12-01T10:30:00.000Z",
      approvalComments: "Aprobado para evento académico",
    },
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @ApiProperty({
    description: "ID del usuario que solicita el documento",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  requestedBy: string;
}
