import { DeleteUserCommand } from "@auth/application/commands/delete-user.command";
import { RegisterUserCommand } from "@auth/application/commands/register-user.command";
import { UpdateMyProfileCommand } from "@auth/application/commands/update-my-profile.command";
import { UpdateUserCommand } from "@auth/application/commands/update-user.command";
import { GetUserByIdQuery } from "@auth/application/queries/get-user-by-id.query";
import { GetUsersQuery } from "@auth/application/queries/get-users.query";
import { UserEntity } from "@auth/domain/entities/user.entity";
import { PaginationQuery, ResponseUtil } from "@libs/common";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Audit, AuditAction } from "@reports/audit-decorators";
import { UpdateMyProfileDto } from "../dto/update-my-profile.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { RegisterDto } from "../dto/register.dto";

interface MyProfileResponseDto {
  personal: {
    userId: string;
    nombreCompleto: string;
    correo: string;
    usuario: string;
    estadoCuenta: "ACTIVE" | "INACTIVE";
    tenantId: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  };
  roles: Array<{
    code: string;
    name: string;
  }>;
  verificaciones: {
    emailVerificado: boolean;
    telefonoVerificado: boolean;
    twoFactor: {
      habilitada: boolean;
      metodos: string[];
    };
  };
  cuenta: {
    fechaCreacion: string | null;
    ultimaActualizacion: string | null;
  };
  preferences: {
    language: string;
    theme: "light" | "dark" | "system";
    timezone?: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

const DEFAULT_USER_PREFERENCES: MyProfileResponseDto["preferences"] = {
  language: "es",
  theme: "system",
  timezone: "America/Bogota",
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
};

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
    private readonly commandBus: CommandBus,
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
   * Obtener perfil detallado del usuario autenticado
   */
  @Get("me/profile")
  @ApiOperation({
    summary: "Obtener perfil detallado propio",
    description: "Retorna el perfil detallado del usuario autenticado",
  })
  @ApiResponse({
    status: 200,
    description: "Perfil detallado obtenido exitosamente",
  })
  async getMyProfile(@CurrentUser("sub") userId: string) {
    const query = new GetUserByIdQuery(userId);
    const user = await this.queryBus.execute(query);
    const profile = this.toMyProfileResponse(user);

    return ResponseUtil.success(profile, "Perfil obtenido exitosamente");
  }

  /**
   * Actualizar perfil propio del usuario autenticado
   */
  @Patch("me/profile")
  @Audit({
    entityType: "USER",
    action: AuditAction.UPDATED,
  })
  @ApiOperation({
    summary: "Actualizar perfil propio",
    description:
      "Actualiza los datos permitidos del perfil del usuario autenticado",
  })
  @ApiResponse({
    status: 200,
    description: "Perfil actualizado exitosamente",
  })
  async updateMyProfile(
    @CurrentUser("sub") userId: string,
    @Body() dto: UpdateMyProfileDto,
  ) {
    const command = new UpdateMyProfileCommand(userId, dto);
    const result = await this.commandBus.execute(command);
    const profile = this.toMyProfileResponse(result);

    return ResponseUtil.success(profile, "Perfil actualizado exitosamente");
  }

  /**
   * Obtener todos los usuarios (paginado)
   */
  @Get()
  @Roles("GENERAL_ADMIN", "PROGRAM_ADMIN")
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
    type: String,
    description: "Filtrar por rol (ej: GENERAL_ADMIN, STUDENT)",
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
    @Query("role") role?: string,
  ) {
    const paginationQuery: PaginationQuery = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
    };

    const query = new GetUsersQuery(
      paginationQuery,
      role ? { role } : undefined,
    );
    const result = await this.queryBus.execute(query);

    return ResponseUtil.success(result, "Usuarios obtenidos exitosamente");
  }

  /**
   * Crear nuevo usuario (Admin)
   */
  @Post()
  @Roles("GENERAL_ADMIN")
  @Audit({
    entityType: "USER",
    action: AuditAction.CREATED,
    excludeFields: ["password"],
  })
  @ApiOperation({
    summary: "Crear nuevo usuario",
    description: "Crea un nuevo usuario en el sistema (solo admin general)",
  })
  @ApiResponse({
    status: 201,
    description: "Usuario creado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos de entrada inválidos",
  })
  async createUser(
    @Body() dto: RegisterDto,
    @CurrentUser("sub") adminId: string,
  ) {
    const command = new RegisterUserCommand(
      {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roles: dto.roles,
        permissions: dto.permissions,
        username: dto.username,
        phone: dto.phone,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        tenantId: dto.tenantId,
        programId: dto.programId,
        coordinatedProgramId: dto.coordinatedProgramId,
      },
      adminId,
    );

    const user = await this.commandBus.execute(command);
    return ResponseUtil.success(user, "Usuario creado exitosamente");
  }

  /**
   * Obtener usuario por ID
   */
  @Get(":id")
  @Roles("GENERAL_ADMIN", "PROGRAM_ADMIN")
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
  @Roles("GENERAL_ADMIN")
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
  async updateUser(
    @Param("id") id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new UpdateUserCommand(id, dto, userId);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Usuario actualizado exitosamente");
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
  @Roles("GENERAL_ADMIN")
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
  async deleteUser(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new DeleteUserCommand(id, userId);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Usuario eliminado exitosamente");
  }

  private toMyProfileResponse(user: UserEntity): MyProfileResponseDto {
    const roleNameMap: Record<string, string> = {
      GENERAL_ADMIN: "Administrador General",
      PROGRAM_ADMIN: "Administrador de Programa",
      TEACHER: "Docente",
      STUDENT: "Estudiante",
      SECURITY: "Vigilante",
      ADMINISTRATIVE_STAFF: "Administrativo General",
    };

    return {
      personal: {
        userId: user.id,
        nombreCompleto: `${user.firstName} ${user.lastName}`.trim(),
        correo: user.email,
        usuario: user.username || user.email,
        estadoCuenta: user.isActive ? "ACTIVE" : "INACTIVE",
        tenantId: user.tenantId || "UFPS",
        phone: user.phone,
        documentType: user.documentType,
        documentNumber: user.documentNumber,
      },
      roles: (user.roles || []).map((roleCode) => ({
        code: roleCode,
        name: roleNameMap[roleCode] || roleCode,
      })),
      verificaciones: {
        emailVerificado: user.isEmailVerified,
        telefonoVerificado: user.isPhoneVerified ?? false,
        twoFactor: {
          habilitada: user.twoFactorEnabled === true,
          metodos: ["EMAIL", "TOTP"],
        },
      },
      cuenta: {
        fechaCreacion: user.createdAt ? user.createdAt.toISOString() : null,
        ultimaActualizacion: user.updatedAt
          ? user.updatedAt.toISOString()
          : null,
      },
      preferences: {
        ...DEFAULT_USER_PREFERENCES,
        ...user.preferences,
        notifications: {
          ...DEFAULT_USER_PREFERENCES.notifications,
          ...(user.preferences?.notifications ?? {}),
        },
      },
    };
  }
}
