import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { EnrichedApprovalRequestDto } from "./enriched-approval.dto";

/**
 * Get Active Today Approvals DTO
 * RF-23: Filtros y paginación para aprobaciones activas
 */
export class GetActiveTodayApprovalsDto {
  @ApiProperty({
    description: "Fecha en formato ISO 8601 (default: hoy)",
    example: "2025-01-05",
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: "La fecha debe estar en formato ISO 8601" })
  date?: string;

  @ApiProperty({
    description: "Número de página",
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "Elementos por página",
    example: 20,
    default: 20,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: "Filtrar por ID de recurso",
    example: "507f1f77bcf86cd799439011",
    required: false,
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({
    description: "Filtrar por ID de programa académico",
    example: "507f1f77bcf86cd799439012",
    required: false,
  })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiProperty({
    description: "Filtrar por tipo de recurso",
    example: "auditorio",
    required: false,
  })
  @IsOptional()
  @IsString()
  resourceType?: string;
}

/**
 * Active Approval Response DTO
 * Respuesta enriquecida con datos de otros servicios
 */
export class ActiveApprovalResponseDto {
  @ApiProperty({ description: "ID de la aprobación" })
  id: string;

  @ApiProperty({ description: "ID de la reserva" })
  reservationId: string;

  @ApiProperty({ description: "Estado de la aprobación" })
  status: string;

  @ApiProperty({ description: "Fecha de inicio de la reserva" })
  reservationStartDate: Date;

  @ApiProperty({ description: "Fecha de fin de la reserva" })
  reservationEndDate: Date;

  @ApiProperty({ description: "Información del solicitante" })
  requester: {
    id: string;
    name?: string;
    email?: string;
    program?: string;
  };

  @ApiProperty({ description: "Información del recurso" })
  resource: {
    id: string;
    name?: string;
    type?: string;
    location?: string;
    capacity?: number;
  };

  @ApiProperty({ description: "Historial de aprobaciones" })
  approvalHistory: Array<{
    stepName: string;
    approverId: string;
    decision: string;
    comment?: string;
    approvedAt: Date;
  }>;

  @ApiProperty({ description: "Propósito de la reserva" })
  purpose?: string;

  @ApiProperty({ description: "Fecha de aprobación final" })
  completedAt?: Date;
}

/**
 * Paginated Active Approvals Response
 * RF-23: Response con datos enriquecidos
 */
export class PaginatedActiveApprovalsResponseDto {
  @ApiProperty({ type: [EnrichedApprovalRequestDto] })
  data: EnrichedApprovalRequestDto[];

  @ApiProperty({
    description: "Metadatos de paginación",
    example: {
      total: 50,
      page: 1,
      limit: 20,
      totalPages: 3,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
