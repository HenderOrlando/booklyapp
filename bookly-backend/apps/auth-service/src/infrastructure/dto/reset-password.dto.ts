import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

/**
 * DTO para restablecer contraseña con token
 */
export class ResetPasswordDto {
  @ApiProperty({
    description: "Token de recuperación recibido por email",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: "Nueva contraseña (mínimo 8 caracteres)",
    example: "NewPassword123!",
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  newPassword: string;
}
