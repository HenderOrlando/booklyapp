import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

/**
 * DTO: Crear Evaluación
 */
export class CreateEvaluationDto {
  @ApiProperty({ description: "ID del usuario", example: "123e4567-e89b" })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: "Nombre del usuario", example: "Juan Pérez" })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    description: "Email del usuario",
    example: "juan.perez@ufps.edu.co",
  })
  @IsNotEmpty()
  @IsEmail()
  userEmail: string;

  @ApiProperty({ description: "ID del evaluador", example: "456e7890-f12b" })
  @IsNotEmpty()
  @IsUUID()
  evaluatedBy: string;

  @ApiProperty({ description: "Nombre del evaluador", example: "María García" })
  @IsNotEmpty()
  @IsString()
  evaluatorName: string;

  @ApiProperty({
    description: "Rol del evaluador",
    example: "Coordinador",
  })
  @IsNotEmpty()
  @IsString()
  evaluatorRole: string;

  @ApiProperty({
    description: "Score de cumplimiento (0-100)",
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  complianceScore: number;

  @ApiProperty({
    description: "Score de puntualidad (0-100)",
    example: 90,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  punctualityScore: number;

  @ApiProperty({
    description: "Score de cuidado de recursos (0-100)",
    example: 95,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  resourceCareScore: number;

  @ApiPropertyOptional({
    description: "Comentarios",
    example: "Excelente desempeño",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;

  @ApiPropertyOptional({
    description: "Recomendaciones",
    example: "Continuar así",
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  recommendations?: string;

  @ApiPropertyOptional({
    description: "Período de evaluación",
    example: {
      startDate: "2024-01-01T00:00:00.000Z",
      endDate: "2024-01-31T23:59:59.999Z",
    },
  })
  @IsOptional()
  period?: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * DTO: Actualizar Evaluación
 */
export class UpdateEvaluationDto {
  @ApiPropertyOptional({
    description: "Score de cumplimiento (0-100)",
    example: 88,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  complianceScore?: number;

  @ApiPropertyOptional({
    description: "Score de puntualidad (0-100)",
    example: 92,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  punctualityScore?: number;

  @ApiPropertyOptional({
    description: "Score de cuidado de recursos (0-100)",
    example: 96,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  resourceCareScore?: number;

  @ApiPropertyOptional({ description: "Comentarios actualizados" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;

  @ApiPropertyOptional({ description: "Recomendaciones actualizadas" })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  recommendations?: string;
}

/**
 * DTO: Query Parameters para Listados
 */
export class EvaluationQueryDto {
  @ApiPropertyOptional({
    description: "Número de página",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Registros por página",
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * DTO: Query por Período
 */
export class EvaluationPeriodQueryDto extends EvaluationQueryDto {
  @ApiProperty({
    description: "Fecha de inicio",
    example: "2024-01-01",
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: "Fecha de fin",
    example: "2024-01-31",
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}

/**
 * DTO: Query de Usuarios Prioritarios
 */
export class PriorityUsersQueryDto {
  @ApiPropertyOptional({
    description: "Score mínimo para prioridad",
    example: 80,
    default: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  threshold?: number = 80;
}
