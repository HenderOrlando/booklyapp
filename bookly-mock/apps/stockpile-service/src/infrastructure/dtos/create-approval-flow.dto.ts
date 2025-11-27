import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

/**
 * Approval Step DTO
 */
export class ApprovalStepDto {
  @ApiProperty({
    description: "Nombre del paso",
    example: "Aprobación de Coordinador",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Roles que pueden aprobar este paso",
    example: ["coordinator", "program_director"],
  })
  @IsArray()
  @IsString({ each: true })
  approverRoles: string[];

  @ApiProperty({
    description: "Orden del paso en el flujo",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @ApiProperty({
    description: "Si el paso es requerido",
    example: true,
  })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({
    description: "Si permite aprobación paralela",
    example: false,
  })
  @IsBoolean()
  allowParallel: boolean;
}

/**
 * Create Approval Flow DTO
 * DTO para crear un nuevo flujo de aprobación
 */
export class CreateApprovalFlowDto {
  @ApiProperty({
    description: "Nombre único del flujo de aprobación",
    example: "Flujo de Aprobación de Salas",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Descripción del flujo",
    example: "Flujo para aprobar reservas de salas de conferencias",
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: "Tipos de recursos a los que aplica",
    example: ["ROOM", "AUDITORIUM"],
  })
  @IsArray()
  @IsString({ each: true })
  resourceTypes: string[];

  @ApiProperty({
    description: "Pasos del flujo de aprobación",
    type: [ApprovalStepDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStepDto)
  steps: ApprovalStepDto[];

  @ApiPropertyOptional({
    description: "Condiciones para auto-aprobación",
    example: { maxDuration: 120, userType: "staff" },
  })
  @IsOptional()
  @IsObject()
  autoApproveConditions?: Record<string, any>;
}
