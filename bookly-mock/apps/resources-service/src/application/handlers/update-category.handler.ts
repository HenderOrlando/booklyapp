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
    const updateData: Partial<CategoryEntity> = {
      audit: {
        createdBy: command.updatedBy,
        updatedBy: command.updatedBy,
      },
    };

    if (command.name !== undefined) updateData.name = command.name;
    if (command.description !== undefined)
      updateData.description = command.description;
    if (command.type !== undefined) updateData.type = command.type;
    if (command.color !== undefined) updateData.color = command.color;
    if (command.icon !== undefined) updateData.icon = command.icon;
    if (command.isActive !== undefined) updateData.isActive = command.isActive;
    if (command.metadata !== undefined) updateData.metadata = command.metadata;

    return await this.categoryService.updateCategory(command.id, updateData);
  }
}
