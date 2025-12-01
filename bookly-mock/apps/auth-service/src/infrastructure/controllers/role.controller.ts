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
import { AssignPermissionsCommand } from "@auth/application/commands/roles/assign-permissions.command";
import { CreateRoleCommand } from "@auth/application/commands/roles/create-role.command";
import { DeleteRoleCommand } from "@auth/application/commands/roles/delete-role.command";
import { RemovePermissionsCommand } from "@auth/application/commands/roles/remove-permissions.command";
import { UpdateRoleCommand } from "@auth/application/commands/roles/update-role.command";
import { AssignPermissionsDto } from "@auth/application/dtos/role/assign-permissions.dto";
import { CreateRoleDto } from "@auth/application/dtos/role/create-role.dto";
import { RoleResponseDto } from "@auth/application/dtos/role/role-response.dto";
import { UpdateRoleDto } from "@auth/application/dtos/role/update-role.dto";
import { GetActiveRolesQuery } from "@auth/application/queries/roles/get-active-roles.query";
import { GetRoleByIdQuery } from "@auth/application/queries/roles/get-role-by-id.query";
import { GetRolesQuery } from "@auth/application/queries/roles/get-roles.query";
import { GetSystemRolesQuery } from "@auth/application/queries/roles/get-system-roles.query";
import { CurrentUser, UserPayload } from "../decorators/current-user.decorator";
import { RequireAction } from "../decorators/require-action.decorator";
import { RequirePermissions } from "../decorators/require-permissions.decorator";
import { ActionGuard } from "../guards/action.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { AuditInterceptor } from "../interceptors/audit.interceptor";

/**
 * Controller para gestión de roles
 * Endpoints REST para CRUD de roles
 */
@ApiTags("Roles")
@ApiBearerAuth()
@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionsGuard, ActionGuard)
@UseInterceptors(AuditInterceptor)
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Crear un nuevo rol
   */
  @Post()
  @RequirePermissions("role:create")
  @RequireAction(AuditAction.CREATE)
  @ApiOperation({ summary: "Crear un nuevo rol" })
  @ApiResponse({
    status: 201,
    description: "Rol creado exitosamente",
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 409, description: "El rol ya existe" })
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: UserPayload) {
    const command = new CreateRoleCommand(
      dto.name,
      dto.displayName,
      dto.description,
      dto.permissionIds,
      dto.isActive,
      dto.isDefault,
      user.id
    );

    const role = await this.commandBus.execute<
      CreateRoleCommand,
      RoleResponseDto
    >(command);

    return ResponseUtil.success(role, "Rol creado exitosamente");
  }

  /**
   * Obtener todos los roles con filtros opcionales
   */
  @Get()
  @RequirePermissions("role:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener roles con filtros opcionales" })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Filtrar por nombre de rol",
  })
  @ApiQuery({
    name: "isActive",
    required: false,
    type: Boolean,
    description: "Filtrar por estado activo",
  })
  @ApiQuery({
    name: "isDefault",
    required: false,
    type: Boolean,
    description: "Filtrar por roles del sistema",
  })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Buscar en displayName o description",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número de página (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items por página (default: 20)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de roles",
    type: [RoleResponseDto],
  })
  async findAll(
    @Query("name") name?: string,
    @Query("isActive") isActive?: string,
    @Query("isDefault") isDefault?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ) {
    const query = new GetRolesQuery({
      name: name as any,
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
      isDefault:
        isDefault === "true" ? true : isDefault === "false" ? false : undefined,
      search,
    });

    const roles = await this.queryBus.execute<GetRolesQuery, RoleResponseDto[]>(
      query
    );

    // Aplicar paginación en memoria
    const currentPage = page || 1;
    const pageSize = limit || 20;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRoles = roles.slice(startIndex, endIndex);

    return ResponseUtil.paginated(
      paginatedRoles,
      roles.length,
      currentPage,
      pageSize,
      'Roles retrieved successfully'
    );
  }

  /**
   * Obtener un rol por ID
   */
  @Get(":id")
  @RequirePermissions("role:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener un rol por ID" })
  @ApiResponse({
    status: 200,
    description: "Rol encontrado",
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: "Rol no encontrado" })
  async findOne(@Param("id") id: string) {
    const query = new GetRoleByIdQuery(id);

    const role = await this.queryBus.execute<GetRoleByIdQuery, RoleResponseDto>(
      query
    );

    return ResponseUtil.success(role, "Rol encontrado");
  }

  /**
   * Obtener solo roles activos
   */
  @Get("filter/active")
  @RequirePermissions("role:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener solo roles activos" })
  @ApiResponse({
    status: 200,
    description: "Lista de roles activos",
    type: [RoleResponseDto],
  })
  async findActive() {
    const query = new GetActiveRolesQuery();

    const roles = await this.queryBus.execute<
      GetActiveRolesQuery,
      RoleResponseDto[]
    >(query);

    return ResponseUtil.success(
      roles,
      `${roles.length} rol(es) activo(s) encontrado(s)`
    );
  }

  /**
   * Obtener solo roles del sistema (no eliminables)
   */
  @Get("filter/system")
  @RequirePermissions("role:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({ summary: "Obtener solo roles del sistema" })
  @ApiResponse({
    status: 200,
    description: "Lista de roles del sistema",
    type: [RoleResponseDto],
  })
  async findSystem() {
    const query = new GetSystemRolesQuery();

    const roles = await this.queryBus.execute<
      GetSystemRolesQuery,
      RoleResponseDto[]
    >(query);

    return ResponseUtil.success(
      roles,
      `${roles.length} rol(es) del sistema encontrado(s)`
    );
  }

  /**
   * Actualizar un rol
   */
  @Put(":id")
  @RequirePermissions("role:update")
  @RequireAction(AuditAction.UPDATE)
  @ApiOperation({ summary: "Actualizar un rol" })
  @ApiResponse({
    status: 200,
    description: "Rol actualizado exitosamente",
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: "Rol no encontrado" })
  @ApiResponse({
    status: 400,
    description: "No se puede actualizar rol del sistema",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: UserPayload
  ) {
    const command = new UpdateRoleCommand(
      id,
      dto.displayName,
      dto.description,
      dto.permissionIds,
      dto.isActive,
      user.id
    );

    const role = await this.commandBus.execute<
      UpdateRoleCommand,
      RoleResponseDto
    >(command);

    return ResponseUtil.success(role, "Rol actualizado exitosamente");
  }

  /**
   * Eliminar un rol
   * Solo permite eliminar roles que no sean del sistema (isDefault = false)
   */
  @Delete(":id")
  @RequirePermissions("role:delete")
  @RequireAction(AuditAction.DELETE)
  @ApiOperation({ summary: "Eliminar un rol" })
  @ApiResponse({
    status: 200,
    description: "Rol eliminado exitosamente",
  })
  @ApiResponse({ status: 404, description: "Rol no encontrado" })
  @ApiResponse({
    status: 400,
    description: "No se puede eliminar rol del sistema",
  })
  async remove(@Param("id") id: string, @CurrentUser() user: UserPayload) {
    const command = new DeleteRoleCommand(id, user.id);

    await this.commandBus.execute<DeleteRoleCommand, void>(command);

    return ResponseUtil.success(null, "Rol eliminado exitosamente");
  }

  /**
   * Asignar permisos a un rol
   */
  @Post(":id/permissions")
  @RequirePermissions("role:assign_permissions")
  @RequireAction(AuditAction.UPDATE)
  @ApiOperation({ summary: "Asignar permisos a un rol" })
  @ApiResponse({
    status: 200,
    description: "Permisos asignados exitosamente",
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: "Rol no encontrado" })
  async assignPermissions(
    @Param("id") id: string,
    @Body() dto: AssignPermissionsDto,
    @CurrentUser() user: UserPayload
  ) {
    const command = new AssignPermissionsCommand(
      id,
      dto.permissionIds,
      user.id
    );

    const role = await this.commandBus.execute<
      AssignPermissionsCommand,
      RoleResponseDto
    >(command);

    return ResponseUtil.success(
      role,
      `${dto.permissionIds.length} permiso(s) asignado(s) exitosamente`
    );
  }

  /**
   * Remover permisos de un rol
   */
  @Delete(":id/permissions")
  @RequirePermissions("role:remove_permissions")
  @RequireAction(AuditAction.UPDATE)
  @ApiOperation({ summary: "Remover permisos de un rol" })
  @ApiResponse({
    status: 200,
    description: "Permisos removidos exitosamente",
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 404, description: "Rol no encontrado" })
  async removePermissions(
    @Param("id") id: string,
    @Body() dto: AssignPermissionsDto,
    @CurrentUser() user: UserPayload
  ) {
    const command = new RemovePermissionsCommand(
      id,
      dto.permissionIds,
      user.id
    );

    const role = await this.commandBus.execute<
      RemovePermissionsCommand,
      RoleResponseDto
    >(command);

    return ResponseUtil.success(
      role,
      `${dto.permissionIds.length} permiso(s) removido(s) exitosamente`
    );
  }
}
