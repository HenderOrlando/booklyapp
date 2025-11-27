/**
 * Comando para revertir una importación
 */
export class RollbackImportCommand {
  constructor(
    public readonly jobId: string,
    public readonly reason: string | undefined,
    public readonly userId: string
  ) {}
}
