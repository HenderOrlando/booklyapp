import { PaginationMeta } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CategoryEntity } from '@resources/domain/entities/category.entity";
import { GetCategoriesQuery } from "../queries/get-categories.query";
import { CategoryService } from "../services/category.service";

export interface GetCategoriesResponse {
  categories: CategoryEntity[];
  meta: PaginationMeta;
}

/**
 * Get Categories Query Handler
 * Handler para obtener lista paginada de categorías
 */
@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(private readonly categoryService: CategoryService) {}

  async execute(query: GetCategoriesQuery): Promise<GetCategoriesResponse> {
    return await this.categoryService.getCategories(query.pagination);
  }
}
