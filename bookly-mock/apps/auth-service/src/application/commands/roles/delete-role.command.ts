/**
 * Command para eliminar un rol
 * Solo permite eliminar roles que no sean del sistema (isDefault = false)
 */
export class DeleteRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly deletedBy: string = "system"
  ) {}
}
