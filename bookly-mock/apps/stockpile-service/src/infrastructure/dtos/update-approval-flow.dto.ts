import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { ApprovalStepDto } from "./create-approval-flow.dto";

/**
 * Update Approval Flow DTO
 * DTO para actualizar un flujo de aprobación
 */
export class UpdateApprovalFlowDto {
  @ApiPropertyOptional({
    description: "Nombre único del flujo de aprobación",
    example: "Flujo de Aprobación de Salas - Actualizado",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Descripción del flujo",
    example: "Flujo actualizado para aprobar reservas de salas",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Tipos de recursos a los que aplica",
    example: ["ROOM", "AUDITORIUM", "LAB"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceTypes?: string[];

  @ApiPropertyOptional({
    description: "Pasos del flujo de aprobación",
    type: [ApprovalStepDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStepDto)
  steps?: ApprovalStepDto[];

  @ApiPropertyOptional({
    description: "Condiciones para auto-aprobación",
    example: { maxDuration: 180, userType: "staff" },
  })
  @IsOptional()
  @IsObject()
  autoApproveConditions?: Record<string, any>;
}
