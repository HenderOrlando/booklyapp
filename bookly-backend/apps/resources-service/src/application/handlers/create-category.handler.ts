import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CategoryEntity } from '@resources/domain/entities/category.entity';
import { CreateCategoryCommand } from "../commands/create-category.command";
import { CategoryService } from "../services/category.service";

/**
 * Create Category Command Handler
 * Handler para crear una nueva categoría
 */
@CommandHandler(CreateCategoryCommand)
export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand>
{
  constructor(private readonly categoryService: CategoryService) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryEntity> {
    return await this.categoryService.createCategory({
      code: command.code,
      name: command.name,
      description: command.description,
      type: command.type,
      color: command.color,
      icon: command.icon,
      parentId: command.parentId,
      metadata: command.metadata,
      audit: command.createdBy
        ? {
            createdBy: command.createdBy,
          }
        : undefined,
    });
  }
}
