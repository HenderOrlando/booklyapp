import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString } from "class-validator";

/**
 * Generate Usage Report DTO
 * DTO para generar un reporte de uso en tiempo real
 */
export class GenerateUsageReportDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsNotEmpty()
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: "Fecha de inicio",
    example: "2024-01-01",
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: "Fecha de fin",
    example: "2024-12-31",
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
