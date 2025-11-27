import { AuditInfo } from "@libs/common";
import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO de respuesta para permiso
 */
export class PermissionResponseDto {
  @ApiProperty({
    description: "ID del permiso",
    example: "507f1f77bcf86cd799439011",
  })
  id: string;

  @ApiProperty({
    description: "Código único del permiso",
    example: "resources:read",
  })
  code: string;

  @ApiProperty({
    description: "Nombre descriptivo",
    example: "Ver Recursos",
  })
  name: string;

  @ApiProperty({
    description: "Descripción del permiso",
    example: "Permite ver la lista de recursos del sistema",
  })
  description: string;

  @ApiProperty({
    description: "Recurso al que aplica",
    example: "resources",
  })
  resource: string;

  @ApiProperty({
    description: "Acción que permite",
    example: "read",
  })
  action: string;

  @ApiProperty({
    description: "Indica si el permiso está activo",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Información de auditoría",
    type: "object",
  })
  audit?: AuditInfo;

  constructor(partial: Partial<PermissionResponseDto>) {
    Object.assign(this, partial);
  }
}
