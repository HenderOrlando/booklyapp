import { ReportDataType, ReportsExportFormat } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsObject, IsOptional } from "class-validator";

/**
 * Request Export DTO
 * DTO para solicitar exportación de reportes
 */
export class RequestExportDto {
  @ApiProperty({
    description: "Tipo de reporte a exportar",
    enum: ReportDataType,
    example: ReportDataType.USAGE,
  })
  @IsEnum(ReportDataType)
  @IsNotEmpty()
  reportType: ReportDataType;

  @ApiProperty({
    description: "Formato de exportación",
    enum: ReportsExportFormat,
    example: ReportsExportFormat.CSV,
  })
  @IsEnum(ReportsExportFormat)
  @IsNotEmpty()
  format: ReportsExportFormat;

  @ApiProperty({
    description: "Filtros para el reporte",
    type: "object",
    example: {
      resourceId: "123e4567-e89b-12d3-a456-426614174000",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}
