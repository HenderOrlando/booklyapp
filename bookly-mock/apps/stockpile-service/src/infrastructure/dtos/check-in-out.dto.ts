import { CheckInOutType } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

/**
 * Check-in Request DTO
 */
export class CheckInRequestDto {
  @ApiProperty({ description: "ID de la reserva" })
  @IsNotEmpty()
  @IsString()
  reservationId: string;

  @ApiProperty({ enum: CheckInOutType, description: "Tipo de check-in" })
  @IsEnum(CheckInOutType)
  type: CheckInOutType;

  @ApiPropertyOptional({ description: "Notas opcionales" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "Metadata adicional" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Check-out Request DTO
 */
export class CheckOutRequestDto {
  @ApiProperty({ description: "ID del check-in" })
  @IsNotEmpty()
  @IsString()
  checkInId: string;

  @ApiProperty({ enum: CheckInOutType, description: "Tipo de check-out" })
  @IsEnum(CheckInOutType)
  type: CheckInOutType;

  @ApiPropertyOptional({ description: "Notas opcionales" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "Condición del recurso" })
  @IsOptional()
  @IsString()
  resourceCondition?: string;

  @ApiPropertyOptional({ description: "¿Hay daños reportados?" })
  @IsOptional()
  damageReported?: boolean;

  @ApiPropertyOptional({ description: "Descripción de daños" })
  @IsOptional()
  @IsString()
  damageDescription?: string;

  @ApiPropertyOptional({ description: "Metadata adicional" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Check-in/out Response DTO
 */
export class CheckInOutResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reservationId: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  checkInTime?: Date;

  @ApiPropertyOptional()
  checkOutTime?: Date;

  @ApiPropertyOptional()
  expectedReturnTime?: Date;

  @ApiPropertyOptional()
  actualReturnTime?: Date;

  @ApiPropertyOptional()
  resourceCondition?: any;

  @ApiPropertyOptional({ description: "Metadata adicional (incluye qrCode)" })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: "QR Code extraído de metadata para fácil acceso",
  })
  qrCode?: string;

  // Campos poblados desde Reservation
  @ApiPropertyOptional({ description: "Fecha/hora de inicio de la reserva" })
  reservationStartTime?: Date;

  @ApiPropertyOptional({ description: "Fecha/hora de fin de la reserva" })
  reservationEndTime?: Date;

  // Campos poblados desde Resource
  @ApiPropertyOptional({
    description: "Tipo de recurso (Sala, Auditorio, etc.)",
  })
  resourceType?: string;

  @ApiPropertyOptional({ description: "Nombre del recurso" })
  resourceName?: string;

  // Campos poblados desde User (opcionales)
  @ApiPropertyOptional({ description: "Nombre del usuario" })
  userName?: string;

  @ApiPropertyOptional({ description: "Email del usuario" })
  userEmail?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
