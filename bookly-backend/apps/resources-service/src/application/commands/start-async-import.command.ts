import { ImportResourceMode } from "@libs/common/enums";

/**
 * Comando para iniciar importación asíncrona
 */
export class StartAsyncImportCommand {
  constructor(
    public readonly fileName: string,
    public readonly fileSize: number,
    public readonly csvContent: string,
    public readonly mode: ImportResourceMode = ImportResourceMode.CREATE,
    public readonly skipErrors: boolean = false,
    public readonly notifyOnComplete: boolean = true,
    public readonly userId: string
  ) {}
}
