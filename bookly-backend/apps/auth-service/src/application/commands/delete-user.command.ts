/**
 * Delete User Command
 * Comando para eliminar (desactivar) un usuario del sistema
 */
export class DeleteUserCommand {
  constructor(
    public readonly userId: string,
    public readonly deletedBy: string,
  ) {}
}
