import { CategoryType } from "@libs/common/enums";

/**
 * Update Category Command
 * Comando para actualizar una categoría existente
 */
export class UpdateCategoryCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly type?: CategoryType,
    public readonly color?: string,
    public readonly icon?: string,
    public readonly isActive?: boolean,
    public readonly metadata?: Record<string, any>,
  ) {}
}
