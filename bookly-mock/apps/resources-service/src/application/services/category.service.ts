import { CategoryType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CategoryEntity } from '@resources/domain/entities/category.entity';
import { ICategoryRepository } from '@resources/domain/repositories/category.repository.interface';

/**
 * Category Service
 * Servicio para gestión de categorías
 */
@Injectable()
export class CategoryService {
  private readonly logger = createLogger("CategoryService");
  private readonly CACHE_TTL = 300; // 5 minutos para categorías
  private readonly CACHE_PREFIX = "category";

  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly redisService?: any // RedisService opcional para no romper tests
  ) {}

  /**
   * Crear una nueva categoría
   */
  async createCategory(data: Partial<CategoryEntity>): Promise<CategoryEntity> {
    // Verificar que no exista una categoría con el mismo código
    if (data.code) {
      const exists = await this.categoryRepository.existsByCode(data.code);
      if (exists) {
        throw new ConflictException(
          `Category with code ${data.code} already exists`
        );
      }
    }

    const category = new CategoryEntity(
      "",
      data.code!,
      data.name!,
      data.description!,
      data.type!,
      data.color,
      data.icon,
      data.parentId,
      data.isActive ?? true,
      data.metadata || {},
      undefined,
      undefined,
      data.audit
    );

    const createdCategory = await this.categoryRepository.create(category);

    this.logger.info("Category created", {
      categoryId: createdCategory.id,
      code: createdCategory.code,
    });

    return createdCategory;
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(id: string): Promise<CategoryEntity> {
    // Intentar obtener desde cache
    if (this.redisService) {
      try {
        const cached = await this.redisService.getCachedWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`
        );
        if (cached) {
          this.logger.debug(`Category ${id} found in cache`);
          return cached;
        }
      } catch (error) {
        this.logger.warn("Cache read error, fetching from DB", error as Error);
      }
    }

    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Cachear el resultado
    if (this.redisService) {
      try {
        await this.redisService.cacheWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`,
          category,
          this.CACHE_TTL
        );
      } catch (error) {
        this.logger.warn("Cache write error", error as Error);
      }
    }

    return category;
  }

  /**
   * Obtener categoría por código
   */
  async getCategoryByCode(code: string): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findByCode(code);
    if (!category) {
      throw new NotFoundException(`Category with code ${code} not found`);
    }
    return category;
  }

  /**
   * Obtener lista de categorías con paginación
   */
  async getCategories(query: PaginationQuery): Promise<{
    categories: CategoryEntity[];
    meta: PaginationMeta;
  }> {
    return await this.categoryRepository.findMany(query);
  }

  /**
   * Obtener categorías por tipo
   */
  async getCategoriesByType(type: CategoryType): Promise<CategoryEntity[]> {
    return await this.categoryRepository.findByType(type);
  }

  /**
   * Obtener categorías activas
   */
  async getActiveCategories(): Promise<CategoryEntity[]> {
    return await this.categoryRepository.findActive();
  }

  /**
   * Obtener categorías raíz
   */
  async getRootCategories(): Promise<CategoryEntity[]> {
    return await this.categoryRepository.findRootCategories();
  }

  /**
   * Obtener categorías hijas de una categoría padre
   */
  async getCategoriesByParent(parentId: string): Promise<CategoryEntity[]> {
    return await this.categoryRepository.findByParent(parentId);
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(
    id: string,
    data: Partial<CategoryEntity>
  ): Promise<CategoryEntity> {
    // Verificar que la categoría existe
    const category = await this.getCategoryById(id);

    // Invalidar cache
    if (this.redisService) {
      try {
        await this.redisService.deleteCachedWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`
        );
      } catch (error) {
        this.logger.warn("Cache invalidation error", error as Error);
      }
    }

    // Si se está actualizando el código, verificar que no exista otra categoría con ese código
    if (data.code && data.code !== category.code) {
      const exists = await this.categoryRepository.existsByCode(data.code);
      if (exists) {
        throw new ConflictException(
          `Category with code ${data.code} already exists`
        );
      }
    }

    const updatedCategory = await this.categoryRepository.update(id, data);

    this.logger.info("Category updated", { categoryId: id });

    return updatedCategory;
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(id: string): Promise<boolean> {
    // Verificar que la categoría existe
    await this.getCategoryById(id);

    // Verificar que no tenga categorías hijas
    const children = await this.getCategoriesByParent(id);
    if (children.length > 0) {
      throw new ConflictException(
        `Cannot delete category with child categories`
      );
    }

    const deleted = await this.categoryRepository.delete(id);

    if (deleted) {
      this.logger.info("Category deleted", { categoryId: id });
    }

    return deleted;
  }

  /**
   * Activar categoría
   */
  async activateCategory(id: string): Promise<CategoryEntity> {
    const category = await this.getCategoryById(id);
    category.activate();
    return await this.categoryRepository.update(id, { isActive: true });
  }

  /**
   * Desactivar categoría
   */
  async deactivateCategory(id: string): Promise<CategoryEntity> {
    const category = await this.getCategoryById(id);
    category.deactivate();
    return await this.categoryRepository.update(id, { isActive: false });
  }

  /**
   * Contar categorías
   */
  async countCategories(): Promise<number> {
    return await this.categoryRepository.count();
  }
}
