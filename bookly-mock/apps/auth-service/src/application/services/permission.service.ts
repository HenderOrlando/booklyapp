import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Permission } from "../../infrastructure/schemas/permission.schema";
import { Role } from "../../infrastructure/schemas/role.schema";
import { User } from "../../infrastructure/schemas/user.schema";
import { CreatePermissionDto } from "../dtos/permission/create-permission.dto";
import { PermissionResponseDto } from "../dtos/permission/permission-response.dto";
import { UpdatePermissionDto } from "../dtos/permission/update-permission.dto";
import { RoleService } from "./role.service";

/**
 * Service para gestión de permisos
 * Contiene toda la lógica de negocio
 */
@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    private readonly roleService: RoleService
  ) {}

  /**
   * Crear un nuevo permiso
   */
  async createPermission(
    dto: CreatePermissionDto,
    createdBy: string
  ): Promise<PermissionResponseDto> {
    // Validar que el código sea único
    const exists = await this.permissionModel.findOne({ code: dto.code });
    if (exists) {
      throw new ConflictException(
        `Ya existe un permiso con el código: ${dto.code}`
      );
    }

    // Validar formato code (resource:action)
    if (!dto.code.includes(":")) {
      throw new ConflictException(
        `El código debe tener formato 'resource:action', recibido: ${dto.code}`
      );
    }

    // Crear permiso
    const permission = await this.permissionModel.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      resource: dto.resource,
      action: dto.action,
      isActive: dto.isActive ?? true,
      audit: {
        createdBy,
        updatedBy: createdBy,
      },
    });

    return this.toResponseDto(permission);
  }

  /**
   * Actualizar un permiso existente
   */
  async updatePermission(
    permissionId: string,
    dto: UpdatePermissionDto,
    updatedBy: string
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionModel.findById(permissionId);

    if (!permission) {
      throw new NotFoundException(
        `Permiso con ID ${permissionId} no encontrado`
      );
    }

    // Actualizar campos permitidos (code NO se puede cambiar)
    if (dto.name !== undefined) {
      permission.name = dto.name;
    }
    if (dto.description !== undefined) {
      permission.description = dto.description;
    }
    if (dto.isActive !== undefined) {
      permission.isActive = dto.isActive;
    }

    // Actualizar audit info
    if (!permission.audit) {
      permission.audit = {
        createdBy: "system",
        updatedBy,
      };
    } else {
      permission.audit.updatedBy = updatedBy;
    }

    await permission.save();

    return this.toResponseDto(permission);
  }

  /**
   * Eliminar un permiso
   * Solo permite eliminar si no está asignado a roles
   */
  async deletePermission(permissionId: string): Promise<void> {
    const permission = await this.permissionModel.findById(permissionId);

    if (!permission) {
      throw new NotFoundException(
        `Permiso con ID ${permissionId} no encontrado`
      );
    }

    // Validar que no esté asignado a roles
    const roles = await this.roleService.getRolesWithPermission(permissionId);
    if (roles.length > 0) {
      const roleNames = roles.map((r) => r.displayName || r.name).join(", ");
      throw new ConflictException(
        `No se puede eliminar el permiso "${permission.name}" porque está asignado a ${roles.length} rol(es): ${roleNames}`
      );
    }

    await this.permissionModel.findByIdAndDelete(permissionId);
  }

  /**
   * Obtener permisos con filtros opcionales
   */
  async getPermissions(filters?: {
    resource?: string;
    action?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<PermissionResponseDto[]> {
    const query: any = {};

    if (filters?.resource) {
      query.resource = filters.resource;
    }

    if (filters?.action) {
      query.action = filters.action;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { code: { $regex: filters.search, $options: "i" } },
      ];
    }

    const permissions = await this.permissionModel
      .find(query)
      .sort({ resource: 1, action: 1 });

    return permissions.map((p) => this.toResponseDto(p));
  }

  /**
   * Obtener un permiso por ID
   */
  async getPermissionById(
    permissionId: string
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionModel.findById(permissionId);

    if (!permission) {
      throw new NotFoundException(
        `Permiso con ID ${permissionId} no encontrado`
      );
    }

    return this.toResponseDto(permission);
  }

  /**
   * Obtener permisos por módulo/recurso
   */
  async getPermissionsByModule(
    resource: string
  ): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionModel
      .find({ resource })
      .sort({ action: 1 });

    return permissions.map((p) => this.toResponseDto(p));
  }

  /**
   * Obtener solo permisos activos
   */
  async getActivePermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionModel
      .find({ isActive: true })
      .sort({ resource: 1, action: 1 });

    return permissions.map((p) => this.toResponseDto(p));
  }

  /**
   * Validar si un código de permiso existe
   */
  async permissionCodeExists(code: string): Promise<boolean> {
    const count = await this.permissionModel.countDocuments({ code });
    return count > 0;
  }

  /**
   * Obtener permisos por códigos
   */
  async getPermissionsByCodes(
    codes: string[]
  ): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionModel.find({
      code: { $in: codes },
    });

    return permissions.map((p) => this.toResponseDto(p));
  }

  /**
   * Obtener todos los permisos de un usuario
   * Combina permisos de roles + permisos directos
   *
   * @param userId - ID del usuario
   * @returns Array de códigos de permisos en formato "resource:action"
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    // Obtener usuario
    const user = await this.userModel.findById(userId);

    if (!user) {
      return [];
    }

    const permissionsSet = new Set<string>();

    // Agregar permisos directos del usuario
    if (user.permissions && user.permissions.length > 0) {
      user.permissions.forEach((perm) => permissionsSet.add(perm));
    }

    // Obtener permisos de cada rol del usuario
    if (user.roles && user.roles.length > 0) {
      const roles = await this.roleModel.find({
        name: { $in: user.roles },
        isActive: true,
      });

      for (const role of roles) {
        if (role.permissions && role.permissions.length > 0) {
          role.permissions.forEach((perm) => permissionsSet.add(perm));
        }
      }
    }

    return Array.from(permissionsSet);
  }

  /**
   * Transformar entidad a DTO de respuesta
   */
  private toResponseDto(permission: any): PermissionResponseDto {
    return new PermissionResponseDto({
      id: permission._id?.toString() || permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      isActive: permission.isActive,
      audit: permission.audit,
    });
  }
}
