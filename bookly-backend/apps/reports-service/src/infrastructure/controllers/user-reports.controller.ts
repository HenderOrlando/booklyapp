import { ResponseUtil } from "@libs/common";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@libs/guards";
import { GetUserReportsQuery } from "@reports/application/queries";
import { QueryUserReportsDto } from "../dtos";

@ApiTags("User Reports")
@ApiBearerAuth()
@Controller("user-reports")
@UseGuards(JwtAuthGuard)
export class UserReportsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: "Listar reportes de actividad de usuarios" })
  @ApiResponse({
    status: 200,
    description: "Lista de reportes obtenida exitosamente",
  })
  async findAll(@Query() dto: QueryUserReportsDto): Promise<any> {
    const query = new GetUserReportsQuery(
      {
        page: dto.page || 1,
        limit: dto.limit || 20,
      },
      {
        userId: dto.userId,
        userType: dto.userType,
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
        'User reports retrieved successfully'
      );
    }
    
    // Fallback si retorna array directo
    const items = Array.isArray(result) ? result : [];
    return ResponseUtil.paginated(
      items,
      items.length,
      1,
      items.length,
      'User reports retrieved successfully'
    );
  }
}
