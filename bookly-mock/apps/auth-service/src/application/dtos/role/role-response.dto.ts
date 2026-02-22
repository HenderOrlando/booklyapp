import { AuditInfo } from "@libs/common";
import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO de respuesta para rol
 */
export class RoleResponseDto {
  @ApiProperty({
    description: "ID del rol",
    example: "507f1f77bcf86cd799439011",
  })
  id: string;

  @ApiProperty({
    description: "Nombre del rol",
    example: "TEACHER",
  })
  name: string;

  @ApiProperty({
    description: "Nombre para mostrar",
    example: "Docente",
  })
  displayName: string;

  @ApiProperty({
    description: "Descripción del rol",
    example:
      "Puede crear reservas para sus clases y aprobar solicitudes de estudiantes.",
  })
  description: string;

  @ApiProperty({
    description: "IDs de permisos asociados",
    example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    description: "Indica si el rol está activo",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "Indica si el rol es del sistema (no puede ser eliminado)",
    example: true,
  })
  isDefault: boolean;

  @ApiProperty({
    description: "Información de auditoría",
    type: "object",
  })
  audit?: AuditInfo;

  constructor(partial: Partial<RoleResponseDto>) {
    Object.assign(this, partial);
  }
}
