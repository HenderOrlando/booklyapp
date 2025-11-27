import { ImportResourceMode } from "@libs/common/enums";

/**
 * Comando para validar CSV sin importar (dry-run)
 */
export class ValidateImportCommand {
  constructor(
    public readonly csvContent: string,
    public readonly mode: ImportResourceMode = ImportResourceMode.CREATE,
    public readonly userId: string
  ) {}
}
