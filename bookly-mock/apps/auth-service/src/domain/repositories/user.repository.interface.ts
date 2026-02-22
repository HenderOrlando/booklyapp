import { PaginationMeta, PaginationQuery } from "@libs/common";
import { UserEntity } from "../entities/user.entity";

/**
 * User Repository Interface
 * Define los métodos para acceder y persistir usuarios
 */
export interface IUserRepository {
  /**
   * Crear un nuevo usuario
   */
  create(user: UserEntity): Promise<UserEntity>;

  /**
   * Buscar usuario por ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Buscar usuario por email
   */
  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Buscar usuario por SSO provider
   */
  findBySSOProvider(
    provider: string,
    providerId: string,
  ): Promise<UserEntity | null>;

  /**
   * Buscar múltiples usuarios
   */
  findMany(
    query: PaginationQuery,
    filters?: Partial<UserEntity>,
  ): Promise<{ users: UserEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar usuarios por rol
   */
  findByRole(
    role: string,
    query: PaginationQuery,
  ): Promise<{
    users: UserEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Actualizar usuario
   */
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;

  /**
   * Eliminar usuario (soft delete)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Verificar si existe un usuario con el email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Contar usuarios
   */
  count(filters?: Partial<UserEntity>): Promise<number>;

  /**
   * Actualizar último login
   */
  updateLastLogin(id: string): Promise<void>;

  /**
   * Actualizar contraseña
   */
  updatePassword(id: string, hashedPassword: string): Promise<void>;
}
