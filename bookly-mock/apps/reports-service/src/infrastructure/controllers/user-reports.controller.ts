import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@libs/guards";
import { GetUserReportsQuery } from "../../application/queries";
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
        limit: dto.limit || 10,
      },
      {
        userId: dto.userId,
        userType: dto.userType,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      }
    );

    return await this.queryBus.execute(query);
  }
}
