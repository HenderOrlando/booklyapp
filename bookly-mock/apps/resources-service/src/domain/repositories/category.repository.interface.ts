import { CategoryType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { CategoryEntity } from "../entities/category.entity";

/**
 * Category Repository Interface
 * Define los métodos para acceder y persistir categorías
 */
export interface ICategoryRepository {
  /**
   * Crear una nueva categoría
   */
  create(category: CategoryEntity): Promise<CategoryEntity>;

  /**
   * Buscar categoría por ID
   */
  findById(id: string): Promise<CategoryEntity | null>;

  /**
   * Buscar categoría por código
   */
  findByCode(code: string): Promise<CategoryEntity | null>;

  /**
   * Buscar múltiples categorías
   */
  findMany(query: PaginationQuery): Promise<{
    categories: CategoryEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar categorías por tipo
   */
  findByType(type: CategoryType): Promise<CategoryEntity[]>;

  /**
   * Buscar categorías activas
   */
  findActive(): Promise<CategoryEntity[]>;

  /**
   * Buscar categorías raíz (sin padre)
   */
  findRootCategories(): Promise<CategoryEntity[]>;

  /**
   * Buscar categorías hijas de una categoría padre
   */
  findByParent(parentId: string): Promise<CategoryEntity[]>;

  /**
   * Actualizar categoría
   */
  update(id: string, data: Partial<CategoryEntity>): Promise<CategoryEntity>;

  /**
   * Eliminar categoría
   */
  delete(id: string): Promise<boolean>;

  /**
   * Verificar si existe una categoría con el código
   */
  existsByCode(code: string): Promise<boolean>;

  /**
   * Contar categorías
   */
  count(): Promise<number>;
}
