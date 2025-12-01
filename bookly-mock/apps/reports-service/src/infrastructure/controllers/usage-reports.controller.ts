import { JwtAuthGuard } from "@libs/guards";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  GenerateUsageReportQuery,
  GetUsageReportsQuery,
} from '@reports/application/queries";
import { GenerateUsageReportDto, QueryUsageReportsDto } from "../dtos";

@ApiTags("Usage Reports")
@ApiBearerAuth()
@Controller("usage-reports")
@UseGuards(JwtAuthGuard)
export class UsageReportsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Listar reportes de uso con filtros" })
  @ApiResponse({
    status: 200,
    description: "Lista de reportes obtenida exitosamente",
  })
  async findAll(@Query() dto: QueryUsageReportsDto): Promise<any> {
    const query = new GetUsageReportsQuery(
      {
        page: dto.page || 1,
        limit: dto.limit || 10,
      },
      {
        resourceId: dto.resourceId,
        resourceType: dto.resourceType,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      }
    );

    return await this.queryBus.execute(query);
  }

  @Post("generate")
  @ApiOperation({ summary: "Generar reporte de uso en tiempo real" })
  @ApiResponse({ status: 201, description: "Reporte generado exitosamente" })
  async generate(@Body() dto: GenerateUsageReportDto): Promise<any> {
    const query = new GenerateUsageReportQuery(
      dto.resourceId,
      new Date(dto.startDate),
      new Date(dto.endDate)
    );

    return await this.queryBus.execute(query);
  }
}
