import { UserEntity } from "@auth/domain/entities/user.entity";
import { IUserRepository } from "@auth/domain/repositories/user.repository.interface";
import { createLogger, PaginationMeta, PaginationQuery } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";

/**
 * User Service
 * Servicio para gestión de usuarios
 */
@Injectable()
export class UserService {
  private readonly logger = createLogger("UserService");

  constructor(
    @Inject("IUserRepository")
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * Obtener usuario por ID
   */
  async getUserById(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn("User not found", { userId });
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  /**
   * Alias para getUserById (para compatibilidad con JWT Strategy)
   */
  async findById(userId: string): Promise<UserEntity> {
    return this.getUserById(userId);
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Obtener lista de usuarios con paginación
   */
  async getUsers(
    query: PaginationQuery,
    filters?: Partial<UserEntity>,
  ): Promise<{ users: UserEntity[]; meta: PaginationMeta }> {
    return await this.userRepository.findMany(query, filters);
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(
    role: string,
    query: PaginationQuery,
  ): Promise<{ users: UserEntity[]; meta: PaginationMeta }> {
    return await this.userRepository.findByRole(role, query);
  }

  /**
   * Actualizar usuario
   */
  async updateUser(
    userId: string,
    data: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);

    // Actualizar usuario
    const updatedUser = await this.userRepository.update(userId, data);

    this.logger.info("User updated successfully", { userId });

    return updatedUser;
  }

  /**
   * Actualizar perfil propio del usuario autenticado
   */
  async updateMyProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      documentType?: string;
      documentNumber?: string;
    },
  ): Promise<UserEntity> {
    const user = await this.getUserById(userId);

    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName;
    }
    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
    }
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
      // Si cambia el teléfono, requiere reverificación.
      updateData.isPhoneVerified = false;
    }
    if (data.documentType !== undefined) {
      updateData.documentType = data.documentType;
    }
    if (data.documentNumber !== undefined) {
      updateData.documentNumber = data.documentNumber;
    }

    if (Object.keys(updateData).length === 0) {
      return user;
    }

    updateData["audit.updatedBy"] = userId;

    const updatedUser = await this.userRepository.update(
      userId,
      updateData as Partial<UserEntity>,
    );

    this.logger.info("User profile updated successfully", { userId });

    return updatedUser;
  }

  /**
   * Desactivar usuario
   */
  async deactivateUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    user.deactivate();

    await this.userRepository.update(userId, { isActive: false });

    this.logger.info("User deactivated successfully", { userId });
  }

  /**
   * Activar usuario
   */
  async activateUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    user.activate();

    await this.userRepository.update(userId, { isActive: true });

    this.logger.info("User activated successfully", { userId });
  }

  /**
   * Agregar rol a usuario
   */
  async addRoleToUser(userId: string, role: string): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    user.addRole(role);

    const updatedUser = await this.userRepository.update(userId, {
      roles: user.roles,
    });

    this.logger.info("Role added to user", { userId, role });

    return updatedUser;
  }

  /**
   * Remover rol de usuario
   */
  async removeRoleFromUser(userId: string, role: string): Promise<UserEntity> {
    const user = await this.getUserById(userId);
    user.removeRole(role);

    const updatedUser = await this.userRepository.update(userId, {
      roles: user.roles,
    });

    this.logger.info("Role removed from user", { userId, role });

    return updatedUser;
  }
}
