import { ImportResourceMode } from "@libs/common/enums";

/**
 * Comando para importar recursos masivamente desde CSV
 */
export class ImportResourcesCommand {
  constructor(
    public readonly csvContent: string,
    public readonly mode: ImportResourceMode = ImportResourceMode.CREATE,
    public readonly skipErrors: boolean = false,
    public readonly userId: string
  ) {}
}
