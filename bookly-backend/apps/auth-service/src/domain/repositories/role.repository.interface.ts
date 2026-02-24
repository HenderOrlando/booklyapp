import { PaginationMeta, PaginationQuery } from "@libs/common";
import { RoleEntity } from "../entities/role.entity";

/**
 * Role Repository Interface
 * Define los métodos para acceder y persistir roles
 */
export interface IRoleRepository {
  /**
   * Crear un nuevo rol
   */
  create(role: RoleEntity): Promise<RoleEntity>;

  /**
   * Buscar rol por ID
   */
  findById(id: string): Promise<RoleEntity | null>;

  /**
   * Buscar rol por nombre
   */
  findByName(name: string): Promise<RoleEntity | null>;

  /**
   * Buscar múltiples roles
   */
  findMany(query: PaginationQuery): Promise<{
    roles: RoleEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar roles activos
   */
  findActive(): Promise<RoleEntity[]>;

  /**
   * Buscar roles por defecto
   */
  findDefaults(): Promise<RoleEntity[]>;

  /**
   * Actualizar rol
   */
  update(id: string, data: Partial<RoleEntity>): Promise<RoleEntity>;

  /**
   * Eliminar rol (solo si no es por defecto)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Verificar si existe un rol con el nombre
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Contar roles
   */
  count(): Promise<number>;
}
