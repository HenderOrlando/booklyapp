import { ResponseUtil } from "@libs/common";
import { JwtAuthGuard } from "@libs/guards";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { GetDemandReportsQuery } from "@reports/application/queries";
import { QueryDemandReportsDto } from "../dtos";

@ApiTags("Demand Reports")
@ApiBearerAuth()
@Controller("demand-reports")
@UseGuards(JwtAuthGuard)
export class DemandReportsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Listar reportes de demanda insatisfecha" })
  @ApiResponse({
    status: 200,
    description: "Lista de reportes obtenida exitosamente",
  })
  async findAll(@Query() dto: QueryDemandReportsDto): Promise<any> {
    const query = new GetDemandReportsQuery(
      {
        page: dto.page || 1,
        limit: dto.limit || 20,
      },
      {
        resourceType: dto.resourceType,
        programId: dto.programId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      }
    );

    const result = await this.queryBus.execute(query);
    
    // Si el handler retorna estructura paginada
    if (result.data && result.meta) {
      return ResponseUtil.paginated(
        result.data,
        result.meta.total,
        dto.page || 1,
        dto.limit || 20,
        'Demand reports retrieved successfully'
      );
    }
    
    // Fallback si retorna array directo
    const items = Array.isArray(result) ? result : [];
    return ResponseUtil.paginated(
      items,
      items.length,
      1,
      items.length,
      'Demand reports retrieved successfully'
    );
  }
}
