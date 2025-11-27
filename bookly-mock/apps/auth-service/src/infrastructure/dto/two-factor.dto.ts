import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

/**
 * DTO para verificar y habilitar 2FA
 */
export class Enable2FADto {
  @ApiProperty({
    description: "Secret TOTP generado en el setup",
    example: "JBSWY3DPEHPK3PXP",
  })
  @IsString()
  @IsNotEmpty()
  secret: string;

  @ApiProperty({
    description: "Código TOTP de 6 dígitos",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: "Token must be 6 digits" })
  token: string;
}

/**
 * DTO para verificar código 2FA
 */
export class Verify2FADto {
  @ApiProperty({
    description: "Código TOTP de 6 dígitos",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: "Token must be 6 digits" })
  token: string;
}

/**
 * DTO para login con 2FA
 */
export class LoginWith2FADto {
  @ApiProperty({
    description: "Token temporal recibido después del login inicial",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({
    description: "Código TOTP de 6 dígitos",
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: "Token must be 6 digits" })
  token: string;
}

/**
 * DTO para usar código de backup
 */
export class UseBackupCodeDto {
  @ApiProperty({
    description: "Token temporal recibido después del login inicial",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @ApiProperty({
    description: "Código de backup de 8 caracteres",
    example: "A1B2C3D4",
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  @Matches(/^[A-F0-9]{8}$/, { message: "Invalid backup code format" })
  backupCode: string;
}
