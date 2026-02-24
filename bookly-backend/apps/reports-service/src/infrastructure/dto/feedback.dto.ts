import { FeedbackCategory, FeedbackStatus } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

/**
 * DTO: Crear Feedback
 */
export class CreateFeedbackDto {
  @ApiProperty({
    description: "ID del usuario",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: "Nombre del usuario", example: "Juan Pérez" })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({
    description: "ID de la reserva",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsNotEmpty()
  @IsUUID()
  reservationId: string;

  @ApiProperty({
    description: "ID del recurso",
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @IsNotEmpty()
  @IsUUID()
  resourceId: string;

  @ApiProperty({ description: "Nombre del recurso", example: "Sala 101" })
  @IsNotEmpty()
  @IsString()
  resourceName: string;

  @ApiProperty({
    description: "Calificación (1-5)",
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: "Comentarios adicionales",
    example: "Excelente sala, muy limpia",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;

  @ApiPropertyOptional({
    description: "Categoría del feedback",
    enum: FeedbackCategory,
    example: FeedbackCategory.FACILITY,
  })
  @IsOptional()
  @IsEnum(FeedbackCategory)
  category?: FeedbackCategory;

  @ApiPropertyOptional({ description: "Feedback anónimo", example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

/**
 * DTO: Responder a Feedback
 */
export class RespondToFeedbackDto {
  @ApiProperty({
    description: "Respuesta del staff",
    example: "Gracias por tu feedback. Hemos tomado nota de tu comentario.",
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  response: string;

  @ApiProperty({
    description: "ID del usuario que responde",
    example: "123e4567-e89b-12d3-a456-426614174003",
  })
  @IsNotEmpty()
  @IsUUID()
  respondedBy: string;
}

/**
 * DTO: Actualizar Estado de Feedback
 */
export class UpdateFeedbackStatusDto {
  @ApiProperty({
    description: "Nuevo estado del feedback",
    enum: FeedbackStatus,
    example: FeedbackStatus.CLOSED,
  })
  @IsNotEmpty()
  @IsEnum(FeedbackStatus)
  status: FeedbackStatus;
}

/**
 * DTO: Query Parameters para Listados
 */
export class FeedbackQueryDto {
  @ApiPropertyOptional({
    description: "Número de página",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Registros por página",
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
