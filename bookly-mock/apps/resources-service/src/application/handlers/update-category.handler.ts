import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CategoryEntity } from "@resources/domain/entities/category.entity";
import { UpdateCategoryCommand } from "../commands/update-category.command";
import { CategoryService } from "../services/category.service";

/**
 * Update Category Command Handler
 * Handler para actualizar una categoría existente
 */
@CommandHandler(UpdateCategoryCommand)
export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryCommand>
{
  constructor(private readonly categoryService: CategoryService) {}

  async execute(command: UpdateCategoryCommand): Promise<CategoryEntity> {
    return await this.categoryService.updateCategory(command.id, {
      name: command.name,
      description: command.description,
      type: command.type,
      color: command.color,
      icon: command.icon,
      isActive: command.isActive,
      metadata: command.metadata,
      audit: {
        createdBy: command.updatedBy, // Para actualizaciones, el usuario que actualiza es también el "creator" del cambio
        updatedBy: command.updatedBy,
      },
    });
  }
}
