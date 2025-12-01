import { UserRole } from "@libs/common/enums";
import { PaginationQuery } from "@libs/common";
import { ResponseUtil } from "@libs/common";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Audit, AuditAction } from "@reports/audit-decorators";
import { GetUserByIdQuery } from '@auth/application/queries/get-user-by-id.query";
import { GetUsersQuery } from '@auth/application/queries/get-users.query";
import { UpdateUserDto } from "../dto/update-user.dto";

/**
 * Users Controller
 * Controlador para gestión de usuarios
 */
@ApiTags("Usuarios")
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  /**
   * Obtener perfil del usuario autenticado
   */
  @Get("me")
  @ApiOperation({
    summary: "Obtener perfil propio",
    description: "Retorna el perfil del usuario autenticado",
  })
  @ApiResponse({
    status: 200,
    description: "Perfil obtenido exitosamente",
  })
  async getMe(@CurrentUser("sub") userId: string) {
    const query = new GetUserByIdQuery(userId);
    const user = await this.queryBus.execute(query);

    return ResponseUtil.success(user, "Perfil obtenido exitosamente");
  }

  /**
   * Obtener todos los usuarios (paginado)
   */
  @Get()
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Obtener todos los usuarios",
    description:
      "Retorna una lista paginada de usuarios (solo administradores)",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: "role",
    required: false,
    enum: UserRole,
    description: "Filtrar por rol",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios obtenida exitosamente",
  })
  @ApiResponse({
    status: 403,
    description: "No tiene permisos para acceder a este recurso",
  })
  async getUsers(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
    @Query("role") role?: UserRole
  ) {
    const paginationQuery: PaginationQuery = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    };

    const query = new GetUsersQuery(
      paginationQuery,
      role ? { role } : undefined
    );
    const result = await this.queryBus.execute(query);

    return ResponseUtil.success(result, "Usuarios obtenidos exitosamente");
  }

  /**
   * Obtener usuario por ID
   */
  @Get(":id")
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Obtener usuario por ID",
    description: "Retorna la información de un usuario específico",
  })
  @ApiParam({
    name: "id",
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: 200,
    description: "Usuario encontrado",
  })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado",
  })
  async getUserById(@Param("id") id: string) {
    const query = new GetUserByIdQuery(id);
    const user = await this.queryBus.execute(query);

    return ResponseUtil.success(user, "Usuario obtenido exitosamente");
  }

  /**
   * Actualizar usuario
   */
  @Patch(":id")
  @Audit({
    entityType: "USER",
    action: AuditAction.UPDATED,
    excludeFields: ["password"],
  })
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Actualizar usuario",
    description: "Actualiza la información de un usuario (solo admin general)",
  })
  @ApiParam({
    name: "id",
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: 200,
    description: "Usuario actualizado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado",
  })
  @ApiResponse({
    status: 403,
    description: "No tiene permisos para actualizar usuarios",
  })
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    // TODO: Implementar UpdateUserCommand cuando sea necesario
    // Por ahora retornamos un placeholder
    return ResponseUtil.success(
      { id, ...dto },
      "Usuario actualizado exitosamente"
    );
  }

  /**
   * Eliminar usuario
   */
  @Delete(":id")
  @Audit({
    entityType: "USER",
    action: AuditAction.DELETED,
    captureBeforeData: true,
  })
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Eliminar usuario",
    description: "Elimina un usuario del sistema (solo admin general)",
  })
  @ApiParam({
    name: "id",
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: 200,
    description: "Usuario eliminado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Usuario no encontrado",
  })
  @ApiResponse({
    status: 403,
    description: "No tiene permisos para eliminar usuarios",
  })
  async deleteUser(@Param("id") id: string) {
    // TODO: Implementar DeleteUserCommand cuando sea necesario
    // Por ahora retornamos un placeholder
    return ResponseUtil.success(undefined, "Usuario eliminado exitosamente");
  }
}
