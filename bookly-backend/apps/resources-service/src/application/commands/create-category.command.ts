import { CategoryType } from "@libs/common/enums";

/**
 * Create Category Command
 * Command para crear una nueva categoría
 */
export class CreateCategoryCommand {
  constructor(
    public readonly code: string | undefined,
    public readonly name: string,
    public readonly description: string,
    public readonly type: CategoryType | undefined,
    public readonly color?: string,
    public readonly icon?: string,
    public readonly parentId?: string,
    public readonly metadata?: Record<string, any>,
    public readonly createdBy?: string,
  ) {}
}
