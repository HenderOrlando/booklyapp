import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsMongoId } from "class-validator";

/**
 * DTO para asignar permisos a un rol
 */
export class AssignPermissionsDto {
  @ApiProperty({
    description: "IDs de los permisos a asignar",
    example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    type: [String],
    minItems: 1,
  })
  @IsArray({ message: "Los IDs de permisos deben ser un array" })
  @ArrayMinSize(1, {
    message: "Debe proporcionar al menos un ID de permiso",
  })
  @IsMongoId({ each: true, message: "Cada ID de permiso debe ser válido" })
  permissionIds: string[];
}
