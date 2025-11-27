import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateApprovalFlowCommand,
  DeactivateApprovalFlowCommand,
  UpdateApprovalFlowCommand,
} from "../../application/commands";
import {
  GetApprovalFlowByIdQuery,
  GetApprovalFlowsQuery,
} from "../../application/queries";
import {
  CreateApprovalFlowDto,
  QueryApprovalFlowsDto,
  UpdateApprovalFlowDto,
} from "../dtos";

/**
 * Approval Flows Controller
 * Controlador REST para gestión de flujos de aprobación
 */
@ApiTags("Approval Flows")
@ApiBearerAuth()
@Controller("approval-flows")
@UseGuards(JwtAuthGuard)
export class ApprovalFlowsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo flujo de aprobación" })
  @ApiResponse({
    status: 201,
    description: "Flujo creado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o nombre duplicado",
  })
  async create(
    @Body() dto: CreateApprovalFlowDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateApprovalFlowCommand(
      dto.name,
      dto.description,
      dto.resourceTypes,
      dto.steps,
      dto.autoApproveConditions,
      user.sub
    );

    return await this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({ summary: "Listar flujos de aprobación con filtros" })
  @ApiResponse({
    status: 200,
    description: "Lista de flujos obtenida exitosamente",
  })
  async findAll(@Query() query: QueryApprovalFlowsDto): Promise<any> {
    const queryCommand = new GetApprovalFlowsQuery(
      {
        page: query.page || 1,
        limit: query.limit || 10,
      },
      {
        isActive: query.isActive,
        resourceType: query.resourceType,
      }
    );

    return await this.queryBus.execute(queryCommand);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener un flujo por ID" })
  @ApiResponse({
    status: 200,
    description: "Flujo obtenido exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Flujo no encontrado",
  })
  async findOne(@Param("id") id: string): Promise<any> {
    const query = new GetApprovalFlowByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar un flujo de aprobación" })
  @ApiResponse({
    status: 200,
    description: "Flujo actualizado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Flujo no encontrado",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateApprovalFlowDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new UpdateApprovalFlowCommand(
      id,
      dto.name,
      dto.description,
      dto.resourceTypes,
      dto.steps,
      dto.autoApproveConditions,
      user.sub
    );

    return await this.commandBus.execute(command);
  }

  @Post(":id/deactivate")
  @ApiOperation({ summary: "Desactivar un flujo de aprobación" })
  @ApiResponse({
    status: 200,
    description: "Flujo desactivado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Flujo no encontrado",
  })
  async deactivate(
    @Param("id") id: string,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new DeactivateApprovalFlowCommand(id, user.sub);
    return await this.commandBus.execute(command);
  }

  @Post(":id/activate")
  @ApiOperation({ summary: "Activar un flujo de aprobación" })
  @ApiResponse({
    status: 200,
    description: "Flujo activado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Flujo no encontrado",
  })
  async activate(
    @Param("id") id: string,
    @CurrentUser() user: any
  ): Promise<any> {
    // Reutilizar el mismo comando pero con lógica en el service
    // O crear un ActivateApprovalFlowCommand separado
    return { message: "Activate functionality to be implemented" };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un flujo de aprobación" })
  @ApiResponse({
    status: 200,
    description: "Flujo eliminado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Flujo no encontrado",
  })
  async remove(@Param("id") id: string): Promise<any> {
    // Implementar DeleteApprovalFlowCommand si es necesario
    return { message: "Delete functionality to be implemented" };
  }
}
