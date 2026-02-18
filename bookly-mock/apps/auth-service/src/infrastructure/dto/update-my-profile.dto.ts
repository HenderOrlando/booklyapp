import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

/**
 * DTO para actualizar el perfil propio del usuario autenticado.
 */
export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    description: "Nombre del usuario",
    example: "Juan",
  })
  @IsOptional()
  @IsString({ message: "Nombre debe ser un string" })
  firstName?: string;

  @ApiPropertyOptional({
    description: "Apellido del usuario",
    example: "Pérez",
  })
  @IsOptional()
  @IsString({ message: "Apellido debe ser un string" })
  lastName?: string;

  @ApiPropertyOptional({
    description: "Teléfono del usuario",
    example: "+573001234567",
  })
  @IsOptional()
  @IsString({ message: "Teléfono debe ser un string" })
  phone?: string;

  @ApiPropertyOptional({
    description: "Tipo de documento",
    enum: ["CC", "TI", "CE", "PASSPORT"],
    example: "CC",
  })
  @IsOptional()
  @IsIn(["CC", "TI", "CE", "PASSPORT"], {
    message: "Tipo de documento inválido",
  })
  documentType?: string;

  @ApiPropertyOptional({
    description: "Número de documento",
    example: "1098723456",
  })
  @IsOptional()
  @IsString({ message: "Número de documento debe ser un string" })
  documentNumber?: string;
}
