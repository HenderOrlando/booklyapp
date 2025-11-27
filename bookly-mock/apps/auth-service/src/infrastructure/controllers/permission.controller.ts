import { AuditAction } from "@libs/common/enums";
import { ResponseUtil } from "@libs/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { BulkCreatePermissionsCommand } from "../../application/commands/permissions/bulk-create-permissions.command";
import { CreatePermissionCommand } from "../../application/commands/permissions/create-permission.command";
import { DeletePermissionCommand } from "../../application/commands/permissions/delete-permission.command";
import { UpdatePermissionCommand } from "../../application/commands/permissions/update-permission.command";
import { BulkCreatePermissionsDto } from "../../application/dtos/permission/bulk-create-permissions.dto";
import { CreatePermissionDto } from "../../application/dtos/permission/create-permission.dto";
import { PermissionResponseDto } from "../../application/dtos/permission/permission-response.dto";
import { UpdatePermissionDto } from "../../application/dtos/permission/update-permission.dto";
import { GetActivePermissionsQuery } from "../../application/queries/permissions/get-active-permissions.query";
import { GetPermissionByIdQuery } from "../../application/queries/permissions/get-permission-by-id.query";
import { GetPermissionsByModuleQuery } from "../../application/queries/permissions/get-permissions-by-module.query";
import { GetPermissionsQuery } from "../../application/queries/permissions/get-permissions.query";
import { CurrentUser, UserPayload } from "../decorators/current-user.decorator";
import { RequireAction } from "../decorators/require-action.decorator";
import { RequirePermissions } from "../decorators/require-permissions.decorator";
import { ActionGuard } from "../guards/action.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { AuditInterceptor } from "../interceptors/audit.interceptor";

/**
 * Controller para gestión de permisos
 * Endpoints REST para CRUD de permisos
 */
@ApiTags("Permissions")
@ApiBearerAuth()
@Controller("permissions")
@UseGuards(JwtAuthGuard, PermissionsGuard, ActionGuard)
@UseInterceptors(AuditInterceptor)
export class PermissionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Crear un nuevo permiso
   */
  @Post()
  @RequirePermissions("permission:create")
  @RequireAction(AuditAction.CREATE)
  @ApiOperation({ summary: "Crear un nuevo permiso" })
  @ApiResponse({
    status: 201,
    description: "Permiso creado exitosamente",
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 409, description: "El permiso ya existe" })
  async create(
    @Body() dto: CreatePermissionDto,
    @CurrentUser() user: UserPayload
  ) {
    const command = new CreatePermissionCommand(
      dto.code,
      dto.name,
      dto.description,
      dto.resource,
      dto.action,
      dto.isActive ?? true,
      user.id
    );

    const permission = await this.commandBus.execute<
      CreatePermissionCommand,
      PermissionResponseDto
    >(command);

    return ResponseUtil.success(permission, "Permiso creado exitosamente");
  }

  /**
   * Obtener todos los permisos con filtros opcionales
   */
  @Get()
  @RequirePermissions("permission:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener permisos con filtros opcionales" })
  @ApiQuery({
    name: "resource",
    required: false,
    description: "Filtrar por recurso",
  })
  @ApiQuery({
    name: "action",
    required: false,
    description: "Filtrar por acción",
  })
  @ApiQuery({
    name: "isActive",
    required: false,
    type: Boolean,
    description: "Filtrar por estado activo",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Buscar en name, description o code",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de permisos",
    type: [PermissionResponseDto],
  })
  async findAll(
    @Query("resource") resource?: string,
    @Query("action") action?: string,
    @Query("isActive") isActive?: string,
    @Query("search") search?: string
  ) {
    const query = new GetPermissionsQuery({
      resource,
      action,
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
      search,
    });

    const permissions = await this.queryBus.execute<
      GetPermissionsQuery,
      PermissionResponseDto[]
    >(query);

    return ResponseUtil.success(
      permissions,
      `${permissions.length} permiso(s) encontrado(s)`
    );
  }

  /**
   * Obtener un permiso por ID
   */
  @Get(":id")
  @RequirePermissions("permission:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener un permiso por ID" })
  @ApiResponse({
    status: 200,
    description: "Permiso encontrado",
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Permiso no encontrado" })
  async findOne(@Param("id") id: string) {
    const query = new GetPermissionByIdQuery(id);

    const permission = await this.queryBus.execute<
      GetPermissionByIdQuery,
      PermissionResponseDto
    >(query);

    return ResponseUtil.success(permission, "Permiso encontrado");
  }

  /**
   * Obtener permisos por módulo/recurso
   */
  @Get("module/:resource")
  @RequirePermissions("permission:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener permisos por módulo/recurso" })
  @ApiResponse({
    status: 200,
    description: "Lista de permisos del módulo",
    type: [PermissionResponseDto],
  })
  async findByModule(@Param("resource") resource: string) {
    const query = new GetPermissionsByModuleQuery(resource);

    const permissions = await this.queryBus.execute<
      GetPermissionsByModuleQuery,
      PermissionResponseDto[]
    >(query);

    return ResponseUtil.success(
      permissions,
      `${permissions.length} permiso(s) encontrado(s) para el módulo ${resource}`
    );
  }

  /**
   * Actualizar un permiso
   */
  @Put(":id")
  @RequirePermissions("permission:update")
  @RequireAction(AuditAction.UPDATE)
  @ApiOperation({ summary: "Actualizar un permiso" })
  @ApiResponse({
    status: 200,
    description: "Permiso actualizado exitosamente",
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: "Permiso no encontrado" })
  @ApiResponse({
    status: 400,
    description: "No se puede cambiar el código del permiso",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePermissionDto,
    @CurrentUser() user: UserPayload
  ) {
    const command = new UpdatePermissionCommand(
      id,
      dto.name,
      dto.description,
      dto.isActive,
      user.id
    );

    const permission = await this.commandBus.execute<
      UpdatePermissionCommand,
      PermissionResponseDto
    >(command);

    return ResponseUtil.success(permission, "Permiso actualizado exitosamente");
  }

  /**
   * Eliminar un permiso
   * Solo permite eliminar si no está asignado a roles
   */
  @Delete(":id")
  @RequirePermissions("permission:delete")
  @RequireAction(AuditAction.DELETE)
  @ApiOperation({ summary: "Eliminar un permiso" })
  @ApiResponse({
    status: 200,
    description: "Permiso eliminado exitosamente",
  })
  @ApiResponse({ status: 404, description: "Permiso no encontrado" })
  @ApiResponse({
    status: 400,
    description: "No se puede eliminar permiso asignado a roles",
  })
  async remove(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    const command = new DeletePermissionCommand(id, user.id);

    await this.commandBus.execute<DeletePermissionCommand, void>(command);

    return ResponseUtil.success(null, "Permiso eliminado exitosamente");
  }

  /**
   * Obtener solo permisos activos
   */
  @Get("active")
  @RequirePermissions("permission:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener solo permisos activos" })
  @ApiResponse({
    status: 200,
    description: "Lista de permisos activos",
    type: [PermissionResponseDto],
  })
  async findActive() {
    const query = new GetActivePermissionsQuery();

    const permissions = await this.queryBus.execute<
      GetActivePermissionsQuery,
      PermissionResponseDto[]
    >(query);

    return ResponseUtil.success(
      permissions,
      `${permissions.length} permiso(s) activo(s) encontrado(s)`
    );
  }

  /**
   * Crear múltiples permisos de una vez
   */
  @Post("bulk")
  @RequirePermissions("permission:create")
  @RequireAction(AuditAction.CREATE)
  @ApiOperation({ summary: "Crear múltiples permisos" })
  @ApiResponse({
    status: 201,
    description: "Permisos creados exitosamente",
    type: [PermissionResponseDto],
  })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 409, description: "Uno o más permisos ya existen" })
  async bulkCreate(
    @Body() dto: BulkCreatePermissionsDto,
    @CurrentUser() user: UserPayload
  ) {
    const command = new BulkCreatePermissionsCommand(dto.permissions, user.id);

    const permissions = await this.commandBus.execute<
      BulkCreatePermissionsCommand,
      PermissionResponseDto[]
    >(command);

    return ResponseUtil.success(
      permissions,
      `${permissions.length} permiso(s) creado(s) exitosamente`
    );
  }
}
