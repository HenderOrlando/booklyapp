import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/**
 * Login DTO
 * Datos de entrada para autenticación de usuario
 */
export class LoginDto {
  @ApiProperty({
    description: "Email del usuario",
    example: "user@ufps.edu.co",
  })
  @IsEmail({}, { message: "Email debe ser válido" })
  @IsNotEmpty({ message: "Email es requerido" })
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "SecurePassword123!",
  })
  @IsString({ message: "Contraseña debe ser un string" })
  @IsNotEmpty({ message: "Contraseña es requerida" })
  password: string;
}
