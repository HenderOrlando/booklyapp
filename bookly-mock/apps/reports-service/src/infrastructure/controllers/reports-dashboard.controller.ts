import { ResponseUtil } from "@libs/common";
import { Permissions } from "@libs/decorators/permissions.decorator";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import {
  DashboardFiltersDto,
  DashboardUserContextDto,
  GetDashboardDataQuery,
} from "@reports/application/queries";
import { QueryDashboardDto } from "@reports/infrastructure/dtos";
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Dashboard")
@ApiBearerAuth()
@Controller("reports")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsDashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("dashboard")
  @Permissions("reports:read")
  @ApiOperation({
    summary: "Dashboard agregado para frontend",
    description:
      "Retorna KPIs, resumen de reservas, tendencia de 30 días, actividad reciente, reservas recientes y recursos más usados en un único payload.",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard agregado obtenido exitosamente",
  })
  async getDashboard(@Req() req: any, @Query() query: QueryDashboardDto) {
    const user = req.user || {};

    const filters: DashboardFiltersDto = {
      period: query.period,
      from: query.from,
      to: query.to,
      tz: query.tz,
      resourceTypeId: query.resourceTypeId,
      locationId: query.locationId,
      programId: query.programId,
      include: query.include,
    };

    const context: DashboardUserContextDto = {
      userId: user.sub || user.id || user.userId,
      roles: Array.isArray(user.roles) ? user.roles : [],
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    };

    const result = await this.queryBus.execute(
      new GetDashboardDataQuery(filters, context),
    );

    return ResponseUtil.success(
      result,
      "Dashboard data retrieved successfully",
    );
  }
}
