/**
 * Delete Resource Command
 * Command para eliminar un recurso
 */
export class DeleteResourceCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string
  ) {}
}
