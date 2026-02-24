import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

/**
 * DTO para solicitar recuperación de contraseña
 */
export class ForgotPasswordDto {
  @ApiProperty({
    description: "Email del usuario",
    example: "usuario@ufps.edu.co",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
