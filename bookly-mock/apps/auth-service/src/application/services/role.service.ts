import { UserRole } from "@libs/common/enums";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role } from "../../infrastructure/schemas/role.schema";
import { CreateRoleDto } from "../dtos/role/create-role.dto";
import { RoleResponseDto } from "../dtos/role/role-response.dto";
import { UpdateRoleDto } from "../dtos/role/update-role.dto";

/**
 * Service para la lógica de negocio de roles
 * Contiene todas las operaciones y validaciones
 */
@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>
  ) {}

  /**
   * Crear un nuevo rol
   */
  async createRole(
    dto: CreateRoleDto,
    createdBy: string
  ): Promise<RoleResponseDto> {
    // Validar que el rol no exista
    const existingRole = await this.roleModel.findOne({ name: dto.name });
    if (existingRole) {
      throw new ConflictException(
        `El rol '${dto.name}' ya existe en el sistema`
      );
    }

    // Validar que los permisos existan (aquí podríamos hacer una query)
    // Por ahora asumimos que el DTO ya viene validado

    // Crear rol
    const role = await this.roleModel.create({
      name: dto.name,
      displayName: dto.displayName,
      description: dto.description,
      permissions: dto.permissionIds,
      isActive: dto.isActive ?? true,
      isDefault: dto.isDefault ?? false,
      audit: {
        createdBy,
        updatedBy: createdBy,
      },
    });

    return this.toResponseDto(role);
  }

  /**
   * Actualizar un rol existente
   */
  async updateRole(
    roleId: string,
    dto: UpdateRoleDto,
    updatedBy: string
  ): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(roleId);

    if (!role) {
      throw new NotFoundException(`Rol con ID '${roleId}' no encontrado`);
    }

    // No permitir actualizar roles del sistema ciertas propiedades
    if (role.isDefault && dto.displayName) {
      throw new BadRequestException(
        "No se puede cambiar el nombre de un rol del sistema"
      );
    }

    // Actualizar campos
    if (dto.displayName !== undefined) {
      role.displayName = dto.displayName;
    }
    if (dto.description !== undefined) {
      role.description = dto.description;
    }
    if (dto.permissionIds !== undefined) {
      role.permissions = dto.permissionIds;
    }
    if (dto.isActive !== undefined) {
      role.isActive = dto.isActive;
    }

    // Actualizar audit
    if (!role.audit) {
      role.audit = {
        createdBy: "system",
        updatedBy,
      };
    } else {
      role.audit.updatedBy = updatedBy;
    }

    await role.save();

    return this.toResponseDto(role);
  }

  /**
   * Eliminar un rol
   * Solo permite eliminar roles que no sean del sistema
   */
  async deleteRole(roleId: string): Promise<void> {
    const role = await this.roleModel.findById(roleId);

    if (!role) {
      throw new NotFoundException(`Rol con ID '${roleId}' no encontrado`);
    }

    if (role.isDefault) {
      throw new BadRequestException(
        "No se puede eliminar un rol del sistema (isDefault = true)"
      );
    }

    // Verificar que no haya usuarios usando este rol
    // TODO: Implementar validación con UserService
    // const usersCount = await this.userService.countUsersByRole(roleId);
    // if (usersCount > 0) {
    //   throw new BadRequestException(
    //     `No se puede eliminar el rol porque ${usersCount} usuario(s) lo tienen asignado`
    //   );
    // }

    await this.roleModel.findByIdAndDelete(roleId);
  }

  /**
   * Obtener roles con filtros
   */
  async getRoles(filters?: {
    name?: UserRole;
    isActive?: boolean;
    isDefault?: boolean;
    search?: string;
  }): Promise<RoleResponseDto[]> {
    const query: any = {};

    if (filters?.name) {
      query.name = filters.name;
    }
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.isDefault !== undefined) {
      query.isDefault = filters.isDefault;
    }
    if (filters?.search) {
      query.$or = [
        { displayName: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const roles = await this.roleModel.find(query).sort({ name: 1 });

    return roles.map((role) => this.toResponseDto(role));
  }

  /**
   * Obtener rol por ID
   */
  async getRoleById(roleId: string): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(roleId);

    if (!role) {
      throw new NotFoundException(`Rol con ID '${roleId}' no encontrado`);
    }

    return this.toResponseDto(role);
  }

  /**
   * Obtener roles activos
   */
  async getActiveRoles(): Promise<RoleResponseDto[]> {
    return this.getRoles({ isActive: true });
  }

  /**
   * Obtener roles del sistema
   */
  async getSystemRoles(): Promise<RoleResponseDto[]> {
    return this.getRoles({ isDefault: true });
  }

  /**
   * Asignar permisos a un rol
   */
  async assignPermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(roleId);

    if (!role) {
      throw new NotFoundException(`Rol con ID '${roleId}' no encontrado`);
    }

    // Agregar permisos sin duplicados
    const currentPermissions = new Set(role.permissions);
    permissionIds.forEach((id) => currentPermissions.add(id));

    role.permissions = Array.from(currentPermissions);
    await role.save();

    return this.toResponseDto(role);
  }

  /**
   * Remover permisos de un rol
   */
  async removePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(roleId);

    if (!role) {
      throw new NotFoundException(`Rol con ID '${roleId}' no encontrado`);
    }

    // Validar que no se eliminen todos los permisos
    const remainingPermissions = role.permissions.filter(
      (id) => !permissionIds.includes(id)
    );

    if (remainingPermissions.length === 0) {
      throw new BadRequestException(
        "No se puede remover todos los permisos de un rol"
      );
    }

    role.permissions = remainingPermissions;
    await role.save();

    return this.toResponseDto(role);
  }

  /**
   * Obtener roles que tienen asignado un permiso específico
   */
  async getRolesWithPermission(
    permissionId: string
  ): Promise<RoleResponseDto[]> {
    const roles = await this.roleModel.find({
      permissions: permissionId,
      isActive: true,
    });

    return roles.map((role) => this.toResponseDto(role));
  }

  /**
   * Convertir entidad a DTO de respuesta
   */
  private toResponseDto(role: any): RoleResponseDto {
    return new RoleResponseDto({
      id: role._id.toString(),
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
      isDefault: role.isDefault,
      audit: role.audit,
    });
  }
}
