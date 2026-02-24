import { ApprovalRequestStatus } from "@libs/common/enums";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

/**
 * Query Approval Requests DTO
 * DTO para consultar solicitudes de aprobación con filtros
 */
export class QueryApprovalRequestsDto {
  @ApiPropertyOptional({
    description: "Número de página",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Cantidad de resultados por página",
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "ID del solicitante",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsString()
  requesterId?: string;

  @ApiPropertyOptional({
    description: "ID del flujo de aprobación",
    example: "507f1f77bcf86cd799439012",
  })
  @IsOptional()
  @IsString()
  approvalFlowId?: string;

  @ApiPropertyOptional({
    description: "Estado de la solicitud",
    enum: ApprovalRequestStatus,
    example: ApprovalRequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ApprovalRequestStatus)
  status?: ApprovalRequestStatus;

  @ApiPropertyOptional({
    description: "ID de la reserva",
    example: "507f1f77bcf86cd799439013",
  })
  @IsOptional()
  @IsString()
  reservationId?: string;

  @ApiPropertyOptional({
    description: "ID del recurso (filtro por metadata.resourceId)",
    example: "507f1f77bcf86cd799439014",
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({
    description: "ID del programa académico (filtro por metadata.programId)",
    example: "507f1f77bcf86cd799439015",
  })
  @IsOptional()
  @IsString()
  programId?: string;

  @ApiPropertyOptional({
    description: "Prioridad de la solicitud (filtro por metadata.priority)",
    example: "HIGH",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: "Búsqueda por texto (nombre de usuario, recurso o propósito)",
    example: "Auditorio",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: "Fecha de inicio para filtrar (ISO 8601)",
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin para filtrar (ISO 8601)",
    example: "2025-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
