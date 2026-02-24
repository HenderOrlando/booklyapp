import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreatePermissionDto } from "./create-permission.dto";

/**
 * DTO para crear múltiples permisos de una vez
 */
export class BulkCreatePermissionsDto {
  @ApiProperty({
    description: "Array de permisos a crear",
    type: [CreatePermissionDto],
    minItems: 1,
    example: [
      {
        code: "test:read",
        name: "Leer Test",
        description: "Permiso para leer test",
        resource: "test",
        action: "read",
        isActive: true,
      },
      {
        code: "test:create",
        name: "Crear Test",
        description: "Permiso para crear test",
        resource: "test",
        action: "create",
        isActive: true,
      },
    ],
  })
  @IsArray({ message: "Debe proporcionar un array de permisos" })
  @ArrayMinSize(1, { message: "Debe proporcionar al menos un permiso" })
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  permissions: CreatePermissionDto[];
}
