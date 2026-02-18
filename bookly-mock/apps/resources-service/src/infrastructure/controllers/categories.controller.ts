import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from "@resources/application/commands";
import { GetCategoriesQuery } from "@resources/application/queries";
import { CreateCategoryDto } from "../dto";

/**
 * Categories Controller
 * Controlador REST para gestión de categorías
 */
@ApiTags("Categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva categoría" })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new CreateCategoryCommand(
      createCategoryDto.code,
      createCategoryDto.name,
      createCategoryDto.description,
      createCategoryDto.type,
      createCategoryDto.color,
      createCategoryDto.icon,
      createCategoryDto.parentId,
      createCategoryDto.metadata,
      userId,
    );

    const category = await this.commandBus.execute(command);

    return ResponseUtil.success(category, "Category created successfully");
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de categorías" })
  async getCategories(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
  ) {
    const query = new GetCategoriesQuery({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    });

    const result = await this.queryBus.execute(query);

    return ResponseUtil.success(result, "Categories retrieved successfully");
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar una categoría existente" })
  async updateCategory(
    @Param("id") id: string,
    @Body() updateData: any,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new UpdateCategoryCommand(
      id,
      updateData.name,
      updateData.description,
      updateData.type || "RESOURCE",
      updateData.color,
      updateData.icon,
      updateData.isActive !== undefined ? updateData.isActive : true,
      updateData.metadata || {},
      userId,
    );

    const category = await this.commandBus.execute(command);

    return ResponseUtil.success(category, "Category updated successfully");
  }
}
