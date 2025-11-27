/**
 * Restore Resource Command
 * Command para restaurar un recurso eliminado
 */
export class RestoreResourceCommand {
  constructor(
    public readonly id: string,
    public readonly restoredBy?: string
  ) {}
}
