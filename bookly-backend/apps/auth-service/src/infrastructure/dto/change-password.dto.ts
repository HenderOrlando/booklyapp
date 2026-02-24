import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

/**
 * Change Password DTO
 * Datos de entrada para cambiar la contraseña de un usuario
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: "Contraseña actual del usuario",
    example: "OldPassword123!",
  })
  @IsString({ message: "Contraseña actual debe ser un string" })
  @IsNotEmpty({ message: "Contraseña actual es requerida" })
  currentPassword: string;

  @ApiProperty({
    description: "Nueva contraseña del usuario",
    example: "NewSecurePassword123!",
    minLength: 8,
  })
  @IsString({ message: "Nueva contraseña debe ser un string" })
  @MinLength(8, {
    message: "Nueva contraseña debe tener al menos 8 caracteres",
  })
  @IsNotEmpty({ message: "Nueva contraseña es requerida" })
  newPassword: string;
}
