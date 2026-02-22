import { ReassignmentReason } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

/**
 * DTO para solicitar reasignación de recurso
 */
export class RequestReassignmentDto {
  @ApiProperty({
    description: "ID de la reserva afectada",
    example: "507f1f77bcf86cd799439011",
  })
  @IsMongoId()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({
    description: "Razón de la reasignación",
    example: "MAINTENANCE",
    enum: ReassignmentReason,
  })
  @IsEnum(ReassignmentReason)
  @IsNotEmpty()
  reason: ReassignmentReason;

  @ApiPropertyOptional({
    description: "Pesos personalizados para el algoritmo de similitud",
  })
  @IsOptional()
  weights?: {
    capacity?: number;
    features?: number;
    location?: number;
    availability?: number;
  };
}

/**
 * DTO de respuesta con alternativas de reasignación
 */
export class ResourceAlternativeDto {
  @ApiProperty({
    description: "ID del recurso alternativo",
    example: "507f1f77bcf86cd799439012",
  })
  resourceId: string;

  @ApiProperty({ description: "Nombre del recurso", example: "Sala B-202" })
  resourceName: string;

  @ApiProperty({ description: "Tipo de recurso", example: "CLASSROOM" })
  resourceType: string;

  @ApiProperty({
    description: "Score de similitud (0-100)",
    example: 92.5,
    minimum: 0,
    maximum: 100,
  })
  similarityScore: number;

  @ApiProperty({
    description: "Desglose del score",
    example: {
      capacity: 95,
      features: 88,
      location: 100,
      availability: 87,
    },
  })
  scoreBreakdown: {
    capacity: number;
    features: number;
    location: number;
    availability: number;
  };

  @ApiProperty({ description: "Disponible en el horario solicitado" })
  isAvailable: boolean;

  @ApiPropertyOptional({ description: "Capacidad del recurso" })
  capacity?: number;

  @ApiPropertyOptional({ description: "Características del recurso" })
  features?: string[];

  @ApiPropertyOptional({ description: "Ubicación del recurso" })
  location?: string;

  @ApiPropertyOptional({ description: "Razón de no disponibilidad si aplica" })
  unavailabilityReason?: string;
}

/**
 * DTO de respuesta de reasignación
 */
export class ReassignmentResponseDto {
  @ApiProperty({ description: "ID de la reserva original" })
  originalReservationId: string;

  @ApiProperty({ description: "ID del recurso original" })
  originalResourceId: string;

  @ApiProperty({ description: "Nombre del recurso original" })
  originalResourceName: string;

  @ApiProperty({
    description: "Lista de alternativas sugeridas",
    type: [ResourceAlternativeDto],
  })
  alternatives: ResourceAlternativeDto[];

  @ApiProperty({ description: "Razón de la reasignación" })
  reason: string;

  @ApiProperty({ description: "Total de alternativas encontradas" })
  totalAlternatives: number;

  @ApiProperty({
    description: "Mejor alternativa (mayor score)",
    type: ResourceAlternativeDto,
  })
  bestAlternative: ResourceAlternativeDto | null;
}

/**
 * DTO para aceptar o rechazar reasignación
 */
export class RespondReassignmentDto {
  @ApiProperty({ description: "ID de la reasignación" })
  @IsMongoId()
  @IsNotEmpty()
  reassignmentId: string;

  @ApiProperty({ description: "¿Acepta la reasignación?" })
  @IsBoolean()
  accepted: boolean;

  @ApiProperty({ description: "ID del nuevo recurso si acepta" })
  @IsMongoId()
  @IsOptional()
  newResourceId?: string;

  @ApiPropertyOptional({ description: "Feedback del usuario" })
  @IsString()
  @IsOptional()
  userFeedback?: string;

  @ApiPropertyOptional({ description: "Detalles adicionales de la razón" })
  @IsString()
  @IsOptional()
  reasonDetails?: string;

  @ApiProperty({ description: "¿Notificar al usuario?" })
  @IsBoolean()
  @IsOptional()
  notifyUser?: boolean = true;
}

/**
 * DTO para obtener historial de reasignaciones
 */
export class GetReassignmentHistoryDto {
  @ApiPropertyOptional({ description: "Filtrar por ID de usuario" })
  @IsMongoId()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: "Filtrar por ID de reserva" })
  @IsMongoId()
  @IsOptional()
  reservationId?: string;

  @ApiPropertyOptional({ description: "Filtrar por recurso original" })
  @IsMongoId()
  @IsOptional()
  originalResourceId?: string;

  @ApiPropertyOptional({ description: "Filtrar por recurso nuevo" })
  @IsMongoId()
  @IsOptional()
  newResourceId?: string;

  @ApiPropertyOptional({ description: "Filtrar por aceptadas/rechazadas" })
  @IsBoolean()
  @IsOptional()
  accepted?: boolean;

  @ApiPropertyOptional({ description: "Fecha desde" })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ description: "Fecha hasta" })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ description: "Razón de reasignación" })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * DTO de respuesta del historial
 */
export class ReassignmentHistoryResponseDto {
  @ApiProperty({ description: "ID de la reasignación" })
  id: string;

  @ApiProperty({ description: "ID de la reserva original" })
  originalReservationId: string;

  @ApiProperty({ description: "Recurso original" })
  originalResource: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: "Recurso nuevo" })
  newResource: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: "Usuario afectado" })
  userId: string;

  @ApiProperty({ description: "Razón" })
  reason: string;

  @ApiProperty({ description: "Score de similitud" })
  similarityScore: number;

  @ApiProperty({ description: "Desglose del score" })
  scoreBreakdown: {
    capacity: number;
    features: number;
    location: number;
    availability: number;
    total: number;
  };

  @ApiProperty({ description: "Alternativas consideradas" })
  alternativesConsidered: string[];

  @ApiProperty({ description: "¿Aceptada?" })
  accepted: boolean;

  @ApiPropertyOptional({ description: "Feedback del usuario" })
  userFeedback?: string;

  @ApiProperty({ description: "Notificación enviada" })
  notificationSent: boolean;

  @ApiPropertyOptional({ description: "Fecha de notificación" })
  notifiedAt?: Date;

  @ApiPropertyOptional({ description: "Fecha de respuesta" })
  respondedAt?: Date;

  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;
}

/**
 * DTO para configuración de pesos del algoritmo
 */
export class SimilarityWeightsDto {
  @ApiPropertyOptional({
    description: "Peso para similitud de capacidad (0-1)",
    minimum: 0,
    maximum: 1,
    default: 0.3,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  capacity?: number = 0.3;

  @ApiPropertyOptional({
    description: "Peso para similitud de características (0-1)",
    minimum: 0,
    maximum: 1,
    default: 0.35,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  features?: number = 0.35;

  @ApiPropertyOptional({
    description: "Peso para similitud de ubicación (0-1)",
    minimum: 0,
    maximum: 1,
    default: 0.2,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  location?: number = 0.2;

  @ApiPropertyOptional({
    description: "Peso para disponibilidad (0-1)",
    minimum: 0,
    maximum: 1,
    default: 0.15,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  availability?: number = 0.15;
}
