/**
 * Command para remover permisos de un rol
 */
export class RemovePermissionsCommand {
  constructor(
    public readonly roleId: string,
    public readonly permissionIds: string[],
    public readonly updatedBy: string
  ) {}
}
