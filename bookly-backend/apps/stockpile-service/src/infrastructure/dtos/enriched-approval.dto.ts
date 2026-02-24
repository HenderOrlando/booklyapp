import { ApprovalRequestStatus } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Requester Info DTO
 * Información del usuario solicitante (desde availability-service vía eventos)
 */
export class RequesterInfoDto {
  @ApiProperty({
    description: "ID del usuario solicitante",
    example: "507f1f77bcf86cd799439011",
  })
  id: string;

  @ApiPropertyOptional({
    description: "Nombre completo del solicitante",
    example: "Juan Pérez García",
  })
  name?: string;

  @ApiPropertyOptional({
    description: "Correo electrónico del solicitante",
    example: "juan.perez@ufps.edu.co",
  })
  email?: string;

  @ApiPropertyOptional({
    description: "Programa académico al que pertenece",
    example: "Ingeniería de Sistemas",
  })
  program?: string;
}

/**
 * Resource Info DTO
 * Información del recurso (desde resources-service vía eventos)
 */
export class ResourceInfoDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "507f1f77bcf86cd799439012",
  })
  id: string;

  @ApiPropertyOptional({
    description: "Nombre del recurso",
    example: "Auditorio Principal",
  })
  name?: string;

  @ApiPropertyOptional({
    description: "Tipo de recurso",
    example: "auditorio",
  })
  type?: string;

  @ApiPropertyOptional({
    description: "Ubicación física del recurso",
    example: "Edificio A - Piso 1",
  })
  location?: string;

  @ApiPropertyOptional({
    description: "Capacidad del recurso",
    example: 300,
  })
  capacity?: number;
}

/**
 * Approval History Item DTO
 */
export class ApprovalHistoryItemDto {
  @ApiProperty({
    description: "Nombre del paso aprobado",
    example: "Coordinador Programa",
  })
  stepName: string;

  @ApiProperty({
    description: "Decisión tomada",
    example: "APPROVED",
    enum: ["APPROVED", "REJECTED"],
  })
  decision: string;

  @ApiProperty({
    description: "ID del aprobador",
    example: "507f1f77bcf86cd799439013",
  })
  approverId: string;

  @ApiPropertyOptional({
    description: "Comentario del aprobador",
    example: "Aprobado para el evento académico",
  })
  comment?: string;

  @ApiProperty({
    description: "Fecha de aprobación",
    example: "2025-01-05T09:30:00.000Z",
  })
  approvedAt: Date;
}

/**
 * Enriched Approval Request DTO
 * DTO de solicitud de aprobación con información enriquecida
 * Incluye datos de usuario y recurso obtenidos vía eventos
 */
export class EnrichedApprovalRequestDto {
  @ApiProperty({
    description: "ID de la solicitud de aprobación",
    example: "507f1f77bcf86cd799439014",
  })
  id: string;

  @ApiProperty({
    description: "ID de la reserva asociada",
    example: "507f1f77bcf86cd799439015",
  })
  reservationId: string;

  @ApiProperty({
    description: "Estado de la solicitud",
    example: "APPROVED",
    enum: ApprovalRequestStatus,
  })
  status: string;

  @ApiProperty({
    description: "Información del solicitante",
    type: RequesterInfoDto,
  })
  requester: RequesterInfoDto;

  @ApiProperty({
    description: "Información del recurso",
    type: ResourceInfoDto,
  })
  resource: ResourceInfoDto;

  @ApiPropertyOptional({
    description: "Fecha y hora de inicio de la reserva",
    example: "2025-01-10T09:00:00.000Z",
  })
  reservationStartDate?: Date;

  @ApiPropertyOptional({
    description: "Fecha y hora de fin de la reserva",
    example: "2025-01-10T11:00:00.000Z",
  })
  reservationEndDate?: Date;

  @ApiPropertyOptional({
    description: "Propósito de la reserva",
    example: "Conferencia de Investigación",
  })
  purpose?: string;

  @ApiPropertyOptional({
    description: "Nivel de aprobación actual",
    example: "FIRST_LEVEL",
  })
  currentLevel?: string;

  @ApiPropertyOptional({
    description: "Nivel de aprobación máximo requerido",
    example: "FINAL_LEVEL",
  })
  maxLevel?: string;

  @ApiPropertyOptional({
    description: "Próximo aprobador sugerido o rol",
    example: "Decano de Facultad",
  })
  nextApprover?: string;

  @ApiPropertyOptional({
    description: "Fecha de expiración de la solicitud",
    example: "2025-01-15T09:30:00.000Z",
  })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: "Prioridad de la solicitud",
    example: "HIGH",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
  })
  priority?: string;

  @ApiPropertyOptional({
    description: "Historial de aprobaciones",
    type: [ApprovalHistoryItemDto],
  })
  approvalHistory?: ApprovalHistoryItemDto[];

  @ApiPropertyOptional({
    description: "Metadata adicional",
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: "Fecha de creación",
    example: "2025-01-05T08:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Fecha de última actualización",
    example: "2025-01-05T09:30:00.000Z",
  })
  updatedAt: Date;
}
